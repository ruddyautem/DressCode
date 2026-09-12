"use client";

import ProductsViews from "@/components/ProductsView";
import { Category, Product } from "../../sanity.types";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CategoryClientProps {
  slug: string;
  products: Product[];
  categories: Category[];
}

export default function CategoryClient({
  slug,
  products,
  categories,
}: CategoryClientProps) {
  const { t, translateCategory } = useLanguage();

  const currentCategory = categories.find((c) => c.slug?.current === slug);
  const fallbackTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const categoryName = translateCategory(currentCategory?.title || fallbackTitle, slug);

  return (
    <div className='min-h-screen bg-slate-50 py-3 sm:py-8 px-3 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Navigation retour */}
        <div className='mb-3 sm:mb-6'>
          <Link
            href='/'
            className='inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors'
          >
            <ArrowLeft className='w-3.5 h-3.5' />
            {t("backToCollections")}
          </Link>
        </div>

        {/* En-tête éditorial épuré dans le même style que la page d'accueil */}
        <div className='mb-3 sm:mb-6 text-left'>
          <div className='flex items-center justify-between border-b border-slate-200/80 pb-2.5 sm:pb-4'>
            <div>
              <span className='text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5'>
                <Sparkles className='w-3 h-3 text-slate-900' />
                {t("dedicatedCollection")}
              </span>
              <h1 className='text-xl sm:text-3xl font-black text-slate-900 tracking-tight'>
                {categoryName}
              </h1>
            </div>

            <span className='text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs shrink-0'>
              {products.length} {products.length > 1 ? t("piecesPlural") : t("pieces")}
            </span>
          </div>
        </div>

        {/* Vue des produits */}
        <ProductsViews products={products} categories={categories} />
      </div>
    </div>
  );
}
