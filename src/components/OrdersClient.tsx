"use client";

import { useLanguage } from "@/context/LanguageContext";
import { formatCurrency } from "@/lib/formatCurrency";
import { imageUrl } from "@/lib/imageUrl";
import { MY_ORDERS_QUERYResult } from "../../sanity.types";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Tag,
  LucideIcon,
} from "lucide-react";

interface OrdersClientProps {
  orders: MY_ORDERS_QUERYResult;
}

interface StatusConfig {
  labelKey: "statusPending" | "statusPaid" | "statusShipped" | "statusDelivered" | "statusCancelled";
  bg: string;
  text: string;
  icon: LucideIcon;
}

const statusMap: Record<string, StatusConfig> = {
  pending: { labelKey: "statusPending", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: Clock },
  paid: { labelKey: "statusPaid", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: CheckCircle2 },
  shipped: { labelKey: "statusShipped", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: Truck },
  delivered: { labelKey: "statusDelivered", bg: "bg-purple-50 border-purple-200", text: "text-purple-700", icon: CheckCircle2 },
  cancelled: { labelKey: "statusCancelled", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", icon: XCircle },
};

export default function OrdersClient({ orders }: OrdersClientProps) {
  const { t, language } = useLanguage();
  const dateLocale = language === "en" ? "en-US" : "fr-FR";

  return (
    <div className='min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-6'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            {t("continueShopping")}
          </Link>
        </div>

        <div className='flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 text-center sm:text-left'>
          <div>
            <h1 className='text-3xl font-black text-slate-900 tracking-tight'>
              {t("myOrders")}
            </h1>
            <p className='text-sm text-slate-500 mt-1'>
              {t("ordersSubtitle")}
            </p>
          </div>
          <span className='text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200'>
            {orders.length} {orders.length > 1 ? (language === "en" ? "orders" : "commandes") : (language === "en" ? "order" : "commande")}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className='bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs'>
            <div className='w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400'>
              <Package className='w-8 h-8' />
            </div>
            <h3 className='text-lg font-bold text-slate-900'>{t("noOrdersYet")}</h3>
            <p className='text-slate-500 text-sm mt-1 max-w-sm mx-auto mb-6'>
              {t("noOrdersDesc")}
            </p>
            <Link
              href='/'
              className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition-all'
            >
              {t("exploreNews")}
            </Link>
          </div>
        ) : (
          <div className='space-y-6'>
            {orders.map((order) => {
              const statusCfg = statusMap[order.status || "pending"] || {
                labelKey: "statusPending",
                bg: "bg-slate-50 border-slate-200",
                text: "text-slate-700",
                icon: Clock,
              };
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={order.orderNumber}
                  className='bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden'
                >
                  {/* Order Header */}
                  <div className='p-6 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-slate-400 font-medium uppercase tracking-wider'>
                          {t("refNumber")}
                        </span>
                        <span className='font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200'>
                          {order.orderNumber}
                        </span>
                      </div>
                      <p className='text-xs text-slate-500'>
                        {t("orderedOn")}{" "}
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString(dateLocale, {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </p>
                    </div>

                    <div className='flex items-center gap-3'>
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text}`}
                      >
                        <StatusIcon className='w-3.5 h-3.5' />
                        <span>{t(statusCfg.labelKey)}</span>
                      </div>

                      <div className='text-right'>
                        <span className='text-base sm:text-lg font-black text-slate-950 block leading-tight'>
                          {formatCurrency(order.totalPrice ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Discount if applicable */}
                  {order.amountDiscount ? (
                    <div className='mx-6 mt-4 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between text-xs text-amber-900 font-medium'>
                      <div className='flex items-center gap-2'>
                        <Tag className='w-4 h-4 text-amber-600' />
                        <span>{t("promoApplied")}</span>
                      </div>
                      <span className='font-bold text-amber-700'>
                        -{formatCurrency(order.amountDiscount)}
                      </span>
                    </div>
                  ) : null}

                  {/* Products list */}
                  <div className='p-6 space-y-4'>
                    {order.products?.map((item) => (
                      <div
                        key={item._key}
                        className='flex items-center justify-between gap-4 py-2 border-b last:border-b-0 border-slate-100'
                      >
                        <div className='flex items-center gap-4'>
                          <div className='relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100'>
                            {item.product?.image && (
                              <Image
                                src={imageUrl(item.product.image) || ""}
                                alt={item.product?.name ?? "Produit"}
                                fill
                                className='object-cover'
                              />
                            )}
                          </div>
                          <div>
                            <p className='font-bold text-sm text-slate-900'>
                              {item.product?.name}
                            </p>
                            <p className='text-xs text-slate-500 mt-0.5'>
                              {t("quantity")} : {item.quantity ?? 1}
                            </p>
                          </div>
                        </div>

                        <span className='text-sm font-black text-slate-950'>
                          {item.product?.price && item.quantity
                            ? formatCurrency(
                                item.product.price * item.quantity
                              )
                            : "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
