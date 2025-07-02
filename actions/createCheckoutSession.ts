"use server";

import { imageUrl } from "@/lib/imageUrl";
import { BasketItem } from "@/app/(store)/store";
import stripe from "@/lib/stripe";

export type Metadata = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId: string;
};

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

// Helper functions
function validateItemPrices(items: GroupedBasketItem[]): void {
  const itemsWithoutPrice = items.filter((item) => !item.product.price);
  if (itemsWithoutPrice.length > 0) {
    throw new Error("Certains articles n'ont pas de prix!");
  }
}

async function findOrCreateCustomer(email: string): Promise<string | undefined> {
  const customers = await stripe.customers.list({
    email,
    limit: STRIPE_CONFIG.customerSearchLimit,
  });

  return customers.data.length > 0 ? customers.data[0].id : undefined;
}

function getBaseURL(): string {
  return process.env.NODE_ENV === "production"
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL!;
}

// In createCheckoutSession.ts, update the createLineItems function:

function createLineItems(items: GroupedBasketItem[]) {
  return items.map((item) => ({
    price_data: {
      currency: STRIPE_CONFIG.currency,
      unit_amount: Math.round(item.product.price! * STRIPE_CONFIG.centsToDollarMultiplier),
      product_data: {
        name: item.product.name || "Unnamed Product",
        description: `Product ID: ${item.product._id}`,
        metadata: { 
          sanityProductId: item.product._id  // Use the Sanity product ID
        },
        images: item.product.image 
          ? [imageUrl(item.product.image).url()] 
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
    // Validate inputs
    validateItemPrices(items);

    // Find or prepare customer
    const customerId = await findOrCreateCustomer(metadata.customerEmail);

    // Prepare URLs
    const baseURL = getBaseURL();
    const successUrl = `${baseURL}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`;
    const cancelUrl = `${baseURL}/basket`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_creation: customerId ? undefined : "always",
      customer_email: customerId ? undefined : metadata.customerEmail,
      metadata,
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