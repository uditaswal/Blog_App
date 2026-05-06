
import multer from "multer"
import path from "path";
import fs from "fs";
import { logger } from "./logger.utils.js";
import { isProd } from "../config/env.js";
import AppError from "../errors/AppError.js"

export function createUploader(folderName, filePrefix) {

    const fileTypeFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            logger.error({
                operation: "upload_file",
                action: "invalid_file_type",
                error: "Only image files are allowed!",
                user: !isProd ? req?.user : null,
                file_originalname: file.originalname,

            })
            const err = new Error("Only image files are allowed");
            err.statusCode = 400;
            cb(new AppError("Only image files are allowed", 400)
                , false)
        }
    }

    const storage = multer.diskStorage({

        destination: function (req, file, cb) {
            try {
                const dir = filePrefix === "profileImage" ? path.resolve(`./public/uploads/${folderName}/`) : path.resolve(`./public/uploads/${folderName}/${req.user.userId}`);
                fs.mkdirSync(dir, { recursive: true });
                logger.info(
                    {
                        operation: "upload_file",
                        action: "directory_created",
                        message: `${dir} created successfully for ${filePrefix}`,
                        request: !isProd ? req?.body : null,
                        username: !isProd ? req?.user : null

                    });
                cb(null, dir);
            } catch (error) {
                logger.info(
                    {
                        operation: "upload_file",
                        action: "directory_create_failed",
                        message: `Error while creating directory for uploading ${filePrefix}`,
                        error: error
                    })
            }
        },
        filename(req, file, cb) {
            try {
                const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname);
                const fileName = filePrefix === "profileImage" ? `${filePrefix}_${req.user.userId}_${uniqueSuffix}${ext}` : `${filePrefix}_${uniqueSuffix}${ext}`;
                logger.info(
                    {
                        operation: "upload_file",
                        action: "filename_created",
                        message: `${fileName} created successfully`,
                        request: !isProd ? req?.body : null,
                        user: !isProd ? req?.user : null,
                        file_originalname: file.originalname,
                        fileName: fileName

                    });

                cb(null, fileName);

            } catch (error) {
                logger.info(
                    {
                        operation: "upload_file",
                        action: "filename_create_failed",
                        message: `Error while creating name for ${filePrefix}`,
                        error: error
                    })
            }
        },
    })

    return multer({
        storage: storage,
        fileFilter: fileTypeFilter,
        limits: { fileSize: 10 * 1024 * 1024 }
    })
}

export const coverUpload =
    createUploader("blogs", "coverImage");

export const profileImage =
    createUploader("user_avatars", "profileImage");
