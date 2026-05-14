import { ConsoleLogger, PipelineMetrics } from "@drillcoder/voryn";

const dbUrl = process.env.DB_URL ?? "postgres://user:pass@postgres:5432/voryn";
const rpcUrl = process.env.ETH_RPC_URL ?? "https://ethereum-rpc.publicnode.com";
const chainId = Number(process.env.ETH_CHAIN_ID ?? 1);

const logger = new ConsoleLogger({ minLevel: process.env.LOG_LEVEL ?? "warn" });
const metrics = await PipelineMetrics.create({
  config: { chainId },
  logger,
  dbUrl,
  rpcUrl,
});

try {
  const snapshot = await metrics.get();

  console.log(`chain=${snapshot.chainId} observed=${snapshot.observedAt.toISOString()}`);
  console.log(`latest=${snapshot.latestBlock}`);
  console.log("");

  console.table([
    {
      stage: "head",
      block: formatNullable(snapshot.stages.head.block),
      lagBlocks: formatNullable(snapshot.stages.head.lagBlocks),
    },
    {
      stage: "fetch",
      block: formatNullable(snapshot.stages.fetch.block),
      lagBlocks: formatNullable(snapshot.stages.fetch.lagBlocks),
    },
    {
      stage: "sequencer",
      block: formatNullable(snapshot.stages.sequencer.block),
      lagBlocks: formatNullable(snapshot.stages.sequencer.lagBlocks),
    },
  ]);

  console.log("status:", formatStatusCounts(snapshot.blockStatusCounts));
  console.log(
    "freshness:",
    `pipeline=${formatSeconds(snapshot.freshness.secondsSincePipelineUpdate)}`,
    `fetch=${formatSeconds(snapshot.freshness.secondsSinceFetch)}`,
  );
  console.log(
    "maxLag:",
    `blocks=${formatNullable(snapshot.maxLag.blocks)}`,
    `seconds=${formatSeconds(snapshot.maxLag.seconds)}`,
  );

  if (snapshot.failedBlocks.length > 0) {
    console.log("");
    console.table(snapshot.failedBlocks.map((failedBlock) => ({
      block: failedBlock.block,
      attempts: failedBlock.attempts,
      nextRetryAt: failedBlock.nextRetryAt?.toISOString() ?? "-",
      error: failedBlock.error ?? "-",
    })));
  }

  console.log("");
  console.log("reactions:");

  if (snapshot.reactions.length === 0) {
    console.log("empty");
  } else {
    console.table(snapshot.reactions.map((reaction) => ({
      worker: reaction.workerName,
      stream: reaction.streamType,
      processedSeq: reaction.processedSeq.toString(),
      targetSeq: reaction.targetSeq.toString(),
      lagSeq: reaction.lagSeq.toString(),
      idle: formatSeconds(reaction.secondsSinceProgress),
    })));
  }
} finally {
  await metrics.close();
}

function formatNullable(value) {
  return value === null ? "-" : String(value);
}

function formatSeconds(value) {
  return value === null ? "-" : `${value}s`;
}

function formatStatusCounts(statusCounts) {
  return Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => `${status}=${count}`)
    .join(" ") || "empty";
}
