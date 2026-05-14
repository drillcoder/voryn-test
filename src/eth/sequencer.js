import { ConsoleLogger, SequencerWorker } from "@drillcoder/voryn";

const dbUrl = process.env.DB_URL ?? "postgres://user:pass@postgres:5432/voryn";
const rpcUrl = "https://ethereum-rpc.publicnode.com";
const chainId = 1;
const logger = new ConsoleLogger({ minLevel: "info" });
const config = {
  chainId,
  delayBetweenTicksMs: Number(process.env.SEQUENCER_DELAY_MS ?? 100),
  maxBlocksPerTick: Number(process.env.SEQUENCER_MAX_BLOCKS_PER_TICK ?? 10),
};
const worker = await SequencerWorker.create({ config, logger, dbUrl, rpcUrl });

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
