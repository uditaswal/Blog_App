
import {  passwordRegex, emailRegex } from "../config/env.js"

export function isValidPassword(password) {

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
}

export function isValidEmail(email) {
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
}



