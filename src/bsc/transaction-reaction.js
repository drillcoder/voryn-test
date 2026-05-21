import {ConsoleLogger, TransactionReactionWorker} from "@drillcoder/voryn";

const config = {
    chainId: Number(process.env.BSC_CHAIN_ID),
    delayBetweenTicksMs: 100,
    workerName: "transaction-reaction-worker",
    batchSize: 2_500,
    skipFlushInterval: 500,
};

const logger = new ConsoleLogger({minLevel: "info"});
const dbUrl = process.env.DB_URL;

const handler = {
    async handle(tx) {
        logger.info("transaction_received", {
            blockNumber: tx.blockNumber,
            index: tx.index,
        });

        return event.index === 0 ? 'processed' : 'skipped';
    },
};

const worker = await TransactionReactionWorker.create({config, logger, dbUrl, handler});

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
