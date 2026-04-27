
import { logger } from "../utils/logger.utils.js";

import { passwordRegex, emailRegex } from "../config/env.js"

export function isValidPassword(password) {
    try {

        if (!password) return {
            isValid: false,
            message: "Password is mandatory"
        }

        const allowed = passwordRegex.test(password)

        if (!allowed) return {
            isValid: false,
            message: "Password should contain - one lowercase,one uppercase,one number,one special character,minimum 8 chars"
        }

        return {
            isValid: true
        }
    } catch (error) {
        logger.info(
            {
                message: "Error occurred while validating password",
                error: error
            })
    }

    return {
        isValid: false,
        message: "Error occurred while validating password"
    };
}



export function isValidEmail(email) {
    try {


        if (!email) {
            return {
                isValid: false,
                message: "Email is mandatory field"
            }
        }
        const allowed = emailRegex.test(email)
        if (!allowed) {
            return {
                isValid: false,
                message: "Invalid Email Address"
            }
        }

        return { isValid: true }

    } catch (error) {
        logger.info(
            {
                message: "Error occurred while validating email",
                error: error
            })
    }

    return {
        isValid: false,
        message: "Error occurred while validating email"
    };
}



