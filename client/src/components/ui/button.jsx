import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-emerald-600 text-white shadow-sm shadow-emerald-100 hover:bg-emerald-700',
        secondary: 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50',
        accent: 'bg-sky-600 text-white shadow-sm shadow-sky-100 hover:bg-sky-700',
        ghost: 'text-gray-600 hover:bg-gray-100',
        danger: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100'
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-11 px-4',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export const Button = React.forwardRef(function Button(
  { className, variant, size, asChild = false, ...props },
  ref
) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});
