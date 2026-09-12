import ProductGrid from "@/components/ProductGrid";
import { searchProductsByName } from "@/sanity/lib/products/searchProductsByName";
import { getProductsByCategory } from "@/sanity/lib/products/getProductsByCategory";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import SearchCategoryPills from "@/components/SearchCategoryPills";
import Form from "next/form";
import Link from "next/link";
import { Search, ArrowLeft, Frown } from "lucide-react";
import { Category, Product } from "../../../../sanity.types";

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; category?: string }>;
}) => {
  const { query = "", category = "" } = await searchParams;
  const cleanQuery = query.trim();
  const cleanCategory = category.trim();

  // Récupération simultanée des catégories pour les filtres et des produits correspondants
  const categoriesPromise = getAllCategories();

  let productsPromise: Promise<Product[]>;

  if (cleanQuery && cleanCategory) {
    // Si recherche texte + filtre catégorie actif
    productsPromise = (async () => {
      const [bySearch, byCat] = await Promise.all([
        searchProductsByName(cleanQuery),
        getProductsByCategory(cleanCategory),
      ]);
      const catIds = new Set(byCat.map((p: Product) => p._id));
      return bySearch.filter((p: Product) => catIds.has(p._id));
    })();
  } else if (cleanQuery) {
    // Recherche par mot-clé uniquement
    productsPromise = searchProductsByName(cleanQuery);
  } else if (cleanCategory) {
    // Filtrage par catégorie directement depuis la recherche
    productsPromise = getProductsByCategory(cleanCategory);
  } else {
    productsPromise = Promise.resolve([]);
  }

  const [categories, products] = await Promise.all([
    categoriesPromise,
    productsPromise,
  ]);

  const hasFilter = Boolean(cleanQuery || cleanCategory);
  const activeCategoryObj = (categories as Category[]).find(
    (c: Category) => c.slug?.current === cleanCategory
  );

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
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Hero & Barre de recherche */}
        <div className='bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs mb-8 text-center sm:text-left'>
          <h1 className='text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2'>
            {cleanQuery ? (
              <>
                Résultats pour <span className='text-slate-500'>&ldquo;{cleanQuery}&rdquo;</span>
                {activeCategoryObj?.title && (
                  <span className='text-slate-400 text-lg sm:text-xl font-medium ml-2'>
                    dans {activeCategoryObj.title}
                  </span>
                )}
              </>
            ) : activeCategoryObj?.title ? (
              <>
                Catégorie : <span className='text-slate-900'>{activeCategoryObj.title}</span>
              </>
            ) : (
              "Rechercher une pièce"
            )}
          </h1>
          <p className='text-slate-500 text-sm mb-6'>
            Trouvez les créations parfaites parmi tout notre vestiaire.
          </p>

          <div className='space-y-4 max-w-2xl mx-auto sm:mx-0'>
            <Form action='/search' className='w-full'>
              <div className='relative group'>
                <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors' />
                <input
                  type='text'
                  name='query'
                  defaultValue={cleanQuery}
                  placeholder='T-shirt, Hoodie, Veste, Pantalon...'
                  className='w-full bg-slate-100/90 focus:bg-white text-slate-950 text-base pl-12 pr-4 py-3.5 rounded-2xl border border-transparent focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none'
                />
                {cleanCategory && (
                  <input type='hidden' name='category' value={cleanCategory} />
                )}
              </div>
            </Form>

            {/* Filtres de catégories rapides (Tous les articles, T-shirts, Baskets, etc.) */}
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
            <h3 className='text-lg font-bold text-slate-900'>Entrez votre recherche ou choisissez un filtre</h3>
            <p className='text-slate-500 text-sm mt-1 max-w-sm mx-auto'>
              Tapez le nom d&apos;un article ou sélectionnez une catégorie ci-dessus pour afficher notre sélection.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className='bg-white rounded-3xl p-12 text-center border border-slate-200/80 max-w-2xl mx-auto'>
            <Frown className='w-12 h-12 text-slate-300 mx-auto mb-4' />
            <h3 className='text-xl font-bold text-slate-900 mb-2'>
              Aucun article trouvé {cleanQuery ? `pour “${cleanQuery}”` : ""}
              {activeCategoryObj?.title ? ` dans ${activeCategoryObj.title}` : ""}
            </h3>
            <p className='text-slate-500 text-sm mb-6'>
              Vérifiez l&apos;orthographe de votre mot-clé ou découvrez l&apos;intégralité de nos pièces disponibles.
            </p>
            <Link
              href='/search'
              className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition-all mr-3'
            >
              Réinitialiser les filtres
            </Link>
            <Link
              href='/'
              className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 text-slate-900 text-sm font-semibold hover:bg-slate-200 transition-all'
            >
              Voir tout le catalogue
            </Link>
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                {products.length} résultat{products.length > 1 ? "s" : ""} trouvé{products.length > 1 ? "s" : ""}
              </span>
            </div>
            <ProductGrid products={products} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;


