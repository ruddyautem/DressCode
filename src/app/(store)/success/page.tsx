"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import useBasketStore from "../store";
import { CheckCircle2, Package, ShoppingBag, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { syncOrderFromSession } from "../../../../actions/createCheckoutSession";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const sessionId = searchParams.get("session_id");
  const clearBasket = useBasketStore((state) => state.clearBasket);
  const { t } = useLanguage();

  useEffect(() => {
    if (orderNumber) clearBasket();
    if (sessionId) {
      syncOrderFromSession(sessionId);
    }
  }, [orderNumber, sessionId, clearBasket]);

  return (
    <div className='min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-lg w-full p-8 sm:p-10 text-center relative overflow-hidden'>
        {/* Ligne accentuée haute */}
        <div className='absolute top-0 left-0 right-0 h-1.5 bg-slate-950' />

        {/* Badge de succès */}
        <div className='w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-xs'>
          <CheckCircle2 className='w-8 h-8' />
        </div>

        <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold tracking-wider uppercase mb-3'>
          <Sparkles className='w-3 h-3 text-slate-900' />
          {t("orderValidated")}
        </div>

        <h1 className='text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2'>
          {t("successThanks")}
        </h1>

        <p className='text-slate-500 text-sm mb-6'>
          {t("successDesc")}
        </p>

        {orderNumber && (
          <div className='bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-6 text-center space-y-1.5'>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center'>
              {t("orderId")}
            </span>
            <p className='font-mono font-bold text-xs sm:text-sm text-slate-900 break-all text-center'>
              {orderNumber}
            </p>
          </div>
        )}

        <div className='text-xs text-slate-400 mb-8 leading-relaxed'>
          {t("successEmailNote")}
        </div>

        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Link
            href='/orders'
            className='inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md'
          >
            <Package className='w-4 h-4' />
            <span>{t("trackOrder")}</span>
          </Link>
          <Link
            href='/'
            className='inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-all'
          >
            <ShoppingBag className='w-4 h-4' />
            <span>{t("backToShop")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const SuccessPage = () => {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center'>Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  );
};

export default SuccessPage;