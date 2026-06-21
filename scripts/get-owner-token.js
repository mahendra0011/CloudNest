/**
 * Owner Drive Refresh Token Generator
 * 
 * This script generates the OAuth URL using the app's default redirect URI
 * (http://localhost:3000/api/auth/google/callback) which is already configured
 * in Google Cloud Console.
 * 
 * Usage:
 *   1. Run: node scripts/get-owner-token.js
 *   2. Open the URL in browser and authorize with mahendrapra0077@gmail.com
 *   3. After authorizing, you'll be redirected to localhost:3000
 *      Copy the full redirect URL from the browser address bar
 *   4. Paste the full URL into the terminal when prompted
 *   5. The script will extract the code and exchange it for a refresh token
 */
const readline = require('readline');
const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    console.error('Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive.file']
});

console.log('\n========================================');
console.log('  Owner Drive Refresh Token Generator');
console.log('========================================\n');
console.log('Step 1: Open this URL in your browser:');
console.log(`\n${authUrl}\n`);
console.log('Step 2: Sign in with: mahendrapra0077@gmail.com or sourceforget32@gmail.com');
console.log('Step 3: Click "Continue" (you may see "unverified" warning, that\'s OK)');
console.log('Step 4: After authorizing, you will be redirected to:');
console.log(`        ${REDIRECT_URI}?code=...&scope=...`);
console.log('        The page will show "Cannot GET /api/auth/google/callback"');
console.log('        THAT IS EXPECTED — just copy the FULL URL from the address bar\n');

rl.question('Paste the full redirect URL here:\n> ', async (fullUrl) => {
    try {
        // Extract the 'code' parameter from the URL
        const urlObj = new URL(fullUrl);
        const code = urlObj.searchParams.get('code');
        
        if (!code) {
            console.error('\nError: No "code" parameter found in the URL.');
            console.log('Make sure you paste the ENTIRE URL from the address bar after authorization.');
            rl.close();
            return;
        }

        console.log('\nExchanging authorization code for tokens...\n');
        
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.refresh_token) {
            console.error('\nError: No refresh_token returned!');
            console.log('This usually means you\'ve already authorized before and the token was cached.');
            console.log('To force a new refresh token:');
            console.log('  1. Go to https://myaccount.google.com/permissions');
            console.log('  2. Find "CloudNest" and remove access');
            console.log('  3. Run this script again\n');
            rl.close();
            return;
        }

        console.log('========================================');
        console.log('  SUCCESS! Add this to your .env file:');
        console.log('========================================\n');
        console.log(`GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
        console.log(`GOOGLE_DRIVE_EMAIL=mahendrapra0077@gmail.com`);
        console.log(`GOOGLE_DRIVE_NAME=mahendra prajapati\n`);
        console.log('Then restart the server.\n');
        
        rl.close();
    } catch (err) {
        console.error('\nError:', err.message);
        console.log('\nMake sure you pasted the COMPLETE URL from the address bar.');
        rl.close();
    }
});