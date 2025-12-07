import "server-only";
import { client } from "./client";

// Server-side token for live/preview content
const token = process.env.SANITY_API_READ_TOKEN;
if (!token && process.env.NODE_ENV !== "production") {
  console.warn("SANITY_API_READ_TOKEN is missing. Live/preview features may not work.");
}

const previewClient = client.withConfig({
  token,
  useCdn: false, // Disable CDN for real-time updates
  stega: {
    enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" || process.env.NODE_ENV === "development",
    studioUrl: "/studio",
  },
});

// Main sanityFetch function - replaces defineLive behavior
export async function sanityFetch<T = any>({
  query,
  params = {},
  tags = [],
  preview = false, // Optional: true for draft/preview mode
}: {
  query: string;
  params?: Record<string, any>;
  tags?: string[];
  preview?: boolean;
}): Promise<T> {
  const perspective = preview ? "preview" : "published";
  const actualClient = previewClient.withConfig({ perspective });
  
  console.log("sanityFetch called:", { query, preview, perspective });
  
  const result = await actualClient.fetch<T>(query, params, {
    next: {
      revalidate: preview ? 1 : (process.env.NODE_ENV === "development" ? 30 : 3600),
      tags,
    },
  });
  
  console.log("sanityFetch result:", { query, result: result?.length || result });
  
  return result;
}

// Dummy SanityLive component (required for backward compatibility)
export function SanityLive() {
  return null;
}