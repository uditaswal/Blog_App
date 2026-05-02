import { JWT_SECRET } from "../config/env.js"
import { logger } from "../utils/logger.utils.js";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/response.utils.js";
export function protect(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {

            logger.error({
                message: "Empty token",
                error: req.user?.email || null
            })

            return sendResponse(res, 401, "unauthorized");
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {

        logger.error({
            message: "Error in login",
            error: error
        })


        return sendResponse(res, 401, "Invalid Token")
    }
}

