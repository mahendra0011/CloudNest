const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false
    },
    userName: {
        type: String,
        required: true,
        default: 'System'
    },
    userEmail: {
        type: String,
        required: false
    },
    action: {
        type: String,
        required: true,
        enum: [
            'upload', 'delete', 'sync', 'auth', 'download', 'login', 'register',
            'drive_add', 'drive_update', 'drive_delete',
            'drive_toggle_pool', 'drive_primary',
            'sync_all', 'settings_update'
        ]
    },
    details: {
        type: String,
        required: true
    },
    driveId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'drive',
        required: false
    },
    driveName: {
        type: String,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('activity', activitySchema);
