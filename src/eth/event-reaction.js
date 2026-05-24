import {ConsoleLogger, EventReactionWorker} from "@drillcoder/voryn";

const logger = new ConsoleLogger({minLevel: "info"});
const handler = async (event) => {
    logger.info("event_received", {
        blockNumber: event.blockNumber,
        index: event.index,
    });

    return event.index === 0 ? 'processed' : 'skipped';
};

const options = {
    dbUrl: process.env.DB_URL,
    logger,
    chainId: Number(process.env.ETH_CHAIN_ID),
    delayBetweenTicksMs: 500,
    workerName: "event-reaction-worker",
    batchSize: 2_500,
    skipFlushInterval: 500,
    handler,
};
const worker = await EventReactionWorker.create(options);

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
