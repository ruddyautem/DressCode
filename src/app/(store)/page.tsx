import Banner from "@/components/Banner";
import ProductsViews from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export const dynamic = "force-static";
export const revalidate = 60;

import { Suspense } from "react";

export default async function Home() {
  const products = await getAllProducts();
  const categories = await getAllCategories();

  return (
    <div className=''>
      <Banner />
      <div className='flex flex-col items-center justify-top min-h-screen bg-gray-100 p-4'>
        <Suspense fallback={<div>Loading products...</div>}>
          <ProductsViews products={products} categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
