import { BlockJobRecovery, ConsoleLogger } from "@drillcoder/voryn";

const options = {
    dbUrl: process.env.DB_URL,
    logLevel: "info",
    chainId: Number(process.env.ETH_CHAIN_ID),
};
const recovery = await BlockJobRecovery.create(options);

try {
    const blockNumber = Number(process.argv[2]);
    const singleBlockResult = await recovery.retryFailedBlock(blockNumber);

    console.log(JSON.stringify(singleBlockResult, null, 2));
} finally {
    await recovery.close();
}
