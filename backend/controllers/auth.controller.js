import User from "../models/user.models.js";
import { logger } from "../utils/logger.utils.js";
import bcrypt from "bcrypt";
import { isValidEmail, isValidPassword } from "../utils/validation.utils.js";
import { loginTokenGeneration } from '../utils/auth.utils.js'
import { defaultImgPath } from '../config/env.js'
import path from "path";
export async function signup(req, res) {
    const { fullName, email, username, password } = req.body;

    try {
        logger.info({
            "Message": "Sign up request received.",
            "fullName": fullName,
            "email": email,
            "username": username,
            "file_path": req.file?.path || defaultImgPath,
        });

        // isValidation
        if (!fullName || !email || !password || !username) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedUsername = username.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();
        const filePath = req.file?.path || defaultImgPath;
        const currentDirectory = process.cwd();
        const profileImageURL = req.file?.path ? path.relative(filePath, currentDirectory) : defaultImgPath

        logger.info({
            "Message": "Normalized Values.",
            "fullName": fullName,
            "email": normalizedEmail,
            "username": normalizedUsername,
            "profileImageURL": profileImageURL,
        });

        const passwordCheck = isValidPassword(password);
        if (!passwordCheck.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordCheck.message
            });
        }

        const emailCheck = isValidEmail(normalizedEmail);;
        if (!emailCheck.isValid) {
            return res.status(400).json({
                success: false,
                message: emailCheck.message
            })
        }

        if (normalizedUsername.length >= 20 || normalizedUsername.length <= 6) {
            logger.error({
                error: "username should be either more than 6 digit and less than 20 digit long",
                "fullName": fullName,
                "email": normalizedEmail,
                "username": normalizedUsername,
                "username_length": normalizedUsername.length
            })

            return res.status(400).json({
                success: false,
                message: "username should be either more than 6 digit and less than 20 digit long"
            })

        }

        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { username: normalizedUsername }
            ]
        });

        logger.info({ message: "existingUser", existingUser: existingUser, })

        if (existingUser) {
            if (existingUser.email === normalizedEmail) {
                logger.error({ "error": `${email} already exist in DB` })
                return res.status(400).json({
                    success: false,
                    message: "Email already registered. Please sign in."
                });

            } else if (existingUser.username === normalizedUsername) {
                logger.error({ "error": `${username} already exist in DB` })
                return res.status(400).json({
                    success: false,
                    message: "Username already taken."
                });
            }
        }

        // create user:
        const user = await User.create({
            fullName,
            email: normalizedEmail,
            username: normalizedUsername,
            password,
            profileImageURL
        });
        logger.info({
            message: "User Created in DB",
            userId: user._id,
            fullName: fullName,
            email: normalizedEmail,
            username: normalizedUsername
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                "user": {
                    "id": user._id,
                    "fullName": user.fullName,
                    "email": user.email,
                    "username": user.username
                }
            }
        });

    } catch (err) {
        logger.error({
            Message: "Error while creating DB User",
            error: err,
            fullName: fullName,
            email: email,
            username: username
        });
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
};

export async function signin(req, res) {
    try {

        const { loginId, password } = req.body

        if (!loginId || !password) {
            logger.error({
                error: "Mandatory field missing for signin",
                loginId: loginId || null
            });

            return res.status(400).json({
                success: false,
                message: "Mandatory field missing for signin"
            });
        }

        const normalizedLoginId = loginId.trim().toLowerCase();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedLoginId);

        logger.info({
            message: "Signin Request Received",
            loginId: normalizedLoginId
        });

        const passwordCheck = isValidPassword(password);

        if (!passwordCheck.isValid) {
            logger.error({
                error: "Password should contain - one lowercase,one uppercase,one number,one special character,minimum 8 chars",
                loginId: normalizedLoginId
            });

            return res.status(400).json({
                success: false,
                message: "Password should contain - one lowercase,one uppercase,one number,one special character,minimum 8 chars"
            })
        }

        if (isEmail) {
            const emailCheck = isValidEmail(loginId);

            if (!emailCheck.isValid) {
                logger.error({
                    error: "Invalid Email Address",
                    loginId: loginId
                });

                return res.status(400).json({
                    success: false,
                    message: "Invalid Email Address"
                })
            }

        }

        const user = await User.findOne(
            isEmail ? { email: normalizedLoginId } : { username: normalizedLoginId });
        if (!user) {
            logger.error({
                error: "Sign in failed - User does not exist",
                loginId: normalizedLoginId
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
                loginId: normalizedLoginId
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



export function signout(req, res, user) {
    try {

        res.clearCookie("token");

        logger.info(
            {
                message: "Signout Successful",
                loginId: user.loginId
            })


        res.status(200).json({
            success: true,
            message: "Logged out"
        });
    } catch (error) {
        logger.info(
            {
                message: "Error occurred while logging out",
                error: error
            })
    }

    res.status(500).json({
        success: false,
        message: "Error occurred while logging out"
    });
}

