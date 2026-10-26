"use server";
import { currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "node:crypto";
import { imageUrl } from "@/lib/imageUrl";
import type { BasketItem } from "@/app/(store)/store";
import stripe from "@/lib/stripe";
import { env } from "@/lib/env";
import { client } from "@/sanity/lib/client";
import type { Product } from "../sanity.types";
import { canonicalCheckout, checkoutItemsSchema, orderDocumentId } from "@/lib/checkout-policy";
import { persistPaidOrder } from "@/lib/orders";
export type Metadata={orderNumber:string;customerName:string;customerEmail:string;clerkUserId:string};
export type GroupedBasketItem={product:BasketItem["product"];quantity:number;size?:string};
export async function createCheckoutSession(items:GroupedBasketItem[],_metadata:Metadata,locale?:string):Promise<{url:string;sessionId:string}>{
 const user=await currentUser();
 if(!user) throw new Error("Connexion requise");
 const parsed=checkoutItemsSchema.parse(items);
 const products=await client.fetch<(Product & {categorySlugs:string[]})[]>(`*[_type=="product" && _id in $ids]{...,"categorySlugs":categories[]->slug.current}`,{ids:parsed.map(i=>i.product._id)});
 const canonical=canonicalCheckout(parsed,products);
 for(const item of canonical){
  const p=item.product,n=p.name?.toLowerCase()||"",cats=p.categorySlugs||[];
  const accessory=cats.some(c=>/casquette|bonnet/.test(c)) || /casquette|bonnet|chapeau/.test(n);
  const shoes=cats.some(c=>/basket|shoe/.test(c)) || /converse|nike/.test(n);
  const description=p.description?.map(b=>b._type==="block"?b.children?.map(c=>c.text).join(""):"").join("")||"";
  const match=description.match(/(?:tailles?\s*disponibles?|available\s*sizes?)\s*:\s*([^\n\r.]+)/i);
  const sizes=accessory?["TU","TAILLE UNIQUE"]:shoes?["39","40","41","42","43","44","45"]:match?match[1].split(/[\/,;]/).map(s=>s.trim().toUpperCase()).map(s=>s==="SM"?"S":s).filter(s=>s.length>0&&s.length<=4):["S","M","L","XL"];
  if(item.size && !sizes.includes(item.size.toUpperCase())) throw new Error("Taille indisponible");
 }
 const email=user.primaryEmailAddress?.emailAddress;
 if(!email) throw new Error("Adresse email requise");
 const metadata:Metadata={clerkUserId:user.id,customerEmail:email,customerName:user.fullName||user.username||"Client",orderNumber:randomUUID()};
 const baseURL=env.NEXT_PUBLIC_BASE_URL.replace(/\/$/,"");
 const session=await stripe.checkout.sessions.create({mode:"payment",customer_creation:"always",customer_email:email,metadata,
  allow_promotion_codes:true,success_url:baseURL+"/success?session_id={CHECKOUT_SESSION_ID}",cancel_url:baseURL+"/basket",locale:locale==="en"?"en":"fr",
  line_items:canonical.map(item=>({quantity:item.quantity,price_data:{currency:"eur",unit_amount:Math.round(item.product.price!*100),product_data:{name:(item.product.name||"Produit")+(item.size?" (Taille: "+item.size+")":""),metadata:{sanityProductId:item.product._id,size:item.size||""},images:item.product.image?[imageUrl(item.product.image)||"" ]:undefined}}}))
 });
 if (!session.url) throw new Error("Session Stripe indisponible");
 return {url:session.url,sessionId:session.id};
}
export async function syncOrderFromSession(sessionId:string){
 try{
  orderDocumentId(sessionId);
  const user=await currentUser();
  if(!user) throw new Error("Connexion requise");
  const session=await stripe.checkout.sessions.retrieve(sessionId);
  if(session.metadata?.clerkUserId!==user.id) throw new Error("Session non autorisée");
  const {order,purchased}=await persistPaidOrder(session);
  return {success:true as const,orderId:order._id,orderNumber:order.orderNumber,purchased};
 }catch{ return {success:false as const,error:"Paiement non confirmé ou session non autorisée. Réessaie dans quelques instants."}; }
}
