import React from 'react'
import { cn } from '../../lib/utils.js'

const Table = React.forwardRef(function Table({ className, ...props }, ref) {
  return (
    <div className={cn('relative w-full overflow-x-auto', className)} {...props}>
      <table
        ref={ref}
        className={cn(
          'w-full caption-bottom text-sm',
        )}
        {...props}
      />
    </div>
  )
})

function TableHeader({ className, ...props }) {
  return (
    <thead
      className={cn(
        '[&_tr]:border-b [&_tr]:border-slate-200 dark:[&_tr]:border-slate-800',
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }) {
  return (
    <tbody
      className={cn(
        '[&_tr:last-child]:border-0',
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        'border-b border-slate-200 transition-colors hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-900/50',
        'data-[state=selected]:bg-slate-100 dark:data-[state=selected]:bg-slate-800',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        'h-12 px-4 text-left align-middle font-bold text-xs text-slate-500 uppercase tracking-wider',
        'dark:text-slate-400',
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }) {
  return (
    <td
      className={cn(
        'p-4 align-middle',
        className
      )}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
