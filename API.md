# API Reference

All API routes are prefixed with `/api`. Browser clients should send cookies with requests because authentication uses an HTTP-only JWT cookie.

## Auth

### Register

`POST /api/auth/register`

```json
{
  "username": "developer",
  "email": "developer@example.com",
  "password": "testpass123"
}
```

Returns:

```json
{
  "user": {
    "id": "mongo-user-id",
    "username": "developer",
    "email": "developer@example.com"
  }
}
```

### Login

`POST /api/auth/login`

```json
{
  "username": "developer",
  "password": "testpass123"
}
```

### Current User

`GET /api/auth/me`

### Logout

`POST /api/auth/logout`

### Start Google Login

`GET /api/auth/google`

Returns:

```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

Redirect the browser to `url`. Google returns to `/api/auth/google/callback`, the server creates or finds the user, sets the JWT cookie, and redirects back to the frontend.

## Google Drive

### Drive Status

`GET /api/drive/status`

Returns:

```json
{
  "connected": true,
  "ownerStorage": true
}
```

`connected` means the backend has owner Drive credentials configured. Users do not connect their own Google Drive.

## Files

### List Files

`GET /api/files`

Returns:

```json
{
  "files": [
    {
      "id": "mongo-file-id",
      "driveFileId": "google-drive-file-id",
      "originalName": "photo.png",
      "mimeType": "image/png",
      "size": 12345,
      "category": "image",
      "webViewLink": "https://drive.google.com/...",
      "thumbnailLink": "https://...",
      "createdAt": "2026-06-07T..."
    }
  ]
}
```

### Upload File

`POST /api/files/upload`

Send `multipart/form-data` with field name `file`.

```js
const formData = new FormData();
formData.append('file', file);

await fetch('http://localhost:3000/api/files/upload', {
  method: 'POST',
  credentials: 'include',
  body: formData
});
```

If owner Google Drive storage is not configured, the API returns HTTP `503`.

### Download File

`GET /api/files/:fileId/download`

Use this URL in an anchor tag or `window.location`.

```html
<a href="http://localhost:3000/api/files/mongo-file-id/download">Download</a>
```

### Delete File

`DELETE /api/files/:fileId`

Deletes both the Google Drive file and the MongoDB metadata when possible.
