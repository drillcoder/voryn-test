import { ConsoleLogger, FetchWorker } from "@drillcoder/voryn";

const dbUrl = process.env.DB_URL ?? "postgres://user:pass@postgres:5432/voryn";
const rpcUrl = "https://ethereum-rpc.publicnode.com";
const chainId = 1;
const logger = new ConsoleLogger({ minLevel: "info" });
const config = {
  chainId,
  delayBetweenTicksMs: Number(process.env.FETCH_DELAY_MS ?? 100),
  fetchBatchSize: Number(process.env.FETCH_BATCH_SIZE ?? 10),
  fetchClaimTtlMs: Number(process.env.FETCH_CLAIM_TTL_MS ?? 125_000),
  retryMaxAttempts: Number(process.env.RETRY_MAX_ATTEMPTS ?? 10),
  retryBaseDelayMs: Number(process.env.RETRY_BASE_DELAY_MS ?? 1_000),
  retryMaxDelayMs: Number(process.env.RETRY_MAX_DELAY_MS ?? 10_000),
};

const worker = await FetchWorker.create({ config, logger, dbUrl, rpcUrl });

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
