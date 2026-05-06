import { sanitizeResponse } from "./sanitizeResponse.utils.js"

export function sendResponse(res, statusCode, message, data) {
    const sanitizedData = sanitizeResponse(data);

    const response = {
        success: statusCode >= 200 && statusCode < 400,
        message,
        correlationID: res.getHeader("x-correlation-id")

    };

    if (sanitizedData !== undefined) {
        response.data = sanitizedData;
    }

    return res.status(statusCode).json(response);
}
