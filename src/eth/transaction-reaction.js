import {ConsoleLogger, TransactionReactionWorker} from "@drillcoder/voryn";

const config = {
    chainId: Number(process.env.ETH_CHAIN_ID),
    delayBetweenTicksMs: 500,
    workerName: "transaction-reaction-worker",
    batchSize: 500,
    skipFlushInterval: 100,
};

const logger = new ConsoleLogger({minLevel: "info"});
const dbUrl = process.env.DB_URL;

const handler = {
    async handle(transaction) {
        logger.info("transaction_received", {
            blockNumber: transaction.blockNumber,
            index: transaction.index,
        });

        return transaction.index === 0 ? 'processed' : 'skipped';
    },
};

const worker = await TransactionReactionWorker.create({config, logger, dbUrl, handler});

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
