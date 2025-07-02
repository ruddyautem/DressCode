// src/app/(store)/webhook/route.ts

import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Metadata } from "../../../../actions/createCheckoutSession";
import { client } from "@/sanity/lib/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = (await headers()).get("stripe-signature");

    console.log("🔥 WEBHOOK HIT");

    if (!sig) {
      console.error("❌ No signature provided");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("❌ Stripe webhook secret is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      console.log("✅ Webhook signature verified");
      console.log("📨 Event type:", event.type);
    } catch (error) {
      console.error("❌ Webhook signature verification failed:", error);
      return NextResponse.json(
        {
          error: `Invalid payload: ${error instanceof Error ? error.message : String(error)}`,
        },
        { status: 400 }
      );
    }

    // Handle checkout completion
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("💳 Processing checkout session:", session.id);

      if (!session.metadata) {
        console.error("❌ Missing required metadata");
        return NextResponse.json(
          { error: "Invalid checkout session - no metadata" },
          { status: 400 }
        );
      }

      try {
        const order = await createOrderInSanity(session);
        console.log("✅ Order created in Sanity:", order._id);
        return NextResponse.json({ message: "Order processed successfully" });
      } catch (error) {
        console.error("❌ Error creating order in Sanity:", error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : String(error) },
          { status: 500 }
        );
      }
    }

    console.log("ℹ️ Unhandled event type:", event.type);
    return NextResponse.json(
      { message: "Unhandled event type" },
      { status: 200 }
    );
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

async function createOrderInSanity(session: Stripe.Checkout.Session) {
  console.log("🔧 Starting createOrderInSanity function");

  const {
    id,
    amount_total,
    currency,
    metadata,
    payment_intent,
    customer,
    total_details,
    payment_status,
  } = session;

  const { orderNumber, customerName, customerEmail, clerkUserId } =
    metadata as unknown as Metadata;

  console.log("📊 Order details:");
  console.log("- Order Number:", orderNumber);
  console.log("- Customer:", customerName);
  console.log("- Email:", customerEmail);
  console.log("- Clerk User ID:", clerkUserId);
  console.log("- Payment Status:", payment_status);

  try {
    // Get line items with product details
    const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(
      id,
      {
        expand: ["data.price.product"],
      }
    );

    console.log("🛍️ Line items found:", lineItemsWithProduct.data.length);

    // Transform to Sanity format
    const sanityProducts = lineItemsWithProduct.data.map((item) => {
      const sanityProductId = (item.price?.product as Stripe.Product)?.metadata?.sanityProductId;
      console.log("📦 Sanity Product ID:", sanityProductId, "Quantity:", item.quantity);

      return {
        _key: Math.random().toString(36).substr(2, 9),
        product: {
          _type: "reference",
          _ref: sanityProductId,
        },
        quantity: item.quantity || 0,
      };
    });

    // Determine order status based on payment status
    let orderStatus = "pending"; // Default to "À payer"
    if (payment_status === "paid") {
      orderStatus = "paid"; // "Payé"
    } else if (payment_status === "unpaid") {
      orderStatus = "pending"; // "À payer"
    }

    // Create order in Sanity
    const orderData = {
      _type: "order",
      orderNumber,
      stripeCheckoutSessionId: id,
      stripePaymentIntentId: payment_intent,
      customerName,
      email: customerEmail,
      stripeCustomerId: customer,
      clerkUserId,
      currency,
      amountDiscount: total_details?.amount_discount
        ? total_details.amount_discount / 100
        : 0,
      products: sanityProducts,
      totalPrice: amount_total ? amount_total / 100 : 0,
      status: orderStatus,
      orderDate: new Date().toISOString(),
    };

    console.log("💾 Creating order in Sanity with data:");
    console.log(JSON.stringify(orderData, null, 2));

    const order = await client.create(orderData);

    console.log("✅ Order created successfully in Sanity:", order._id);
    return order;
  } catch (error) {
    console.error("💥 Failed to create order in Sanity:", error);
    throw error;
  }
}