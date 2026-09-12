"use client";

import { Category, Product } from "../../sanity.types";
import ProductGrid from "./ProductGrid";
import CategorySelectorComponent from "./ui/category-selector";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
}

const ProductsViews = ({ products, categories }: ProductsViewProps) => {
  const pathname = usePathname();
  const { t, translateCategory } = useLanguage();

  return (
    <div className='flex flex-col gap-3.5 sm:gap-6 w-full max-w-7xl mx-auto'>
      {/* Titre éditorial bilingue sur la page principale */}
      {pathname === "/" && (
        <div className='mb-1 sm:mb-2 text-left'>
          <div className='flex items-center justify-between border-b border-slate-200/80 pb-2.5 sm:pb-4'>
            <div>
              <span className='text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase'>
                {t("signatureSelection")}
              </span>
              <h1 className='text-xl sm:text-3xl font-black text-slate-900 tracking-tight'>
                {t("catalog")}
              </h1>
            </div>
            <span className='text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs'>
              {products.length} {products.length > 1 ? t("piecesPlural") : t("pieces")}
            </span>
          </div>
        </div>
      )}

      {/* Barre d'outils / Filtres rapides */}
      <div className='flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4 bg-white/90 backdrop-blur-sm p-2 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs'>
        {/* Pills de toutes les catégories : toutes visibles sans overflow */}
        <div className='flex flex-wrap items-center justify-start gap-1.5 sm:gap-2 w-full md:w-auto'>
          <Link
            href='/'
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 ${
              pathname === "/"
                ? "bg-slate-950 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {t("allArticles")}
          </Link>

          {categories.map((cat) => {
            const isActive = pathname === `/categories/${cat.slug?.current}`;
            const catTitle = translateCategory(cat.title, cat.slug?.current);

            return (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug?.current}`}
                className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-slate-950 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {catTitle}
              </Link>
            );
          })}
        </div>

        {/* Dropdown sélecteur & Compteur desktop */}
        <div className='hidden md:flex items-center justify-between w-full md:w-auto gap-4 self-stretch md:self-auto'>
          <div className='w-full sm:w-auto'>
            <CategorySelectorComponent categories={categories} />
          </div>
        </div>
      </div>

      {/* Grille de produits */}
      <div className='w-full'>
        {products.length === 0 ? (
          <div className='text-center py-20 bg-white rounded-2xl border border-slate-200 p-8'>
            <SlidersHorizontal className='w-10 h-10 text-slate-300 mx-auto mb-3' />
            <h3 className='text-lg font-bold text-slate-900'>{t("noProducts")}</h3>
            <p className='text-sm text-slate-500 mt-1'>
              Cette collection ne contient actuellement aucun produit disponible.
            </p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
};

export default ProductsViews;


