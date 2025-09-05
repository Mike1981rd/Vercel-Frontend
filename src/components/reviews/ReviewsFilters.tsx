'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { usePrimaryColor } from '@/contexts/PrimaryColorContext';

interface ReviewsFiltersProps {
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
}

export function ReviewsFilters({
  selectedStatus,
  setSelectedStatus,
  selectedRating,
  setSelectedRating,
  selectedType,
  setSelectedType
}: ReviewsFiltersProps) {
  const { t } = useI18n();
  const { primaryColor } = usePrimaryColor();

  return (
    <>
      {/* Status Filter */}
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2"
        style={{ '--tw-ring-color': primaryColor } as any}
      >
        <option value="">{t('reviews.allStatus', 'All Status')}</option>
        <option value="Pending">{t('reviews.pending', 'Pending')}</option>
        <option value="Approved">{t('reviews.approved', 'Approved')}</option>
        <option value="Rejected">{t('reviews.rejected', 'Rejected')}</option>
        <option value="Hidden">{t('reviews.hidden', 'Hidden')}</option>
      </select>

      {/* Rating Filter */}
      <select
        value={selectedRating}
        onChange={(e) => setSelectedRating(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2"
        style={{ '--tw-ring-color': primaryColor } as any}
      >
        <option value="">{t('reviews.allRatings', 'All Ratings')}</option>
        <option value="5">5 {t('reviews.stars', 'Stars')}</option>
        <option value="4">4 {t('reviews.stars', 'Stars')}</option>
        <option value="3">3 {t('reviews.stars', 'Stars')}</option>
        <option value="2">2 {t('reviews.stars', 'Stars')}</option>
        <option value="1">1 {t('reviews.star', 'Star')}</option>
      </select>

      {/* Type Filter */}
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2"
        style={{ '--tw-ring-color': primaryColor } as any}
      >
        <option value="">{t('reviews.allTypes', 'All Types')}</option>
        <option value="product">{t('reviews.productReviews', 'Product Reviews')}</option>
        <option value="room">{t('reviews.roomReviews', 'Room Reviews')}</option>
      </select>
    </>
  );
}