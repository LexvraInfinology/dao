import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config();

export const servicesConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || "equora_default_jwt_secret_dev_key_32_chars",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },
  siwe: {
    nonceTtlSeconds: parseInt(process.env.SIWE_NONCE_TTL_SECONDS || "300", 10),
  },
  blockchain: {
    chainId: parseInt(process.env.CHAIN_ID || process.env.NEXT_PUBLIC_CHAIN_ID || "1000", 10),
    rpcUrl: process.env.RPC_URL || process.env.FULLNODE_URL || process.env.NEXT_PUBLIC_RPC_URL || "https://fullnode-one.trobchain.com",
  },
  price: {
    trobApiUrl: process.env.TROB_PRICE_API_URL || "https://backend.trobchain.com/v1/market/price",
    cacheTtlMs: parseInt(process.env.PRICE_CACHE_TTL_MS || "30000", 10),
    seatEntryUsd: parseFloat(process.env.DAO_SEAT_ENTRY_USD || "300"),
  },
};
