import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Allow Cloudflare tunnels, localtunnel, and cross-port local access (3000 & 3001)
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt", "localhost:*", "127.0.0.1:*", "equorafimatrix.com", "equorafidao.com"],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-device-fingerprint" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/trob-market/price",
        destination: "https://backend.trobchain.com/v1/market/price",
      },
    ];
  },
};

export default nextConfig;
