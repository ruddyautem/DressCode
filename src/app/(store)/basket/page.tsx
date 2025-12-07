"use client";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useBasketStore from "../store";
import Loader from "@/components/Loader";
import {
  createCheckoutSession,
  Metadata,
} from "../../../../actions/createCheckoutSession";
import { imageUrl } from "@/lib/imageUrl";
import AddToBasketButton from "@/components/AddToBasketButton";

const BasketPage = () => {
  const groupedItems = useBasketStore((state) => state.getGroupedItems());
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // wait for client to mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Loader />;
  }

  if (groupedItems.length === 0) {
    return (
      <div className='container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]'>
        <h1 className='mb-6 text-2xl font-bold text-gray-800'>Votre panier</h1>
        <p className='text-lg text-gray-600'>Votre panier est vide</p>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!isSignedIn) return;
    setIsLoading(true);

    try {
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(), // exemple : raz18rz-rz44rz-ccz4er8-r44z22
        customerName: user?.fullName ?? "Unknown",
        customerEmail: user?.emailAddresses[0].emailAddress ?? "Unknown",
        clerkUserId: user!.id,
      };
      const checkoutUrl = await createCheckoutSession(groupedItems, metadata);

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container mx-auto max-w-6xl p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Votre Panier</h1>
      <div className='flex-cold flex gap-8 lg:flex-row'>
        <div className='grow'>
          {groupedItems?.map((item) => (
            <div
              key={item.product._id}
              className='flex justify-between items-center p-4 mb-4 rounded border'
            >
              <div
                onClick={() =>
                  router.push(`/product/${item.product.slug?.current}`)
                }
                className='min-w-0 flex flex-1 items-center cursor-pointer'
              >
                <div className='shrink-0 w-20 h-20 mr-4 sm:w-24 sm:h-24'>
                  {item.product.image && (
                    <Image
                      src={imageUrl(item.product.image).url()}
                      alt={item.product.name ?? "Product Image"}
                      className='w-full h-full object-contain rounded'
                      width={96}
                      height={96}
                    />
                  )}
                </div>
                <div className='min-w-0'>
                  <h2 className='text-lg font-semibold truncate sm:text-xl'>
                    {item.product.name}
                  </h2>
                  <p className='text-sm sm:text-base'>
                    Prix :
                    {((item.product.price ?? 0) * item.quantity).toFixed(2)} €{" "}
                  </p>
                </div>
              </div>

              <div className='shrink-0 flex items-center ml-4'>
                <AddToBasketButton product={item.product} />
              </div>
            </div>
          ))}
        </div>
        <div className='w-full h-fit fixed bottom-0 left-0 order-first p-6 bg-white rounded border lg:w-80 lg:sticky lg:top-4 lg:left-auto lg:order-last'>
          <h3 className='text-xl font-semibold'>Résumé de la commande</h3>
          <div className='mt-4 space-y-2'>
            <p className='flex justify-between'>
              <span>Articles:</span>
              <span>
                {groupedItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </p>
            <p className='flex justify-between text-2xl font-bold border-t pt-2'>
              <span>Total:</span>
              <span>
                {useBasketStore.getState().getTotalPrice().toFixed(2)} €
              </span>
            </p>
          </div>
          {isSignedIn ? (
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className='mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 cursor-pointer'
            >
              {isLoading ? "En cours..." : "Finaliser la commande"}
            </button>
          ) : (
            <SignInButton mode='modal'>
              <button className='mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer'>
                Se connecter pour finaliser la commande
              </button>
            </SignInButton>
          )}
        </div>

        <div className='h-64 lg:h-0'>
          {/* Spacer for fixed checkout on mobile */}
        </div>
      </div>
    </div>
  );
};

export default BasketPage;
