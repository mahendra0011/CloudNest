const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    maxFileSize: {
        type: Number,
        default: 250
    },
    allowedTypes: {
        type: [String],
        default: ['images', 'documents', 'videos', 'audio', 'archives'],
        enum: ['images', 'documents', 'videos', 'audio', 'archives']
    },
    notificationsEnabled: {
        type: Boolean,
        default: true
    },
    sendUploadEmail: {
        type: Boolean,
        default: true
    },
    activeDriveId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'drive',
        default: null
    },
    storageProvider: {
        type: String,
        enum: ['google_drive', 'local'],
        default: 'google_drive'
    },
    showDataDriveIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'drive',
        default: []
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('settings', settingsSchema);

module.exports = Settings;