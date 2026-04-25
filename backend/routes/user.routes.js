import { Router } from 'express';
import { signup, signin } from '../controllers/auth.controller.js'
import { protect } from "../middleware/auth.middleware.js"
import { getProfile } from "../controllers/user.controller.js"

export const userRouter = Router();

userRouter.post('/signin', signin);

userRouter.post('/signup', signup);

userRouter.get("/profile", protect, getProfile);