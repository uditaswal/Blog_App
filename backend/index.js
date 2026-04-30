import { ENVIRONMENT, PORT, ENDPOINT, dbURL, mongoDBServerSelectionTimeoutMS, mongoDBConnectTimeoutMS, mongoDBConnectionRetryCount } from './config/env.js'
import { logger } from './utils/logger.utils.js';
import connectMongoDB from './dbConnection.js';
import { app } from './app.js';

// env:

async function startServer() {
    try {
        await connectMongoDB(dbURL, mongoDBServerSelectionTimeoutMS, mongoDBConnectTimeoutMS, mongoDBConnectionRetryCount);
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} on ${ENVIRONMENT} env at ${ENDPOINT}${PORT}`);
        });

    } catch (error) {
        logger.error({
            message: "Startup failed",
            error: error?.message,
            stack: error?.stack
        });
        process.exit(1);
    }
}

startServer();
