import {FetchWorker} from "@drillcoder/voryn";

const options = {
    dbUrl: process.env.DB_URL,
    logLevel: "info",
    chainId: Number(process.env.ETH_CHAIN_ID),
    rpcUrl: process.env.ETH_RPC_URL,
    delayBetweenTicksMs: 1_000,
    fetchBatchSize: 5,
    fetchConcurrency: 1,
    fetchClaimTtlMs: 30_000,
    retryMaxAttempts: 10,
    retryBaseDelayMs: 1_000,
    retryMaxDelayMs: 10_000,
};
const worker = await FetchWorker.create(options);

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
