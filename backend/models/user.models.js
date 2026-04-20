import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    }, email: {
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


userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    this.password = await bcrypt.hash(password, 10);
    // for reading password during login
    // const match = await bcrypt.compare(password, user.password);
    next();

})

const User = model('User', userSchema)
export default User;