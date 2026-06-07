const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    driveFileId: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true,
        trim: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        enum: ['image', 'video', 'archive', 'document', 'other'],
        default: 'other'
    },
    webViewLink: String,
    webContentLink: String,
    thumbnailLink: String,
    iconLink: String,
    driveCreatedTime: Date
}, {
    timestamps: true
});

fileSchema.index({ user: 1, createdAt: -1 });
fileSchema.index({ user: 1, driveFileId: 1 }, { unique: true });

module.exports = mongoose.model('file', fileSchema);
