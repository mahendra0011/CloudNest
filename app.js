const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectToDB = require('./config/db');
const { initSocket } = require('./config/socket');
const userRouter = require('./routes/user.routes');
const fileRouter = require('./routes/file.routes');
const driveRouter = require('./routes/drive.routes');
const settingsRouter = require('./routes/settings.routes');
const activityRouter = require('./routes/activity.routes');

dotenv.config();
connectToDB();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Allow CORS for any origin during development (LAN access)
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:5173', 'http://10.57.19.212:5173'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'cloudnest-api'
    });
});

app.use('/api/auth', userRouter);
app.use('/api/files', fileRouter);
app.use('/api/drive', driveRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/activities', activityRouter);

app.use('/api', (req, res) => {
    res.status(404).json({
        message: 'API route not found'
    });
});

const clientDistPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDistPath));

app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }

    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
        if (err) {
            next();
        }
    });
});

app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;

    res.status(status).json({
        message: err.message || 'Something went wrong'
    });
});

const port = process.env.PORT || 3000;

if (require.main === module) {
    const server = http.createServer(app);
    initSocket(server);
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;
