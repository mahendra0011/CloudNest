const Drive = require('../models/drive.model');
const { decrypt } = require('../config/crypto');
const { google } = require('googleapis');
const { getOAuthClient, hasRealValue } = require('../config/googleDrive');

/**
 * Get a per-drive OAuth2 client using the drive's own or .env credentials.
 */
function getDriveClient(drive) {
    const clientId = drive.clientId || process.env.GOOGLE_CLIENT_ID;
    let secret = drive.clientSecret ? decrypt(drive.clientSecret) : process.env.GOOGLE_CLIENT_SECRET;
    if (!secret && drive.clientSecret) {
        secret = drive.clientSecret; // Legacy: stored unencrypted
    }
    const callbackUrl = process.env.GOOGLE_LOGIN_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

    const oauth2Client = new google.auth.OAuth2(clientId, secret, callbackUrl);

    if (drive.isOwnerConfigured) {
        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });
    } else {
        let decryptedToken = decrypt(drive.refreshToken);
        // If decryption fails, try using raw token (for legacy tokens stored without encryption)
        if (!decryptedToken) {
            decryptedToken = drive.refreshToken;
        }
        if (!decryptedToken) throw new Error(`Failed to decrypt refresh token for drive: ${drive.name}`);
        oauth2Client.setCredentials({ refresh_token: decryptedToken });
    }

    return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Get or create a category folder under a drive's parent folder.
 */
async function getUploadParentId({ drive, category }) {
    const DRIVE_FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
    const categoryFolderNames = {
        image: 'Images', video: 'Videos', archive: 'Archives',
        document: 'Documents', other: 'Other Files'
    };

    function escapeQuery(val) {
        return String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    const parentFolderId = drive.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;
    const folderName = categoryFolderNames[category] || categoryFolderNames.other;

    const gdrive = getDriveClient(drive);
    const queryParts = [
        `name = '${escapeQuery(folderName)}'`,
        `mimeType = '${DRIVE_FOLDER_MIME_TYPE}'`,
        'trashed = false'
    ];
    if (parentFolderId) queryParts.push(`'${escapeQuery(parentFolderId)}' in parents`);

    const listRes = await gdrive.files.list({
        q: queryParts.join(' and '),
        fields: 'files(id,name)',
        pageSize: 1,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true
    });

    if (listRes.data.files?.[0]) return listRes.data.files[0].id;

    const body = { name: folderName, mimeType: DRIVE_FOLDER_MIME_TYPE };
    if (parentFolderId) body.parents = [parentFolderId];

    const createRes = await gdrive.files.create({
        requestBody: body,
        fields: 'id',
        supportsAllDrives: true
    });
    return createRes.data.id;
}

/**
 * Find the best available drive (least used percentage).
 * Prefers active drives. Skips drives with < 100MB free.
 */
async function getAvailableDrive(requiredBytes = 0) {
    const drives = await Drive.find({ isActive: true }).lean();

    if (drives.length === 0) {
        throw new Error('No active drives configured. Please add and activate a drive in Storage Management.');
    }

    // Sort by usage percentage ascending (least used first)
    const sorted = drives
        .map(d => {
            const total = Number(d.storage?.limit || 0);
            const used = Number(d.storage?.usage || 0);
            const free = total - used;
            const usagePct = total > 0 ? (used / total) * 100 : 0;
            return { ...d, total, used, free, usagePct };
        })
        .filter(d => d.free >= requiredBytes) // skip drives without enough space
        .sort((a, b) => a.usagePct - b.usagePct);

    if (sorted.length === 0) {
        // If no drive has space, just return the least used one anyway
        const fallback = drives
            .map(d => ({
                ...d,
                total: Number(d.storage?.limit || 0),
                used: Number(d.storage?.usage || 0),
                usagePct: Number(d.storage?.limit || 0) > 0
                    ? (Number(d.storage?.usage || 0) / Number(d.storage?.limit || 0)) * 100
                    : 0
            }))
            .sort((a, b) => a.usagePct - b.usagePct);
        if (fallback.length === 0) throw new Error('No drives available for upload.');
        return fallback[0];
    }

    return sorted[0];
}

/**
 * Upload a file to the best available drive.
 * Updates the drive's storage usage after upload.
 * Returns: { driveId, googleFile }
 */
async function uploadToBestDrive({ file, category }) {
    const driveDoc = await getAvailableDrive(file.size || 0);
    const driveId = driveDoc._id;
    const gdrive = getDriveClient(driveDoc);
    const folderId = await getUploadParentId({ drive: driveDoc, category });

    const requestBody = {
        name: file.originalname,
        parents: [folderId]
    };

    const fs = require('fs');
    const response = await gdrive.files.create({
        requestBody,
        media: {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path)
        },
        fields: 'id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,iconLink,createdTime',
        supportsAllDrives: true
    });

    // Update drive storage usage in background
    try {
        const about = await gdrive.about.get({ fields: 'storageQuota' });
        const quota = about.data.storageQuota || {};
        const limit = Number(quota.limit || 0);
        const usage = Number(quota.usage || 0);
        await Drive.findByIdAndUpdate(driveId, {
            $set: {
                'storage.limit': String(limit),
                'storage.usage': String(usage),
                'storage.available': String(limit - usage),
                'storage.percentage': limit > 0 ? Math.round((usage / limit) * 100) : 0,
                lastSynced: new Date(),
                syncErrors: 0
            }
        });
    } catch {
        // Non-blocking
    }

    return {
        driveId,
        googleFile: response.data
    };
}

async function uploadToDriveById({ file, category, driveId }) {
    const driveDoc = await Drive.findById(driveId);
    if (!driveDoc) {
        throw new Error('Selected drive not found. Please choose another upload target.');
    }

    const driveIdDoc = driveDoc._id;
    const gdrive = getDriveClient(driveDoc);
    const folderId = await getUploadParentId({ drive: driveDoc, category });

    const requestBody = {
        name: file.originalname,
        parents: [folderId]
    };

    const fs = require('fs');
    const response = await gdrive.files.create({
        requestBody,
        media: {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path)
        },
        fields: 'id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,iconLink,createdTime',
        supportsAllDrives: true
    });

    try {
        const about = await gdrive.about.get({ fields: 'storageQuota' });
        const quota = about.data.storageQuota || {};
        const limit = Number(quota.limit || 0);
        const usage = Number(quota.usage || 0);
        await Drive.findByIdAndUpdate(driveIdDoc, {
            $set: {
                'storage.limit': String(limit),
                'storage.usage': String(usage),
                'storage.available': String(limit - usage),
                'storage.percentage': limit > 0 ? Math.round((usage / limit) * 100) : 0,
                lastSynced: new Date(),
                syncErrors: 0
            }
        });
    } catch {
    }

    return {
        driveId: driveIdDoc,
        googleFile: response.data
    };
}

/**
 * Download a file from a specific drive.
 */
async function downloadFromDrive({ driveId, driveFileId }) {
    const drive = await Drive.findById(driveId);
    if (!drive) throw new Error('Drive not found for file download.');

    const gdrive = getDriveClient(drive);
    return gdrive.files.get(
        { fileId: driveFileId, alt: 'media', supportsAllDrives: true },
        { responseType: 'stream' }
    );
}

/**
 * Delete a file from a specific drive.
 */
async function deleteFromDrive({ driveId, driveFileId }) {
    const drive = await Drive.findById(driveId);
    if (!drive) throw new Error('Drive not found for file deletion.');

    const gdrive = getDriveClient(drive);
    await gdrive.files.delete({ fileId: driveFileId, supportsAllDrives: true });

    // Update drive storage
    try {
        const about = await gdrive.about.get({ fields: 'storageQuota' });
        const quota = about.data.storageQuota || {};
        const limit = Number(quota.limit || 0);
        const usage = Number(quota.usage || 0);
        await Drive.findByIdAndUpdate(driveId, {
            $set: {
                'storage.limit': String(limit),
                'storage.usage': String(usage),
                'storage.available': String(limit - usage),
                'storage.percentage': limit > 0 ? Math.round((usage / limit) * 100) : 0,
                lastSynced: new Date()
            }
        });
    } catch {
        // Non-blocking
    }
}

/**
 * Get aggregated storage stats across all active drives.
 */
async function getStorageStats() {
    const drives = await Drive.find({ isActive: true }).lean();
    let totalLimit = 0;
    let totalUsage = 0;
    let driveCount = 0;

    for (const d of drives) {
        const limit = Number(d.storage?.limit || 0);
        const usage = Number(d.storage?.usage || 0);
        if (limit > 0) {
            totalLimit += limit;
            totalUsage += usage;
            driveCount++;
        }
    }

    return {
        totalDrives: driveCount,
        totalStorage: totalLimit,
        totalUsage: totalUsage,
        totalAvailable: totalLimit - totalUsage,
        usagePercentage: totalLimit > 0 ? Math.round((totalUsage / totalLimit) * 100) : 0,
        drives: drives.map(d => ({
            _id: d._id,
            name: d.name,
            email: d.email,
            storage: d.storage,
            isActive: d.isActive,
            isOwnerConfigured: d.isOwnerConfigured,
            lastSynced: d.lastSynced,
            syncErrors: d.syncErrors
        }))
    };
}

/**
 * Upload to the active drive target, but check 90% threshold first.
 * If the active drive is at/over 90%, auto-failover to the best available pool drive
 * and persist the new active drive ID in Settings.
 * Returns: { driveId, googleFile, didSwitch }
 */
async function uploadToActiveDriveWithFailover({ file, category, userId }) {
    const Settings = require('../models/settings.model');
    const settings = await Settings.findOne({ user: userId });

    // No active drive set → just use normal best-drive selection
    if (!settings || !settings.activeDriveId) {
        const result = await uploadToBestDrive({ file, category });
        return { ...result, didSwitch: false };
    }

    const activeDrive = await Drive.findById(settings.activeDriveId);
    if (!activeDrive) {
        const result = await uploadToBestDrive({ file, category });
        return { ...result, didSwitch: false };
    }

    const usagePct = Number(activeDrive.storage?.percentage || 0);

    // If under 90%, use the active drive as-is
    if (usagePct < 90) {
        const result = await uploadToDriveById({ file, category, driveId: settings.activeDriveId });
        return { ...result, didSwitch: false };
    }

    // Active drive is at/over 90% — find a better pool drive
    const poolDrives = await Drive.find({ 
        _id: { $ne: settings.activeDriveId },
        isActive: true 
    }).lean();

    // Filter to drives under 90%, sorted by usage ascending
    const candidates = poolDrives
        .map(d => {
            const pct = Number(d.storage?.percentage || 0);
            return { ...d, usagePct: pct };
        })
        .filter(d => d.usagePct < 90)
        .sort((a, b) => a.usagePct - b.usagePct);

    let targetDrive;
    let didSwitch = false;

    if (candidates.length > 0) {
        // Found a better drive — switch to it
        targetDrive = candidates[0];
        didSwitch = true;
    } else {
        // All pool drives are also over 90% — just use the active drive anyway
        const result = await uploadToDriveById({ file, category, driveId: settings.activeDriveId });
        return { ...result, didSwitch: false };
    }

    // Persist the switch in Settings
    settings.activeDriveId = targetDrive._id;
    await settings.save();

    // Upload to the new target drive
    const result = await uploadToDriveById({ file, category, driveId: targetDrive._id });

    // Record a notification about the switch
    try {
        const activityModel = require('../models/activity.model');
        await activityModel.create({
            user: userId,
            action: 'auto_switch',
            details: `Auto-switched from "${activeDrive.name}" (${usagePct.toFixed(1)}% used) to "${targetDrive.name}" (${targetDrive.usagePct.toFixed(1)}% used) — storage exceeded 90%`,
            driveId: targetDrive._id,
            driveName: targetDrive.name
        });
    } catch {
        // Non-blocking
    }

    return { ...result, didSwitch: true };
}

module.exports = {
    getAvailableDrive,
    getDriveClient,
    uploadToBestDrive,
    uploadToDriveById,
    uploadToActiveDriveWithFailover,
    downloadFromDrive,
    deleteFromDrive,
    getStorageStats
};
