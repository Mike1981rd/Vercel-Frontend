'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { useI18n } from '@/contexts/I18nContext';

const getMockWeeklySales = (t: (key: string, fallback?: string) => string) => ({
  total: 28450,
  change: 15.2,
  categories: [
    { name: t('dashboard.rooms', 'Habitaciones'), count: 18, percentage: 45 },
    { name: t('dashboard.products', 'Productos'), count: 43, percentage: 35 },
    { name: t('dashboard.services', 'Servicios'), count: 25, percentage: 20 }
  ]
});

export function WeeklySales() {
  const { t } = useI18n();
  const mockWeeklySales = getMockWeeklySales(t);
  
  return (
    <Card variant="gradient" color="primary" className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-white/80 text-sm font-medium mb-1">
              {t('dashboard.weeklySales', 'Weekly Sales')}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                ${mockWeeklySales.total.toLocaleString()}
              </span>
              <span className="text-green-200 text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                +{mockWeeklySales.change}%
              </span>
            </div>
          </div>
          
          {/* 3D-like circular chart representation */}
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="8"
                fill="none"
              />
              
              {/* Progress circles for each category */}
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#22c55e"
                strokeWidth="8"
                strokeDasharray={`${mockWeeklySales.categories[0].percentage * 2.01} 201`}
                strokeDashoffset="0"
                fill="none"
                strokeLinecap="round"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray={`${mockWeeklySales.categories[1].percentage * 2.01} 201`}
                strokeDashoffset={`-${mockWeeklySales.categories[0].percentage * 2.01}`}
                fill="none"
                strokeLinecap="round"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#f59e0b"
                strokeWidth="8"
                strokeDasharray={`${mockWeeklySales.categories[2].percentage * 2.01} 201`}
                strokeDashoffset={`-${(mockWeeklySales.categories[0].percentage + mockWeeklySales.categories[1].percentage) * 2.01}`}
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Center percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {mockWeeklySales.categories[0].percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Categories breakdown */}
        <div className="space-y-3">
          {mockWeeklySales.categories.map((category, index) => {
            const colors = ['#22c55e', '#3b82f6', '#f59e0b'];
            return (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <span className="text-white/90 text-sm">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">
                    {category.count}
                  </span>
                  <span className="text-white/60 text-xs">
                    {category.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mini product showcase (like Apple Watch in Materialize) */}
        <div className="mt-6 flex justify-center">
          <div className="relative">
            {/* Simplified hotel/product icon */}
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-white/5 rounded-xl blur-sm"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}