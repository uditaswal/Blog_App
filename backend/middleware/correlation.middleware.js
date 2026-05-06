import { v4 as uuid } from "uuid";
import { asyncLocalStorage } from "../utils/requestContext.utils.js";

export const correlationMiddleware = (req, res, next) => {
    const correlationId = req.headers["x-correlation-id"] || uuid();;

    const store = {
        correlationId
    };

    res.setHeader("x-correlation-id", correlationId);
    asyncLocalStorage.run(store, () => {
        next();
    })
}
