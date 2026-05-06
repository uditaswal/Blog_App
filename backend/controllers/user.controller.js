
import mongoose from "mongoose"
import { logger } from "../utils/logger.utils.js"
import User from "../models/user.models.js"
import path from "path";
import { defaultImgPath } from "../config/env.js"
import { sendResponse } from "../utils/response.utils.js";
import { isProd } from "../config/env.js";

export async function deleteUserOwnAccount(req, res) {
    try {
        if (!req.user) {
            logger.info({
                operation: "delete_user_data",
                action: "auth_missing",
                message: "user token is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null,
                user: !isProd ? req?.user : null,
            })
            return sendResponse(res, 400, "Authentication failed, Sign in Again");
        }

        const id = req.user.userId;

        if (!id) {
            logger.info({
                operation: "delete_user_data",
                action: "user_id_missing",
                message: "user id is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null,
                id: req?.params || null
            })

            return sendResponse(res, 400, "User id is not present in request, Please login again");
        }

        logger.info({
            operation: "delete_user_data",
            action: "received",
            message: "Request received to delete user own account",
            username: req?.user.loginId,
            email: req.user.email,
            id: id,
        });


        if (req.user.userId !== id) {
            logger.info({
                operation: "delete_user_data",
                action: "unauthorized",
                message: "User not authorized to delete this account",
                username: req?.user.loginId,
                email: req.user.email,
                id: id,
            })
            return sendResponse(res, 400, "User not authorized to delete this account");
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, "Invalid user ID");
        }

        const users = await User.findById(id).lean();

        if (!users) {
            logger.info({
                operation: "delete_user_data",
                action: "not_found",
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
            operation: "delete_user_data",
            action: "fetched",
            message: "User fetched successfully",
            userId: formattedUserData._id,
        })

        await User.findByIdAndDelete(id);

        return sendResponse(res, 200, "User deleted successfully", { users: formattedUserData });
    } catch (error) {

        logger.error({
            operation: "delete_user_data",
            action: "failed",
            message: "Error while deleting user data",
            error: error,
            body: req.body
        })
        return sendResponse(res, 500, "Error while deleting user data")
    }

}

export async function updateUserProfileData(req, res) {

    try {
        if (!req.user) {
            logger.info({
                operation: "update_user_data",
                action: "auth_missing",
                message: "user token is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null,
                user: !isProd ? req?.user : null
            })
            return sendResponse(res, 400, "Authentication failed, Sign in Again");
        }

        logger.info({
            operation: "update_user_data",
            action: "received",
            message: "Request received to update user data",
            username: req.user.loginId,
            email: req.user.email,
            body: req.body,
        });

        const allowedFields = ["fullName", "username"];

        const bodyKeys = Object.keys(req.body);

        const isValid = bodyKeys.every(key => allowedFields.includes(key))

        if (!isValid) {
            logger.info({
                operation: "update_user_data",
                action: "invalid_fields",
                message: "update is only allowed for username or fullName",
                username: req.user.loginId || null,
                email: req.user.email || null,
                body: req.body
            })
            return sendResponse(res, 400, "update is only allowed for username and fullName");
        }

        const { fullName, username } = req.body;

        if (!fullName || !username) {
            logger.info({
                operation: "update_user_data",
                action: "required_fields_missing",
                message: "Both fullName and username is missing  ",
                username: req.user.loginId,
                email: req.user.email,
                body: req.user.body,
            })
            return sendResponse(res, 400, "Both fullName and username is missing");
        }

        const normalizedUsername = username.trim().toLowerCase();

        logger.info({
            operation: "update_user_data",
            action: "normalized_input",
            message: "Normalized Values.",
            fullName: fullName,
            username: normalizedUsername,
        });


        if (normalizedUsername.length >= 20 || normalizedUsername.length <= 6) {
            logger.error({
                operation: "update_user_data",
                action: "validation_failed",
                error: "username should be either more than 6 digit and less than 20 digit long",
                fullName: fullName,
                username: normalizedUsername,
                username_length: normalizedUsername.length
            })

            return sendResponse(res, 400, "username should be either more than 6 digit and less than 20 digit long")
        }

        const existingUser = await User.findOne({
            username: normalizedUsername
        });

        logger.info({
            operation: "update_user_data",
            action: "duplicate_check",
            message: "Existing user lookup completed",
            existingUserId: existingUser?._id || null,
        })

        if (existingUser) {

            if (existingUser.username === normalizedUsername) {
                logger.error({
                    operation: "update_user_data",
                    action: "duplicate_username",
                    error: `${username} already exist in DB`
                })
                return sendResponse(res, 400, "Username already taken.");
            }
        }


        const currentUserData = await User.findById({ _id: req.user.userId }).lean();

        if (!currentUserData) {
            logger.info({
                operation: "update_user_data",
                action: "not_found",
                message: "User not found",
                username: req.user.loginId,
                email: req.user.email,
            })

            return sendResponse(res, 404, "User not found");
        }

        const formattedCurrentUserData = {
            ...currentUserData,
            _id: currentUserData._id.toString()
        };

        logger.info({
            operation: "update_user_data",
            action: "fetched_current_user",
            message: "User fetched successfully",
            userId: formattedCurrentUserData._id,
        })

        const updateData = {};
        if (req.body.fullName) updateData.fullName = req.body.fullName;
        if (req.body.username) updateData.username = req.body.username;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updateData },
            // { returnDocument: 'after' }
            {
                returnDocument: 'after',
                runValidators: true
            }
        ).lean();


        const formattedUpdatedUserData = {
            ...updatedUser,
            _id: updatedUser._id.toString()
        };

        return sendResponse(res, 200, "User data updated successfully", { olderUserData: formattedCurrentUserData, updateUserData: formattedUpdatedUserData });
    } catch (error) {

        logger.error({
            operation: "update_user_data",
            action: "failed",
            message: "Error while updating user data",
            error: error,
            body: req.body
        })
        return sendResponse(res, 500, "Error while updating user data")
    }

}

export async function updateProfileImg(req, res) {
    try {
        logger.info({
            operation: "update_profile_image",
            action: "received",
            message: "Request received on updateProfileImg",
            email: req?.body.email || null,
            username: req?.body.username || null,
            userId: req?.user.userId || null,
            file_path: req?.file?.path || null,
            user: !isProd ? req?.user : null

        })
        if (!req.user.userId) {
            logger.error({
                operation: "update_profile_image",
                action: "user_id_missing",
                error: "userId not found in request",
                body: req.body,
                user: req.user,
            })
            return sendResponse(res, 403, "Please sign in again")
        } if (!req.file?.path) {
            logger.error({
                operation: "update_profile_image",
                action: "file_missing",
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
            {
                returnDocument: 'after',
                runValidators: true
            }
        )

        logger.info({
            operation: "update_profile_image",
            action: "completed",
            message: "Profile Image uploaded successfully",
            userId: user?._id,
            profileImagePath: profileImagePath
        })

        return sendResponse(res, 200, "Profile Image uploaded successfully")

    } catch (error) {

        logger.error({
            operation: "update_profile_image",
            action: "failed",
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
                operation: "delete_profile_image",
                action: "user_id_missing",
                message: "Cannot deleteProfileImage as userId is missing",
                userId: req?.user.userId || null,
                email: req?.user.email || null,
                user: !isProd ? req?.user : null
            });

            return sendResponse(res, 403, "Authentication failed, Signin Again")
        }

        logger.info({
            operation: "delete_profile_image",
            action: "received",
            message: "Request received to deleteProfileImage",
            user: req.user.userId,
            email: req.user.email,
        });

        const user = await User.findOneAndUpdate({
            _id: req.user.userId,
        },
            { $set: { profileImageURL: defaultImgPath } },
            {
                returnDocument: 'after',
                runValidators: true
            })

        logger.info({
            operation: "delete_profile_image",
            action: "completed",
            message: "Profile Picture deleted successfully",
            user: user._id,
            email: user.email,
        })

        return sendResponse(res, 200, "Profile Picture deleted successfully")

    } catch (error) {
        logger.error({
            operation: "delete_profile_image",
            action: "failed",
            message: "Error while deleting profileImage",
            user: req.user.userId,
            email: req.user.email,
            error: error
        });

        return sendResponse(res, 500, "Error while deleting profileImage")
    }

}


