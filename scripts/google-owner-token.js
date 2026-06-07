const http = require('http');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { google } = require('googleapis');

dotenv.config();

const port = Number(process.env.OWNER_TOKEN_PORT || 4000);
const callbackPath = '/oauth2callback';
const redirectUri = `http://localhost:${port}${callbackPath}`;
const scope = process.env.GOOGLE_OWNER_DRIVE_SCOPE || 'https://www.googleapis.com/auth/drive.file';
const state = crypto.randomBytes(24).toString('hex');

function hasRealValue(value) {
    if (!value || typeof value !== 'string') return false;

    const normalized = value.trim().toLowerCase();
    return !['your-', 'replace-with'].some((hint) => normalized.includes(hint));
}

function createOAuthClient() {
    if (!hasRealValue(process.env.GOOGLE_CLIENT_ID) || !hasRealValue(process.env.GOOGLE_CLIENT_SECRET)) {
        throw new Error('Set real GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env before running this script.');
    }

    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
    );
}

function html(message) {
    return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Owner Drive Token</title></head>
<body style="font-family: system-ui, sans-serif; padding: 32px; line-height: 1.5;">
  <h1>Owner Drive Token</h1>
  <p>${message}</p>
  <p>You can close this tab and return to the terminal.</p>
</body>
</html>`;
}

async function main() {
    const oauth2Client = createOAuthClient();
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [scope],
        state
    });

    const server = http.createServer(async (req, res) => {
        try {
            const url = new URL(req.url, redirectUri);

            if (url.pathname !== callbackPath) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not found');
                return;
            }

            if (url.searchParams.get('state') !== state) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(html('Invalid state. Restart the script and try again.'));
                return;
            }

            const code = url.searchParams.get('code');

            if (!code) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(html('Google did not return an authorization code.'));
                return;
            }

            const { tokens } = await oauth2Client.getToken(code);

            if (!tokens.refresh_token) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(html('No refresh token returned. Remove this app from your Google account permissions, then run again.'));
                return;
            }

            console.log('\nAdd this to your .env file:\n');
            console.log(`GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}`);
            console.log('\nKeep it secret. Anyone with this token can access the allowed Drive scope.\n');

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html('Refresh token generated successfully.'));
            server.close();
        } catch (err) {
            console.error('Token generation failed:', err.message);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(html('Token generation failed. Check the terminal for details.'));
            server.close();
        }
    });

    server.listen(port, () => {
        console.log('\nOwner Google Drive token setup\n');
        console.log('1. Add this authorized redirect URI in Google Cloud OAuth client:');
        console.log(`   ${redirectUri}\n`);
        console.log('2. Open this URL and approve with YOUR owner Google Drive account:');
        console.log(`   ${authUrl}\n`);
        console.log('Waiting for Google callback...');
    });
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
