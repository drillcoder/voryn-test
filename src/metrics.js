import { createServer } from "node:http";
import { ConsoleLogger, PipelineMetrics } from "@drillcoder/voryn";

const dbUrl = process.env.DB_URL ?? "postgres://user:pass@postgres:5432/voryn";
const rpcUrl = "https://ethereum-rpc.publicnode.com";
const port = 8080;
const chainId = 1;
const confirmations = Number(process.env.CONFIRMATIONS ?? 0);

const logger = new ConsoleLogger({ minLevel: "info" });
const metrics = await PipelineMetrics.create({
  config: { chainId, confirmations },
  logger,
  dbUrl,
  rpcUrl,
});

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
      sendText(
        response,
        200,
        await metrics.getPrometheus(),
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
  logger.info("metrics_server_started", { port, chainId });
});

async function shutdown() {
  server.close();
  await metrics.close();
}

process.once("SIGINT", () => {
  shutdown().finally(() => process.exit(0));
});

process.once("SIGTERM", () => {
  shutdown().finally(() => process.exit(0));
});
