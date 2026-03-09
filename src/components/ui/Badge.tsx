'use client';

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
  {
    variants: {
      variant: {
        purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
        green: 'bg-green-500/15 text-green-400 border-green-500/20',
        yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
        red: 'bg-red-500/15 text-red-400 border-red-500/20',
        blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
        pink: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
      },
    },
    defaultVariants: {
      variant: 'purple',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof badgeVariants> { }

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
