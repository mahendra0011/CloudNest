# CloudNest

Full-stack upload system for images, videos, zip files, documents, and general files. Users can register, login with Google, upload files, view their own uploads, download files, and delete files.

**Important flow:** Users do **not** connect their own Google Drive. Every uploaded file is saved into the owner Google Drive account configured on the backend with `GOOGLE_DRIVE_REFRESH_TOKEN`.

## Live Demo

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`
- Health Check: `http://localhost:3000/api/health`

## Quick Start

```bash
# 1. Install dependencies
npm install && npm install --prefix client

# 2. Setup environment
copy .env.example .env
copy client\.env.example client\.env

# 3. Generate owner Drive token
npm run google:owner-token

# 4. Start MongoDB
mongod

# 5. Start development servers
npm run dev
```

## Project Structure

```
cloudnest/
├── app.js                    # Main Express server
├── config/
│   ├── db.js                 # MongoDB connection
│   ├── multer.config.js      # File upload middleware
│   ├── socket.js             # Socket.io configuration
│   ├── googleDrive.js        # Google Drive OAuth client
│   └── crypto.js             # Token encryption
├── models/
│   ├── user.model.js         # User schema (role-based: user/admin)
│   ├── files.model.js        # Uploaded file metadata
│   ├── drive.model.js        # Google Drive configuration
│   ├── settings.model.js     # User settings
│   └── activity.model.js     # Activity logs
├── routes/
│   ├── user.routes.js        # Auth endpoints (register, login, google)
│   ├── file.routes.js        # File CRUD endpoints
│   ├── drive.routes.js       # Drive management endpoints
│   ├── settings.routes.js    # Settings endpoints
│   └── activity.routes.js    # Activity logs endpoints
├── services/
│   ├── googleDrive.service.js
│   ├── driveManager.service.js
│   ├── activity.service.js
│   └── email.service.js
├── scripts/
│   └── google-owner-token.js   # One-time refresh token generator
└── client/                   # React frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── features/         # Redux slices
    │   └── lib/
    └── index.html
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Redux Toolkit, Vite, Tailwind CSS, Material UI, lucide-react |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JWT cookies, email/password, Google OAuth 2.0 |
| Storage | Google Drive API (owner refresh token) |
| Real-time | Socket.io |

## Features

### Authentication
- User registration with email/password
- Google OAuth login
- JWT cookie-based authentication
- Role-based access (user/admin)

### File Management
- Drag-and-drop upload UI
- Upload progress indicator
- Auto category detection: image, video, archive, document, other
- File organization in Drive folders by category
- Download streaming through backend
- Delete from Drive and database

### Admin Dashboard (5 Tabs)
1. **Overview** - Stats and recent activity
2. **Upload Management** - File list, upload, delete
3. **Storage Management** - Add/configure multiple Google Drives, failover
4. **Settings** - User preferences, notification controls
5. **Activity Logs** - All upload/download/delete events

### Storage Features
- Multiple Google Drive support
- Automatic failover when drive exceeds 90% capacity
- Storage quota tracking
- Per-drive configuration

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Email/password login |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files` | List all files (admin only) |
| POST | `/api/files/upload` | Upload file (admin assigns user) |
| POST | `/api/files/user-upload` | Upload file (self-assigned) |
| POST | `/api/files/admin-upload` | Upload on behalf of user |
| GET | `/api/files/:id/download` | Download file |
| DELETE | `/api/files/:id` | Delete file |

### Drives
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drive/drives` | List all drives |
| POST | `/api/drive/drives` | Add new drive |
| PUT | `/api/drive/drives/:id` | Update drive |
| DELETE | `/api/drive/drives/:id` | Delete drive |
| POST | `/api/drive/sync/:id` | Sync drive storage stats |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Backend port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |
| `CLIENT_URL` | Yes | Frontend URL |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret (generate random) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GOOGLE_LOGIN_REDIRECT_URI` | Yes | OAuth callback URL |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | Yes | Owner Drive refresh token |
| `GOOGLE_OWNER_DRIVE_SCOPE` | No | Drive scope (default: drive.file) |
| `OWNER_TOKEN_PORT` | No | Token helper port (default: 4000) |
| `GOOGLE_DRIVE_FOLDER_ID` | No | Optional upload folder ID |
| `MAX_UPLOAD_MB` | No | Max upload size in MB (default: 250) |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Admin login password |

## How Data Flow Works

```
User → Login (JWT) → Dashboard → Upload File
                        ↓
                   Express + Multer
                        ↓
              Google Drive API (Owner Account)
                        ↓
                    MongoDB Metadata
```

1. User registers or logs in with Google
2. User uploads a file from the dashboard
3. Express receives the file with `multer`
4. Backend uploads that file to the owner Google Drive account (or configured active drive)
5. MongoDB saves metadata with the logged-in user ID and Google Drive file ID
6. User sees only files where `file.user === loggedInUser._id`
7. Download streams the owner Drive file through the backend

## Security

**Critical:** Never expose these values publicly:
- `.env` file (gitignored)
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REFRESH_TOKEN`
- Real MongoDB credentials
- `JWT_SECRET`

If any credentials are leaked, rotate them immediately in Google Cloud Console.

## Environment Configuration

### Server `.env`

```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/cloudnest
JWT_SECRET=your-48-byte-random-hex-string

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_LOGIN_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Owner Drive Storage
GOOGLE_DRIVE_REFRESH_TOKEN=owner-google-drive-refresh-token
GOOGLE_OWNER_DRIVE_SCOPE=https://www.googleapis.com/auth/drive.file
OWNER_TOKEN_PORT=4000

# Optional
GOOGLE_DRIVE_FOLDER_ID=specific-folder-id-for-uploads
MAX_UPLOAD_MB=250

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-admin-password
```

### Client `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

### Getting Environment Values

**JWT_SECRET** - Generate random:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select a project
3. Enable Google Drive API
4. Configure OAuth consent screen
5. Create OAuth client ID (Web application type)
6. Add redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (login)
   - `http://localhost:4000/oauth2callback` (owner token)

**GOOGLE_DRIVE_REFRESH_TOKEN:**
```bash
npm run google:owner-token
```
Open the printed URL in browser, login with owner account, and copy the generated token.

### MongoDB Options

Local MongoDB:
```env
MONGO_URI=mongodb://127.0.0.1:27017/cloudnest
```

MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/cloudnest
```

## Step By Step Local Setup

### 1. Install Dependencies
```bash
npm install
npm install --prefix client
```

### 2. Create Environment Files
```bash
copy .env.example .env
copy client\.env.example client\.env
```

### 3. Configure Google Cloud
- Create OAuth Web Client
- Enable Google Drive API
- Add redirect URIs

### 4. Generate Owner Drive Token
```bash
npm run google:owner-token
```
Copy the printed `GOOGLE_DRIVE_REFRESH_TOKEN` into `.env`.

### 5. Start MongoDB
```bash
mongod
# Or use MongoDB Atlas and update MONGO_URI
```

### 6. Run Development Servers
```bash
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health: http://localhost:3000/api/health

## App Use Flow

1. Open frontend at http://localhost:5173
2. Register a new account or click **Login with Google**
3. Dashboard opens (admin access required)
4. Upload image/video/zip/document/file via drag-and-drop
5. File saves in owner Google Drive (or configured active drive)
6. Metadata saves in MongoDB
7. User can download/delete files from dashboard

## Documentation

- [API Reference](docs/API.md) - Request/response examples
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Architecture notes, production deployment guide

*Note: Documentation files will be created in the `docs/` directory.*

## Troubleshooting

### Google Login Redirect URI Mismatch
Ensure `.env` and Google Cloud redirect URIs match exactly:
```env
GOOGLE_LOGIN_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### Owner Token Not Generated
1. Remove app from Google Account > Security > Third-party apps
2. Re-run `npm run google:owner-token`

### Upload Fails - Drive Not Configured
Check `.env` values are real (not placeholders):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REFRESH_TOKEN`

### MongoDB Connection Failed
- Ensure MongoDB is running (`mongod`)
- Verify `MONGO_URI` is correct
- Check Atlas IP allowlist and credentials

### API Key Confusion
Google API key is not enough. This app uses OAuth 2.0 with:
- Client ID
- Client Secret
- Refresh Token

## Production Checklist

- [ ] Use HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Update `CLIENT_URL` to production frontend domain
- [ ] Update `GOOGLE_LOGIN_REDIRECT_URI` to production callback
- [ ] Add production callback URL in Google Cloud OAuth client
- [ ] Generate strong `JWT_SECRET`
- [ ] Use MongoDB Atlas or managed MongoDB
- [ ] Keep `.env` outside git (already gitignored)
- [ ] Rotate any leaked Google credentials
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Configure `GOOGLE_DRIVE_FOLDER_ID` for organized storage

## License

MIT License - Feel free to fork and customize for your projects.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

---

**CloudNest** - Cheap Google Drive storage for your file upload needs.
