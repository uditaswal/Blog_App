import { Router } from 'express';
import { protect } from "../middleware/auth.middleware.js";
import { getAllUsersList, getUserById, deleteUserData } from "../controllers/admin.controller.js";
import { getAllBlogListByUserId } from "../controllers/admin.blogs.controller.js ";
import { isAdmin } from "../middleware/admin.middleware.js";

export const adminRouter = Router();

adminRouter.get('/userList', protect, isAdmin, getAllUsersList);
adminRouter.get('/user/profile/:id', protect, isAdmin, getUserById);
adminRouter.delete('/user/profile/:id', protect, isAdmin, deleteUserData);
adminRouter.get('/blog/list/:id', protect, isAdmin, getAllBlogListByUserId);
