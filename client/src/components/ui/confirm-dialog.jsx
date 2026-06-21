import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>
            <AlertTriangle className={cn('h-5 w-5', variant === 'danger' ? 'text-red-500' : 'text-amber-500')} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{title || 'Are you sure?'}</h3>
            {message && <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} className={variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { cn } from '../../lib/utils';
