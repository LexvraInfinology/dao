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
    chainId: parseInt(process.env.CHAIN_ID || "31337", 10),
    rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  },
};
