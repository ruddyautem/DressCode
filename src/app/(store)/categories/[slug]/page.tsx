import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getProductsByCategory } from "@/sanity/lib/products/getProductsByCategory";
import { Metadata } from "next";
import CategoryClient from "@/components/CategoryClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `Collection ${title} | DressCode`,
    description: `Découvrez notre collection exclusive de ${title} sur DressCode.`,
  };
}

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const products = await getProductsByCategory(slug);
  const categories = await getAllCategories();

  return (
    <CategoryClient
      slug={slug}
      products={products}
      categories={categories}
    />
  );
};

export default CategoryPage;


