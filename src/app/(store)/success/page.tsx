"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useBasketStore from "../store";

const SuccessPage = () => {
  const orderNumber = useSearchParams().get("orderNumber");
  const clearBasket = useBasketStore((state) => state.clearBasket);

  useEffect(() => {
    if (orderNumber) clearBasket();
  }, [orderNumber, clearBasket]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-12 rounded-xl shadow-lg max-w-2xl w-full mx-4 text-center">
        {/* Success Icon */}
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold mb-6">Merci pour votre commande!</h1>
        
        <div className="border-t border-b border-gray-200 py-6 mb-6 space-y-4">
          <p className="text-lg text-gray-700">
            Votre commande est confirmée et sera expédiée au plus vite!
          </p>

          {orderNumber && (
            <p className="text-gray-600">
              <span>Numéro de Commande: </span>
              <span className="font-mono text-sm text-green-600">{orderNumber}</span>
            </p>
          )}

          <p className="text-gray-600">
            Un email de confirmation a été envoyé sur votre adresse email.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/orders">Détails de votre commande</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Continuer vos achats</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;