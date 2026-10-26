import "server-only";
import stripe from "./stripe";
import { client } from "@/sanity/lib/client";
import type Stripe from "stripe";
import { orderDocumentId } from "./checkout-policy";

export async function persistPaidOrder(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" || session.status !== "complete") throw new Error("Paiement non confirmé");
  const metadata = session.metadata;
  if (!metadata?.clerkUserId || !metadata.orderNumber) throw new Error("Commande sans propriétaire");
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100, expand: ["data.price.product"] }).autoPagingToArray({ limit: 1000 });
  const products = lineItems.map(item => {
    const p = item.price?.product as Stripe.Product;
    if (!p?.metadata?.sanityProductId || !item.quantity) throw new Error("Ligne de commande invalide");
    const size = p.metadata.size || "", suffix = size ? ` (Taille: ${size})` : "";
    const name = suffix && p.name.endsWith(suffix) ? p.name.slice(0, -suffix.length) : p.name;
    return { _key: item.id, product: { _type: "reference", _ref: p.metadata.sanityProductId }, quantity: item.quantity, size, productName: name, unitPrice: (item.price?.unit_amount ?? 0) / 100, imageUrl: p.images[0] || "" };
  });
  const document = {
    _id: orderDocumentId(session.id), _type: "order", orderNumber: metadata.orderNumber,
    stripeCheckoutSessionId: session.id, stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
    stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
    clerkUserId: metadata.clerkUserId, customerName: metadata.customerName || "Client", email: metadata.customerEmail,
    totalPrice: (session.amount_total ?? 0) / 100, currency: session.currency || "eur",
    amountDiscount: (session.total_details?.amount_discount ?? 0) / 100, status: "paid",
    orderDate: new Date(session.created * 1000).toISOString(), products,
  };
  // Older releases used random Sanity IDs. Reuse those records on retries so
  // switching to deterministic IDs cannot duplicate a historical order.
  const legacy = await client.fetch<{_id:string; _rev:string; orderNumber:string; clerkUserId?:string; status?:string} | null>(
    '*[_type=="order" && stripeCheckoutSessionId==$id] | order(orderDate asc)[0]{_id,_rev,orderNumber,clerkUserId,status}', {id:session.id},
  );
  if (legacy && legacy.clerkUserId !== metadata.clerkUserId) throw new Error("Propriétaire de commande incohérent");
  if (legacy?.status === 'pending') {
    const fields: Partial<typeof document> = {...document};
    delete fields._id; delete fields._type;
    await client.patch(legacy._id).ifRevisionId(legacy._rev).set(fields).commit();
  }
  const order = legacy || await client.createIfNotExists(document);
  return { order, purchased: products.map(p => ({ productId: p.product._ref, size: p.size, quantity: p.quantity })) };
}
