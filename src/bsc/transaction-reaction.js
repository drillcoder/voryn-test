import {ConsoleLogger, PostgresTransactionsRepository} from "@drillcoder/voryn";
import {startBatchedReactionWorker} from "./batched-reaction-worker.js";

const config = {
    chainId: Number(process.env.BSC_CHAIN_ID),
    delayBetweenTicksMs: 100,
    workerName: "transaction-reaction-worker",
    batchSize: 2_000,
};

const logger = new ConsoleLogger({minLevel: "info"});
const dbUrl = process.env.DB_URL;
const lockKey = 101n;

let processed = 0;
let lastProcessed = 0;
let lastTs = Date.now();

setInterval(() => {
    const now = Date.now();
    const delta = processed - lastProcessed;
    const seconds = (now - lastTs) / 1000;

    logger.info("transaction_reaction_rate", {
        chainId: config.chainId,
        workerName: config.workerName,
        processedTotal: processed,
        processedPerSecond: delta / seconds,
    });

    lastProcessed = processed;
    lastTs = now;
}, 5_000).unref();

const handler = {
    async handle(tx) {
        processed += 1;
    },
};

await startBatchedReactionWorker({
    config,
    logger,
    dbUrl,
    lockKey,
    streamType: "tx",
    sourceName: "transaction",
    repositoryFactory: (pool) => new PostgresTransactionsRepository(pool),
    listAfterPosition: (repository, chainId, maxBlockNumber, position, limit) => (
        repository.listAfterPosition(
            chainId,
            maxBlockNumber,
            position.lastBlockNumber,
            position.lastTransactionIndex,
            limit
        )
    ),
    initialPosition: (lastCommittedBlock) => ({
        lastBlockNumber: lastCommittedBlock,
        lastTransactionIndex: -1,
    }),
    toPosition: (tx) => ({
        lastBlockNumber: tx.blockNumber,
        lastTransactionIndex: tx.index,
    }),
    handler,
});
