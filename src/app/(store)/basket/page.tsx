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
import AddToBasketButton from "@/components/BasketQuantityControl";
import Link from "next/link";
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, ArrowLeft, Trash2, CreditCard, Copy, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

const BasketPage = () => {
  const items = useBasketStore((state) => state.items);
  const removeMultipleItems = useBasketStore((state) => state.removeMultipleItems);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { t, translateProductName, translateSize, language } = useLanguage();

  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [cardCopied, setCardCopied] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "single" | "multiple";
    itemToDelete?: { productId: string; size?: string; name: string };
    count?: number;
  }>({ isOpen: false, type: "multiple" });

  const copyTestCard = () => {
    navigator.clipboard.writeText("4242424242424242");
    setCardCopied(true);
    toast.success(language === "en" ? "Card number copied!" : "Numéro de carte copié !", {
      description: "4242 4242 4242 4242 (02/42 • 424)",
    });
    setTimeout(() => setCardCopied(false), 2000);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper to generate a unique key for each item
  const getItemKey = (productId: string, size?: string) =>
    `${productId}::${size || ""}`;

  const groupedItems = items;

  // Keep selected keys in sync with existing items
  useEffect(() => {
    if (isClient) {
      const validKeys = new Set(
        groupedItems.map((item) => getItemKey(item.product._id, item.size))
      );
      setSelectedKeys((prev) => prev.filter((key) => validKeys.has(key)));
    }
  }, [groupedItems, isClient]);

  if (!isClient) {
    return <Loader />;
  }

  const totalItemsCount = groupedItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalPrice = groupedItems.reduce(
    (total, item) => total + (item.product.price ?? 0) * item.quantity,
    0
  );

  const isAllSelected =
    groupedItems.length > 0 && selectedKeys.length === groupedItems.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(
        groupedItems.map((item) => getItemKey(item.product._id, item.size))
      );
    }
  };

  const toggleSelectItem = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Open confirmation modal for multiple items
  const promptDeleteSelected = () => {
    if (selectedKeys.length === 0) return;
    setDeleteModal({
      isOpen: true,
      type: "multiple",
      count: selectedKeys.length,
    });
  };

  // Open confirmation modal for a single item
  const promptDeleteSingle = (productId: string, size: string | undefined, name: string) => {
    setDeleteModal({
      isOpen: true,
      type: "single",
      itemToDelete: { productId, size, name },
    });
  };

  // Execute deletion after confirmation
  const handleConfirmDelete = () => {
    if (deleteModal.type === "multiple") {
      const itemsToRemove = selectedKeys.map((key) => {
        const [productId, size] = key.split("::");
        return {
          productId,
          size: size ? size : undefined,
        };
      });

      const count = itemsToRemove.length;
      removeMultipleItems(itemsToRemove);
      setSelectedKeys([]);
      toast.info(t("notifMultipleRemoved", { count }));
    } else if (deleteModal.type === "single" && deleteModal.itemToDelete) {
      const itemName = deleteModal.itemToDelete.name;
      const sizeLabel = deleteModal.itemToDelete.size ? ` (${deleteModal.itemToDelete.size})` : "";
      removeMultipleItems([
        {
          productId: deleteModal.itemToDelete.productId,
          size: deleteModal.itemToDelete.size,
        },
      ]);
      const key = getItemKey(
        deleteModal.itemToDelete.productId,
        deleteModal.itemToDelete.size
      );
      setSelectedKeys((prev) => prev.filter((k) => k !== key));
      toast.info(t("notifRemoved"), {
        description: `${itemName}${sizeLabel}`,
      });
    }

    setDeleteModal({ isOpen: false, type: "multiple" });
  };

  if (groupedItems.length === 0) {
    return (
      <div className='min-h-[75vh] flex flex-col items-center justify-center px-4 text-center'>
        <div className='w-20 h-20 rounded-3xl bg-white border border-slate-200 flex items-center justify-center shadow-xs mb-6'>
          <ShoppingBag className='w-8 h-8 text-slate-400' />
        </div>
        <h1 className='text-2xl sm:text-3xl font-black text-slate-900 tracking-tight'>
          {t("basketEmpty")}
        </h1>
        <p className='text-slate-500 text-sm sm:text-base mt-2 max-w-sm text-center'>
          {t("basketEmptyDesc")}
        </p>
        <Link
          href='/'
          className='mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-200 shadow-md'
        >
          <span>{t("discoverCollection")}</span>
          <ArrowRight className='w-4 h-4' />
        </Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!isSignedIn) return;
    setIsLoading(true);

    try {
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(),
        customerName: user?.fullName ?? "Unknown",
        customerEmail: user?.emailAddresses[0].emailAddress ?? "Unknown",
        clerkUserId: user!.id,
      };
      const checkoutUrl = await createCheckoutSession(
        groupedItems,
        metadata,
        language
      );

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
    <div className='min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-row items-center justify-between mb-8 gap-4 text-left'>
          <div>
            <Link
              href='/'
              className='inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider mb-2'
            >
              <ArrowLeft className='w-3.5 h-3.5' />
              {t("continueShopping")}
            </Link>
            <h1 className='text-2xl sm:text-3xl font-black text-slate-900 tracking-tight'>
              {t("yourBasket")}
            </h1>
          </div>
          <span className='text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shrink-0'>
            {totalItemsCount} {totalItemsCount > 1 ? t("piecesPlural") : t("pieces")}
          </span>
        </div>

        {/* Barre d'action sélection multiple */}
        <div className='bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 mb-4 flex items-center justify-between shadow-xs gap-3'>
          <label className='flex items-center gap-2.5 cursor-pointer select-none text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors'>
            <input
              type='checkbox'
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className='w-4 h-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 accent-slate-950 cursor-pointer'
            />
            <span>{t("selectAll")}</span>
          </label>

          {selectedKeys.length > 0 && (
            <button
              onClick={promptDeleteSelected}
              className='inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all duration-150 border border-red-200 cursor-pointer shrink-0'
            >
              <Trash2 className='w-3.5 h-3.5' />
              <span>
                {t("deleteSelected")} ({selectedKeys.length})
              </span>
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          {/* Liste des articles */}
          <div className='lg:col-span-8 space-y-4'>
            {groupedItems?.map((item) => {
              const name = translateProductName(item.product.name, item.product.slug?.current);
              const itemKey = getItemKey(item.product._id, item.size);
              const isSelected = selectedKeys.includes(itemKey);

              return (
                <div
                  key={itemKey}
                  className={`flex items-center justify-between gap-3 p-3.5 sm:p-5 bg-white rounded-2xl border transition-all duration-150 shadow-xs text-left ${
                    isSelected ? "border-slate-900 ring-1 ring-slate-900/10 bg-slate-50/50" : "border-slate-200/80"
                  }`}
                >
                  <div className='flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0'>
                    {/* Checkbox de sélection */}
                    <div className='flex items-center justify-center shrink-0'>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => toggleSelectItem(itemKey)}
                        className='w-4 h-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 accent-slate-950 cursor-pointer'
                        aria-label={`Select ${name}`}
                      />
                    </div>

                    <div
                      onClick={() =>
                        router.push(`/product/${item.product.slug?.current}`)
                      }
                      className='flex items-center gap-2.5 sm:gap-4 cursor-pointer flex-1 min-w-0'
                    >
                      <div className='relative w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100'>
                        {item.product.image && (
                          <Image
                            src={imageUrl(item.product.image) || ""}
                            alt={name || "Product Image"}
                            className='w-full h-full object-cover'
                            width={96}
                            height={96}
                          />
                        )}
                      </div>

                      <div className='min-w-0 flex-1 text-left'>
                        <div className='flex flex-wrap items-center justify-start gap-1.5'>
                          <h2 className='text-xs sm:text-base font-bold text-slate-900 hover:text-slate-600 transition-colors leading-snug'>
                            {name}
                          </h2>
                          {item.size && (
                            <span className='px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] sm:text-[11px] font-bold tracking-tight uppercase shrink-0'>
                              {translateSize(item.size)}
                            </span>
                          )}
                        </div>
                        <p className='text-[11px] sm:text-xs text-slate-500 mt-0.5'>
                          {t("price")} : {item.product.price?.toFixed(2)} €
                        </p>
                        <div className='flex items-center justify-between gap-2 mt-1.5'>
                          <p className='text-xs sm:text-sm font-black text-slate-950 leading-none'>
                            {((item.product.price ?? 0) * item.quantity).toFixed(2)} €
                          </p>
                          {/* Contrôle Quantité compact aligné avec le prix */}
                          <div className='shrink-0'>
                            <AddToBasketButton product={item.product} size={item.size} disableToast />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bandeau d'information livraison toujours offerte */}
            <div className='p-4 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-start gap-3 text-xs text-slate-700 text-left shadow-xs'>
              <Truck className='w-4 h-4 text-emerald-600 shrink-0' />
              <span className='font-medium'>
                {t("freeShippingAlways")}
              </span>
            </div>
          </div>

          {/* Résumé de commande */}
          <div className='lg:col-span-4 sticky top-24'>
            <div className='bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6'>
              <h2 className='text-lg font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100'>
                {t("summary")}
              </h2>

              <div className='space-y-3 text-sm text-slate-600'>
                <div className='flex justify-between'>
                  <span>{t("subtotal")}</span>
                  <span className='font-semibold text-slate-900'>
                    {totalPrice.toFixed(2)} €
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>{t("shippingEst")}</span>
                  <span className='font-semibold text-emerald-600'>
                    {t("freeShipping")}
                  </span>
                </div>
                <div className='flex justify-between text-base font-black text-slate-950 pt-4 border-t border-slate-100'>
                  <span>Total</span>
                  <span className='text-xl'>
                    {totalPrice.toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* Indicateur Carte de Test Stripe (Style Signature Black & White) */}
              <div className='p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm'>
                <div className='flex items-center justify-between gap-2 mb-2'>
                  <div className='flex items-center gap-1.5'>
                    <div className='w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-slate-300'>
                      <CreditCard className='w-3 h-3 text-white' />
                    </div>
                    <span className='text-[11px] font-semibold text-slate-300 tracking-wide uppercase'>
                      {t("testCardTitle")}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={copyTestCard}
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all duration-200 cursor-pointer border ${
                      cardCopied
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-white/10 hover:bg-white/20 text-slate-200 border-white/10 active:scale-95"
                    }`}
                    title={language === "en" ? "Copy card number" : "Copier le numéro"}
                  >
                    {cardCopied ? (
                      <>
                        <Check className='w-3 h-3 text-emerald-400' />
                        <span className='text-emerald-300'>{language === "en" ? "Copied" : "Copié"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className='w-3 h-3 text-slate-400' />
                        <span>{language === "en" ? "Copy" : "Copier"}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className='bg-slate-950/70 p-2.5 rounded-xl border border-white/5 font-mono text-[11px] sm:text-xs text-slate-300'>
                  <div className='flex items-center justify-between'>
                    <span className='font-sans text-[10px] text-slate-400 uppercase tracking-wider'>
                      {t("testCardNumber")}
                    </span>
                    <strong className='font-black tracking-widest text-white text-xs sm:text-sm'>
                      4242 4242 4242 4242
                    </strong>
                  </div>
                  <div className='flex items-center justify-between pt-1.5 mt-1.5 border-t border-white/5 text-[11px] text-slate-400 font-sans'>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-[10px] uppercase tracking-wider text-slate-500'>Exp</span>
                      <strong className='font-mono font-bold text-slate-200'>02/42</strong>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-[10px] uppercase tracking-wider text-slate-500'>CVC</span>
                      <strong className='font-mono font-bold text-slate-200'>424</strong>
                    </div>
                  </div>
                </div>
              </div>

              {isSignedIn ? (
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className='w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3.5 px-4 rounded-2xl transition-all duration-200 shadow-md cursor-pointer text-sm'
                >
                  <span>{isLoading ? "..." : t("checkout")}</span>
                  <ArrowRight className='w-4 h-4' />
                </button>
              ) : (
                <SignInButton mode='modal'>
                  <button className='w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-2xl transition-all duration-200 shadow-md cursor-pointer text-sm'>
                    {t("loginToOrder")}
                  </button>
                </SignInButton>
              )}

              <div className='flex items-center justify-center gap-2 text-slate-400 text-xs text-center pt-2'>
                <ShieldCheck className='w-4 h-4 text-emerald-600' />
                <span>{t("sslSecure")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Boîte de dialogue de confirmation de suppression */}
      {deleteModal.isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200'>
          <div className='bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200'>
            <div className='w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100'>
              <Trash2 className='w-6 h-6 stroke-[2.2]' />
            </div>

            <div>
              <h3 className='text-lg font-black text-slate-900 tracking-tight'>
                {t("confirmDeleteTitle")}
              </h3>
              <p className='text-sm text-slate-500 mt-2 leading-relaxed'>
                {deleteModal.type === "multiple"
                  ? t("confirmDeleteMultipleMsg").replace(
                      "{count}",
                      String(deleteModal.count || selectedKeys.length)
                    )
                  : deleteModal.itemToDelete?.name
                  ? `${t("confirmDeleteOneMsg")} (${deleteModal.itemToDelete.name})`
                  : t("confirmDeleteOneMsg")}
              </p>
            </div>

            <div className='grid grid-cols-2 gap-3 pt-2'>
              <button
                type='button'
                onClick={() => setDeleteModal({ isOpen: false, type: "multiple" })}
                className='w-full py-3 px-4 rounded-2xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer'
              >
                {t("cancel")}
              </button>
              <button
                type='button'
                onClick={handleConfirmDelete}
                className='w-full py-3 px-4 rounded-2xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors shadow-md shadow-red-600/20 cursor-pointer'
              >
                {t("confirmDeleteAll")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasketPage;

