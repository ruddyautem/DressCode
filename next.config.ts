import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],

    // Sanity image URLs are immutable, so cache them for 1 year.
    minimumCacheTTL: 31536000,

    deviceSizes: [640, 750, 1080],
    imageSizes: [32, 64, 96],

    formats: ["image/webp"],

    // Qualities used by next/image in the application.
    qualities: [75, 80, 85],
  },

  compress: true,

  productionBrowserSourceMaps: false,

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@sanity/icons"],
  },

  poweredByHeader: false,

  output: "standalone",
};

export default withNextIntl(nextConfig);
