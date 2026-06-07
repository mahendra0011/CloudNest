const fs = require('fs/promises');
const path = require('path');
const express = require('express');
const authMiddleware = require('../middlewares/auth');
const upload = require('../config/multer.config');
const fileModel = require('../models/files.model');
const {
    deleteFromDrive,
    downloadFromDrive,
    isOwnerDriveConfigured,
    uploadToDrive
} = require('../services/googleDrive.service');

const router = express.Router();

function getCategory(mimeType, originalName) {
    mimeType = mimeType || '';

    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';

    const ext = path.extname(originalName).toLowerCase();
    if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)) return 'archive';
    if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv'].includes(ext)) return 'document';

    return 'other';
}

function formatFile(file) {
    return {
        id: file._id,
        driveFileId: file.driveFileId,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        category: file.category,
        webViewLink: file.webViewLink,
        thumbnailLink: file.thumbnailLink,
        iconLink: file.iconLink,
        createdAt: file.createdAt
    };
}

function createDownloadHeader(originalName) {
    const fallbackName = originalName
        .replace(/[^\w.() -]/g, '_')
        .slice(0, 180) || 'download';

    return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(originalName)}`;
}

router.get('/', authMiddleware, async (req, res) => {
    const files = await fileModel
        .find({ user: req.user._id })
        .sort({ createdAt: -1 });

    res.json({
        files: files.map(formatFile)
    });
});

router.post('/upload', authMiddleware, upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            message: 'Please choose a file to upload.'
        });
    }

    try {
        if (!isOwnerDriveConfigured()) {
            return res.status(503).json({
                message: 'Owner Google Drive is not configured.'
            });
        }

        const category = getCategory(req.file.mimetype, req.file.originalname);

        const driveFile = await uploadToDrive({
            file: req.file,
            category
        });

        const newFile = await fileModel.create({
            user: req.user._id,
            driveFileId: driveFile.id,
            originalName: req.file.originalname,
            mimeType: driveFile.mimeType || req.file.mimetype,
            size: Number(driveFile.size || req.file.size || 0),
            category,
            webViewLink: driveFile.webViewLink,
            webContentLink: driveFile.webContentLink,
            thumbnailLink: driveFile.thumbnailLink,
            iconLink: driveFile.iconLink,
            driveCreatedTime: driveFile.createdTime
        });

        res.status(201).json({
            file: formatFile(newFile)
        });
    } catch (err) {
        next(err);
    } finally {
        fs.unlink(req.file.path).catch(() => {});
    }
});

router.get('/:fileId/download', authMiddleware, async (req, res, next) => {
    try {
        const file = await fileModel.findOne({
            _id: req.params.fileId,
            user: req.user._id
        });

        if (!file) {
            return res.status(404).json({
                message: 'File not found.'
            });
        }

        if (!isOwnerDriveConfigured()) {
            return res.status(503).json({
                message: 'Owner Google Drive is not configured.'
            });
        }

        const response = await downloadFromDrive({
            driveFileId: file.driveFileId
        });

        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', createDownloadHeader(file.originalName));

        response.data.on('error', next);
        response.data.pipe(res);
    } catch (err) {
        next(err);
    }
});

router.delete('/:fileId', authMiddleware, async (req, res, next) => {
    try {
        const file = await fileModel.findOne({
            _id: req.params.fileId,
            user: req.user._id
        });

        if (!file) {
            return res.status(404).json({
                message: 'File not found.'
            });
        }

        if (isOwnerDriveConfigured()) {
            try {
                await deleteFromDrive({
                    driveFileId: file.driveFileId
                });
            } catch (err) {
                if (err.code !== 404 && err.status !== 404) {
                    throw err;
                }
            }
        }

        await file.deleteOne();

        res.json({
            message: 'File deleted.'
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
