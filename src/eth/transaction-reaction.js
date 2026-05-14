import { ConsoleLogger, TransactionReactionWorker } from "@drillcoder/voryn";

const dbUrl = process.env.DB_URL ?? "postgres://user:pass@postgres:5432/voryn";
const chainId = 1;
const logger = new ConsoleLogger({ minLevel: "info" });
const config = {
  chainId,
  delayBetweenTicksMs: 100,
  workerName: "transaction-reaction-worker",
  batchSize: 1_000,
};
const handler = {
  async handle(tx) {
    logger.info("transaction_received", {
      chainId,
      blockNumber: tx.blockNumber,
      hash: tx.hash,
      txIndex: tx.index,
    });
  },
};
const worker = await TransactionReactionWorker.create({ config, logger, dbUrl, lockKey: 50_000_000n, handler });

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
