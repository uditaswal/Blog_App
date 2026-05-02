export function sendResponse(res, statusCode, message, data) {
    const response = {
        success: statusCode >= 200 && statusCode < 400,
        message
    };

    if (data !== undefined && data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
}
