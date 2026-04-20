import path from 'path'
import express, { urlencoded } from 'express'
import { router } from './routes/app.routes.js';
import { logger } from './utils/logger.utils.js';

//middleware
export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: "false" }))

app.use((req, res, next) => {
    const start = Date.now();

    logger.info(`REQ ${req.method} ${req.url} BODY=${JSON.stringify(req.body)}`);

    res.on("finish", () => {
        const ms = Date.now() - start;

        logger.info(
            `RES ${req.method} ${req.url} STATUS=${res.statusCode} TIME=${ms}ms`
        );
    });

    next();
});

// ejs
app.set('view engine', 'ejs')
app.set('views', path.resolve("./views"))


// routes:
app.use('/', router);

app.get('/test', (req, res) => {
    res.status(200).json({ msg: "OK" })
});
