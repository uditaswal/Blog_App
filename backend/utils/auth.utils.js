import { JWT_SECRET, isProd } from "../config/env.js"
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.utils.js";

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
                message: "Signin token generated successfully",
                loginId: user.loginId
            })


        return res.status(200).json({
            success: true,
            message: "Sign successful",
            data: {
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                id: user._id,
                role: user.role,
                token: !isProd ? token : "Generated Successfully"
            }
        })
    } catch (error) {
        logger.info(
            {
                message: "Error occurred while creating token",
                error: error
            })
    }

    res.status(500).json({
        success: false,
        message: "Error occurred while creating token"
    });
};
