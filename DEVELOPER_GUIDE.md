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

---

# 📘 COMPREHENSIVE UPLOAD FLOW DOCUMENTATION FOR DEVELOPERS

This section provides a complete, developer-focused reference on both upload flows in CloudNest. Every file, function, API route, and component is documented with exact file paths, line references, and data flow.

## Table of Contents

1. [Flow 1: User Self-Upload (`POST /api/files/user-upload`)](#flow-1-user-self-upload)
2. [Flow 2: Admin Upload on Behalf of User (`POST /api/files/admin-upload`)](#flow-2-admin-upload-on-behalf-of-user)
3. [Flow 3: Admin Upload via Dashboard (`POST /api/files/upload`)](#flow-3-admin-upload-via-dashboard)
4. [Complete File Reference](#complete-file-reference)
5. [Drive Selection & Failover System](#drive-selection--failover-system)
6. [Admin Dashboard Data Display](#admin-dashboard-data-display)
7. [Storage Management Panel](#storage-management-panel)

---

## Flow 1: User Self-Upload

**Route**: `POST /api/files/user-upload`  
**File**: `routes/file.routes.js` — Lines 160-180  
**Purpose**: Any logged-in user uploads a file. The file goes to the admin's Google Drive automatically. The file is assigned to the uploading user.

### Who Can Use This

- Any authenticated user (regular user or admin).
- No admin role required.
- The user does NOT need to know which drive or folder — all happens automatically.

### Complete Data Flow

```
User Browser                         Express Server                      Google Drive API        MongoDB
     │                                    │                                   │                     │
     │  1. User selects file              │                                   │                     │
     │  2. POST /api/files/user-upload    │                                   │                     │
     │     multipart/form-data            │                                   │                     │
     │     field: "file"                  │                                   │                     │
     │     Cookie: token                  │                                   │                     │
     │───────────────────────────────────>│                                   │                     │
     │                                    │  3. authMiddleware verifies JWT   │                     │
     │                                    │     from cookie                   │                     │
     │                                    │  4. Multer saves temp file        │                     │
     │                                    │  5. getCategory() determines      │                     │
     │                                    │     category from MIME type/ext   │                     │
     │                                    │  6. getUploadDriveResult()        │                     │
     │                                    │     finds admin user in DB        │────Find admin──────>│
     │                                    │     then calls                    │                     │
     │                                    │     uploadToActiveDriveWithF()-   │                     │
     │                                    │     -ailover()                    │                     │
     │                                    │                                   │                     │
     │                                    │  7. Drive Manager checks          │                     │
     │                                    │     active drive settings         │────Find settings───>│
     │                                    │     for the admin user            │                     │
     │                                    │                                   │                     │
     │                                    │  8. If active drive under 90%    │                     │
     │                                    │     → upload to it                │                     │
     │                                    │  9. If over 90% → auto-switch     │                     │
     │                                    │     to best pool drive            │                     │
     │                                    │                                   │                     │
     │                                    │ 10. Get drive client with         │                     │
     │                                    │     stored credentials            │                     │
     │                                    │ 11. Get or create category        │───────API call─────>│
     │                                    │     folder (Images/Videos/etc)    │                     │
     │                                    │ 12. Stream upload file to Drive   │───────Stream───────>│
     │                                    │                                   │<────Response────────│
     │                                    │ 13. Update drive storage stats    │                     │
     │                                    │                                   │                     │
     │                                    │ 14. Create File document          │─────Create doc─────>│
     │                                    │     in MongoDB                   │                     │
     │                                    │     {user, driveId,               │                     │
     │                                    │      driveFileId, originalName,   │                     │
     │                                    │      mimeType, size, category,    │                     │
     │                                    │      webViewLink, etc}            │                     │
     │                                    │                                   │                     │
     │                                    │ 15. Record activity log           │─────Activity log───>│
     │                                    │                                   │                     │
     │                                    │ 16. Delete temp file              │                     │
     │                                    │                                   │                     │
     │  <─────────── 201 { file } ────────│                                   │                     │
```

### Backend Code (routes/file.routes.js — Lines 160-180)

```javascript
router.post('/user-upload', authMiddleware, upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please choose a file to upload.' });
    }
    try {
        const targetUser = req.user;  // File is assigned to the uploader
        const category = getCategory(req.file.mimetype, req.file.originalname);
        // getUploadDriveResult finds the admin user automatically (not the posting user)
        const uploadResult = await getUploadDriveResult({ file: req.file, category });
        const newFile = await createUploadedFile({ req, targetUser, category, uploadResult });
        res.status(201).json({ file: formatFile(newFile) });
    } catch (err) {
        next(err);
    } finally {
        fs.unlink(req.file.path).catch(() => {});
    }
});
```

### Key Detail: How the Drive is Selected

```javascript
// routes/file.routes.js — Lines 73-85
async function getUploadDriveResult({ file, category, adminId }) {
    let adminUserId;
    if (adminId) {
        adminUserId = adminId;
    } else {
        // For user upload, find the first admin user in DB
        const admin = await userModel.findOne({ role: 'admin' }).select('_id');
        if (!admin) throw new Error('No admin user found.');
        adminUserId = admin._id;
    }
    return uploadToActiveDriveWithFailover({ file, category, userId: adminUserId });
}
```

This function always uses the **admin's** drive settings — regular users never have their own storage config.

### Frontend: UploadDemo Component (HomePage.jsx — Lines 619-810)

The `UploadDemo` component on the homepage uses this route:

```javascript
// Client-side upload to POST /api/files/user-upload
import { userUploadFile } from '../../lib/api.js';

async function handleUpload(file) {
    // userUploadFile uses XMLHttpRequest with onProgress callback
    const result = await userUploadFile(file, (pct) => setProgress(pct));
    // result.file contains the saved file metadata
}
```

### Frontend: userUploadFile Helper (client/src/lib/api.js — Lines 73-98)

```javascript
export function userUploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    formData.append('file', file);
    xhr.open('POST', `${API_PREFIX}/files/user-upload`);
    xhr.withCredentials = true;  // Required for auth cookie

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText || '{}');
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data.message || 'Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}
```

### What the User Sees

1. User browses to homepage → sees the upload section
2. User clicks "Choose File to Upload" or drag-and-drops a file
3. File is uploaded with progress bar
4. On success: green confirmation "✓ Uploaded to Google Drive!"
5. File is now stored in the admin's Google Drive and recorded in MongoDB

### What the Admin Sees

The uploaded file immediately appears in the admin dashboard **Upload Management** tab. The admin can view, search, filter, download, or delete any file.

---

## Flow 2: Admin Upload on Behalf of User

**Route**: `POST /api/files/admin-upload`  
**File**: `routes/file.routes.js` — Lines 238-301  
**Purpose**: Admin uploads a file and assigns it to a specific user by name/email. Admin can also choose which Google Drive to use.

### Who Can Use This

- Only users with `role: 'admin'`.
- Protected by `requireAdmin` middleware.

### Why This Exists

Sometimes a user cannot upload themselves (e.g. offline, no account, restricted UI). The admin can:

1. Upload the file on their behalf
2. Specify the user's name and email (for display)
3. Optionally select which Google Drive to store the file

### Complete Data Flow

```
Admin Browser                       Express Server                   Google Drive API           MongoDB
     │                                    │                              │                        │
     │  1. Admin fills upload form:       │                              │                        │
     │     - Select file                  │                              │                        │
     │     - User Name (e.g. Rajesh)      │                              │                        │
     │     - User Email (e.g. r@ex.com)   │                              │                        │
     │     - Drive (optional dropdown)    │                              │                        │
     │                                    │                              │                        │
     │  2. POST /api/files/admin-upload   │                              │                        │
     │     multipart/form-data            │                              │                        │
     │     fields: file, userName,        │                              │                        │
     │            userEmail, driveId      │                              │                        │
     │     Cookie: token                  │                              │                        │
     │───────────────────────────────────>│                              │                        │
     │                                    │  3. authMiddleware +         │                        │
     │                                    │     requireAdmin             │                        │
     │                                    │  4. Multer saves temp file   │                        │
     │                                    │  5. Find user by email:      │────Find user──────────>│
     │                                    │     if found → assign to     │                        │
     │                                    │     that user                │                        │
     │                                    │     if not found → assign    │                        │
     │                                    │     to admin (placeholder)   │                        │
     │                                    │                              │                        │
     │                                    │  6. Determine category from  │                        │
     │                                    │     MIME type/extension      │                        │
     │                                    │                              │                        │
     │                                    │  7. If driveId provided:     │                        │
     │                                    │     uploadToDriveById()      │────Upload to Drive────>│
     │                                    │     (specific drive)        │                        │
     │                                    │   Else:                      │                        │
     │                                    │     getUploadDriveResult()   │                        │
     │                                    │     (auto-select with        │                        │
     │                                    │      90% failover)           │                        │
     │                                    │                              │                        │
     │                                    │  8. Stream file to Drive    │────Stream─────────────>│
     │                                    │                              │<────Response───────────│
     │                                    │  9. Update storage stats    │                        │
     │                                    │                              │                        │
     │                                    │ 10. Create File document     │────Create doc─────────>│
     │                                    │     with assigned user       │                        │
     │                                    │     (populated user ref)     │                        │
     │                                    │                              │                        │
     │                                    │ 11. Send email notification  │                        │
     │                                    │     to user (non-blocking)   │                        │
     │                                    │                              │                        │
     │                                    │ 12. Record activity log      │────Activity log───────>│
     │                                    │                              │                        │
     │  <─────────── 201 { file } ────────│                              │                        │
```

### Admin Upload Modal (UploadManagementTab.jsx — Lines 1084-1243)

The modal has these fields:

| Field | Type | Description |
|-------|------|-------------|
| File | File Input | The file to upload (required) |
| User Name | Text Input | Display name for the file owner |
| User Email | Email Input | If matches existing user, file is assigned to them. Otherwise assigned to admin |
| Upload to Drive | Dropdown | Optional: pick specific drive. Defaults to auto-select |

Frontend calls `adminUploadFile()`:

```javascript
// client/src/lib/api.js — Lines 101-131
export function adminUploadFile(file, { userName, userEmail, driveId }, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    formData.append('file', file);
    if (userName) formData.append('userName', userName);
    if (userEmail) formData.append('userEmail', userEmail);
    if (driveId) formData.append('driveId', driveId);

    xhr.open('POST', `${API_PREFIX}/files/admin-upload`);
    xhr.withCredentials = true;
    // ... progress and response handling
    xhr.send(formData);
  });
}
```

### Backend: User Assignment Logic (routes/file.routes.js — Lines 244-255)

```javascript
const { userName, userEmail, driveId } = req.body;

// Find or use the user by email
let targetUser = null;
if (userEmail && userEmail.trim()) {
    targetUser = await userModel.findOne({ email: userEmail.trim().toLowerCase() })
        .select('name email role');
}

// If no matching user found, use the admin themselves as placeholder
if (!targetUser) {
    targetUser = req.user;  // The admin becomes the file owner
}
```

### Backend: Drive Selection (routes/file.routes.js — Lines 260-266)

```javascript
let uploadResult;
if (driveId) {
    // Admin explicitly chose a specific drive — bypass failover
    uploadResult = await uploadToDriveById({ file: req.file, category, driveId });
} else {
    // No specific drive chosen — use admin's Active drive with 90% failover
    uploadResult = await getUploadDriveResult({ file: req.file, category, adminId: req.user._id });
}
```

### Backend: Email Notification (routes/file.routes.js — Lines 208-222)

After a successful upload, the backend sends a notification email to the assigned user (non-blocking):

```javascript
if (targetUser.email) {
    try {
        const userSettings = await Settings.findOne({ user: targetUser._id });
        if (userSettings &&
            userSettings.notificationsEnabled !== false &&
            userSettings.sendUploadEmail !== false) {
            sendUploadNotification({
                to: targetUser.email,
                fileName: req.file.originalname,
                userName: req.user.name || req.user.email,
                uploadDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Calcutta' })
            }).catch(() => {});
        }
    } catch (_) {}
}
```

---

## Flow 3: Admin Upload via Dashboard

**Route**: `POST /api/files/upload`  
**File**: `routes/file.routes.js` — Lines 186-230  
**Purpose**: Admin uploads a file and assigns it to an existing user by selecting a user ID.

### Difference from Flow 2

- Requires a valid `userId` (MongoDB ObjectId) — user must exist in the database
- Admin selects user from a list rather than typing name/email
- Used by the Redux-based UI (`uploadFile()` helper)

### Backend Code (routes/file.routes.js — Lines 186-230)

```javascript
router.post('/upload', authMiddleware, requireAdmin, upload.single('file'), async (req, res, next) => {
    if (!req.file) return res.status(400).json({ message: 'Please choose a file to upload.' });

    try {
        const targetUserId = req.body.userId;
        if (!targetUserId) {
            return res.status(400).json({ message: 'Please select a user to assign this upload.' });
        }
        const targetUser = await userModel.findById(targetUserId).select('name email role');
        if (!targetUser) return res.status(404).json({ message: 'Selected user not found.' });

        const category = getCategory(req.file.mimetype, req.file.originalname);
        const uploadResult = await getUploadDriveResult({ file: req.file, category, adminId: req.user._id });
        const newFile = await createUploadedFile({ req, targetUser, category, uploadResult });

        // ... email notification ...

        res.status(201).json({ file: formatFile(newFile) });
    } catch (err) { next(err); }
    finally { fs.unlink(req.file.path).catch(() => {}); }
});
```

### Frontend: uploadFile Helper (client/src/lib/api.js — Lines 41-71)

```javascript
export function uploadFile(file, onProgress, userId) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    formData.append('file', file);
    if (userId) {
      formData.append('userId', userId);
    }
    xhr.open('POST', `${API_PREFIX}/files/upload`);
    xhr.withCredentials = true;
    // ... progress and response handling
    xhr.send(formData);
  });
}
```

---

## Complete File Reference

### Backend Files

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 1 | `routes/file.routes.js` | 374 | All upload/download/delete routes |
| 2 | `services/driveManager.service.js` | 398 | Drive selection, upload, download, delete, failover |
| 3 | `services/googleDrive.service.js` | — | Legacy Google Drive service (owner-configured) |
| 4 | `config/googleDrive.js` | 121 | OAuth client, login URL, owner drive client |
| 5 | `config/multer.config.js` | — | Temporary file storage config, max file size |
| 6 | `config/crypto.js` | — | Encryption/decryption for stored tokens |
| 7 | `models/files.model.js` | 50 | File metadata schema |
| 8 | `models/drive.model.js` | 71 | Drive configuration schema |
| 9 | `models/settings.model.js` | — | User settings (activeDriveId, notifications) |
| 10 | `models/user.model.js` | — | User schema (email, password, role) |
| 11 | `middlewares/auth.js` | — | JWT verification from cookie |
| 12 | `middlewares/requireAdmin.js` | — | Role check middleware |
| 13 | `routes/drive.routes.js` | 469 | Drive CRUD, OAuth URL generation, sync, stats |

### Frontend Files

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 1 | `client/src/pages/Dashboard/UploadManagementTab.jsx` | 1285 | Full upload management table with filters, search, bulk delete |
| 2 | `client/src/pages/Dashboard/GoogleDriveIntegrationTab.jsx` | 817 | Storage Management: add/edit/delete drives, OAuth token generation, pool management |
| 3 | `client/src/pages/home/HomePage.jsx` | 1461 | Landing page with upload demo, dashboard preview, connected drives display |
| 4 | `client/src/lib/api.js` | 135 | API helper functions (apiFetch, uploadFile, userUploadFile, adminUploadFile, downloadUrl) |
| 5 | `client/src/features/files/filesSlice.js` | — | Redux slice for file CRUD operations |

### Service Files

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 1 | `services/driveManager.service.js` | 398 | Central drive management: getDriveClient, getUploadParentId, getAvailableDrive, uploadToBestDrive, uploadToDriveById, uploadToActiveDriveWithFailover, downloadFromDrive, deleteFromDrive, getStorageStats |
| 2 | `services/activity.service.js` | — | Activity logging (recordActivity) |
| 3 | `services/email.service.js` | — | Email notifications |

---

## Drive Selection & Failover System

The most important backend service for understanding upload routing is **`services/driveManager.service.js`**.

### Architecture Overview

```
                    ┌─────────────────────────────────────────────────┐
                    │            Upload Request Arrives              │
                    └────────────────────┬────────────────────────────┘
                                         │
                    ┌────────────────────▼────────────────────────────┐
                    │       uploadToActiveDriveWithFailover()         │
                    │       (routes/file.routes.js calls this)        │
                    └────────┬────────────┬─────────────┬─────────────┘
                             │            │             │
               ┌─────────────▼──┐  ┌──────▼──────┐  ┌──▼──────────────┐
               │ No active drive│  │ Active drive│  │ Active drive    │
               │ configured     │  │ under 90%   │  │ 90%+ capacity   │
               └────────┬───────┘  └──────┬───────┘  └──────┬──────────┘
                        │                 │                 │
               ┌────────▼──────┐  ┌───────▼───────┐  ┌─────▼─────────────┐
               │uploadToBest   │  │uploadToDrive   │  │Find pool drive    │
               │Drive()        │  │ById(target)    │  │under 90%          │
               └───────────────┘  └───────────────┘  └─────┬─────────────┘
                                                           │
                                              ┌────────────▼──────────┐
                                              │ Found?                │
                                              └────┬────────────┬─────┘
                                                   │            │
                                        ┌──────────▼──┐  ┌─────▼──────────┐
                                        │ Yes: auto-  │  │ No: stay on   │
                                        │ switch to   │  │ current drive │
                                        │ new drive   │  │ (over 90%)    │
                                        └──────────────┘  └───────────────┘
```

### getAvailableDrive() — Smart Selection (driveManager.service.js — Lines 84-120)

```javascript
async function getAvailableDrive(requiredBytes = 0) {
    const drives = await Drive.find({ isActive: true }).lean();
    if (drives.length === 0) throw new Error('No active drives configured.');

    // Sort by usage percentage ascending (least used first)
    const sorted = drives
        .map(d => {
            const total = Number(d.storage?.limit || 0);
            const used = Number(d.storage?.usage || 0);
            const free = total - used;
            const usagePct = total > 0 ? (used / total) * 100 : 0;
            return { ...d, total, used, free, usagePct };
        })
        .filter(d => d.free >= requiredBytes)  // Skip drives without enough space
        .sort((a, b) => a.usagePct - b.usagePct);

    if (sorted.length === 0) {
        // Fallback: return least used drive even if space is low
        const fallback = drives.sort((a, b) => 
            (a.storage?.percentage || 0) - (b.storage?.percentage || 0)
        );
        return fallback[0];
    }

    return sorted[0];  // Drive with lowest usage percentage
}
```

### uploadToActiveDriveWithFailover() (driveManager.service.js — Lines 313-387)

This function implements the 90% threshold failover:

1. Read the admin's `Settings` to get the `activeDriveId`
2. If no active drive → upload to best available drive
3. If active drive has < 90% usage → use it
4. If active drive has ≥ 90% usage:
   - Find another pool drive under 90%
   - If found: auto-switch the active drive in Settings
   - If not found: stay on current drive (over capacity)
5. Record an `auto_switch` activity log entry

```javascript
async function uploadToActiveDriveWithFailover({ file, category, userId }) {
    const Settings = require('../models/settings.model');
    const settings = await Settings.findOne({ user: userId });

    if (!settings || !settings.activeDriveId) {
        return { ...(await uploadToBestDrive({ file, category })), didSwitch: false };
    }

    const activeDrive = await Drive.findById(settings.activeDriveId);
    const usagePct = Number(activeDrive.storage?.percentage || 0);

    if (usagePct < 90) {
        return { ...(await uploadToDriveById({ file, category, driveId: settings.activeDriveId })), didSwitch: false };
    }

    // Active drive is ≥ 90% — find a better pool drive
    const poolDrives = await Drive.find({ 
        _id: { $ne: settings.activeDriveId },
        isActive: true 
    }).lean();

    const candidates = poolDrives
        .map(d => ({ ...d, usagePct: Number(d.storage?.percentage || 0) }))
        .filter(d => d.usagePct < 90)
        .sort((a, b) => a.usagePct - b.usagePct);

    if (candidates.length > 0) {
        // Found a better drive — switch to it
        settings.activeDriveId = candidates[0]._id;
        await settings.save();
        // Record auto-switch activity
        await activityModel.create({ ... });
        return { ...(await uploadToDriveById({ file, category, driveId: candidates[0]._id })), didSwitch: true };
    }

    // All drives also over 90% — use current drive anyway
    return { ...(await uploadToDriveById({ file, category, driveId: settings.activeDriveId })), didSwitch: false };
}
```

### uploadToBestDrive() (driveManager.service.js — Lines 127-173)

Used when no specific drive is targeted. Selects the drive with the lowest usage percentage.

```javascript
async function uploadToBestDrive({ file, category }) {
    const driveDoc = await getAvailableDrive(file.size || 0);
    const driveId = driveDoc._id;
    const gdrive = getDriveClient(driveDoc);
    const folderId = await getUploadParentId({ drive: driveDoc, category });

    const response = await gdrive.files.create({
        requestBody: { name: file.originalname, parents: [folderId] },
        media: { mimeType: file.mimetype, body: fs.createReadStream(file.path) },
        fields: 'id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,iconLink,createdTime',
        supportsAllDrives: true
    });

    // Update drive storage usage in background
    try {
        const about = await gdrive.about.get({ fields: 'storageQuota' });
        await Drive.findByIdAndUpdate(driveId, { $set: { 'storage.limit': ..., 'storage.usage': ..., ... } });
    } catch { /* non-blocking */ }

    return { driveId, googleFile: response.data };
}
```

### uploadToDriveById() (driveManager.service.js — Lines 175-223)

Uploads to a specific drive by ID. Used when admin explicitly selects a drive or failover has a target.

### Drive Client Resolution (driveManager.service.js — Lines 9-32)

```javascript
function getDriveClient(drive) {
    const clientId = drive.clientId || process.env.GOOGLE_CLIENT_ID;
    let secret = drive.clientSecret ? decrypt(drive.clientSecret) : process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_LOGIN_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
    const oauth2Client = new google.auth.OAuth2(clientId, secret, callbackUrl);

    if (drive.isOwnerConfigured) {
        // Use the .env GOOGLE_DRIVE_REFRESH_TOKEN for owner-configured drives
        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });
    } else {
        // Use the per-drive stored (and encrypted) refresh token
        oauth2Client.setCredentials({ refresh_token: decrypt(drive.refreshToken) });
    }
    return google.drive({ version: 'v3', auth: oauth2Client });
}
```

### Category Folder Organization (driveManager.service.js — Lines 37-78)

Files are organized into category-specific subfolders in Google Drive:

```javascript
const categoryFolderNames = {
    image: 'Images',
    video: 'Videos',
    archive: 'Archives',
    document: 'Documents',
    other: 'Other Files'
};
```

The `getUploadParentId()` function checks if the folder exists, creates it if not, and returns the folder ID.

---

## Admin Dashboard Data Display

The admin sees all uploaded files through the **Upload Management** tab. Here's how the data flows from backend to frontend.

### Backend: List Files API (routes/file.routes.js — Lines 123-148)

```javascript
router.get('/', authMiddleware, requireAdmin, async (req, res) => {
    const query = {};
    if (req.query.driveId) {
        const driveIds = req.query.driveId.split(',').filter(Boolean);
        if (driveIds.length === 1 && driveIds[0] === 'none') {
            return res.json({ files: [] });  // No drives selected for view
        }
        const validIds = driveIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length === 1) {
            query.driveId = new mongoose.Types.ObjectId(validIds[0]);
        } else if (validIds.length > 1) {
            query.driveId = { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) };
        } else {
            return res.json({ files: [] });
        }
    }

    const files = await fileModel
        .find(query)
        .populate('user', 'name email')      // Populate user data
        .populate('driveId', 'name')          // Populate drive name
        .sort({ createdAt: -1 });             // Newest first

    res.json({ files: files.map(formatFile) });
});
```

### Frontend: Fetching Files (filesSlice.js)

The Redux slice dispatches `fetchFiles(driveIds)` which calls:

```javascript
// filesSlice.js
fetchFiles: createAsyncThunk('files/fetchFiles', async (driveIds) => {
    const params = driveIds && driveIds.length > 0 ? `?driveId=${driveIds.join(',')}` : '';
    return apiFetch(`/files${params}`);
})
```

### Frontend: UploadManagementTab Component (UploadManagementTab.jsx)

Key features of the upload management table:

| Feature | Implementation |
|---------|---------------|
| Search by file name, user name, email, MIME type | Lines 426-434 |
| Filter by file type (image, video, archive, document, PDF, etc.) | Lines 437-454 |
| Filter by date (today, yesterday, 7d, 30d, custom range) | Lines 456-476 |
| Sort by name, date, size (ascending/descending) | Lines 478-485 |
| Pagination (10/25/50 per page) | Lines 490-498 |
| Bulk select & delete | Lines 516-541 |
| Upload modal (admin on behalf of user) | Lines 1084-1243 |

### Data Displayed Per File

| Column | Data Source | Notes |
|--------|------------|-------|
| User Email | `file.user?.email` | Populated from user ref |
| User Name | `file.user?.name` | Falls back to email prefix |
| File Name | `file.originalName` | With file type icon |
| File Type | `getFileMeta()` | Badge with color (PDF, DOCX, PNG, etc.) |
| Upload Date | `file.createdAt` | Formatted with formatDateTime() |
| Status | `getFileStatus()` | Uploaded/Processing/Failed |
| Actions | View, Download, Open in Drive, Delete | Per-row buttons |

### The "Show Data" Toggle

In the **Storage Management** tab, each drive has a **Show Data** toggle:

```jsx
<button onClick={() => dispatch(setDriveDataView(String(drive._id)))}>
    {/* Toggle between selectedDiveIds.includes(drive._id) */}
</button>
```

When toggled ON, the drive's ID is added to `selectedDriveIds` in Redux state. The Upload Management tab uses these IDs to filter files:

```javascript
// UploadManagementTab.jsx — Line 375
const effectiveDriveIds = selectedDriveIds.length === 0 ? ['none'] : selectedDriveIds;
```

When `effectiveDriveIds` is `['none']`, the API returns an empty array — no files shown. This allows admins to selectively view files from specific drives.

---

## Storage Management Panel

The **GoogleDriveIntegrationTab** component provides full CRUD for drive configurations.

### Adding a Drive

The "Add Drive" form collects:

| Field | Required | Source |
|-------|----------|--------|
| Drive Name | Yes | User input |
| Google Account Email | No | Auto-detected from token |
| Client ID | No | Falls back to .env defaults |
| Client Secret | No | Falls back to .env defaults; stored encrypted |
| Refresh Token | Yes | From OAuth flow; stored encrypted |
| Folder ID | No | Root if empty |

### OAuth Token Generation Flow

The built-in OAuth generator walks through 3 steps:

1. **Enter Credentials**: User provides Client ID/Secret (or uses .env defaults)
2. **Authorize**: Backend generates OAuth URL → user opens in browser → grants access → copies redirect URL
3. **Exchange**: Backend exchanges the authorization code for a refresh token

Backend endpoints used:

| Endpoint | File | Lines |
|----------|------|-------|
| `POST /api/drive/oauth-url` | `routes/drive.routes.js` | 125-138 |
| `POST /api/drive/exchange-code` | `routes/drive.routes.js` | 141-173 |

### Drive Pool Management

Each drive can be:

- **In Pool** (`isActive: true`): Available for auto-selection and failover
- **Not in Pool** (`isActive: false`): Stored but not used for uploads
- **Primary** (`activeDriveId`): The current upload target (shown in red)

The pool management endpoints:

| Endpoint | File | Lines |
|----------|------|-------|
| `PUT /api/drive/toggle-pool/:id` | `routes/drive.routes.js` | 203-221 |
| `PUT /api/drive/primary/:id` | `routes/drive.routes.js` | 224-233 |
| `PUT /api/drive/upload-target/:id` | `routes/drive.routes.js` | 236-265 |

### Auto-Switch Toggle

When auto-switch is enabled (no specific upload target), the system automatically switches drives at 90% capacity. When a specific drive is set as upload target, auto-switch is disabled.

### Storage Sync

Drives can be synced individually or all pool drives at once:

```javascript
// Sync a single drive — updates storage stats
POST /api/drive/sync

// Sync all pool drives
POST /api/drive/sync-all
```

The sync fetches real-time storage quota from Google Drive API and updates the MongoDB drive document.

---

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
config/crypto.js
middlewares/auth.js
middlewares/requireAdmin.js
models/files.model.js
models/drive.model.js
models/settings.model.js
models/user.model.js
routes/file.routes.js
routes/drive.routes.js
services/driveManager.service.js
services/activity.service.js
scripts/google-owner-token.js
```

Then install the required backend packages:

```bash
npm install express mongoose multer googleapis cookie-parser cors dotenv jsonwebtoken bcrypt express-validator
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

By default, files are stored by category. If you want every user's files in separate folders, update `services/driveManager.service.js`.

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