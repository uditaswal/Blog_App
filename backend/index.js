import { ENVIRONMENT, PORT, ENDPOINT, dbURL, mongoDBServerSelectionTimeoutMS, mongoDBConnectTimeoutMS, mongoDBConnectionRetryCount } from './config/env.js'
import { logger } from './utils/logger.utils.js';
import connectMongoDB from './dbConnection.js';
import { app } from './app.js';

// env:

async function startServer() {
    try {
        await connectMongoDB(dbURL, mongoDBServerSelectionTimeoutMS, mongoDBConnectTimeoutMS, mongoDBConnectionRetryCount);
        app.listen(PORT, () => {
            logger.info({
                operation: "start_server",
                action: "completed",
                message: `Server running on port ${PORT} on ${ENVIRONMENT} env at ${ENDPOINT}${PORT}`,
                port: PORT,
                environment: ENVIRONMENT
            });
        });

    } catch (error) {
        logger.error({
            operation: "start_server",
            action: "failed",
            message: "Startup failed",
            error: error?.message,
            stack: error?.stack
        });
        process.exit(1);
    }
}

startServer();
