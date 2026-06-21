const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');
const activityModel = require('../models/activity.model');

const router = express.Router();

router.get('/', authMiddleware, requireAdmin, async (req, res, next) => {
    try {
        const query = {};
        if (req.query.driveId) {
            const driveIds = req.query.driveId.split(',').filter(Boolean);
            // Handle 'none' as explicit empty result
            if (driveIds.length === 1 && driveIds[0] === 'none') {
                return res.json({ activities: [] });
            }
            const validIds = driveIds.filter(id => mongoose.Types.ObjectId.isValid(id));
            if (validIds.length === 1) {
                query.driveId = new mongoose.Types.ObjectId(validIds[0]);
            } else if (validIds.length > 1) {
                query.driveId = { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) };
            } else {
                return res.json({ activities: [] });
            }
        }

        const activities = await activityModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            activities
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
