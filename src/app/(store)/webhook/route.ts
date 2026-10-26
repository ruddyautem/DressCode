import stripe from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { persistPaidOrder } from "@/lib/orders";
export async function POST(req:NextRequest){
 const sig=req.headers.get("stripe-signature"),secret=process.env.STRIPE_WEBHOOK_SECRET;
 if(!sig) return NextResponse.json({error:"Missing signature"},{status:400});
 if(!secret) return NextResponse.json({error:"Webhook not configured"},{status:503});
 const rawBody=await req.text();
 let event;
 try{event=await stripe.webhooks.constructEventAsync(rawBody,sig,secret);}catch{return NextResponse.json({error:"Invalid signature"},{status:400});}
 try{
  if((event.type==="checkout.session.completed" || event.type==="checkout.session.async_payment_succeeded") && event.data.object.payment_status==="paid") await persistPaidOrder(event.data.object);
  return NextResponse.json({received:true});
 }catch{ console.error("Order persistence failed",event.id); return NextResponse.json({error:"Order persistence failed"},{status:500}); }
}
