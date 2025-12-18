import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    minimumCacheTTL: 30,
    deviceSizes: [640, 750, 1080],
    imageSizes: [32, 64, 96],
    formats: ["image/webp"],
    qualities: [75, 80], // ✅ ADD THIS LINE
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

export default nextConfig;
