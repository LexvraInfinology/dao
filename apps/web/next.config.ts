import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname, "../../"),

  // Required for RainbowKit v2 + @vanilla-extract to work with Next.js 15
  // Without this, sprinkles CSS-in-JS atoms throw "invalid border=0" on SSR
  transpilePackages: [
    "@rainbow-me/rainbowkit",
    "@vanilla-extract/sprinkles",
    "@vanilla-extract/css",
    "@vanilla-extract/dynamic",
    "@vanilla-extract/recipes",
  ],

  // Tell Next.js not to bundle these server-only packages
  serverExternalPackages: [
    "@coinbase/cdp-sdk",
    "@x402/evm",
    "pino-pretty",
    "lokijs",
    "encoding",
  ],

  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
      ],
    },
  ],

  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      "@react-native-async-storage/async-storage": false,
      "react-native": false,
    };

    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push(
        "pino-pretty",
        "lokijs",
        "encoding",
        "@x402/evm",
        "@coinbase/cdp-sdk"
      );
    }

    // Resolve problematic nested imports
    config.resolve.alias = {
      ...config.resolve.alias,
      // MetaMask SDK tries to import react-native storage — ignore it in browser
      "@react-native-async-storage/async-storage": false,
      "react-native": false,
      // x402 sub-path that doesn't exist
      "@x402/evm/upto/client": false,
    };

    return config;
  },
};

export default nextConfig;

