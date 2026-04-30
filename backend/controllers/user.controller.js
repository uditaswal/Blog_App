
import { logger } from "../utils/logger.utils.js"
import User from "../models/user.models.js"
import path from "path";
import { defaultImgPath } from "../config/env.js"

export async function userList(req, res) {

    try {
        if (!req.user) {
            logger.info({
                message: "user token is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null
            })

            return res.status(400).json({
                success: false,
                message: "Authentication failed, Sign in Again",

            });
        }
        logger.info({
            message: "Request received to fetch user data",
            username: req?.user.loginId,
            email: req.user.email,
        })

        if (req.user.role !== "ADMIN") {
            logger.info({
                message: "ADMIN privilege is required to fetch user list",
                username: req.user.loginId,
                email: req.user.email,
                user: req.user
            })

            return res.status(400).json({
                success: false,
                message: "ADMIN privilege is required to fetch user list",

            });
        }

        const usersList = await User.find({})
        const users_list_json = JSON.stringify(usersList);

        // for (users in users_list_json) {
        //     console.log(`${users_list_json.username[users]}`)
        // }



        logger.info({
            message: "User list fetched successfully",
            usersList: users_list_json,
            // usersList_Length: usersList.length;
        })

        return res.status(200).json({
            success: false,
            message: "User list fetched successfully",

        });



    } catch (error) {

        logger.error({
            message: "Error while fetching user data",
            error: error,
            body: req.body
        })


        return res.status(500).json({
            success: false,
            message: "Error while fetching user data"
        })
    }

}

export async function updateProfileImg(req, res) {
    try {
        logger.info({
            message: "Request received on updateProfileImg",
            email: req?.body.email || null,
            username: req?.body.username || null,
            userId: req?.user.userId || null,
            file_path: req?.file.path || null

        })
        if (!req.user.userId) {
            logger.error({
                error: "userId not found in request",
                body: req.body,
                user: req.user,
            })
            res.status(403).json({
                success: false,
                message: "Please sign in again"
            })
        } if (!req.file.path) {
            logger.error({
                error: "Picture not found in request",
                body: req.body,
                user: req.user,
            })
            res.status(400).json({
                success: false,
                message: "Picture not found, please upload again"
            })
        }

        const file_path = req.file.path;
        const curr_directory = process.cwd();
        const profileImagePath = path.relative(curr_directory, file_path)

        const user = await User.findOneAndUpdate(
            { _id: req.user.userId },
            { $set: { profileImageURL: profileImagePath } },
        )

        logger.info({
            message: "Profile Image uploaded successfully",
            user: user,
            profileImagePath: profileImagePath
        })

        res.status(200).json({
            success: true,
            message: "Profile Image uploaded successfully",
        })

    } catch (error) {

        logger.error({
            message: "Error while uploading profile image",
            error: error,
            request: req.body,
            email: req.body.email,
            username: req.body.username,
        })

        res.status(500).json({
            success: false,
            message: "Error while uploading profile image"
        })
    }
}

export async function deleteProfileImage(req, res) {
    try {
        if (!req.user.userId) {
            logger.info({
                message: "Cannot deleteProfileImage as userId is missing",
                user: req?.user.userId || null,
                email: req?.user.email || null,
            });

            return res.status(403).json({
                success: false,
                message: "Authentication failed, Signin Again"
            })
        }

        logger.info({
            message: "Request received to deleteProfileImage",
            user: req.user.userId,
            email: req.user.email,
        });

        const user = await User.findOneAndUpdate({
            _id: req.user.userId,
        },
            { $set: { profileImageURL: defaultImgPath } })

        logger.info({
            message: "Profile Picture deleted successfully",
            user: user._id,
            user: user.email,
        })

        return res.status(200).json({
            success: true,
            message: "Profile Picture deleted successfully",
        })

    } catch (error) {
        logger.error({
            message: "Error while deleting profileImage",
            user: req.user.userId,
            email: req.user.email,
            error: error
        });

        return res.status(500).json({
            success: false,
            message: "Error while deleting profileImage",

        })
    }

}