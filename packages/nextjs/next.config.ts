/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
  serverExternalPackages: ["@coinbase/cdp-sdk", "@x402/evm"],

  webpack: (config: any) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      "@react-native-async-storage/async-storage": false,
      "react-native": false,
    };
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding",
      "@x402/evm",
      "@coinbase/cdp-sdk"
    );

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

