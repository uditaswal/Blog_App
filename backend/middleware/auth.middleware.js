import { JWT_SECRET } from "../config/env.js"
import { logger } from "../utils/logger.utils.js";
import jwt from "jsonwebtoken";
export function protect(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {

            logger.error({
                message: "Empty token",
                error: req.user?.email || null
            })

            return res.status(401).json({
                success: false,
                message: "unauthorized"
            });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {

        logger.error({
            message: "Error in login",
            error: error
        })


        return res.status(401).json({
            success: false,
            message: "Invalid Token"
        })
    }
}

