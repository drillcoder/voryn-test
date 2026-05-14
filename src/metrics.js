import { createServer } from "node:http";
import { ConsoleLogger, PipelineMetrics } from "@drillcoder/voryn";

const logger = new ConsoleLogger({ minLevel: "info" });
const dbUrl = process.env.DB_URL;
const port = Number(process.env.PORT ?? 8080);

const chains = [
  {
    name: "eth",
    config: { chainId: Number(process.env.ETH_CHAIN_ID) },
    rpcUrl: process.env.ETH_RPC_URL,
  },
  {
    name: "bsc",
    config: { chainId: Number(process.env.BSC_CHAIN_ID) },
    rpcUrl: process.env.BSC_RPC_URL,
  },
];

const metrics = await Promise.all(
  chains.map(async (chain) => ({
    ...chain,
    metrics: await PipelineMetrics.create({
      config: chain.config,
      logger,
      dbUrl,
      rpcUrl: chain.rpcUrl,
    }),
  }))
);

function mergePrometheusDocuments(documents) {
  const seenMetadata = new Set();
  const lines = [];

  for (const document of documents) {
    for (const line of document.split("\n")) {
      const metadataMatch = line.match(/^# (HELP|TYPE) ([^ ]+)/);

      if (metadataMatch) {
        const metadataKey = `${metadataMatch[1]}:${metadataMatch[2]}`;

        if (seenMetadata.has(metadataKey)) {
          continue;
        }

        seenMetadata.add(metadataKey);
      }

      lines.push(line);
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

function sendText(response, statusCode, body, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  response.end(body);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

    if (url.pathname === "/health") {
      sendText(response, 200, "ok\n");
      return;
    }

    if (url.pathname === "/metrics") {
      const documents = await Promise.all(
        metrics.map(({ metrics: chainMetrics }) => chainMetrics.getPrometheus())
      );

      sendText(
        response,
        200,
        mergePrometheusDocuments(documents),
        "text/plain; version=0.0.4; charset=utf-8"
      );
      return;
    }

    sendText(response, 404, "not found\n");
  } catch (error) {
    console.error(error);
    sendText(response, 500, "failed to load metrics\n");
  }
});

server.listen(port, () => {
  logger.info("metrics_server_started", {
    port,
    chains: metrics.map((chain) => ({
      name: chain.name,
      chainId: chain.config.chainId,
    })),
  });
});

async function shutdown() {
  server.close();
  await Promise.all(metrics.map(({ metrics: chainMetrics }) => chainMetrics.close()));
}

process.once("SIGINT", () => {
  shutdown().finally(() => process.exit(0));
});

process.once("SIGTERM", () => {
  shutdown().finally(() => process.exit(0));
});
