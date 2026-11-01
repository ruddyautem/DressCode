import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set!");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Keep the existing API version until the integration is upgraded separately.
  // @ts-expect-error stripe-version-2026-09-30.endive
  apiVersion: "2026-09-30.endive",
});

export default stripe;
