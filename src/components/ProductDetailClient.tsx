"use client";

import { useState, useEffect } from "react";
import { urlForProduct } from "@/lib/imageUrl";
import { Product } from "../../sanity.types";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Check,
  Ruler,
  Plus,
  Minus,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import useBasketStore from "@/app/(store)/store";
import { toast } from "sonner";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { t, translateProductName, translateProductDesc } = useLanguage();
  const { addMultipleItems, getItemCount } = useBasketStore();
  const [justAdded, setJustAdded] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);

  // Détection du type de vêtement pour les tailles
  const categoriesList = (product as any).categories as
    | Array<{ title?: string; slug?: { current?: string } } | string>
    | undefined;

  const categorySlugs = Array.isArray(categoriesList)
    ? categoriesList.map((cat) => (typeof cat === "string" ? cat : cat.slug?.current || "")).filter(Boolean)
    : [];

  const isAccessory =
    categorySlugs.some((s) => s.includes("casquette") || s.includes("bonnet")) ||
    product.name?.toLowerCase().includes("casquette") ||
    product.name?.toLowerCase().includes("bonnet") ||
    product.name?.toLowerCase().includes("chapeau");

  const isShoes =
    categorySlugs.some((s) => s.includes("basket") || s.includes("shoe")) ||
    product.name?.toLowerCase().includes("converse") ||
    product.name?.toLowerCase().includes("nike");

  // Définition des tailles disponibles : détection dynamique depuis la description
  const rawDesc =
    product.description
      ?.map((block) =>
        block._type === "block"
          ? block.children?.map((child) => child.text).join("")
          : ""
      )
      .join("") || "";

  const productDesc = translateProductDesc(rawDesc, product.slug?.current);

  const parseSizesFromText = (text: string): string[] | null => {
    // Ex: "Tailles Disponibles: SM / M / L" ou "Tailles Disponibles: S / M / L" ou "Available sizes: S / M / L"
    const match = text.match(/(?:tailles?\s*disponibles?|available\s*sizes?)\s*:\s*([^\n\r.]+)/i);
    if (!match) return null;
    const sizesPart = match[1];
    const parsed = sizesPart
      .split(/[\/,;]/)
      .map((s) => s.trim().toUpperCase())
      .map((s) => (s === "SM" ? "S" : s)) // Normaliser SM -> S
      .filter((s) => s.length > 0 && s.length <= 4);
    return parsed.length > 0 ? Array.from(new Set(parsed)) : null;
  };

  const parsedSizes = parseSizesFromText(productDesc) || parseSizesFromText(rawDesc);

  const availableSizes = isAccessory
    ? ["TU"]
    : isShoes
    ? ["39", "40", "41", "42", "43", "44", "45"]
    : parsedSizes && parsedSizes.length > 0
    ? parsedSizes
    : ["S", "M", "L", "XL"];

  const [selectedSize, setSelectedSize] = useState<string>(
    isAccessory ? "TAILLE UNIQUE" : availableSizes[0]
  );


  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isOutOfStock = product.stock != null && product.stock <= 0;
  const sizeToQuery = isAccessory ? "TAILLE UNIQUE" : selectedSize;

  // Sélecteur réactif Zustand pour écouter les modifications d'items
  const currentItemCount = useBasketStore((state) => {
    return (
      state.items.find(
        (item) => item.product._id === product._id && item.size === sizeToQuery
      )?.quantity ?? 0
    );
  });

  const productName = translateProductName(product.name, product.slug?.current);

  const [addedCount, setAddedCount] = useState<number>(1);

  const handleAddToBasket = () => {
    if (isOutOfStock) return;
    const sizeToSave = isAccessory ? "TAILLE UNIQUE" : selectedSize;
    const quantityToAdd = quantity;
    addMultipleItems(product, quantityToAdd, sizeToSave);
    setAddedCount(quantityToAdd);
    setJustAdded(true);
    setQuantity(1); // Réinitialiser le sélecteur à 1 après ajout
    const totalCount = currentItemCount + quantityToAdd;
    const sizeLabel = sizeToSave ? ` (${sizeToSave})` : "";
    const toastId = `basket-${product._id}-${sizeToSave || "default"}`;
    toast.success(t("notifAdded"), {
      id: toastId,
      description: `x${totalCount} ${productName || ""}${sizeLabel}`,
    });
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className='min-h-screen bg-slate-50 py-6 sm:py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12'>
        {/* Fil d'ariane retour */}
        <div className='mb-6'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            {t("backToCollections")}
          </Link>
        </div>

        {/* Grille Principale - Pleine envergure sur grands écrans */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-16 bg-white p-6 sm:p-10 lg:p-12 xl:p-14 rounded-3xl border border-slate-200/80 shadow-xs'>
          {/* Colonne Image / Showcase */}
          <div className='lg:col-span-6 flex flex-col items-center justify-center'>
            <div
              className={`relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 ${
                isOutOfStock ? "opacity-75" : ""
              }`}
            >
              {product.image && (
                <Image
                  src={urlForProduct(product.image, 1200) || ""}
                  alt={productName || "Product Image"}
                  fill
                  priority
                  className='object-cover object-center'
                  sizes='(max-width: 1024px) 100vw, 50vw'
                />
              )}

              {isOutOfStock ? (
                <div className='absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs'>
                  <span className='px-4 py-2 rounded-full bg-white text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg'>
                    {t("outOfStock")}
                  </span>
                </div>
              ) : product.stock != null && product.stock <= 5 ? (
                <div className='absolute top-3 left-3 sm:top-4 sm:left-4 px-3 py-1 rounded-full bg-amber-500 text-white font-semibold text-xs tracking-wider uppercase shadow-md'>
                  {t("lastPieces")} ({product.stock})
                </div>
              ) : null}
            </div>
          </div>

          {/* Colonne Détails & Action */}
          <div className='lg:col-span-6 flex flex-col justify-between space-y-6 text-center sm:text-left'>
            <div className='space-y-4'>
              {/* Badge Collection & Catégorie */}
              <div className='flex items-center justify-center sm:justify-start gap-2'>
                <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wider uppercase'>
                  <Sparkles className='w-3 h-3 text-slate-900' />
                  {t("signatureEdition")}
                </div>
              </div>

              {/* Titre Produit */}
              <h1 className='text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight'>
                {productName}
              </h1>

              {/* Prix */}
              <div className='flex items-baseline justify-center sm:justify-start gap-3'>
                <span className='text-3xl sm:text-4xl font-extrabold text-slate-950'>
                  {product.price?.toFixed(2)} €
                </span>
                <span className='text-xs text-slate-500 font-medium'>
                  {t("vatIncluded")}
                </span>
              </div>

              {/* Sélecteur de Tailles - Style moderne & épuré */}
              <div className='pt-5 border-t border-slate-100'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs font-bold text-slate-950 uppercase tracking-wider'>
                      {t("sizeLabel")} :
                    </span>
                    <span className='text-xs font-black text-slate-900 tracking-wide uppercase bg-slate-100 px-2.5 py-0.5 rounded-md'>
                      {isAccessory ? t("oneSize") : selectedSize}
                    </span>
                  </div>

                  {!isAccessory && (
                    <span className='inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer transition-colors'>
                      <Ruler className='w-3.5 h-3.5' />
                      {t("sizeGuide")}
                    </span>
                  )}
                </div>

                {isAccessory ? (
                  <div className='inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider shadow-2xs'>
                    <Check className='w-4 h-4 text-emerald-600 stroke-[3]' />
                    <span>{t("oneSize")}</span>
                  </div>
                ) : (
                  <div className='grid grid-cols-4 sm:flex sm:flex-wrap gap-2.5 pt-1'>
                    {availableSizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type='button'
                          onClick={() => setSelectedSize(size)}
                          className={`h-12 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? "bg-slate-950 text-white shadow-md ring-2 ring-slate-950 ring-offset-2 scale-[1.02]"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 hover:border-slate-300 active:scale-95"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Description du Produit */}
              <div className='pt-5 border-t border-slate-100'>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center sm:text-left'>
                  {t("pieceDescription")}
                </h3>
                <div className='text-sm text-slate-600 leading-relaxed text-center sm:text-left'>
                  {productDesc ? (
                    <p>{productDesc}</p>
                  ) : Array.isArray(product.description) && product.description.length > 0 ? (
                    <PortableText value={product.description} />
                  ) : (
                    <p>
                      Conçue avec un souci méticuleux du détail et des finitions soignées, cette pièce intemporelle de la collection DressCode marie tombé parfait et silhouette moderne.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions : Quantité, Disponibilité & Bouton d'Achat */}
            <div className='pt-6 border-t border-slate-100 space-y-4'>
              {/* Disponibilité style e-commerce pro */}
              <div className='flex items-center justify-center sm:justify-start gap-2.5 text-xs'>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOutOfStock ? "bg-rose-500 ring-4 ring-rose-100" : "bg-emerald-500 ring-4 ring-emerald-100"
                  }`}
                />
                <span className='font-semibold text-slate-900'>
                  {isOutOfStock ? t("unavailable") : t("inStock")}
                </span>
                {!isOutOfStock && (
                  <span className='text-slate-400 font-medium'>
                    • {t("shipsQuickly")}
                  </span>
                )}
              </div>

              {/* Bloc Quantité & Bouton d'ajout */}
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                {/* Sélecteur de Quantité */}
                <div className='flex items-center justify-between sm:justify-start bg-slate-100/80 border border-slate-200 rounded-2xl p-1.5 gap-2 shrink-0'>
                  <button
                    type='button'
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label='Diminuer la quantité'
                    className='w-10 h-10 rounded-xl bg-white hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-white text-slate-800 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs'
                  >
                    <Minus className='w-4 h-4 stroke-[2.5]' />
                  </button>

                  <div className='w-12 text-center'>
                    <span className='text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-none'>
                      {t("quantityLabel")}
                    </span>
                    <span className='text-sm font-black text-slate-950 leading-tight'>
                      {quantity}
                    </span>
                  </div>

                  <button
                    type='button'
                    disabled={isOutOfStock || (product.stock != null && quantity >= product.stock)}
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label='Augmenter la quantité'
                    className='w-10 h-10 rounded-xl bg-white hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-white text-slate-800 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs'
                  >
                    <Plus className='w-4 h-4 stroke-[2.5]' />
                  </button>
                </div>

                {/* Bouton d'ajout au panier pleine largeur */}
                <button
                  type='button'
                  onClick={handleAddToBasket}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg ${
                    isOutOfStock
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      : justAdded
                      ? "bg-emerald-600 text-white shadow-emerald-600/30"
                      : "bg-slate-950 hover:bg-slate-800 active:scale-[0.99] text-white shadow-slate-950/20"
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className='w-4 h-4 stroke-[3]' />
                      <span>{t("addedToBasket")}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className='w-4 h-4 stroke-[2.2]' />
                      <span>{t("addToBasket")}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Badges de réassurance pro */}
              <div className='grid grid-cols-3 gap-3 pt-3 text-center'>
                <div className='flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-50 border border-slate-100'>
                  <Truck className='w-4 h-4 text-slate-700' />
                  <span className='text-[10px] font-semibold text-slate-800'>
                    {t("expressDelivery")}
                  </span>
                </div>
                <div className='flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-50 border border-slate-100'>
                  <RotateCcw className='w-4 h-4 text-slate-700' />
                  <span className='text-[10px] font-semibold text-slate-800'>
                    {t("returns30d")}
                  </span>
                </div>
                <div className='flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-50 border border-slate-100'>
                  <ShieldCheck className='w-4 h-4 text-slate-700' />
                  <span className='text-[10px] font-semibold text-slate-800'>
                    {t("securePayment")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
