import User from "../models/user.models.js";
import { logger } from "../utils/logger.utils.js";
import bcrypt from "bcrypt";
import { isValidEmail, isValidPassword } from "../utils/validation.utils.js";
import { loginTokenGeneration } from '../utils/auth.utils.js'
import { emailRegex, ADMIN_PASSWORD } from '../config/env.js'
import { sendResponse } from "../utils/response.utils.js";
export async function signup(req, res) {
    const { fullName, email, username, password, role, adminPassword } = req.body;

    try {
        logger.info({
            "Message": "Sign up request received.",
            "fullName": fullName,
            "email": email,
            "username": username,
        });

        // isValidation
        if (!fullName || !email || !password || !username) {
            return sendResponse(res, 400, "All fields are required");
        }

        const normalizedUsername = username.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();

        logger.info({
            "Message": "Normalized Values.",
            "fullName": fullName,
            "email": normalizedEmail,
            "username": normalizedUsername,
        });

        const passwordCheck = isValidPassword(password);
        if (!passwordCheck.isValid) {
            return sendResponse(res, 400, passwordCheck.message);
        }

        const emailCheck = isValidEmail(normalizedEmail);;
        if (!emailCheck.isValid) {
            return sendResponse(res, 400, emailCheck.message)
        }

        if (normalizedUsername.length >= 20 || normalizedUsername.length <= 6) {
            logger.error({
                error: "username should be either more than 6 digit and less than 20 digit long",
                "fullName": fullName,
                "email": normalizedEmail,
                "username": normalizedUsername,
                "username_length": normalizedUsername.length
            })

            return sendResponse(res, 400, "username should be either more than 6 digit and less than 20 digit long")

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
                return sendResponse(res, 400, "Email already registered. Please sign in.");

            } else if (existingUser.username === normalizedUsername) {
                logger.error({ "error": `${username} already exist in DB` })
                return sendResponse(res, 400, "Username already taken.");
            }
        }

        if (adminPassword) {
            if (adminPassword !== ADMIN_PASSWORD) {
                logger.error({
                    error: "Admin password is incorrect",
                    "fullName": fullName,
                    "email": normalizedEmail,
                    "username": normalizedUsername,

                });

                return sendResponse(res, 400, "Admin password is incorrect");
            }
        }

        const isAdminSignup = role === "ADMIN" && adminPassword === ADMIN_PASSWORD;

        const user = await User.create(
            {
                fullName,
                email: normalizedEmail,
                username: normalizedUsername,
                password,
                role: isAdminSignup ? "ADMIN" : "USER"
            });
        // }
        logger.info({
            message: "User Created in DB",
            userId: user._id,
            fullName: fullName,
            email: normalizedEmail,
            username: normalizedUsername
        });

        return sendResponse(res, 201, "User registered successfully", {
            "user": {
                "id": user._id,
                "fullName": user.fullName,
                "email": user.email,
                "username": user.username
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
        return sendResponse(res, 500, "Internal Server Error")
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

            return sendResponse(res, 400, "Mandatory field missing for signin");
        }

        const normalizedLoginId = loginId.trim().toLowerCase();
        const isEmail = emailRegex.test(normalizedLoginId);

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

            return sendResponse(res, 400, "Password should contain - one lowercase,one uppercase,one number,one special character,minimum 8 chars")
        }

        if (isEmail) {
            const emailCheck = isValidEmail(loginId);

            if (!emailCheck.isValid) {
                logger.error({
                    error: "Invalid Email Address",
                    loginId: loginId
                });

                return sendResponse(res, 400, "Invalid Email Address")
            }

        }

        const user = await User.findOne(
            isEmail ? { email: normalizedLoginId } : { username: normalizedLoginId });
        if (!user) {
            logger.error({
                error: "Sign in failed - User does not exist",
                loginId: normalizedLoginId
            })

            return sendResponse(res, 400, "Sign in failed - User does not exist");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            logger.error({
                error: "Sign in failed - Incorrect Password",
                loginId: normalizedLoginId
            })

            return sendResponse(res, 400, "Sign in failed - Incorrect Password");
        }
        return loginTokenGeneration(req, res, user);
    } catch (err) {
        logger.error({
            message: "Error in Signin function",
            error: err
        })

        return sendResponse(res, 500, "Internal Server Error")

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


        return sendResponse(res, 200, "Logged out");
    } catch (error) {
        logger.info(
            {
                message: "Error occurred while logging out",
                error: error
            })
    }

    return sendResponse(res, 500, "Error occurred while logging out");
}

