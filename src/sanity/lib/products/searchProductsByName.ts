import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const searchProductsByName = async (searchParam: string) => {
  const PRODUCT_SEARCH_QUERY = defineQuery(`
    *[_type == 'product' && name match $searchParam] | order(name asc) {
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
      query: PRODUCT_SEARCH_QUERY,
      params: { searchParam: `${searchParam}*` }, // Added wildcard for better search
    });
    return products || [];
  } catch (error) {
    console.log("Error fetching products by name:", error);
    return [];
  }
};