import { ConsoleLogger, HeadWorker } from "@drillcoder/voryn";

const dbUrl = process.env.DB_URL ?? "postgres://user:pass@postgres:5432/voryn";
const rpcUrl = "https://ethereum-rpc.publicnode.com";
const chainId = 1;
const delayBetweenTicksMs = Number(process.env.HEAD_DELAY_MS ?? 1_000);
const confirmations = Number(process.env.CONFIRMATIONS ?? 0);
const depthBlocks = Number(process.env.HEAD_DEPTH_BLOCKS ?? 10_000);

const logger = new ConsoleLogger({ minLevel: "info" });
const config = { chainId, delayBetweenTicksMs, confirmations, depthBlocks };
const worker = await HeadWorker.create({ config, logger, dbUrl, rpcUrl });

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));

await worker.start();
