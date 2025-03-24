import { Metadata } from "../../../../actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    console.log("HIT WEBHOOK");

    if (!sig) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Stripe webhook secret is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json(
        { error: `Invalid payload: ${error instanceof Error ? error.message : String(error)}` },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Validate required fields
      if (!session.metadata || !session.customer) {
        console.error("Missing required metadata or customer");
        return NextResponse.json(
          { error: "Invalid checkout session" },
          { status: 400 }
        );
      }

      try {
        const order = await createOrderInSanity(session);
        console.log("Order created in Sanity:", order);
        return NextResponse.json({ message: "Order processed successfully" });
      } catch (error) {
        console.error("Error creating order in Sanity:", error);
        if (error instanceof Error) {
          return NextResponse.json(
            { error: error.message },
            { status: 500 }
          );
        } else {
          return NextResponse.json(
            { error: String(error) },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ message: "Unhandled event type" }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: String(error) },
        { status: 500 }
      );
    }
  }
}

async function createOrderInSanity(session: Stripe.Checkout.Session) {
  const {
    id,
    amount_total,
    currency,
    metadata,
    payment_intent,
    customer,
    total_details,
  } = session;

  const { orderNumber, customerName, customerEmail, clerkUserId } =
    metadata as unknown as Metadata;

  console.log("Metadata:", JSON.stringify(metadata));
  console.log("Customer ID:", customer);
  console.log("Payment Intent ID:", payment_intent);

  try {
    const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(
      id,
      { expand: ["data.price.product"] }
    );

    console.log("Line Items:", JSON.stringify(lineItemsWithProduct.data));

    const sanityProducts = lineItemsWithProduct.data.map((item) => ({
      _key: crypto.randomUUID(),
      product: {
        _type: "reference",
        _ref: (item.price?.product as Stripe.Product)?.metadata?.id,
      },
      quantity: item.quantity || 0,
    }));

    console.log("Sanity Products:", JSON.stringify(sanityProducts));

    const order = await backendClient.create({
      _type: "order",
      orderNumber,
      stripeCheckoutSessionId: id,
      stripePaymentIntentId: payment_intent,
      customerName,
      stripeCustomerId: customer,
      clerkUserId: clerkUserId,
      email: customerEmail,
      currency,
      amountDiscount: total_details?.amount_discount
        ? total_details.amount_discount / 100
        : 0,
      products: sanityProducts,
      totalPrice: amount_total ? amount_total / 100 : 0,
      status: "paid",
      orderDate: new Date().toISOString(),
    });

    console.log("Order created successfully:", JSON.stringify(order));
    return order;
  } catch (error) {
    console.error("Failed to create order in Sanity:", error);
    throw error;
  }
}