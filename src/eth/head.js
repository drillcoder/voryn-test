import {ConsoleLogger, HeadWorker} from "@drillcoder/voryn";

const config = {
    chainId: Number(process.env.ETH_CHAIN_ID),
    delayBetweenTicksMs: 1_000,
    confirmations: 0,
    depthBlocks: 5_000
};

const logger = new ConsoleLogger({minLevel: "info"});
const dbUrl = process.env.DB_URL;
const rpcUrl = process.env.ETH_RPC_URL;

const worker = await HeadWorker.create({config, logger, dbUrl, rpcUrl});

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
