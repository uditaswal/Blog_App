import mongoose from "mongoose";
import { logger } from './utils/logger.utils.js';

export default async function connectMongoDB(dbURL, mongoDBServerSelectionTimeoutMS, mongoDBConnectTimeoutMS, mongoDBConnectionRetryCount) {
    while (mongoDBConnectionRetryCount) {

        try {


            await mongoose.connect(dbURL, {
                serverSelectionTimeoutMS: mongoDBServerSelectionTimeoutMS, connectTimeoutMS: mongoDBConnectTimeoutMS
            })
            logger.info(`MongoDB Connected`)
            break;
        } catch (error) {
            logger.error(`Error while connecting to MongoDB : Remaining retries ${mongoDBConnectionRetryCount} : ${error}`);
            mongoDBConnectionRetryCount--;
            await new Promise(r => setTimeout(r, 5000));
        }
    }
    if (!mongoDBConnectionRetryCount) process.exit(1);
}
