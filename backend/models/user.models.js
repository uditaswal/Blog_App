import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { defaultImgPath } from "../config/env.js"
import { logger } from '../utils/logger.utils.js';


const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    }
    , email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false,


    },
    profileImageURL: {
        type: String,
        default: defaultImgPath

    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: "USER"
    }
})


userSchema.pre('save', async function () {
    try {
        const SALT_ROUNDS = 10;

        if (!this.isModified('password')) return;

        this.password = await bcrypt.hash(this.password, SALT_ROUNDS);

        logger.info({
            operation: "hash_user_password",
            action: "completed",
            message: "User password hashed before save",
            userId: this._id,
            email: this.email
        });

    } catch (error) {
        logger.error({
            operation: "hash_user_password",
            action: "failed",
            error: error
        });
    }

})

const User = model('User', userSchema)
export default User;
