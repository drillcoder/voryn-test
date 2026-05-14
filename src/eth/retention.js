import {ConsoleLogger, RetentionWorker} from "@drillcoder/voryn";

const config = {
    chainId: Number(process.env.ETH_CHAIN_ID),
    delayBetweenTicksMs: 60_000,
    retentionDepthBlocks: 7_200,
};

const logger = new ConsoleLogger({minLevel: "info"});
const dbUrl = process.env.DB_URL;

const worker = await RetentionWorker.create({config, logger, dbUrl});

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
