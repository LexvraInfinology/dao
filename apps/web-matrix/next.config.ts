import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Allow Cloudflare tunnels, localtunnel, ngrok, and cross-port local access (3000 & 3001)
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.loca.lt",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.ngrok.app",
    "localhost:*",
    "127.0.0.1:*",
    "equorafimatrix.com",
    "equorafidao.com",
  ],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-device-fingerprint",
          },
        ],
      },
    ];
  },
  async rewrites() {
    const backendUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:4000");

    const rewritesList = [
      {
        source: "/api/trob-market/price",
        destination: "https://backend.trobchain.com/v1/market/price",
      },
    ];

    if (backendUrl) {
      rewritesList.unshift({
        source: "/api/matrix/:path*",
        destination: `${backendUrl.replace(/\/+$/, "")}/api/matrix/:path*`,
      });
    }

    return rewritesList;
  },
};

export default nextConfig;
