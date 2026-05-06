
import mongoose from "mongoose"
import { logger } from "../utils/logger.utils.js"
import User from "../models/user.models.js"
import { sendResponse } from "../utils/response.utils.js";
import { isProd } from "../config/env.js";

export async function getAllUsersList(req, res) {
    try {
        if (!req.user) {
            logger.info({
                operation: "get_users_list",
                action: "auth_missing",
                message: "user token is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null
            })

            return sendResponse(res, 400, "Authentication failed, Sign in Again");
        }
        logger.info({
            operation: "get_users_list",
            action: "received",
            message: "Request received to fetch user data",
            username: req?.user.loginId,
            email: req.user.email,
        })

        if (req.user.role !== "ADMIN") {
            logger.info({
                operation: "get_users_list",
                action: "unauthorized",
                message: "ADMIN privilege is required to fetch user list",
                username: req.user.loginId,
                email: req.user.email,
                user: !isProd ? req?.user : null
            })

            return sendResponse(res, 400, "ADMIN privilege is required to fetch user list");
        }

        const usersList = await User.find({}).lean();

        if (!usersList) {
            logger.info({
                operation: "get_users_list",
                action: "not_found",
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
            operation: "get_users_list",
            action: "completed",
            message: "User list fetched successfully",
            userCount: formattedUserList.length,
        })

        return sendResponse(res, 200, "User list fetched successfully", { users: formattedUserList });
    } catch (error) {

        logger.error({
            operation: "get_users_list",
            action: "failed",
            message: "Error while fetching user data",
            error: error,
            body: !isProd ? req?.body : null
        })


        return sendResponse(res, 500, "Error while fetching user data")
    }

}

export async function getUserById(req, res) {
    try {
        if (!req.user) {
            logger.info({
                operation: "get_user_data",
                action: "auth_missing",
                message: "user token is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null,
                user: !isProd ? req?.user : null,

            })

            return sendResponse(res, 400, "Authentication failed, Sign in Again");
        }

        const { id } = req.params;

        if (!id) {
            logger.info({
                operation: "get_user_data",
                action: "user_id_missing",
                message: "user id is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null,
                id: req?.params || null
            })

            return sendResponse(res, 400, "user id is not present in request");
        }
        logger.info({
            operation: "get_user_data",
            action: "received",
            message: "Request received to fetch user data",
            username: req?.user.loginId,
            email: req.user.email,
            user: !isProd ? req?.user : null,
            id: id,
        })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(res, 400, "Invalid user ID");
        }
        if (req.user.role !== "ADMIN") {
            logger.info({
                operation: "get_user_data",
                action: "unauthorized",
                message: "ADMIN privilege is required to fetch user list",
                username: req.user.loginId,
                email: req.user.email,
                user: !isProd ? req?.user : null
            })
            return sendResponse(res, 400, "ADMIN privilege is required to fetch user list");
        }
        const users = await User.findById(id).lean();
        if (!users) {
            logger.info({
                operation: "get_user_data",
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
            operation: "get_user_data",
            action: "completed",
            message: "User  fetched successfully",
            userId: formattedUserData._id,
        })

        return sendResponse(res, 200, "User data fetched successfully", { users: formattedUserData });
    } catch (error) {

        logger.error({
            operation: "get_user_data",
            action: "failed",
            message: "Error while fetching user data",
            error: error,
            body: !isProd ? req?.body : null
        })


        return sendResponse(res, 500, "Error while fetching user data")
    }
}

export async function deleteUserData(req, res) {
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

        const { id } = req.params;

        if (!id) {
            logger.info({
                operation: "delete_user_data",
                action: "user_id_missing",
                message: "user id is not present in request",
                username: req?.user.loginId || null,
                email: req?.user.email || null,
                id: req?.user.userId || null
            })

            return sendResponse(res, 400, "user id is not present in request");
        }

        logger.info({
            operation: "delete_user_data",
            action: "received",
            message: "Request received to delete user data",
            username: req?.user.loginId,
            email: req.user.email,
            id: id,
        })

        if (req.user.role !== "ADMIN") {

            logger.info({
                operation: "delete_user_data",
                action: "unauthorized",
                message: "Unauthorized to delete this user",
                username: req?.user.loginId,
                email: req.user.email,
                id: id,
            })

            return sendResponse(res, 403, "Unauthorized to delete this user");
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

        if (users.role == "ADMIN") {
            logger.info({
                operation: "delete_user_data",
                action: "admin_delete_blocked",
                message: "Can't delete admin account",
                username: req.user.loginId,
                email: req.user.email,
                id: id,
            })

            return sendResponse(res, 400, "Can't delete admin account");
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
            body: !isProd ? req?.body : null
        })
        return sendResponse(res, 500, "Error while deleting user data")
    }

}
