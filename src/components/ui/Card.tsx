'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hoverable';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  onClick,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-background-secondary border border-border rounded-xl p-5 transition-all duration-200',
        variant === 'hoverable' && 'cursor-pointer hover:border-primary-hover hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};
