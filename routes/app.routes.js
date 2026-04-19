import { Router } from 'express'
import User from '../models/user.models.js';
export const router = Router();

router.get('/', (req, res) => {
    // res.status(200).json({ msg: "Hello from Server" })
    res.render('home')

});

router.get('/signin', (req, res) => {
    return res.render('signin')
    // res.status(200).json({ msg: "Hello from Server" })

});

router.get('/signup', (req, res) => {
    return res.render('signup')
});

router.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;
    await User.create({ fullName, email, password });
    return res.redirect("/")
});

