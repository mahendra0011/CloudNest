const activityModel = require('../models/activity.model');

let io = null;

function setActivityIo(socketIo) {
    io = socketIo;
}

async function recordActivity({ user, action, details, driveId, driveName }) {
    const activity = await activityModel.create({
        user: user?._id,
        userName: user?.name || user?.email || 'System',
        userEmail: user?.email,
        action,
        details,
        driveId,
        driveName
    });

    if (io) {
        io.to('admin').emit('activity:new', activity.toObject());
    }

    return activity;
}

module.exports = {
    setActivityIo,
    recordActivity
};
