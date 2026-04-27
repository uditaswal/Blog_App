import { Router } from 'express';
import { signup, signin } from '../controllers/auth.controller.js'
import { protect } from "../middleware/auth.middleware.js"
import { getProfile } from "../controllers/user.controller.js"
import { profileImage } from "../utils/uploads.utils.js"
export const userRouter = Router();

userRouter.post('/signin', signin);

userRouter.post('/signup', profileImage.single("profileImage"), signup);

userRouter.get("/profile", protect, getProfile);