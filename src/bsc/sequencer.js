import {ConsoleLogger, SequencerWorker} from "@drillcoder/voryn";

const config = {
    chainId: Number(process.env.BSC_CHAIN_ID),
    delayBetweenTicksMs: 500,
    maxBlocksPerTick: 5,
};

const logger = new ConsoleLogger({minLevel: "info"});
const dbUrl = process.env.DB_URL;
const rpcUrl = process.env.BSC_RPC_URL;

const worker = await SequencerWorker.create({config, logger, dbUrl, rpcUrl});

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
