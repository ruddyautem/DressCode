// src/app/(store)/orders/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getMyOrders } from "@/sanity/lib/orders/getMyOrders";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OrdersClient from "@/components/OrdersClient";

const Orders = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  const orders = await getMyOrders(userId);

  return <OrdersClient orders={orders} />;
};

export default Orders;

