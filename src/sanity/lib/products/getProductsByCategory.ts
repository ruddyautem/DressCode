import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getProductsByCategory = async (categorySlug: string) => {
  const PRODUCTS_BY_CATEGORY_QUERY = defineQuery(`
    *[_type == 'product' && references(*[_type == 'category' && slug.current == $categorySlug]._id)] | order(name asc) {
      _id,
      _type,
      name,
      slug,
      price,
      "image": image.asset->url,
      "images": images[].asset->url,
      stock,
      description
    }
  `);

  try {
    const products = await sanityFetch({
      query: PRODUCTS_BY_CATEGORY_QUERY,
      params: { categorySlug },
    });
    return products || [];
  } catch (error) {
    console.log("Error fetching products by category", error);
    return [];
  }
};