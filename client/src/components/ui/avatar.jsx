import React from 'react';
import { cn } from '../lib/utils';

export function Avatar({ src, alt, fallback, className, ...props }) {
  const initials = fallback
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DU';

  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm ring-1',
        'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full rounded-xl object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="font-black tracking-tight">{initials}</span>
      )}
    </span>
  );
}
