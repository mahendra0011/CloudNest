import React, { useEffect } from 'react';
import { cn } from '../lib/utils';

function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') onOpenChange?.(false);
    };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>
  );
}

function DialogContent({ className, children }) {
  return (
    <div
      className={cn(
        'relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl',
        'dark:border-slate-800 dark:bg-slate-900',
        'max-h-[85vh] overflow-y-auto',
        className
      )}
    >
      {children}
    </div>
  );
}

function DialogHeader({ className, children }) {
  return (
    <div className={cn('flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800', className)}>
      {children}
    </div>
  );
}

function DialogTitle({ children, className }) {
  return <h3 className={cn('text-base font-bold', className)}>{children}</h3>;
}

function DialogBody({ className, children }) {
  return <div className={cn('p-5 space-y-4', className)}>{children}</div>;
}

function DialogFooter({ className, children }) {
  return (
    <div className={cn('flex items-center justify-end gap-3 border-t border-slate-200 p-5 dark:border-slate-800', className)}>
      {children}
    </div>
  );
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter };
