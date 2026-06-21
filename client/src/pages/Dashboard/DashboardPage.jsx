import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CloudUpload,
  LayoutDashboard,
  Table,
  HardDrive,
  Settings,
  Activity,
  ShieldAlert,
  Home,
} from 'lucide-react';
import { fetchUsers } from '../../features/auth/authSlice';
import { fetchDriveStatus, fetchShowDataSelection } from '../../features/drives/drivesSlice';
import { fetchFiles } from '../../features/files/filesSlice';
import { fetchActivities } from '../../features/activities/activitiesSlice';
import { fetchSettings } from '../../features/settings/settingsSlice';
import { cn } from '../../lib/utils';
import { OverviewTab } from './OverviewTab';
import UploadManagementtab from './UploadManagementtab';
import { GoogleDriveIntegrationTab } from './GoogleDriveIntegrationTab';
import { SettingsTab } from './SettingsTab';
import { ActivityLogsTab } from './ActivityLogsTab';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, theme: 'section-blue-light' },
  { id: 'management', label: 'Upload Management', icon: Table, theme: 'section-green-light' },
  { id: 'drive', label: 'Storage Management', icon: HardDrive, theme: 'section-blue-light' },
  { id: 'settings', label: 'Settings', icon: Settings, theme: 'section-yellow-light' },
  { id: 'logs', label: 'Activity Logs', icon: Activity, theme: 'bg-slate-50 dark:bg-slate-950' },
];

export default function DashboardPage({ setNotice }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { drives = [], activeDrive, activeDriveId, selectedDriveIds = [] } = useSelector((state) => state.drives);
  const { items: files = [], status: filesStatus } = useSelector((state) => state.files);
  const { items: activities = [], status: activitiesStatus } = useSelector((state) => state.activities);
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('dashboardActiveTab') || 'overview');

const drivesLoaded = drives.length > 0;
   // Show Data toggle logic:
   // - No drives loaded yet → don't fetch (wait for fetchDriveStatus)
   // - All OFF (selectedDriveIds = []) → ['none'] → empty result
   // - Some ON (selectedDriveIds has IDs) → pass selected IDs
   const effectiveDriveIds = (!drivesLoaded || selectedDriveIds.length === 0) ? ['none'] : selectedDriveIds;

  useEffect(() => {
    if (!user || !isAdmin) return;
    dispatch(fetchDriveStatus());
    dispatch(fetchUsers());
    dispatch(fetchSettings());
    dispatch(fetchShowDataSelection());
  }, [dispatch, user, isAdmin]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    dispatch(fetchFiles(effectiveDriveIds));
    dispatch(fetchActivities(effectiveDriveIds));
  }, [dispatch, user, isAdmin, drivesLoaded, effectiveDriveIds.join(',')]);

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gd-blue p-6 text-center text-white dark:bg-blue-900">
        <CloudUpload className="h-16 w-16" />
        <h2 className="font-display mt-6 text-2xl font-black">Admin Login Required</h2>
        <p className="mt-2 max-w-md text-white/80">Sign in with an administrator account to access the upload dashboard.</p>
        <Link to="/login" className="gd-btn-yellow mt-8">Go to Login</Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gd-yellow p-6 text-center text-slate-900 dark:bg-yellow-900 dark:text-slate-100">
        <ShieldAlert className="h-16 w-16 text-gd-yellow-dark dark:text-yellow-300" />
        <h2 className="font-display mt-6 text-2xl font-black">Admin Dashboard Only</h2>
        <p className="mt-2 max-w-md text-slate-700 dark:text-slate-200">
          Regular user accounts cannot access the dashboard. Your admin uploads and manages files on your behalf.
        </p>
        <Link to="/" className="gd-btn-blue mt-8 inline-flex items-center gap-2">
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const activeTheme = activeTab === 'management'
    ? 'bg-white dark:bg-slate-950'
    : tabs.find((t) => t.id === activeTab)?.theme || 'bg-slate-50 dark:bg-slate-950';
  const panelClass = 'w-full min-h-[calc(100vh-12rem)] px-8 py-8 sm:px-10 lg:px-16';
  const loadingActivities = activitiesStatus === 'loading';

  const refreshActivities = () => dispatch(fetchActivities(effectiveDriveIds));

  // Get selected drives info for display
  const selectedDrives = drives.filter(d => selectedDriveIds.includes(String(d._id)));

  return (
    <div className="flex min-h-screen flex-col dark:bg-slate-950">
      {/* Tab Bar */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveTab(tab.id); localStorage.setItem('dashboardActiveTab', tab.id); }}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                    activeTab === tab.id
                      ? 'bg-gd-blue text-white shadow-gd-blue'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-screen tab panels */}
      <div className={cn('flex-1 w-full min-h-[calc(100vh-12rem)]', activeTheme)}>
        <div className={cn(panelClass)}>
          {activeTab === 'overview' && (
            <OverviewTab
              files={files}
              activities={activities}
              loadingActivities={loadingActivities}
              failedUploads={selectedDrives.reduce((sum, d) => sum + (d.syncErrors || 0), 0)}
              activeDriveId={activeDriveId}
              activeDrive={activeDrive}
              selectedDrives={selectedDrives}
            />
          )}
          {activeTab === 'management' && (
            <UploadManagementtab activeDriveId={activeDriveId} activeDrive={activeDrive} selectedDriveIds={selectedDriveIds} selectedDrives={selectedDrives} />
          )}
          {activeTab === 'drive' && (
            <GoogleDriveIntegrationTab setNotice={setNotice} onSyncFinished={refreshActivities} />
          )}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'logs' && (
            <ActivityLogsTab
              activities={activities}
              loading={loadingActivities}
              onRefresh={refreshActivities}
              globalSearch=""
              activeDriveId={activeDriveId}
              activeDrive={activeDrive}
              selectedDrives={selectedDrives}
            />
          )}
        </div>
      </div>
    </div>
  );
}