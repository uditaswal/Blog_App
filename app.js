import path from 'path'
import express, { urlencoded } from 'express'
import dotenv from 'dotenv'
import { logger } from './utils/logger.utils.js';
import connectMongoDB from './dbConnection.js';
import { router } from './routes/app.routes.js';
// env:
dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 8000
const ENDPOINT = process.env.ENDPOINT || 'http://localhost:'
const dbURL = process.env.NODE_ENV === "production" ? `${process.env.prod_dbURI}&appName=${process.env.prod_dbAppName}` : `${process.env.test_dbURI}&appName=${process.env.test_dbAppName}`

//middleware
const app = express();

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



app.listen(PORT, () => {
    logger.info(`Server is listening for  ${process.env.NODE_ENV} env on ${PORT} at ${new Date().toLocaleString()} , Endpoint: ${ENDPOINT}${PORT} `);
})


// Connect to MongoDB:
connectMongoDB(dbURL);