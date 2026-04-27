import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
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
    },
    profileImageURL: {
        type: String,
        default: 'public/image/defaultImage.png'

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
            message: "User password hashed before save",
            userId: this._id,
            email: this.email
        });

    } catch (error) {
        logger.error({ error: error });
    }

})

const User = model('User', userSchema)
export default User;
