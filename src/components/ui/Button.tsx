'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-primary hover:bg-primary-hover text-white focus:ring-primary',
      secondary: 'bg-success hover:bg-success/90 text-white focus:ring-success',
      outline:
        'border border-border hover:border-primary-hover text-text-secondary hover:text-primary bg-transparent',
      ghost: 'hover:bg-background-tertiary text-text-secondary hover:text-primary bg-transparent',
      danger: 'bg-danger hover:bg-danger/90 text-white focus:ring-danger',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {LeftIcon && <LeftIcon className="w-4 h-4" />}
            <span>{children}</span>
            {RightIcon && <RightIcon className="w-4 h-4" />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
