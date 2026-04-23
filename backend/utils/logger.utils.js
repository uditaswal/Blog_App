import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { isProd } from '../config/env.js'
import path from 'path';
import { fileURLToPath } from "url";

function getCaller() {
    const old = Error.prepareStackTrace;

    try {
        const err = new Error();
        Error.prepareStackTrace = (_, stack) => stack;

        const stack = err.stack;

        for (const frame of stack) {
            let file = frame.getFileName();
            if (!file) continue;

            if (file.startsWith("file://")) {
                file = fileURLToPath(file);
            }

            const normalized = file.replace(/\\/g, "/");

            if (
                !normalized.includes("node_modules") &&
                !normalized.endsWith("/logger.utils.js") &&
                !normalized.includes("node:internal")


            ) {
                return {
                    file: path.basename(file),
                    path: path.relative(process.cwd(), file),
                    line: frame.getLineNumber()
                };
            }
        }

        return {};
    } finally {
        Error.prepareStackTrace = old;
    }
}


export const sanitize = (info) => {
    if (!isProd) return info;
    const clone = { ...info };

    if (clone.body && typeof clone.body === "string") {
        try {
            const body = JSON.parse(clone.body);
            clone.body = sanitizePayload(body);
        } catch {
            // Keep the original body when it is not valid JSON.
        }
    } else if (clone.body && typeof clone.body === "object") {
        clone.body = sanitizePayload(clone.body);
    }
    return clone;
};

const maskEmail = (email) => {
    if (!email) return email;
    const [name, domain] = email.split("@");
    return name.slice(0, 2) + "***@" + domain;
};

const sanitizePayload = (payload) => {
    if (!payload || typeof payload !== "object") return payload;
    const sanitizedPayload = { ...payload };

    if (sanitizedPayload.password) sanitizedPayload.password = "[Redacted]";
    if (sanitizedPayload.token) sanitizedPayload.token = "[Redacted]";
    if (sanitizedPayload.email) sanitizedPayload.email = maskEmail(sanitizedPayload.email);

    return sanitizedPayload;
};

const sanitizeFormat = winston.format((info) => {
    return sanitize(info);
});

const orderedJsonFormat = winston.format.printf((info) => {
    return JSON.stringify(info);
});

const orderedFormat = winston.format((info) => {
    // Pull out all known keys
    const { level, timestamp, message, url, method, statusCode,
        ExecutionTime, body, file, path, line, ...rest } = info;

    // Delete all enumerable keys from info
    for (const key of Object.keys(info)) {
        delete info[key];
    }

    const defined = (key, val) => {
        if (val !== undefined && val !== null) info[key] = val;
    };

    // Re-assign in the exact order you want
    defined('timestamp', timestamp);
    defined('level', level);
    defined('message', message);
    defined('method', method);
    defined('url', url);
    defined('statusCode', statusCode);
    defined('ExecutionTime', ExecutionTime);
    defined('body', body);

    // any extra fields in the middle
    for (const [key, val] of Object.entries(rest)) {
        info[key] = val;
    }

    // caller info at the end
    defined('path', path);
    defined('file', file);
    defined('line', line);

    return info;  // return the same object, Symbols intact
});


const baseLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        // addCallerInfo(),
        sanitizeFormat(),
        winston.format.timestamp({
            format: "DD-MMM-YYYY hh:mm:ss A"
        }),
        orderedFormat(),
        orderedJsonFormat
    ),
    // defaultMeta: { service: 'user-service' },
    transports: [
        new DailyRotateFile({
            filename: 'logs/log-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d'
        })
        ,
        new winston.transports.Console(),
    ]
});

export const logger = {
    info(message) {
        const payload = typeof message === "object" && message !== null
            ? { ...message, ...getCaller() }   // spread object fields to top level
            : { message, ...getCaller() };      // keep string as message field
        baseLogger.info(payload);
    },

    error(message) {
        const payload = typeof message === "object" && message !== null
            ? { ...message, ...getCaller() }
            : { message, ...getCaller() };
        baseLogger.error(payload);
    },

    warn(message) {
        const payload = typeof message === "object" && message !== null
            ? { ...message, ...getCaller() }
            : { message, ...getCaller() };
        baseLogger.warn(payload);
    }
};



logger.info('Logger started');


