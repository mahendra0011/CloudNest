const express = require('express');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
const { recordActivity } = require('../services/activity.service');
const { getOwnerDriveClient, isOwnerDriveConfigured, hasRealValue } = require('../config/googleDrive');
const { google } = require('googleapis');
const Drive = require('../models/drive.model');
const Settings = require('../models/settings.model');
const { encrypt, decrypt } = require('../config/crypto');

const router = express.Router();

function getDriveOAuthClient(drive) {
    const clientId = drive.clientId || process.env.GOOGLE_CLIENT_ID;
    const secret = drive.clientSecret ? decrypt(drive.clientSecret) : process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_LOGIN_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
    if (!hasRealValue(clientId) || !hasRealValue(secret)) {
        const err = new Error('Google OAuth credentials are missing for this drive.');
        err.status = 503;
        throw err;
    }
    return new google.auth.OAuth2(clientId, secret, callbackUrl);
}

// ─── Drive Status ───────────────────────────────────────────────────────────
router.get('/status', authMiddleware, async (req, res) => {
    try {
        let settings = await Settings.findOne({ user: req.user._id });
        if (!settings) settings = await Settings.create({ user: req.user._id });

        // Auto-create owner drive only on first run (when user has ZERO drives total, not just zero active)
        const totalDrives = await Drive.countDocuments({ user: req.user._id });
        const poolDrives = await Drive.find({ user: req.user._id, isActive: true }).lean();
        if (totalDrives === 0 && req.user.role === 'admin' && isOwnerDriveConfigured()) {
            let ownerDrive = await Drive.findOne({ user: req.user._id, isOwnerConfigured: true });
            if (!ownerDrive) {
                ownerDrive = await Drive.create({
                    user: req.user._id,
                    name: 'Primary Drive (Owner)',
                    email: process.env.GOOGLE_DRIVE_EMAIL || 'Owner Configured',
                    refreshToken: encrypt(process.env.GOOGLE_DRIVE_REFRESH_TOKEN),
                    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
                    isActive: true,
                    isOwnerConfigured: true,
                    tokenExpiry: '7 Days Refresh Auto-Renew'
                });
                settings.activeDriveId = ownerDrive._id;
                settings.storageProvider = 'google_drive';
                await settings.save();
            } else if (!ownerDrive.isActive) {
                ownerDrive.isActive = true;
                await ownerDrive.save();
                settings.activeDriveId = ownerDrive._id;
                await settings.save();
            }
            // Sync owner drive storage
            try {
                const d = getOwnerDriveClient();
                const about = await d.about.get({ fields: 'user,storageQuota' });
                const quota = about.data.storageQuota || {};
                const limit = Number(quota.limit || 0);
                const usage = Number(quota.usage || 0);
                ownerDrive.email = about.data.user?.emailAddress || ownerDrive.email;
                ownerDrive.storage = { limit: String(limit), usage: String(usage), available: String(limit - usage), percentage: limit > 0 ? Math.round((usage / limit) * 100) : 0 };
                ownerDrive.lastSynced = new Date();
                ownerDrive.syncErrors = 0;
                await ownerDrive.save();
            } catch { ownerDrive.syncErrors = 1; await ownerDrive.save(); }
        }

        const activeDriveId = settings.activeDriveId;
        let activeDrive = null;
        if (activeDriveId) activeDrive = await Drive.findById(activeDriveId);
        if (activeDrive && !activeDrive.isActive) { activeDrive = null; settings.activeDriveId = null; await settings.save(); }

        if (!activeDrive) {
            return res.json({ connected: false, activeDriveId: null, drive: null, drives: await Drive.find({ user: req.user._id }).select('-refreshToken -clientSecret').lean() });
        }

        try {
            const t = decrypt(activeDrive.refreshToken);
            if (!t) throw new Error('Failed to decrypt refresh token');
            const oc = getDriveOAuthClient(activeDrive);
            oc.setCredentials({ refresh_token: t });
            const dr = google.drive({ version: 'v3', auth: oc });
            const about = await dr.about.get({ fields: 'user,storageQuota' });
            const quota = about.data.storageQuota || {};
            const limit = Number(quota.limit || 0);
            const usage = Number(quota.usage || 0);
            activeDrive.email = about.data.user?.emailAddress || activeDrive.email;
            activeDrive.storage = { limit: String(limit), usage: String(usage), available: String(limit - usage), percentage: limit > 0 ? Math.round((usage / limit) * 100) : 0 };
            activeDrive.lastSynced = new Date();
            activeDrive.syncErrors = 0;
            await activeDrive.save();
            return res.json({
                connected: true,
                activeDriveId: activeDrive._id,
                drive: { _id: activeDrive._id, name: activeDrive.name, email: activeDrive.email, folderId: activeDrive.folderId || 'Root Folder', isActive: true, storage: activeDrive.storage, tokenExpiry: activeDrive.tokenExpiry, lastSynced: activeDrive.lastSynced, syncErrors: activeDrive.syncErrors },
                drives: await Drive.find({ user: req.user._id }).select('-refreshToken -clientSecret').lean()
            });
        } catch (err) {
            activeDrive.syncErrors = 1;
            await activeDrive.save();
            return res.json({
                connected: false,
                activeDriveId: activeDrive._id,
                drive: { _id: activeDrive._id, name: activeDrive.name, email: activeDrive.email, folderId: activeDrive.folderId || 'Not Configured', isActive: true, storage: { limit: '0', usage: '0', available: '0', percentage: 0 }, tokenExpiry: 'Expired/Invalid', lastSynced: activeDrive.lastSynced, syncErrors: activeDrive.syncErrors, error: err.message },
                drives: await Drive.find({ user: req.user._id }).select('-refreshToken -clientSecret').lean()
            });
        }
    } catch (err) {
        return res.status(500).json({ connected: false, activeDriveId: null, drive: null, drives: [], error: err.message });
    }
});

// ─── List Drives ────────────────────────────────────────────────────────────
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const drives = await Drive.find({ user: req.user._id }).select('-refreshToken -clientSecret').sort({ createdAt: -1 }).lean();
        res.json({ drives });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Generate OAuth URL ─────────────────────────────────────────────────────
router.post('/oauth-url', authMiddleware, async (req, res) => {
    try {
        const { clientId, clientSecret, redirectUri } = req.body;
        // Use provided credentials or fall back to server defaults
        const cId = clientId || process.env.GOOGLE_CLIENT_ID;
        const cSecret = clientSecret || process.env.GOOGLE_CLIENT_SECRET;
        if (!cId || !cSecret) return res.status(400).json({ message: 'OAuth credentials not found. Please provide Client ID and Client Secret or set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' });
        const cb = redirectUri || process.env.GOOGLE_LOGIN_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
        const oc = new google.auth.OAuth2(cId, cSecret, cb);
        const state = jwt.sign({ purpose: 'drive-oauth', userId: String(req.user._id) }, process.env.JWT_SECRET, { expiresIn: '10m' });
        const url = oc.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: ['https://www.googleapis.com/auth/drive.file'], state });
        res.json({ url, redirectUri: cb });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Exchange OAuth Code for Token ──────────────────────────────────────────
router.post('/exchange-code', authMiddleware, async (req, res) => {
    try {
        const { clientId, clientSecret, code, redirectUri } = req.body;
        if (!code) return res.status(400).json({ message: 'Authorization code is required.' });
        
        // Use provided credentials or fall back to .env defaults
        const cId = clientId || process.env.GOOGLE_CLIENT_ID;
        const cSecret = clientSecret || process.env.GOOGLE_CLIENT_SECRET;
        
        if (!cId || !cSecret) return res.status(400).json({ message: 'OAuth credentials not found. Please provide Client ID and Client Secret or set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' });
        
        // Validate that credentials are real (not placeholder text)
        if (!hasRealValue(cId) || !hasRealValue(cSecret)) {
            return res.status(400).json({ message: 'Invalid Google OAuth credentials detected. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env appear to be placeholder values. Please create a new OAuth 2.0 Client ID in Google Cloud Console (https://console.cloud.google.com/apis/credentials) and update your .env file.' });
        }
        
        const cb = redirectUri || process.env.GOOGLE_LOGIN_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
        const oc = new google.auth.OAuth2(cId, cSecret, cb);
        const { tokens } = await oc.getToken(code);
        if (!tokens.refresh_token) return res.status(400).json({ message: 'No refresh token returned. Use access_type=offline and prompt=consent.' });
        oc.setCredentials(tokens);
        const dr = google.drive({ version: 'v3', auth: oc });
        const about = await dr.about.get({ fields: 'user' });
        res.json({ refreshToken: tokens.refresh_token, email: about.data.user?.emailAddress || 'Unknown', accessToken: tokens.access_token, expiryDate: tokens.expiry_date });
    } catch (err) {
        // Catch "invalid_client" specifically and give a clear message
        const msg = err.message || '';
        if (msg.includes('invalid_client')) {
            return res.status(400).json({ message: 'Google rejected these credentials (invalid_client). Either the Client ID / Client Secret are wrong, revoked, or the OAuth consent screen is not configured. Go to https://console.cloud.google.com/apis/credentials, create a new OAuth 2.0 Web Client ID, and update your .env or provide them in the form.' });
        }
        res.status(500).json({ message: 'Failed to exchange code: ' + msg }); 
    }
});

// ─── Add Drive ──────────────────────────────────────────────────────────────
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { name, refreshToken, folderId, email, clientId, clientSecret } = req.body;
        if (!name || !refreshToken) return res.status(400).json({ message: 'Drive name and refresh token are required.' });
        const existing = await Drive.findOne({ user: req.user._id, name });
        if (existing) return res.status(400).json({ message: 'A drive with this name already exists.' });

        const eToken = encrypt(refreshToken);
        const eSecret = clientSecret ? encrypt(clientSecret) : '';
        const cId = clientId || process.env.GOOGLE_CLIENT_ID;
        let dEmail = email || 'Unknown';
        try {
            const cSecret = clientSecret || process.env.GOOGLE_CLIENT_SECRET;
            const oc = new google.auth.OAuth2(cId, cSecret, process.env.GOOGLE_LOGIN_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback');
            oc.setCredentials({ refresh_token: refreshToken });
            const dr = google.drive({ version: 'v3', auth: oc });
            const about = await dr.about.get({ fields: 'user' });
            dEmail = about.data.user?.emailAddress || dEmail;
        } catch {}

        const newDrive = await Drive.create({ user: req.user._id, name, email: dEmail, clientId: cId, clientSecret: eSecret, refreshToken: eToken, folderId: folderId || '', isActive: false, isOwnerConfigured: false });
        await recordActivity({ user: req.user, action: 'drive_add', details: `Added drive: ${name}` });
        res.status(201).json({ message: 'Drive added successfully.', drive: { _id: newDrive._id, name: newDrive.name, email: newDrive.email, folderId: newDrive.folderId, isActive: newDrive.isActive, storage: newDrive.storage, tokenExpiry: newDrive.tokenExpiry, lastSynced: newDrive.lastSynced, syncErrors: newDrive.syncErrors } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Toggle Drive Pool Membership ───────────────────────────────────────────
router.put('/toggle-pool/:id', authMiddleware, async (req, res) => {
    try {
        const drive = await Drive.findOne({ _id: req.params.id, user: req.user._id });
        if (!drive) return res.status(404).json({ message: 'Drive not found.' });
        drive.isActive = !drive.isActive;
        await drive.save();
        const action = drive.isActive ? 'added to' : 'removed from';
        await recordActivity({ user: req.user, action: 'drive_toggle_pool', details: `Drive ${action} auto-selection pool: ${drive.name}` });
        if (!drive.isActive) {
            const settings = await Settings.findOne({ user: req.user._id });
            if (settings && String(settings.activeDriveId) === String(drive._id)) { settings.activeDriveId = null; await settings.save(); }
        } else {
            const settings = await Settings.findOne({ user: req.user._id });
            if (settings && !settings.activeDriveId) { settings.activeDriveId = drive._id; settings.storageProvider = 'google_drive'; await settings.save(); }
            else if (!settings) { await Settings.create({ user: req.user._id, activeDriveId: drive._id, storageProvider: 'google_drive' }); }
        }
        res.json({ message: `"${drive.name}" ${action} auto-selection pool.`, drive: { _id: drive._id, isActive: drive.isActive } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Set Primary Drive (Display/Default) ────────────────────────────────────
router.put('/primary/:id', authMiddleware, async (req, res) => {
    try {
        const drive = await Drive.findOne({ _id: req.params.id, user: req.user._id });
        if (!drive) return res.status(404).json({ message: 'Drive not found.' });
        if (!drive.isActive) { drive.isActive = true; await drive.save(); }
        await Settings.findOneAndUpdate({ user: req.user._id }, { $set: { activeDriveId: drive._id, storageProvider: 'google_drive' } }, { upsert: true });
        await recordActivity({ user: req.user, action: 'drive_primary', details: `Set primary drive: ${drive.name}` });
        res.json({ message: `"${drive.name}" is now the primary display drive.`, activeDriveId: drive._id });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Toggle Upload Target Drive ─────────────────────────────────────
router.put('/upload-target/:id', authMiddleware, async (req, res) => {
    try {
        const drive = await Drive.findOne({ _id: req.params.id, user: req.user._id });
        if (!drive) return res.status(404).json({ message: 'Drive not found.' });

        const settings = await Settings.findOne({ user: req.user._id }) || await Settings.create({ user: req.user._id, storageProvider: 'google_drive' });
        const isCurrentlySelected = settings.activeDriveId && String(settings.activeDriveId) === String(drive._id);

        if (isCurrentlySelected) {
            settings.activeDriveId = null;
            settings.storageProvider = 'local';
            await settings.save();
            await recordActivity({ user: req.user, action: 'drive_primary', details: `Cleared upload target drive: ${drive.name}` });
            return res.json({ message: `Upload target cleared. Files will now use auto-selection.`, activeDriveId: null, drive: { _id: drive._id, isActive: drive.isActive } });
        }

        if (!drive.isActive) {
            drive.isActive = true;
            await drive.save();
        }

        settings.activeDriveId = drive._id;
        settings.storageProvider = 'google_drive';
        await settings.save();
        await recordActivity({ user: req.user, action: 'drive_primary', details: `Set upload target drive: ${drive.name}` });
        res.json({ message: `"${drive.name}" is now the upload target drive.`, activeDriveId: drive._id, drive: { _id: drive._id, isActive: drive.isActive } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Update Drive ───────────────────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const drive = await Drive.findOne({ _id: req.params.id, user: req.user._id });
        if (!drive) return res.status(404).json({ message: 'Drive not found.' });
        const { name, refreshToken, folderId, clientId, clientSecret, email } = req.body;
        if (name) drive.name = name;
        if (folderId !== undefined) drive.folderId = folderId;
        if (email) drive.email = email;
        if (clientId) drive.clientId = clientId;
        if (clientSecret) drive.clientSecret = encrypt(clientSecret);
        if (refreshToken) {
            drive.refreshToken = encrypt(refreshToken);
            // User explicitly provided new token - reset errors regardless
            drive.syncErrors = 0;
            try {
                const cId = drive.clientId || process.env.GOOGLE_CLIENT_ID;
                // Use raw clientSecret if provided, otherwise try to decrypt stored one, fallback to env
                let cSecret = process.env.GOOGLE_CLIENT_SECRET;
                if (clientSecret) {
                    cSecret = clientSecret;
                } else if (drive.clientSecret) {
                    const decrypted = decrypt(drive.clientSecret);
                    if (decrypted) cSecret = decrypted;
                }
                const oc = new google.auth.OAuth2(cId, cSecret, process.env.GOOGLE_LOGIN_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback');
                oc.setCredentials({ refresh_token: refreshToken });
                const dr = google.drive({ version: 'v3', auth: oc });
                const about = await dr.about.get({ fields: 'user' });
                drive.email = about.data.user?.emailAddress || drive.email;
            } catch {
                // Non-blocking: token validation is best-effort, don't increment errors
            }
        }
        await drive.save();
        await recordActivity({ user: req.user, action: 'drive_update', details: `Updated drive: ${drive.name}` });
        res.json({ message: 'Drive updated successfully.', drive: { _id: drive._id, name: drive.name, email: drive.email, folderId: drive.folderId, isActive: drive.isActive, storage: drive.storage, tokenExpiry: drive.tokenExpiry, lastSynced: drive.lastSynced, syncErrors: drive.syncErrors } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Delete Drive ───────────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const drive = await Drive.findOne({ _id: req.params.id, user: req.user._id });
        if (!drive) return res.status(404).json({ message: 'Drive not found.' });
        const name = drive.name;
        if (drive.isActive) {
            const settings = await Settings.findOne({ user: req.user._id });
            if (settings && String(settings.activeDriveId) === String(drive._id)) { settings.activeDriveId = null; await settings.save(); }
        }
        await Drive.deleteOne({ _id: drive._id });
        await recordActivity({ user: req.user, action: 'drive_delete', details: `Deleted drive: ${name}` });
        res.json({ message: `"${name}" has been removed.` });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Sync Primary Drive ─────────────────────────────────────────────────────
router.post('/sync', authMiddleware, async (req, res) => {
    try {
        const settings = await Settings.findOne({ user: req.user._id });
        if (!settings || !settings.activeDriveId) return res.status(400).json({ message: 'No primary drive configured.' });
        const activeDrive = await Drive.findById(settings.activeDriveId);
        if (!activeDrive) return res.status(404).json({ message: 'Primary drive not found.' });
        try {
            let dr;
            if (activeDrive.isOwnerConfigured) dr = getOwnerDriveClient();
            else {
                const t = decrypt(activeDrive.refreshToken);
                if (!t) throw new Error('Failed to decrypt');
                const oc = getDriveOAuthClient(activeDrive);
                oc.setCredentials({ refresh_token: t });
                dr = google.drive({ version: 'v3', auth: oc });
            }
            const about = await dr.about.get({ fields: 'user,storageQuota' });
            const quota = about.data.storageQuota || {};
            const limit = Number(quota.limit || 0);
            const usage = Number(quota.usage || 0);
            activeDrive.storage = { limit: String(limit), usage: String(usage), available: String(limit - usage), percentage: limit > 0 ? Math.round((usage / limit) * 100) : 0 };
            activeDrive.lastSynced = new Date();
            activeDrive.syncErrors = 0;
            if (about.data.user?.emailAddress) activeDrive.email = about.data.user.emailAddress;
            await activeDrive.save();
            await recordActivity({ user: req.user, action: 'sync', details: 'Drive sync completed' });
            res.json({ success: true, message: 'Drive synced.', drive: { _id: activeDrive._id, name: activeDrive.name, email: activeDrive.email, storage: activeDrive.storage, lastSynced: activeDrive.lastSynced, syncErrors: activeDrive.syncErrors } });
        } catch (err) {
            activeDrive.syncErrors = 1;
            await activeDrive.save();
            res.status(500).json({ success: false, message: 'Sync failed: ' + err.message });
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Sync All Pool Drives ──────────────────────────────────────────────────
router.post('/sync-all', authMiddleware, async (req, res) => {
    try {
        const pool = await Drive.find({ user: req.user._id, isActive: true });
        if (pool.length === 0) return res.status(400).json({ message: 'No drives in the auto-selection pool.' });
        const results = [];
        for (const d of pool) {
            try {
                let dr;
                if (d.isOwnerConfigured) dr = getOwnerDriveClient();
                else {
                    const t = decrypt(d.refreshToken);
                    if (!t) throw new Error('Failed to decrypt');
                    const oc = getDriveOAuthClient(d);
                    oc.setCredentials({ refresh_token: t });
                    dr = google.drive({ version: 'v3', auth: oc });
                }
                const about = await dr.about.get({ fields: 'user,storageQuota' });
                const q = about.data.storageQuota || {};
                const limit = Number(q.limit || 0);
                const usage = Number(q.usage || 0);
                d.storage = { limit: String(limit), usage: String(usage), available: String(limit - usage), percentage: limit > 0 ? Math.round((usage / limit) * 100) : 0 };
                d.lastSynced = new Date();
                d.syncErrors = 0;
                if (about.data.user?.emailAddress) d.email = about.data.user.emailAddress;
                await d.save();
                results.push({ name: d.name, success: true });
            } catch (err) {
                d.syncErrors = 1;
                await d.save();
                results.push({ name: d.name, success: false, error: err.message });
            }
        }
        await recordActivity({ user: req.user, action: 'sync_all', details: `Synced ${results.length} pool drives` });
        res.json({ success: true, results });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Storage Stats ─────────────────────────────────────────────────────────//
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const { getStorageStats } = require('../services/driveManager.service');
        const File = require('../models/files.model');
        const stats = await getStorageStats();
        const totalFiles = await File.countDocuments({});
        res.json({ ...stats, totalFiles });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Auto-select drive for upload (90% threshold) ───────────────────────────
router.get('/auto-upload-drive', authMiddleware, async (req, res) => {
    try {
        const pool = await Drive.find({ user: req.user._id, isActive: true });
        if (pool.length === 0) return res.json({ driveId: null, reason: 'No drives in pool' });
        
        // Find drives under 90% capacity
        const available = pool.filter(d => {
            const pct = Number(d.storage?.percentage || 0);
            return pct < 90;
        });
        
        if (available.length > 0) {
            // Return first available drive
            res.json({ driveId: String(available[0]._id), drive: available[0] });
        } else {
            // All drives are full - return first pool drive anyway
            res.json({ driveId: String(pool[0]._id), drive: pool[0], warning: 'All drives are above 90% capacity' });
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Legacy ────────────────────────────────────────────────────────────────
router.get('/connect', authMiddleware, (req, res) => {
    res.status(410).json({ message: 'Use the Storage Management page to add and manage drive configurations.' });
});

// ─── Get Single Drive (for editing) ─────────────────────────────────────────
// MUST be last - after all other routes like /sync, /sync-all, /stats, etc.
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const drive = await Drive.findOne({ _id: req.params.id, user: req.user._id });
        if (!drive) return res.status(404).json({ message: 'Drive not found.' });

        // If clientId/clientSecret are empty (owner-configured drive), fall back to .env defaults
        // so the edit form shows them as placeholders rather than blank fields
        const clientId = drive.clientId || process.env.GOOGLE_CLIENT_ID || '';
        const rawSecret = drive.clientSecret ? decrypt(drive.clientSecret) : '';
        const clientSecret = rawSecret || process.env.GOOGLE_CLIENT_SECRET || '';

        res.json({
            drive: {
                _id: drive._id,
                name: drive.name,
                email: drive.email,
                clientId,
                clientSecret,
                refreshToken: drive.refreshToken ? decrypt(drive.refreshToken) : '',
                folderId: drive.folderId,
                isActive: drive.isActive,
                isOwnerConfigured: drive.isOwnerConfigured,
                storage: drive.storage,
                lastSynced: drive.lastSynced,
                syncErrors: drive.syncErrors
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
