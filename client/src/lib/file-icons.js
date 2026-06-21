export function getFileIcon(mimeType) {
  const icons = {
    'application/pdf': { emoji: '📄', color: 'text-red-500' },
    'application/zip': { emoji: '📦', color: 'text-amber-500' },
    'application/json': { emoji: '📋', color: 'text-green-500' },
    'text/html': { emoji: '🌐', color: 'text-orange-500' },
    'text/javascript': { emoji: '⚙️', color: 'text-yellow-500' },
    'image/jpeg': { emoji: '🖼️', color: 'text-blue-500' },
    'image/png': { emoji: '🖼️', color: 'text-emerald-500' },
    'image/gif': { emoji: '🎞️', color: 'text-purple-500' },
    'image/webp': { emoji: '🖼️', color: 'text-cyan-500' },
    'video/mp4': { emoji: '🎬', color: 'text-violet-500' },
    'video/webm': { emoji: '🎬', color: 'text-indigo-500' },
    'audio/mpeg': { emoji: '🎵', color: 'text-pink-500' },
    'audio/wav': { emoji: '🎵', color: 'text-rose-500' },
    'text/plain': { emoji: '📝', color: 'text-slate-500' },
  };
  return icons[mimeType] || { emoji: '📁', color: 'text-slate-400' };
}

export function getCategoryIcon(category) {
  const icons = {
    document: '📄',
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    archive: '📦',
    code: '💻',
    other: '📁',
  };
  return icons[category] || '📁';
}
