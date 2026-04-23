import User from "../models/user.models.js";
import { logger } from "../utils/logger.utils.js";

export async function signup(req, res) {
    try {
        const { fullName, email, password } = req.body;

        logger.info({
            "Message": "Sign up request received.",
            "body": req.body,
            "fullName": fullName,
            "email": email
        });

        // validation
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // check existing user:

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.info({ "message": `${email} already exist in DB` })
            return res.render("signup", {
                error: "Email already registered. Please sign in.",
                fullName,
                email
            });

            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // create user:
        const user = await User.create({ fullName, email, password });
        logger.info({
            message: "User Created in DB",
            userId: user._id,
            fullName,
            email,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (err) {
        logger.error({
            Message: "Error while creating DB User",
            error: err,
            fullName,
            email
        });
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
};

