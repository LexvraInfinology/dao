import { createPublicClient, http, parseAbi } from "viem";

const AGGREGATOR_V3_ABI = parseAbi([
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() external view returns (uint8)",
]);

export interface PriceData {
  priceUsd: number;
  priceSource: "onchain" | "offchain-estimate";
  updatedAt: Date;
  isStale: boolean;
}

export class PriceService {
  private client: ReturnType<typeof createPublicClient> | null = null;
  private chainlinkFeedAddress: `0x${string}` | null = null;
  private defaultBttPrice = 1.0; // $1.00 base standard

  constructor() {
    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
    const feed = process.env.CHAINLINK_BTT_USD_FEED as `0x${string}` | undefined;

    if (feed && /^0x[0-9a-fA-F]{40}$/.test(feed)) {
      this.chainlinkFeedAddress = feed;
      this.client = createPublicClient({
        transport: http(rpcUrl),
      });
    }
  }

  /**
   * @dev Fetch live price from on-chain Chainlink feed with staleness validation.
   *      Falls back gracefully to offchain estimate if feed is missing, reverted, or stale.
   */
  async getBttUsdPrice(): Promise<PriceData> {
    if (this.client && this.chainlinkFeedAddress) {
      try {
        const [roundData, decimals] = await Promise.all([
          this.client.readContract({
            address: this.chainlinkFeedAddress,
            abi: AGGREGATOR_V3_ABI,
            functionName: "latestRoundData",
          }),
          this.client.readContract({
            address: this.chainlinkFeedAddress,
            abi: AGGREGATOR_V3_ABI,
            functionName: "decimals",
          }),
        ]);

        const [, answer, , updatedAt] = roundData;
        const nowSeconds = Math.floor(Date.now() / 1000);
        const updatedSeconds = Number(updatedAt);
        const isStale = updatedSeconds === 0 || nowSeconds - updatedSeconds > 3600; // Stale if > 1 hour

        if (!isStale && answer > 0n) {
          const formattedPrice = Number(answer) / 10 ** decimals;
          return {
            priceUsd: formattedPrice,
            priceSource: "onchain",
            updatedAt: new Date(updatedSeconds * 1000),
            isStale: false,
          };
        }
      } catch (err) {
        // Fall through to offchain estimate
      }
    }

    // Labeled off-chain fallback
    return {
      priceUsd: this.defaultBttPrice,
      priceSource: "offchain-estimate",
      updatedAt: new Date(),
      isStale: false,
    };
  }
}

export const priceService = new PriceService();
