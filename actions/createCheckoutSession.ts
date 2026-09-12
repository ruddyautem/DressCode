"use server";

import { imageUrl } from "@/lib/imageUrl";
import { BasketItem } from "@/app/(store)/store";
import stripe from "@/lib/stripe";

import { z } from "zod";
import { env } from "@/lib/env";

const MetadataSchema = z.object({
  orderNumber: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  clerkUserId: z.string().min(1),
});

export type Metadata = z.infer<typeof MetadataSchema>;

export type GroupedBasketItem = {
  product: BasketItem["product"];
  quantity: number;
  size?: string;
};

// Constants
const STRIPE_CONFIG = {
  currency: "eur",
  customerSearchLimit: 1,
  centsToDollarMultiplier: 100,
} as const;

// Zod Schema to validate basket items at runtime
const BasketItemsValidationSchema = z.array(
  z.object({
    product: z.object({
      price: z.number().positive("Certains articles n'ont pas de prix ou le prix est invalide!"),
    }).passthrough()
  }).passthrough()
);

// Helper functions
function validateItemPrices(items: GroupedBasketItem[]): void {
  // Zod takes care of validating that every item has a valid, positive price
  // It replaces manual checking like: items.filter(item => !item.product.price)
  BasketItemsValidationSchema.parse(items);
}

async function findOrCreateCustomer(
  email: string
): Promise<string | undefined> {
  const customers = await stripe.customers.list({
    email,
    limit: STRIPE_CONFIG.customerSearchLimit,
  });
  return customers.data.length > 0 ? customers.data[0].id : undefined;
}

function getBaseURL(): string {
  // Use Zod validated environment variable!
  return env.NEXT_PUBLIC_BASE_URL;
}

// In createCheckoutSession.ts, update the createLineItems function:
function createLineItems(items: GroupedBasketItem[]) {
  return items.map((item) => {
    const sizeSuffix = item.size ? ` (Taille: ${item.size})` : "";
    return {
      price_data: {
        currency: STRIPE_CONFIG.currency,
        unit_amount: Math.round(
          item.product.price! * STRIPE_CONFIG.centsToDollarMultiplier
        ),
        product_data: {
          name: `${item.product.name || "Unnamed Product"}${sizeSuffix}`,
          description: `Product ID: ${item.product._id}${item.size ? ` | Taille: ${item.size}` : ""}`,
          metadata: {
            sanityProductId: item.product._id, // Use the Sanity product ID
            size: item.size || "Taille Unique",
          },
          images: item.product.image
            ? [imageUrl(item.product.image) || ""]
            : undefined,
        },
      },
      quantity: item.quantity,
    };
  });
}

export async function createCheckoutSession(
  items: GroupedBasketItem[],
  metadata: Metadata,
  locale?: string
): Promise<string | null> {
  try {
    // 1. Zod runtime validation of items
    validateItemPrices(items);

    // 2. Zod runtime validation of metadata
    const validatedMetadata = MetadataSchema.parse(metadata);

    // Find or prepare customer
    const customerId = await findOrCreateCustomer(validatedMetadata.customerEmail);

    // Prepare URLs
    const baseURL = getBaseURL();
    const successUrl = `${baseURL}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${validatedMetadata.orderNumber}`;
    const cancelUrl = `${baseURL}/basket`;

    // Stripe checkout locale: French by default, or English if explicitly selected
    const stripeLocale = locale === "en" ? "en" : "fr";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_creation: customerId ? undefined : "always",
      customer_email: customerId ? undefined : validatedMetadata.customerEmail,
      metadata: validatedMetadata,
      mode: "payment",
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: stripeLocale,
      line_items: createLineItems(items),
    });

    return session.url;
  } catch (error) {
    console.error("Erreur lors de la création de session:", error);
    throw error;
  }
}

export async function syncOrderFromSession(sessionId: string) {
  if (!sessionId) {
    return { success: false, error: "No session ID provided" };
  }

  try {
    const { client } = await import("@/sanity/lib/client");

    // 1. Récupérer la session directement depuis Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price.product"],
    });

    if (session.payment_status !== "paid") {
      return { success: false, error: "Payment not completed" };
    }

    const {
      id,
      amount_total,
      currency,
      metadata,
      payment_intent,
      customer,
      total_details,
    } = session;

    if (!metadata) {
      return { success: false, error: "No metadata found on session" };
    }

    const { orderNumber, customerName, customerEmail, clerkUserId } =
      metadata as unknown as Metadata;

    // 2. Vérifier si la commande existe déjà dans Sanity (évite les doublons)
    const existingOrder = await client.fetch(
      `*[_type == "order" && (stripeCheckoutSessionId == $sessionId || orderNumber == $orderNumber)][0]`,
      { sessionId: id, orderNumber }
    );

    if (existingOrder) {
      return { success: true, orderId: existingOrder._id, alreadyExists: true };
    }

    // 3. Récupérer les articles avec détails du produit
    const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(
      id,
      {
        expand: ["data.price.product"],
      }
    );

    const sanityProducts = lineItemsWithProduct.data.map((item) => {
      const sanityProductId = (item.price?.product as any)?.metadata
        ?.sanityProductId;

      return {
        _key: Math.random().toString(36).substring(2, 11),
        product: {
          _type: "reference",
          _ref: sanityProductId,
        },
        quantity: item.quantity || 1,
      };
    });

    // 4. Créer la commande dans Sanity
    const orderData = {
      _type: "order",
      orderNumber,
      stripeCheckoutSessionId: id,
      stripePaymentIntentId:
        typeof payment_intent === "string" ? payment_intent : (payment_intent as any)?.id,
      customerName: customerName || "Client",
      email: customerEmail,
      stripeCustomerId: typeof customer === "string" ? customer : (customer as any)?.id,
      clerkUserId,
      currency: currency || "eur",
      amountDiscount: total_details?.amount_discount
        ? total_details.amount_discount / 100
        : 0,
      products: sanityProducts,
      totalPrice: amount_total ? amount_total / 100 : 0,
      status: "paid",
      orderDate: new Date().toISOString(),
    };

    const newOrder = await client.create(orderData);
    console.log("✅ Order created via syncOrderFromSession:", newOrder._id);

    return { success: true, orderId: newOrder._id, alreadyExists: false };
  } catch (error) {
    console.error("❌ Error in syncOrderFromSession:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
