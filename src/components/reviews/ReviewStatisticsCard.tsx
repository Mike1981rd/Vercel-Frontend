'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { usePrimaryColor } from '@/contexts/PrimaryColorContext';
import { StarIcon, TrendingUpIcon, TrendingDownIcon } from '@/components/ui/Icons';

interface Statistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  positiveReviewsCount: number;
  positivePercentage: number;
  newReviewsThisWeek: number;
  weeklyGrowthPercentage: number;
  weeklyTrend: number[];
}

interface ReviewStatisticsCardProps {
  statistics: Statistics;
}

export function ReviewStatisticsCard({ statistics }: ReviewStatisticsCardProps) {
  const { t } = useI18n();
  const { primaryColor } = usePrimaryColor();

  const maxCount = Math.max(...Object.values(statistics.ratingDistribution));
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const maxTrend = Math.max(...(statistics.weeklyTrend || [1]));

  return (
    <>
      {/* Average Rating Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('reviews.averageRating', 'Average Rating')}
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {statistics.averageRating.toFixed(2)}
              </span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    size={20}
                    className={i < Math.round(statistics.averageRating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300 dark:text-gray-600'}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('reviews.totalReviews', '{{count}} total reviews', { count: statistics.totalReviews })}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2 mt-4">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-3">{rating}</span>
              <StarIcon size={14} className="text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${maxCount > 0 ? (statistics.ratingDistribution[rating] / maxCount) * 100 : 0}%`,
                    backgroundColor: primaryColor
                  }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-10 text-right">
                {statistics.ratingDistribution[rating] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* New Reviews Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('reviews.newReviews', 'New Reviews')}
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {statistics.newReviewsThisWeek}
              </span>
              {statistics.weeklyGrowthPercentage !== 0 && (
                <span className={`flex items-center gap-1 text-sm font-medium ${
                  statistics.weeklyGrowthPercentage > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {statistics.weeklyGrowthPercentage > 0 ? (
                    <TrendingUpIcon size={16} />
                  ) : (
                    <TrendingDownIcon size={16} />
                  )}
                  {Math.abs(statistics.weeklyGrowthPercentage).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('reviews.thisWeek', 'This week')}
            </p>
          </div>
        </div>

        {/* Weekly Trend Chart */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {t('reviews.weeklyReport', 'Weekly Report')}
          </p>
          <div className="flex items-end justify-between h-20 gap-1">
            {statistics.weeklyTrend?.map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t flex-1 relative">
                  <div 
                    className="absolute bottom-0 w-full rounded-t transition-all duration-300"
                    style={{ 
                      height: `${maxTrend > 0 ? (count / maxTrend) * 100 : 0}%`,
                      backgroundColor: primaryColor
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {days[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Positive Reviews Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('reviews.positiveReviews', 'Positive Reviews')}
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {statistics.positivePercentage.toFixed(0)}%
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('reviews.positiveCount', '{{count}} positive reviews', { count: statistics.positiveReviewsCount })}
            </p>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex justify-center mt-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={primaryColor}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - statistics.positivePercentage / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.positivePercentage.toFixed(0)}%
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('reviews.positive', 'Positive')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}