const fs = require('fs/promises');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');
const userModel = require('../models/user.model');
const upload = require('../config/multer.config');
const fileModel = require('../models/files.model');
const Drive = require('../models/drive.model');
const { recordActivity } = require('../services/activity.service');
const {
    uploadToBestDrive,
    uploadToDriveById,
    uploadToActiveDriveWithFailover,
    downloadFromDrive,
    deleteFromDrive
} = require('../services/driveManager.service');
const Settings = require('../models/settings.model');
const { sendUploadNotification } = require('../services/email.service');

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
        driveId: file.driveId,
        drive: file.driveId ? {
            id: file.driveId._id,
            name: file.driveId.name
        } : null,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        category: file.category,
        webViewLink: file.webViewLink,
        thumbnailLink: file.thumbnailLink,
        iconLink: file.iconLink,
        createdAt: file.createdAt,
        user: file.user ? {
            id: file.user._id || file.user,
            name: file.user.name || null,
            email: file.user.email || ''
        } : null
    };
}

function createDownloadHeader(originalName) {
    const fallbackName = originalName
        .replace(/[^\w.() -]/g, '_')
        .slice(0, 180) || 'download';
    return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(originalName)}`;
}

/**
 * Get the upload drive result using the ADMIN's settings.
 * Regular users do NOT have drive settings — only the admin manages drives.
 * - When adminId is provided (admin routes), use that admin's settings directly.
 * - When adminId is not provided (user upload), find the first admin.
 * This ensures all uploads go to the admin's chosen Active drive, not the user's.
 */
async function getUploadDriveResult({ file, category, adminId }) {
    let adminUserId;
    if (adminId) {
        adminUserId = adminId;
    } else {
        const admin = await userModel.findOne({ role: 'admin' }).select('_id');
        if (!admin) {
            throw new Error('No admin user found. Cannot determine upload target drive.');
        }
        adminUserId = admin._id;
    }
    return uploadToActiveDriveWithFailover({ file, category, userId: adminUserId });
}

async function createUploadedFile({ req, targetUser, category, uploadResult }) {
    const drive = await Drive.findById(uploadResult.driveId).select('name');
    const newFile = await fileModel.create({
        user: targetUser._id,
        driveId: uploadResult.driveId,
        driveFileId: uploadResult.googleFile.id,
        originalName: req.file.originalname,
        mimeType: uploadResult.googleFile.mimeType || req.file.mimetype,
        size: Number(uploadResult.googleFile.size || req.file.size || 0),
        category,
        webViewLink: uploadResult.googleFile.webViewLink,
        webContentLink: uploadResult.googleFile.webContentLink,
        thumbnailLink: uploadResult.googleFile.thumbnailLink,
        iconLink: uploadResult.googleFile.iconLink,
        driveCreatedTime: uploadResult.googleFile.createdTime
    });

    await newFile.populate('user', 'name email');

    const fileTypeLabel = category.charAt(0).toUpperCase() + category.slice(1);
    await recordActivity({
        user: req.user,
        action: 'upload',
        details: `${req.user.email} uploaded a ${fileTypeLabel} file (${req.file.originalname})`,
        driveId: uploadResult.driveId,
        driveName: drive?.name || null
    });

    return newFile;
}

/**
 * GET /api/files
 * List all uploaded files.
 * driveId query param filters by specific drive(s), or passes 'none' to return empty.
 */
router.get('/', authMiddleware, requireAdmin, async (req, res) => {
    const query = {};
    if (req.query.driveId) {
        const driveIds = req.query.driveId.split(',').filter(Boolean);
        // Handle 'none' as explicit empty result
        if (driveIds.length === 1 && driveIds[0] === 'none') {
            return res.json({ files: [] });
        }
        const validIds = driveIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length === 1) {
            query.driveId = new mongoose.Types.ObjectId(validIds[0]);
        } else if (validIds.length > 1) {
            query.driveId = { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) };
        } else {
            // No valid IDs - return empty result
            return res.json({ files: [] });
        }
    }

    const files = await fileModel
        .find(query)
        .populate('user', 'name email')
        .populate('driveId', 'name')
        .sort({ createdAt: -1 });
    res.json({ files: files.map(formatFile) });
});

/**
 * POST /api/files/upload
 * Upload a file - auto-selects best available drive.
 */
/**
 * POST /api/files/user-upload
 * Public upload - any logged-in user can upload a file.
 * File is auto-assigned to the uploading user.
 * File goes to the admin's Google Drive.
 */
router.post('/user-upload', authMiddleware, upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please choose a file to upload.' });
    }

    try {
        const targetUser = req.user;
        const category = getCategory(req.file.mimetype, req.file.originalname);

        // Regular user uploading — don't pass their ID as adminId.
        // getUploadDriveResult will find the admin automatically.
        const uploadResult = await getUploadDriveResult({ file: req.file, category });
        const newFile = await createUploadedFile({ req, targetUser, category, uploadResult });

        res.status(201).json({ file: formatFile(newFile) });
    } catch (err) {
        next(err);
    } finally {
        fs.unlink(req.file.path).catch(() => {});
    }
});

/**
 * POST /api/files/upload
 * Admin upload - admin selects a user to assign the file to.
 */
router.post('/upload', authMiddleware, requireAdmin, upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please choose a file to upload.' });
    }

    try {
        const targetUserId = req.body.userId;
        if (!targetUserId) {
            return res.status(400).json({ message: 'Please select a user to assign this upload.' });
        }

        const targetUser = await userModel.findById(targetUserId).select('name email role');
        if (!targetUser) {
            return res.status(404).json({ message: 'Selected user not found.' });
        }

        const category = getCategory(req.file.mimetype, req.file.originalname);

        const uploadResult = await getUploadDriveResult({ file: req.file, category, adminId: req.user._id });
        const newFile = await createUploadedFile({ req, targetUser, category, uploadResult });

        // Email notification (non-blocking)
        if (targetUser.email) {
            try {
                const userSettings = await Settings.findOne({ user: targetUser._id });
                if (userSettings &&
                    userSettings.notificationsEnabled !== false &&
                    userSettings.sendUploadEmail !== false) {
                    sendUploadNotification({
                        to: targetUser.email,
                        fileName: req.file.originalname,
                        userName: req.user.name || req.user.email,
                        uploadDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Calcutta' })
                    }).catch(() => {});
                }
            } catch (_) {}
        }

        res.status(201).json({ file: formatFile(newFile) });
    } catch (err) {
        next(err);
    } finally {
        fs.unlink(req.file.path).catch(() => {});
    }
});

/**
 * POST /api/files/admin-upload
 * Admin upload on behalf of a user (by name/email) with optional drive selection.
 * If user email matches an existing user, assigns to that user.
 * Otherwise creates a placeholder record.
 */
router.post('/admin-upload', authMiddleware, requireAdmin, upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please choose a file to upload.' });
    }

    try {
        const { userName, userEmail, driveId } = req.body;

        // Find or use the user by email
        let targetUser = null;
        if (userEmail && userEmail.trim()) {
            targetUser = await userModel.findOne({ email: userEmail.trim().toLowerCase() }).select('name email role');
        }

        // If no matching user found, use the admin themselves as placeholder
        if (!targetUser) {
            targetUser = req.user;
        }

        const category = getCategory(req.file.mimetype, req.file.originalname);

        let uploadResult;
        if (driveId) {
            // Admin explicitly chose a specific drive — bypass failover
            uploadResult = await uploadToDriveById({ file: req.file, category, driveId });
        } else {
            // No specific drive chosen — use admin's Active drive with 90% failover
            uploadResult = await getUploadDriveResult({ file: req.file, category, adminId: req.user._id });
        }

        const drive = await Drive.findById(uploadResult.driveId).select('name');
        const newFile = await fileModel.create({
            user: targetUser._id,
            driveId: uploadResult.driveId,
            driveFileId: uploadResult.googleFile.id,
            originalName: req.file.originalname,
            mimeType: uploadResult.googleFile.mimeType || req.file.mimetype,
            size: Number(uploadResult.googleFile.size || req.file.size || 0),
            category,
            webViewLink: uploadResult.googleFile.webViewLink,
            webContentLink: uploadResult.googleFile.webContentLink,
            thumbnailLink: uploadResult.googleFile.thumbnailLink,
            iconLink: uploadResult.googleFile.iconLink,
            driveCreatedTime: uploadResult.googleFile.createdTime
        });

        await newFile.populate('user', 'name email');

        const fileTypeLabel = category.charAt(0).toUpperCase() + category.slice(1);
        await recordActivity({
            user: req.user,
            action: 'upload',
            details: `${req.user.email} uploaded a ${fileTypeLabel} file (${req.file.originalname})`,
            driveId: uploadResult.driveId,
            driveName: drive?.name || null
        });

        res.status(201).json({ file: formatFile(newFile) });
    } catch (err) {
        next(err);
    } finally {
        fs.unlink(req.file.path).catch(() => {});
    }
});

/**
 * GET /api/files/:fileId/download
 * Download a file from its specific drive.
 */
router.get('/:fileId/download', authMiddleware, requireAdmin, async (req, res, next) => {
    try {
        const file = await fileModel.findOne({ _id: req.params.fileId });
        if (!file) return res.status(404).json({ message: 'File not found.' });

        if (!file.driveId) {
            return res.status(503).json({ message: 'File has no associated drive reference.' });
        }

        const response = await downloadFromDrive({
            driveId: file.driveId,
            driveFileId: file.driveFileId
        });

        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', createDownloadHeader(file.originalName));

        await recordActivity({
            user: req.user,
            action: 'download',
            details: file.originalName
        });

        response.data.on('error', next);
        response.data.pipe(res);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/files/:fileId
 * Delete a file from its specific drive.
 */
router.delete('/:fileId', authMiddleware, requireAdmin, async (req, res, next) => {
    try {
        const file = await fileModel.findOne({ _id: req.params.fileId });
        if (!file) return res.status(404).json({ message: 'File not found.' });

        if (file.driveId) {
            try {
                await deleteFromDrive({
                    driveId: file.driveId,
                    driveFileId: file.driveFileId
                });
            } catch (err) {
                // Continue if file already deleted from drive (404)
                if (err.code !== 404 && err.status !== 404 && err.response?.status !== 404) {
                    throw err;
                }
            }
        }

        await file.deleteOne();

        await recordActivity({
            user: req.user,
            action: 'delete',
            details: file.originalName
        });

        res.json({ message: 'File deleted.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;