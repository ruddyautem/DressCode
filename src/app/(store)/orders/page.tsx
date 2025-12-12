// src/app/(store)/orders/page.tsx

import { formatCurrency } from "@/lib/formatCurrency";
import { imageUrl } from "@/lib/imageUrl";
import { getMyOrders } from "@/sanity/lib/orders/getMyOrders";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

// Function to get French status display
function getStatusDisplay(status: string) {
  const statusMap = {
    pending: "À payer",
    paid: "Payé",
    shipped: "Expédié",
    delivered: "Livré",
    cancelled: "Annulé",
  };
  return statusMap[status as keyof typeof statusMap] || status;
}

// Function to get status color
function getStatusColor(status: string) {
  const colorMap = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    colorMap[status as keyof typeof colorMap] || "bg-gray-100 text-gray-800"
  );
}

const Orders = async () => {
  const { userId } = await auth();

  console.log("🔍 ORDERS DEBUG - auth userId:", userId);

  if (!userId) {
    return redirect("/");
  }

  const orders = await getMyOrders(userId);

  console.log("🔍 ORDERS DEBUG - found orders:", orders.length);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4'>
      <div className='bg-white p-4 sm:p-8 rounded-xl shadow-lg w-full max-w-4xl'>
        <h1 className='text-4xl font-bold text-gray-900 tracking-tight mb-8'>
          Mes Commandes
        </h1>

        {orders.length === 0 ? (
          <div className='text-center text-gray-600'>
            <p>Aucune commande.</p>
          </div>
        ) : (
          <div className='space-y-6 sm:space-y-8'>
            {orders.map((order) => (
              <div
                key={order.orderNumber}
                className='bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden'
              >
                <div className='p-4 sm:p-6 border-b border-gray-200'>
                  <div className='flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4'>
                    <div>
                      <p className='text-sm text-gray-600 mb-1 font-bold'>
                        Numéro de Commande
                      </p>
                      <p className='font-mono text-sm text-green-600 break-all'>
                        {order.orderNumber}
                      </p>
                    </div>
                    <div className='sm:text-right'>
                      <p className='text-sm text-gray-600 mb-1'>
                        Date de Commande
                      </p>
                      <p className='font-medium'>
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString(
                              "fr-FR"
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center'>
                    <div className='flex items-center'>
                      <span className='text-sm mr-2'>Statut:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status || "pending")}`}
                      >
                        {getStatusDisplay(order.status || "pending")}
                      </span>
                    </div>
                    <div className='sm:text-right'>
                      <p className='text-sm text-gray-600 mb-1'>Total</p>
                      <p className='font-bold text-lg'>
                        {formatCurrency(order.totalPrice ?? 0, order.currency)}
                      </p>
                    </div>
                  </div>
                  {order.amountDiscount ? (
                    <div className='mt-4 p-3 sm:p-4 bg-green-50 rounded-lg'>
                      <p className='text-green-600 font-medium mb-1 text-sm sm:text-base'>
                        Remise Appliquée:{" "}
                        {formatCurrency(order.amountDiscount, order.currency)}
                      </p>
                      <p className='text-sm text-gray-600'>
                        Prix initial:{" "}
                        {formatCurrency(
                          (order.totalPrice ?? 0) + order.amountDiscount,
                          order.currency
                        )}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className='px-4 py-3 sm:px-6 sm:py-4'>
                  <p className='text-sm font-semibold text-gray-600 mb-3 sm:mb-4'>
                    Articles Commandés
                  </p>
                  <div className='space-y-3 sm:space-y-4'>
                    {order.products?.map((product) => (
                      <div
                        key={product._key}
                        className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2 border-b last:border-b-0'
                      >
                        <div className='flex items-center gap-3 sm:gap-4'>
                          {product.product?.image && (
                            <div className='relative h-16 w-16 shrink-0 rounded-md overflow-hidden'>
                              <Image
                                src={imageUrl(product.product.image).url()}
                                alt={product.product?.name ?? ""}
                                className='object-contain'
                                fill
                              />
                            </div>
                          )}
                          <div>
                            <p className='font-medium text-sm sm:text-base'>
                              {product.product?.name}
                            </p>
                            <p className='text-sm text-gray-600'>
                              Quantité: {product.quantity ?? "N/A"}
                            </p>
                          </div>
                        </div>
                        <p className='font-medium text-right'>
                          {product.product?.price && product.quantity
                            ? formatCurrency(
                                product.product.price * product.quantity,
                                order.currency
                              )
                            : "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
