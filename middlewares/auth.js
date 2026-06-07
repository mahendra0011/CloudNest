const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

module.exports = async function authMiddleware(req, res, next) {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;
    const token = req.cookies.token || bearerToken;

    if (!token) {
        return res.status(401).json({ message: 'Please login first.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(payload.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User session is no longer valid.' });
        }

        req.user = user;
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.status(401).json({ message: 'Invalid or expired session.' });
    }
};
