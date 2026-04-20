import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: "DD-MMM-YYYY hh:mm:ss A"
        }),
        winston.format.json()
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
})

logger.info('Logger started');


