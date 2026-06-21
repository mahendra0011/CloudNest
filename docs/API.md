# API Reference

## Authentication

### POST /api/auth/register

Register a new user account.

**Request:**
```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "_id": "654abc...",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### POST /api/auth/login

Login with email and password.

**Request:**
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "_id": "654abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### GET /api/auth/google

Initiate Google OAuth login flow.

**Response:** Redirects to Google consent page.

---

### GET /api/auth/google/callback

OAuth callback endpoint.

**Response:** Redirects to frontend on success.

---

### POST /api/auth/logout

Logout current user.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/me

Get current authenticated user.

**Response:**
```json
{
  "user": {
    "_id": "654abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## Files

### GET /api/files

List all uploaded files (admin only). Supports filtering by drive.

**Query Parameters:**
- `driveId` - Comma-separated drive IDs to filter by

**Response:**
```json
{
  "files": [
    {
      "id": "654abc...",
      "driveFileId": "1a2b3c...",
      "driveId": "654abc...",
      "originalName": "document.pdf",
      "mimeType": "application/pdf",
      "size": 123456,
      "category": "document",
      "webViewLink": "https://drive.google.com/file/...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "654abc...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

---

### POST /api/files/user-upload

Upload a file (self-assigned to logged-in user).

**Request:**
```
POST /api/files/user-upload
Content-Type: multipart/form-data

file: <file>
```

**Response:**
```json
{
  "file": {
    "id": "654abc...",
    "driveFileId": "1a2b3c...",
    "originalName": "image.png",
    "mimeType": "image/png",
    "size": 51200,
    "category": "image",
    "webViewLink": "https://drive.google.com/file/...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### POST /api/files/upload

Upload a file and assign to specific user (admin only).

**Request:**
```
POST /api/files/upload
Content-Type: multipart/form-data

file: <file>
userId: "654abc..."  // Target user ID
```

**Response:**
```json
{
  "file": {
    "id": "654abc...",
    "user": { "id": "654abc...", "name": "...", "email": "..." }
  }
}
```

---

### GET /api/files/:fileId/download

Download a file by ID (admin only).

**Response:** Binary file stream with appropriate headers.

---

### DELETE /api/files/:fileId

Delete a file from Drive and database (admin only).

**Response:**
```json
{
  "message": "File deleted."
}
```

---

## Drives

### GET /api/drive/drives

List all configured Google Drives.

**Response:**
```json
{
  "drives": [
    {
      "_id": "654abc...",
      "name": "My Drive",
      "email": "owner@gmail.com",
      "isActive": true,
      "storage": {
        "limit": "107374182400",
        "usage": "53687091200",
        "available": "102005563200",
        "percentage": 50
      },
      "lastSynced": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /api/drive/drives

Add a new Google Drive configuration (admin only).

**Request:**
```json
POST /api/drive/drives
Content-Type: application/json

{
  "name": "Backup Drive",
  "email": "backup@gmail.com",
  "clientId": "...",
  "clientSecret": "...",
  "refreshToken": "...",
  "folderId": "optional-folder-id"
}
```

---

### POST /api/drive/sync/:id

Sync drive storage statistics.

**Response:**
```json
{
  "drive": {
    "_id": "654abc...",
    "storage": { "limit": "...", "usage": "...", "percentage": 45 },
    "lastSynced": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Activities

### GET /api/activities

Get activity logs (admin only).

**Response:**
```json
{
  "activities": [
    {
      "_id": "654abc...",
      "action": "upload",
      "details": "admin@example.com uploaded a Document file (report.pdf)",
      "driveId": "654abc...",
      "driveName": "My Drive",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Health Check

### GET /api/health

Check API status.

**Response:**
```json
{
  "status": "ok",
  "service": "cloudnest-api"
}
```