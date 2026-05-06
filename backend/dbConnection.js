import mongoose from "mongoose";
import { logger } from './utils/logger.utils.js';

export default async function connectMongoDB(dbURL, mongoDBServerSelectionTimeoutMS, mongoDBConnectTimeoutMS, mongoDBConnectionRetryCount) {
    while (mongoDBConnectionRetryCount) {

        try {


            await mongoose.connect(dbURL, {
                serverSelectionTimeoutMS: mongoDBServerSelectionTimeoutMS, connectTimeoutMS: mongoDBConnectTimeoutMS
            })
            logger.info({
                operation: "connect_database",
                action: "completed",
                message: "MongoDB Connected"
            })
            break;
        } catch (error) {
            logger.error({
                operation: "connect_database",
                action: "retry",
                message: "Error while connecting to MongoDB",
                remainingRetries: mongoDBConnectionRetryCount,
                error: error
            });
            mongoDBConnectionRetryCount--;
            await new Promise(r => setTimeout(r, 5000));
        }
    }
    if (!mongoDBConnectionRetryCount) process.exit(1);
}
