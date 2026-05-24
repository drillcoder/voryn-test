import {HeadWorker} from "@drillcoder/voryn";

const options = {
    dbUrl: process.env.DB_URL,
    logLevel: "info",
    chainId: Number(process.env.BSC_CHAIN_ID),
    rpcUrl: process.env.BSC_RPC_URL,
    delayBetweenTicksMs: 1_000,
    confirmations: 0,
    depthBlocks: 50_000
};
const worker = await HeadWorker.create(options);

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
