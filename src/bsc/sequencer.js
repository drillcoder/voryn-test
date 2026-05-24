import {ConsoleLogger, SequencerWorker} from "@drillcoder/voryn";

const options = {
    dbUrl: process.env.DB_URL,
    logLevel: "info",
    chainId: Number(process.env.BSC_CHAIN_ID),
    rpcUrl: process.env.BSC_RPC_URL,
    delayBetweenTicksMs: 500,
    maxBlocksPerTick: 5,
};

const logger = new ConsoleLogger({minLevel: "info"});
const dbUrl = process.env.DB_URL;
const rpcUrl = process.env.BSC_RPC_URL;

const worker = await SequencerWorker.create(options);

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
