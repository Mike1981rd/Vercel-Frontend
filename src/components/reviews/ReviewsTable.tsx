'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { usePrimaryColor } from '@/contexts/PrimaryColorContext';
import { ReviewRow } from './ReviewRow';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StarIcon } from '@/components/ui/Icons';

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

interface ReviewsTableProps {
  reviews: Review[];
  loading: boolean;
  selectedReviews: number[];
  setSelectedReviews: (ids: number[]) => void;
  onRefresh: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ReviewsTable({
  reviews,
  loading,
  selectedReviews,
  setSelectedReviews,
  onRefresh,
  currentPage,
  totalPages,
  onPageChange
}: ReviewsTableProps) {
  const { t } = useI18n();
  const { primaryColor } = usePrimaryColor();
  const router = useRouter();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(reviews.map(r => r.id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleSelectReview = (reviewId: number, checked: boolean) => {
    if (checked) {
      setSelectedReviews([...selectedReviews, reviewId]);
    } else {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-3 mb-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                {/* Product/Room Info */}
                <div className="flex items-center gap-2 mb-2">
                  {review.product && (
                    <div className="flex items-center gap-2">
                      {review.product.imageUrl && (
                        <img
                          src={review.product.imageUrl}
                          alt={review.product.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {review.product.name}
                      </span>
                    </div>
                  )}
                  {review.room && (
                    <div className="flex items-center gap-2">
                      {review.room.imageUrl && (
                        <img
                          src={review.room.imageUrl}
                          alt={review.room.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {review.room.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        size={14}
                        className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {review.rating}/5
                  </span>
                </div>

                {/* Title and Content */}
                <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {review.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {review.content}
                </p>

                {/* Author and Date */}
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{review.authorName}</span>
                  <span>•</span>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Status Badge */}
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                    review.status === 'Approved' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : review.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : review.status === 'Rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {review.status}
                  </span>
                  {review.isVerifiedPurchase && (
                    <span className="ml-2 inline-flex px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {t('reviews.verifiedPurchase', 'Verified')}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedReviews.includes(review.id)}
                  onChange={(e) => handleSelectReview(review.id, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => router.push(`/dashboard/reviews/${review.id}`)}
                className="flex-1 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.edit', 'Edit')}
              </button>
              {review.status !== 'Approved' && (
                <button
                  className="flex-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  {t('reviews.approve', 'Approve')}
                </button>
              )}
              {!review.businessReply && (
                <button
                  className="flex-1 px-3 py-1.5 text-xs text-white rounded transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  {t('reviews.reply', 'Reply')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={reviews.length > 0 && selectedReviews.length === reviews.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('reviews.table.item', 'ITEM')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('reviews.table.reviewer', 'REVIEWER')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('reviews.table.review', 'REVIEW')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('reviews.table.status', 'STATUS')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('reviews.table.date', 'DATE')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('reviews.table.actions', 'ACTIONS')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {reviews.map((review) => (
              <ReviewRow
                key={review.id}
                review={review}
                isSelected={selectedReviews.includes(review.id)}
                onSelect={(checked) => handleSelectReview(review.id, checked)}
                onRefresh={onRefresh}
              />
            ))}
          </tbody>
        </table>
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {t('reviews.noReviews', 'No reviews found')}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
      </div>
    </div>
  );
}
