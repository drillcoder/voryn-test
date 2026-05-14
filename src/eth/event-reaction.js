import {ConsoleLogger, EventReactionWorker} from "@drillcoder/voryn";

const config = {
    chainId: Number(process.env.ETH_CHAIN_ID),
    delayBetweenTicksMs: 500,
    workerName: "event-reaction-worker",
    batchSize: 2_500,
};

const logger = new ConsoleLogger({minLevel: "info"});
const dbUrl = process.env.DB_URL;
const lockKey = 2n;

const handler = {
    async handle(event) {
        logger.info("event_received", {
            blockNumber: event.blockNumber,
            index: event.index,
        });
    },
};

const worker = await EventReactionWorker.create({config, logger, dbUrl, lockKey, handler});

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
