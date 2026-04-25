import dotenv from "dotenv";

dotenv.config();
export const ENVIRONMENT = process.env.NODE_ENV;
export const isProd = ENVIRONMENT === "production" ? true : false;
export const PORT = process.env.PORT || 8000
export const ENDPOINT = process.env.ENDPOINT || 'http://localhost:'
export const dbURL = isProd ? `${process.env.prod_dbURI}` : `${process.env.test_dbURI}`
export const mongoDBServerSelectionTimeoutMS = 5000;
export const mongoDBConnectTimeoutMS = 10000;
export const sessionSecretKey = process.env.sessionSecretKey;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]:;"'<>,.?\/\\|`~]).{8,}$/;
export const emailRegex = /^[^@]+@[^@]+\.[^@]+$/
export const frontEndOrigin = isProd ? process.env.prod_frontEndOrigin : process.env.test_frontEndOrigin;
export const JWT_SECRET = process.env.JWT_SECRET;