import {ConsoleLogger, TransactionReactionWorker} from "@drillcoder/voryn";

const logger = new ConsoleLogger({minLevel: "info"});
const handler = async (transaction) => {
    logger.info("transaction_received", {
        blockNumber: transaction.blockNumber,
        index: transaction.index,
    });

    return transaction.index === 0 ? 'processed' : 'skipped';
};

const options = {
    dbUrl: process.env.DB_URL,
    logLevel: "info",
    chainId: Number(process.env.BSC_CHAIN_ID),
    delayBetweenTicksMs: 100,
    workerName: "transaction-reaction-worker",
    batchSize: 2_500,
    skipFlushInterval: 500,
    handler,
};
const worker = await TransactionReactionWorker.create(options);

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
