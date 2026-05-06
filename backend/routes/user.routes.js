import { Router } from 'express';
import { protect } from "../middleware/auth.middleware.js"
import { updateProfileImg, deleteProfileImage, updateUserProfileData, deleteUserOwnAccount } from "../controllers/user.controller.js"
import { profileImage } from "../utils/uploads.utils.js"

export const userRouter = Router();

userRouter.patch('/profile', protect, updateUserProfileData);
userRouter.post('/profileImg', protect, profileImage.single("profileImage"), updateProfileImg);
userRouter.delete('/profileImg', protect, deleteProfileImage);
userRouter.delete('/me', protect, deleteUserOwnAccount);
