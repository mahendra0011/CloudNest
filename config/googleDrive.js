const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

const OWNER_DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const GOOGLE_LOGIN_SCOPES = ['openid', 'email', 'profile'];

function hasRealValue(value) {
    if (!value || typeof value !== 'string') return false;

    const normalized = value.trim().toLowerCase();
    const placeholderHints = [
        'your-',
        'replace-with',
        'owner-google-drive-refresh-token'
    ];

    return !placeholderHints.some((hint) => normalized.includes(hint));
}

function getOAuthClient(redirectUri) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = redirectUri || process.env.GOOGLE_LOGIN_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

    if (!hasRealValue(clientId) || !hasRealValue(clientSecret)) {
        const err = new Error('Google OAuth credentials are missing. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.');
        err.status = 503;
        throw err;
    }

    return new google.auth.OAuth2(clientId, clientSecret, callbackUrl);
}

function createGoogleLoginUrl() {
    const oauth2Client = getOAuthClient();
    const state = jwt.sign(
        { purpose: 'google-login' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
    );

    return oauth2Client.generateAuthUrl({
        access_type: 'online',
        prompt: 'select_account',
        scope: GOOGLE_LOGIN_SCOPES,
        state
    });
}

function verifyGoogleLoginState(state) {
    const payload = jwt.verify(state, process.env.JWT_SECRET);

    if (payload.purpose !== 'google-login') {
        const err = new Error('Invalid OAuth state.');
        err.status = 400;
        throw err;
    }

    return payload;
}

function isOwnerDriveConfigured() {
    return Boolean(
        hasRealValue(process.env.GOOGLE_CLIENT_ID) &&
        hasRealValue(process.env.GOOGLE_CLIENT_SECRET) &&
        hasRealValue(process.env.GOOGLE_DRIVE_REFRESH_TOKEN)
    );
}

function getOwnerDriveClient() {
    if (!isOwnerDriveConfigured()) {
        const err = new Error('Owner Google Drive is not configured. Add GOOGLE_DRIVE_REFRESH_TOKEN to .env.');
        err.status = 503;
        throw err;
    }

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
}

async function getGoogleProfileFromCode(code) {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.id_token) {
        const err = new Error('Google did not return an ID token.');
        err.status = 400;
        throw err;
    }

    // Verify the ID token. Don't pass audience to allow flexibility
    // (the OAuth2 client already has the correct client ID).
    const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token
    });

    const payload = ticket.getPayload();

    return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture
    };
}

module.exports = {
    GOOGLE_LOGIN_SCOPES,
    OWNER_DRIVE_SCOPES,
    createGoogleLoginUrl,
    getGoogleProfileFromCode,
    getOAuthClient,
    getOwnerDriveClient,
    hasRealValue,
    isOwnerDriveConfigured,
    verifyGoogleLoginState
};
