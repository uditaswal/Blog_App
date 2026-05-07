import { isProd } from "../config/env.js";
import { Blog } from "../models/blog.model.js";
import { logger } from "../utils/logger.utils.js";
import { sendResponse } from "../utils/response.utils.js";
import mongoose from "mongoose";

export async function getAllBlogListByUserId(req, res) {
    try {
        if (!req.user) {
            logger.info({
                operation: "get_users_blog_list",
                action: "auth_missing",
                message: "user token is not present in request",
                username: req?.user.username || null,
                email: req?.user.email || null
            })

            return sendResponse(res, 400, "Authentication failed, Sign in Again");
        }
        logger.info({
            operation: "get_users_blog_list",
            action: "received",
            message: "Request received to fetch user blog list",
            username: req?.user.username,
            email: req.user.email,
        })

        if (req.user.role !== "ADMIN") {
            logger.info({
                operation: "get_user_data",
                action: "unauthorized",
                message: "ADMIN privilege is required to fetch user list",
                username: req.user.username,
                email: req.user.email,
                user: !isProd ? req?.user : null
            })
            return sendResponse(res, 400, "ADMIN privilege is required to fetch user list");
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, "Invalid user ID");
        }

        const userBlogsList = await Blog.find({ createdBy: id }).lean();

        if (!userBlogsList) {
            logger.info({
                operation: "get_users_blog_list",
                action: "not_found",
                message: "No blogs found for user",
                username: req.user.username,
                email: req.user.email,
                adminID: req.user.userId,
                userid: id,
            })
            return sendResponse(res, 404, "No blogs found for user");
        }

        const formattedUserBlogsList = userBlogsList.map(blog => ({
            ...blog,
            createdBy: blog.createdBy.toString(),
            _id: blog._id.toString(),
            body: blog.body.substring(0, 50) || "",
        }));

        logger.info({
            operation: "get_users_blog_list",
            action: "completed",
            message: "User blog list fetched successfully",
            userCount: formattedUserBlogsList.length,
            username: req.user.username,
            email: req.user.email,
            adminID: req.user.userId,
            userid: id,

        })

        return sendResponse(res, 200, "User blog list fetched successfully", { blogs: formattedUserBlogsList });
    } catch (error) {

        logger.error({
            operation: "get_users_blog_list",
            action: "failed",
            message: "Error while fetching User blog list",
            error: error,
            body: !isProd ? req?.body : null,
            blogId: req.params.id ? req.params.id : null,
            username: req.user.username,
            email: req.user.email,
            userId: req.user.userId,

        })
        return sendResponse(res, 500, "Error while fetching User blog list")
    }

}