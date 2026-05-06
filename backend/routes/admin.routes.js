import { Router } from 'express';
import { protect } from "../middleware/auth.middleware.js"
import { getAllUsersList, getUserById, deleteUserData } from "../controllers/admin.controller.js"
import { isAdmin } from "../middleware/admin.middleware.js"
export const adminRouter = Router();
adminRouter.get('/userList', protect, isAdmin, getAllUsersList);
adminRouter.get('/user/:id', protect, isAdmin, getUserById);
adminRouter.delete('/user/:id', protect, isAdmin, deleteUserData);
