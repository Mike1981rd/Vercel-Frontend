'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePrimaryColor } from '@/contexts/PrimaryColorContext';
import { StarIcon, EditIcon, CheckIcon, XIcon, EyeIcon } from '@/components/ui/Icons';
import Image from 'next/image';

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

interface ReviewRowProps {
  review: Review;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onRefresh: () => void;
}

export function ReviewRow({ review, isSelected, onSelect, onRefresh }: ReviewRowProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { token } = useAuth() as any;
  const { primaryColor } = usePrimaryColor();
  const [isUpdating, setIsUpdating] = useState(false);

  const item = review.product || review.room;
  const itemType = review.product ? 'product' : 'room';

  const handleQuickAction = async (action: 'approve' | 'reject' | 'hide') => {
    try {
      setIsUpdating(true);
      const endpoint = action === 'hide' 
        ? `/reviews/${review.id}` 
        : `/reviews/${review.id}/${action}`;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: action === 'hide' ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        ...(action === 'hide' && {
          body: JSON.stringify({ status: 'Hidden' })
        })
      });

      if (!response.ok) throw new Error(`Failed to ${action} review`);
      onRefresh();
      try {
        // Notify other tabs/iframes (editor/preview) to refresh reviews
        localStorage.setItem('reviews_updated', String(Date.now()));
        window.dispatchEvent(new CustomEvent('reviews:updated'));
      } catch {}
    } catch (error) {
      console.error(`Error ${action}ing review:`, error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = () => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      Approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      Hidden: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };

    // Status labels in Spanish
    const statusLabels = {
      Pending: 'Pendiente',
      Approved: 'Aprobado',
      Rejected: 'Rechazado',
      Hidden: 'Oculto',
      Flagged: 'Marcado',
      Archived: 'Archivado'
    };

    // Map numeric values to status strings (in case backend sends numbers)
    const statusMap: { [key: number]: string } = {
      0: 'Pending',
      1: 'Approved', 
      2: 'Rejected',
      3: 'Hidden',
      4: 'Flagged',
      5: 'Archived'
    };

    // Get the status key - handle both string and numeric values
    let statusKey: string;
    if (typeof review.status === 'number') {
      statusKey = statusMap[review.status] || 'Pending';
    } else {
      const statusStr = String(review.status);
      statusKey = statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase();
    }
    
    return (
      <span className={`px-3 py-1.5 text-xs font-medium rounded-full inline-flex items-center gap-1 ${colors[statusKey as keyof typeof colors] || colors.Pending}`}>
        {statusKey === 'Pending' && '⏳'}
        {statusKey === 'Approved' && '✅'}
        {statusKey === 'Rejected' && '❌'}
        {statusKey === 'Hidden' && '👁️‍🗨️'}
        {statusLabels[statusKey as keyof typeof statusLabels] || statusKey}
      </span>
    );
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 focus:ring-2"
          style={{ '--tw-ring-color': primaryColor } as any}
          disabled={isUpdating}
        />
      </td>

      {/* Item (Product/Room) */}
      <td className="px-6 py-4">
        {item && (
          <div className="flex items-center gap-3">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={40}
                height={40}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {itemType === 'product' ? t('reviews.product', 'Product') : t('reviews.room', 'Room')}
              </p>
            </div>
          </div>
        )}
      </td>

      {/* Reviewer */}
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {review.authorName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {review.authorEmail}
          </p>
          {review.isVerifiedPurchase && (
            <span className="text-xs text-green-600 dark:text-green-400">
              {t('reviews.verifiedPurchase', 'Verified Purchase')}
            </span>
          )}
        </div>
      </td>

      {/* Review Content */}
      <td className="px-6 py-4 max-w-md">
        <div>
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                size={14}
                className={i < review.rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300 dark:text-gray-600'}
              />
            ))}
          </div>
          {review.title && (
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {review.title}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {review.content}
          </p>
          {review.businessReply && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                {t('reviews.businessReply', 'Business Reply')}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {review.businessReply}
              </p>
            </div>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        {getStatusBadge()}
      </td>

      {/* Date */}
      <td className="px-6 py-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/dashboard/reviews/${review.id}`)}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title={t('common.view', 'View')}
          >
            <EyeIcon size={16} />
          </button>

          {review.status === 'Pending' && (
            <>
              <button
                onClick={() => handleQuickAction('approve')}
                disabled={isUpdating}
                className="p-1.5 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors disabled:opacity-50"
                title={t('reviews.approve', 'Approve')}
              >
                <CheckIcon size={16} />
              </button>
              <button
                onClick={() => handleQuickAction('reject')}
                disabled={isUpdating}
                className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                title={t('reviews.reject', 'Reject')}
              >
                <XIcon size={16} />
              </button>
            </>
          )}

        </div>
      </td>
    </tr>
  );
}