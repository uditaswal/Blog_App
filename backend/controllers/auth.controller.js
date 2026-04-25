import User from "../models/user.models.js";
import { logger } from "../utils/logger.utils.js";
import { JWT_SECRET, isProd } from "../config/env.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isValidEmail, isValidPassword } from "../utils/validation.utils.js";

export async function signup(req, res) {
    const { fullName, email, password } = req.body;

    try {
        logger.info({
            "Message": "Sign up request received.",
            "fullName": fullName,
            "email": email,
        });

        // isValidation
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const passwordCheck = isValidPassword(password);
        if (!passwordCheck.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordCheck.message
            });
        }

        const emailCheck = isValidEmail(email);;
        if (!emailCheck.isValid) {
            return res.status(400).json({
                success: false,
                message: emailCheck.message
            })
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.info({ "message": `${email} already exist in DB` })
            return res.status(400).json({
                success: false,
                message: "Email already registered. Please sign in."
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
            message: "User registered successfully",
            data: {
                "user": {
                    "id": user._id,
                    "fullName": user.fullName,
                    "email": user.email,
                }
            }
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

export async function signin(req, res) {

    try {
        const { email, password } = req.body;
        logger.info({
            message: "Signin Request Received",
            email: email
        });

        if (!email || !password) {

            logger.error({
                error: "Mandatory field missing for signin",
                email: email || null
            });

            return res.status(400).json({
                success: false,
                message: "Mandatory field missing for signin"
            });

        }

        const passwordCheck = isValidPassword(password);

        if (!passwordCheck.isValid) {
            logger.error({
                error: "Password should contain - one lowercase,one uppercase,one number,one special character,minimum 8 chars",
                email: email || null
            });

            return res.status(400).json({
                success: false,
                message: "Password should contain - one lowercase,one uppercase,one number,one special character,minimum 8 chars"
            })
        }

        const emailCheck = isValidEmail(email);

        if (!emailCheck.isValid) {
            logger.error({
                error: "Invalid Email Address",
                email: email || null
            });

            return res.status(400).json({
                success: false,
                message: "Invalid Email Address"
            })
        }

        const user = await User.findOne({ email });
        if (!user) {
            logger.error({
                error: "Sign in failed - User does not exist",
                email: email
            })

            return res.status(400).json({
                success: false,
                message: "Sign in failed - User does not exist",
            });
        }


        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            logger.error({
                error: "Sign in failed - Incorrect Password",
                email: email
            })

            return res.status(400).json({
                success: false,
                message: "Sign in failed - Incorrect Password",
            });
        }

        return loginTokenGeneration(req, res, user);


    } catch (err) {
        logger.error({
            message: "Error in Signin function",
            error: err
        })

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"

        })

    }

}

export function loginTokenGeneration(req, res, user) {

    const token = jwt.sign(
        { userId: user._id }, process.env.JWT_SECRET,
        { expiresIn: "7d" }

    )

    res.cookie("token", token, {
        httpOnly: true,
        secure: isProd ? true : false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7  days
    })

    logger.info(
        {
            message: "Login token generated successfully",
            email: user.email
        })


    return res.status(200).json({
        success: true,
        message: "Sign successful",
        data: {
            fullName: user.fullName,
            email: user.email,
            id: user._id
        }
    })

};


export function signout(req, res) {
    res.clearCookie("token");

    res.json({
        success: true,
        message: "Logged out"
    });
}