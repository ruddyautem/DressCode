import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { urlForProduct } from "@/lib/imageUrl";
import ProductDetailClient from "@/components/ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produit non trouvé | DressCode" };
  }

  return {
    title: `${product.name} | DressCode`,
    description: `Achetez ${product.name} sur DressCode. Pièce d'exception sélectionnée par Ruddy Autem.`,
    openGraph: {
      images: product.image ? [urlForProduct(product.image, 1200) || ""] : [],
    },
  };
}

export const dynamic = "force-static";
export const revalidate = 60;

const ProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  return <ProductDetailClient product={product} />;
};

export default ProductPage;


