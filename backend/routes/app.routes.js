import { Router } from 'express';
import { signup } from '../controllers/auth.controller.js'
export const router = Router();

router.get('/', (req, res) => {
    res.status(200).json({ msg: "Hello from Server" })

});
