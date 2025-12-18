import { createClient } from "next-sanity";
import { createImageUrlBuilder, SanityImageSource } from "@sanity/image-url";

export const imageClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: true,
});

const builder = createImageUrlBuilder(imageClient);

// 🎯 Default with optimization - Returns URL string
export function urlFor(source: SanityImageSource): string | null {
  if (!source) return null;

  return builder.image(source).auto("format").fit("max").quality(80).url();
}

// 🎯 For product thumbnails (grid view) - Returns URL string
export function urlForThumb(
  source: SanityImageSource,
  width = 400
): string | null {
  if (!source) return null;

  return builder
    .image(source)
    .width(width)
    .height(width)
    .auto("format")
    .fit("crop")
    .quality(75)
    .url();
}

// 🎯 For product detail pages - Returns URL string
export function urlForProduct(
  source: SanityImageSource,
  width = 800
): string | null {
  if (!source) return null;

  return builder
    .image(source)
    .width(width)
    .auto("format")
    .fit("max")
    .quality(80)
    .url();
}

// Backward compatibility
export const urlForImage = urlFor;
export const imageUrl = urlFor;
