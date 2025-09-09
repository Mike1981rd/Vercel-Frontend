'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  help?: string;
  required?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function FormField({ 
  label, 
  children, 
  error, 
  help, 
  required = false, 
  icon,
  className 
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
        {icon && (
          <span className="flex-shrink-0">
            {icon}
          </span>
        )}
        <span>
          {label}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </span>
      </label>

      {/* Input Container */}
      <div className="relative">
        {children}
      </div>

      {/* Help Text */}
      {help && !error && (
        <div className="flex items-start space-x-2 text-xs text-gray-500">
          <HelpCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
          <span>{help}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start space-x-2 text-xs text-red-600">
          <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}