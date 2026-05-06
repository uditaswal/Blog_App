import { sanitizeResponse } from "../utils/sanitizeResponse.utils.js"
import { logger } from "../utils/logger.utils.js";

export const sanitizeMiddleware = () => {
    return (req, res, next) => {
        const originalJson = res.json;

        res.json = function (data) {
            try {
                return originalJson.call(this, sanitizeResponse(data));
            } catch (err) {

                logger.error({
                    operation: "sanitize_response",
                    action: "failed",
                    message: "Error while sanitizing response",
                    error: err,
                    username: req?.user.loginId || null,
                    email: req?.user.email || null,

                })
                return originalJson.call(this, {
                    success: false,
                    message: "Error while sanitizing response"
                });
            }
        };

        next();
    };
};

