import {ConsoleLogger, EventReactionWorker} from "@drillcoder/voryn";

const config = {
    chainId: Number(process.env.BSC_CHAIN_ID),
    delayBetweenTicksMs: 100,
    workerName: "event-reaction-worker",
    batchSize: 10_000,
};

const logger = new ConsoleLogger({minLevel: "info"});
const dbUrl = process.env.DB_URL;
const lockKey = 102n;

let processed = 0;
let lastProcessed = 0;
let lastTs = Date.now();

setInterval(() => {
    const now = Date.now();
    const delta = processed - lastProcessed;
    const seconds = (now - lastTs) / 1000;

    logger.info("event_reaction_rate", {
        chainId: config.chainId,
        workerName: config.workerName,
        processedTotal: processed,
        processedPerSecond: delta / seconds,
    });

    lastProcessed = processed;
    lastTs = now;
}, 5_000).unref();

const handler = {
    async handle(event) {
        processed += 1;
    },
};

const worker = await EventReactionWorker.create({config, logger, dbUrl, lockKey, handler});

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
