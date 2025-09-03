import React from 'react';
import { Card, CardContent } from './Card';
import { cn, formatNumber, formatCurrency, calculatePercentageChange } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'percentage' | 'number';
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
  description?: string;
  format?: 'number' | 'currency' | 'text';
  className?: string;
  variant?: 'default' | 'gradient';
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'percentage',
  icon,
  avatar,
  description,
  format = 'number',
  className,
  variant = 'default',
  color = 'primary'
}: MetricCardProps) {
  // Format the value based on type
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'number':
        return formatNumber(val);
      default:
        return val;
    }
  };

  // Format change value
  const formatChange = (changeVal: number) => {
    if (changeType === 'percentage') {
      return `${changeVal > 0 ? '+' : ''}${changeVal.toFixed(1)}%`;
    }
    return `${changeVal > 0 ? '+' : ''}${formatNumber(changeVal)}`;
  };

  // Get change color
  const getChangeColor = (changeVal: number) => {
    if (changeVal > 0) return 'text-success-500';
    if (changeVal < 0) return 'text-error-500';
    return 'text-gray-500 dark:text-gray-400';
  };

  // Get color classes
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    error: 'from-error-500 to-error-600',
  };

  return (
    <Card 
      variant={variant}
      className={cn(
        variant === 'gradient' && `bg-gradient-to-r ${colorClasses[color]}`,
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {icon && (
                <div className={cn(
                  'p-2 rounded-lg',
                  variant === 'gradient' 
                    ? 'bg-white/20' 
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                )}>
                  {icon}
                </div>
              )}
              <div>
                <p className={cn(
                  'text-sm font-medium',
                  variant === 'gradient' ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'
                )}>
                  {title}
                </p>
                {description && (
                  <p className={cn(
                    'text-xs',
                    variant === 'gradient' ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <span className={cn(
                'text-2xl font-bold',
                variant === 'gradient' ? 'text-white' : 'text-gray-900 dark:text-white'
              )}>
                {formatValue(value)}
              </span>

              {change !== undefined && (
                <span className={cn(
                  'text-sm font-medium flex items-center gap-1',
                  variant === 'gradient' 
                    ? change > 0 ? 'text-green-200' : 'text-red-200'
                    : getChangeColor(change)
                )}>
                  {change > 0 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : change < 0 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                  {formatChange(change)}
                </span>
              )}
            </div>
          </div>

          {avatar && (
            <div className="flex-shrink-0">
              {avatar}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Mini metric card for smaller spaces
interface MiniMetricCardProps {
  title: string;
  value: number | string;
  format?: 'number' | 'currency' | 'text';
  className?: string;
}

export function MiniMetricCard({
  title,
  value,
  format = 'number',
  className
}: MiniMetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'number':
        return formatNumber(val);
      default:
        return val;
    }
  };

  return (
    <div className={cn('p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600', className)}>
      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-1">{title}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatValue(value)}</p>
    </div>
  );
}