import {ConsoleLogger, TransactionReactionWorker} from "@drillcoder/voryn";

const config = {
    chainId: Number(process.env.BSC_CHAIN_ID),
    delayBetweenTicksMs: 100,
    workerName: "transaction-reaction-worker",
    batchSize: 2_000,
};

const logger = new ConsoleLogger({minLevel: "info"});
const dbUrl = process.env.DB_URL;
const lockKey = 101n;

const handler = {
    async handle(tx) {
        logger.info("transaction_received", {
            blockNumber: tx.blockNumber,
            index: tx.index,
        });
    },
};

const worker = await TransactionReactionWorker.create({config, logger, dbUrl, lockKey, handler});

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
