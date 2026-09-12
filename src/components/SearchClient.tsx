"use client";

import ProductGrid from "@/components/ProductGrid";
import SearchCategoryPills from "@/components/SearchCategoryPills";
import Form from "next/form";
import Link from "next/link";
import { Search, ArrowLeft, Frown } from "lucide-react";
import { Category, Product } from "../../sanity.types";
import { useLanguage } from "@/context/LanguageContext";

interface SearchClientProps {
  query: string;
  category: string;
  categories: Category[];
  products: Product[];
}

export default function SearchClient({
  query,
  category,
  categories,
  products,
}: SearchClientProps) {
  const { t, translateCategory } = useLanguage();

  const cleanQuery = query.trim();
  const cleanCategory = category.trim();
  const hasFilter = Boolean(cleanQuery || cleanCategory);

  const activeCategoryObj = categories.find(
    (c: Category) => c.slug?.current === cleanCategory
  );
  const activeCategoryTitle = activeCategoryObj?.title
    ? translateCategory(activeCategoryObj.title, activeCategoryObj.slug?.current)
    : "";

  return (
    <div className='min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Navigation retour */}
        <div className='mb-6'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            {t("backToHome")}
          </Link>
        </div>

        {/* Hero & Barre de recherche */}
        <div className='bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs mb-8 text-center sm:text-left'>
          <h1 className='text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2'>
            {cleanQuery ? (
              <>
                {t("resultsFor")}{" "}
                <span className='text-slate-500'>&ldquo;{cleanQuery}&rdquo;</span>
                {activeCategoryTitle && (
                  <span className='text-slate-400 text-lg sm:text-xl font-medium ml-2'>
                    {t("inCategory")} {activeCategoryTitle}
                  </span>
                )}
              </>
            ) : activeCategoryTitle ? (
              <>
                {t("categoryLabel")} :{" "}
                <span className='text-slate-900'>{activeCategoryTitle}</span>
              </>
            ) : (
              t("searchTitle")
            )}
          </h1>
          <p className='text-slate-500 text-sm mb-6'>
            {t("searchSubtitle")}
          </p>

          <div className='space-y-4 max-w-2xl mx-auto sm:mx-0'>
            <Form action='/search' className='w-full'>
              <div className='relative group'>
                <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors' />
                <input
                  type='text'
                  name='query'
                  defaultValue={cleanQuery}
                  placeholder={t("searchInputPlaceholder")}
                  className='w-full bg-slate-100/90 focus:bg-white text-slate-950 text-base pl-12 pr-4 py-3.5 rounded-2xl border border-transparent focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none'
                />
                {cleanCategory && (
                  <input type='hidden' name='category' value={cleanCategory} />
                )}
              </div>
            </Form>

            {/* Filtres de catégories rapides */}
            <SearchCategoryPills
              categories={categories}
              activeCategory={cleanCategory}
              query={cleanQuery}
            />
          </div>
        </div>

        {/* Résultats ou Empty State */}
        {!hasFilter ? (
          <div className='bg-white rounded-3xl p-12 text-center border border-slate-200/80'>
            <Search className='w-12 h-12 text-slate-300 mx-auto mb-4' />
            <h3 className='text-lg font-bold text-slate-900'>{t("enterSearch")}</h3>
            <p className='text-slate-500 text-sm mt-1 max-w-sm mx-auto'>
              {t("enterSearchDesc")}
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className='bg-white rounded-3xl p-12 text-center border border-slate-200/80 max-w-2xl mx-auto'>
            <Frown className='w-12 h-12 text-slate-300 mx-auto mb-4' />
            <h3 className='text-xl font-bold text-slate-900 mb-2'>
              {t("noResultsFor")} {cleanQuery ? `\u201C${cleanQuery}\u201D` : ""}
              {activeCategoryTitle ? ` ${t("inCategory")} ${activeCategoryTitle}` : ""}
            </h3>
            <p className='text-slate-500 text-sm mb-6'>
              {t("noResultsDesc")}
            </p>
            <div className='flex flex-wrap items-center justify-center gap-3'>
              <Link
                href='/search'
                className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition-all'
              >
                {t("resetFilters")}
              </Link>
              <Link
                href='/'
                className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 text-slate-900 text-sm font-semibold hover:bg-slate-200 transition-all'
              >
                {t("viewAllCatalog")}
              </Link>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                {products.length}{" "}
                {t("resultsFound")}
              </span>
            </div>
            <ProductGrid products={products} />
          </div>
        )}
      </div>
    </div>
  );
}
