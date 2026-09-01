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
};

// Constants
const STRIPE_CONFIG = {
  currency: "eur",
  locale: "fr" as const,
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
  return items.map((item) => ({
    price_data: {
      currency: STRIPE_CONFIG.currency,
      unit_amount: Math.round(
        item.product.price! * STRIPE_CONFIG.centsToDollarMultiplier
      ),
      product_data: {
        name: item.product.name || "Unnamed Product",
        description: `Product ID: ${item.product._id}`,
        metadata: {
          sanityProductId: item.product._id, // Use the Sanity product ID
        },
        images: item.product.image
          ? [imageUrl(item.product.image) || ""]
          : undefined,
      },
    },
    quantity: item.quantity,
  }));
}

export async function createCheckoutSession(
  items: GroupedBasketItem[],
  metadata: Metadata
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
      locale: STRIPE_CONFIG.locale,
      line_items: createLineItems(items),
    });

    return session.url;
  } catch (error) {
    console.error("Erreur lors de la création de session:", error);
    throw error;
  }
}
