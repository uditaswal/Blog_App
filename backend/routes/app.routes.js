import { Router } from 'express';
import { sendResponse } from '../utils/response.utils.js';
export const router = Router();

router.get('/', (req, res) => {
    return sendResponse(res, 200, "Hello from Server")

});
