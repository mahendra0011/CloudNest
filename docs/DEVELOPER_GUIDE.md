# CloudNest Developer Guide

CloudNest is a MERN starter for apps that need user file uploads, but do not want to build storage from zero. It stores the actual files in the owner Google Drive account and stores file metadata in MongoDB.

Important idea:

- The logged-in user uploads from your app.
- The file is saved in your Google Drive, not the user's Drive.
- MongoDB stores which user owns which uploaded file.
- The frontend only talks to your backend API.
- Google client secret and Drive refresh token stay only on the backend.

This guide is written for developers who want to understand how the project works, customize it, or copy only the upload feature into another project.

## Who Should Use This Guide

Use this guide if you want to:

- Add image, video, zip, PDF, document, or general file upload to a React/Node project.
- Use Google Drive as a cheap owner-controlled storage backend.
- Let users login and see only their own uploaded files.
- Reuse only the upload API without using the full CloudNest dashboard.
- Build your own UI on top of the existing backend.
- Understand which files to copy if you are integrating this into another MERN app.

## High Level Architecture

CloudNest has three main layers:

1. React frontend
2. Express backend
3. MongoDB plus Google Drive storage

The responsibility split is simple:

| Layer | Responsibility |
| --- | --- |
| React | Login UI, Google login button, upload UI, file list, download/delete actions |
| Redux Toolkit | Auth state, file list state, upload progress, loading/error states |
| Express | Auth routes, Google login OAuth, upload route, download route, delete route |
| Multer | Receives multipart file uploads and temporarily saves them |
| Google Drive API | Stores actual uploaded files in the owner Drive account |
| MongoDB | Stores users and file metadata |

## Request Flow

When a user uploads a file:

1. User logs in with email/password or Google login.
2. Backend sets an HTTP-only `token` cookie.
3. Frontend sends the selected file to `POST /api/files/upload`.
4. Request must include cookies because the upload route is protected.
5. `multer` saves the file temporarily on the server.
6. Backend checks that owner Google Drive credentials are configured.
7. Backend uploads the temporary file to owner Google Drive.
8. Google Drive returns file metadata such as `id`, `webViewLink`, `thumbnailLink`, and `mimeType`.
9. Backend saves MongoDB metadata with the logged-in user's ID.
10. Temporary local file is removed.
11. Frontend receives the saved file metadata and updates the UI.

Download flow:

1. User clicks download.
2. Browser opens `GET /api/files/:fileId/download`.
3. Backend checks that the file belongs to the logged-in user.
4. Backend streams the Google Drive file through Express.
5. Browser downloads the file.

Delete flow:

1. User clicks delete.
2. Frontend calls `DELETE /api/files/:fileId`.
3. Backend checks ownership.
4. Backend deletes the file from Google Drive when Drive is configured.
5. Backend deletes MongoDB metadata.

## Important Folder Structure

```text
CloudNest/
  app.js
  config/
    db.js
    googleDrive.js
    multer.config.js
  middlewares/
    auth.js
  models/
    user.model.js
    files.model.js
  routes/
    user.routes.js
    file.routes.js
    drive.routes.js
  services/
    googleDrive.service.js
  scripts/
    google-owner-token.js
  client/
    src/
      App.jsx
      lib/api.js
      features/auth/authSlice.js
      features/files/filesSlice.js
```

Most developers only need to understand these files:

| File | Why it matters |
| --- | --- |
| `app.js` | Registers Express middleware and API routes |
| `routes/user.routes.js` | Register, login, Google login, logout, current user |
| `routes/file.routes.js` | List, upload, download, delete files |
| `services/googleDrive.service.js` | Upload/download/delete logic for owner Google Drive |
| `config/googleDrive.js` | Google OAuth client and owner Drive client setup |
| `config/multer.config.js` | Temporary file upload storage and max file size |
| `models/files.model.js` | MongoDB metadata schema for uploaded files |
| `client/src/lib/api.js` | Frontend API helpers, upload progress helper, download URL helper |
| `client/src/features/files/filesSlice.js` | Redux file actions and upload state |

## Environment Setup

Copy the backend env file:

```bash
copy .env.example .env
```

Required backend env:

```text
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/cloudnest
JWT_SECRET=change-this-to-a-long-random-secret
CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_LOGIN_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

GOOGLE_DRIVE_REFRESH_TOKEN=owner-google-drive-refresh-token
GOOGLE_OWNER_DRIVE_SCOPE=https://www.googleapis.com/auth/drive.file
GOOGLE_DRIVE_FOLDER_ID=

MAX_UPLOAD_MB=250
OWNER_TOKEN_PORT=4000
```

Copy the frontend env file:

```bash
copy client\.env.example client\.env
```

Frontend env:

```text
VITE_API_URL=http://localhost:3000/api
```

## Google Cloud Setup

You need Google OAuth credentials. A plain Google API key is not enough for private Drive upload.

Step by step:

1. Open Google Cloud Console.
2. Create or select a project.
3. Open `APIs & Services`.
4. Enable `Google Drive API`.
5. Open `OAuth consent screen`.
6. Add app name, support email, and developer contact email.
7. Add your Google account as a test user if the app is in testing mode.
8. Open `Credentials`.
9. Create `OAuth client ID`.
10. Choose `Web application`.
11. Add this redirect URI for user login:

```text
http://localhost:3000/api/auth/google/callback
```

12. Add this redirect URI for the owner refresh token helper:

```text
http://localhost:4000/oauth2callback
```

13. Copy the client ID into `GOOGLE_CLIENT_ID`.
14. Copy the client secret into `GOOGLE_CLIENT_SECRET`.

For production, add your deployed backend callback too:

```text
https://your-api-domain.com/api/auth/google/callback
```

Then set:

```text
GOOGLE_LOGIN_REDIRECT_URI=https://your-api-domain.com/api/auth/google/callback
CLIENT_URL=https://your-frontend-domain.com
```

## Owner Google Drive Storage

CloudNest is designed so users do not connect their own Google Drive. All uploads go into the owner Drive account configured by the backend.

That means this env value is the key part:

```text
GOOGLE_DRIVE_REFRESH_TOKEN=owner-google-drive-refresh-token
```

To generate it:

```bash
npm run google:owner-token
```

The script will:

1. Start a local callback server.
2. Print a Google consent URL.
3. Ask you to open that URL in a browser.
4. Ask you to approve using the owner Google account.
5. Print a refresh token.

Put that token in `.env`.

By default, the owner token uses:

```text
https://www.googleapis.com/auth/drive.file
```

This is safer than full Drive access because it limits what the app can manage. If you use a manually created Drive folder and uploads fail, make sure the owner account has access to that folder. You can also set `GOOGLE_DRIVE_FOLDER_ID` to organize all category folders inside one parent folder.

## How Files Are Organized In Drive

CloudNest creates category folders in Google Drive:

| Category | Folder |
| --- | --- |
| `image` | `Images` |
| `video` | `Videos` |
| `archive` | `Archives` |
| `document` | `Documents` |
| `other` | `Other Files` |

The category is detected in `routes/file.routes.js` by checking MIME type and file extension.

To add more file groups, update `getCategory`:

```js
function getCategory(mimeType, originalName) {
  mimeType = mimeType || '';

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';

  const ext = path.extname(originalName).toLowerCase();
  if (['.zip', '.rar', '.7z'].includes(ext)) return 'archive';

  return 'other';
}
```

If you add a new category, also update:

- `models/files.model.js`
- `services/googleDrive.service.js`
- Any frontend category label/icon logic

## MongoDB File Metadata

Google Drive stores the real file. MongoDB stores metadata so your app knows which user owns which Drive file.

`models/files.model.js` stores:

| Field | Purpose |
| --- | --- |
| `user` | MongoDB user ID of the uploader |
| `driveFileId` | Google Drive file ID |
| `originalName` | Original uploaded file name |
| `mimeType` | File MIME type |
| `size` | File size in bytes |
| `category` | `image`, `video`, `archive`, `document`, or `other` |
| `webViewLink` | Google Drive preview link |
| `webContentLink` | Google Drive content link when available |
| `thumbnailLink` | Google Drive thumbnail link when available |
| `iconLink` | Google Drive icon link when available |
| `driveCreatedTime` | Created time returned by Google Drive |

The important security rule:

```js
fileModel.findOne({
  _id: req.params.fileId,
  user: req.user._id
});
```

Every list, download, and delete operation should filter by `user: req.user._id`. Without this check, one user could access another user's uploaded file.

## Backend API Routes

All routes are prefixed with `/api`.

### Auth routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create user and set auth cookie |
| `POST` | `/api/auth/login` | Login and set auth cookie |
| `GET` | `/api/auth/google` | Get Google login URL |
| `GET` | `/api/auth/google/callback` | Google login callback |
| `GET` | `/api/auth/me` | Get current logged-in user |
| `POST` | `/api/auth/logout` | Clear auth cookie |

### Drive routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/drive/status` | Check whether owner Drive is configured |
| `GET` | `/api/drive/connect` | Returns `410` because users do not connect Drive |

### File routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/files` | List logged-in user's files |
| `POST` | `/api/files/upload` | Upload file to owner Drive |
| `GET` | `/api/files/:fileId/download` | Download logged-in user's file |
| `DELETE` | `/api/files/:fileId` | Delete logged-in user's file |

## Upload API Details

Upload endpoint:

```text
POST /api/files/upload
```

Request type:

```text
multipart/form-data
```

Required field name:

```text
file
```

Example response:

```json
{
  "file": {
    "id": "mongo-file-id",
    "driveFileId": "google-drive-file-id",
    "originalName": "invoice.pdf",
    "mimeType": "application/pdf",
    "size": 120934,
    "category": "document",
    "webViewLink": "https://drive.google.com/...",
    "thumbnailLink": "https://...",
    "iconLink": "https://...",
    "createdAt": "2026-06-08T..."
  }
}
```

Common upload errors:

| Status | Meaning |
| --- | --- |
| `400` | No file was sent |
| `401` | User is not logged in or cookie is missing |
| `503` | Owner Google Drive is not configured |
| `413` | File is larger than `MAX_UPLOAD_MB` |

## Frontend API Helper

The helper is in:

```text
client/src/lib/api.js
```

It exposes:

```js
apiFetch(path, options)
uploadFile(file, onProgress)
downloadUrl(fileId)
```

`apiFetch` uses:

```js
credentials: 'include'
```

That is required because auth uses HTTP-only cookies.

`uploadFile` uses `XMLHttpRequest` instead of plain `fetch` because browser `fetch` does not provide simple upload progress events.

## Full Dashboard Integration

Use the full dashboard if you want:

- Login/register UI.
- Google login button.
- Drag-and-drop upload.
- Upload progress.
- File list.
- Download and delete buttons.
- Category badges and file metadata.

Important frontend files:

| File | Purpose |
| --- | --- |
| `client/src/App.jsx` | Main dashboard UI |
| `client/src/features/auth/authSlice.js` | Login/register/me/Google login state |
| `client/src/features/files/filesSlice.js` | File list/upload/delete state |
| `client/src/lib/api.js` | API helpers |

If you copy the dashboard into another app:

1. Copy `client/src/lib/api.js`.
2. Copy `client/src/features/auth/authSlice.js`.
3. Copy `client/src/features/files/filesSlice.js`.
4. Register both reducers in your Redux store.
5. Set `VITE_API_URL` to your backend API URL.
6. Make sure your backend CORS allows your frontend URL.
7. Keep `credentials: 'include'` on all protected API calls.

## Upload Only Without Dashboard

Use this section when you do not want the full dashboard. For example, you already have your own UI and only want an upload button inside an existing page.

Minimum requirement:

- User must already be logged in, or you must create your own auth flow.
- Backend must have owner Google Drive env configured.
- The upload request must send `multipart/form-data`.
- The file field name must be `file`.
- Cookies must be included.

### React Upload Only Component

Create a small component like this:

```jsx
import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function uploadFileOnly(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    formData.append('file', file);
    xhr.open('POST', `${API_URL}/files/upload`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress(progress);
    };

    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText || '{}');

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data.file);
      } else {
        reject(new Error(data.message || 'Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

export default function UploadOnly() {
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      setLoading(true);
      setProgress(0);

      const savedFile = await uploadFileOnly(file, setProgress);
      setUploadedFile(savedFile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  }

  return (
    <div>
      <input type="file" onChange={handleChange} disabled={loading} />

      {loading && <p>Uploading {progress}%</p>}
      {error && <p>{error}</p>}

      {uploadedFile && (
        <div>
          <p>{uploadedFile.originalName}</p>
          <a href={`${API_URL}/files/${uploadedFile.id}/download`}>
            Download
          </a>
        </div>
      )}
    </div>
  );
}
```

This component does not need Redux. It is good when your app has one upload area such as:

- Upload resume
- Upload invoice
- Upload profile document
- Upload assignment zip
- Upload product image
- Upload admin attachment

### Use Existing `uploadFile` Helper Only

If you are already inside this project and do not want to duplicate upload logic, import the helper:

```jsx
import { useState } from 'react';
import { uploadFile, downloadUrl } from './lib/api';

export default function SmallUploader() {
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);

  async function handleFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    const data = await uploadFile(selected, setProgress);
    setFile(data.file);
  }

  return (
    <section>
      <input type="file" onChange={handleFile} />
      <p>{progress}%</p>

      {file && (
        <a href={downloadUrl(file.id)}>
          Download {file.originalName}
        </a>
      )}
    </section>
  );
}
```

### Plain HTML Upload Only Example

This is useful if you are testing the backend without React:

```html
<input id="fileInput" type="file" />
<button id="uploadButton">Upload</button>
<progress id="progress" value="0" max="100"></progress>

<script>
  const API_URL = 'http://localhost:3000/api';

  document.getElementById('uploadButton').addEventListener('click', () => {
    const file = document.getElementById('fileInput').files[0];
    if (!file) return alert('Choose a file first');

    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    formData.append('file', file);
    xhr.open('POST', `${API_URL}/files/upload`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      document.getElementById('progress').value =
        Math.round((event.loaded / event.total) * 100);
    };

    xhr.onload = () => {
      console.log(JSON.parse(xhr.responseText || '{}'));
    };

    xhr.send(formData);
  });
</script>
```

You still need to be logged in first because the backend uses auth cookies.

### Upload Only With `fetch`

Use this only if you do not need upload progress:

```js
async function uploadWithoutProgress(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3000/api/files/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Upload failed');
  }

  return data.file;
}
```

Do not manually set the `Content-Type` header for `FormData`. The browser adds the correct boundary automatically.

## If You Want Upload Without Login

By default, CloudNest requires login for uploads. This is safer because every file belongs to a user.

If your project needs public upload, you can remove `authMiddleware` from the upload route, but do this carefully:

```js
router.post('/upload', upload.single('file'), async (req, res, next) => {
  // public upload logic
});
```

If you remove auth, you must decide how to store ownership. Options:

- Store all files under one admin user.
- Store an anonymous session ID.
- Store an email field from the form.
- Store a project/order/ticket ID.

For most projects, keeping auth is better. Public upload can be abused unless you add limits, validation, captcha, and cleanup rules.

## Backend Only Integration In Another Project

If you already have a frontend and only want the backend upload API, copy these parts:

```text
config/googleDrive.js
config/multer.config.js
middlewares/auth.js
models/files.model.js
routes/file.routes.js
routes/drive.routes.js
services/googleDrive.service.js
scripts/google-owner-token.js
```

Then install the required backend packages:

```bash
npm install express mongoose multer googleapis cookie-parser cors dotenv jsonwebtoken
```

If you also copy local auth:

```bash
npm install bcrypt express-validator
```

Register routes in your Express app:

```js
app.use('/api/files', fileRouter);
app.use('/api/drive', driveRouter);
```

Make sure these middlewares exist before routes:

```js
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
```

## Customizing Upload Limits

Upload size is controlled by:

```text
MAX_UPLOAD_MB=250
```

`config/multer.config.js` uses:

```js
limits: {
  fileSize: maxUploadMb * 1024 * 1024
}
```

If you allow very large videos or zip files, also check:

- Hosting provider request timeout.
- Reverse proxy size limits.
- Server disk space for temporary files.
- Google Drive quota.
- Google Drive API quota.

## Customizing Allowed File Types

Currently the backend accepts any file type up to `MAX_UPLOAD_MB`.

To restrict file types, add a `fileFilter` in `config/multer.config.js`:

```js
const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'application/zip'
];

module.exports = multer({
  storage,
  limits: {
    fileSize: maxUploadMb * 1024 * 1024
  },
  fileFilter(req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('This file type is not allowed.'));
    }
  }
});
```

## Customizing Drive Folder Structure

By default, files are stored by category. If you want every user's files in separate folders, update `services/googleDrive.service.js`.

Example idea:

```text
CloudNest Uploads/
  user-id-1/
    Images/
    Documents/
  user-id-2/
    Images/
    Documents/
```

To do that, pass the user to `uploadToDrive` from `routes/file.routes.js`, then create a user folder before creating the category folder.

Keep in mind that folder creation adds extra Drive API calls.

## Adding Upload To An Existing Page

If your existing app already has auth and layout, you usually do not need the CloudNest dashboard. Use this small checklist:

1. Copy `client/src/lib/api.js`.
2. Set `VITE_API_URL`.
3. Add one file input or drag/drop area.
4. Call `uploadFile(file, setProgress)`.
5. Save returned `data.file` in your page state.
6. Use `downloadUrl(file.id)` if you need a download link.
7. Call `GET /api/files` only if you want to show previous uploads.
8. Call `DELETE /api/files/:fileId` only if users can delete uploads.

For a single upload field, you do not need Redux.

For a full file manager, Redux is useful because multiple components need the same file state.

## Download Button Example

```jsx
import { downloadUrl } from './lib/api';

function DownloadButton({ file }) {
  return (
    <a href={downloadUrl(file.id)}>
      Download
    </a>
  );
}
```

The download URL uses your backend, not a public Google Drive URL. That keeps the ownership check in your app.

## Delete Button Example

```jsx
import { apiFetch } from './lib/api';

async function deleteUploadedFile(fileId) {
  await apiFetch(`/files/${fileId}`, {
    method: 'DELETE'
  });
}
```

After delete, remove the file from your local UI state.

## Google Login Button Flow

The frontend should not build the Google login URL manually. Ask the backend:

```js
const data = await apiFetch('/auth/google');
window.location.href = data.url;
```

Why backend creates the URL:

- Backend controls redirect URI.
- Backend creates and verifies OAuth state.
- Frontend does not need client secret.
- Callback can set the HTTP-only JWT cookie.

## CORS And Cookies

Because auth uses HTTP-only cookies, frontend requests must include credentials.

Frontend:

```js
fetch(url, {
  credentials: 'include'
});
```

Backend:

```js
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

In production:

- Use HTTPS.
- Set correct `CLIENT_URL`.
- Set correct `GOOGLE_LOGIN_REDIRECT_URI`.
- Cookie `secure` becomes true when `NODE_ENV=production`.

## Local Development

Install backend packages:

```bash
npm install
```

Install frontend packages:

```bash
npm install --prefix client
```

Create env files:

```bash
copy .env.example .env
copy client\.env.example client\.env
```

Run backend and frontend together:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:3000/api/health
```

## Testing Upload Manually

1. Start MongoDB.
2. Start the app with `npm run dev`.
3. Register a user or login with Google.
4. Check Drive status in the app.
5. Upload a small test image or PDF.
6. Confirm the file appears in the UI.
7. Confirm the file appears in owner Google Drive.
8. Click download.
9. Click delete and confirm it is removed from Drive and MongoDB.

## Common Problems

### `Owner Google Drive is not configured`

Your backend is missing one or more values:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_DRIVE_REFRESH_TOKEN
```

Generate the owner refresh token again:

```bash
npm run google:owner-token
```

### Google login redirect mismatch

The value in `.env` must exactly match Google Cloud Console:

```text
GOOGLE_LOGIN_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

Google Cloud Console must include:

```text
http://localhost:3000/api/auth/google/callback
```

### Upload returns `401`

The user is not logged in or the browser did not send the cookie.

Check:

- Login request succeeded.
- Browser has the `token` cookie.
- Frontend uses `credentials: 'include'`.
- Backend CORS has `credentials: true`.
- `CLIENT_URL` matches the frontend origin.

### Upload progress stays at zero

Use `XMLHttpRequest` for progress. Plain `fetch` is fine for upload, but it does not give easy upload progress events.

### File uploads but does not show in list

Check MongoDB. The upload route must save a `file` document with:

```js
user: req.user._id
```

The list route only returns:

```js
find({ user: req.user._id })
```

### Large files fail

Check:

- `MAX_UPLOAD_MB`
- server timeout
- hosting provider upload limit
- proxy upload limit
- available temp disk space
- Drive quota

### Google API key confusion

Google API key is not enough for private Drive upload. CloudNest needs OAuth client ID, OAuth client secret, and owner refresh token.

## Production Checklist

Before deploying:

- Rotate any credentials that were shared in chat, screenshots, logs, or public repos.
- Use a strong `JWT_SECRET`.
- Use HTTPS.
- Set `NODE_ENV=production`.
- Set production `CLIENT_URL`.
- Set production `GOOGLE_LOGIN_REDIRECT_URI`.
- Add production callback URL in Google Cloud Console.
- Use a production MongoDB database.
- Configure `MAX_UPLOAD_MB`.
- Keep `.env` out of Git.
- Do not expose `GOOGLE_CLIENT_SECRET` in frontend code.
- Do not expose `GOOGLE_DRIVE_REFRESH_TOKEN` in frontend code.
- Check owner Google Drive storage capacity.
- Test upload, download, delete, and Google login after deployment.

## When To Use Full Dashboard vs Upload Only

Use full dashboard when:

- Users need to see all previous uploads.
- Users need delete and download actions.
- You want a ready file manager UI.
- Multiple upload categories matter.
- You want Redux-managed file state.

Use upload only when:

- You only need one file field in an existing form.
- You already have your own dashboard.
- You only need upload and maybe one download link.
- You do not want Redux for this feature.
- The page is simple, like resume upload, invoice upload, or document attachment.

In short: full dashboard is best for file management. Upload only is best for adding a single upload feature to an existing app.
