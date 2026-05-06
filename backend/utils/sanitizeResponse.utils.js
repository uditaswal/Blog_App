const SENSITIVE_FIELDS = new Set([
    "password",
    "adminPassword",
    "token",
    "__v",
]);

const isPlainObject = (value) => {
    if (!value || typeof value !== "object") return false;

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};

export const sanitizeUser = (user) => {
    if (!user || typeof user !== "object") return user;

    return sanitizeResponse({
        _id: user._id,
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
}

export const sanitizeResponse = (data) => {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(sanitizeResponse);
    }

    if (!isPlainObject(data)) {
        return data;
    }

    return Object.entries(data).reduce((sanitized, [key, value]) => {
        if (SENSITIVE_FIELDS.has(key)) return sanitized;

        sanitized[key] = sanitizeResponse(value);
        return sanitized;
    }, {});
};
