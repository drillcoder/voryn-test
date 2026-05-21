import {ConsoleLogger, FetchWorker} from "@drillcoder/voryn";

const config = {
    chainId: Number(process.env.BSC_CHAIN_ID),
    delayBetweenTicksMs: 300,
    fetchBatchSize: 20,
    fetchConcurrency: 5,
    fetchClaimTtlMs: 30_000,
    retryMaxAttempts: 10,
    retryBaseDelayMs: 1_000,
    retryMaxDelayMs: 10_000,
};

const logger = new ConsoleLogger({minLevel: "debug"});
const dbUrl = process.env.DB_URL;
const rpcUrl = process.env.BSC_RPC_URL;

const worker = await FetchWorker.create({config, logger, dbUrl, rpcUrl});

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
