import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Cloud, HardDrive, RefreshCw, Settings, FolderOpen, Mail, Key, AlertTriangle,
  Plus, CheckCircle, X, Trash2, Edit3, Eye, EyeOff, Save, Loader2,
  Zap, ChevronDown, ChevronUp, ExternalLink, Globe, Users
} from 'lucide-react';
import {
  fetchDriveStatus, fetchDriveStats, addDrive, togglePoolDrive, setPrimaryDrive, setUploadDrive,
  updateDrive, deleteDrive, syncDrive, syncAllDrives, fetchAutoUploadDrive, selectUploadDrive,
  generateOAuthUrl, exchangeOAuthCode, setDriveDataView, fetchDriveById,
  resetAddStatus, resetSyncStatus
} from '../../features/drives/drivesSlice.js';
import { cn, formatBytes, formatDate } from '../../lib/utils.js';
import { Button } from '../../components/ui/button.jsx';

const DRIVE_HELP_LINKS = {
  googleCloudConsole: 'https://console.cloud.google.com/',
  oauthConsent: 'https://console.cloud.google.com/apis/credentials/consent',
  removeAccess: 'https://myaccount.google.com/permissions'
};

export function GoogleDriveIntegrationTab({ setNotice, onSyncFinished }) {
  const dispatch = useDispatch();
  const {
    drives, activeDrive, activeDriveId, connected,
    status, syncStatus, addStatus, stats, statsStatus, error,
    autoSwitchEnabled, selectedDriveIds
  } = useSelector((state) => state.drives);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [showEditToken, setShowEditToken] = useState(false);
  const [showEditSecret, setShowEditSecret] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [expandedInfo, setExpandedInfo] = useState(true);

  const [showOAuthGenerator, setShowOAuthGenerator] = useState(false);
  const [showEditOAuthGenerator, setShowEditOAuthGenerator] = useState(false);
const [oauthForm, setOauthForm] = useState({ clientId: '', clientSecret: '', redirectUri: '' });
   const [editOauthForm, setEditOauthForm] = useState({ clientId: '', clientSecret: '', redirectUri: '' });
   const [generatedUrl, setGeneratedUrl] = useState('');
   const [generatedRedirectUri, setGeneratedRedirectUri] = useState('');
   const [editGeneratedUrl, setEditGeneratedUrl] = useState('');
   const [editGeneratedRedirectUri, setEditGeneratedRedirectUri] = useState('');
   const [oauthCode, setOauthCode] = useState('');
   const [editOauthCode, setEditOauthCode] = useState('');
   const [fetchedToken, setFetchedToken] = useState('');
   const [fetchedEmail, setFetchedEmail] = useState('');
   const [editFetchedToken, setEditFetchedToken] = useState('');
   const [editFetchedEmail, setEditFetchedEmail] = useState('');
   const [oAuthLoading, setOAuthLoading] = useState(false);
   const [editOAuthLoading, setEditOAuthLoading] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', clientId: '', clientSecret: '', refreshToken: '', folderId: '' });
      const [editForm, setEditForm] = useState({ name: '', clientId: '', clientSecret: '', refreshToken: '', folderId: '' });
      
      // Track if we're loading edit form data
      const [editFormLoading, setEditFormLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchDriveStats());
    dispatch(fetchAutoUploadDrive());
  }, [dispatch]);

  useEffect(() => {
    if (addStatus === 'saved') {
      setNotice({ severity: 'success', text: 'Drive added successfully!' });
      setShowAddForm(false);
      setFormData({ name: '', email: '', clientId: '', clientSecret: '', refreshToken: '', folderId: '' });
      setShowToken(false);
      setShowClientSecret(false);
      dispatch(resetAddStatus());
      dispatch(fetchDriveStats());
    } else if (addStatus === 'error') {
      setNotice({ severity: 'error', text: error || 'Failed to add drive.' });
      dispatch(resetAddStatus());
    }
  }, [addStatus, error, dispatch, setNotice]);

  useEffect(() => {
    if (syncStatus === 'error') {
      setNotice({ severity: 'error', text: error || 'Sync failed.' });
      dispatch(resetSyncStatus());
    }
  }, [syncStatus, error, dispatch, setNotice]);

  const handleAddDrive = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.refreshToken.trim()) {
      setNotice({ severity: 'error', text: 'Drive name and refresh token are required.' });
      return;
    }
    dispatch(addDrive({
      name: formData.name.trim(),
      email: formData.email.trim(),
      clientId: formData.clientId.trim() || undefined,
      clientSecret: formData.clientSecret.trim() || undefined,
      refreshToken: formData.refreshToken.trim(),
      folderId: formData.folderId.trim()
    }));
  };

  const handleTogglePool = async (driveId) => {
    try {
      const result = await dispatch(togglePoolDrive(driveId)).unwrap();
      setNotice({ severity: 'success', text: result.message });
      dispatch(fetchDriveStats());
    } catch (err) {
      setNotice({ severity: 'error', text: err || 'Failed to toggle pool membership.' });
    }
  };

  const handleSetPrimary = async (driveId) => {
    try {
      const result = await dispatch(setPrimaryDrive(driveId)).unwrap();
      setNotice({ severity: 'success', text: result.message });
    } catch (err) {
      setNotice({ severity: 'error', text: err || 'Failed to set primary drive.' });
    }
  };

  const handleSetUploadDrive = async (driveId) => {
    try {
      const result = await dispatch(selectUploadDrive(driveId)).unwrap();
      setNotice({ severity: 'success', text: result.message || 'Upload target updated.' });
      dispatch(fetchDriveStats());
      dispatch(fetchAutoUploadDrive());
    } catch (err) {
      setNotice({ severity: 'error', text: err || 'Failed to set upload target drive.' });
    }
  };

  const handleSync = async () => {
    if (!activeDriveId) { setNotice({ severity: 'error', text: 'No primary drive configured.' }); return; }
    setSyncing(true);
    try {
      const result = await dispatch(syncDrive()).unwrap();
      if (result.success) {
        setNotice({ severity: 'success', text: result.message || 'Drive synced successfully!' });
        onSyncFinished?.();
        dispatch(fetchDriveStats());
      } else { setNotice({ severity: 'error', text: result.message || 'Sync failed.' }); }
    } catch (err) { setNotice({ severity: 'error', text: err?.message || err || 'Sync failed.' }); }
    finally { setSyncing(false); }
  };

  const handleSyncAll = async () => {
    const poolDrives = drives.filter(d => d.isActive);
    if (poolDrives.length === 0) { setNotice({ severity: 'error', text: 'No drives in the auto-selection pool.' }); return; }
    setSyncing(true);
    try {
      await dispatch(syncAllDrives()).unwrap();
      setNotice({ severity: 'success', text: 'All pool drives synced!' });
      onSyncFinished?.();
      dispatch(fetchDriveStats());
      dispatch(fetchAutoUploadDrive());
    } catch (err) { setNotice({ severity: 'error', text: err?.message || err || 'Sync all failed.' }); }
    finally { setSyncing(false); }
  };

  const handleEditDrive = async (e) => {
    e.preventDefault();
    if (!editingDrive) return;
    const payload = {};
    if (editForm.name.trim()) payload.name = editForm.name.trim();
    if (editForm.folderId !== undefined) payload.folderId = editForm.folderId.trim();
    if (editForm.clientId.trim()) payload.clientId = editForm.clientId.trim();
    if (editForm.clientSecret.trim()) payload.clientSecret = editForm.clientSecret.trim();
    if (editForm.refreshToken.trim()) payload.refreshToken = editForm.refreshToken.trim();
    try {
      await dispatch(updateDrive({ id: editingDrive._id, ...payload })).unwrap();
      setNotice({ severity: 'success', text: 'Drive updated successfully!' });
      setEditingDrive(null);
      setEditForm({ name: '', clientId: '', clientSecret: '', refreshToken: '', folderId: '' });
      setShowEditToken(false);
      setShowEditSecret(false);
    } catch (err) { setNotice({ severity: 'error', text: err || 'Failed to update drive.' }); }
  };

  const handleDeleteDrive = async (driveId) => {
    try {
      await dispatch(deleteDrive(driveId)).unwrap();
      setNotice({ severity: 'success', text: 'Drive removed successfully.' });
      setShowDeleteConfirm(null);
      dispatch(fetchDriveStats());
    } catch (err) { setNotice({ severity: 'error', text: err || 'Failed to delete drive.' }); }
  };

  const openEditForm = async (drive) => {
    setEditingDrive(drive);
    setShowEditToken(false);
    setShowEditSecret(false);
    setEditGeneratedUrl('');
    setEditOauthCode('');
    setEditFetchedToken('');
    setEditFetchedEmail('');
    
    // Fetch full drive data to get decrypted credentials
    try {
      const fullDrive = await dispatch(fetchDriveById(drive._id)).unwrap();
      if (fullDrive) {
        setEditForm({ 
          name: fullDrive.name || drive.name || '', 
          clientId: fullDrive.clientId || '', 
          clientSecret: fullDrive.clientSecret || '', 
          refreshToken: fullDrive.refreshToken || '', 
          folderId: fullDrive.folderId || drive.folderId || ''
        });
        setEditOauthForm({ 
          clientId: fullDrive.clientId || '', 
          clientSecret: fullDrive.clientSecret || '', 
          redirectUri: '' 
        });
      } else {
        // Fallback to drive object if fetch fails
        setEditForm({ 
          name: drive.name || '', 
          clientId: drive.clientId || '', 
          clientSecret: '', 
          refreshToken: '', 
          folderId: drive.folderId || ''
        });
        setEditOauthForm({ 
          clientId: drive.clientId || '', 
          clientSecret: '', 
          redirectUri: '' 
        });
      }
    } catch (err) {
      console.error('Failed to fetch drive details:', err);
      // Still show form with basic data
      setEditForm({ 
        name: drive.name || '', 
        clientId: drive.clientId || '', 
        clientSecret: '', 
        refreshToken: '', 
        folderId: drive.folderId || ''
      });
      setEditOauthForm({ 
        clientId: drive.clientId || '', 
        clientSecret: '', 
        redirectUri: '' 
      });
    }
  };

const resetAddForm = () => {
     setShowAddForm(false);
     setFormData({ name: '', email: '', clientId: '', clientSecret: '', refreshToken: '', folderId: '' });
     setShowToken(false);
     setShowClientSecret(false);
     setGeneratedUrl('');
     setGeneratedRedirectUri('');
     setOauthCode('');
     setFetchedToken('');
     setFetchedEmail('');
     setOauthForm({ clientId: '', clientSecret: '', redirectUri: '' });
   };

const handleGenerateOAuthUrl = async () => {
     // Send empty strings to let backend use server defaults
     const clientId = oauthForm.clientId.trim() || undefined;
     const clientSecret = oauthForm.clientSecret.trim() || undefined;
     
     setOAuthLoading(true);
     try {
       const result = await dispatch(generateOAuthUrl({
         clientId,
         clientSecret,
         redirectUri: oauthForm.redirectUri.trim() || undefined
       })).unwrap();
       setGeneratedUrl(result.url);
       setGeneratedRedirectUri(result.redirectUri || 'http://localhost:3000/api/auth/google/callback');
       setNotice({ severity: 'success', text: `OAuth URL generated! ${!oauthForm.clientId.trim() ? 'Using server default credentials.' : 'Using provided credentials.'}` });
     } catch (err) { setNotice({ severity: 'error', text: err || 'Failed to generate URL.' }); }
     finally { setOAuthLoading(false); }
   };

const handleExchangeCode = async () => {
      if (!oauthCode.trim()) {
        setNotice({ severity: 'error', text: 'Authorization code is required.' });
        return;
      }
      setOAuthLoading(true);
      try {
        const result = await dispatch(exchangeOAuthCode({
          clientId: oauthForm.clientId.trim() || undefined,
          clientSecret: oauthForm.clientSecret.trim() || undefined,
          code: oauthCode.trim(),
          redirectUri: generatedRedirectUri || oauthForm.redirectUri.trim() || undefined
        })).unwrap();
       setFetchedToken(result.refreshToken);
       setFetchedEmail(result.email || '');
       setFormData(prev => ({ ...prev, refreshToken: result.refreshToken, email: result.email || prev.email, clientId: oauthForm.clientId.trim(), clientSecret: oauthForm.clientSecret.trim() }));
       setNotice({ severity: 'success', text: `Token obtained for ${result.email || 'this account'}! Drive details filled in.` });
       setShowOAuthGenerator(false);
     } catch (err) { setNotice({ severity: 'error', text: err || 'Failed to exchange code.' }); }
    finally { setOAuthLoading(false); }
  };

const handleEditGenerateOAuthUrl = async () => {
     // Send empty strings to let backend use server defaults
     const clientId = editOauthForm.clientId.trim() || undefined;
     const clientSecret = editOauthForm.clientSecret.trim() || undefined;
     
     setEditOAuthLoading(true);
     try {
       const result = await dispatch(generateOAuthUrl({
         clientId,
         clientSecret,
         redirectUri: editOauthForm.redirectUri.trim() || undefined
       })).unwrap();
       setEditGeneratedUrl(result.url);
       setEditGeneratedRedirectUri(result.redirectUri || 'http://localhost:3000/api/auth/google/callback');
       setNotice({ severity: 'success', text: `OAuth URL generated! ${!editOauthForm.clientId.trim() && !editOauthForm.clientSecret.trim() ? 'Using server default credentials.' : 'Using provided credentials.'}` });
     } catch (err) { setNotice({ severity: 'error', text: err || 'Failed to generate URL.' }); }
     finally { setEditOAuthLoading(false); }
   };

const handleEditExchangeCode = async () => {
      if (!editOauthCode.trim()) {
        setNotice({ severity: 'error', text: 'Authorization code is required.' });
        return;
      }
      setEditOAuthLoading(true);
      try {
        const result = await dispatch(exchangeOAuthCode({
          clientId: editOauthForm.clientId.trim() || undefined,
          clientSecret: editOauthForm.clientSecret.trim() || undefined,
          code: editOauthCode.trim(),
          redirectUri: editGeneratedRedirectUri || editOauthForm.redirectUri.trim() || undefined
        })).unwrap();
       setEditFetchedToken(result.refreshToken);
       setEditFetchedEmail(result.email || '');
       setEditForm(prev => ({ ...prev, refreshToken: result.refreshToken, clientId: editOauthForm.clientId.trim(), clientSecret: editOauthForm.clientSecret.trim() }));
       setNotice({ severity: 'success', text: `Token obtained for ${result.email || 'this account'}! Edit form auto-filled.` });
      setShowEditOAuthGenerator(false);
    } catch (err) { setNotice({ severity: 'error', text: err || 'Failed to exchange code.' }); }
    finally { setEditOAuthLoading(false); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setNotice({ severity: 'success', text: 'Copied to clipboard!' });
  };

  const poolDrivesCount = drives.filter(d => d.isActive).length;
  const nonPoolDrivesCount = drives.length - poolDrivesCount;
  const isLoading = status === 'loading';

  return (
    <div className="min-h-[calc(100vh-12rem)] space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">Storage Management</h2>
          <p className="mt-1 text-sm text-slate-500">Manage Google Drive configurations, pool membership, and quota</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { resetAddForm(); setShowAddForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">
            <Plus className="h-4 w-4" /> Add Drive
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Google Cloud Setup Guide (Click to expand)</span>
            <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-3 text-xs text-slate-600 dark:text-slate-400">
            <p><strong>Before adding a drive:</strong></p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a> and use existing or create new project
              </li>
              <li>
                <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Enable Google Drive API</a> for your project
              </li>
              <li>
                Go to <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OAuth Consent Screen</a> - add app name, support email, add your Google account as test user
              </li>
              <li>
                In <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Credentials</a>, create OAuth 2.0 Client ID (Web application)
              </li>
              <li>
                Add redirect URI: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">http://localhost:3000/api/auth/google/callback</code>
              </li>
              <li>Copy Client ID and Client Secret - use them in the "Add Drive" form (or leave empty to use server defaults)</li>
              <li>Click "Get Token" in Add Drive form to start OAuth flow for your Google account</li>
            </ol>
            <p className="text-rose-600 dark:text-rose-400"><strong>Note:</strong> If OAuth returns no refresh_token, remove app access at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Permissions</a> and retry.</p>
          </div>
        </details>
      </div>

      {stats?.totalDrives > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Storage</p>
            <p className="mt-1 font-display text-xl font-black text-slate-900 dark:text-white">{formatBytes(stats.totalStorage)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Used Storage</p>
            <p className="mt-1 font-display text-xl font-black text-slate-900 dark:text-white">{formatBytes(stats.totalUsage)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Available</p>
            <p className="mt-1 font-display text-xl font-black text-slate-900 dark:text-white">{formatBytes(stats.totalAvailable)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Files</p>
            <p className="mt-1 font-display text-xl font-black text-slate-900 dark:text-white">{stats.totalFiles.toLocaleString()}</p>
          </div>
        </div>
      )}

      {drives.filter(d => d.syncErrors > 0 && String(d._id) !== String(activeDriveId)).length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold text-rose-700 dark:text-rose-400">Expired Refresh Tokens Detected</p>
              <p className="text-sm text-rose-600 mt-1">Some drives have expired or invalid refresh tokens. Click "Get Token" to obtain a fresh token for each affected drive.</p>
            </div>
          </div>
        </div>
      )}

      {showOAuthGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Get Refresh Token — Step by Step</h3>
              <button onClick={() => { setShowOAuthGenerator(false); setGeneratedUrl(''); setGeneratedRedirectUri(''); setOauthCode(''); setFetchedToken(''); setOauthForm({ clientId: '', clientSecret: '', redirectUri: '' }); }} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            {/* Step progress indicator */}
            <div className="flex items-center gap-1 mb-4 text-xs font-bold text-slate-500">
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-full", !generatedUrl ? "bg-blue-600 text-white" : "bg-emerald-100 text-emerald-700")}>1</span>
              <span className="h-px w-8 bg-slate-300" />
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-full", generatedUrl && !fetchedToken ? "bg-blue-600 text-white" : fetchedToken ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>2</span>
              <span className="h-px w-8 bg-slate-300" />
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-full", fetchedToken ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400")}>3</span>
            </div>

            <div className="space-y-4">
              {/* STEP 1: Enter credentials */}
              <div className={cn("rounded-xl border p-4 transition-all", !generatedUrl ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20" : "border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-900/50")}>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-3">Step 1: Enter OAuth Credentials</p>
                <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside mb-3">
                  <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Credentials</a></li>
                  <li>Create <strong>OAuth 2.0 Client ID</strong> (Web application) if not already done</li>
                  <li>Add redirect URI: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">http://localhost:3000/api/auth/google/callback</code></li>
                  <li>Go to <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OAuth Consent Screen</a> and add your Google email as <strong>Test user</strong></li>
                  <li>Copy the <strong>Client ID</strong> and <strong>Client Secret</strong> below</li>
                </ol>
                <div className="space-y-3">
                  <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Google Cloud Client ID <span className="text-slate-400">(optional)</span></label><input type="text" value={oauthForm.clientId} onChange={(e) => setOauthForm({ ...oauthForm, clientId: e.target.value })} placeholder="Leave empty to use server defaults" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /></div>
                  <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Client Secret <span className="text-slate-400">(optional)</span></label><input type="text" value={oauthForm.clientSecret} onChange={(e) => setOauthForm({ ...oauthForm, clientSecret: e.target.value })} placeholder="Leave empty to use server defaults" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /></div>
                  <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Redirect URI</label><input type="text" value={oauthForm.redirectUri} onChange={(e) => setOauthForm({ ...oauthForm, redirectUri: e.target.value })} placeholder="http://localhost:3000/api/auth/google/callback" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /></div>
                </div>
                {!generatedUrl && (<Button type="button" onClick={handleGenerateOAuthUrl} disabled={oAuthLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-3">{oAuthLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Globe className="h-4 w-4" /> Generate OAuth URL</>}</Button>)}
              </div>

              {/* STEP 2: Open URL and paste code */}
              {generatedUrl && (<>
                <div className={cn("rounded-xl border p-4 transition-all", !fetchedToken ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20" : "border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-900/50")}>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-3">Step 2: Authorize your Google Account</p>
                  <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside mb-3">
                    <li>Click <strong>"Open in new tab"</strong> below or copy the URL</li>
                    <li>Sign in with the <strong>Google account</strong> you want to use as Drive storage</li>
                    <li>Click <strong>"Continue"</strong> to grant permissions</li>
                    <li>You'll be redirected to a URL — <strong>copy that entire URL</strong> from the browser address bar</li>
                    <li>Paste it in the field below (or just paste the <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">code</code> parameter)</li>
                  </ol>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">Open this URL in a browser</label>
                    <div className="flex gap-2"><input type="text" value={generatedUrl} readOnly className="flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-mono dark:border-emerald-700 dark:bg-slate-950" /><button onClick={() => copyToClipboard(generatedUrl)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">Copy</button></div>
                    <a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"><ExternalLink className="h-3 w-3" /> Open in new tab</a>
                  </div>
                  <div className="mt-3"><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Paste the redirect URL or authorization code</label><input type="text" value={oauthCode} onChange={(e) => setOauthCode(e.target.value)} placeholder='Paste the full redirect URL or just the "code" parameter' className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /></div>
                  <Button type="button" onClick={handleExchangeCode} disabled={oAuthLoading || !oauthCode} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-3">{oAuthLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Exchanging...</> : <><Key className="h-4 w-4" /> Get Refresh Token</>}</Button>
                </div>
              </>)}

              {/* STEP 3: Done */}
              {fetchedToken && (
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">Step 3: ✓ Done!</p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Refresh token obtained successfully!</p>
                  <p className="text-xs text-emerald-600 mt-1">Account: {fetchedEmail}</p>
                  <p className="text-xs text-emerald-600 mt-1">The Add Drive form has been auto-filled. Just click <strong>"Save Drive"</strong> below.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-6 shadow-sm dark:border-blue-800 dark:bg-blue-950/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Add New Drive</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowOAuthGenerator(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Key className="h-3 w-3" /> Get Token</button>
              <button onClick={resetAddForm} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
          </div>
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">📋 Complete step-by-step guide to add a Google Drive:</p>
            <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside">
              <li><strong>Google Cloud Console:</strong> Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Credentials</a> → <strong>+ CREATE CREDENTIALS</strong> → <strong>OAuth 2.0 Client ID</strong> (Web application)</li>
              <li>Add redirect URI: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">http://localhost:3000/api/auth/google/callback</code> and click <strong>CREATE</strong></li>
              <li><strong>Copy</strong> the <strong>Client ID</strong> and <strong>Client Secret</strong> that appear after creation</li>
              <li>Go to <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OAuth Consent Screen</a> → <strong>Test users</strong> → <strong>+ ADD USERS</strong> → add <strong>your Google email</strong> (⚠️ required otherwise 403 error!)</li>
              <li>Back here: enter <strong>Drive Name</strong> below, then click <strong>"Get Token"</strong> button above</li>
              <li>In the popup: paste your <strong>Client ID</strong> & <strong>Client Secret</strong> (or leave empty to use .env defaults), click <strong>"Generate OAuth URL"</strong></li>
              <li>Click <strong>"Open in new tab"</strong> → sign in with your Google account → grant permissions → <strong>copy the redirect URL</strong></li>
              <li>Paste the URL in the popup → click <strong>"Get Refresh Token"</strong> → form auto-fills → click <strong>"Save Drive"</strong></li>
            </ol>
          </div>
          <form onSubmit={handleAddDrive} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Drive Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Primary Storage" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" required /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Google Account Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Auto-detected from token" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /></div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">OAuth Credentials</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Client ID <span className="text-xs font-normal lowercase text-slate-400">(optional)</span></label><input type="text" value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} placeholder="Server default" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /></div>
                <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Client Secret <span className="text-xs font-normal lowercase text-slate-400">(optional)</span></label>
                  <div className="relative"><input type={showClientSecret ? 'text' : 'password'} value={formData.clientSecret} onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })} placeholder="Server default" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /><button type="button" onClick={() => setShowClientSecret(!showClientSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                </div>
              </div>
            </div>
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Refresh Token *</label>
              <div className="relative"><input type={showToken ? 'text' : 'password'} value={formData.refreshToken} onChange={(e) => setFormData({ ...formData, refreshToken: e.target.value })} placeholder="From OAuth flow" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" required /><button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </div>
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Folder ID <span className="text-xs font-normal lowercase text-slate-400">(optional)</span></label><input type="text" value={formData.folderId} onChange={(e) => setFormData({ ...formData, folderId: e.target.value })} placeholder="Root" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /></div>
            <div className="flex gap-2 justify-end"><Button type="button" variant="secondary" onClick={resetAddForm}>Cancel</Button><Button type="submit" variant="primary" disabled={addStatus === 'saving'}>{addStatus === 'saving' ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Drive</>}</Button></div>
          </form>
        </div>
      )}

      {drives.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Auto-Selection Pool:</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{poolDrivesCount} in pool</span>
            {nonPoolDrivesCount > 0 && <span className="text-sm text-slate-400">({nonPoolDrivesCount} inactive)</span>}
          </div>
<div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Auto-Switch at 90%</span>
              <button
                type="button"
                role="switch"
                aria-checked={!activeDriveId}
                onClick={async () => {
                  if (activeDriveId) {
                    // Currently have a specific upload target - disable auto-switch by clearing it
                    try {
                      await dispatch(selectUploadDrive(null)).unwrap();
                      dispatch(fetchAutoUploadDrive());
                      setNotice({ severity: 'success', text: 'Auto-switch enabled. System will switch drives at 90% capacity.' });
                    } catch (err) {
                      setNotice({ severity: 'error', text: err || 'Failed to enable auto-switch.' });
                    }
                  } else {
                    // No upload target - auto-switch already enabled
                    setNotice({ severity: 'success', text: 'Auto-switch is already enabled (no specific upload target).' });
                  }
                }}
                className={cn(
                  'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors',
                  !activeDriveId ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform',
                    !activeDriveId ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
        </div>
      )}

      {drives.map((drive) => {
        const isPrimary = drive._id === activeDriveId;
        const driveLimit = Number(drive.storage?.limit || 0);
        const driveUsage = Number(drive.storage?.usage || 0);
        const drivePct = Number(drive.storage?.percentage || 0);

        return (
          <div key={drive._id} className="rounded-2xl border border-slate-200/80 bg-white/50 p-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', drive.isActive ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-500')}>
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">{drive.name}</h3>
                    {isPrimary && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"><Zap className="h-3 w-3" /> Primary</span>}
                    {drive.isActive && !isPrimary && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">In Pool</span>}
                    {!drive.isActive && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">Not in Pool</span>}
                    {drive.syncErrors > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">Token Expired</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{drive.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Show Data Toggle */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => dispatch(setDriveDataView(String(drive._id)))}
                    className={cn(
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200',
                      selectedDriveIds.includes(String(drive._id)) ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-200',
                        selectedDriveIds.includes(String(drive._id)) ? 'left-[18px]' : 'left-0.5'
                      )}
                    />
                  </button>
                  <span className={cn(
                    'text-[10px] font-bold whitespace-nowrap',
                    selectedDriveIds.includes(String(drive._id)) ? 'text-blue-600' : 'text-slate-400'
                  )}>Show Data</span>
                </div>
                {/* Active Drive Toggle - sets upload target */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSetUploadDrive(drive._id)}
                    className={cn(
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200',
                      isPrimary ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-200',
                        isPrimary ? 'left-[18px]' : 'left-0.5'
                      )}
                    />
                  </button>
                  <span className={cn(
                    'text-[10px] font-bold whitespace-nowrap',
                    isPrimary ? 'text-emerald-600' : 'text-slate-400'
                  )}>Active</span>
                </div>
                <Button
                  variant={drive.isActive ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => handleTogglePool(drive._id)}
                  className="text-xs"
                >
                  {drive.isActive ? 'Remove from Pool' : 'Add to Pool'}
                </Button>
                <button onClick={() => openEditForm(drive)} type="button" className="rounded-lg p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"><Edit3 className="h-4 w-4" /></button>
                {drives.length > 1 && <button onClick={() => setShowDeleteConfirm(drive._id)} className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"><Trash2 className="h-4 w-4" /></button>}
              </div>
            </div>

            {driveLimit > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-500">{formatBytes(driveUsage)} used</span>
                  <span className="text-xs font-medium text-slate-500">of {formatBytes(driveLimit)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className={cn('h-full transition-all duration-500 rounded-full', drivePct > 90 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : drivePct > 70 ? 'bg-gradient-to-r from-blue-500 to-amber-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500')} style={{ width: `${Math.min(drivePct, 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-right text-slate-400">{drivePct.toFixed(1)}% used</p>
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {drive.email}</div>
              <div className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> {drive.lastSynced ? formatDate(drive.lastSynced) : 'Never'}</div>
              <div className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {drive.syncErrors ?? 0} errors</div>
              <div className="flex items-center gap-1"><FolderOpen className="h-3 w-3" /> {drive.folderId || 'Root'}</div>
            </div>
          </div>
        );
      })}

      {isLoading && drives.length === 0 && (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /><span className="ml-3 text-slate-500">Loading drive status...</span></div>
      )}
      {!isLoading && drives.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/30 p-12 text-center dark:border-slate-700 dark:bg-slate-900/20">
          <HardDrive className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-bold text-slate-700 dark:text-slate-300">No Drives Configured</h3>
          <p className="mt-1 text-sm text-slate-500">Click "Add Drive" to configure your first Google Drive storage.</p>
        </div>
      )}

      {editingDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Edit Drive</h3>
              <button onClick={() => { setEditingDrive(null); setShowEditToken(false); setShowEditSecret(false); }} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditDrive} className="space-y-4">
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Drive Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Folder ID</label><input type="text" value={editForm.folderId || ''} onChange={(e) => setEditForm({ ...editForm, folderId: e.target.value })} placeholder="Root" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /></div>
              {editingDrive?.isOwnerConfigured && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-xs text-blue-700 dark:border-blue-700 dark:bg-blue-950/20 dark:text-blue-300">
                  This drive uses server default Google OAuth credentials from environment variables. Leave Client ID and Client Secret empty to use defaults.
                </div>
              )}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Credentials <span className="text-xs font-normal lowercase">(leave empty to keep current)</span></p>
<button type="button" onClick={() => {
                     // Pre-fill OAuth form with current drive credentials (from editForm if set, otherwise from the drive)
                     setEditOauthForm({
                       clientId: editForm.clientId || editingDrive?.clientId || '',
                       clientSecret: editForm.clientSecret || '',
                       redirectUri: ''
                     });
                     setShowEditOAuthGenerator(true);
                   }} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Key className="h-3 w-3" /> Get New Token</button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Client ID</label>
                <div className="relative">
                  <input type="text" value={editForm.clientId || ''} onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })} placeholder="Keep current" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" />
                  {!editForm.clientId && editingDrive?.clientId && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded dark:bg-emerald-950/30 dark:text-emerald-400">Config exist</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Client Secret</label>
                <div className="relative">
                  <input type={showEditSecret ? 'text' : 'password'} value={editForm.clientSecret} onChange={(e) => setEditForm({ ...editForm, clientSecret: e.target.value })} placeholder="Keep current" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" />
                  <button type="button" onClick={() => setShowEditSecret(!showEditSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showEditSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Refresh Token</label>
                <div className="relative">
                  <input type={showEditToken ? 'text' : 'password'} value={editForm.refreshToken} onChange={(e) => setEditForm({ ...editForm, refreshToken: e.target.value })} placeholder={editingDrive?.email ? `Token for ${editingDrive.email}` : "Keep current (hidden for security)"} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" />
                  <button type="button" onClick={() => setShowEditToken(!showEditToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showEditToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">Token is hidden for security. Leave empty to keep the existing token. Use "Get New Token" below to replace it.</p>
              </div>
              <div className="flex gap-2 justify-end pt-2"><Button type="button" variant="secondary" onClick={() => { setEditingDrive(null); setShowEditToken(false); setShowEditSecret(false); }}>Cancel</Button><Button type="submit" variant="primary"><Save className="h-4 w-4" /> Save Changes</Button></div>
            </form>
          </div>
        </div>
      )}

      {showEditOAuthGenerator && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Get New Refresh Token</h3>
              <button onClick={() => { setShowEditOAuthGenerator(false); setEditGeneratedUrl(''); setEditGeneratedRedirectUri(''); setEditOauthCode(''); setEditFetchedToken(''); setEditOauthForm({ clientId: '', clientSecret: '', redirectUri: '' }); }} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Generate a new refresh token for this drive. The old token will stay until you save changes.</p>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Google Cloud Client ID <span className="text-slate-400">(optional)</span></label><input type="text" value={editOauthForm.clientId} onChange={(e) => setEditOauthForm({ ...editOauthForm, clientId: e.target.value })} placeholder="Leave empty to use server defaults" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /><p className="text-[10px] text-slate-400 mt-1">If leaving empty, ensure GOOGLE_CLIENT_ID is set in .env and redirect URI matches.</p></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Client Secret <span className="text-slate-400">(optional)</span></label><input type="text" value={editOauthForm.clientSecret} onChange={(e) => setEditOauthForm({ ...editOauthForm, clientSecret: e.target.value })} placeholder="Leave empty to use server defaults" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Redirect URI</label><input type="text" value={editOauthForm.redirectUri} onChange={(e) => setEditOauthForm({ ...editOauthForm, redirectUri: e.target.value })} placeholder="http://localhost:3000/api/auth/google/callback" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /></div>
              {!editGeneratedUrl && (<Button type="button" onClick={handleEditGenerateOAuthUrl} disabled={editOAuthLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">{editOAuthLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Globe className="h-4 w-4" /> Generate OAuth URL</>}</Button>)}
              {editGeneratedUrl && (<>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">Open this URL in a browser</label>
                  <div className="flex gap-2"><input type="text" value={editGeneratedUrl} readOnly className="flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-mono dark:border-emerald-700 dark:bg-slate-950" /><button onClick={() => copyToClipboard(editGeneratedUrl)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">Copy</button></div>
                  <a href={editGeneratedUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"><ExternalLink className="h-3 w-3" /> Open in new tab</a>
                </div>
                <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Paste the authorization code from URL</label><input type="text" value={editOauthCode} onChange={(e) => setEditOauthCode(e.target.value)} placeholder='Paste the "code" parameter' className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /></div>
                <Button type="button" onClick={handleEditExchangeCode} disabled={editOAuthLoading || !editOauthCode} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">{editOAuthLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Exchanging...</> : <><Key className="h-4 w-4" /> Get Refresh Token</>}</Button>
              </>)}
              {editFetchedToken && (<div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20"><p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">✓ New token obtained! Edit form auto-filled.</p><p className="text-xs text-emerald-600 mt-1">Account: {editFetchedEmail}</p></div>)}
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"><AlertTriangle className="h-5 w-5" /></div>
              <div><h3 className="font-bold text-slate-900 dark:text-white">Delete Drive</h3><p className="text-sm text-slate-500">This action cannot be undone.</p></div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{drives.find(d => d._id === showDeleteConfirm)?.name}</strong>?</p>
            <div className="flex gap-2 justify-end"><Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button><Button variant="danger" onClick={() => handleDeleteDrive(showDeleteConfirm)} className="!bg-rose-600 !text-white hover:!bg-rose-700"><Trash2 className="h-4 w-4" /> Delete</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoogleDriveIntegrationTab;