import React from 'react';
import { cn } from '../../lib/utils.js';

export function Card({ className, ...props }) {
  return (
    <section
      className={cn('rounded-lg border border-gray-200/80 bg-white shadow-panel', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('border-b border-gray-100 p-5', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />;
}
