const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const uploadDir = path.join(os.tmpdir(), 'cloudnest-uploader');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
    }
});

const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 250);

module.exports = multer({
    storage,
    limits: {
        fileSize: maxUploadMb * 1024 * 1024
    }
});
