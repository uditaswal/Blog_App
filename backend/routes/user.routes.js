import { Router } from 'express';
import { protect } from "../middleware/auth.middleware.js"
import { updateProfileImg, deleteProfileImage, getAllUsersList, getUserById, deleteUserById } from "../controllers/user.controller.js"
import { profileImage } from "../utils/uploads.utils.js"
export const userRouter = Router();

userRouter.get('/userList', protect, getAllUsersList);
userRouter.get('/:id', protect, getUserById);
userRouter.delete('/:id', protect, deleteUserById);
userRouter.post('/profileImg', protect, profileImage.single("profileImage"), updateProfileImg);
userRouter.delete('/profileImg', protect, deleteProfileImage);

