import { isProd } from "../config/env.js";
import { Blog } from "../models/blog.model.js";
import { logger } from "../utils/logger.utils.js";
import path from "path";

export async function newBlog(req, res) {
    const { title, body } = req.body;

    try {
        if (!isProd) {
            logger.info({
                message: "Request received for creating New Blog",
                body: req.body,
                file_path: req.file.path
            });
        }

        if (!title || !body || !req.file.path) {
            logger.info({
                message: "Mandatory field missing",
                title: req.body?.title || null,
                body: req.body?.body || null,
                coverImagePath: req.body?.coverImagePath || null,
            });

            return res.status(400).json({
                success: false,
                message: "Mandatory field missing",
                title: req.body?.title || null,
                body: req.body?.body || null,
                coverImagePath: req.body?.coverImagePath || null
            });
        }

        const normalizedTitle = title.trim();
        const normalizedBody = body.trim();
        if (normalizedTitle.length <= 1 || normalizedBody.length <= 1) {
            logger.info({
                message: "Title and Body should be more than 1 character long",
                title: normalizedTitle,
                body: normalizedBody,

            });

            return res.status(400).json({
                message: "Title and Body should be more than 1 character long",
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
            message: "Blog Created Successfully",
            title: newBlog.title,
            coverImagePath: relativePath,
            createdBy: newBlog.createdBy
        })

        return res.status(201).json({
            success: true,
            message: "Blog Created Successfully",
            title: newBlog.title,
            createdBy: newBlog.createdBy
        })

    } catch (error) {
        logger.error({
            "message": "Error while creating new blog",
            "error": error,
            title: req.title,
            email: req.user.email


        });

        res.status(500).json({
            success: false,
            message: "Error while creating new blog",
            title: req.title
        })

    }
}

