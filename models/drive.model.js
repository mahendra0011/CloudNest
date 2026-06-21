const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    clientId: {
        type: String,
        default: ''
    },
    clientSecret: {
        type: String,
        default: ''
    },
    refreshToken: {
        type: String,
        required: true
    },
    folderId: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isOwnerConfigured: {
        type: Boolean,
        default: false
    },
    storage: {
        limit: { type: String, default: '0' },
        usage: { type: String, default: '0' },
        available: { type: String, default: '0' },
        percentage: { type: Number, default: 0 }
    },
    lastSynced: {
        type: Date,
        default: null
    },
    syncErrors: {
        type: Number,
        default: 0
    },
    tokenExpiry: {
        type: String,
        default: '7 Days Refresh Auto-Renew'
    }
}, {
    timestamps: true
});

driveSchema.index({ user: 1, isActive: 1 });
driveSchema.index({ user: 1, name: 1 }, { unique: true });

const Drive = mongoose.model('drive', driveSchema);

module.exports = Drive;