import {RetentionWorker} from "@drillcoder/voryn";

const options = {
    dbUrl: process.env.DB_URL,
    logLevel: "info",
    chainId: Number(process.env.ETH_CHAIN_ID),
    delayBetweenTicksMs: 60_000,
    retentionDepthBlocks: 7_200,
};
const worker = await RetentionWorker.create(options);

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
