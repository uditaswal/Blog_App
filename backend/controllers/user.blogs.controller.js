import { isProd } from "../config/env.js";
import { Blog } from "../models/blog.model.js";
import { logger } from "../utils/logger.utils.js";
import path from "path";
import mongoose from "mongoose";
import { sendResponse } from "../utils/response.utils.js";

export async function newBlog(req, res) {

    try {
        logger.info({
            operation: "create_blog",
            action: "received",
            message: "Request received for creating New Blog",
            body: !isProd ? req?.body : null,
            file_path: req?.file?.coverImage || null,
            tags: req?.file?.tags || null
        });

        const { title, body, tags } = req.body;
        const coverImagePath = req?.file?.coverImage ? req.file.coverImage : null;


        if (!title || !body) {
            logger.info({
                operation: "create_blog",
                action: "required_fields_missing",
                message: "Mandatory field missing",
                title: title || null,
                body: !isProd ? body : null,
                coverImagePath: coverImagePath
            });

            return sendResponse(res, 400, "Mandatory field missing", {
                title: title || null,
                body: !isProd ? body : null,
            });
        }

        const normalizedTitle = title.trim();
        const normalizedBody = body.trim();
        const normalizedTags = tags.toLowerCase().trim();

        if (normalizedTitle.length <= 1 || normalizedBody.length <= 1) {
            logger.info({
                operation: "create_blog",
                action: "validation_failed",
                message: "Title and Body should be more than 1 character long",
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",
            });

            return sendResponse(res, 400, "Title and Body should be more than 1 character long", {
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",
            })
        }

        if (normalizedTitle.length >= 80) {
            logger.info({
                operation: "create_blog",
                action: "validation_failed",
                message: "Title should be less than 80 characters",
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",

            });

            return sendResponse(res, 400, "Title and Body should be less than 80 character long", {
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",
            })
        }
        if (normalizedBody.length >= 10000000) {
            logger.info({
                operation: "create_blog",
                action: "validation_failed",
                message: "Body should be less than 10000000 character long",
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",
            });

            return sendResponse(res, 400, "Title and Body should be more than 1 character long", {
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",
            })
        }

        if (normalizedTags.length >= 1000) {
            logger.info({
                operation: "create_blog",
                action: "validation_failed",
                message: "tags should be less than 1000 character long",
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",
                tags: normalizedTags,
            });

            return sendResponse(res, 400, "Title and Body should be more than 1 character long", {
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",
            })
        }

        const curr_directory = process.cwd();
        const relativePath = coverImagePath ? path.relative(curr_directory, coverImagePath) : null;

        const newBlog = await Blog.create({
            title: title,
            body: body,
            coverImagePath: coverImagePath ? relativePath : null,
            tags: normalizedTags ? normalizedTags : null,
            createdBy: req.user.userId
        })

        logger.info({
            operation: "create_blog",
            action: "completed",
            message: "Blog Created Successfully",
            title: newBlog.title,
            coverImagePath: coverImagePath ? relativePath : null,
            normalizedTags: normalizedTags ? normalizedTags : null,
            createdBy: newBlog.createdBy.toString()
        })

        return sendResponse(res, 201, "Blog Created Successfully", {
            title: newBlog.title,
            tags: newBlog.tags,
            createdBy: newBlog.createdBy
        })

    } catch (error) {
        logger.error({
            operation: "create_blog",
            action: "failed",
            "message": "Error while creating new blog",
            "error": error,
            title: req.body.title,
            email: req.user.email,
            tags: newBlog.tags,
            username: req.user.username
        });

        return sendResponse(res, 500, "Error while creating new blog", {
            title: req.body.title,

        })

    }
}

export async function getUsersAllBlogList(req, res) {
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

        if (!mongoose.Types.ObjectId.isValid(req.user.userId)) {
            return sendResponse(res, 400, "Invalid user ID");
        }

        const userBlogsList = await Blog.find({ createdBy: req.user.userId }).lean();

        if (!userBlogsList) {
            logger.info({
                operation: "get_users_blog_list",
                action: "not_found",
                message: "No blogs found for user",
                username: req.user.username,
                email: req.user.email,
                userId: req.user.userId,
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
        })

        return sendResponse(res, 200, "User blog list fetched successfully", { blogs: formattedUserBlogsList });
    } catch (error) {

        logger.error({
            operation: "get_users_blog_list",
            action: "failed",
            message: "Error while fetching User blog list",
            error: error,
            body: !isProd ? req?.body : null
        })
        return sendResponse(res, 500, "Error while fetching User blog list")
    }

}

export async function getBlog(req, res) {
    try {
        if (!req.user) {
            logger.info({
                operation: "get_blog",
                action: "auth_missing",
                message: "user token is not present in request",
                username: req?.user.username || null,
                email: req?.user.email || null
            })

            return sendResponse(res, 400, "Authentication failed, Sign in Again");
        }
        logger.info({
            operation: "get_blog",
            action: "received",
            message: "Request received to fetch blog",
            username: req?.user.username,
            email: req.user.email,
        })

        const { id } = req.params;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, "Invalid user id");
        }

        const userBlogsList = await Blog.find({ _id: id }).lean();

        if (!userBlogsList) {
            logger.info({
                operation: "get_blog",
                action: "not_found",
                message: "No blogs found with the provided id",
                username: req.user.username,
                email: req.user.email,
                userId: req.user.userId,
            })
            return sendResponse(res, 404, "No blogs found with the provided id");
        }

        const formattedUserBlogsList = userBlogsList.map(blog => ({
            ...blog,
            createdBy: blog.createdBy.toString(),
            _id: blog._id.toString(),
            body: blog.body.substring(0, 50) || "",
        }));

        logger.info({
            operation: "get_blog",
            action: "completed",
            message: "blog fetched successfully",
            userCount: formattedUserBlogsList.length,
        })

        return sendResponse(res, 200, "blog fetched successfully", { blogs: formattedUserBlogsList });
    } catch (error) {

        logger.error({
            operation: "get_blog",
            action: "failed",
            message: "Error while fetching blog",
            error: error,
            body: !isProd ? req?.body : null,
            username: req.user.username,
            email: req.user.email,
            userId: req.user.userId,

        })
        return sendResponse(res, 500, "Error while fetching blog")
    }

}

export async function deleteBlog(req, res) {
    try {
        if (!req.user) {
            logger.info({
                operation: "delete_blog",
                action: "auth_missing",
                message: "user token is not present in request",
                username: req?.user.username || null,
                email: req?.user.email || null
            })

            return sendResponse(res, 400, "Authentication failed, Sign in Again");
        }
        logger.info({
            operation: "delete_blog",
            action: "received",
            message: "Request received to delete blog",
            username: req?.user.username,
            email: req.user.email,
        })

        const { id } = req.params;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, "Invalid user id");
        }


        const userBlogsList = await Blog.find({ _id: id }).lean();

        if (!userBlogsList) {
            logger.info({
                operation: "delete_blog",
                action: "not_found",
                message: "No blogs found with the provided id",
                username: req.user.username,
                email: req.user.email,
                userId: req.user.userId,
            })
            return sendResponse(res, 404, "No blogs found with the provided id");
        }

        const formattedUserBlogsList = userBlogsList.map(blog => ({
            ...blog,
            createdBy: blog.createdBy.toString(),
            _id: blog._id.toString(),
            body: blog.body.substring(0, 50) || "",
        }));

        await Blog.findByIdAndDelete(id);

        logger.info({
            operation: "delete_blog",
            action: "completed",
            message: "blog deleted successfully",
            userCount: formattedUserBlogsList.length,
        })

        return sendResponse(res, 200, "blog deleted successfully", { blogs: formattedUserBlogsList });
    } catch (error) {

        logger.error({
            operation: "delete_blog",
            action: "failed",
            message: "Error while deleting blog",
            error: error,
            body: !isProd ? req?.body : null,
            blogId: req.params.id ? req.params.id : null,
            username: req.user.username,
            email: req.user.email,
            userId: req.user.userId,


        })
        return sendResponse(res, 500, "Error while deleting blog")
    }

}


export async function updateBlog(req, res) {
    try {
        if (!req.user) {
            logger.info({
                operation: "update_blog_data",
                action: "auth_missing",
                message: "user token is not present in request",
                username: req?.user.username || null,
                email: req?.user.email || null,
                user: !isProd ? req?.user : null
            })
            return sendResponse(res, 400, "Authentication failed, Sign in Again");
        }

        logger.info({
            operation: "update_blog_data",
            action: "received",
            message: "Request received to update blog data",
            username: req.user.username,
            email: req.user.email,
        });

        const allowedFields = ["title", "body", "tags"];
        const bodyKeys = Object.keys(req.body);
        const isValid = bodyKeys.every(key => allowedFields.includes(key))

        if (!isValid) {
            logger.info({
                operation: "update_blog_data",
                action: "invalid_fields",
                message: "update is only allowed for title, body, tags",
                username: req.user.username || null,
                email: req.user.email || null,
            })
            return sendResponse(res, 400, "update is only allowed for title, body, tags");
        }

        const { title, body, tags } = req.body;

        if (!title && !body && !tags) {
            logger.info({
                operation: "update_blog_data",
                action: "required_fields_missing",
                message: "title, body, tags are missing in request",
                username: req.user.userId,
                email: req.user.email,
            })
            return sendResponse(res, 400, "title, body, tags are missing in request");
        }

        const normalizedTitle = title ? title.trim() : null;
        const normalizedBody = body ? body.trim() : null;
        const normalizedTags = tags ? tags.trim() : null;

        logger.info({
            operation: "update_blog_data",
            action: "normalized_input",
            message: "Normalized Values.",
            title: normalizedTitle,
            tags: normalizedTags,
            body: !isProd ? normalizedBody.substring(0, 50) : null,
        });

        if (normalizedTitle.length <= 1 || normalizedBody.length <= 1) {
            logger.info({
                operation: "create_blog",
                action: "validation_failed",
                message: "Title and Body should be more than 1 character long",
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",
            });

            return sendResponse(res, 400, "Title and Body should be more than 1 character long", {
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",
            })
        }

        if (normalizedTitle.length >= 80) {
            logger.info({
                operation: "create_blog",
                action: "validation_failed",
                message: "Title should be less than 80 characters",
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",

            });

            return sendResponse(res, 400, "Title and Body should be less than 80 character long", {
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",
            })
        }
        if (normalizedBody.length >= 10000000) {
            logger.info({
                operation: "create_blog",
                action: "validation_failed",
                message: "Body should be less than 10000000 character long",
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",
            });

            return sendResponse(res, 400, "Title and Body should be more than 1 character long", {
                title: normalizedTitle,
                body: normalizedBody.substring(0, 50) || "",
            })
        }

        const { id } = req.params;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, "Invalid user id");
        }


        const currentBlogData = await Blog.findById({ _id: id }).lean();

        if (!currentBlogData) {
            logger.info({
                operation: "update_blog_data",
                action: "not_found",
                message: "User not found",
                username: req.user.username,
                email: req.user.email,
            })

            return sendResponse(res, 404, "User not found");
        }

        const formattedCurrentBlogData = {
            ...currentBlogData,
            _id: currentBlogData._id.toString()
        };

        logger.info({
            operation: "update_blog_data",
            action: "fetched_current_user",
            message: "User fetched successfully",
            userId: formattedCurrentBlogData._id,
        })


        const updateData = {};
        if (req.body.title) updateData.title = normalizedTitle;
        if (req.body.body) updateData.body = normalizedBody;
        if (req.body.tags) updateData.tags = normalizedTags;

        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { $set: updateData },
            {
                returnDocument: 'after',
                runValidators: true
            }
        ).lean();


        const formattedUpdatedBlogData = {
            ...updatedBlog,
            _id: updatedBlog._id.toString()
        };

        return sendResponse(res, 200, "User data updated successfully", { olderUserData: formattedCurrentBlogData, updateUserData: formattedUpdatedBlogData });
    } catch (error) {

        logger.error({
            operation: "update_blog_data",
            action: "failed",
            message: "Error while updating user data",
            error: error,
            body: !isProd ? req?.body : null,
            blogId: req.params.id ? req.params.id : null,
            username: req.user.username,
            email: req.user.email,
            userId: req.user.userId,


        })
        return sendResponse(res, 500, "Error while updating blog data")
    }

}
