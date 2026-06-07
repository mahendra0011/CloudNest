import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import {
  Archive,
  Cloud,
  CloudUpload,
  Database,
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileText,
  Image,
  Loader2,
  LogOut,
  Trash2,
  Upload,
  UserRound,
  Video
} from 'lucide-react';
import { Button } from './components/ui/button.jsx';
import { Card, CardContent, CardHeader } from './components/ui/card.jsx';
import { Input } from './components/ui/input.jsx';
import {
  clearAuthError,
  fetchDriveStatus,
  fetchMe,
  login,
  logout,
  register,
  requestGoogleLogin
} from './features/auth/authSlice.js';
import {
  clearFileError,
  deleteFile,
  fetchFiles,
  uploadSelectedFile
} from './features/files/filesSlice.js';
import { downloadUrl } from './lib/api.js';
import { cn, formatBytes, formatDate, getInitials } from './lib/utils.js';

const filters = ['all', 'image', 'video', 'archive', 'document', 'other'];

const categoryMeta = {
  image: { label: 'Images', icon: Image, className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  video: { label: 'Videos', icon: Video, className: 'bg-sky-50 text-sky-700 ring-sky-100' },
  archive: { label: 'Archives', icon: FileArchive, className: 'bg-amber-50 text-amber-700 ring-amber-100' },
  document: { label: 'Docs', icon: FileText, className: 'bg-sky-50 text-sky-700 ring-sky-100' },
  other: { label: 'Files', icon: File, className: 'bg-gray-100 text-gray-700 ring-gray-200' }
};

export default function App() {
  const dispatch = useDispatch();
  const { user, bootstrapped, error: authError } = useSelector((state) => state.auth);
  const { error: fileError } = useSelector((state) => state.files);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');

    if (auth === 'google-success') {
      setNotice({ severity: 'success', text: 'Google login successful' });
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (auth === 'google-denied') {
      setNotice({ severity: 'warning', text: 'Google login cancelled' });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (authError) {
      setNotice({ severity: 'error', text: authError });
      dispatch(clearAuthError());
    }

    if (fileError) {
      setNotice({ severity: 'error', text: fileError });
      dispatch(clearFileError());
    }
  }, [authError, dispatch, fileError]);

  if (!bootstrapped) {
    return <Splash />;
  }

  return (
    <div className="min-h-screen studio-grid text-gray-900">
      {user ? <Dashboard setNotice={setNotice} /> : <AuthScreen />}

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3600}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notice ? (
          <Alert severity={notice.severity} variant="filled" sx={{ borderRadius: '8px' }}>
            {notice.text}
          </Alert>
        ) : null}
      </Snackbar>
    </div>
  );
}

function Splash() {
  return (
    <div className="min-h-screen studio-grid flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-panel">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
        <span className="text-sm font-semibold text-gray-700">Loading Drive Studio</span>
      </div>
    </div>
  );
}

function AuthScreen() {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });
  const isRegister = mode === 'register';
  const loading = status === 'loading';

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = isRegister
      ? form
      : { username: form.username, password: form.password };

    const action = isRegister ? register : login;
    const result = await dispatch(action(payload));

    if (action.fulfilled.match(result)) {
      dispatch(fetchDriveStatus());
      dispatch(fetchFiles());
    }
  }

  async function handleGoogleLogin() {
    const result = await dispatch(requestGoogleLogin());

    if (requestGoogleLogin.fulfilled.match(result)) {
      window.location.href = result.payload.url;
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <Card className="w-full overflow-hidden">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <CloudUpload className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-2xl font-bold">CloudNest</h1>
                <p className="text-sm text-gray-500">Images, videos, zips, files</p>
              </div>
            </div>
            <Cloud className="h-6 w-6 text-emerald-600" />
          </div>

          <div className="grid grid-cols-2 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={cn('rounded-md px-3 py-2 text-sm font-semibold transition', mode === 'login' ? 'bg-white shadow-sm' : 'text-gray-500')}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={cn('rounded-md px-3 py-2 text-sm font-semibold transition', mode === 'register' ? 'bg-white shadow-sm' : 'text-gray-500')}
            >
              Register
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <Button className="mb-4 w-full" variant="secondary" type="button" onClick={handleGoogleLogin} disabled={loading}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-900 ring-1 ring-gray-200">
              G
            </span>
            Login with Google
          </Button>

          <div className="mb-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold uppercase text-gray-400">or</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-gray-700">Username</span>
              <Input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="developer"
                autoComplete="username"
                required
              />
            </label>

            {isRegister ? (
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Email</span>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="dev@example.com"
                  autoComplete="email"
                  required
                />
              </label>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-gray-700">Password</span>
              <Input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
              />
            </label>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRound className="h-4 w-4" />}
              {isRegister ? 'Create account' : 'Enter dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function Dashboard({ setNotice }) {
  const dispatch = useDispatch();
  const { user, driveConnected } = useSelector((state) => state.auth);
  const { items, status, uploadStatus, uploadProgress } = useSelector((state) => state.files);

  useEffect(() => {
    dispatch(fetchDriveStatus());
    dispatch(fetchFiles());
  }, [dispatch]);

  async function handleLogout() {
    await dispatch(logout());
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-5 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-panel sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <CloudUpload className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold">CloudNest</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip
            label={driveConnected ? 'Owner Drive ready' : 'Owner Drive not configured'}
            color={driveConnected ? 'success' : 'default'}
            size="small"
            sx={{ borderRadius: '8px', fontWeight: 700 }}
          />
          <Tooltip title="Logout">
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </Tooltip>
          {user.avatar ? (
            <img className="h-10 w-10 rounded-lg object-cover" src={user.avatar} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-800">
              {getInitials(user.username)}
            </span>
          )}
        </div>
      </header>

      <Stats files={items} />

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <UploadPanel
          driveConnected={driveConnected}
          uploadStatus={uploadStatus}
          uploadProgress={uploadProgress}
          setNotice={setNotice}
        />
        <FileLibrary files={items} loading={status === 'loading'} />
      </div>
    </main>
  );
}

function Stats({ files }) {
  const totalSize = files.reduce((sum, file) => sum + Number(file.size || 0), 0);
  const stats = [
    { label: 'Files', value: files.length, icon: Database, className: 'bg-gray-100 text-gray-700 ring-gray-200' },
    { label: 'Images', value: files.filter((file) => file.category === 'image').length, icon: Image, className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
    { label: 'Videos', value: files.filter((file) => file.category === 'video').length, icon: Video, className: 'bg-sky-50 text-sky-700 ring-sky-100' },
    { label: 'Storage', value: formatBytes(totalSize), icon: Archive, className: 'bg-amber-50 text-amber-700 ring-amber-100' }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </div>
            <span className={cn('flex h-11 w-11 items-center justify-center rounded-lg ring-1', stat.className)}>
              <stat.icon className="h-5 w-5" />
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}

function UploadPanel({ driveConnected, uploadStatus, uploadProgress, setNotice }) {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const uploading = uploadStatus === 'loading';

  function pickFile(file) {
    if (!file) return;
    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!driveConnected) {
      setNotice({ severity: 'warning', text: 'Owner Google Drive is not configured' });
      return;
    }

    if (!selectedFile) {
      setNotice({ severity: 'warning', text: 'Choose a file first' });
      return;
    }

    const result = await dispatch(uploadSelectedFile(selectedFile));

    if (uploadSelectedFile.fulfilled.match(result)) {
      setSelectedFile(null);
      setNotice({ severity: 'success', text: 'File uploaded' });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Upload</h2>
          <p className="text-sm text-gray-500">Files save into owner Google Drive</p>
        </div>
        <Chip
          label={driveConnected ? 'Ready' : 'Setup needed'}
          color={driveConnected ? 'success' : 'default'}
          size="small"
          sx={{ borderRadius: '8px', fontWeight: 700 }}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        <label
          htmlFor="file-upload"
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pickFile(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            'flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition',
            dragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          )}
        >
          <input
            id="file-upload"
            type="file"
            className="sr-only"
            onChange={(event) => pickFile(event.target.files?.[0])}
          />
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <Upload className="h-6 w-6" />
          </span>
          <span className="text-lg font-bold">{selectedFile ? selectedFile.name : 'Drop file here'}</span>
          <span className="mt-2 text-sm text-gray-500">
            {selectedFile ? formatBytes(selectedFile.size) : 'Image, video, zip, PDF, or any project file'}
          </span>
        </label>

        {uploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-600">
              <span>Uploading</span>
              <span>{uploadProgress}%</span>
            </div>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 10,
                borderRadius: 8,
                backgroundColor: '#e5e7eb',
                '& .MuiLinearProgress-bar': { borderRadius: 8, backgroundColor: '#059669' }
              }}
            />
          </div>
        ) : (
          <div className="h-10 overflow-hidden rounded-lg bg-emerald-50">
            <div className="upload-stripes h-full w-full opacity-70" />
          </div>
        )}

        <Button className="w-full" onClick={handleUpload} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
          Upload to Drive
        </Button>
      </CardContent>
    </Card>
  );
}

function FileLibrary({ files, loading }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const visibleFiles = useMemo(() => {
    if (activeFilter === 'all') return files;
    return files.filter((file) => file.category === activeFilter);
  }, [activeFilter, files]);

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-panel">
      <div className="border-b border-gray-100 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Library</h2>
            <p className="text-sm text-gray-500">{visibleFiles.length} visible files</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Chip
                key={filter}
                label={filter === 'all' ? 'All' : categoryMeta[filter].label}
                onClick={() => setActiveFilter(filter)}
                variant={activeFilter === filter ? 'filled' : 'outlined'}
                color={activeFilter === filter ? 'success' : 'default'}
                sx={{ borderRadius: '8px', fontWeight: 700 }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
          </div>
        ) : visibleFiles.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <File className="h-9 w-9 text-gray-400" />
            <p className="mt-3 text-sm font-semibold text-gray-700">No files found</p>
          </div>
        )}
      </div>
    </section>
  );
}

function FileCard({ file }) {
  const dispatch = useDispatch();
  const meta = categoryMeta[file.category] || categoryMeta.other;
  const Icon = meta.icon;

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ring-1', meta.className)}>
          {file.thumbnailLink ? (
            <img src={file.thumbnailLink} alt="" className="h-full w-full rounded-lg object-cover" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-gray-900" title={file.originalName}>
            {file.originalName}
          </h3>
          <p className="mt-1 text-xs font-medium text-gray-500">
            {formatBytes(file.size)} - {formatDate(file.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className={cn('rounded-md px-2 py-1 text-xs font-bold ring-1', meta.className)}>
          {meta.label}
        </span>

        <div className="flex items-center gap-1">
          {file.webViewLink ? (
            <Tooltip title="Open in Drive">
              <Button asChild size="icon" variant="ghost" aria-label="Open in Drive">
                <a href={file.webViewLink} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </Tooltip>
          ) : null}

          <Tooltip title="Download">
            <Button asChild size="icon" variant="secondary" aria-label="Download">
              <a href={downloadUrl(file.id)}>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </Tooltip>

          <Tooltip title="Delete">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => dispatch(deleteFile(file.id))}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4 text-rose-600" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </article>
  );
}
