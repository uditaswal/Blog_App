import path from 'path'
import { fileURLToPath } from 'url'
import express, { urlencoded } from 'express'
import { router } from './routes/app.routes.js';
import { userRouter } from './routes/user.routes.js';
import { logger } from './utils/logger.utils.js';
import cookieParse from "cookie-parser";
import { frontEndOrigin } from "./config/env.js"
import cors from "cors";

//middleware
export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: "false" }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.use((req, res, next) => {
    const start = Date.now();

    // logger.info(`REQ ${req.method} ${req.url} BODY=${JSON.stringify(req.body)}`);
    logger.info({
        message: "REQUEST",
        url: req.url,
        method: req.method,
        body: JSON.stringify(req.body),
    });

    res.on("finish", () => {
        const ms = Date.now() - start;

        logger.info({
            message: "RESPONSE",
            url: req.url,
            method: req.method,
            statusCode: res.statusCode,
            responseMessage: res.json,
            ExecutionTime: `${ms}ms`
        });
    });

    next();
});

// ejs
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, "views-legacy"))


// routes:
app.use('/', router);
app.use('/user', userRouter);

app.get('/test', (req, res) => {
    res.status(200).json({ msg: "OK" })
});


app.use((req, res) => {
    logger.error({ error: "HTTP 404! Page Not Found" })
    res.status(404).json({
        success: false,
        message: "Page Not Found"
    })
});

app.use((err, req, res) => {
    logger.error({ "error": err })
    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    })
});


// handling cookies

app.use(cookieParse());
app.use(express.json());

app.use(cors({
    origin: frontEndOrigin,
    credentials: true
}))