import React from 'react';
import { cn } from '../../lib/utils';

export function ProgressBar({ value = 0, max = 100, size = 'md', color = 'blue', showLabel = false, className }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    blue: 'bg-gd-blue',
    green: 'bg-gd-green',
    red: 'bg-gd-red',
    yellow: 'bg-amber-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colors[color] || colors.blue)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
