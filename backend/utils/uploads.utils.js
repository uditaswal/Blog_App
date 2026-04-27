
import multer from "multer"
import path from "path";
import fs from "fs";
import { logger } from "./logger.utils.js";

export function createUploader(folderName, filePrefix) {


    const storage = multer.diskStorage({

        destination: function (req, file, cb) {

            try {
                const dir = filePrefix === "profileImage" ? path.resolve(`./public/uploads/${folderName}/`) : path.resolve(`./public/uploads/${folderName}/${req.user.userId}`);
                fs.mkdirSync(dir, { recursive: true });
                logger.info(
                    {
                        message: `${dir} created successfully for ${filePrefix}`,
                        request: req.body,
                        username: req.user

                    });
                cb(null, dir);
            } catch (error) {
                logger.info(
                    {
                        message: `Error while creating directory for uploading ${filePrefix}`,
                        error: error
                    })
            }
        },
        filename(req, file, cb) {
            try {
                const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname);
                const fileName = filePrefix === "profileImage" ? `${filePrefix}_${req.body.username}_${uniqueSuffix}${ext}` : `${filePrefix}_${uniqueSuffix}${ext}`;
                logger.info(
                    {
                        message: `${fileName} created successfully`,
                        request: req.body,
                        username: req.user,
                        file_originalname: file.originalname,
                        fileName: fileName

                    });

                cb(null, fileName);

            } catch (error) {
                logger.info(
                    {
                        message: `Error while creating name for ${filePrefix}`,
                        error: error
                    })
            }
        },
    })


    return multer({ storage: storage })

}

export const coverUpload =
    createUploader("blogs", "coverImage");

export const profileImage =
    createUploader("user_avatars", "profileImage");