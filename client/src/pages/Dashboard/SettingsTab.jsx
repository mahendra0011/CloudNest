import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '../../lib/utils';
import {
  User,
  Lock,
  Bell,
  Mail,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  FileText,
  HardDrive,
} from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import {
  fetchSettings,
  updateSettings,
  resetSettingsStatus,
} from '../../features/settings/settingsSlice.js';
import { updateProfile, changePassword } from '../../features/auth/authSlice.js';

export function SettingsTab() {
  const dispatch = useDispatch();
  const { data: settings, status, loaded, saveStatus, error: settingsError } = useSelector((state) => state.settings);
  const { user, error: authError } = useSelector((state) => state.auth);

  // Name state
  const [name, setName] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState(null);

  useEffect(() => {
    if (!loaded && status === 'idle') {
      dispatch(fetchSettings());
    }
  }, [dispatch, loaded, status]);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    if (saveStatus !== 'idle' && saveStatus !== 'saving') {
      const timer = setTimeout(() => dispatch(resetSettingsStatus()), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, dispatch]);

  const updateField = useCallback(
    (field, value) => {
      dispatch(updateSettings({ [field]: value }));
    },
    [dispatch]
  );

  // File type options
  const FILE_TYPE_OPTIONS = [
    { value: 'images', label: 'Images', description: 'PNG, JPG, GIF, WEBP, SVG' },
    { value: 'documents', label: 'Documents', description: 'PDF, DOCX, XLSX, PPTX' },
    { value: 'videos', label: 'Videos', description: 'MP4, WEBM, AVI, MKV, MOV' },
    { value: 'audio', label: 'Audio', description: 'MP3, WAV, OGG, AAC' },
    { value: 'archives', label: 'Archives', description: 'ZIP, RAR, 7Z, TAR, GZ' },
  ];

  // Update Name
  const handleUpdateName = async () => {
    if (!name || name.trim().length < 2) {
      setNameMsg({ type: 'error', text: 'Name must be at least 2 characters' });
      return;
    }
    setNameSaving(true);
    setNameMsg(null);
    try {
      const result = await dispatch(updateProfile({ name: name.trim() })).unwrap();
      setNameMsg({ type: 'success', text: 'Name updated successfully!' });
    } catch (err) {
      setNameMsg({ type: 'error', text: err || 'Failed to update name' });
    } finally {
      setNameSaving(false);
      setTimeout(() => setNameMsg(null), 3000);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPassMsg({ type: 'error', text: 'All password fields are required' });
      return;
    }
    if (newPassword.length < 5) {
      setPassMsg({ type: 'error', text: 'New password must be at least 5 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setPassSaving(true);
    setPassMsg(null);
    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      setPassMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassMsg({ type: 'error', text: err || 'Failed to change password' });
    } finally {
      setPassSaving(false);
      setTimeout(() => setPassMsg(null), 3000);
    }
  };

  const Toggle = ({ checked, onChange, label }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
        checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );

  if (status === 'loading' && !loaded) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] space-y-6">
      <div>
        <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 5. Max Upload Size */}
        <div className="gd-card-solid">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-100 dark:bg-teal-950/30 dark:text-teal-400 dark:ring-teal-900/30">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white">Max Upload Size</h3>
              <p className="text-xs text-slate-500">Set the maximum file size limit for uploads (in MB)</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="1000"
                value={settings.maxFileSize || 250}
                onChange={(e) => updateField('maxFileSize', parseInt(e.target.value) || 250)}
                className="w-32 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
              <span className="text-sm font-medium text-slate-500">MB</span>
            </div>
            <p className="text-xs text-slate-400">Default: 250 MB. Maximum allowed: 1000 MB.</p>
            {saveStatus === 'saving' && (
              <p className="text-xs text-blue-600 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</p>
            )}
            {saveStatus === 'saved' && (
              <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Saved</p>
            )}
          </div>
        </div>

        {/* 6. Allowed File Types */}
        <div className="gd-card-solid">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:ring-indigo-900/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white">Allowed File Types</h3>
              <p className="text-xs text-slate-500">Select which file categories are permitted for upload</p>
            </div>
          </div>
          <div className="space-y-2">
            {FILE_TYPE_OPTIONS.map((opt) => {
              const isEnabled = !settings.allowedTypes || settings.allowedTypes.includes(opt.value);
              return (
                <div key={opt.value} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.description}</p>
                    </div>
                  </div>
                  <Toggle
                    checked={isEnabled}
                    onChange={() => {
                      const current = settings.allowedTypes || ['images', 'documents', 'videos', 'audio', 'archives'];
                      const updated = isEnabled
                        ? current.filter((t) => t !== opt.value)
                        : [...current, opt.value];
                      updateField('allowedTypes', updated);
                    }}
                  />
                </div>
              );
            })}
            <p className="text-xs text-slate-400 mt-2">Each type controls what file extensions and MIME types are accepted during upload.</p>
            {saveStatus === 'saving' && (
              <p className="text-xs text-blue-600 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</p>
            )}
            {saveStatus === 'saved' && (
              <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Saved</p>
            )}
          </div>
        </div>

        {/* 1. Update Name */}
        <div className="gd-card-solid">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-900/30">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white">Update Name</h3>
              <p className="text-xs text-slate-500">Change your display name</p>
            </div>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
            {nameMsg && (
              <p className={cn('text-xs font-semibold flex items-center gap-1', nameMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600')}>
                {nameMsg.type === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {nameMsg.text}
              </p>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdateName}
              disabled={nameSaving}
              className="w-full"
            >
              {nameSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {nameSaving ? 'Saving...' : 'Update Name'}
            </Button>
          </div>
        </div>

        {/* 2. Change Password */}
        <div className="gd-card-solid">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:ring-rose-900/30">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white">Change Password</h3>
              <p className="text-xs text-slate-500">Update your account password</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm pr-10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 5 characters)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
            {passMsg && (
              <p className={cn('text-xs font-semibold flex items-center gap-1', passMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600')}>
                {passMsg.type === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {passMsg.text}
              </p>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={handleChangePassword}
              disabled={passSaving}
              className="w-full"
            >
              {passSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {passSaving ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </div>

        {/* 3. Notification Toggle */}
        <div className="gd-card-solid">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-900/30">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white">Notifications</h3>
              <p className="text-xs text-slate-500">Toggle all notifications on/off</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Enable Notifications</p>
                <p className="text-xs text-slate-500">Receive alerts for uploads and activity</p>
              </div>
            </div>
            <Toggle
              checked={settings.notificationsEnabled !== false}
              onChange={() => updateField('notificationsEnabled', settings.notificationsEnabled === false)}
            />
          </div>
          {saveStatus === 'saving' && (
            <p className="mt-2 text-xs text-blue-600 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</p>
          )}
          {saveStatus === 'saved' && (
            <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Saved</p>
          )}
        </div>

        {/* 4. Send Upload Email Toggle */}
        <div className="gd-card-solid">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:ring-purple-900/30">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white">Upload Email Alerts</h3>
              <p className="text-xs text-slate-500">Send email when files are uploaded</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Send Upload Email</p>
                <p className="text-xs text-slate-500">Get email via Brevo when a file is uploaded for you</p>
              </div>
            </div>
            <Toggle
              checked={settings.sendUploadEmail !== false}
              onChange={() => updateField('sendUploadEmail', settings.sendUploadEmail === false)}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Uses Brevo (Sendinblue) API — configure BREVO_API_KEY in server .env
          </p>
          {saveStatus === 'saving' && (
            <p className="mt-2 text-xs text-blue-600 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</p>
          )}
          {saveStatus === 'saved' && (
            <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Saved</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsTab;