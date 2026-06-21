import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  Shield,
  Users,
  FileImage,
  FileVideo,
  FileArchive,
  FileText,
  Upload,
  Server,
  HardDrive,
  RefreshCw,
  TrendingUp,
  Award,
  Globe,
  Layers,
  Sparkles,
  Star,
  ChevronRight,
  Fingerprint,
  Download,
  Clock,
  Database,
  Zap,
  CloudUpload,
  Lock,
  Cloud,
  LayoutDashboard,
  BarChart3,
  AlertCircle,
  Loader2,
  Activity,
  UploadCloud,
} from 'lucide-react';
import Footer from '../../components/layout/footer';

/* ────────────────────────── Developer Dashboard Preview ────────────────────────── */
function DeveloperDashboardPreview() {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showUploadBtn, setShowUploadBtn] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Simulated recent uploads (matching actual File model: user, originalName, mimeType, size, createdAt)
  const recentUploads = [
    { user: { name: 'Amit Kumar', email: 'amit@example.com' }, originalName: 'project-report.pdf', mimeType: 'application/pdf', size: 2456700, createdAt: new Date(Date.now() - 120000) },
    { user: { name: 'Priya Sharma', email: 'priya@example.com' }, originalName: 'team-photo.jpg', mimeType: 'image/jpeg', size: 3500000, createdAt: new Date(Date.now() - 600000) },
    { user: { name: 'Rahul Verma', email: 'rahul@example.com' }, originalName: 'dashboard-data.zip', mimeType: 'application/zip', size: 8200000, createdAt: new Date(Date.now() - 1800000) },
    { user: { name: 'Sneha Patel', email: 'sneha@example.com' }, originalName: 'intro-video.mp4', mimeType: 'video/mp4', size: 45000000, createdAt: new Date(Date.now() - 3600000) },
    { user: { name: 'Vikram Singh', email: 'vikram@example.com' }, originalName: 'budget-2026.xlsx', mimeType: 'application/xlsx', size: 1800000, createdAt: new Date(Date.now() - 7200000) },
  ];

  const drives = [
    { name: 'Primary Drive', email: 'admin@cloudnest.app', isActive: true, storage: { limit: '16106127360', usage: '8589934592', percentage: 53 } },
    { name: 'Backup Drive', email: 'backup@cloudnest.app', isActive: true, storage: { limit: '10737418240', usage: '2147483648', percentage: 20 } },
    { name: 'Archive Drive', email: 'archive@cloudnest.app', isActive: false, storage: { limit: '5368709120', usage: '4294967296', percentage: 80 } },
  ];

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveFileIndex((prev) => (prev + 1) % recentUploads.length);
    }, 4000);
    const btnTimer = setTimeout(() => setShowUploadBtn(true), 1200);
    return () => { clearInterval(interval); clearTimeout(btnTimer); };
  }, [isInView, recentUploads.length]);

  // Helper: format file size
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Helper: file type icon/color from mime
  const fileTypeMeta = (mime = '') => {
    if (mime.startsWith('image/')) return { icon: FileImage, color: 'bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' };
    if (mime.startsWith('video/')) return { icon: FileVideo, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' };
    if (mime.includes('zip') || mime.includes('rar')) return { icon: FileArchive, color: 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' };
    if (mime.includes('pdf')) return { icon: FileText, color: 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400' };
    if (mime.includes('sheet') || mime.includes('xls')) return { icon: FileText, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' };
    return { icon: FileText, color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };
  };

  // Helper: time ago
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const activeUser = recentUploads[activeFileIndex]?.user;
  const activeFile = recentUploads[activeFileIndex];

  return (
    <div className="mx-auto max-w-6xl" ref={ref}>
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Upload Panel & Quick Actions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Upload Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border-2 border-dashed border-gd-blue/30 bg-gradient-to-br from-blue-50/80 to-white p-6 text-center shadow-lg hover:border-gd-blue/60 hover:shadow-xl transition-all duration-300 dark:from-blue-950/30 dark:to-slate-950"
          >
            <motion.div
              animate={showUploadBtn ? { y: [0, -5, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gd-blue to-blue-500 shadow-lg shadow-gd-blue/30"
            >
              <UploadCloud className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="mt-4 font-display text-lg font-bold text-slate-800 dark:text-white">Upload Files</h3>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Drag & drop or click to browse</p>

            {/* File type badges */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                { icon: FileImage, label: 'Images', color: 'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:ring-purple-900/30' },
                { icon: FileVideo, label: 'Videos', color: 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:ring-indigo-900/30' },
                { icon: FileArchive, label: 'Archives', color: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-900/30' },
                { icon: FileText, label: 'Docs', color: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-900/30' },
              ].map((item) => (
                <span key={item.label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${item.color}`}>
                  <item.icon className="h-3 w-3" /> {item.label}
                </span>
              ))}
            </div>

            {/* Simulated upload button */}
            {showUploadBtn && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gd-blue to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-gd-blue/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Upload className="h-4 w-4" /> Choose File to Upload <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}
          </motion.div>

          {/* Connected Drives */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Connected Drives</h3>
              <button className="text-[10px] font-bold text-gd-blue hover:underline">+ Add Drive</button>
            </div>
            {/* Google Drive Official Logo Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.15, type: 'spring', stiffness: 150 }}
              className="mb-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 p-3 ring-1 ring-black/5 dark:from-blue-950/30 dark:to-emerald-950/30 dark:ring-white/10"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <DriveIcon className="h-8 w-8" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-white">Google Drive</span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Secure cloud storage backend</p>
              </div>
              <motion.div
                className="ml-auto flex items-center gap-1 rounded-full bg-gd-green/10 px-2.5 py-1"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gd-green" />
                <span className="text-[9px] font-bold text-gd-green">Connected</span>
              </motion.div>
            </motion.div>
            <div className="space-y-3">
              {drives.map((drive, i) => (
                <motion.div
                  key={drive.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="group flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 hover:bg-white hover:shadow-sm transition-all dark:bg-slate-900 dark:hover:bg-slate-950"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${drive.isActive ? 'bg-gd-green/10 text-gd-green' : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-700 truncate dark:text-slate-300">{drive.name}</span>
                      {drive.isActive && <span className="h-1.5 w-1.5 rounded-full bg-gd-green animate-pulse-soft" />}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate dark:text-slate-500">{drive.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{drive.storage.percentage}%</div>
                    <div className="mt-0.5 h-1 w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full ${drive.storage.percentage > 70 ? 'bg-amber-500' : 'bg-gd-green'}`}
                        style={{ width: `${drive.storage.percentage}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: Recent Uploads Feed */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-950"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gd-blue to-blue-500 shadow-sm">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Upload Activity</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Who uploaded what — live feed</p>
                </div>
              </div>
              <motion.div
                className="flex items-center gap-1.5 rounded-full bg-gd-green/10 px-3 py-1"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gd-green" />
                <span className="text-[10px] font-bold text-gd-green">Live</span>
              </motion.div>
            </div>

            {/* Activity list */}
            <div className="mt-4 space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {recentUploads.map((upload, idx) => {
                const meta = fileTypeMeta(upload.mimeType);
                const Icon = meta.icon;
                const isActive = idx === activeFileIndex;
                return (
                  <motion.div
                    key={`${upload.user.email}-${upload.originalName}`}
                    initial={{ opacity: 0, x: -15 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.2 + idx * 0.08 }}
                    whileHover={{ x: 3 }}
                    className={`group flex items-start gap-3 rounded-xl px-4 py-3 transition-all duration-300 cursor-default ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-emerald-50 ring-2 ring-gd-blue/20 shadow-md dark:from-blue-950/30 dark:to-emerald-950/30'
                        : 'bg-slate-50 hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-200 dark:bg-slate-900 dark:hover:bg-slate-950 dark:hover:ring-slate-700'
                    }`}
                  >
                    {/* File type icon */}
                    <motion.div
                      animate={isActive ? { scale: [1, 1.15, 1], rotate: [0, 5, 0] } : {}}
                      transition={{ duration: 0.6 }}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.color} shadow-sm ring-1 ring-black/5`}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>

                    {/* File + user details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-gd-blue' : 'text-slate-700 dark:text-slate-300'}`}>
                          {upload.originalName}
                        </span>
                        {isActive && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-0.5 rounded-full bg-gd-blue/10 px-2 py-0.5 text-[9px] font-bold text-gd-blue"
                          >
                            <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                            Uploading
                          </motion.span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className={isActive ? 'font-semibold text-slate-700 dark:text-slate-300' : ''}>{upload.user.name}</span>
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span>{upload.user.email}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(upload.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{formatBytes(upload.size)}</span>
                        <span className="text-slate-200 dark:text-slate-700">•</span>
                        <span className={`text-[10px] font-bold ${isActive ? 'text-gd-blue' : 'text-slate-400 dark:text-slate-500'}`}>
                          {upload.mimeType.split('/').pop().toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Right: animated sync indicator */}
                    <div className="flex flex-col items-end gap-1 min-w-[40px]">
                      <motion.div
                        animate={isActive ? { width: 32 } : { width: 0 }}
                        className="h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                      >
                        <motion.div
                          animate={isActive ? { width: [0, 32] } : {}}
                          transition={{ duration: 2, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-gd-blue to-gd-green"
                        />
                      </motion.div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">{isActive ? 'uploading' : 'synced'}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Active user highlight bar */}
            <motion.div
              key={activeUser?.email}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-gd-blue/[0.04] to-gd-green/[0.04] px-4 py-3 ring-1 ring-black/5 dark:ring-white/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gd-blue to-blue-600 text-[11px] font-bold text-white shadow-sm">
                {activeUser?.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{activeUser?.name}</span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                  >
                    <Sparkles className="h-2.5 w-2.5" /> Now Uploading
                  </motion.span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{activeFile?.originalName} • {formatBytes(activeFile?.size)}</p>
              </div>
              <span className="text-[10px] font-bold text-gd-blue">View Details →</span>
            </motion.div>

            {/* Summary stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Total Files', value: recentUploads.length.toString(), icon: FileText, color: 'text-gd-blue' },
                { label: 'Active Drives', value: drives.filter(d => d.isActive).length.toString(), icon: HardDrive, color: 'text-gd-green' },
                { label: 'Users Today', value: new Set(recentUploads.map(u => u.user.email)).size.toString(), icon: Users, color: 'text-amber-600' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="rounded-xl bg-slate-50 p-3 text-center ring-1 ring-slate-200/50 dark:bg-slate-900 dark:ring-slate-700/50"
                >
                  <s.icon className={`mx-auto h-4 w-4 ${s.color}`} />
                  <div className="mt-0.5 text-sm font-black text-slate-700 dark:text-slate-300">{s.value}</div>
                  <div className="text-[9px] font-medium text-slate-400 dark:text-slate-500">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── Animation Variants ────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ────────────────────────── Drive Icon ────────────────────────── */
const DriveIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA" />
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00AC47" />
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#EA4335" />
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832D" />
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684FC" />
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#FFBA00" />
  </svg>
);

const GoogleDriveLogo = ({ className = 'h-10 w-auto' }) => (
  <svg className={className} viewBox="0 0 430 92" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Google Drive">
    <g transform="translate(0 0)">
      <path fill="#EA4335" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" />
      <path fill="#FBBC05" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" />
      <path fill="#4285F4" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" />
      <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z" />
      <path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" />
      <path fill="#4285F4" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" />
    </g>
    <g transform="translate(294 8) scale(0.82)">
      <DriveIcon className="h-24 w-24" />
    </g>
    <text x="326" y="62" fontFamily="Google Sans, Product Sans, Arial, sans-serif" fontSize="38" fontWeight="500" fill="#5f6368">Drive</text>
  </svg>
);

/* ────────────────────────── Particle Background ────────────────────────── */
function ParticleField() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 4,
      color: i % 3 === 0 ? 'rgba(66,133,244,0.15)' : i % 3 === 1 ? 'rgba(52,168,83,0.12)' : 'rgba(251,188,4,0.10)',
    })),
  []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          animate={{
            y: [0, -30, -50, -30, 0],
            x: [0, 10, 0, -10, 0],
            opacity: [0, 0.6, 0.8, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────── Section Wrapper ────────────────────────── */
function AnimatedSection({ children, className = '', id = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}

function AnimatedGrid({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ staggerChildren: 0.08, delayChildren: delay }}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────── Section Badge ────────────────────────── */
function SectionBadge({ icon: Icon, children, color = 'blue' }) {
  const styles = {
    blue: 'bg-blue-50 text-gd-blue border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/30',
    green: 'bg-emerald-50 text-gd-green border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/30',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/30',
  };

  return (
    <motion.div
      variants={fadeInUp}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${styles[color] || styles.blue}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </motion.div>
  );
}

/* ────────────────────────── Data ────────────────────────── */
const features = [
  { icon: Shield, title: 'JWT Cookie Auth', desc: 'User register/login with JWT cookie auth. Login with Google button included.', color: 'blue' },
  { icon: HardDrive, title: 'Owner Google Drive', desc: 'Admin uploads all files to one centralized owner Google Drive account.', color: 'green' },
  { icon: CloudUpload, title: 'Drag-and-Drop Upload', desc: 'React upload UI with drag-and-drop, progress indicator, and file type categories.', color: 'amber' },
  { icon: FileText, title: 'Multi-Format Support', desc: 'Upload images, videos, zip archives, PDFs, docs, and other file types.', color: 'blue' },
  { icon: Download, title: 'Private Streaming', desc: 'Download files through backend streaming — no public CDN links or direct Drive access.', color: 'green' },
  { icon: Database, title: 'MongoDB Metadata', desc: 'User-wise file metadata stored in MongoDB. Full CRUD with Drive sync.', color: 'amber' },
];

const useCases = [
  'SaaS apps with user file uploads',
  'College full-stack projects',
  'Admin panels & CRM attachments',
  'Portfolio & document portals',
  'Startup MVPs on a budget',
  'Internal team file dashboards',
];

const flowSteps = [
  { step: '01', title: 'User Registers', desc: 'Users create an account with email or Google — no dashboard access.' },
  { step: '02', title: 'Admin Uploads', desc: 'Administrator assigns files to users from the Upload Management tab.' },
  { step: '03', title: 'Backend Saves', desc: 'Express + Multer sends file to owner Google Drive.' },
  { step: '04', title: 'MongoDB Record', desc: 'Metadata saved with assigned user ID and Drive file ID.' },
  { step: '05', title: 'Admin Manages', desc: 'Admin views, downloads, opens in Drive, or deletes any file.' },
];

const pricingRows = [
  { platform: 'Google Drive', plan: 'Lite', storage: '30 GB', price: '₹59/mo', popular: true, tag: 'Cheap starter' },
  { platform: 'Google Drive', plan: 'Basic', storage: '100 GB', price: '₹130/mo', popular: false },
  { platform: 'Google Drive', plan: 'AI Plus', storage: '200 GB', price: '₹399/mo', popular: false },
  { platform: 'Cloudinary', plan: 'Free', storage: '25 credits', price: '$0/mo', popular: false },
  { platform: 'Cloudinary', plan: 'Plus', storage: '225 credits', price: '$89/mo', popular: false },
  { platform: 'Cloudinary', plan: 'Advanced', storage: '600 credits', price: '$224/mo', popular: false },
];

const techStack = ['React', 'Redux Toolkit', 'Tailwind CSS', 'Material UI', 'Node.js', 'Express', 'MongoDB', 'Google Drive API'];

const stats = [
  { label: 'Files Uploaded', value: '10K', icon: Upload },
  { label: 'Users Served', value: '500+', icon: Users },
  { label: 'Storage Used', value: '50TB+', icon: HardDrive },
  { label: 'Uptime', value: '99.9%', icon: Shield },
];

/* ────────────────────────── Feature Card ────────────────────────── */
function FeatureCard({ feature, index }) {
  const colorMap = {
    blue: 'bg-blue-50 text-gd-blue ring-blue-200 group-hover:ring-gd-blue/40 group-hover:shadow-blue-100 dark:bg-blue-950/30 dark:ring-blue-900/30 dark:group-hover:ring-blue-700/40',
    green: 'bg-emerald-50 text-gd-green ring-emerald-200 group-hover:ring-gd-green/40 group-hover:shadow-emerald-100 dark:bg-emerald-950/30 dark:ring-emerald-900/30 dark:group-hover:ring-emerald-700/40',
    amber: 'bg-amber-50 text-amber-600 ring-amber-200 group-hover:ring-amber-400/40 group-hover:shadow-amber-100 dark:bg-amber-950/30 dark:ring-amber-900/30 dark:group-hover:ring-amber-700/40',
  };

  return (
    <motion.div
      custom={index}
      variants={fadeInUp}
      whileHover={{ y: -8, scale: 1.02 }}
      className="gd-card-solid group cursor-default"
    >
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-gd-blue/[0.03] to-gd-green/[0.03] blur-2xl transition group-hover:from-gd-blue/[0.08] group-hover:to-gd-green/[0.08] dark:from-gd-blue/[0.06] dark:to-gd-green/[0.06]" />
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-2 transition-all group-hover:scale-110 group-hover:shadow-lg ${colorMap[feature.color]}`}>
        <feature.icon className="h-7 w-7 transition group-hover:rotate-6" />
      </div>
      <h3 className="font-display text-lg font-bold text-slate-900 transition group-hover:text-gd-blue dark:text-white">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{feature.desc}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-gd-blue opacity-0 transition group-hover:opacity-100">
        Learn more <ChevronRight className="h-3 w-3" />
      </div>
    </motion.div>
  );
}

/* ────────────────────────── Upload Demo ────────────────────────── */
function UploadDemo() {
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = !!user;
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    setProgress(0);
    setError('');
    setSuccess(false);

    try {
      const { userUploadFile } = await import('../../lib/api.js');
      await userUploadFile(file, (p) => setProgress(p));
      setSuccess(true);
      setProgress(0);
      setUploading(false);
    } catch (err) {
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleClick = () => {
    if (!uploading && isLoggedIn) {
      fileInputRef.current?.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onDragEnter={(e) => { if (isLoggedIn) e.preventDefault(); }}
      onDragOver={(e) => { if (isLoggedIn) e.preventDefault(); }}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 text-center transition-all duration-500 p-5 sm:p-6 lg:p-7 ${
        isLoggedIn
          ? 'border-blue-200 bg-gradient-to-br from-sky-50 to-white shadow-lg hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-1 dark:border-blue-800 dark:from-sky-950/30 dark:to-slate-950'
          : 'border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

      {/* Decorative gradient blobs */}
      {isLoggedIn && (
        <>
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-sky-200 to-blue-100 blur-2xl transition group-hover:scale-150 dark:from-sky-800 dark:to-blue-900" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-sky-50 blur-xl transition group-hover:scale-150 dark:from-blue-900 dark:to-sky-800" />
        </>
      )}

      {/* Upload icon */}
      <motion.div
        animate={uploading ? { scale: [1, 1.05, 1], y: [0, -4, 0] } : success ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: uploading ? Infinity : 0, duration: 1.2 }}
        className={`relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl ring-4 transition-all duration-300 ${
          success
            ? 'bg-emerald-50 ring-emerald-200 dark:bg-emerald-950/30 dark:ring-emerald-900/30'
            : uploading
              ? 'bg-blue-50 ring-blue-200 dark:bg-blue-950/30 dark:ring-blue-900/30'
              : isLoggedIn
                ? 'bg-white ring-sky-200 group-hover:ring-blue-300 shadow-sm dark:bg-slate-900 dark:ring-sky-800 dark:group-hover:ring-blue-700'
                : 'bg-slate-100 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700'
        }`}
      >
        <Upload className={`h-7 w-7 transition-all duration-300 ${
          success ? 'text-emerald-500' : uploading ? 'text-blue-400 animate-bounce' : isLoggedIn ? 'text-sky-300 group-hover:text-blue-500 dark:text-sky-500 dark:group-hover:text-blue-400' : 'text-slate-300 dark:text-slate-500'
        }`} />
      </motion.div>

      <AnimatePresence>
        {fileName && !uploading && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
              success ? 'bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-900/30' : 'bg-blue-50 text-blue-600 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-900/30'
            }`}
          >
            {success ? <CheckCircle className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {fileName}
          </motion.div>
        )}
      </AnimatePresence>

      <h3 className="relative font-display text-xl font-bold sm:text-2xl text-sky-900 dark:text-sky-100">
        {success
          ? '✓ Uploaded to Google Drive!'
          : uploading
            ? 'Uploading to Google Drive...'
            : isLoggedIn
              ? 'Drop your file here or click to select'
              : 'Login to upload files'}
      </h3>
      <p className="relative mx-auto mt-1.5 max-w-md text-xs text-sky-400 dark:text-sky-500 leading-relaxed">
        {isLoggedIn
          ? 'Images · Videos · ZIP · PDF · Documents — up to 250 MB per file'
          : 'Files go to admin Google Drive — admin manages them in dashboard'}
      </p>

      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative mx-auto mt-4 max-w-xs"
          >
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-sky-100 ring-1 ring-blue-200 dark:bg-sky-950 dark:ring-blue-900/30">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-sky-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="mt-1.5 text-xs font-bold text-blue-500 dark:text-blue-400">{progress < 100 ? `${progress}%` : 'Processing...'}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mt-2 text-xs font-semibold text-rose-500 flex items-center justify-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </motion.p>
      )}

      {success && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mt-2 text-xs text-emerald-500 font-semibold">
          ✓ File saved in Google Drive — admin can see it in Dashboard
        </motion.p>
      )}

      {/* File type icons */}
      <div className="relative mt-4 flex flex-wrap items-center justify-center gap-2">
        {[FileImage, FileVideo, FileArchive, FileText].map((Icon, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.2, rotate: 5, y: -2 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white ring-2 ring-sky-200 transition hover:bg-blue-50 hover:ring-blue-300 shadow-sm dark:bg-slate-900 dark:ring-sky-800 dark:hover:bg-blue-950/50 dark:hover:ring-blue-700"
          >
            <Icon className="h-4.5 w-4.5 text-sky-400 dark:text-sky-500" />
          </motion.div>
        ))}
      </div>

      {/* Upload button for logged-in users */}
      {isLoggedIn && !uploading && !success && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
        >
          <Upload className="h-4 w-4" /> Choose File to Upload <ArrowRight className="h-4 w-4" />
        </button>
      )}

      {/* CTA for non-logged-in users */}
      {!isLoggedIn && (
        <Link to="/login" className="relative mt-5 inline-block">
          <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95">
            Login to Upload <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      )}
    </motion.div>
  );
}

/* ────────────────────────── Counter ────────────────────────── */
function AnimatedCounter({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const numeric = parseInt(value.replace(/[^0-9]/g, ''));
    if (isNaN(numeric)) { setCount(value); return; }
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(numeric / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= numeric) {
        setCount(numeric);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ────────────────────────── BookOpen Icon ────────────────────────── */
function BookOpen(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

/* ══════════════════════════ MAIN COMPONENT ══════════════════════════ */
export default function HomePage() {
  return (
    <div className="w-full overflow-hidden">
      {/* ═══ HERO ═══ */}
      <section id="hero" className="relative flex min-h-[90vh] w-full flex-col justify-center px-4 sm:px-6 lg:px-8 bg-white overflow-hidden dark:bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white to-emerald-50/30 pointer-events-none dark:from-blue-950/20 dark:via-slate-950 dark:to-emerald-950/20" />
        <ParticleField />
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-gd-blue/[0.03] blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gd-green/[0.03] blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="relative mx-auto w-full max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-slate-400"
              >
                <span className="text-gd-blue">Powered by</span>
                <GoogleDriveLogo className="h-6 w-auto" />
              </motion.div>

              <motion.h1 variants={fadeInUp} className="font-display mt-6 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl text-slate-900 dark:text-white">
                Secure file storage
                <br />
                <span className="bg-gradient-to-r from-gd-blue via-gd-green to-gd-yellow bg-clip-text text-transparent">built for developers</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="mt-5 max-w-xl text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                CloudNest is an admin-managed upload system. Users register on your website; the administrator uploads files to owner Google Drive and tracks everything from a full dashboard.
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-4">
                <Link to="/register" className="gd-btn-yellow btn-shine text-base px-8 py-4 shadow-lg shadow-gd-yellow/20">
                  <Sparkles className="h-5 w-5" /> Register as User <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/docs"
                  className="group inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 px-8 py-4 text-base font-bold text-slate-600 transition-all duration-300 hover:border-gd-blue/30 hover:bg-blue-50 hover:text-gd-blue hover:scale-105 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-gd-blue"
                >
                  <BookOpen className="h-5 w-5" />
                  Documentation
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-10 flex items-center gap-6 text-sm text-slate-400 dark:text-slate-500">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gd-blue ring-2 ring-white dark:ring-slate-950 flex items-center justify-center text-[10px] font-bold text-white">JM</div>
                  <div className="h-8 w-8 rounded-full bg-gd-green ring-2 ring-white dark:ring-slate-950 flex items-center justify-center text-[10px] font-bold text-white">AK</div>
                  <div className="h-8 w-8 rounded-full bg-gd-yellow ring-2 ring-white dark:ring-slate-950 flex items-center justify-center text-[10px] font-bold text-white">PS</div>
                  <div className="h-8 w-8 rounded-full bg-gd-red ring-2 ring-white dark:ring-slate-950 flex items-center justify-center text-[10px] font-bold text-white">RL</div>
                </div>
                <span>Trusted by <strong className="text-slate-700 dark:text-slate-300">500+</strong> developers worldwide</span>
              </motion.div>
            </motion.div>

            {/* Hero Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 60, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-float-slow dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 px-4 py-3 ring-1 ring-black/5 dark:from-blue-950/30 dark:to-emerald-950/30 dark:ring-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                      <DriveIcon className="h-5 w-5" color="#4285F4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Google Drive Sync</span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Live activity feed</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <motion.div className="h-2.5 w-2.5 rounded-full bg-gd-blue/50" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <motion.div className="h-2.5 w-2.5 rounded-full bg-gd-green/50" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
                    <motion.div className="h-2.5 w-2.5 rounded-full bg-gd-yellow/50" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    { text: 'dashboard-screens.zip', action: 'uploaded', time: '2m ago', color: 'from-gd-green to-emerald-400', dot: 'bg-gd-green', icon: '↑' },
                    { text: 'Drive sync', action: 'completed', time: '5min ago', color: 'from-gd-blue to-blue-400', dot: 'bg-gd-blue', icon: '↻' },
                    { text: 'report.pdf', action: 'downloaded by admin', time: '12m ago', color: 'from-gd-yellow to-amber-400', dot: 'bg-gd-yellow', icon: '↓' },
                    { text: 'New user', action: 'registered', time: '15m ago', color: 'from-purple-500 to-purple-400', dot: 'bg-purple-500', icon: '+' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 100 }}
                      whileHover={{ x: 4, transition: { duration: 0.2 } }}
                      className="group flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 transition-all duration-200 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-slate-200 cursor-default dark:bg-slate-900 dark:hover:bg-slate-950 dark:hover:ring-slate-700"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} text-white text-xs font-bold shadow-sm`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.text}</span>
                        <span className="text-sm text-slate-400 dark:text-slate-500 ml-1">{item.action}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 dark:text-slate-500">{item.time}</span>
                        <span className={`h-2 w-2 rounded-full ${item.dot} animate-pulse-soft`} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-4 flex items-center justify-between rounded-lg bg-gradient-to-r from-gd-blue/[0.04] to-gd-green/[0.04] px-4 py-2.5 ring-1 ring-black/5 dark:from-gd-blue/[0.08] dark:to-gd-green/[0.08] dark:ring-white/10"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-gd-green animate-pulse-soft" />
                    All systems operational
                  </div>
                  <span className="text-xs font-semibold text-gd-blue">99.9% uptime</span>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
                className="absolute -bottom-3 -left-6 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-center">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-yellow-400 text-sm ml-0.5">★</span>
                  <span className="text-yellow-400 text-sm ml-0.5">★</span>
                  <span className="text-yellow-400 text-sm ml-0.5">★</span>
                  <span className="text-yellow-400 text-sm ml-0.5">★</span>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">4.9</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BANNER ═══ */}
      <div className="relative bg-gradient-to-r from-blue-50 via-emerald-50 to-amber-50 border-y border-slate-100 dark:from-blue-950/30 dark:via-emerald-950/30 dark:to-amber-950/30 dark:border-slate-800">
        <div className="section-inner py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                  <stat.icon className="h-6 w-6 text-gd-blue" />
                </div>
                <div className="font-display text-3xl font-black text-slate-800 dark:text-white">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ UPLOAD ═══ */}
      <AnimatedSection id="upload" className="bg-gradient-to-b from-sky-50/40 to-white relative overflow-hidden py-16 sm:py-20 dark:from-sky-950/20 dark:to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.08)_0%,transparent_60%)] pointer-events-none" />
        <div className="section-inner relative">
          <motion.div className="mx-auto max-w-3xl text-center" variants={staggerContainer} initial="hidden" whileInView="visible">
            <SectionBadge icon={Upload} color="blue">Try It Now</SectionBadge>
            <motion.h2 variants={fadeInUp} className="font-display mt-3 text-3xl font-black sm:text-4xl text-sky-900 dark:text-sky-100">
              <span className="text-sky-500 dark:text-sky-400">Upload Your</span> Files
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-2 text-base text-sky-400 dark:text-sky-500">
              Drag and drop your files here and see how easily they get uploaded.
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-3 max-w-3xl"
          >
            <UploadDemo />
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══ USE CASES ═══ */}
      <AnimatedSection id="use-cases" className="bg-white relative overflow-hidden py-16 sm:py-20 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(52,168,83,0.04)_0%,transparent_60%)] pointer-events-none dark:opacity-30" />
        <div className="section-inner">
          <motion.div className="mx-auto max-w-3xl text-center" variants={staggerContainer} initial="hidden" whileInView="visible">
            <SectionBadge icon={TrendingUp} color="green">Use Cases</SectionBadge>
            <motion.h2 variants={fadeInUp} className="font-display mt-4 text-4xl font-black sm:text-5xl text-slate-900 dark:text-white">
              Built for <span className="text-gd-green">real projects</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              CloudNest is designed for projects where you need a simple, admin-managed file storage system. Instead of every user connecting their own cloud storage, a single administrator uploads, manages, and controls all files from one dashboard. This keeps things secure, organized, and easy to maintain.
            </motion.p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Globe, title: 'SaaS apps with user file uploads', desc: 'Let users submit files while admin controls all storage in one Drive account.' },
              { icon: Users, title: 'College full-stack projects', desc: 'Perfect for student projects where teachers manage and distribute files.' },
              { icon: LayoutDashboard, title: 'Admin panels & CRM attachments', desc: 'Manage customer documents, receipts, and attachments from one panel.' },
              { icon: FileText, title: 'Portfolio & document portals', desc: 'Create a document portal where admin uploads and users download.' },
              { icon: Sparkles, title: 'Startup MVPs on a budget', desc: 'Launch fast with cheap Google Drive storage instead of expensive cloud solutions.' },
              { icon: Shield, title: 'Internal team file dashboards', desc: 'Teams can share files privately through a central dashboard.' },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                custom={idx}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-gd-green/50 hover:shadow-lg cursor-default dark:border-emerald-900/30 dark:bg-slate-950 dark:hover:border-gd-green/40"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-gd-green ring-2 ring-emerald-200 transition group-hover:bg-gd-green group-hover:text-white group-hover:ring-gd-green dark:bg-emerald-950/30 dark:ring-emerald-900/30 dark:group-hover:bg-gd-green dark:group-hover:text-white dark:group-hover:ring-gd-green">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-16 max-w-5xl"
          >
            <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 sm:p-10 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-slate-950">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gd-blue/10 ring-2 ring-gd-blue/20 dark:bg-gd-blue/20 dark:ring-gd-blue/40">
                  <Star className="h-6 w-6 text-gd-blue" />
                </div>
                <h3 className="font-display text-2xl font-black sm:text-3xl text-slate-900 dark:text-white">Why CloudNest Is Useful</h3>
                <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
                  CloudNest solves a common problem — how to let users upload and download files without giving them access to your cloud storage or paying for expensive enterprise solutions.
                </p>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: HardDrive, title: 'Cheap Storage', desc: 'Uses Google Drive plans starting at just ₹59/mo for 30 GB. No need for expensive dedicated servers.' },
                  { icon: Shield, title: 'Full Admin Control', desc: 'Admin uploads, views, and deletes all files. Users only see what the admin assigns to them.' },
                  { icon: Lock, title: 'Private & Secure', desc: 'Files stream through your backend — no public CDN links. httpOnly cookies keep auth safe.' },
                  { icon: Zap, title: 'Easy Setup', desc: 'Just connect a Google Drive account, set up MongoDB, and deploy. No complex cloud configuration.' },
                  { icon: Users, title: 'Multi-User Ready', desc: 'Many users can register. Admin manages all files centrally without sharing Drive access.' },
                  { icon: BarChart3, title: 'Full Audit Trail', desc: 'Every upload, download, and delete is logged with timestamps and user details.' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    custom={idx}
                    variants={fadeInUp}
                    whileHover={{ y: -4 }}
                    className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md dark:bg-slate-950 dark:ring-slate-800 dark:hover:ring-slate-700"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gd-blue/10 text-gd-blue dark:bg-gd-blue/20">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-800 dark:text-white">{item.title}</h4>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link to="/register" className="gd-btn-blue inline-flex">
                  <Sparkles className="h-5 w-5" /> Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══ PRICING ═══ */}
      <AnimatedSection id="pricing" className="bg-gradient-to-b from-amber-50/20 to-white relative overflow-hidden py-16 sm:py-20 dark:from-amber-950/20 dark:to-slate-950">
        <div className="section-inner">
          <motion.div className="mx-auto max-w-4xl text-center" variants={staggerContainer} initial="hidden" whileInView="visible">
            <SectionBadge icon={Award} color="yellow">Storage Plans</SectionBadge>
            <motion.h2 variants={fadeInUp} className="font-display mt-4 text-4xl font-black sm:text-5xl text-slate-900 dark:text-white">
              Cheap Google Drive <span className="text-amber-600 dark:text-amber-400">vs</span> Cloudinary Pricing
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              This project is useful when your main requirement is cheap file storage with upload, list, download, and delete features. Google Drive storage plans are generally easier for small projects because you pay mainly for storage capacity. Cloudinary is powerful, but its paid plans are built for image/video delivery, transformations, CDN, DAM, and team media workflows.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Platform</th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Plan</th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Storage / Credits</th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pricingRows.map((row, i) => (
                    <motion.tr
                      key={`${row.platform}-${row.plan}`}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className={`transition hover:bg-amber-50/40 dark:hover:bg-amber-950/20 ${row.popular ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {row.platform === 'Google Drive' ? (
                            <DriveIcon className="h-4 w-4 flex-shrink-0" color="#FBBC04" />
                          ) : (
                            <Cloud className="h-4 w-4 text-sky-500" />
                          )}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{row.platform}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-600 dark:text-slate-400">{row.plan}</span>
                        {row.tag && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                            {row.tag}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{row.storage}</td>
                      <td className="px-6 py-4">
                        <span className="font-display font-bold text-slate-800 dark:text-white">{row.price}</span>
                        {row.popular && <Star className="ml-1.5 inline h-3 w-3 text-amber-500" />}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-12 grid gap-6 lg:grid-cols-2 max-w-5xl"
          >
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 dark:border-emerald-900/30 dark:from-emerald-950/20 dark:to-slate-950">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gd-green/10 dark:bg-gd-green/20">
                <DriveIcon className="h-5 w-5" color="#34A853" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Why Google Drive Is Better</h3>
              <ul className="mt-4 space-y-2">
                {[
                  'Cheap storage: Plans like 30 GB, 100 GB, and 200 GB are affordable for upload-heavy projects',
                  'Simple file storage: files, images, videos, zip archives, PDFs, and docs in one owner Drive',
                  'Centralized control: all uploads stay in your Google Drive, not in every user account',
                  'Easy developer flow: backend handles upload/download, MongoDB handles metadata',
                  'Good for private dashboards: downloads go through your backend instead of public CDN links',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gd-green" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-6 dark:border-sky-900/30 dark:from-sky-950/20 dark:to-slate-950">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950/30">
                <Cloud className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Where Cloudinary Is Better</h3>
              <ul className="mt-4 space-y-2">
                {[
                  'Image and video transformations',
                  'Automatic image optimization',
                  'Video transcoding and adaptive streaming',
                  'CDN-based public media delivery at scale',
                  'Digital Asset Management (DAM)',
                  'Auto-tagging, revision tracking, backup workflows',
                  'Enterprise support, SLA, SSO, compliance',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══ FEATURES ═══ */}
      <AnimatedSection id="features" className="bg-white relative overflow-hidden py-16 sm:py-20 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(66,133,244,0.03)_0%,transparent_60%)] pointer-events-none dark:opacity-30" />
        <div className="section-inner">
          <motion.div className="mx-auto max-w-3xl text-center" variants={staggerContainer} initial="hidden" whileInView="visible">
            <SectionBadge icon={Layers} color="blue">Features</SectionBadge>
            <motion.h2 variants={fadeInUp} className="font-display mt-4 text-4xl font-black sm:text-5xl text-slate-900 dark:text-white">
              Everything you <span className="text-gd-blue">need</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Admin dashboard with overview, upload management, Google Drive panel, settings, and activity logs.
            </motion.p>
          </motion.div>
          <AnimatedGrid className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </AnimatedGrid>
        </div>
      </AnimatedSection>

      {/* ═══ DEVELOPER DASHBOARD PREVIEW ═══ */}
      <AnimatedSection id="drive-preview" className="bg-gradient-to-b from-blue-50/40 via-white to-emerald-50/20 relative overflow-hidden py-16 sm:py-20 dark:from-blue-950/20 dark:via-slate-950 dark:to-emerald-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(66,133,244,0.05)_0%,transparent_60%)] pointer-events-none dark:opacity-30" />
        <div className="section-inner relative">
          <motion.div className="mx-auto max-w-3xl text-center" variants={staggerContainer} initial="hidden" whileInView="visible">
            <SectionBadge icon={UploadCloud} color="blue">Upload & Manage</SectionBadge>
            <motion.h2 variants={fadeInUp} className="font-display mt-4 text-4xl font-black sm:text-5xl text-slate-900 dark:text-white">
              How it works for <span className="text-gd-blue">developers</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Users upload files → Admin sees who uploaded, what, and when → Manage multiple Google Drives → Full control from dashboard.
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12"
          >
            <DeveloperDashboardPreview />
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══ HOW IT WORKS ═══ */}
      <AnimatedSection id="how-it-works" className="bg-gradient-to-b from-amber-50/30 to-white relative overflow-hidden py-16 sm:py-20 dark:from-amber-950/20 dark:to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(251,188,4,0.06)_0%,transparent_60%)] pointer-events-none dark:opacity-30" />
        <div className="section-inner relative">
          <motion.div className="mx-auto max-w-3xl text-center" variants={staggerContainer} initial="hidden" whileInView="visible">
            <SectionBadge icon={RefreshCw} color="yellow">Data Flow</SectionBadge>
            <motion.h2 variants={fadeInUp} className="font-display mt-4 text-4xl font-black sm:text-5xl text-slate-900 dark:text-white">
              <span className="text-amber-600 dark:text-amber-400">How It Works</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              From login to download — a simple 5-step pipeline.
            </motion.p>
          </motion.div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {flowSteps.map((s, i) => (
              <motion.div
                key={s.step}
                custom={i}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.03 }}
                className="relative rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:hover:shadow-slate-900/50"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 ring-2 ring-amber-200 dark:bg-amber-950/30 dark:ring-amber-900/30">
                  <span className="font-display text-xl font-black text-amber-600 dark:text-amber-400">{s.step}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
                {i < flowSteps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 dark:bg-slate-900 dark:border-slate-700">
                    <ChevronRight className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ═══ TECH STACK ═══ */}
      <AnimatedSection id="tech" className="bg-slate-900 relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(66,133,244,0.08)_0%,transparent_50%)] pointer-events-none" />
        <div className="section-inner relative text-center">
          <motion.div initial={{ scale: 0.8 }} whileInView={{ scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 ring-2 ring-white/20 animate-float-slow">
              <Server className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h2 className="font-display mt-6 text-4xl font-black sm:text-5xl text-white">
            Modern <span className="bg-gradient-to-r from-gd-blue via-gd-green to-gd-yellow bg-clip-text text-transparent">Tech Stack</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            React + Redux on the frontend. Node.js + Express + MongoDB on the backend. Google Drive API for storage.
          </p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            {techStack.map((t, i) => (
              <motion.span
                key={t}
                custom={i}
                variants={fadeInScale}
                whileHover={{ scale: 1.1, y: -3 }}
                className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/10 transition hover:bg-white/20 hover:ring-white/30 cursor-default"
              >
                {t}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3"
          >
            {[
              { title: 'No CDN needed', desc: 'Private backend streaming', icon: Globe },
              { title: 'Secrets safe', desc: 'Tokens never in frontend', icon: Lock },
              { title: 'Admin controlled', desc: 'Users register, admin uploads', icon: Shield },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.02 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left transition-all duration-300 hover:bg-white/10 hover:border-white/20 cursor-default"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <item.icon className="h-6 w-6 text-white/80" />
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══ CTA ═══ */}
      <section className="relative bg-white overflow-hidden py-16 sm:py-20 dark:bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/30 pointer-events-none dark:from-blue-950/20 dark:via-slate-950 dark:to-emerald-950/20" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 sm:p-16 shadow-xl text-center dark:border-slate-800 dark:bg-slate-950">
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="mx-auto flex h-20 w-32 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <GoogleDriveLogo className="h-12 w-auto" />
              </div>
            </motion.div>
            <h2 className="font-display mt-6 text-4xl font-black sm:text-5xl text-slate-900 dark:text-white">
              Ready to launch <span className="text-gradient-multi">CloudNest</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500 dark:text-slate-400">
              Users register on your site. Admins manage uploads, Google Drive, and audit logs from one dashboard.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="gd-btn-yellow btn-shine text-lg px-10 py-5 shadow-lg shadow-gd-yellow/20"
              >
                <Sparkles className="h-5 w-5" /> User Sign Up <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 px-10 py-5 text-base font-bold text-slate-600 transition-all duration-300 hover:border-gd-blue/30 hover:bg-blue-50 hover:text-gd-blue hover:scale-105 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-gd-blue"
              >
                <Fingerprint className="h-5 w-5" />
                Admin Login
              </Link>
              <Link
                to="/docs"
                className="group inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 px-8 py-5 text-base font-bold text-slate-400 transition-all duration-300 hover:border-gd-green/30 hover:bg-emerald-50 hover:text-gd-green hover:scale-105 dark:border-slate-700 dark:hover:border-gd-green/40 dark:hover:bg-emerald-950/30 dark:hover:text-gd-green"
              >
                <BookOpen className="h-5 w-5" />
                Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <Footer />
    </div>
  );
}