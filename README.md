# Google Drive Upload Studio

Full-stack upload system for images, videos, zip files, documents, and general files. Users can register, login with Google, upload files, view their own uploads, download files, and delete files.

Important flow: users do **not** connect their own Google Drive. Every uploaded file is saved into the owner Google Drive account configured on the backend with `GOOGLE_DRIVE_REFRESH_TOKEN`.

## Ye Project Kiske Liye Banaya Hai

Ye project un developers ke liye banaya gaya hai jo apne app me ready-made upload feature add karna chahte hain:

- SaaS apps jahan users files upload karte hain.
- Portfolio/admin panels jahan images, videos, zip, PDFs store karne hote hain.
- Student/dev projects jahan Google Drive ko storage backend ki tarah use karna hai.
- Apps jahan user ko file manager dashboard chahiye, but storage owner ke Google Drive me centralized rakhna hai.

## Why It Is Useful

- Separate paid storage setup ki zarurat nahi; Google Drive owner account storage use hota hai.
- User ko apna Google Drive connect nahi karna padta.
- MongoDB metadata rakhta hai, so har user ko sirf apni files dikhti hain.
- Backend secret tokens frontend me expose nahi hote.
- Developers ko upload, list, download, delete APIs ready milti hain.
- Google login aur email/password login dono available hain.

## Features

- User register/login with JWT cookie auth.
- Login with Google button.
- Owner Google Drive storage for all uploads.
- Upload images, videos, zip archives, PDFs, docs, and other files.
- Drag-and-drop React upload UI.
- Upload progress indicator.
- File list with categories: image, video, archive, document, other.
- Download files through backend streaming.
- Delete file from owner Drive and MongoDB metadata.
- MongoDB user-wise file metadata.
- Tailwind CSS, shadcn-style UI, Material UI feedback, lucide icons.
- Developer docs and reusable upload helper.

## Tech Stack

- Frontend: React, Redux Toolkit, Vite, Tailwind CSS, Material UI, lucide-react
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT cookies, email/password, Google login OAuth
- Storage: Google Drive API using owner refresh token

## How Data Flow Works

1. User registers or logs in with Google.
2. User uploads a file from the dashboard.
3. Express receives the file with `multer`.
4. Backend uploads that file to the owner Google Drive account.
5. MongoDB saves metadata with the logged-in user ID and Google Drive file ID.
6. User sees only files where `file.user === loggedInUser._id`.
7. Download streams the owner Drive file through the backend.

## Important Security Note

Any Google API key, client ID, client secret, or refresh token shared in chat, screenshots, logs, or public repos should be treated as leaked. Rotate it in Google Cloud Console before production.

Never commit:

- `.env`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REFRESH_TOKEN`
- real MongoDB credentials

## Required Redirect URIs

Add both redirect URIs in your Google Cloud OAuth Web Client:

```text
http://localhost:3000/api/auth/google/callback
http://localhost:4000/oauth2callback
```

First URI is for user Google login. Second URI is only for the one-time owner Drive refresh token helper.

## Environment Configuration

Create server env file:

```bash
copy .env.example .env
```

Create client env file:

```bash
copy client\.env.example client\.env
```

### Server `.env`

```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/drive-uploader
JWT_SECRET=replace-with-a-long-random-secret

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_LOGIN_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

GOOGLE_DRIVE_REFRESH_TOKEN=owner-google-drive-refresh-token
GOOGLE_OWNER_DRIVE_SCOPE=https://www.googleapis.com/auth/drive.file
OWNER_TOKEN_PORT=4000

GOOGLE_DRIVE_FOLDER_ID=
MAX_UPLOAD_MB=250
```

### Client `client/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

## Env Values Kaha Se Milenge

### `PORT`

Backend server port. Local development me `3000` rakho.

### `CLIENT_URL`

Frontend URL. Local Vite app ke liye:

```text
http://localhost:5173
```

Production me apna frontend domain:

```text
https://your-domain.com
```

### `MONGO_URI`

Local MongoDB:

```text
mongodb://127.0.0.1:27017/drive-uploader
```

MongoDB Atlas:

```text
mongodb+srv://USERNAME:PASSWORD@cluster-name.mongodb.net/drive-uploader
```

Atlas use karte waqt username, password, IP allowlist, and database name properly set karna.

### `JWT_SECRET`

Long random string. Generate karne ke liye:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Output ko `JWT_SECRET` me paste karo.

### `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

Google Cloud Console se milenge:

1. Go to Google Cloud Console.
2. Create or select a project.
3. Open `APIs & Services`.
4. Open `OAuth consent screen`.
5. Configure app name, support email, and developer contact email.
6. Add test users if app is in testing mode.
7. Open `Credentials`.
8. Click `Create Credentials`.
9. Select `OAuth client ID`.
10. Application type select karo: `Web application`.
11. Add authorized redirect URIs:

```text
http://localhost:3000/api/auth/google/callback
http://localhost:4000/oauth2callback
```

12. Create.
13. Copy `Client ID` into `GOOGLE_CLIENT_ID`.
14. Copy `Client secret` into `GOOGLE_CLIENT_SECRET`.

### `GOOGLE_LOGIN_REDIRECT_URI`

Local:

```text
http://localhost:3000/api/auth/google/callback
```

Production:

```text
https://your-api-domain.com/api/auth/google/callback
```

This exact URL must also exist in Google Cloud OAuth redirect URIs.

### `GOOGLE_DRIVE_REFRESH_TOKEN`

This token decides which Google Drive account stores all uploaded user files.

Steps:

1. Put real `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`.
2. In Google Cloud OAuth Web Client, make sure this redirect URI exists:

```text
http://localhost:4000/oauth2callback
```

3. Run:

```bash
npm run google:owner-token
```

4. Terminal will print a Google approval URL.
5. Open that URL in browser.
6. Login with **your owner Google account**, not a normal user account.
7. Approve the Drive permission.
8. Browser will show success.
9. Terminal will print:

```env
GOOGLE_DRIVE_REFRESH_TOKEN=...
```

10. Copy that line into `.env`.
11. Restart backend.

### `GOOGLE_OWNER_DRIVE_SCOPE`

Default:

```text
https://www.googleapis.com/auth/drive.file
```

This is limited scope. It lets the app create/manage files created by the app. If you need broader owner Drive access, use a broader Google Drive scope only after understanding the security tradeoff.

### `OWNER_TOKEN_PORT`

Local port used only by the one-time refresh token helper.

Default:

```text
4000
```

If port 4000 is busy, change it and add the matching redirect URI in Google Cloud.

### `GOOGLE_DRIVE_FOLDER_ID`

Optional. If empty, files upload to owner Drive root / app-created area depending on Drive behavior.

To get folder ID:

1. Open Google Drive.
2. Open the target folder.
3. URL will look like:

```text
https://drive.google.com/drive/folders/1AbCFolderIdHere
```

4. Copy only:

```text
1AbCFolderIdHere
```

5. Put it in:

```env
GOOGLE_DRIVE_FOLDER_ID=1AbCFolderIdHere
```

### `MAX_UPLOAD_MB`

Maximum upload size in MB.

Example:

```env
MAX_UPLOAD_MB=250
```

## Step By Step Local Setup

### 1. Install root dependencies

```bash
npm install
```

### 2. Install frontend dependencies

```bash
npm install --prefix client
```

### 3. Create env files

```bash
copy .env.example .env
copy client\.env.example client\.env
```

### 4. Start MongoDB

Local MongoDB example:

```bash
mongod
```

Or use MongoDB Atlas and update `MONGO_URI`.

### 5. Configure Google Cloud

Enable Google Drive API and create OAuth Web Client using the steps above.

### 6. Generate owner Drive refresh token

```bash
npm run google:owner-token
```

Copy printed `GOOGLE_DRIVE_REFRESH_TOKEN` into `.env`.

### 7. Start development servers

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

## App Use Flow

1. Open frontend.
2. Register with username/password or click `Login with Google`.
3. Dashboard opens.
4. Upload image/video/zip/document/file.
5. File saves in owner Google Drive.
6. Metadata saves in MongoDB.
7. User can download/delete from dashboard.

## API

See [docs/API.md](docs/API.md) for request and response examples.

## Developer Guide

See [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) for architecture notes, production notes, and reusable upload example.

## Common Problems

### Google login says redirect URI mismatch

The value in `.env` and Google Cloud must match exactly:

```env
GOOGLE_LOGIN_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

Google Cloud redirect URI must also be:

```text
http://localhost:3000/api/auth/google/callback
```

### Owner token script does not return refresh token

Try:

1. Go to Google Account permissions.
2. Remove this app from third-party access.
3. Run again:

```bash
npm run google:owner-token
```

The helper uses `prompt=consent`, but Google may not return a refresh token if the app was already approved before.

### Upload says owner Google Drive is not configured

Check these env values:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_DRIVE_REFRESH_TOKEN=...
```

Also make sure values are real, not placeholders from `.env.example`.

### MongoDB connection failed

Check:

- MongoDB service is running.
- `MONGO_URI` is correct.
- Atlas IP allowlist includes your IP.
- Atlas username/password are correct.

### API key confusion

Google API key is not enough for private Google Drive uploads. This project uses OAuth client ID, OAuth client secret, and owner refresh token.

## Production Checklist

- Use HTTPS.
- Set `NODE_ENV=production`.
- Set `CLIENT_URL` to production frontend URL.
- Set `GOOGLE_LOGIN_REDIRECT_URI` to production backend callback URL.
- Add production callback URL in Google Cloud OAuth client.
- Use strong `JWT_SECRET`.
- Use MongoDB Atlas or managed MongoDB.
- Keep `.env` outside git.
- Rotate leaked Google credentials before deployment.
