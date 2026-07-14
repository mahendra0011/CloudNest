import React, { useState, useMemo } from 'react';
import { Activity, Search, RefreshCw, CloudUpload, HardDrive } from 'lucide-react';
import { cn } from '../../lib/utils.js';

function formatLogLine(log) {
  const time = new Date(log.createdAt).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  let line;
  switch (log.action) {
    case 'upload':
      line = `${log.userName} uploaded ${log.details}`;
      break;
    case 'delete':
      line = `${log.userName} deleted ${log.details}`;
      break;
    case 'download':
      line = `${log.userName} downloaded ${log.details}`;
      break;
    case 'sync':
      line = 'Drive sync completed';
      break;
    case 'login':
      line = `${log.userName} logged in`;
      break;
    case 'register':
      line = `${log.userName} registered`;
      break;
    default:
      line = `${log.userName} — ${log.details}`;
  }

  return { time, line };
}

export function ActivityLogsTab({ activities = [], loading, onRefresh, globalSearch = '', activeDriveId = '', activeDrive = null, selectedDrives = [] }) {
  const [query, setQuery] = useState('');

  // Get drives to show (selected vs active)
  // If selectedDrives is empty, show nothing (Case 1: all Show Data off)
  const drivesToShow = selectedDrives.length > 0 ? selectedDrives : [];

  // Only show upload activities from selected drives (Case 1: all Show Data off = empty)
  const uploadActivities = useMemo(() => {
    if (selectedDrives.length === 0) return [];
    return activities.filter((a) => a.action === 'upload');
  }, [activities, selectedDrives.length]);

  const filteredLogs = useMemo(() => {
    const combined = globalSearch || query;
    if (!combined.trim()) return uploadActivities;
    const q = combined.toLowerCase();
    return uploadActivities.filter(
      (log) =>
        log.userName?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.userEmail?.toLowerCase().includes(q)
    );
  }, [uploadActivities, query, globalSearch]);

  return (
    <div className="min-h-[calc(100dvh-12rem)]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">Upload Activity</h2>
           <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filteredLogs.length} upload action(s) recorded</p>
           {drivesToShow.length > 0 && (
             <div className="mt-2 flex items-center gap-2 flex-wrap">
               <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">From:</span>
               {drivesToShow.map((d) => (
                 <span key={d._id} className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400">
                   {d.name}
                 </span>
               ))}
             </div>
           )}
         </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search uploads..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:placeholder-slate-500"
            />
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-400"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="gd-card-solid">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gd-blue" />
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="relative px-4 py-6">
            <div className="absolute bottom-6 left-[27px] top-6 w-0.5 bg-gd-blue/20 dark:bg-gd-blue/30" />
            <ul className="space-y-0">
              {filteredLogs.slice(0, 100).map((log) => {
                const { time, line } = formatLogLine(log);
                return (
                  <li key={log._id} className="relative flex gap-6 pb-8 last:pb-0">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-emerald-500/30 bg-white shadow-sm dark:bg-slate-900 dark:border-emerald-500/20 sm:h-14 sm:w-14">
                      <CloudUpload className="h-5 w-5 text-emerald-500" />
                      <span className="font-mono text-[10px] font-bold leading-tight text-emerald-600 dark:text-emerald-400">{time}</span>
                    </div>
                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50 sm:p-4">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{line}</p>
                      {log.userEmail && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{log.userEmail}</p>
                      )}
                      <span className={cn('mt-2 inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase', 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30')}>
                        Upload
                        </span>
                    </div>
                  </li>
                );
              })}
</ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {selectedDrives.length === 0 ? (
              <>
                <HardDrive className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No drives selected for data view</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Enable "Show Data" toggles in Storage Management to see activity here.</p>
              </>
            ) : (
              <>
                <CloudUpload className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No upload activity yet</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Upload activity will appear here once files are uploaded</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityLogsTab;