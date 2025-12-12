import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";

// Use the same client config as your sanity client
export const imageClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: true, // ✅ Good - uses Sanity's CDN
});

const builder = createImageUrlBuilder(imageClient);

// 🎯 OPTIMIZED: Default with auto-format & reasonable sizing
export function urlFor(source: any) {
  return builder
    .image(source)
    .auto("format") // Auto WebP/AVIF for modern browsers
    .fit("max") // Don't crop, just fit
    .quality(85); // Good quality, smaller size
}

// 🎯 OPTIMIZED: For product thumbnails (grid view)
export function urlForThumb(source: any, width = 600) {
  return builder
    .image(source)
    .width(width)
    .height(width) // Square aspect
    .auto("format")
    .fit("crop")
    .quality(80); // Slightly lower for thumbs
}

// 🎯 OPTIMIZED: For product detail pages
export function urlForProduct(source: any, width = 1200) {
  return builder
    .image(source)
    .width(width)
    .auto("format")
    .fit("max")
    .quality(85);
}

// Generic image URL (backward compatibility)
export function urlForImage(source: any) {
  return urlFor(source);
}

// Backward compatibility export
export const imageUrl = urlFor;
