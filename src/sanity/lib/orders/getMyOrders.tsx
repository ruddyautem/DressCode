// src/sanity/lib/orders/getMyOrders.ts

import { defineQuery } from "next-sanity";
import { client } from "@/sanity/lib/client"; // Use client instead of backendClient
import { MY_ORDERS_QUERYResult } from "../../../../sanity.types";

export const MY_ORDERS_QUERY = defineQuery(`
  *[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
    ..., 
    products[] {
      ..., 
      product->
    }
  }
`);

export async function getMyOrders(userId: string): Promise<MY_ORDERS_QUERYResult> {
  if (!userId) {
    throw new Error("User Id is required");
  }

  console.log("🔍 Fetching orders for userId:", userId);

  try {
    const orders = await client.fetch(MY_ORDERS_QUERY, { userId });
    console.log("🔍 Found orders:", orders?.length || 0);
    console.log("🔍 Orders data:", JSON.stringify(orders, null, 2));
    return orders || [];
  } catch (error) {
    console.error("Error fetching orders: ", error);
    throw new Error("Error fetching orders");
  }
}