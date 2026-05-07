import { Router } from 'express';
import { newBlog, getUsersAllBlogList, getBlog, deleteBlog, updateBlog } from '../controllers/user.blogs.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { coverUpload } from '../utils/uploads.utils.js';
export const blogRouter = Router();

blogRouter.post('/new', protect,
    coverUpload.single("coverImage"),
    newBlog
);

blogRouter.get('/list', protect,
    getUsersAllBlogList
);

blogRouter.get('/:id', protect,
    getBlog
);
blogRouter.delete('/:id', protect,
    deleteBlog
);

blogRouter.patch('/:id', protect,
    updateBlog
);
