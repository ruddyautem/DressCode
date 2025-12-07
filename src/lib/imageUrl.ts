import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";

// Use the same client config as your sanity client
export const imageClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: true,
});

const builder = createImageUrlBuilder(imageClient);

export function urlFor(source: any) {
  return builder.image(source);
}

export function urlForImage(source: any) {
  return builder.image(source).auto("format").fit("max");
}

// Backward compatibility export (update your components later)
export const imageUrl = urlFor;