import dotenv from "dotenv";

dotenv.config();
export const ENVIRONMENT = process.env.NODE_ENV;
export const isProd = ENVIRONMENT === "production" ? true : false;
export const PORT = process.env.PORT || 8000
export const ENDPOINT = process.env.ENDPOINT || 'http://localhost:'
export const dbURL = isProd ? `${process.env.prod_dbURI}` : `${process.env.test_dbURI}&appName=${process.env.test_dbAppName}`
export const mongoDBServerSelectionTimeoutMS = 5000;
export const mongoDBConnectTimeoutMS = 10000;
export const sessionSecretKey=process.env.sessionSecretKey;
