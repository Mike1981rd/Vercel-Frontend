'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePrimaryColor } from '@/contexts/PrimaryColorContext';
import { ReviewStatisticsCard } from '@/components/reviews/ReviewStatisticsCard';
import { ReviewsTable } from '@/components/reviews/ReviewsTable';
import { ReviewsFilters } from '@/components/reviews/ReviewsFilters';
import { ExportModal } from '@/components/reviews/ExportModal';
import { SearchIcon, ExportIcon } from '@/components/ui/Icons';

interface Review {
  id: number;
  productId?: number;
  roomId?: number;
  product?: {
    id: number;
    name: string;
    imageUrl?: string;
    price: number;
  };
  room?: {
    id: number;
    name: string;
    imageUrl?: string;
    price: number;
  };
  authorName: string;
  authorEmail: string;
  rating: number;
  title: string;
  content: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Hidden';
  createdAt: string;
  isVerifiedPurchase: boolean;
  likesCount: number;
  dislikesCount: number;
  helpfulCount: number;
  businessReply?: string;
}

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

export default function ReviewsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { primaryColor } = usePrimaryColor();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedType, setSelectedType] = useState(''); // 'product' or 'room'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, [currentPage, selectedStatus, selectedRating, selectedType, searchQuery]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: itemsPerPage.toString(),
        ...(searchQuery && { searchQuery }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedRating && { rating: selectedRating }),
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setReviews(data.reviews || []);
      setStatistics(data.statistics || null);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedReviews.length === 0) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/bulk-action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewIds: selectedReviews,
          action
        }),
      });

      if (!response.ok) throw new Error('Failed to perform bulk action');

      setSelectedReviews([]);
      fetchReviews();
      try {
        localStorage.setItem('reviews_updated', String(Date.now()));
        window.dispatchEvent(new CustomEvent('reviews:updated'));
      } catch {}
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const params = new URLSearchParams({
        format,
        ...(searchQuery && { searchQuery }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedRating && { rating: selectedRating }),
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to export reviews');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reviews_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting reviews:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
      {/* Mobile Title - Centered */}
      <div className="sm:hidden mb-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('reviews.title', 'Reviews')}
        </h1>
      </div>

      {/* Header - Desktop Only */}
      <div className="hidden sm:block mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('reviews.title', 'Product Reviews')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('reviews.subtitle', 'Manage and respond to customer reviews')}
        </p>
      </div>

      {/* Statistics Cards - Always show, even with zero values */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ReviewStatisticsCard statistics={statistics || {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          positiveReviewsCount: 0,
          positivePercentage: 0,
          newReviewsThisWeek: 0,
          weeklyGrowthPercentage: 0,
          weeklyTrend: [0, 0, 0, 0, 0, 0, 0]
        }} />
        {/* Button to recalculate statistics */}
        <div className="lg:col-span-3 flex justify-end">
          <button
            onClick={async () => {
              try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/recalculate-statistics`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
                if (response.ok) {
                  fetchReviews(); // Refresh the page
                  try {
                    localStorage.setItem('reviews_updated', String(Date.now()));
                    window.dispatchEvent(new CustomEvent('reviews:updated'));
                  } catch {}
                }
              } catch (error) {
                console.error('Error recalculating statistics:', error);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Recalcular Estadísticas
          </button>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        {/* Mobile Layout */}
        <div className="sm:hidden space-y-3">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder={t('reviews.searchPlaceholder', 'Search reviews...')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': primaryColor } as any}
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-2 gap-2">
            <ReviewsFilters
              selectedStatus={selectedStatus}
              setSelectedStatus={(status) => {
                setSelectedStatus(status);
                setCurrentPage(1);
              }}
              selectedRating={selectedRating}
              setSelectedRating={(rating) => {
                setSelectedRating(rating);
                setCurrentPage(1);
              }}
              selectedType={selectedType}
              setSelectedType={(type) => {
                setSelectedType(type);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Export Button - Full Width on Mobile */}
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <ExportIcon size={20} />
            {t('common.export', 'Export')}
          </button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 max-w-[75%]">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder={t('reviews.searchPlaceholder', 'Search reviews...')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor } as any}
              />
            </div>
          </div>

          {/* Filters */}
          <ReviewsFilters
            selectedStatus={selectedStatus}
            setSelectedStatus={(status) => {
              setSelectedStatus(status);
              setCurrentPage(1);
            }}
            selectedRating={selectedRating}
            setSelectedRating={(rating) => {
              setSelectedRating(rating);
              setCurrentPage(1);
            }}
            selectedType={selectedType}
            setSelectedType={(type) => {
              setSelectedType(type);
              setCurrentPage(1);
            }}
          />

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <ExportIcon size={20} />
            {t('common.export', 'Export')}
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {t('reviews.selectedCount', '{{count}} reviews selected', { count: selectedReviews.length })}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                {t('reviews.approve', 'Approve')}
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                {t('reviews.reject', 'Reject')}
              </button>
              <button
                onClick={() => handleBulkAction('hide')}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
              >
                {t('reviews.hide', 'Hide')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reviews Table */}
      <ReviewsTable
        reviews={reviews}
        loading={loading}
        selectedReviews={selectedReviews}
        setSelectedReviews={setSelectedReviews}
        onRefresh={fetchReviews}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}
    </div>
  );
}