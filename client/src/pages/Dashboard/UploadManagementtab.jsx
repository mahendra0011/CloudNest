import React, { useState }, { useState }, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  Calendar,
  ChevronDown,
  RefreshCw,
  X,
  Eye,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Square,
  CheckSquare,
  ArrowUpDown,
  HardDrive,
  Upload,
  AlertCircle,
  File as FileIcon,
  FileImage,
  FileArchive,
  Video,
  Loader2,
  Inbox,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  SortAsc,
  SortDesc,
  Filter,
  Image,
  Film,
  Archive,
  FileText,
  Table as TableIcon,
  Presentation,
  Code,
  Sparkles,
  DownloadCloud,
  Globe,
  FileWarning,
  FileSpreadsheet,
  FileType,
} from 'lucide-react';
import { fetchFiles, deleteFile } from '../../features/files/filesSlice';
import { fetchDrives } from '../../features/drives/drivesSlice';
import { downloadUrl, adminUploadFile } from '../../lib/api';
import { cn, formatBytes, formatDate } from '../../lib/utils';

/* ─────────────────────────────────────────────
   Status Colors
───────────────────────────────────────────── */
const STATUS_STYLES = {
  uploaded: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    label: 'Uploaded',
  },
  processing: {
    dot: 'bg-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    label: 'Processing',
  },
  error: {
    dot: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    label: 'Failed',
  },
};

function getFileStatus(file) {
  if (!file.driveFileId) return STATUS_STYLES.processing;
  if (file.error) return STATUS_STYLES.error;
  return STATUS_STYLES.uploaded;
}

/* ─────────────────────────────────────────────
   File type icon mapping
───────────────────────────────────────────── */
const FILE_META = {
  image: {
    bg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    icon: Image,
    label: 'IMG',
  },
  video: {
    bg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    icon: Film,
    label: 'VID',
  },
  archive: {
    bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    icon: Archive,
    label: 'ARC',
  },
  document: {
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    icon: FileText,
    label: 'DOC',
  },
  spreadsheet: {
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    icon: TableIcon,
    label: 'XLS',
  },
  presentation: {
    bg: 'bg-gradient-to-br from-orange-500 to-red-600',
    icon: Presentation,
    label: 'PPT',
  },
  pdf: {
    bg: 'bg-gradient-to-br from-red-500 to-rose-600',
    icon: FileWarning,
    label: 'PDF',
  },
  text: {
    bg: 'bg-gradient-to-br from-slate-500 to-slate-600',
    icon: FileSpreadsheet,
    label: 'TXT',
  },
  code: {
    bg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    icon: Code,
    label: 'CODE',
  },
  other: {
    bg: 'bg-gradient-to-br from-slate-400 to-slate-500',
    icon: FileIcon,
    label: 'FILE',
  },
};

function getFileMeta(mimeType = '', name = '') {
  const ext = name.split('.').pop()?.toLowerCase();
  if (mimeType.startsWith('image/') || ['png','jpg','jpeg','gif','svg','webp','ico'].includes(ext)) return FILE_META.image;
  if (mimeType.startsWith('video/') || ['mp4','webm','avi','mkv','mov'].includes(ext)) return FILE_META.video;
  if (['zip','rar','7z','tar','gz'].includes(ext)) return FILE_META.archive;
  if (['pdf'].includes(ext)) return FILE_META.pdf;
  if (['doc','docx','odt','rtf'].includes(ext)) return FILE_META.document;
  if (['xls','xlsx','csv','ods'].includes(ext)) return FILE_META.spreadsheet;
  if (['ppt','pptx','odp'].includes(ext)) return FILE_META.presentation;
  if (['txt','log','md'].includes(ext)) return FILE_META.text;
  if (['js','ts','jsx','tsx','py','java','cpp','c','h','html','css','json','xml','yaml','yml','sh','bat','go','rs','rb','php'].includes(ext)) return FILE_META.code;
  return FILE_META.other;
}

/* ── File type badge styles ── */
const FILE_BADGE = {
  PDF:  { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', ring: 'ring-red-200 dark:ring-red-900/30' },
  DOCX: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-200 dark:ring-blue-900/30' },
  DOC:  { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-200 dark:ring-blue-900/30' },
  XLSX: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', ring: 'ring-green-200 dark:ring-green-900/30' },
  XLS:  { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', ring: 'ring-green-200 dark:ring-green-900/30' },
  PNG:  { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-200 dark:ring-purple-900/30' },
  JPG:  { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-200 dark:ring-purple-900/30' },
  JPEG: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-200 dark:ring-purple-900/30' },
  GIF:  { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-200 dark:ring-purple-900/30' },
  SVG:  { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-200 dark:ring-purple-900/30' },
  PPTX: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-200 dark:ring-orange-900/30' },
  PPT:  { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-200 dark:ring-orange-900/30' },
  MP4:  { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-200 dark:ring-indigo-900/30' },
  ZIP:  { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-200 dark:ring-amber-900/30' },
};

function getFileBadge(label) {
  const lookup = label.toUpperCase();
  return FILE_BADGE[lookup] || { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', ring: 'ring-slate-200 dark:ring-slate-700' };
}

/* ── Date filter options ── */
const DATE_FILTERS = [
  { value: 'all', label: 'All Dates' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
];

/* ── Sort options ── */
const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'originalName-asc', label: 'Name A–Z' },
  { value: 'originalName-desc', label: 'Name Z–A' },
  { value: 'size-desc', label: 'Largest First' },
  { value: 'size-asc', label: 'Smallest First' },
];

/* ── Pagination helper ── */
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('...');
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push('...');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('...');
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push('...');
    pages.push(total);
  }
  return pages;
}

/* ── Skeleton loader ── */
function TableSkeleton({ rows = 6 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-48 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-3 flex-1">
            <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

/* ── Dropdown component ── */
function Dropdown({ label, icon: Icon, value, options, onChange, className, width }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentOption = options.find((o) => o.value === value);
  const currentLabel = currentOption?.label || label;
  const CurrentIcon = currentOption?.icon;

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm transition-all duration-200 bg-white dark:bg-slate-900',
          'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:text-slate-300',
          open && 'ring-2 ring-blue-500/20 border-blue-400',
          width || 'w-auto'
        )}
      >
        {Icon && <Icon className="h-4 w-4 text-slate-400 shrink-0" />}
        <span className="truncate">{currentLabel}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className={cn(
          'absolute top-full left-0 mt-1 z-40 min-w-[200px] rounded-lg border shadow-lg bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 overflow-hidden'
        )}>
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((opt) => {
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2.5',
                    value === opt.value
                      ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/30 dark:text-blue-400'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                  )}
                >
                  {OptIcon && <OptIcon className="h-4 w-4 shrink-0" />}
                  <span className="flex-1">{opt.label}</span>
                  {opt.count !== undefined && (
                    <span className={cn(
                      'text-[10px] font-bold rounded-full px-1.5 py-0.5',
                      value === opt.value ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    )}>
                      {opt.count}
                    </span>
                  )}
                  {value === opt.value && (
                    <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 dark:text-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Date Range Picker ── */
function DateRangePicker({ from, to, onFromChange, onToChange, onApply }) {
  return (
    <div className="flex items-center gap-2">
      <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" />
      <span className="text-slate-400 text-xs">→</span>
      <input type="date" value={to} onChange={(e) => onToChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" />
      <button onClick={onApply} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors">
        Apply
      </button>
    </div>
  );
}

/* ── Format date time for table ── */
function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

/* ══════════════════════════════════════════
    Main Component
═══════════════════════════════════════════ */
export default function UploadManagementUI({ activeDriveId = '', activeDrive = null, selectedDriveIds = [], selectedDrives = [] }) {
   const dispatch = useDispatch();
   const { items: files, status, error } = useSelector((state) => state.files);

   // Use selected drives or fall back to active drive for display
  // If selectedDrives is empty, don't show any drive data (Case 1: all Show Data off)
  const drivesToShow = selectedDrives.length > 0 ? selectedDrives : [];

   const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt-desc');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [typeFilter, setTypeFilter] = useState('all');
  const [perPage, setPerPage] = useState(10);

  /* ── Upload modal ── */
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadUserName, setUploadUserName] = useState('');
  const [uploadUserEmail, setUploadUserEmail] = useState('');
  const [uploadDriveId, setUploadDriveId] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const { drives = [] } = useSelector((state) => state.drives);

  useEffect(() => {
    dispatch(fetchDrives());
  }, [dispatch]);

// Match DashboardPage logic: all-off=['none'] for empty result, otherwise pass selected IDs
  const effectiveDriveIds = selectedDriveIds.length === 0 ? ['none'] : selectedDriveIds;

  const openUploadModal = () => {
    setUploadFile(null);
    setUploadUserName('');
    setUploadUserEmail('');
    setUploadDriveId('');
    setUploadProgress(0);
    setUploadError('');
    setUploadModal(true);
  };

  const closeUploadModal = () => {
    if (uploading) return;
    setUploadModal(false);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    setUploading(true);
    setUploadError('');
    setUploadProgress(0);
    try {
      await adminUploadFile(
        uploadFile,
        { userName: uploadUserName, userEmail: uploadUserEmail, driveId: uploadDriveId },
        (pct) => setUploadProgress(pct)
      );
      setUploadModal(false);
      // Refresh with selected drive filter to maintain filtered data view
      dispatch(fetchFiles(effectiveDriveIds));
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  /* ── Confirm delete modal ── */
  const [confirmModal, setConfirmModal] = useState({ open: false, ids: [], count: 0, fileName: '' });
  const [isConfirming, setIsConfirming] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());


  /* ── Sorted & filtered ── */
  const processedFiles = useMemo(() => {
    let list = [...files];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((f) =>
        (f.originalName || '').toLowerCase().includes(q) ||
        (f.user?.name || '').toLowerCase().includes(q) ||
        (f.user?.email || '').toLowerCase().includes(q) ||
        (f.mimeType || '').toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      const exts = {
        image: ['png','jpg','jpeg','gif','svg','webp','ico','bmp','avif'],
        video: ['mp4','webm','avi','mkv','mov','wmv','flv'],
        archive: ['zip','rar','7z','tar','gz','bz2','xz'],
        document: ['doc','docx','odt','rtf'],
        spreadsheet: ['xls','xlsx','csv','ods'],
        presentation: ['ppt','pptx','odp'],
        text: ['txt','log','md'],
        pdf: ['pdf'],
        code: ['js','ts','jsx','tsx','py','java','cpp','c','h','html','css','json','xml','yaml','yml','sh','go','rs','rb','php'],
      };
      const extSet = new Set(exts[typeFilter] || []);
      list = list.filter((f) => {
        const ext = f.originalName?.split('.').pop()?.toLowerCase();
        return extSet.has(ext);
      });
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      if (dateFilter === 'today') {
        list = list.filter((f) => new Date(f.createdAt).toDateString() === now.toDateString());
      } else if (dateFilter === 'yesterday') {
        const y = new Date(now); y.setDate(y.getDate() - 1);
        list = list.filter((f) => new Date(f.createdAt).toDateString() === y.toDateString());
      } else if (dateFilter === '7days') {
        const d = new Date(now); d.setDate(d.getDate() - 7);
        list = list.filter((f) => new Date(f.createdAt) >= d);
      } else if (dateFilter === '30days') {
        const d = new Date(now); d.setDate(d.getDate() - 30);
        list = list.filter((f) => new Date(f.createdAt) >= d);
      } else if (dateFilter === 'custom') {
        if (dateRange.from) list = list.filter((f) => new Date(f.createdAt) >= new Date(dateRange.from));
        if (dateRange.to) {
          const to = new Date(dateRange.to); to.setHours(23, 59, 59, 999);
          list = list.filter((f) => new Date(f.createdAt) <= to);
        }
      }
    }

    const [field, dir] = sortBy.split('-');
    list.sort((a, b) => {
      let cmp = 0;
      if (field === 'createdAt') cmp = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      else if (field === 'originalName') cmp = (a.originalName || '').localeCompare(b.originalName || '');
      else if (field === 'size') cmp = Number(a.size || 0) - Number(b.size || 0);
      return dir === 'desc' ? -cmp : cmp;
    });

    return list;
  }, [files, searchQuery, typeFilter, dateFilter, dateRange, sortBy]);

  const totalItems = processedFiles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(page, totalPages);
  const paginatedFiles = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return processedFiles.slice(start, start + perPage);
  }, [processedFiles, safePage]);

  useEffect(() => { setPage(1); setSelectedIds([]); }, [searchQuery, typeFilter, dateFilter, dateRange, sortBy]);

  /* ── Selection ── */
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  }, []);

  const toggleSelectAll = useCallback(() => {
    const currentIds = paginatedFiles.map((f) => f.id);
    const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => { const s = new Set(prev); currentIds.forEach((id) => s.add(id)); return Array.from(s); });
    }
  }, [paginatedFiles, selectedIds]);

  /* ── Delete ── */
  const handleDelete = useCallback(async (fileId) => {
    if (deletingIds.has(fileId)) return;
    setDeletingIds((prev) => new Set(prev).add(fileId));
    try { await dispatch(deleteFile(fileId)).unwrap(); } catch { /* handled */ }
    finally {
      setDeletingIds((prev) => { const n = new Set(prev); n.delete(fileId); return n; });
      setSelectedIds((prev) => prev.filter((id) => id !== fileId));
    }
  }, [dispatch, deletingIds]);

  const openConfirmModal = useCallback((ids) => {
    if (ids.length === 0) return;
    const file = files.find((f) => f.id === ids[0]);
    setConfirmModal({ open: true, ids, count: ids.length, fileName: file?.originalName || 'Unknown file' });
  }, [files]);

  const executeDelete = useCallback(async () => {
    setIsConfirming(true);
    const { ids } = confirmModal;
    try { await Promise.all(ids.map((id) => dispatch(deleteFile(id)).unwrap())); } catch { /* handled */ }
    finally {
      setIsConfirming(false);
      setConfirmModal({ open: false, ids: [], count: 0, fileName: '' });
      setSelectedIds([]);
    }
  }, [confirmModal, dispatch]);

  const closeConfirmModal = useCallback(() => {
    if (isConfirming) return;
    setConfirmModal({ open: false, ids: [], count: 0, fileName: '' });
  }, [isConfirming]);

  /* ── View / Download / Drive ── */
  const handleView = useCallback((file) => {
    if (file.webViewLink) window.open(file.webViewLink, '_blank', 'noopener,noreferrer');
  }, []);

  const handleDownload = useCallback((file) => {
    const url = downloadUrl(file.id);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.originalName || 'download';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }, []);

  const handleOpenDrive = useCallback((file) => {
    if (file.webViewLink) window.open(file.webViewLink, '_blank', 'noopener,noreferrer');
  }, []);

  const handleRefresh = useCallback(() => {
    dispatch(fetchFiles(effectiveDriveIds));
    setSelectedIds([]);
  }, [dispatch, effectiveDriveIds]);

  const isLoading = status === 'loading';
  const totalSize = files.reduce((sum, f) => sum + Number(f.size || 0), 0);
  const hasActiveFilters = typeFilter !== 'all' || dateFilter !== 'all' || searchQuery !== '';
  const pageNumbers = getPageNumbers(safePage, totalPages);

  const clearAllFilters = () => {
    setTypeFilter('all');
    setDateFilter('all');
    setDateRange({ from: '', to: '' });
    setSearchQuery('');
  };

  return (
    <div className="bg-white min-h-full w-full dark:bg-slate-950">
      {/* ════════════════════════════════════ */}
      {/* ZONE 1 — Page Header                */}
      {/* ════════════════════════════════════ */}
      <div className="flex items-start justify-between mb-7">
        {/* Left */}
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1a2e] tracking-tight dark:text-white">
            Upload Management
          </h1>
          <p className="mt-1 text-[13px] text-[#9ca3af] dark:text-slate-500">
            Manage and monitor all uploaded files
          </p>
          {drivesToShow.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 flex-wrap dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400">
              <HardDrive className="h-3.5 w-3.5" />
              <span>Showing uploads from:</span>
              {drivesToShow.map((d) => (
                <span key={d._id} className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800 font-medium dark:bg-blue-900/30 dark:text-blue-400">
                  {d.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right side: Stat card + Admin user */}
        <div className="flex items-center gap-6">
          {/* Stat Card */}
          <div className="flex items-center gap-4 px-5 py-3 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-right">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#9ca3af] dark:text-slate-500">
                Total Uploaded Files
              </p>
              <p className="text-[28px] font-bold text-[#2563eb] mt-0.5 dark:text-blue-400">
                {files.length.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 shrink-0 dark:bg-blue-950/30 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={openUploadModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-sm hover:bg-blue-700 hover:shadow-md transition-all"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════ */}
      {/* ZONE 2 — Filter & Search Toolbar    */}
      {/* ════════════════════════════════════ */}
      <div className="mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative min-w-[280px] max-w-[40%] shrink-0">
            <input
              type="text"
              placeholder="Search by file name, user name, email, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[13px] text-slate-700 placeholder-[#9ca3af] rounded-lg border border-slate-200 bg-white pl-4 pr-10 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:placeholder-slate-500"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* File Type Filter */}
          <Dropdown
            label="File Type"
            icon={Filter}
            value={typeFilter}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'image', label: 'Images' },
              { value: 'video', label: 'Videos' },
              { value: 'archive', label: 'Archives' },
              { value: 'document', label: 'Documents' },
              { value: 'spreadsheet', label: 'Spreadsheets' },
              { value: 'presentation', label: 'Presentations' },
              { value: 'pdf', label: 'PDFs' },
              { value: 'text', label: 'Text' },
              { value: 'code', label: 'Code' },
            ]}
            onChange={(val) => { setTypeFilter(val); setPage(1); }}
            className="shrink-0"
          />

          {/* Filter by Date Dropdown */}
          <Dropdown
            label="Filter by Date"
            icon={Calendar}
            value={dateFilter}
            options={DATE_FILTERS}
            onChange={(val) => { setDateFilter(val); setPage(1); }}
            className="shrink-0"
          />
          {dateFilter === 'custom' && (
            <DateRangePicker
              from={dateRange.from}
              to={dateRange.to}
              onFromChange={(v) => setDateRange((p) => ({ ...p, from: v }))}
              onToChange={(v) => setDateRange((p) => ({ ...p, to: v }))}
              onApply={() => setPage(1)}
            />
          )}

          {/* Sort By Dropdown */}
          <Dropdown
            label="Sort By"
            icon={ArrowUpDown}
            value={sortBy}
            options={SORT_OPTIONS}
            onChange={setSortBy}
            className="shrink-0"
          />

          {/* Items per page */}
          <Dropdown
            label="Per Page"
            icon={null}
            value={String(perPage)}
            options={[
              { value: '10', label: '10 per page' },
              { value: '25', label: '25 per page' },
              { value: '50', label: '50 per page' },
            ]}
            onChange={(val) => { setPerPage(Number(val)); setPage(1); }}
            className="shrink-0"
          />

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 shrink-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:border-slate-600"
            title="Refresh"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Active Filters */}
        {(typeFilter !== 'all' || dateFilter !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-slate-400 dark:text-slate-500">Active Filters:</span>
            {typeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30">
                {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                <button onClick={() => { setTypeFilter('all'); }} className="hover:text-blue-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30">
                {DATE_FILTERS.find((d) => d.value === dateFilter)?.label}
                <button onClick={() => { setDateFilter('all'); setDateRange({ from: '', to: '' }); }} className="hover:text-blue-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30">
                Search: &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery('')} className="hover:text-blue-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════ */}
      {/* ZONE 3 — Data Table                 */}
      {/* ════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-950 dark:border-slate-800">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              disabled={paginatedFiles.length === 0}
              className="text-slate-400 hover:text-blue-600 transition-colors dark:hover:text-blue-400"
            >
              {selectedIds.length > 0 && paginatedFiles.length > 0 && paginatedFiles.every((f) => selectedIds.includes(f.id))
                ? <CheckSquare className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                : <Square className="h-4.5 w-4.5" />
              }
            </button>
            <button
              disabled={selectedIds.length === 0}
              onClick={() => openConfirmModal(selectedIds)}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                selectedIds.length > 0
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 dark:border-red-900/30'
                  : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed dark:bg-slate-900 dark:text-slate-500 dark:border-slate-800'
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Bulk Delete
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {totalItems > 0
                ? `Showing ${Math.min(1 + (safePage - 1) * perPage, totalItems)} to ${Math.min(safePage * perPage, totalItems)} of ${totalItems.toLocaleString()} entries`
                : 'No entries'}
            </span>
            {/* Mini pagination */}
            <div className="flex items-center gap-0.5">
              <button onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage <= 1}
                className="flex items-center justify-center w-7 h-7 rounded text-sm disabled:opacity-30 hover:bg-slate-100 transition-colors text-slate-500 dark:hover:bg-slate-800 dark:text-slate-400">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {pageNumbers.slice(0, 5).map((p, i) =>
                p === '...' ? (
                  <span key={`t-${i}`} className="flex items-center justify-center w-7 h-7 text-xs text-slate-400 dark:text-slate-500">…</span>
                ) : (
                  <button key={`t-${i}`} onClick={() => setPage(p)}
                    className={cn(
                      'flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full transition-all',
                      p === safePage ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}>
                    {p}
                  </button>
                )
              )}
              <button onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage >= totalPages}
                className="flex items-center justify-center w-7 h-7 rounded text-sm disabled:opacity-30 hover:bg-slate-100 transition-colors text-slate-500 dark:hover:bg-slate-800 dark:text-slate-400">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-3 bg-red-50 border-b border-red-100 dark:bg-red-950/20 dark:border-red-900/30">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button onClick={handleRefresh} className="ml-auto text-xs font-semibold text-red-600 hover:text-red-700 underline dark:text-red-400">
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f9fafb] text-[13px] font-medium text-[#374151] dark:bg-slate-900 dark:text-slate-300">
                <th className="py-3.5 pl-5 w-10">
                  <button onClick={toggleSelectAll} disabled={paginatedFiles.length === 0} className="text-slate-400 hover:text-blue-600 transition-colors dark:hover:text-blue-400">
                    {selectedIds.length > 0 && paginatedFiles.length > 0 && paginatedFiles.every((f) => selectedIds.includes(f.id))
                      ? <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      : <Square className="h-4 w-4" />
                    }
                  </button>
                </th>
                {[
                  { label: 'User Email', key: 'user.email' },
                  { label: 'User Name', key: 'user.name' },
                  { label: 'File Name', key: 'originalName' },
                  { label: 'File Type', key: null },
                  { label: 'Upload Date & Time', key: 'createdAt' },
                  { label: 'Status', key: null },
                  { label: 'Actions', key: null, right: true },
                ].map((col) => {
                  const isActive = col.key && sortBy.startsWith(col.key);
                  return (
                    <th key={col.label} className={cn('py-3.5 pr-4 text-[13px] font-medium text-[#374151] whitespace-nowrap dark:text-slate-300', col.right && 'text-right pr-5')}>
                      {col.key ? (
                        <button onClick={() => {
                          const [field] = sortBy.split('-');
                          if (field === col.key) setSortBy(`${col.key}-${sortBy.endsWith('asc') ? 'desc' : 'asc'}`);
                          else setSortBy(`${col.key}-desc`);
                        }} className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors dark:hover:text-white">
                          {col.label}
                          <ArrowUpDown className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {isLoading && files.length === 0 ? (
                <tr><td colSpan={8} className="p-0"><TableSkeleton rows={6} /></td></tr>
) : paginatedFiles.length === 0 ? (
                 <tr>
                   <td colSpan={8}>
                     <div className="flex flex-col items-center justify-center py-16 text-center">
                       <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-slate-100 mb-4 dark:bg-slate-800">
                         {selectedDrives.length === 0 ? (
                           <HardDrive className="h-6 w-6 text-slate-400" />
                         ) : (
                           <Inbox className="h-6 w-6 text-slate-400" />
                         )}
                       </div>
                       <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                         {selectedDrives.length === 0 
                           ? 'No drives selected for data view' 
                           : (searchQuery ? 'No files match your search' : 'No uploaded files yet')}
                       </h3>
                       <p className="mt-1 text-sm text-slate-400 dark:text-slate-500 max-w-sm">
                         {selectedDrives.length === 0 
                           ? 'Enable "Show Data" toggles in Storage Management to see files here.'
                           : (searchQuery ? 'Try adjusting your search terms.' : 'Files uploaded by users will appear here once synced.')}
                       </p>
                       {selectedDrives.length > 0 && searchQuery ? (
                         <button onClick={() => setSearchQuery('')} className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700">
                           Clear search
                         </button>
                       ) : (
                         selectedDrives.length > 0 && !searchQuery && (
                           <button onClick={handleRefresh} className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                             <RefreshCw className="h-3.5 w-3.5" /> Refresh files
                           </button>
                         )
                       )}
                     </div>
                   </td>
                 </tr>
               ) : (
                paginatedFiles.map((file) => {
                  const isSelected = selectedIds.includes(file.id);
                  const isDeleting = deletingIds.has(file.id);
                  const meta = getFileMeta(file.mimeType, file.originalName);
                  const FileIconComp = meta.icon;
                  const badge = getFileBadge(meta.label);
                  const statusStyle = getFileStatus(file);

                  return (
                    <tr key={file.id} className={cn(
                      'transition-colors border-b border-[#f3f4f6] last:border-0 dark:border-slate-800',
                      isSelected ? 'bg-blue-50/30 dark:bg-blue-950/20' : 'hover:bg-[#f8fafc] dark:hover:bg-slate-900'
                    )}>
                      {/* Checkbox */}
                      <td className="py-4 pl-5">
                        <button onClick={() => toggleSelect(file.id)} className="text-slate-400 hover:text-blue-600 transition-colors dark:hover:text-blue-400">
                          {isSelected ? <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" /> : <Square className="h-4 w-4" />}
                        </button>
                      </td>

                      {/* User Email */}
                      <td className="py-4 pr-4">
                        <span className="text-sm text-slate-500 truncate max-w-[180px] block dark:text-slate-400">
                          {file.user?.email || <span className="italic text-slate-300 dark:text-slate-600">N/A</span>}
                        </span>
                      </td>

                      {/* User Name */}
                      <td className="py-4 pr-4">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {file.user?.name || file.user?.email?.split('@')[0] || 'Unknown'}
                        </span>
                      </td>

                      {/* File Name + Icon */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'flex items-center justify-center w-9 h-9 rounded-lg text-white text-[10px] font-extrabold shrink-0 shadow-sm',
                            meta.bg
                          )}>
                            {FileIconComp ? <FileIconComp className="h-5 w-5" strokeWidth={1.5} /> : meta.label}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-slate-800 truncate block max-w-[200px] dark:text-slate-200" title={file.originalName}>
                              {file.originalName}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">{formatBytes(file.size)}</span>
                          </div>
                        </div>
                      </td>

                      {/* File Type Badge */}
                      <td className="py-4 pr-4">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-md ring-1',
                          badge.bg, badge.text, badge.ring
                        )}>
                          {meta.label}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 pr-4 whitespace-nowrap">
                        <span className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(file.createdAt)}</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 pr-4">
                        <span className={cn('inline-flex items-center gap-1.5 text-sm', statusStyle.text)}>
                          <span className={cn('w-2 h-2 rounded-full', statusStyle.dot)} />
                          {statusStyle.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View */}
                          <button onClick={() => handleView(file)} disabled={!file.webViewLink}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-blue-950/30"
                            title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          {/* Download */}
                          <button onClick={() => handleDownload(file)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all dark:hover:bg-blue-950/30"
                            title="Download">
                            <Download className="h-4 w-4" />
                          </button>
                          {/* Google Drive */}
                          <button onClick={() => handleOpenDrive(file)} disabled={!file.webViewLink}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md hover:-translate-y-0.5 dark:bg-slate-800"
                            title="Open in Drive">
                            <svg className="w-5 h-5 shrink-0" width="16" height="16" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Google Drive">
                              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
                              <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
                              <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
                              <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
                              <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
                              <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button onClick={() => openConfirmModal([file.id])} disabled={isDeleting}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 dark:hover:bg-red-950/30"
                            title="Delete">
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {paginatedFiles.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-[#f9fafb]/50 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500">Items per page:</span>
              <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700">
                {perPage}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={safePage <= 1}
                className="flex items-center justify-center w-8 h-8 rounded text-sm disabled:opacity-30 hover:bg-slate-200 transition-colors text-slate-500 dark:hover:bg-slate-800 dark:text-slate-400">
                <span className="text-xs font-bold">«</span>
              </button>
              <button onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage <= 1}
                className="flex items-center justify-center w-8 h-8 rounded text-sm disabled:opacity-30 hover:bg-slate-200 transition-colors text-slate-500 dark:hover:bg-slate-800 dark:text-slate-400">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <span key={`b-${i}`} className="flex items-center justify-center w-8 h-8 text-xs text-slate-400 dark:text-slate-500">…</span>
                ) : (
                  <button key={`b-${i}`} onClick={() => setPage(p)}
                    className={cn(
                      'flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full transition-all',
                      p === safePage ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}>
                    {p}
                  </button>
                )
              )}
              <button onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage >= totalPages}
                className="flex items-center justify-center w-8 h-8 rounded text-sm disabled:opacity-30 hover:bg-slate-200 transition-colors text-slate-500 dark:hover:bg-slate-800 dark:text-slate-400">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={safePage >= totalPages}
                className="flex items-center justify-center w-8 h-8 rounded text-sm disabled:opacity-30 hover:bg-slate-200 transition-colors text-slate-500 dark:hover:bg-slate-800 dark:text-slate-400">
                <span className="text-xs font-bold">»</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════ */}
      {/* Upload Modal                         */}
      {/* ════════════════════════════════════ */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeUploadModal} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload File</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Upload on behalf of a user or yourself</p>
                </div>
              </div>
              <button onClick={closeUploadModal} disabled={uploading} className="text-slate-400 hover:text-slate-600 transition-colors dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* File Selection */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-300">File *</label>
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-all',
                  uploadFile
                    ? 'border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/20'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-blue-700 dark:hover:bg-slate-800',
                  uploading && 'opacity-60 cursor-not-allowed'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
                {uploadFile ? (
                  <>
                    <FileText className="h-5 w-5 text-blue-600 shrink-0 dark:text-blue-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate dark:text-slate-200">{uploadFile.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{formatBytes(uploadFile.size)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">Click to select a file</span>
                  </>
                )}
              </div>
            </div>

            {/* User Name */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-300">User Name</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Kumar"
                value={uploadUserName}
                onChange={(e) => setUploadUserName(e.target.value)}
                disabled={uploading}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:placeholder-slate-500"
              />
            </div>

            {/* User Email */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-300">User Email</label>
              <input
                type="email"
                placeholder="e.g. rajesh@example.com"
                value={uploadUserEmail}
                onChange={(e) => setUploadUserEmail(e.target.value)}
                disabled={uploading}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:placeholder-slate-500"
              />
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                If email matches an existing user, file is assigned to them. Otherwise it's assigned to admin.
              </p>
            </div>

            {/* Drive Selection */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-300">Upload to Drive</label>
              <select
                value={uploadDriveId}
                onChange={(e) => setUploadDriveId(e.target.value)}
                disabled={uploading}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                <option value="">Auto-select best drive</option>
                {drives.filter((d) => d.isActive).map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 dark:text-slate-400">
                  <span>Uploading...</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {uploadError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {uploadError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closeUploadModal}
                disabled={uploading}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={uploading || !uploadFile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-all"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeConfirmModal} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 shrink-0 dark:bg-red-950/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {confirmModal.count > 1 ? `Delete ${confirmModal.count} files?` : 'Delete file?'}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {confirmModal.count > 1
                    ? `${confirmModal.count} files will be permanently removed from Google Drive and the database.`
                    : `"${confirmModal.fileName}" will be permanently removed from Google Drive and the database.`}
                </p>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button onClick={closeConfirmModal} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all dark:text-slate-400 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={executeDelete} disabled={isConfirming}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm disabled:opacity-50 transition-all">
                {isConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirmModal.count > 1 ? `Delete ${confirmModal.count} files` : 'Delete file'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}