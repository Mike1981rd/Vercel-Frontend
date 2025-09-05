'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AlertProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

interface AlertDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function Alert({ children, className, variant = 'default' }: AlertProps) {
  return (
    <div
      className={cn(
        'relative w-full rounded-xl border px-4 py-3 text-sm',
        {
          'border-gray-200 bg-gray-50 text-gray-800': variant === 'default',
          'border-red-200 bg-red-50 text-red-800': variant === 'destructive',
          'border-amber-200 bg-amber-50 text-amber-800': variant === 'warning',
          'border-green-200 bg-green-50 text-green-800': variant === 'success',
        },
        className
      )}
    >
      <div className="flex items-start space-x-3">
        {children}
      </div>
    </div>
  );
}

export function AlertDescription({ children, className }: AlertDescriptionProps) {
  return (
    <div className={cn('text-sm leading-relaxed', className)}>
      {children}
    </div>
  );
}