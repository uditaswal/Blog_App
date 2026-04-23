import { Router } from 'express'
import User from '../models/user.models.js';
export const userRouter = Router();

router.get('/', (req, res) => {
    res.status(200).json({ msg: "Hello from Server" })
});

router.post('/signup',);

router.post('/signin',)