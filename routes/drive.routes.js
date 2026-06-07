const express = require('express');
const authMiddleware = require('../middlewares/auth');
const { isOwnerDriveConfigured } = require('../services/googleDrive.service');

const router = express.Router();

router.get('/status', authMiddleware, async (req, res) => {
    res.json({
        connected: isOwnerDriveConfigured(),
        ownerStorage: true
    });
});

router.get('/connect', authMiddleware, (req, res, next) => {
    res.status(410).json({
        message: 'Users do not need to connect Google Drive. Uploads are stored in the owner Google Drive configured on the server.'
    });
});

module.exports = router;
