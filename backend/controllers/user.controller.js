
import mongoose from "mongoose"
import { logger } from "../utils/logger.utils.js"
import User from "../models/user.models.js"
import path from "path";
import { defaultImgPath } from "../config/env.js"
import { sendResponse } from "../utils/response.utils.js";

export async function getAllUsersList(req, res) {
    try {
        if (!req.user) {
            logger.info({
                message: "user token is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null
            })

            return sendResponse(res, 400, "Authentication failed, Sign in Again");
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

            return sendResponse(res, 400, "ADMIN privilege is required to fetch user list");
        }

        const usersList = await User.find({}).lean();

        if (!usersList) {
            logger.info({
                message: "No users found",
                username: req.user.loginId,
                email: req.user.email,
            })
            return sendResponse(res, 404, "No users not found");
        }


        const formattedUserList = usersList.map(user => ({
            ...user,
            _id: user._id.toString()
        }));

        logger.info({
            message: "User list fetched successfully",
            usersList: formattedUserList,
            // usersList_Length: usersList.length;
        })

        return sendResponse(res, 200, "User list fetched successfully", { users: formattedUserList });



    } catch (error) {

        logger.error({
            message: "Error while fetching user data",
            error: error,
            body: req.body
        })


        return sendResponse(res, 500, "Error while fetching user data")
    }

}
export async function getUserById(req, res) {
    try {
        if (!req.user) {
            logger.info({
                message: "user token is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null
            })

            return sendResponse(res, 400, "Authentication failed, Sign in Again");
        }

        const { id } = req.params;

        if (!id) {
            logger.info({
                message: "user id token is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null,
                id: req?.params || null
            })

            return sendResponse(res, 400, "user id token is not present in request");
        }


        logger.info({
            message: "Request received to fetch user data",
            username: req?.user.loginId,
            email: req.user.email,
            id: id,
        })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, "Invalid user ID");
        }


        if (req.user.role !== "ADMIN") {
            logger.info({
                message: "ADMIN privilege is required to fetch user list",
                username: req.user.loginId,
                email: req.user.email,
                user: req.user
            })

            return sendResponse(res, 400, "ADMIN privilege is required to fetch user list");
        }

        const users = await User.findById(id).lean();


        // for (users in users_list_json) {
        //     console.log(`${users_list_json.username[users]}`)
        // }

        if (!users) {
            logger.info({
                message: "User not found",
                username: req.user.loginId,
                email: req.user.email,
                id: id,
            })



            return sendResponse(res, 404, "User not found");
        }


        const formattedUserData = {
            ...users,
            _id: users._id.toString()
        };

        logger.info({
            message: "User  fetched successfully",
            usersList: formattedUserData,
        })

        return sendResponse(res, 200, "User data fetched successfully", { users: formattedUserData });



    } catch (error) {

        logger.error({
            message: "Error while fetching user data",
            error: error,
            body: req.body
        })


        return sendResponse(res, 500, "Error while fetching user data")
    }
}

export async function deleteUserById(req, res) {
    try {
        if (!req.user) {
            logger.info({
                message: "user token is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null
            })

            return sendResponse(res, 400, "Authentication failed, Sign in Again");
        }

        const { id } = req.params;

        if (!id) {
            logger.info({
                message: "user id token is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null,
                id: req?.params || null
            })

            return sendResponse(res, 400, "user id token is not present in request");
        }


        logger.info({
            message: "Request received to fetch user data",
            username: req?.user.loginId,
            email: req.user.email,
            id: id,
        })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, "Invalid user ID");
        }


        if (req.user.role !== "ADMIN") {
            logger.info({
                message: "ADMIN privilege is required to fetch user list",
                username: req.user.loginId,
                email: req.user.email,
                user: req.user
            })

            return sendResponse(res, 400, "ADMIN privilege is required to fetch user list");
        }

        const users = await User.findById(id).lean();

        if (!users) {
            logger.info({
                message: "User not found",
                username: req.user.loginId,
                email: req.user.email,
                id: id,
            })



            return sendResponse(res, 404, "User not found");
        }


        const formattedUserData = {
            ...users,
            _id: users._id.toString()
        };

        logger.info({
            message: "User  fetched successfully",
            usersList: formattedUserData,
        })

        await User.findByIdAndDelete(id);


        return sendResponse(res, 200, "User deleted successfully", { users: formattedUserData });



    } catch (error) {

        logger.error({
            message: "Error while deleting user data",
            error: error,
            body: req.body
        })


        return sendResponse(res, 500, "Error while deleting user data")
    }

}



export async function updateProfileImg(req, res) {
    try {
        logger.info({
            message: "Request received on updateProfileImg",
            email: req?.body.email || null,
            username: req?.body.username || null,
            userId: req?.user.userId || null,
            file_path: req?.file?.path || null

        })
        if (!req.user.userId) {
            logger.error({
                error: "userId not found in request",
                body: req.body,
                user: req.user,
            })
            return sendResponse(res, 403, "Please sign in again")
        } if (!req.file?.path) {
            logger.error({
                error: "Picture not found in request",
                body: req.body,
                user: req.user,
            })
            return sendResponse(res, 400, "Picture not found, please upload again")
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

        return sendResponse(res, 200, "Profile Image uploaded successfully")

    } catch (error) {

        logger.error({
            message: "Error while uploading profile image",
            error: error,
            request: req.body,
            email: req.body.email,
            username: req.body.username,
        })

        return sendResponse(res, 500, "Error while uploading profile image")
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

            return sendResponse(res, 403, "Authentication failed, Signin Again")
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

        return sendResponse(res, 200, "Profile Picture deleted successfully")

    } catch (error) {
        logger.error({
            message: "Error while deleting profileImage",
            user: req.user.userId,
            email: req.user.email,
            error: error
        });

        return sendResponse(res, 500, "Error while deleting profileImage")
    }

}
