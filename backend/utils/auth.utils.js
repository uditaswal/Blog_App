import { JWT_SECRET, isProd } from "../config/env.js"
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.utils.js";
import { sendResponse } from "./response.utils.js";

export function loginTokenGeneration(req, res, user) {
    try {
        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
            }, JWT_SECRET,
            { expiresIn: "7d" },
        )
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd ? true : false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7  days
        })

        logger.info(
            {
                operation: "signin",
                action: "token_generated",
                message: "Signin token generated successfully",
                userId: user._id,
                username: user.username
            })

        return sendResponse(res, 200, "Sign successful", {
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            id: user._id,
            role: user.role,
            token: !isProd ? token : "Generated Successfully"
        })
    } catch (error) {
        logger.info(
            {
                operation: "signin",
                action: "token_generation_failed",
                message: "Error occurred while creating token",
                error: error
            })
    }

    return sendResponse(res, 500, "Error occurred while creating token");
};
