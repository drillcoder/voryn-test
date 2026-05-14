import { ConsoleLogger, RetentionWorker } from "@drillcoder/voryn";

const dbUrl = process.env.DB_URL ?? "postgres://user:pass@postgres:5432/voryn";
const chainId = 1;
const logger = new ConsoleLogger({ minLevel: "info" });
const config = {
  chainId,
  delayBetweenTicksMs: Number(process.env.RETENTION_DELAY_MS ?? 60_000),
  retentionDepthBlocks: Number(process.env.RETENTION_DEPTH_BLOCKS ?? 10_000),
};
const worker = await RetentionWorker.create({ config, logger, dbUrl });

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
