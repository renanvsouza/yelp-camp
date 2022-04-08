const router = require('express').Router()
const { catchError } = require('../utils/middleware')
const User = require('../models/user')
const passport = require('passport')

router.route('/register')
    .get((req, res, next) => {
        if (req.user) {
            req.flash('error', 'You are logged in. To register a different account, please logout first.')
            return res.redirect('/campgrounds')
        }
        res.render('users/register')
    })
    .post(catchError(async (req, res, next) => {
        const { username, email, password } = req.body
        const user = new User({
            email,
            username
        })
        //Try catch just to flash the error message in the same page
        try {
            //Saves to the DB, so no need to use save()
            const newUser = await User.register(user, password)
            req.login(newUser, (err) => {
                if (err) return next(err)
            })
            req.flash('success', 'Welcome!')
            res.redirect('/campgrounds')
        } catch (e) {
            req.flash('error', e.message)
            res.redirect('back')
        }
    }))

router.route('/login')
    .get((req, res, next) => {
        if (req.user) {
            req.flash('error', 'You are already logged in. To use a different account, please logout first.')
            return res.redirect('back')
        }
        res.render('users/login')
    })
    //Using the passport middleware to authenticate
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: 'back' }), (req, res, next) => {
        req.flash('success', 'Welcome back!')
        res.redirect('/campgrounds')
    })

router.route('/logout')
    .get((req, res, next) => {
        req.logOut()
        req.flash('success', 'Goodbye!')
        res.redirect('/campgrounds')
    })

module.exports = router