// src/sanity/lib/orders/getMyOrders.ts

import { defineQuery } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { MY_ORDERS_QUERYResult } from "../../../../sanity.types";

export const MY_ORDERS_QUERY = defineQuery(`
  *[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
    _id,
    orderNumber,
    orderDate,
    totalPrice,
    currency,
    amountDiscount,
    status,
    customerName,
    customerEmail,
    clerkUserId,
    products[] {
      _key,
      quantity,
      size,
      "product": {
        "_id": product->_id,
        "name": coalesce(productName, product->name),
        "price": coalesce(unitPrice, product->price),
        "image": coalesce(imageUrl, product->image.asset->url),
        "slug": product->slug
      }
    }
  }
`);

export async function getMyOrders(
  userId: string
): Promise<MY_ORDERS_QUERYResult> {
  if (!userId) {
    throw new Error("User Id is required");
  }



  try {
    const orders = await client.fetch(MY_ORDERS_QUERY, { userId });
    console.log("✅ Found orders:", orders?.length || 0);
    return orders || [];
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    throw new Error("Error fetching orders");
  }
}
