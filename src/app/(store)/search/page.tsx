import ProductGrid from "@/components/ProductGrid";
import { searchProductsByName } from "@/sanity/lib/products/searchProductsByName";

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ query: string }>;
}) => {
  const { query } = await searchParams;

  const products = await searchProductsByName(query);

  if (!products.length) {
    return (
      <div className='flex flex-col items-center justify-start min-h-screen bg-gray-50 p-4 pt-12'>
        <div className='bg-white p-12 rounded-xl shadow-sm w-full max-w-3xl text-center border border-gray-100'>
          <h1 className='text-3xl font-bold mb-4 text-gray-900'>
            Aucun article trouvé pour <span className='text-blue-500'>&quot;{query}&quot;</span>
          </h1>
          <p className='text-gray-500 text-lg'>
            Nous n&apos;avons trouvé aucun résultat. Essayez à nouveau avec un autre terme de recherche.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-start min-h-screen bg-gray-50 p-4 pt-8'>
      <div className='bg-white p-8 rounded-xl shadow-sm w-full max-w-7xl mb-8 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4'>
        <div className='text-center sm:text-left'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Résultats pour <span className='text-blue-500'>&quot;{query}&quot;</span>
          </h1>
          <p className='text-gray-500 mt-2'>
            Nous avons trouvé {products.length} article{products.length > 1 ? 's' : ''} correspondant{products.length > 1 ? 's' : ''} à votre recherche.
          </p>
        </div>
      </div>
      
      <div className='w-full max-w-7xl'>
        <ProductGrid products={products} />
      </div>
    </div>
  );
};

export default SearchPage;
