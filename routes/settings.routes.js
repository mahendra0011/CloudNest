const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/auth');
const Settings = require('../models/settings.model');
const { recordActivity } = require('../services/activity.service');

// GET /api/settings — fetch current user's settings
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        let settings = await Settings.findOne({ user: req.user._id });

        if (!settings) {
            settings = await Settings.create({ user: req.user._id });
        }

        res.json({ settings });
    } catch (err) {
        next(err);
    }
});

// PUT /api/settings — update settings
router.put('/', authMiddleware, async (req, res, next) => {
    try {
        const updateData = {};
        if (req.body.maxFileSize !== undefined) {
            updateData.maxFileSize = req.body.maxFileSize;
        }
        if (req.body.allowedTypes !== undefined) {
            updateData.allowedTypes = req.body.allowedTypes;
        }
        if (req.body.notificationsEnabled !== undefined) {
            updateData.notificationsEnabled = req.body.notificationsEnabled;
        }
        if (req.body.sendUploadEmail !== undefined) {
            updateData.sendUploadEmail = req.body.sendUploadEmail;
        }
        if (req.body.activeDriveId !== undefined) {
            updateData.activeDriveId = req.body.activeDriveId;
        }
        if (req.body.storageProvider !== undefined) {
            updateData.storageProvider = req.body.storageProvider;
        }
        if (req.body.showDataDriveIds !== undefined) {
            // Validate each ID is a valid ObjectId
            const ids = Array.isArray(req.body.showDataDriveIds) ? req.body.showDataDriveIds : [];
            updateData.showDataDriveIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid settings fields provided.' });
        }

        const settings = await Settings.findOneAndUpdate(
            { user: req.user._id },
            { $set: updateData },
            { new: true, upsert: true, runValidators: true }
        );

        await recordActivity({
            user: req.user,
            action: 'settings_update',
            details: `Updated: ${Object.keys(updateData).join(', ')}`
        });

        res.json({
            message: 'Settings updated successfully.',
            settings
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/settings/show-data — atomic toggle for a single drive's Show Data
router.put('/show-data', authMiddleware, async (req, res, next) => {
    try {
        const { driveId } = req.body;
        if (!driveId || !mongoose.Types.ObjectId.isValid(driveId)) {
            return res.status(400).json({ message: 'Valid driveId is required.' });
        }

        let settings = await Settings.findOne({ user: req.user._id });
        if (!settings) {
            settings = await Settings.create({ user: req.user._id });
        }

        const idStr = String(driveId);
        const currentIds = (settings.showDataDriveIds || []).map(id => String(id));
        const idx = currentIds.indexOf(idStr);

        if (idx === -1) {
            currentIds.push(idStr);
        } else {
            currentIds.splice(idx, 1);
        }

        settings.showDataDriveIds = currentIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        await settings.save();

        res.json({
            message: idx === -1 ? 'Show Data enabled for drive.' : 'Show Data disabled for drive.',
            showDataDriveIds: settings.showDataDriveIds
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
