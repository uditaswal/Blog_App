import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { router } from './routes/app.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { blogRouter } from './routes/blogs.routes.js';
import { userRouter } from './routes/user.routes.js';
import { logger } from './utils/logger.utils.js';
import cookieParser from "cookie-parser";
import { frontEndOrigin } from "./config/env.js"
import cors from "cors";

//middleware
export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors({
  origin: frontEndOrigin,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  const start = Date.now();

  const originalJson = res.json;

  res.json = function (body) {
    res.locals.responseBody = body;
    return originalJson.call(this, body);
  };
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
      ExecutionTime: `${ms}ms`,
      success: res.locals.responseBody?.success,
      responseMessage: res.locals.responseBody?.message
    });
  });
  next();
});

// routes:
app.use('/', router);
app.use('/auth', authRouter);
app.use('/blog', blogRouter);
app.use('/user', userRouter);

app.get('/test', (req, res) => {
  res.status(200).json({ msg: "OK" })
});


app.use((req, res) => {
  logger.error({ error: "HTTP 404! Page Not Found" });

  res.status(404).json({
    success: false,
    message: "Page Not Found"
  });
});

app.use((err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
  next()
});