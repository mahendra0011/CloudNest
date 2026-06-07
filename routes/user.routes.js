const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
const {
    createGoogleLoginUrl,
    getGoogleProfileFromCode,
    verifyGoogleLoginState
} = require('../config/googleDrive');

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

function publicUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider
    };
}

function signToken(user) {
    return jwt.sign({
        userId: user._id,
        email: user.email,
        username: user.username
    }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
}

function normalizeGoogleUsername(profile) {
    const base = (profile.email?.split('@')[0] || profile.name || 'googleuser')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 22);

    return base.length >= 3 ? base : `user${base}`;
}

async function createUniqueUsername(profile) {
    const baseUsername = normalizeGoogleUsername(profile);
    let username = baseUsername;
    let suffix = 1;

    while (await userModel.exists({ username })) {
        username = `${baseUsername}${suffix}`;
        suffix += 1;
    }

    return username;
}

router.post('/register',
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters.'),
    body('email').trim().isEmail().withMessage('Enter a valid email address.'),
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters.'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid data'
            });
        }

        const { email, username, password } = req.body;
        const existingUser = await userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'Username or email is already registered.'
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            email,
            username,
            password: hashPassword
        });

        const token = signToken(newUser);
        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            user: publicUser(newUser)
        });
    });

router.post('/login',
    body('username').trim().isLength({ min: 3 }).withMessage('Username is required.'),
    body('password').trim().isLength({ min: 5 }).withMessage('Password is required.'),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid data'
            });
        }

        const { username, password } = req.body;
        const user = await userModel.findOne({ username });

        if (!user || !user.password) {
            return res.status(400).json({
                message: 'Username or password is incorrect.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Username or password is incorrect.'
            });
        }

        const token = signToken(user);
        res.cookie('token', token, cookieOptions);

        res.json({
            user: publicUser(user)
        });
    });

router.get('/google', (req, res, next) => {
    try {
        res.json({
            url: createGoogleLoginUrl()
        });
    } catch (err) {
        next(err);
    }
});

router.get('/google/callback', async (req, res, next) => {
    try {
        const { code, state, error } = req.query;
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        if (error) {
            return res.redirect(`${clientUrl}?auth=google-denied`);
        }

        if (!code || !state) {
            return res.status(400).json({
                message: 'Google login callback is missing code or state.'
            });
        }

        verifyGoogleLoginState(state);

        const profile = await getGoogleProfileFromCode(code);

        if (!profile.email) {
            return res.status(400).json({
                message: 'Google account did not return an email address.'
            });
        }

        let user = await userModel.findOne({
            $or: [
                { googleId: profile.googleId },
                { email: profile.email.toLowerCase() }
            ]
        });

        if (user) {
            user.googleId = user.googleId || profile.googleId;
            user.avatar = profile.avatar || user.avatar;
            user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
            await user.save();
        } else {
            user = await userModel.create({
                username: await createUniqueUsername(profile),
                email: profile.email.toLowerCase(),
                googleId: profile.googleId,
                avatar: profile.avatar,
                authProvider: 'google'
            });
        }

        const token = signToken(user);
        res.cookie('token', token, cookieOptions);

        res.redirect(`${clientUrl}?auth=google-success`);
    } catch (err) {
        next(err);
    }
});

router.get('/me', authMiddleware, (req, res) => {
    res.json({
        user: publicUser(req.user)
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({
        message: 'Logged out'
    });
});

module.exports = router;
