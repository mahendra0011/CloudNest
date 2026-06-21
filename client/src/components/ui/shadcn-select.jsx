import React, { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils.js'

export function Select({ value, onValueChange, options = [], placeholder = 'Select...', className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2',
          'text-sm text-slate-700 transition-colors',
          'hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200'
        )}
      >
        <span className={cn(!value && 'text-slate-400')}>{selectedLabel}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-950">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => { onValueChange(option.value); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                value === option.value
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
              )}
            >
              {option.value && <Check className={cn('h-4 w-4', value !== option.value && 'opacity-0')} />}
              <span className={cn(!option.value && 'text-slate-400')}>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
