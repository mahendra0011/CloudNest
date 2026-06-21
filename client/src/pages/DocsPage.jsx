import React, { useState, useCallback } from 'react';
import { BookOpen, Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';

/* ── Code Block with Copy Button ── */
function CodeBlock({ code, language = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <div className="relative my-4 rounded-lg border border-gray-300 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-gray-500 hover:text-black hover:bg-gray-100 transition"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed bg-gray-50">
        <code className="font-mono text-black whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

/* ── Collapsible Section ── */
function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition"
      >
        <h3 className="text-base font-bold text-black">{title}</h3>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Steps List ── */
function StepsList({ steps }) {
  return (
    <ol className="space-y-3 ml-1">
      {steps.map((step, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-bold text-black shrink-0 mt-0.5">
            {idx + 1}
          </span>
          <span className="text-sm text-black leading-relaxed">{step}</span>
        </li>
      ))}
    </ol>
  );
}

/* ── Table ── */
function EnvTable({ rows }) {
  return (
    <div className="overflow-x-auto my-4 rounded-lg border border-gray-300">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-3 font-bold text-black">Variable</th>
            <th className="px-4 py-3 font-bold text-black">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row, idx) => (
            <tr key={idx} className="bg-white">
              <td className="px-4 py-3">
                <code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">
                  {row[0]}
                </code>
              </td>
              <td className="px-4 py-3 text-xs text-gray-700">{row[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Separator ── */
function Separator() {
  return <div className="my-10 border-t border-gray-200" />;
}

/* ══════════════════════════════════════════
   DOCS PAGE — Full white, black text, full width
═══════════════════════════════════════════ */
export default function DocsPage() {
  return (
    <div className="min-h-screen w-full bg-white text-black">
      {/* Header — full width */}
      <div className="border-b border-gray-200 bg-white w-full">
        <div className="w-full px-4 py-8">
          <h1 className="text-center text-3xl font-black text-black sm:text-4xl">
            CloudNest Developer Guide
          </h1>
          <p className="mt-4 text-center text-base text-gray-600 max-w-3xl mx-auto">
            CloudNest is a MERN starter for apps that need user file uploads, but do not want to build storage from zero. It stores the actual files in the owner Google Drive account and stores file metadata in MongoDB.
          </p>
          <p className="mt-3 text-center text-sm text-gray-500 max-w-3xl mx-auto">
            This guide is written for developers who want to understand how the project works, customize it, or copy only the upload feature into another project.
          </p>
        </div>
      </div>

      {/* Content — full width */}
      <div className="w-full">
        <div className="w-full px-4 py-8 space-y-8">

          {/* ── WHO SHOULD USE THIS GUIDE ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Who Should Use This Guide</h2>
            <p className="text-sm text-gray-700 mb-3">Use this guide if you want to:</p>
            <StepsList steps={[
              'Add image, video, zip, PDF, document, or general file upload to a React/Node project.',
              'Use Google Drive as a cheap owner-controlled storage backend.',
              'Let users login and see only their own uploaded files.',
              'Reuse only the upload API without using the full CloudNest dashboard.',
              'Build your own UI on top of the existing backend.',
              'Understand which files to copy if you are integrating this into another MERN app.',
            ]} />
          </section>

          <Separator />

          {/* ── HIGH LEVEL ARCHITECTURE ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">High Level Architecture</h2>
            <p className="text-sm text-gray-700 mb-3">CloudNest has three main layers:</p>
            <StepsList steps={[
              'React frontend',
              'Express backend',
              'MongoDB plus Google Drive storage',
            ]} />
            <p className="text-sm text-gray-700 mt-4 mb-2">The responsibility split is simple:</p>
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 font-bold text-black">Layer</th>
                    <th className="px-4 py-3 font-bold text-black">Responsibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">React</td><td className="px-4 py-3 text-sm text-gray-700">Login UI, Google login button, upload UI, file list, download/delete actions</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">Redux Toolkit</td><td className="px-4 py-3 text-sm text-gray-700">Auth state, file list state, upload progress, loading/error states</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">Express</td><td className="px-4 py-3 text-sm text-gray-700">Auth routes, Google login OAuth, upload route, download route, delete route</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">Multer</td><td className="px-4 py-3 text-sm text-gray-700">Receives multipart file uploads and temporarily saves them</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">Google Drive API</td><td className="px-4 py-3 text-sm text-gray-700">Stores actual uploaded files in the owner Drive account</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">MongoDB</td><td className="px-4 py-3 text-sm text-gray-700">Stores users and file metadata</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <Separator />

          {/* ── REQUEST FLOW ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Request Flow</h2>
            <p className="text-sm text-gray-700 mb-3">When a user uploads a file:</p>
            <StepsList steps={[
              'User logs in with email/password or Google login.',
              'Backend sets an HTTP-only token cookie.',
              'Frontend sends the selected file to POST /api/files/upload.',
              'Request must include cookies because the upload route is protected.',
              'multer saves the file temporarily on the server.',
              'Backend checks that owner Google Drive credentials are configured.',
              'Backend uploads the temporary file to owner Google Drive.',
              'Google Drive returns file metadata such as id, webViewLink, thumbnailLink, and mimeType.',
              'Backend saves MongoDB metadata with the logged-in user\'s ID.',
              'Temporary local file is removed.',
              'Frontend receives the saved file metadata and updates the UI.',
            ]} />

            <p className="text-sm text-gray-700 mt-6 mb-3">Download flow:</p>
            <StepsList steps={[
              'User clicks download.',
              'Browser opens GET /api/files/:fileId/download.',
              'Backend checks that the file belongs to the logged-in user.',
              'Backend streams the Google Drive file through Express.',
              'Browser downloads the file.',
            ]} />

            <p className="text-sm text-gray-700 mt-6 mb-3">Delete flow:</p>
            <StepsList steps={[
              'User clicks delete.',
              'Frontend calls DELETE /api/files/:fileId.',
              'Backend checks ownership.',
              'Backend deletes the file from Google Drive when Drive is configured.',
              'Backend deletes MongoDB metadata.',
            ]} />
          </section>

          <Separator />

          {/* ── IMPORTANT FOLDER STRUCTURE ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Important Folder Structure</h2>
            <CodeBlock code={`CloudNest/
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
      features/files/filesSlice.js`} language="text" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Most developers only need to understand these files:</p>
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 font-bold text-black">File</th>
                    <th className="px-4 py-3 font-bold text-black">Why it matters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">app.js</code></td><td className="px-4 py-3 text-sm text-gray-700">Registers Express middleware and API routes</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">routes/user.routes.js</code></td><td className="px-4 py-3 text-sm text-gray-700">Register, login, Google login, logout, current user</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">routes/file.routes.js</code></td><td className="px-4 py-3 text-sm text-gray-700">List, upload, download, delete files</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">services/googleDrive.service.js</code></td><td className="px-4 py-3 text-sm text-gray-700">Upload/download/delete logic for owner Google Drive</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">config/googleDrive.js</code></td><td className="px-4 py-3 text-sm text-gray-700">Google OAuth client and owner Drive client setup</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">config/multer.config.js</code></td><td className="px-4 py-3 text-sm text-gray-700">Temporary file upload storage and max file size</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">models/files.model.js</code></td><td className="px-4 py-3 text-sm text-gray-700">MongoDB metadata schema for uploaded files</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">client/src/lib/api.js</code></td><td className="px-4 py-3 text-sm text-gray-700">Frontend API helpers, upload progress helper, download URL helper</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">client/src/features/files/filesSlice.js</code></td><td className="px-4 py-3 text-sm text-gray-700">Redux file actions and upload state</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <Separator />

          {/* ── ENVIRONMENT SETUP ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Environment Setup</h2>
            <p className="text-sm text-gray-700 mb-3">Copy the backend env file:</p>
            <CodeBlock code="copy .env.example .env" language="bash" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Required backend env:</p>
            <CodeBlock code={`PORT=3000
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
OWNER_TOKEN_PORT=4000`} language="text" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Copy the frontend env file:</p>
            <CodeBlock code="copy client\\.env.example client\\.env" language="bash" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Frontend env:</p>
            <CodeBlock code={`VITE_API_URL=http://localhost:3000/api`} language="text" />
          </section>

          <Separator />

          {/* ── GOOGLE CLOUD SETUP ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Google Cloud Setup</h2>
            <p className="text-sm text-gray-700 mb-3">You need Google OAuth credentials. A plain Google API key is not enough for private Drive upload.</p>
            <p className="text-sm text-gray-700 mb-3">Step by step:</p>
            <StepsList steps={[
              'Open Google Cloud Console.',
              'Create or select a project.',
              'Open APIs & Services.',
              'Enable Google Drive API.',
              'Open OAuth consent screen.',
              'Add app name, support email, and developer contact email.',
              'Add your Google account as a test user if the app is in testing mode.',
              'Open Credentials.',
              'Create OAuth client ID.',
              'Choose Web application.',
              'Add redirect URI: http://localhost:3000/api/auth/google/callback',
              'Add redirect URI for owner token helper: http://localhost:4000/oauth2callback',
              'Copy client ID into GOOGLE_CLIENT_ID and client secret into GOOGLE_CLIENT_SECRET.',
            ]} />
            <p className="text-sm text-gray-700 mt-4 mb-2">For production, add your deployed backend callback:</p>
            <CodeBlock code={`GOOGLE_LOGIN_REDIRECT_URI=https://your-api-domain.com/api/auth/google/callback
CLIENT_URL=https://your-frontend-domain.com`} language="text" />
          </section>

          <Separator />

          {/* ── OWNER GOOGLE DRIVE STORAGE ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Owner Google Drive Storage</h2>
            <p className="text-sm text-gray-700 mb-3">CloudNest is designed so users do not connect their own Google Drive. All uploads go into the owner Drive account configured by the backend. The key env value:</p>
            <CodeBlock code="GOOGLE_DRIVE_REFRESH_TOKEN=owner-google-drive-refresh-token" language="text" />
            <p className="text-sm text-gray-700 mt-4 mb-2">To generate it:</p>
            <CodeBlock code="npm run google:owner-token" language="bash" />
            <p className="text-sm text-gray-700 mt-3">The script will start a local callback server, print a Google consent URL, ask you to open it in a browser, approve using the owner Google account, and print a refresh token.</p>
            <p className="text-sm text-gray-700 mt-3">By default, the owner token uses <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">https://www.googleapis.com/auth/drive.file</code>. This is safer than full Drive access because it limits what the app can manage.</p>
          </section>

          <Separator />

          {/* ── HOW FILES ARE ORGANIZED IN DRIVE ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">How Files Are Organized In Drive</h2>
            <p className="text-sm text-gray-700 mb-3">CloudNest creates category folders in Google Drive:</p>
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 font-bold text-black">Category</th>
                    <th className="px-4 py-3 font-bold text-black">Folder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white"><td className="px-4 py-3 text-sm text-gray-700">image</td><td className="px-4 py-3 text-sm text-black font-semibold">Images</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm text-gray-700">video</td><td className="px-4 py-3 text-sm text-black font-semibold">Videos</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm text-gray-700">archive</td><td className="px-4 py-3 text-sm text-black font-semibold">Archives</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm text-gray-700">document</td><td className="px-4 py-3 text-sm text-black font-semibold">Documents</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm text-gray-700">other</td><td className="px-4 py-3 text-sm text-black font-semibold">Other Files</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-700 mt-4 mb-2">To add more file groups, update <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">getCategory</code> in <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">routes/file.routes.js</code>:</p>
            <CodeBlock code={`function getCategory(mimeType, originalName) {
  mimeType = mimeType || '';

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';

  const ext = path.extname(originalName).toLowerCase();
  if (['.zip', '.rar', '.7z'].includes(ext)) return 'archive';

  return 'other';
}`} language="javascript" />
          </section>

          <Separator />

          {/* ── MONGODB FILE METADATA ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">MongoDB File Metadata</h2>
            <p className="text-sm text-gray-700 mb-3">Google Drive stores the real file. MongoDB stores metadata so your app knows which user owns which Drive file. <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">models/files.model.js</code> stores:</p>
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 font-bold text-black">Field</th>
                    <th className="px-4 py-3 font-bold text-black">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">user</code></td><td className="px-4 py-3 text-sm text-gray-700">MongoDB user ID of the uploader</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">driveFileId</code></td><td className="px-4 py-3 text-sm text-gray-700">Google Drive file ID</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">originalName</code></td><td className="px-4 py-3 text-sm text-gray-700">Original uploaded file name</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">mimeType</code></td><td className="px-4 py-3 text-sm text-gray-700">File MIME type</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">size</code></td><td className="px-4 py-3 text-sm text-gray-700">File size in bytes</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">category</code></td><td className="px-4 py-3 text-sm text-gray-700">image, video, archive, document, or other</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">webViewLink</code></td><td className="px-4 py-3 text-sm text-gray-700">Google Drive preview link</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">webContentLink</code></td><td className="px-4 py-3 text-sm text-gray-700">Google Drive content link when available</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">thumbnailLink</code></td><td className="px-4 py-3 text-sm text-gray-700">Google Drive thumbnail link when available</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">iconLink</code></td><td className="px-4 py-3 text-sm text-gray-700">Google Drive icon link when available</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">driveCreatedTime</code></td><td className="px-4 py-3 text-sm text-gray-700">Created time returned by Google Drive</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-700 mt-4">The important security rule:</p>
            <CodeBlock code={`fileModel.findOne({
  _id: req.params.fileId,
  user: req.user._id
});`} language="javascript" />
            <p className="text-sm text-gray-700 mt-2">Every list, download, and delete operation should filter by <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">user: req.user._id</code>. Without this check, one user could access another user's uploaded file.</p>
          </section>

          <Separator />

          {/* ── BACKEND API ROUTES ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Backend API Routes</h2>
            <p className="text-sm text-gray-700 mb-4">All routes are prefixed with <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api</code>.</p>

            <h3 className="text-lg font-bold text-black mb-3">Auth routes</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-300 mb-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 font-bold text-black">Method</th>
                    <th className="px-4 py-3 font-bold text-black">Route</th>
                    <th className="px-4 py-3 font-bold text-black">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">POST</td><td className="px-4 py-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api/auth/register</code></td><td className="px-4 py-3 text-sm text-gray-700">Create user and set auth cookie</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">POST</td><td className="px-4 py-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api/auth/login</code></td><td className="px-4 py-3 text-sm text-gray-700">Login and set auth cookie</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">GET</td><td className="px-4 py-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api/auth/google</code></td><td className="px-4 py-3 text-sm text-gray-700">Get Google login URL</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">GET</td><td className="px-4 py-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api/auth/google/callback</code></td><td className="px-4 py-3 text-sm text-gray-700">Google login callback</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">GET</td><td className="px-4 py-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api/auth/me</code></td><td className="px-4 py-3 text-sm text-gray-700">Get current logged-in user</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">POST</td><td className="px-4 py-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api/auth/logout</code></td><td className="px-4 py-3 text-sm text-gray-700">Clear auth cookie</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-bold text-black mb-3">Drive routes</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-300 mb-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 font-bold text-black">Method</th>
                    <th className="px-4 py-3 font-bold text-black">Route</th>
                    <th className="px-4 py-3 font-bold text-black">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">GET</td><td className="px-4 py-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api/drive/status</code></td><td className="px-4 py-3 text-sm text-gray-700">Check whether owner Drive is configured</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">GET</td><td className="px-4 py-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api/drive/connect</code></td><td className="px-4 py-3 text-sm text-gray-700">Returns 410 because users do not connect Drive</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-bold text-black mb-3">File routes</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 font-bold text-black">Method</th>
                    <th className="px-4 py-3 font-bold text-black">Route</th>
                    <th className="px-4 py-3 font-bold text-black">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">GET</td><td className="px-4 py-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api/files</code></td><td className="px-4 py-3 text-sm text-gray-700">List logged-in user's files</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">POST</td><td className="px-4 py-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api/files/upload</code></td><td className="px-4 py-3 text-sm text-gray-700">Upload file to owner Drive</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">GET</td><td className="px-4 py-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api/files/:fileId/download</code></td><td className="px-4 py-3 text-sm text-gray-700">Download logged-in user's file</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">DELETE</td><td className="px-4 py-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">/api/files/:fileId</code></td><td className="px-4 py-3 text-sm text-gray-700">Delete logged-in user's file</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <Separator />

          {/* ── UPLOAD API DETAILS ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Upload API Details</h2>
            <p className="text-sm text-gray-700 mb-2">Upload endpoint:</p>
            <CodeBlock code="POST /api/files/upload" language="text" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Request type:</p>
            <CodeBlock code="multipart/form-data" language="text" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Required field name:</p>
            <CodeBlock code="file" language="text" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Example response:</p>
            <CodeBlock code={`{
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
}`} language="json" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Common upload errors:</p>
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 font-bold text-black">Status</th>
                    <th className="px-4 py-3 font-bold text-black">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">400</td><td className="px-4 py-3 text-sm text-gray-700">No file was sent</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">401</td><td className="px-4 py-3 text-sm text-gray-700">User is not logged in or cookie is missing</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">503</td><td className="px-4 py-3 text-sm text-gray-700">Owner Google Drive is not configured</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3 text-sm font-semibold text-black">413</td><td className="px-4 py-3 text-sm text-gray-700">File is larger than MAX_UPLOAD_MB</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <Separator />

          {/* ── FRONTEND API HELPER ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Frontend API Helper</h2>
            <p className="text-sm text-gray-700 mb-3">The helper is in <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">client/src/lib/api.js</code>.</p>
            <p className="text-sm text-gray-700 mb-3">It exposes:</p>
            <CodeBlock code={`apiFetch(path, options)
uploadFile(file, onProgress)
downloadUrl(fileId)`} language="javascript" />
            <p className="text-sm text-gray-700 mt-4 mb-2"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">apiFetch</code> uses:</p>
            <CodeBlock code={`credentials: 'include'`} language="javascript" />
            <p className="text-sm text-gray-700 mt-3">That is required because auth uses HTTP-only cookies.</p>
            <p className="text-sm text-gray-700 mt-4 mb-2"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">uploadFile</code> uses XMLHttpRequest instead of plain fetch because browser fetch does not provide simple upload progress events.</p>
          </section>

          <Separator />

          {/* ── FULL DASHBOARD INTEGRATION ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Full Dashboard Integration</h2>
            <p className="text-sm text-gray-700 mb-3">Use the full dashboard if you want:</p>
            <StepsList steps={[
              'Login/register UI.',
              'Google login button.',
              'Drag-and-drop upload.',
              'Upload progress.',
              'File list.',
              'Download and delete buttons.',
              'Category badges and file metadata.',
            ]} />
            <p className="text-sm text-gray-700 mt-4 mb-2">Important frontend files:</p>
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 font-bold text-black">File</th>
                    <th className="px-4 py-3 font-bold text-black">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">client/src/App.jsx</code></td><td className="px-4 py-3 text-sm text-gray-700">Main dashboard UI</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">client/src/features/auth/authSlice.js</code></td><td className="px-4 py-3 text-sm text-gray-700">Login/register/me/Google login state</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">client/src/features/files/filesSlice.js</code></td><td className="px-4 py-3 text-sm text-gray-700">File list/upload/delete state</td></tr>
                  <tr className="bg-white"><td className="px-4 py-3"><code className="font-mono text-xs text-black bg-gray-100 px-1.5 py-0.5 rounded">client/src/lib/api.js</code></td><td className="px-4 py-3 text-sm text-gray-700">API helpers</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-700 mt-4 mb-2">If you copy the dashboard into another app:</p>
            <StepsList steps={[
              'Copy client/src/lib/api.js.',
              'Copy client/src/features/auth/authSlice.js.',
              'Copy client/src/features/files/filesSlice.js.',
              'Register both reducers in your Redux store.',
              'Set VITE_API_URL to your backend API URL.',
              'Make sure your backend CORS allows your frontend URL.',
              'Keep credentials: \'include\' on all protected API calls.',
            ]} />
          </section>

          <Separator />

          {/* ── UPLOAD ONLY WITHOUT DASHBOARD ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Upload Only Without Dashboard</h2>
            <p className="text-sm text-gray-700 mb-3">Use this section when you do not want the full dashboard. For example, you already have your own UI and only want an upload button inside an existing page.</p>
            <p className="text-sm text-gray-700 mb-3">Minimum requirement:</p>
            <StepsList steps={[
              'User must already be logged in, or you must create your own auth flow.',
              'Backend must have owner Google Drive env configured.',
              'The upload request must send multipart/form-data.',
              'The file field name must be file.',
              'Cookies must be included.',
            ]} />

            <h3 className="text-base font-bold text-black mt-6 mb-3">React Upload Only Component</h3>
            <CodeBlock code={`import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function uploadFileOnly(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    formData.append('file', file);
    xhr.open('POST', \`\${API_URL}/files/upload\`);
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
          <a href={\`\${API_URL}/files/\${uploadedFile.id}/download\`}>
            Download
          </a>
        </div>
      )}
    </div>
  );
}`} language="javascript" />
            <p className="text-sm text-gray-700 mt-3">This component does not need Redux. It is good when your app has one upload area such as:</p>
            <StepsList steps={[
              'Upload resume',
              'Upload invoice',
              'Upload profile document',
              'Upload assignment zip',
              'Upload product image',
              'Upload admin attachment',
            ]} />

            <h3 className="text-base font-bold text-black mt-6 mb-3">Plain HTML Upload Only Example</h3>
            <CodeBlock code={`<input id="fileInput" type="file" />
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
    xhr.open('POST', \`\${API_URL}/files/upload\`);
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
</script>`} language="html" />
            <p className="text-sm text-gray-700 mt-3">You still need to be logged in first because the backend uses auth cookies.</p>
          </section>

          <Separator />

          {/* ── IF YOU WANT UPLOAD WITHOUT LOGIN ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">If You Want Upload Without Login</h2>
            <p className="text-sm text-gray-700 mb-3">By default, CloudNest requires login for uploads. This is safer because every file belongs to a user.</p>
            <p className="text-sm text-gray-700 mb-3">If your project needs public upload, you can remove authMiddleware from the upload route:</p>
            <CodeBlock code={`router.post('/upload', upload.single('file'), async (req, res, next) => {
  // public upload logic
});`} language="javascript" />
            <p className="text-sm text-gray-700 mt-3">If you remove auth, you must decide how to store ownership. Options:</p>
            <StepsList steps={[
              'Store all files under one admin user.',
              'Store an anonymous session ID.',
              'Store an email field from the form.',
              'Store a project/order/ticket ID.',
            ]} />
            <p className="text-sm text-gray-700 mt-3">For most projects, keeping auth is better. Public upload can be abused unless you add limits, validation, captcha, and cleanup rules.</p>
          </section>

          <Separator />

          {/* ── BACKEND ONLY INTEGRATION ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Backend Only Integration In Another Project</h2>
            <p className="text-sm text-gray-700 mb-3">If you already have a frontend and only want the backend upload API, copy these parts:</p>
            <CodeBlock code={`config/googleDrive.js
config/multer.config.js
middlewares/auth.js
models/files.model.js
routes/file.routes.js
routes/drive.routes.js
services/googleDrive.service.js
scripts/google-owner-token.js`} language="text" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Then install the required backend packages:</p>
            <CodeBlock code="npm install express mongoose multer googleapis cookie-parser cors dotenv jsonwebtoken" language="bash" />
            <p className="text-sm text-gray-700 mt-3">If you also copy local auth:</p>
            <CodeBlock code="npm install bcrypt express-validator" language="bash" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Register routes in your Express app:</p>
            <CodeBlock code={`app.use('/api/files', fileRouter);
app.use('/api/drive', driveRouter);`} language="javascript" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Make sure these middlewares exist before routes:</p>
            <CodeBlock code={`app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));`} language="javascript" />
          </section>

          <Separator />

          {/* ── CUSTOMIZING UPLOAD LIMITS ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Customizing Upload Limits</h2>
            <p className="text-sm text-gray-700 mb-3">Upload size is controlled by:</p>
            <CodeBlock code="MAX_UPLOAD_MB=250" language="text" />
            <p className="text-sm text-gray-700 mt-3"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">config/multer.config.js</code> uses:</p>
            <CodeBlock code={`limits: {
  fileSize: maxUploadMb * 1024 * 1024
}`} language="javascript" />
            <p className="text-sm text-gray-700 mt-3">If you allow very large videos or zip files, also check:</p>
            <StepsList steps={[
              'Hosting provider request timeout.',
              'Reverse proxy size limits.',
              'Server disk space for temporary files.',
              'Google Drive quota.',
              'Google Drive API quota.',
            ]} />
          </section>

          <Separator />

          {/* ── CUSTOMIZING ALLOWED FILE TYPES ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Customizing Allowed File Types</h2>
            <p className="text-sm text-gray-700 mb-3">Currently the backend accepts any file type up to MAX_UPLOAD_MB. To restrict file types, add a fileFilter in <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">config/multer.config.js</code>:</p>
            <CodeBlock code={`const allowedMimeTypes = [
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
});`} language="javascript" />
          </section>

          <Separator />

          {/* ── CUSTOMIZING DRIVE FOLDER STRUCTURE ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Customizing Drive Folder Structure</h2>
            <p className="text-sm text-gray-700 mb-3">By default, files are stored by category. If you want every user's files in separate folders, update <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-black">services/driveManager.service.js</code>.</p>
            <p className="text-sm text-gray-700 mb-3">Example idea:</p>
            <CodeBlock code={`CloudNest Uploads/
  user-id-1/
    Images/
    Documents/
  user-id-2/
    Images/
    Documents/`} language="text" />
            <p className="text-sm text-gray-700 mt-3">To do that, pass the user to uploadToDrive from routes/file.routes.js, then create a user folder before creating the category folder. Keep in mind that folder creation adds extra Drive API calls.</p>
          </section>

          <Separator />

          {/* ── ADDING UPLOAD TO AN EXISTING PAGE ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Adding Upload To An Existing Page</h2>
            <p className="text-sm text-gray-700 mb-3">If your existing app already has auth and layout, you usually do not need the CloudNest dashboard. Use this small checklist:</p>
            <StepsList steps={[
              'Copy client/src/lib/api.js.',
              'Set VITE_API_URL.',
              'Add one file input or drag/drop area.',
              'Call uploadFile(file, setProgress).',
              'Save returned data.file in your page state.',
              'Use downloadUrl(file.id) if you need a download link.',
              'Call GET /api/files only if you want to show previous uploads.',
              'Call DELETE /api/files/:fileId only if users can delete uploads.',
            ]} />
            <p className="text-sm text-gray-700 mt-3">For a single upload field, you do not need Redux. For a full file manager, Redux is useful because multiple components need the same file state.</p>

            <h3 className="text-base font-bold text-black mt-6 mb-3">Download Button Example</h3>
            <CodeBlock code={`import { downloadUrl } from './lib/api';

function DownloadButton({ file }) {
  return (
    <a href={downloadUrl(file.id)}>
      Download
    </a>
  );
}`} language="javascript" />
            <p className="text-sm text-gray-700 mt-2">The download URL uses your backend, not a public Google Drive URL. That keeps the ownership check in your app.</p>

            <h3 className="text-base font-bold text-black mt-6 mb-3">Delete Button Example</h3>
            <CodeBlock code={`import { apiFetch } from './lib/api';

async function deleteUploadedFile(fileId) {
  await apiFetch(\`/files/\${fileId}\`, {
    method: 'DELETE'
  });
}`} language="javascript" />
            <p className="text-sm text-gray-700 mt-2">After delete, remove the file from your local UI state.</p>
          </section>

          <Separator />

          {/* ── GOOGLE LOGIN BUTTON FLOW ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Google Login Button Flow</h2>
            <p className="text-sm text-gray-700 mb-3">The frontend should not build the Google login URL manually. Ask the backend:</p>
            <CodeBlock code={`const data = await apiFetch('/auth/google');
window.location.href = data.url;`} language="javascript" />
            <p className="text-sm text-gray-700 mt-3">Why backend creates the URL:</p>
            <StepsList steps={[
              'Backend controls redirect URI.',
              'Backend creates and verifies OAuth state.',
              'Frontend does not need client secret.',
              'Callback can set the HTTP-only JWT cookie.',
            ]} />
          </section>

          <Separator />

          {/* ── CORS AND COOKIES ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">CORS And Cookies</h2>
            <p className="text-sm text-gray-700 mb-3">Because auth uses HTTP-only cookies, frontend requests must include credentials.</p>
            <p className="text-sm text-gray-700 mb-2">Frontend:</p>
            <CodeBlock code={`fetch(url, {
  credentials: 'include'
});`} language="javascript" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Backend:</p>
            <CodeBlock code={`app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));`} language="javascript" />
            <p className="text-sm text-gray-700 mt-4 mb-2">In production:</p>
            <StepsList steps={[
              'Use HTTPS.',
              'Set correct CLIENT_URL.',
              'Set correct GOOGLE_LOGIN_REDIRECT_URI.',
              'Cookie secure becomes true when NODE_ENV=production.',
            ]} />
          </section>

          <Separator />

          {/* ── LOCAL DEVELOPMENT ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Local Development</h2>
            <p className="text-sm text-gray-700 mb-3">Install backend packages:</p>
            <CodeBlock code="npm install" language="bash" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Install frontend packages:</p>
            <CodeBlock code="npm install --prefix client" language="bash" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Create env files:</p>
            <CodeBlock code={`copy .env.example .env
copy client\\.env.example client\\.env`} language="bash" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Run backend and frontend together:</p>
            <CodeBlock code="npm run dev" language="bash" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Open:</p>
            <CodeBlock code="http://localhost:5173" language="text" />
            <p className="text-sm text-gray-700 mt-4 mb-2">Backend health check:</p>
            <CodeBlock code="http://localhost:3000/api/health" language="text" />
          </section>

          <Separator />

          {/* ── TESTING UPLOAD MANUALLY ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Testing Upload Manually</h2>
            <StepsList steps={[
              'Start MongoDB.',
              'Start the app with npm run dev.',
              'Register a user or login with Google.',
              'Check Drive status in the app.',
              'Upload a small test image or PDF.',
              'Confirm the file appears in the UI.',
              'Confirm the file appears in owner Google Drive.',
              'Click download.',
              'Click delete and confirm it is removed from Drive and MongoDB.',
            ]} />
          </section>

          <Separator />

          {/* ── COMMON PROBLEMS ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Common Problems</h2>

            <CollapsibleSection title="Owner Google Drive is not configured" defaultOpen>
              <div className="mt-4 space-y-3">
                <p className="text-sm text-gray-700">Your backend is missing one or more values:</p>
                <CodeBlock code={`GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_DRIVE_REFRESH_TOKEN`} language="text" />
                <p className="text-sm text-gray-700 mt-2">Generate the owner refresh token again:</p>
                <CodeBlock code="npm run google:owner-token" language="bash" />
              </div>
            </CollapsibleSection>

            <div className="mt-3">
              <CollapsibleSection title="Google login redirect mismatch">
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-700">The value in .env must exactly match Google Cloud Console:</p>
                  <CodeBlock code="GOOGLE_LOGIN_REDIRECT_URI=http://localhost:3000/api/auth/google/callback" language="text" />
                  <p className="text-sm text-gray-700 mt-2">Google Cloud Console must include:</p>
                  <CodeBlock code="http://localhost:3000/api/auth/google/callback" language="text" />
                </div>
              </CollapsibleSection>
            </div>

            <div className="mt-3">
              <CollapsibleSection title="Upload returns 401">
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-700">The user is not logged in or the browser did not send the cookie. Check:</p>
                  <StepsList steps={[
                    'Login request succeeded.',
                    'Browser has the token cookie.',
                    'Frontend uses credentials: \'include\'.',
                    'Backend CORS has credentials: true.',
                    'CLIENT_URL matches the frontend origin.',
                  ]} />
                </div>
              </CollapsibleSection>
            </div>

            <div className="mt-3">
              <CollapsibleSection title="Upload progress stays at zero">
                <div className="mt-4">
                  <p className="text-sm text-gray-700">Use XMLHttpRequest for progress. Plain fetch is fine for upload, but it does not give easy upload progress events.</p>
                </div>
              </CollapsibleSection>
            </div>

            <div className="mt-3">
              <CollapsibleSection title="File uploads but does not show in list">
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-700">Check MongoDB. The upload route must save a file document with:</p>
                  <CodeBlock code="user: req.user._id" language="javascript" />
                  <p className="text-sm text-gray-700 mt-2">The list route only returns:</p>
                  <CodeBlock code="find({ user: req.user._id })" language="javascript" />
                </div>
              </CollapsibleSection>
            </div>

            <div className="mt-3">
              <CollapsibleSection title="Large files fail">
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-700">Check:</p>
                  <StepsList steps={[
                    'MAX_UPLOAD_MB',
                    'Server timeout',
                    'Hosting provider upload limit',
                    'Proxy upload limit',
                    'Available temp disk space',
                    'Drive quota',
                  ]} />
                </div>
              </CollapsibleSection>
            </div>

            <div className="mt-3">
              <CollapsibleSection title="Google API key confusion">
                <div className="mt-4">
                  <p className="text-sm text-gray-700">Google API key is not enough for private Drive upload. CloudNest needs OAuth client ID, OAuth client secret, and owner refresh token.</p>
                </div>
              </CollapsibleSection>
            </div>
          </section>

          <Separator />

          {/* ── PRODUCTION CHECKLIST ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Production Checklist</h2>
            <p className="text-sm text-gray-700 mb-3">Before deploying:</p>
            <StepsList steps={[
              'Rotate any credentials that were shared in chat, screenshots, logs, or public repos.',
              'Use a strong JWT_SECRET.',
              'Use HTTPS.',
              'Set NODE_ENV=production.',
              'Set production CLIENT_URL.',
              'Set production GOOGLE_LOGIN_REDIRECT_URI.',
              'Add production callback URL in Google Cloud Console.',
              'Use a production MongoDB database.',
              'Configure MAX_UPLOAD_MB.',
              'Keep .env out of Git.',
              'Do not expose GOOGLE_CLIENT_SECRET in frontend code.',
              'Do not expose GOOGLE_DRIVE_REFRESH_TOKEN in frontend code.',
              'Check owner Google Drive storage capacity.',
              'Test upload, download, delete, and Google login after deployment.',
            ]} />
          </section>

          <Separator />

          {/* ── WHEN TO USE FULL DASHBOARD VS UPLOAD ONLY ── */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">When To Use Full Dashboard vs Upload Only</h2>
            <p className="text-sm text-gray-700 mb-3">Use full dashboard when:</p>
            <StepsList steps={[
              'Users need to see all previous uploads.',
              'Users need delete and download actions.',
              'You want a ready file manager UI.',
              'Multiple upload categories matter.',
              'You want Redux-managed file state.',
            ]} />
            <p className="text-sm text-gray-700 mt-4 mb-3">Use upload only when:</p>
            <StepsList steps={[
              'You only need one file field in an existing form.',
              'You already have your own dashboard.',
              'You only need upload and maybe one download link.',
              'You do not want Redux for this feature.',
              'The page is simple, like resume upload, invoice upload, or document attachment.',
            ]} />
            <p className="text-sm text-gray-700 mt-4">In short: full dashboard is best for file management. Upload only is best for adding a single upload feature to an existing app.</p>
          </section>

          <Separator />

          {/* Footer */}
          <div className="text-center py-6">
            <p className="text-xs text-gray-400">
              CloudNest Documentation — Built with React + Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}