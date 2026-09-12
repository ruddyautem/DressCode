"use client";

import Link from "next/link";
import { Product } from "../../sanity.types";
import Image from "next/image";
import { urlForThumb } from "@/lib/imageUrl";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ProductThumbProps {
  product: Product;
  priority?: boolean;
}

const ProductThumb = ({ product, priority = false }: ProductThumbProps) => {
  const isOutOfStock = product.stock != null && product.stock <= 0;
  const { t, translateProductName, translateProductDesc } = useLanguage();

  const productName = translateProductName(product.name, product.slug?.current);
  
  const rawDesc =
    product.description
      ?.map((block) =>
        block._type === "block"
          ? block.children?.map((child) => child.text).join("")
          : ""
      )
      .join("") || "";
      
  const productDesc = translateProductDesc(rawDesc, product.slug?.current);

  return (
    <div
      className={`group relative flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden ${
        isOutOfStock ? "opacity-75" : ""
      }`}
    >
      {/* Image plein format carré naturel */}
      <Link
        href={`/product/${product.slug?.current}`}
        className='block relative aspect-square w-full overflow-hidden bg-slate-100 shrink-0'
      >
        {product.image && (
          <Image
            className='object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105'
            src={urlForThumb(product.image, 600) || ""}
            alt={productName || "Product Image"}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            quality={85}
            suppressHydrationWarning
          />
        )}

        {isOutOfStock ? (
          <div className='absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-sm'>
            {t("outOfStock")}
          </div>
        ) : product.stock != null && product.stock <= 5 ? (
          <div className='absolute top-3 left-3 bg-amber-500 text-white text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-sm'>
            {t("lastPieces")} ({product.stock})
          </div>
        ) : null}
      </Link>

      <div className='p-3 sm:p-5 lg:p-6 flex flex-col justify-between flex-1 gap-2 sm:gap-4 text-left'>
        <div className='flex flex-col flex-1'>
          <Link href={`/product/${product.slug?.current}`}>
            <h2 className='text-xs sm:text-lg lg:text-xl font-bold text-slate-900 group-hover:text-slate-600 transition-colors line-clamp-1 h-4 sm:h-7'>
              {productName}
            </h2>
          </Link>

          <p className='mt-1 text-[11px] sm:text-sm text-slate-500 line-clamp-1 sm:line-clamp-2 leading-relaxed sm:h-10'>
            {productDesc || "Pièce de la collection DressCode"}
          </p>
        </div>

        <div className='pt-2 sm:pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mt-auto'>
          <div>
            <span className='hidden sm:block text-[10px] text-slate-400 uppercase font-bold tracking-wider'>
              {t("price")}
            </span>
            <span className='text-sm sm:text-xl font-black text-slate-950 tracking-tight'>
              {product.price?.toFixed(2)} €
            </span>
          </div>

          <div className='w-full sm:w-auto'>
            <Link
              href={`/product/${product.slug?.current}`}
              className='w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-bold tracking-tight bg-slate-950 hover:bg-slate-800 text-white transition-all duration-200 active:scale-95 shadow-2xs'
            >
              <span className='truncate'>{t("viewProduct")}</span>
              <ArrowRight className='w-3 h-3 sm:w-4 sm:h-4 shrink-0' />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductThumb;

