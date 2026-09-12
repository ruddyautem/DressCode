"use client";

import Link from "next/link";
import { Category } from "../../sanity.types";
import { useLanguage } from "@/context/LanguageContext";

interface SearchCategoryPillsProps {
  categories: Category[];
  activeCategory?: string;
  query?: string;
}

export default function SearchCategoryPills({
  categories,
  activeCategory = "",
  query = "",
}: SearchCategoryPillsProps) {
  const { t, translateCategory } = useLanguage();

  return (
    <div className='flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1'>
      {/* Bouton "Tous les articles" */}
      <Link
        href={query ? `/search?query=${encodeURIComponent(query)}` : "/search"}
        className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
          !activeCategory
            ? "bg-slate-950 text-white shadow-xs"
            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
        }`}
      >
        {t("allArticles")}
      </Link>

      {/* Boutons pour chaque catégorie */}
      {categories.map((cat) => {
        const slug = cat.slug?.current || "";
        const isActive = activeCategory.toLowerCase() === slug.toLowerCase();
        const catTitle = translateCategory(cat.title, slug);

        // Si on clique sur la catégorie active, on la désélectionne
        const targetHref = isActive
          ? query
            ? `/search?query=${encodeURIComponent(query)}`
            : "/search"
          : query
          ? `/search?query=${encodeURIComponent(query)}&category=${encodeURIComponent(slug)}`
          : `/search?category=${encodeURIComponent(slug)}`;

        return (
          <Link
            key={cat._id}
            href={targetHref}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
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
  );
}
