# CloudNest

> **Full-stack file upload system** — Users register, login with Google, upload files, and every file is stored in the **owner's Google Drive**. Built with React, Express, MongoDB, and Google Drive API.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Why Google Drive Instead of Cloudinary?](#why-google-drive-instead-of-cloudinary)
- [Best Project Types For This App](#best-project-types-for-this-app)
- [Features](#features)
- [Limitations](#limitations)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How Data Flow Works](#how-data-flow-works)
- [Important Security Note](#important-security-note)
- [Required Redirect URIs](#required-redirect-uris)
- [Environment Configuration](#environment-configuration)
  - [Server `.env`](#server-env)
  - [Client `.env`](#client-env)
- [Getting Environment Values](#getting-environment-values)
  - [JWT Secret](#jwt-secret)
  - [Google OAuth Credentials](#google-oauth-credentials)
  - [Owner Drive Refresh Token](#owner-drive-refresh-token)
- [API Endpoints](#api-endpoints)
  - [Auth](#auth)
  - [Files](#files)
  - [Drives](#drives)
  - [Settings](#settings)
  - [Activity Logs](#activity-logs)
  - [System](#system)
- [Step By Step Local Setup](#step-by-step-local-setup)
- [App Use Flow](#app-use-flow)
- [Admin Dashboard](#admin-dashboard)
- [Troubleshooting](#troubleshooting)
- [Production Checklist](#production-checklist)
- [API Key Confusion](#api-key-confusion)
- [License](#license)
- [Contributing](#contributing)

---

## Overview

**CloudNest** is a full-stack file upload system where:

- Users can **register**, **login with Google**, or use **email/password**
- Admin dashboard with **5 tabs**: Overview, Upload Management, Storage Management, Settings, Activity Logs
- Every uploaded file is stored in the **owner's Google Drive** account (configured with a refresh token)
- Users **do not** connect their own Google Drive — the owner drive is shared storage
- Files are automatically categorized: image, video, archive, document, code, and more
- Multiple Google Drives support with automatic failover when storage exceeds 90%
- Real-time activity tracking via Socket.IO
- Demo dashboard with mock data for preview without authentication

### Why Google Drive Instead of Cloudinary?

Google Drive is the right choice for this project because it focuses on **private, cheap file storage**. Cloudinary is a different tool built for public media delivery at scale.

| Feature | Google Drive (CloudNest) | Cloudinary |
|---------|------------------------|------------|
| **Primary use** | Private file storage backend | Public CDN with transformations |
| **Storage cost** | Included with Google account (15GB free, paid plans cheap) | Pay-per-use (bandwidth + storage) |
| **Image transformations** | ❌ Not supported | ✅ Resize, crop, filter, format conversion |
| **Video transcoding** | ❌ Not supported | ✅ Adaptive streaming, transcoding |
| **CDN delivery** | ❌ No built-in CDN | ✅ Global CDN |
| **Digital Asset Management** | ❌ Basic folder structure | ✅ DAM with tags, search, moderation |
| **API complexity** | ✅ Simple OAuth + file upload | Complex SDK with many features |
| **Best for** | Private user uploads, documents, internal tools | Public galleries, e-commerce images, video streaming |

**Bottom line:** Use CloudNest when you need cheap private file storage. Use Cloudinary when you need public, high-traffic, optimized image/video delivery.

---

## Best Project Types For This App

- ✅ **College / student full-stack projects** — Easy to deploy, free with Google Drive
- ✅ **Startup MVPs** — Private file upload without paying for S3/Cloudinary
- ✅ **Internal admin dashboards** — Document/report uploads for team use
- ✅ **CRM/ERP file attachments** — Invoices, contracts, receipts
- ✅ **Resume / certificate / document upload systems** — Secure private storage
- ✅ **Portfolio apps** — Owner wants all media in one Drive
- ✅ **Small SaaS apps** — Users upload images, videos, or zip files
- ✅ **Client portals** — Private downloads for clients
- ✅ **College assignment submission systems** — Students upload PDFs, code files
- ✅ **Invoice/receipt management** — Organized folder structure in Drive

---

## Features

### 🔐 Authentication
- User registration with email/password
- Google OAuth login (one-click)
- JWT cookie-based authentication (secure, HTTP-only)
- Role-based access control: `user` and `admin`
- Admin auto-promotion by email match from `.env`
- Login/Register pages with validation

### 📁 File Management
- **Drag-and-drop** upload UI with file preview
- **Upload progress** indicator (percentage bar)
- **Auto category detection** based on MIME type:
  - `image` — PNG, JPG, GIF, SVG, WebP, ICO
  - `video` — MP4, WebM, AVI, MKV, MOV
  - `archive` — ZIP, RAR, 7z, TAR, GZ
  - `document` — PDF, DOC, DOCX, ODT, RTF
  - `spreadsheet` — XLS, XLSX, CSV, ODS
  - `presentation` — PPT, PPTX, ODP
  - `code` — JS, TS, PY, Java, C++, HTML, CSS, JSON, and more
  - `text` — TXT, LOG, MD
- **File type icons** — Color-coded gradient badges for each category
- **File preview** — View files directly in browser (images, PDFs)
- **Download** — Stream files through backend with original name
- **Delete** — Remove from Google Drive + MongoDB (with confirmation dialog)
- **Bulk delete** — Select multiple files and delete at once
- **Search** — Search by file name, user name, email, or MIME type
- **Filtering** — Filter by file type, date range (today, yesterday, 7d, 30d, custom)
- **Sorting** — Sort by date, name, size (ascending/descending)
- **Pagination** — Configurable per-page (10, 25, 50) with page navigation

### 🛠️ Admin Dashboard (5 Tabs)

| Tab | Features |
|-----|----------|
| **Overview** | Stats cards (total files, storage usage, recent uploads), activity timeline, storage progress bars |
| **Upload Management** | Full file table with search, filter, sort, pagination, bulk delete, upload modal with user assignment |
| **Storage Management** | Multiple Google Drive configuration, active/inactive toggle, auto-failover, storage quota tracking |
| **Settings** | Notification preferences, theme settings, profile management |
| **Activity Logs** | All upload/download/delete/sync events with search, date range filter, type filter, export |

### 💾 Storage Features
- **Multiple Google Drive support** — Add multiple owner drives
- **Automatic failover** — When a drive exceeds 90% capacity, switch to next available drive
- **Storage quota tracking** — Real-time usage vs limit display
- **Per-drive configuration** — Name, email, active status, sync control
- **Drive sync** — Manual sync to refresh storage stats
- **Last synced timestamp** — Track when each drive was last refreshed

### 🎨 UI/UX
- **Dark mode** — Toggle with persistence in localStorage
- **Responsive design** — Works on mobile, tablet, desktop
- **Mobile bottom navigation** — Quick access on small screens
- **Toast notifications** — Success/error/warning toasts
- **Loading skeletons** — Smooth loading states for tables and cards
- **Empty states** — Friendly messages when no data exists
- **Error boundary** — Graceful error handling with retry
- **Page transitions** — Smooth animations between routes
- **Tooltips** — Helpful hints on hover
- **Keyboard navigation** — Escape to close modals, tab through forms

### 🧪 Demo Dashboard
- Works **without authentication**
- Uses **mock data** for preview
- Same 5 tabs as admin dashboard
- Perfect for showcasing the app before login

### 📡 Real-time
- **Socket.IO** integration for live activity updates
- Real-time notification badge in navbar
- New upload events appear instantly

---

## Limitations

- ❌ **Not a CDN** — Google Drive is not designed for high-scale public media delivery
- ❌ **No built-in transformations** — Image resize, format conversion, compression, background removal, and video transcoding are NOT included
- ❌ **API quota limits** — Google Drive API has usage limits (varies by plan)
- ❌ **Owner storage limit** — All files use the owner Google Drive storage quota (15GB free, paid plans have limits)
- ❌ **Refresh token risk** — `GOOGLE_DRIVE_REFRESH_TOKEN` must stay secret because it controls owner Drive access
- ❌ **Large public video apps** — Not ideal for Netflix/YouTube-style streaming or adaptive bitrate playback
- ❌ **Enterprise DAM features** — No SSO user management, advanced approvals, asset workflows, or SLA
- ❌ **Folder permissions** — If using `GOOGLE_DRIVE_FOLDER_ID`, the owner token must have access to that folder
- ❌ **No public sharing URLs** — Files are private to the owner Drive

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Redux Toolkit (state management), Vite (build tool), Tailwind CSS (styling), Material UI (components), lucide-react (icons), Three.js (3D background), GSAP (animations), Framer Motion (page transitions) |
| **Backend** | Node.js, Express 5, MongoDB (database), Mongoose (ODM) |
| **Auth** | JWT (HTTP-only cookies), bcrypt (password hashing), Google OAuth 2.0, express-validator |
| **Storage** | Google Drive API v3 (owner refresh token), multer (file upload) |
| **Real-time** | Socket.IO (WebSocket), @react-three/fiber, @react-three/drei (3D) |
| **Dev Tools** | Nodemon, concurrently, ESLint |

---

## Project Structure

```
cloudnest/
├── app.js                          # Main Express server entry point
├── package.json                    # Root dependencies & scripts
├── .env.example                    # Environment template
├── .gitignore
│
├── config/
│   ├── db.js                       # MongoDB connection with retry logic
│   ├── admin.js                    # Admin configuration
│   ├── crypto.js                   # Token encryption utilities
│   ├── googleDrive.js              # Google Drive OAuth client setup
│   ├── multer.config.js            # File upload middleware with size validation
│   ├── socket.js                   # Socket.IO configuration
│   ├── constants.js                # File size limits & MIME categories
│   └── rateLimit.js                # Rate limiting configuration
│
├── models/
│   ├── user.model.js               # User schema (name, email, role, password, googleId, preferences)
│   ├── files.model.js              # File metadata (originalName, mimeType, size, category, driveFileId, userId)
│   ├── drive.model.js              # Google Drive config (name, email, refreshToken, storage, isActive)
│   ├── settings.model.js           # User settings (theme, notifications, preferences)
│   └── activity.model.js           # Activity logs (action: upload/download/delete/sync, user, details)
│
├── routes/
│   ├── user.routes.js              # Auth endpoints (register, login, google, logout, me)
│   ├── file.routes.js              # File CRUD (list, upload, admin-upload, download, delete)
│   ├── drive.routes.js             # Drive management (list, add, update, delete, sync)
│   ├── settings.routes.js          # User settings endpoints
│   └── activity.routes.js          # Activity logs endpoints
│
├── services/
│   ├── googleDrive.service.js      # Google Drive API operations (upload, download, delete, list)
│   ├── driveManager.service.js     # Drive failover & management logic
│   ├── activity.service.js         # Activity logging service with caching
│   ├── email.service.js            # Email sending with retry logic
│   └── validation.service.js       # File validation (size, type, name sanitization)
│
├── middlewares/
│   ├── auth.js                     # JWT authentication middleware
│   └── requireAdmin.js             # Admin role verification middleware
│
├── scripts/
│   └── google-owner-token.js       # One-time refresh token generator (port 4000)
│
├── docs/
│   └── API.md                      # Full API reference documentation
│
└── client/                         # React frontend
    ├── index.html                  # Entry HTML
    ├── vite.config.js              # Vite configuration with proxy
    ├── tailwind.config.js          # Tailwind CSS theme config
    ├── postcss.config.js
    ├── package.json
    │
    └── src/
        ├── main.jsx                # React entry point
        ├── App.jsx                 # Routes & providers
        ├── index.css               # Global styles + Tailwind
        ├── store.js                # Redux store configuration
        │
        ├── components/
        │   ├── layout/
        │   │   ├── navbar.jsx      # Main navigation (links, search, theme toggle, user menu)
        │   │   ├── footer.jsx      # Footer with attribution
        │   │   ├── mobile-nav.jsx  # Mobile bottom navigation
        │   │   └── page-transition.jsx  # Framer motion page wrapper
        │   │
        │   ├── ui/
        │   │   ├── button.jsx      # Button with variants (primary, ghost, icon) + LoadingSpinner
        │   │   ├── card.jsx        # Card with hover effects
        │   │   ├── badge.jsx       # Badge with variants (success, danger, warning, info, outline)
        │   │   ├── input.jsx       # Input with error state
        │   │   ├── avatar.jsx      # Avatar with status indicator
        │   │   ├── dialog.jsx      # Dialog with scroll support
        │   │   ├── modal.jsx       # Modal with keyboard escape + overlay close
        │   │   ├── tabs.jsx        # Tabs with underline style
        │   │   ├── tooltip.jsx     # Tooltip (top, bottom, left, right)
        │   │   ├── dropdown-menu.jsx   # DropdownMenu + DropdownMenuItem
        │   │   ├── progress.jsx    # ProgressBar (multiple sizes & colors)
        │   │   ├── skeleton.jsx    # Skeleton, SkeletonCard, SkeletonTable
        │   │   ├── toast.jsx       # ToastProvider + useToast hook
        │   │   ├── error-boundary.jsx  # ErrorBoundary with retry
        │   │   ├── empty-state.jsx # EmptyState component
        │   │   ├── confirm-dialog.jsx  # ConfirmDialog for destructive actions
        │   │   ├── file-preview-card.jsx  # FilePreviewCard (compact & full)
        │   │   ├── storage-card.jsx# StorageCard with usage progress
        │   │   ├── pagination.jsx  # Pagination with page controls
        │   │   └── search-bar.jsx  # SearchBar with clear & focus effects
        │   │
        │   ├── MuiProvider.jsx     # Material UI theme provider
        │   ├── Splash.jsx          # Loading splash screen
        │   └── ThreeBackground.jsx # 3D animated background
        │
        ├── pages/
        │   ├── home/
        │   │   └── HomePage.jsx    # Landing page with hero, features, CTA
        │   │
        │   ├── auth/
        │   │   ├── LoginPage.jsx   # Login form with email/password + Google button
        │   │   └── RegisterPage.jsx # Registration form with validation
        │   │
        │   ├── Dashboard/
        │   │   ├── index.jsx       # Dashboard layout with tab bar
        │   │   ├── DashboardPage.jsx  # Main dashboard container
        │   │   ├── OverviewTab.jsx # Stats cards, recent uploads, activity timeline
        │   │   ├── UploadManagementtab.jsx  # File table, search, filter, upload modal
        │   │   ├── GoogleDriveIntegrationTab.jsx  # Drive config, storage management
        │   │   ├── SettingsTab.jsx # User preferences, notifications
        │   │   └── ActivityLogsTab.jsx  # Activity logs with filters & export
        │   │
        │   ├── demo-dashboard/
        │   │   ├── DemoOverviewTab.jsx
        │   │   ├── DemoUploadManagementtab.jsx
        │   │   ├── DemoGoogleDriveIntegrationTab.jsx
        │   │   ├── DemoSettingsTab.jsx
        │   │   └── DemoActivityLogsTab.jsx
        │   │
        │   ├── DemoDashboard.jsx   # Demo dashboard with mock data
        │   └── DocsPage.jsx        # API documentation page
        │
        ├── features/               # Redux slices
        │   ├── auth/
        │   │   └── authSlice.js    # Auth state (user, status, error, login/register/logout thunks)
        │   ├── files/
        │   │   └── filesSlice.js   # Files state (list, CRUD thunks)
        │   ├── activities/
        │   │   └── activitiesSlice.js  # Activities state (fetch thunk)
        │   ├── drives/
        │   │   └── drivesSlice.js  # Drives state (CRUD thunks with caching)
        │   └── settings/
        │       └── settingsSlice.js # Settings state (update thunk)
        │
        └── lib/
            ├── api.js              # Axios API client with interceptors
            ├── utils.js            # Utilities (cn, formatFileSize, formatDate, getFileCategoryColor)
            ├── file-icons.js       # File icon mapping by MIME type
            └── socket.js           # Socket.IO client setup
```

---

## How Data Flow Works

```
User → Browser → Login (JWT) → Dashboard → Upload File
                                              ↓
                                         Express Server
                                              ↓
                                     Multer (file receive)
                                              ↓
                              Validation (size, type, name)
                                              ↓
                              Google Drive API (Upload to Owner Drive)
                                              ↓
                                     MongoDB (Save metadata)
                                              ↓
                             User sees file in dashboard
                                              ↓
                           Download → Stream from Drive via Backend
                           Delete   → Remove from Drive + MongoDB
```

### Detailed Flow:

1. **User registers** or logs in with Google/email-password
2. **JWT token** is set as HTTP-only cookie
3. User navigates to **admin dashboard** (requires admin role)
4. User clicks **Upload** → drag-and-drop or file picker
5. Backend receives file via **Multer** middleware
6. **Validation service** checks file size, type, and sanitizes name
7. Backend uploads file to **owner Google Drive** (or configured active drive with failover)
8. **MongoDB** saves file metadata: original name, size, MIME type, category, user ID, drive file ID
9. **Activity log** is created with action type `upload`
10. User sees file in the **Upload Management** table
11. Download: Backend streams file from Google Drive through Express
12. Delete: Removes from Google Drive + MongoDB + logs activity

---

## Important Security Note

> ⚠️ **CRITICAL: Never expose these values publicly**

- `.env` file — Already gitignored, but verify it never gets committed
- `GOOGLE_CLIENT_SECRET` — This is the password for your Google OAuth app
- `GOOGLE_DRIVE_REFRESH_TOKEN` — This gives full access to the owner's Google Drive
- `JWT_SECRET` — If leaked, anyone can forge authentication tokens
- `MONGO_URI` — Contains database credentials
- `ADMIN_PASSWORD` — Admin account password

### If any credential is leaked:
1. **Google credentials**: Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Rotate/delete compromised OAuth client
2. **JWT_SECRET**: Change in `.env`, all existing sessions will be invalidated
3. **Drive refresh token**: Remove app access at [Google Account Security](https://myaccount.google.com/security) → Third-party apps → Revoke access → Generate new token

### Additional Security Measures:
- ❗ The `GOOGLE_DRIVE_REFRESH_TOKEN` uses `drive.file` scope by default — this limits the app to only files it creates
- ❗ If using `GOOGLE_DRIVE_FOLDER_ID`, ensure the owner token has access to that specific folder
- ❗ Admin endpoints are protected by `requireAdmin` middleware
- ❗ JWT cookies are HTTP-only (not accessible via JavaScript)
- ❗ Rate limiting is applied to auth and upload endpoints
- ❗ File validation checks for malicious characters in filenames

---

## Required Redirect URIs

For the app to work correctly, these exact URLs must be registered in your Google Cloud OAuth client:

### 1. Google Login Redirect (User Authentication)

```
http://localhost:3000/api/auth/google/callback
```

For production:
```
https://your-api-domain.com/api/auth/google/callback
```

### 2. Owner Token Redirect (One-time setup)

```
http://localhost:4000/oauth2callback
```

### How to configure in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Web Client
5. Under **Authorized redirect URIs**, add both URLs (with appropriate production URLs)
6. Click **Save**

---

## Environment Configuration

### Server `.env`

```env
# ─── Server ───────────────────────────────────────
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# ─── MongoDB ──────────────────────────────────────
MONGO_URI=mongodb://127.0.0.1:27017/cloudnest

# ─── JWT ──────────────────────────────────────────
JWT_SECRET=your-48-byte-random-hex-string

# ─── Google OAuth (User Login) ─────────────────────
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_LOGIN_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# ─── Owner Drive Storage ───────────────────────────
GOOGLE_DRIVE_REFRESH_TOKEN=owner-google-drive-refresh-token
GOOGLE_OWNER_DRIVE_SCOPE=https://www.googleapis.com/auth/drive.file
OWNER_TOKEN_PORT=4000

# ─── Optional ──────────────────────────────────────
GOOGLE_DRIVE_FOLDER_ID=optional-specific-folder-id
MAX_UPLOAD_MB=250

# ─── Admin Credentials ─────────────────────────────
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-admin-password
```

### Client `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Getting Environment Values

### JWT Secret

Generate a cryptographically random 48-byte hex string:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Example output: `a7b3c9d1e2f4...` (96 hex characters)

### Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **Create a new project** or select existing
3. Navigate to **APIs & Services** → **Library**
4. Search for and **enable** these APIs:
   - Google Drive API
   - Google People API (for profile info on login)
5. Go to **APIs & Services** → **OAuth consent screen**
   - Choose **External** (or Internal if using Google Workspace)
   - Fill app name, user support email, developer contact
   - Add scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `.../auth/drive.file`
   - Add test users (your email)
6. Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `CloudNest (or any name)`
   - **Authorized JavaScript origins:**
     - `http://localhost:5173`
     - (Add production frontend URL)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/google/callback`
     - `http://localhost:4000/oauth2callback`
   - Click **Create**
7. Copy **Client ID** → `GOOGLE_CLIENT_ID`
8. Copy **Client secret** → `GOOGLE_CLIENT_SECRET`

### Owner Drive Refresh Token

This token decides **which Google Drive account stores all uploaded files**.

1. Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
2. Verify this redirect URI exists in Google Cloud OAuth client:
   ```
   http://localhost:4000/oauth2callback
   ```
3. Run the token generator:
   ```bash
   npm run google:owner-token
   ```
4. Terminal will print a Google approval URL — **open it in browser**
5. Login with **your owner Google account** (this is the account that will store all files)
6. **Important:** This must be the account you want to use as storage, not a regular user account
7. Approve the Drive permission
8. Browser will show **success message**
9. Terminal will print:
   ```env
   GOOGLE_DRIVE_REFRESH_TOKEN=...
   ```
10. Copy the full line into your `.env` file
11. Restart the backend server

### `GOOGLE_DRIVE_FOLDER_ID` (Optional)

To upload files into a specific Google Drive folder instead of root:

1. Open [Google Drive](https://drive.google.com)
2. Navigate to the target folder
3. The URL will look like:
   ```
   https://drive.google.com/drive/folders/1AbCFolderIdHere
   ```
4. Copy only the folder ID: `1AbCFolderIdHere`
5. Set in `.env`:
   ```env
   GOOGLE_DRIVE_FOLDER_ID=1AbCFolderIdHere
   ```

### MongoDB Options

**Local MongoDB:**
```env
MONGO_URI=mongodb://127.0.0.1:27017/cloudnest
```

**MongoDB Atlas (Free tier):**
```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/cloudnest?retryWrites=true&w=majority
```

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register with name, email, password |
| `POST` | `/api/auth/login` | ❌ | Login with email, password |
| `GET` | `/api/auth/google` | ❌ | Initiate Google OAuth flow |
| `GET` | `/api/auth/google/callback` | ❌ | Google OAuth callback handler |
| `POST` | `/api/auth/logout` | ✅ | Clear auth cookie |
| `GET` | `/api/auth/me` | ✅ | Get current logged-in user |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Files

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/api/files` | ✅ | Admin | List all files (with pagination, search, filters) |
| `POST` | `/api/files/upload` | ✅ | User | Upload file (self-assigned) |
| `POST` | `/api/files/admin-upload` | ✅ | Admin | Upload file on behalf of user |
| `GET` | `/api/files/:id/download` | ✅ | Admin | Download file by ID |
| `DELETE` | `/api/files/:id` | ✅ | Admin | Delete file from Drive + DB |
| `POST` | `/api/files/bulk-delete` | ✅ | Admin | Delete multiple files at once |

**Upload Request (multipart/form-data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ | The file to upload |
| `userName` | String | ❌ | Assign upload to this user name |
| `userEmail` | String | ❌ | Assign upload to this user email |
| `driveId` | String | ❌ | Specific drive ID (auto-selects if empty) |

### Drives

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/drive/drives` | ✅ | List all configured drives |
| `POST` | `/api/drive/drives` | ✅ | Add a new Google Drive |
| `PUT` | `/api/drive/drives/:id` | ✅ | Update drive config |
| `DELETE` | `/api/drive/drives/:id` | ✅ | Remove drive config |
| `POST` | `/api/drive/sync/:id` | ✅ | Sync storage stats for drive |
| `GET` | `/api/drive/stats` | ✅ | Get storage analytics across all drives |

### Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/settings` | ✅ | Get current user settings |
| `PUT` | `/api/settings` | ✅ | Update user settings |
| `POST` | `/api/settings/validate` | ✅ | Validate settings values |

### Activity Logs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/activity` | ✅ | List activity logs (paginated) |
| `GET` | `/api/activity/stats` | ✅ | Get activity statistics |
| `GET` | `/api/activity/export` | ✅ | Export activities as CSV |

### System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | ❌ | Health check (status, uptime, memory, version) |

**Health Check Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-21T12:00:00.000Z",
  "uptime": 12345.67,
  "memory": {
    "rss": 123456789,
    "heapTotal": 98765432,
    "heapUsed": 65432100,
    "external": 1234567
  },
  "version": "1.0.0"
}
```

---

## Step By Step Local Setup

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local install or [Atlas](https://www.mongodb.com/atlas) free tier)
- **Google Cloud account** (free tier works)
- **Google Drive account** (the one that will store files)

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/mahendra0011/CloudNest.git
cd cloudnest

# Install backend dependencies
npm install

# Install frontend dependencies
npm install --prefix client
```

### 2. Create Environment Files

```bash
# Server environment
copy .env.example .env
# Edit .env with your values (see Environment Configuration section)

# Client environment
copy client\.env.example client\.env
```

### 3. Configure Google Cloud

1. Create OAuth consent screen (External)
2. Enable Google Drive API
3. Create OAuth Web Client credentials
4. Add redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
   - `http://localhost:4000/oauth2callback`
5. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`

### 4. Generate Owner Drive Token

```bash
npm run google:owner-token
```

1. Open printed URL in browser
2. Login with **owner** Google account
3. Approve permissions
4. Copy `GOOGLE_DRIVE_REFRESH_TOKEN` into `.env`

### 5. Start MongoDB

**Local:**
```bash
mongod
```

**Or use MongoDB Atlas:**
- Update `MONGO_URI` in `.env` with your Atlas connection string

### 6. Start Development Servers

```bash
# Start both backend + frontend
npm run dev
```

This runs:
- Backend on http://localhost:3000
- Frontend on http://localhost:5173
- Health check at http://localhost:3000/api/health

---

## App Use Flow

1. **Open** http://localhost:5173 in browser
2. **Register** a new account with name, email, password
3. **Or click** "Login with Google" for one-click auth
4. If first user with admin email from `.env`, you're auto-promoted to **admin**
5. **Dashboard** loads with 5 tabs
6. Go to **Upload Management** tab
7. Click **Upload File** button
8. Select a file (image, video, PDF, zip, etc.)
9. Optionally enter user name/email to assign the upload
10. Click **Upload** — progress bar shows upload status
11. File appears in the table with category badge, size, date
12. **Download** — click download icon to stream file
13. **Delete** — click trash icon, confirm in dialog
14. Check **Activity Logs** tab to see all events
15. Configure **Storage Management** to add more Drives

### Demo Dashboard (No Login Required)

1. Click **Demo Dashboard** in navbar
2. View all 5 tabs with **mock data**
3. No authentication needed
4. Perfect for previewing the UI

---

## Admin Dashboard

### 1. Overview Tab
- **Stats cards**: Total files, total storage used, recent uploads count, active drives
- **Storage progress bars**: Visual usage for each drive
- **Recent activity timeline**: Latest upload/download/delete events
- **Quick actions**: Upload button, refresh stats

### 2. Upload Management Tab
- **Full file table** with columns: Checkbox, User Email, User Name, File Name + Icon, File Type Badge, Upload Date, Status, Actions
- **Search**: Filter by file name, user name, email, MIME type
- **Type filter**: Images, Videos, Archives, Documents, Spreadsheets, Presentations, PDFs, Text, Code
- **Date filter**: Today, Yesterday, Last 7 Days, Last 30 Days, Custom Range
- **Sort**: Newest/Oldest first, Name A-Z/Z-A, Largest/Smallest first
- **Pagination**: 10/25/50 per page with page navigation
- **Bulk select**: Checkbox per row + select all + bulk delete
- **Upload modal**: File picker, user assignment, drive selection, progress bar
- **Actions per file**: View, Download, Open in Drive, Delete

### 3. Storage Management Tab
- **Drive cards**: Each configured drive with name, email, status badge
- **Storage progress**: Visual bar with usage/total numbers
- **Add drive**: Form to add new Google Drive config
- **Edit drive**: Update name, active status
- **Delete drive**: Remove drive config
- **Sync**: Refresh storage stats for each drive
- **Auto-failover**: When drive > 90% usage, next active drive is used

### 4. Settings Tab
- **Theme**: Toggle dark/light mode
- **Notifications**: Enable/disable notification types
- **Profile**: View account info

### 5. Activity Logs Tab
- **Logs table**: Action, User, Details, Date
- **Search**: Filter by action, user, details
- **Type filter**: Upload, Download, Delete, Sync
- **Date filter**: Today, Yesterday, Last 7 Days, Custom Range
- **Export**: Download logs as CSV

---

## Troubleshooting

### Google Login Redirect URI Mismatch

```
Error: redirect_uri_mismatch
```

**Fix:** Ensure `.env` and Google Cloud redirect URIs match exactly:

```env
GOOGLE_LOGIN_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

Also verify this exact URL is in **Google Cloud Console** → APIs & Services → Credentials → OAuth client → Authorized redirect URIs.

### Owner Token Not Generated

**Symptoms:** `npm run google:owner-token` fails or doesn't print token

**Fix:**
1. Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are real values (not placeholders)
2. Verify redirect URI `http://localhost:4000/oauth2callback` exists in Google Cloud
3. Remove app access: [Google Account Security](https://myaccount.google.com/security) → Third-party apps → Revoke access
4. Re-run: `npm run google:owner-token`
5. Try a different browser or incognito mode

### Upload Fails — Drive Not Configured

**Symptoms:** Upload returns 500 or "Drive not configured"

**Fix:** Check these values in `.env` are real (not `your-...` placeholders):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REFRESH_TOKEN`

**Verify by running:**
```bash
node -e "require('./services/googleDrive.service').listFiles().catch(console.error)"
```

### MongoDB Connection Failed

**Symptoms:** Server starts but requests hang, or `MongooseServerSelectionError`

**Local Fix:**
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Start MongoDB
mongod
```

**Atlas Fix:**
1. Check IP allowlist in Atlas Network Access
2. Verify username/password in `MONGO_URI`
3. Ensure `retryWrites=true` in connection string

### Upload Fails — File Too Large

**Symptoms:** 413 error or multer error

**Fix:** Increase `MAX_UPLOAD_MB` in `.env`:
```env
MAX_UPLOAD_MB=500
```

Also check `client/vite.config.js` proxy settings if frontend blocks large uploads.

### Socket.IO Not Connecting

**Symptoms:** Real-time updates not working, notification badge not updating

**Fix:**
1. Check that both servers are running
2. Verify no firewall blocking WebSocket (port 3000)
3. Check browser console for CORS errors
4. Restart backend server

### Files Not Showing in Dashboard

**Symptoms:** Upload succeeds but table is empty

**Fix:**
1. Check **Storage Management** tab — are drives configured and active?
2. Ensure "Show Data" toggle is enabled for at least one drive
3. Click **Refresh** button in Upload Management
4. Check MongoDB: `mongosh` → `use cloudnest` → `db.files.find()`

---

## Production Checklist

- [ ] **Use HTTPS** — Critical for production. Use Let's Encrypt via Nginx/Caddy
- [ ] **Set `NODE_ENV=production`** — Disables debug logging, enables optimizations
- [ ] **Update `CLIENT_URL`** to production frontend domain
- [ ] **Update `GOOGLE_LOGIN_REDIRECT_URI`** to production callback URL
- [ ] **Add production callback URL** in Google Cloud OAuth client redirect URIs
- [ ] **Generate strong `JWT_SECRET`** — 48+ random bytes
- [ ] **Use MongoDB Atlas** or managed MongoDB (enable backups)
- [ ] **Set strong `ADMIN_PASSWORD`** — 16+ characters with special chars
- [ ] **Configure `GOOGLE_DRIVE_FOLDER_ID`** for organized storage
- [ ] **Verify `.env` is gitignored** — Run `git check-ignore .env`
- [ ] **Rotate any leaked Google credentials** immediately
- [ ] **Enable rate limiting** for auth and upload endpoints
- [ ] **Set up monitoring** — Use PM2 or Docker for process management
- [ ] **Configure CORS** — Restrict to your frontend domain only
- [ ] **Add CDN** for static assets (optional, for better performance)
- [ ] **Enable compression** — Gzip/Brotli for API responses (already in Express)
- [ ] **Regular backups** — Backup MongoDB database daily

---

## API Key Confusion

> ⚠️ **Google API key is NOT enough for this app**

This project requires **OAuth 2.0 credentials**, not a simple API key.

| Credential | What it's for | Where to get it |
|------------|---------------|-----------------|
| `GOOGLE_CLIENT_ID` | Identifies your app to Google | Google Cloud → Credentials → OAuth client |
| `GOOGLE_CLIENT_SECRET` | Authenticates your app to Google | Google Cloud → Credentials → OAuth client |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | Permanent token to access owner Drive | Generated via `npm run google:owner-token` |

A **Google API Key** alone cannot:
- Access user data (requires OAuth consent)
- Upload files to a specific user's Drive
- Get a refresh token for persistent access

---

## License

**MIT License** — Feel free to fork, modify, and use for your own projects.

---

## Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

We use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring
- `perf:` Performance improvement
- `style:` UI/style changes
- `docs:` Documentation
- `chore:` Maintenance

---

<p align="center">Made with ❤️ by Mahendra</p>