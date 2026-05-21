import {Pool} from "pg";
import {
    PostgresChainCursorRepository,
    PostgresLeaderLock,
    PostgresWorkerCursorsRepository,
    validatePostgresSchema,
} from "@drillcoder/voryn";

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startBatchedReactionWorker({
    config,
    logger,
    dbUrl,
    lockKey,
    streamType,
    sourceName,
    repositoryFactory,
    listAfterPosition,
    initialPosition,
    toPosition,
    handler,
}) {
    const pool = new Pool({connectionString: dbUrl});
    const chainCursorRepository = new PostgresChainCursorRepository(pool);
    const workerCursorsRepository = new PostgresWorkerCursorsRepository(pool);
    const repository = repositoryFactory(pool);
    const leaderLock = new PostgresLeaderLock(pool, lockKey);
    let active = true;

    async function shutdown() {
        active = false;
        await leaderLock.release();
        await pool.end();
    }

    process.once("SIGINT", () => {
        shutdown().finally(() => process.exit(0));
    });
    process.once("SIGTERM", () => {
        shutdown().finally(() => process.exit(0));
    });

    await validatePostgresSchema({pool, logger});

    const acquired = await leaderLock.tryAcquire();
    if (!acquired) {
        throw new Error(`Worker "${config.workerName}" did not start: lock is already held`);
    }

    logger.info("batched_reaction_worker_started", {
        chainId: config.chainId,
        workerName: config.workerName,
        streamType,
        batchSize: config.batchSize,
        delayBetweenTicksMs: config.delayBetweenTicksMs,
    });

    while (active) {
        try {
            await executeTick({
                config,
                logger,
                streamType,
                sourceName,
                repository,
                listAfterPosition,
                initialPosition,
                toPosition,
                handler,
                chainCursorRepository,
                workerCursorsRepository,
            });
        } catch (error) {
            logger.error("batched_reaction_tick_failed", {
                chainId: config.chainId,
                workerName: config.workerName,
                streamType,
                error: error instanceof Error ? error.message : String(error),
            });
        }

        if (active) {
            await sleep(config.delayBetweenTicksMs);
        }
    }
}

async function executeTick({
    config,
    logger,
    streamType,
    sourceName,
    repository,
    listAfterPosition,
    initialPosition,
    toPosition,
    handler,
    chainCursorRepository,
    workerCursorsRepository,
}) {
    const {workerName, chainId, batchSize} = config;
    const chainCursor = await chainCursorRepository.get(chainId);

    if (chainCursor === null) {
        throw new Error(`Chain cursor is missing for ${sourceName} reaction chain ${String(chainId)}`);
    }

    let cursor = await workerCursorsRepository.get(workerName, chainId, streamType);

    if (cursor === null) {
        const position = initialPosition(chainCursor.lastCommittedBlock);
        await workerCursorsRepository.insert(workerName, chainId, streamType, position);
        logger.info("worker_cursor_initialized", {workerName, chainId, streamType, initialPosition: position});
        cursor = await workerCursorsRepository.get(workerName, chainId, streamType);
    }

    const items = await listAfterPosition(
        repository,
        chainId,
        chainCursor.lastCommittedBlock,
        cursor.position,
        batchSize
    );

    let lastProcessedPosition = null;
    const startedAt = Date.now();

    for (const item of items) {
        await handler.handle(item, {workerName});
        lastProcessedPosition = toPosition(item);
    }

    if (lastProcessedPosition === null) {
        logger.debug("batched_reaction_tick_no_items", {chainId, workerName, streamType});
        return;
    }

    await workerCursorsRepository.advance(workerName, chainId, streamType, lastProcessedPosition);

    const elapsedSeconds = Math.max(0.001, (Date.now() - startedAt) / 1000);
    logger.info(`${sourceName}_reaction_tick_processed`, {
        chainId,
        workerName,
        processed: items.length,
        processedPerSecond: items.length / elapsedSeconds,
        elapsedSeconds,
        lastProcessedPosition,
    });
}
