import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllProducts = async () => {
  const ALL_PRODUCTS_QUERY = defineQuery(`
    *[_type == 'product'] | order(name asc) {
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
      query: ALL_PRODUCTS_QUERY,
    });
    
    return products || [];
  } catch (error) {
    console.log("Error fetching all products:", error);
    return [];
  }
};