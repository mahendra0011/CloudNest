import React, { useState } from 'react';
import { LayoutDashboard, Table, HardDrive, Settings, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { DemoOverviewTab } from './demo-dashboard/DemoOverviewTab.jsx';
import { DemoGoogleDriveIntegrationTab } from './demo-dashboard/DemoGoogleDriveIntegrationTab.jsx';
import DemoSettingsTab from './demo-dashboard/DemoSettingsTab.jsx';
import DemoUploadManagementtab from './demo-dashboard/DemoUploadManagementtab.jsx';
import DemoActivityLogsTab from './demo-dashboard/DemoActivityLogsTab.jsx';

const DEMO_DRIVES = [
  { _id: 'demo-drive-1', name: 'Demo Primary Drive', email: 'demo-admin@example.com', isActive: true, storage: { limit: '16106127360', usage: '4294967296', percentage: 27 }, lastSynced: new Date(Date.now() - 1000 * 60 * 15), syncErrors: 0 },
  { _id: 'demo-drive-2', name: 'Demo Backup Drive', email: 'demo-backup@example.com', isActive: true, storage: { limit: '10737418240', usage: '7516192768', percentage: 70 }, lastSynced: new Date(Date.now() - 1000 * 60 * 60 * 2), syncErrors: 0 },
];

const DEMO_FILES = [
  { id: 'demo-file-1', originalName: 'demo_invoice.pdf', mimeType: 'application/pdf', size: 245760, category: 'document', driveFileId: 'demo-gfile-1', webViewLink: 'https://drive.google.com/file/d/demo1/view', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), user: { id: 'demo-user-1', name: 'Demo User 1', email: 'demo-user1@example.com' }, drive: { id: 'demo-drive-1', name: 'Demo Primary Drive' } },
  { id: 'demo-file-2', originalName: 'demo_banner.png', mimeType: 'image/png', size: 1048576, category: 'image', driveFileId: 'demo-gfile-2', webViewLink: 'https://drive.google.com/file/d/demo2/view', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), user: { id: 'demo-user-2', name: 'Demo User 2', email: 'demo-user2@example.com' }, drive: { id: 'demo-drive-1', name: 'Demo Primary Drive' } },
  { id: 'demo-file-3', originalName: 'demo_video.mp4', mimeType: 'video/mp4', size: 52428800, category: 'video', driveFileId: 'demo-gfile-3', webViewLink: 'https://drive.google.com/file/d/demo3/view', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), user: { id: 'demo-user-3', name: 'Demo User 3', email: 'demo-user3@example.com' }, drive: { id: 'demo-drive-2', name: 'Demo Backup Drive' } },
  { id: 'demo-file-4', originalName: 'demo_backup.zip', mimeType: 'application/zip', size: 104857600, category: 'archive', driveFileId: 'demo-gfile-4', webViewLink: 'https://drive.google.com/file/d/demo4/view', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), user: { id: 'demo-user-1', name: 'Demo User 1', email: 'demo-user1@example.com' }, drive: { id: 'demo-drive-1', name: 'Demo Primary Drive' } },
  { id: 'demo-file-5', originalName: 'demo_profile.pdf', mimeType: 'application/pdf', size: 1572864, category: 'document', driveFileId: 'demo-gfile-5', webViewLink: 'https://drive.google.com/file/d/demo5/view', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), user: { id: 'demo-user-4', name: 'Demo User 4', email: 'demo-user4@example.com' }, drive: { id: 'demo-drive-2', name: 'Demo Backup Drive' } },
];

const DEMO_ACTIVITIES = [
  { _id: 'demo-act-1', action: 'upload', userEmail: 'demo-user1@example.com', userName: 'Demo User 1', details: 'Uploaded demo_invoice.pdf', createdAt: new Date(Date.now() - 1000 * 60 * 30) },
  { _id: 'demo-act-2', action: 'upload', userEmail: 'demo-user2@example.com', userName: 'Demo User 2', details: 'Uploaded demo_banner.png', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { _id: 'demo-act-3', action: 'download', userEmail: 'demo-user3@example.com', userName: 'Demo User 3', details: 'Downloaded demo_video.mp4', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  { _id: 'demo-act-4', action: 'sync', userEmail: 'demo-admin@example.com', userName: 'Demo Admin', details: 'Drive sync completed (demo)', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { _id: 'demo-act-5', action: 'delete', userEmail: 'demo-admin@example.com', userName: 'Demo Admin', details: 'Deleted old_demo_file.pdf', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) },
];

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, theme: 'section-blue-light' },
  { id: 'management', label: 'Upload Management', icon: Table, theme: 'section-green-light' },
  { id: 'drive', label: 'Storage Management', icon: HardDrive, theme: 'section-blue-light' },
  { id: 'settings', label: 'Settings', icon: Settings, theme: 'section-yellow-light' },
  { id: 'logs', label: 'Activity Logs', icon: Activity, theme: 'bg-slate-50 dark:bg-slate-950' },
];

export default function DemoDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const selectedDrives = DEMO_DRIVES.filter((d) => d.isActive);

  const activeTheme = activeTab === 'management'
    ? 'bg-white dark:bg-slate-950'
    : tabs.find((t) => t.id === activeTab)?.theme || 'bg-slate-50 dark:bg-slate-950';
  const panelClass = 'w-full min-h-[calc(100vh-12rem)] px-8 py-8 sm:px-10 lg:px-16';

  return (
    <div className="flex min-h-screen flex-col dark:bg-slate-950">
      {/* Demo Mode Banner */}
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center dark:border-amber-800 dark:bg-amber-950/30">
        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">📋 Demo Mode — Mock data only</span>
      </div>

      {/* Tab Bar - matching admin DashboardPage exactly */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
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

      {/* Full-screen tab panels - matching admin DashboardPage exactly */}
      <div className={cn('flex-1 w-full min-h-[calc(100vh-12rem)]', activeTheme)}>
        <div className={cn(panelClass)}>
          {activeTab === 'overview' && (
            <DemoOverviewTab
              files={DEMO_FILES}
              activities={DEMO_ACTIVITIES}
              failedUploads={0}
              activeDriveId={DEMO_DRIVES[0]._id}
              activeDrive={DEMO_DRIVES[0]}
              selectedDrives={selectedDrives}
            />
          )}
          {activeTab === 'management' && <DemoUploadManagementtab />}
          {activeTab === 'drive' && <DemoGoogleDriveIntegrationTab />}
          {activeTab === 'settings' && <DemoSettingsTab />}
          {activeTab === 'logs' && (
            <DemoActivityLogsTab
              activities={DEMO_ACTIVITIES}
              loading={false}
              onRefresh={() => {}}
              globalSearch=""
              activeDriveId={DEMO_DRIVES[0]._id}
              activeDrive={DEMO_DRIVES[0]}
              selectedDrives={selectedDrives}
            />
          )}
        </div>
      </div>
    </div>
  );
}