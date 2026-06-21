const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const userModel = require('../models/user.model');
const { setActivityIo } = require('../services/activity.service');

function initSocket(httpServer) {
    const { Server } = require('socket.io');
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true
        }
    });

    setActivityIo(io);

    io.use(async (socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || '');
            const token = cookies.token;

            if (!token) {
                return next(new Error('Unauthorized'));
            }

            const payload = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userModel.findById(payload.userId).select('-password');

            if (!user || user.role !== 'admin') {
                return next(new Error('Admin access required'));
            }

            socket.user = user;
            next();
        } catch (_) {
            next(new Error('Unauthorized'));
        }
    });

    io.on('connection', (socket) => {
        socket.join('admin');
    });

    return io;
}

module.exports = { initSocket };
