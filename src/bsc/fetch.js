import {FetchWorker} from "@drillcoder/voryn";

const options = {
    dbUrl: process.env.DB_URL,
    logLevel: "info",
    chainId: Number(process.env.BSC_CHAIN_ID),
    rpcUrl: process.env.BSC_RPC_URL,
    delayBetweenTicksMs: 500,
    fetchBatchSize: 10,
    fetchConcurrency: 5,
    fetchClaimTtlMs: 30_000,
    retryMaxAttempts: 10,
    retryBaseDelayMs: 1_000,
    retryMaxDelayMs: 10_000,
};
const worker = await FetchWorker.create(options);

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
