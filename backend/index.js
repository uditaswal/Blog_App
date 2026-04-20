import dotenv from 'dotenv'
import { logger } from './utils/logger.utils.js';
import connectMongoDB from './dbConnection.js';
import { app } from './app.js';

// env:
dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 8000
const ENDPOINT = process.env.ENDPOINT || 'http://localhost:'
const dbURL = process.env.NODE_ENV === "production" ? `${process.env.prod_dbURI}&appName=${process.env.prod_dbAppName}` : `${process.env.test_dbURI}&appName=${process.env.test_dbAppName}`
const mongoDBServerSelectionTimeoutMS = process.env.mongoDBServerSelectionTimeoutMS || 5000;
const mongoDBConnectTimeoutMS = process.env.mongoDBConnectTimeoutMS || 10000;

async function startServer() {
    try {
        await connectMongoDB(dbURL, mongoDBServerSelectionTimeoutMS, mongoDBConnectTimeoutMS);
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} on ${process.env.NODE_ENV} env`);
        });

    } catch (error) {
        logger.error("Startup failed:", error);
        process.exit(1);
    }
}

startServer();