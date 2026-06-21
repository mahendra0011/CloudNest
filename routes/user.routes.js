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
const { resolveRole, isAdminEmail } = require('../config/admin');
const { recordActivity } = require('../services/activity.service');

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

function publicUser(user) {
    return {
        id: user._id,
        name: user.name || null,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
        role: user.role || 'user'
    };
}

function signToken(user) {
    return jwt.sign({
        userId: user._id,
        email: user.email
    }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
}

async function logActivity(user, action, details) {
    try {
        await recordActivity({ user, action, details });
    } catch (_) {
        // non-blocking audit log
    }
}

function emailLocalPart(email) {
    const base = (email?.split('@')[0] || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 22);

    return base.length >= 3 ? base : `user${base || 'acc'}`;
}

async function createUniqueUsername(email) {
    const baseUsername = emailLocalPart(email);
    let username = baseUsername;
    let suffix = 1;

    while (await userModel.exists({ username })) {
        username = `${baseUsername}${suffix}`;
        suffix += 1;
    }

    return username;
}

router.get('/users', authMiddleware, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required.' });
        }

        const users = await userModel
            .find({ role: 'user' })
            .select('name email avatar role createdAt')
            .sort({ email: 1 });

        res.json({
            users: users.map((u) => ({
                id: u._id,
                name: u.name || null,
                email: u.email,
                avatar: u.avatar,
                role: u.role,
                createdAt: u.createdAt
            }))
        });
    } catch (err) {
        next(err);
    }
});

router.post('/register',
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),
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

        const { name, email, password } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedName = name.trim();
        const existingUser = await userModel.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({
                message: 'Email is already registered.'
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const role = resolveRole(normalizedEmail, password);
        const username = await createUniqueUsername(normalizedEmail);

        const newUser = await userModel.create({
            name: normalizedName,
            email: normalizedEmail,
            username,
            password: hashPassword,
            role
        });

        const token = signToken(newUser);
        res.cookie('token', token, cookieOptions);

        await logActivity(newUser, 'register', normalizedName);

        res.status(201).json({
            user: publicUser(newUser)
        });
    });

router.post('/login',
    body('email').trim().isEmail().withMessage('Enter a valid email address.'),
    body('password').trim().isLength({ min: 5 }).withMessage('Password is required.'),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid data'
            });
        }

        const { email, password } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user || !user.password) {
            return res.status(400).json({
                message: 'Email or password is incorrect.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Email or password is incorrect.'
            });
        }

        const role = resolveRole(user.email, password);
        if (user.role !== role) {
            user.role = role;
            await user.save();
        }

        const token = signToken(user);
        res.cookie('token', token, cookieOptions);

        await logActivity(user, 'login', 'signed in');

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
            return res.redirect(`${clientUrl}/#/?auth=google-denied`);
        }

        if (!code || !state) {
            return res.status(400).json({
                message: 'Google login callback is missing code or state.'
            });
        }

        // Check if this is a drive-oauth callback (from "Get Token" flow)
        try {
            const statePayload = jwt.verify(state, process.env.JWT_SECRET);
            if (statePayload.purpose === 'drive-oauth') {
                // Drive OAuth callback — show code so user can copy & paste
                res.setHeader('Content-Type', 'text/html');
                return res.send(`
                    <!DOCTYPE html>
                    <html><head><meta charset="utf-8"><title>Authorization Code</title>
                    <style>body{font-family:system-ui,sans-serif;padding:2rem;max-width:600px;margin:auto;line-height:1.6}
                    code{display:block;background:#f1f5f9;padding:1rem;border-radius:8px;word-break:break-all;font-size:13px}
                    .btn{display:inline-block;background:#2563eb;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;border:none;font-size:14px;margin-top:1rem}
                    </style></head>
                    <body>
                    <h2>✅ Authorization Successful</h2>
                    <p>Copy the code below and paste it back in the app's <strong>"Paste the authorization code from URL"</strong> field:</p>
                    <code id="code">${code}</code>
                    <button class="btn" onclick="navigator.clipboard.writeText(document.getElementById('code').textContent).then(()=>this.textContent='Copied!')">Copy Code</button>
                    <p style="margin-top:1rem;font-size:13px;color:#64748b">Then go back to the app and click <strong>"Get Refresh Token"</strong></p>
                    </body></html>
                `);
            }
        } catch (_) {
            // Not a drive-oauth state, continue with normal login flow
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
            user.name = user.name || profile.name;
            user.avatar = profile.avatar || user.avatar;
            user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
            if (isAdminEmail(user.email)) {
                user.role = 'admin';
            }
            await user.save();
        } else {
            const email = profile.email.toLowerCase();
            const username = await createUniqueUsername(email);

            user = await userModel.create({
                name: profile.name,
                username,
                email,
                googleId: profile.googleId,
                avatar: profile.avatar,
                authProvider: 'google',
                role: isAdminEmail(email) ? 'admin' : 'user'
            });
        }

        const token = signToken(user);
        res.cookie('token', token, cookieOptions);

        await logActivity(user, 'login', 'signed in with Google');

        res.redirect(`${clientUrl}/#/?auth=google-success`);
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

// PUT /api/auth/profile — update name
router.put('/profile', authMiddleware, async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters.' });
        }

        const user = await userModel.findByIdAndUpdate(
            req.user._id,
            { name: name.trim() },
            { new: true }
        ).select('-password');

        res.json({
            message: 'Profile updated.',
            user: publicUser(user)
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/auth/password — change password
router.put('/password', authMiddleware, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required.' });
        }
        if (newPassword.length < 5) {
            return res.status(400).json({ message: 'New password must be at least 5 characters.' });
        }

        const user = await userModel.findById(req.user._id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
