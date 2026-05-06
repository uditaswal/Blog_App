import { isProd } from "../config/env.js";
import { Blog } from "../models/blog.model.js";
import { logger } from "../utils/logger.utils.js";
import path from "path";
import { sendResponse } from "../utils/response.utils.js";

export async function newBlog(req, res) {
    const { title, body } = req.body;

    try {
        if (!isProd) {
            logger.info({
                operation: "create_blog",
                action: "received",
                message: "Request received for creating New Blog",
                body: !isProd ? req?.body : null,
                file_path: req.file?.path || null
            });
        }

        if (!title || !body || !req.file?.path) {
            logger.info({
                operation: "create_blog",
                action: "required_fields_missing",
                message: "Mandatory field missing",
                title: req.body?.title || null,
                body: !isProd ? req?.body : null,
                coverImagePath: req.body?.coverImagePath || null,
            });

            return sendResponse(res, 400, "Mandatory field missing", {
                title: req.body?.title || null,
                body: !isProd ? req?.body : null,
                coverImagePath: req.body?.coverImagePath || null
            });
        }

        const normalizedTitle = title.trim();
        const normalizedBody = body.trim();
        if (normalizedTitle.length <= 1 || normalizedBody.length <= 1) {
            logger.info({
                operation: "create_blog",
                action: "validation_failed",
                message: "Title and Body should be more than 1 character long",
                title: normalizedTitle,
                body: normalizedBody,

            });

            return sendResponse(res, 400, "Title and Body should be more than 1 character long", {
                title: normalizedTitle,
                body: normalizedBody,
            })
        }

        const coverImagePath = req.file.path;
        const curr_directory = process.cwd();
        const relativePath = path.relative(curr_directory, coverImagePath);

        const newBlog = await Blog.create({
            title: title,
            body: body,
            coverImagePath: relativePath,
            createdBy: req.user.userId
        })

        logger.info({
            operation: "create_blog",
            action: "completed",
            message: "Blog Created Successfully",
            title: newBlog.title,
            coverImagePath: relativePath,
            createdBy: newBlog.createdBy
        })

        return sendResponse(res, 201, "Blog Created Successfully", {
            title: newBlog.title,
            createdBy: newBlog.createdBy
        })

    } catch (error) {
        logger.error({
            operation: "create_blog",
            action: "failed",
            "message": "Error while creating new blog",
            "error": error,
            title: req.title,
            email: req.user.email


        });

        return sendResponse(res, 500, "Error while creating new blog", {
            title: req.title
        })

    }
}

