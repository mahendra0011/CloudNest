'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  const handleChange = (newValue) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;
  const isActive = ctx.value === value;

  return (
    <button
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        'px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
        isActive
          ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const ctx = useContext(TabsContext);
  if (!ctx || ctx.value !== value) return null;

  return (
    <div className={cn('mt-4', className)}>
      {children}
    </div>
  );
}
