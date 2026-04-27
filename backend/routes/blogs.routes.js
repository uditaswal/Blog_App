import { Router } from 'express';
import { newBlog } from '../controllers/blogs.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { coverUpload } from '../utils/uploads.utils.js';
export const blogRouter = Router();

blogRouter.post('/new', protect,
    coverUpload.single("coverImage"),
    newBlog
);