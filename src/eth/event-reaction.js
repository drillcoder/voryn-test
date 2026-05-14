import { ConsoleLogger, EventReactionWorker } from "@drillcoder/voryn";

const dbUrl = process.env.DB_URL ?? "postgres://user:pass@postgres:5432/voryn";
const chainId = 1;
const logger = new ConsoleLogger({ minLevel: "info" });
const config = {
  chainId,
  delayBetweenTicksMs: 100,
  workerName: "event-reaction-worker",
  batchSize: 5_000,
};
const handler = {
  async handle(event) {
    logger.info("event_received", {
      chainId,
      blockNumber: event.blockNumber,
      txHash: event.transactionHash,
      logIndex: event.index,
    });
  },
};
const worker = await EventReactionWorker.create({ config, logger, dbUrl, lockKey: 40_000_000n, handler });

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
