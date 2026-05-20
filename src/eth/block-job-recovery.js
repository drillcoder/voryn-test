import { BlockJobRecovery, ConsoleLogger } from "@drillcoder/voryn";

const config = {
    chainId: Number(process.env.ETH_CHAIN_ID),
};
const blockNumber = Number(process.argv[2]);

const logger = new ConsoleLogger({ minLevel: "info" });
const dbUrl = process.env.DB_URL;

const recovery = await BlockJobRecovery.create({ config, logger, dbUrl });

try {
    const singleBlockResult = await recovery.retryFailedBlock(blockNumber);

    console.log(JSON.stringify(singleBlockResult, null, 2));
} finally {
    await recovery.close();
}
