import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    minimumCacheTTL: 60, // Cache 1 minute only
    deviceSizes: [640, 750, 828, 1080], // Reduced from 5 to 4
    imageSizes: [16, 32, 48, 64, 96], // Reduced from 6 to 5
    formats: ['image/webp'], // WebP only
  },

  compress: true,
  productionBrowserSourceMaps: false,

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@sanity/icons'],
  },

  poweredByHeader: false,
  output: 'standalone',
};

export default nextConfig;