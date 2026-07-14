import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Database, CloudUpload, Shield, Download, HardDrive } from 'lucide-react';
import { cn, formatBytes, formatDate } from '../../lib/utils.js';

export function OverviewTab({ files = [], activities = [], loadingActivities, failedUploads = 0, activeDriveId, activeDrive, selectedDrives = [] }) {
   if (!files) files = [];
   if (!activities) activities = [];
  const dispatch = useDispatch();
  const { drives = [] } = useSelector((state) => state.drives || {});

// Use selected drives or fall back to active drive for display
    // If selectedDrives is empty, don't show any drive data (Case 1: all Show Data off)
    const drivesToShow = selectedDrives.length > 0 ? selectedDrives : [];

  const totalSize = (files || []).reduce((sum, file) => sum + Number(file.size || 0), 0);
  const today = new Date();
  const todayUploadsCount = (files || []).filter((file) => {
    const d = new Date(file.createdAt);
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  }).length;

  const todayDownloads = (activities || []).filter((a) => {
    if (a.action !== 'download') return false;
    const d = new Date(a.createdAt);
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  }).length;

  // Aggregated storage stats across all active drives
  const totalStorage = drives.reduce((sum, d) => sum + Number(d.storage?.limit || 0), 0);
  const totalUsage = drives.reduce((sum, d) => sum + Number(d.storage?.usage || 0), 0);
  const totalAvailable = totalStorage - totalUsage;
  const usagePct = totalStorage > 0 ? Math.round((totalUsage / totalStorage) * 100) : 0;
  const activeDrivesCount = drives.filter(d => d.isActive).length;

  const stats = [
    { label: 'Total Uploads', value: files.length, icon: CloudUpload, color: 'blue' },
    { label: "Today's Uploads", value: todayUploadsCount, icon: Database, color: 'emerald' },
    { label: "Today's Downloads", value: todayDownloads, icon: Download, color: 'amber' },
    { label: 'Active Drives', value: `${activeDrivesCount} / ${drives.length}`, icon: HardDrive, color: 'rose' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-900/30',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-900/30',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-900/30',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:ring-rose-900/30'
  };

  // Only show upload activities from selected drives
  const uploadActivities = (activities || []).filter((a) => a.action === 'upload' && selectedDrives.length > 0);

  // Check if we should show no data (Case 1: all Show Data off)
  const showNoData = selectedDrives.length === 0;

return (
    <div className="min-h-[calc(100dvh-12rem)] space-y-6">
      {/* Selected Drive Info */}
      {drivesToShow.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500">Showing data from:</span>
          {drivesToShow.map((d, i) => (
            <span key={d._id} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30">
              {d.name}
            </span>
          ))}
        </div>
      )}

      {/* No data message (Case 1: all Show Data off) */}
      {showNoData && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/20">
          <HardDrive className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">No drives selected for data view</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Enable "Show Data" toggles in Storage Management to see drive data here.</p>
        </div>
      )}

      {/* Stats Grid - only show when we have data */}
      {!showNoData && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200/80 bg-white/50 p-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-1 font-display text-2xl font-black text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl ring-1', colorMap[stat.color])}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Failed Uploads */}
      {!showNoData && failedUploads > 0 && (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 dark:border-rose-800 dark:bg-rose-950/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-400">
            <Shield className="h-4 w-4" />
            <span>Sync Errors</span>
          </div>
          <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">
            {failedUploads} failure(s) detected. Check Storage Management for details.
          </p>
        </div>
      )}

      {/* Recent Uploads */}
      {!showNoData && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/50 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Uploads</h3>
            <span className="text-xs text-slate-500">{uploadActivities.length} total</span>
          </div>
          {uploadActivities.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No uploads recorded yet.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadActivities.slice(0, 20).map((activity) => {
                const time = new Date(activity.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });
                return (
                  <div
                    key={activity._id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CloudUpload className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                        {activity.details}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                      {time}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}