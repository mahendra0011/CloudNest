import React from 'react'
import { cn } from '../../lib/utils.js'

export const ShadInput = React.forwardRef(function ShadInput({ className, type = 'text', ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm',
        'text-slate-900 placeholder:text-slate-400',
        'transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100',
        'dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20',
        className
      )}
      {...props}
    />
  )
})

export const Input = ShadInput
export default ShadInput
