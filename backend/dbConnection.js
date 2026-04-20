import mongoose from "mongoose";
import { logger } from './utils/logger.utils.js';

export default async function connectMongoDB(dbURL, mongoDBServerSelectionTimeoutMS, mongoDBConnectTimeoutMS) {

    await mongoose.connect(dbURL, {
        serverSelectionTimeoutMS: mongoDBServerSelectionTimeoutMS, connectTimeoutMS: mongoDBConnectTimeoutMS
    }).then(() => logger.info(`MongoDB Connected`)).catch((err) => logger.error(`Error while connecting to MongoDB : ${err}`))

}


