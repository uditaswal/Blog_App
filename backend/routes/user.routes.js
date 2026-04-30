import { Router } from 'express';
import { protect } from "../middleware/auth.middleware.js"
import { updateProfileImg, deleteProfileImage, userList } from "../controllers/user.controller.js"
import { profileImage } from "../utils/uploads.utils.js"
export const userRouter = Router();

userRouter.get('/userList',protect, userList);
userRouter.post('/profileImg', protect, profileImage.single("profileImage"), updateProfileImg);
userRouter.delete('/profileImg', protect, deleteProfileImage);

