import { Router } from 'express';
import { signup } from '../controllers/auth.controller.js'
export const router = Router();

router.get('/', (req, res) => {
    // res.status(200).json({ msg: "Hello from Server" })
    res.render('home');

});

router.get('/signin', (req, res) => {
    return res.render('signin')
    // res.status(200).json({ msg: "Hello from Server" })

});

router.get('/signup', (req, res) => {
    res.render("signup", {
        error: null,
        fullName: "",
        email: ""
    });
});

router.post('/signup', signup);

