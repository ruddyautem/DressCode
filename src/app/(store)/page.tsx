import Banner from "@/components/Banner";
import ProductsViews from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export const dynamic = "force-static";
export const revalidate = 60;

import { Suspense } from "react";
import Loader from "@/components/Loader";

export default async function Home() {
  const products = await getAllProducts();
  const categories = await getAllCategories();

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-4 sm:pb-12 flex flex-col gap-3.5 sm:gap-6'>
        <Banner />

        <Suspense fallback={<Loader />}>
          <ProductsViews products={products} categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}


