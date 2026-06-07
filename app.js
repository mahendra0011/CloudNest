const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectToDB = require('./config/db');
const userRouter = require('./routes/user.routes');
const fileRouter = require('./routes/file.routes');
const driveRouter = require('./routes/drive.routes');

dotenv.config();
connectToDB();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'drive-uploader-api'
    });
});

app.use('/api/auth', userRouter);
app.use('/api/files', fileRouter);
app.use('/api/drive', driveRouter);

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
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;
