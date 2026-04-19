import mongoose from "mongoose";
import { logger } from './utils/logger.utils.js';

export default async function connectMongoDB(dbURL) {

    await mongoose.connect(dbURL).then(() => logger.info(`MongoDB Connected`)).catch((err) => logger.error(`Error while connecting to MongoDB : ${err}`))

}