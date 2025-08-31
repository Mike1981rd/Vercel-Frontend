'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsWidgetProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
}

export default function StatsWidget({ title, value, icon, trend }: StatsWidgetProps) {
  return (
    <div className="p-4 rounded-lg bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
          <div className="text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            trend > 0
              ? 'text-green-500'
              : trend < 0
              ? 'text-red-500'
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : trend < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {title}
        </div>
      </div>
    </div>
  );
}