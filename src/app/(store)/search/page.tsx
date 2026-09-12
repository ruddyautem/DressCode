import { searchProductsByName } from "@/sanity/lib/products/searchProductsByName";
import { getProductsByCategory } from "@/sanity/lib/products/getProductsByCategory";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { Product } from "../../../../sanity.types";
import SearchClient from "@/components/SearchClient";

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

  return (
    <SearchClient
      query={cleanQuery}
      category={cleanCategory}
      categories={categories}
      products={products}
    />
  );
};

export default SearchPage;


