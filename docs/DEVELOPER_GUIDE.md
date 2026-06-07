# Developer Guide

This project is meant to be used as a starter for apps that need private user uploads backed by Google Drive.

## Architecture

- React handles the upload dashboard and calls `/api/*`.
- Redux stores the current user, owner Drive readiness, file list, and upload progress.
- Express owns authentication, Google login OAuth, owner Drive file streaming, and MongoDB writes.
- The owner Google Drive account stores the actual file content.
- MongoDB stores metadata such as logged-in user, Drive file ID, mime type, size, thumbnail, and category.

## Required Google Cloud Settings

Create an OAuth Web Client and add this redirect URI for user Google login:

```text
http://localhost:3000/api/auth/google/callback
```

For production, also add your deployed callback URL:

```text
https://your-domain.com/api/auth/google/callback
```

Enable the Google Drive API. A plain Google API key is not enough for private uploads because the app needs OAuth access.

For the one-time owner Drive refresh token helper, add this local redirect URI too:

```text
http://localhost:4000/oauth2callback
```

## Owner Google Drive Storage

Users do not connect their own Google Drive. The backend uploads every file into the owner Drive account represented by `GOOGLE_DRIVE_REFRESH_TOKEN`.

Add these server env values:

```text
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_LOGIN_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_DRIVE_REFRESH_TOKEN=owner-google-drive-refresh-token
GOOGLE_OWNER_DRIVE_SCOPE=https://www.googleapis.com/auth/drive.file
GOOGLE_DRIVE_FOLDER_ID=optional-owner-folder-id
```

To generate `GOOGLE_DRIVE_REFRESH_TOKEN`, run:

```bash
npm run google:owner-token
```

Open the printed URL and approve with the owner Google account. The script prints the refresh token in the terminal.

By default, the helper asks for this Drive scope:

```text
https://www.googleapis.com/auth/drive.file
```

That scope is intentionally limited. If a specific existing Drive folder rejects uploads, create the folder through this app flow or use a broader owner-only scope after understanding the tradeoff.

The same OAuth client can be used for both user login and owner Drive storage.

## Local Setup

```bash
npm install
npm install --prefix client
copy .env.example .env
copy client\.env.example client\.env
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Reusing Upload In Another React Page

Use the helper in `client/src/lib/api.js`:

```jsx
import { uploadFile } from './lib/api';

function SimpleUploader() {
  async function onChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file, (progress) => {
      console.log(`Upload ${progress}%`);
    });

    console.log(result.file);
  }

  return <input type="file" onChange={onChange} />;
}
```

Before uploading, the user must:

1. Register or log in.
2. The server must have owner Drive credentials configured in `.env`.

## Production Notes

- Set `CLIENT_URL` to your deployed frontend URL.
- Set `GOOGLE_LOGIN_REDIRECT_URI` to your deployed backend callback URL.
- Use a long random `JWT_SECRET`.
- Use HTTPS so secure cookies can be enabled.
- Rotate any OAuth credentials that have ever been pasted into chat, logs, screenshots, or public repos.
- Do not expose `GOOGLE_CLIENT_SECRET` in React or any frontend code.
- Do not expose `GOOGLE_DRIVE_REFRESH_TOKEN` in React or any frontend code.

## File Categories

The server classifies uploads into:

- `image`
- `video`
- `archive`
- `document`
- `other`

Update `getCategory` in `routes/file.routes.js` if your app needs custom grouping.
