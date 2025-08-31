'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { usePrimaryColor } from '@/contexts/PrimaryColorContext';
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
  country: string;
  rating: number;
  title: string;
  content: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Hidden';
  source: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
  isPinned: boolean;
  likesCount: number;
  dislikesCount: number;
  helpfulCount: number;
  businessReply?: string;
  businessReplyDate?: string;
  translatedTitle?: string;
  translatedContent?: string;
  originalLanguage?: string;
  customer?: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
  media: Array<{
    id: number;
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl?: string;
    caption?: string;
  }>;
}

interface ReviewEditFormProps {
  review: Review;
  onSave: (review: Partial<Review>) => void;
  onReply: (reply: string) => void;
  onStatusChange: (status: string) => void;
  onPin: (isPinned: boolean) => void;
  saving: boolean;
}

export function ReviewEditForm({ 
  review, 
  onSave, 
  onReply, 
  onStatusChange, 
  onPin, 
  saving 
}: ReviewEditFormProps) {
  const { t } = useI18n();
  const { primaryColor } = usePrimaryColor();
  const [formData, setFormData] = useState(review);
  const [replyText, setReplyText] = useState(review.businessReply || '');
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    setFormData(review);
    setReplyText(review.businessReply || '');
  }, [review]);

  const handleSubmitReply = () => {
    if (formData.status === 'Approved' || formData.businessReply) {
      if (replyText.trim()) {
        onReply(replyText);
        setShowReplyForm(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-300 dark:border-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      Pending: '⏳ Pendiente',
      Approved: '✅ Aprobado',
      Rejected: '❌ Rechazado',
      Hidden: '👁️‍🗨️ Oculto'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, rating: star })}
            className="focus:outline-none"
            title={`Calificar ${star} estrella${star > 1 ? 's' : ''}`}
          >
            <StarIcon
              size={20}
              className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Review Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('reviews.reviewDetails', 'Review Details')}
            </h2>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(formData.status)}`}>
                {getStatusLabel(formData.status)}
              </span>
              {formData.isVerifiedPurchase && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {t('reviews.verifiedPurchase', 'Verified Purchase')}
                </span>
              )}
              {formData.isPinned && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  {t('reviews.pinned', 'Pinned')}
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onPin(!formData.isPinned)}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {formData.isPinned ? '📌 Desfijar' : '📌 Fijar'}
            </button>
            
            {formData.status === 'Pending' && (
              <>
                <button
                  onClick={() => onStatusChange('Approved')}
                  disabled={saving}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg"
                >
                  ✅ Aprobar Reseña
                </button>
                
                <button
                  onClick={() => onStatusChange('Rejected')}
                  disabled={saving}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg"
                >
                  ❌ Rechazar Reseña
                </button>
              </>
            )}
            
            {formData.status === 'Approved' && (
              <button
                onClick={() => onStatusChange('Hidden')}
                disabled={saving}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                👁️‍🗨️ Ocultar
              </button>
            )}
            
            {formData.status === 'Rejected' && (
              <button
                onClick={() => onStatusChange('Approved')}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                ✅ Aprobar
              </button>
            )}
            
            {formData.status === 'Hidden' && (
              <button
                onClick={() => onStatusChange('Approved')}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                👁️ Mostrar
              </button>
            )}
          </div>
        </div>

        {/* Product/Room Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {formData.productId ? t('reviews.reviewFor', 'Review for') : t('reviews.roomReview', 'Room Review')}
          </p>
          <div className="flex items-center gap-4">
            {formData.product && (
              <>
                {formData.product.imageUrl && (
                  <img
                    src={formData.product.imageUrl}
                    alt={formData.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.product.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${formData.product.price}
                  </p>
                </div>
              </>
            )}
            {formData.room && (
              <>
                {formData.room.imageUrl && (
                  <img
                    src={formData.room.imageUrl}
                    alt={formData.room.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.room.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${formData.room.price}/night
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('reviews.authorName', 'Customer Name')}
            </label>
            <p className="text-gray-900 dark:text-white">{formData.authorName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('reviews.authorEmail', 'Email')}
            </label>
            <p className="text-gray-900 dark:text-white">{formData.authorEmail}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('reviews.country', 'Country')}
            </label>
            <p className="text-gray-900 dark:text-white">{formData.country}</p>
          </div>
        </div>

        {/* Reviewer Avatar */}
        {formData.customer?.avatarUrl && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reviews.reviewerPhoto', 'Reviewer Photo')}
            </label>
            <img
              src={formData.customer.avatarUrl}
              alt={formData.customer.fullName}
              className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
          </div>
        )}

        {/* Rating and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('reviews.rating', 'Rating')}
            </label>
            {renderStars(formData.rating)}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('reviews.likes', 'Likes')}
            </label>
            <p className="text-gray-900 dark:text-white">{formData.likesCount}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('reviews.dislikes', 'Dislikes')}
            </label>
            <p className="text-gray-900 dark:text-white">{formData.dislikesCount}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('reviews.helpful', 'Helpful')}
            </label>
            <p className="text-gray-900 dark:text-white">{formData.helpfulCount}</p>
          </div>
        </div>

        {/* Review Content */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('reviews.reviewTitle', 'Title')}
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('reviews.reviewContent', 'Content')}
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 resize-none"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          />
        </div>

        {/* Media */}
        {formData.media && formData.media.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reviews.media', 'Media')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.media.map((item) => (
                <div key={item.id} className="relative group">
                  {item.mediaType === 'image' ? (
                    <img
                      src={item.thumbnailUrl || item.mediaUrl}
                      alt={item.caption || ''}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                  )}
                  {item.caption && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {item.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {t('reviews.source', 'Source')}: 
            </span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {formData.source}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {t('reviews.createdAt', 'Created')}: 
            </span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {new Date(formData.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onSave(formData)}
            disabled={saving}
            className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}
          </button>
        </div>
      </div>

      {/* Business Reply Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('reviews.businessReply', 'Business Reply')}
        </h2>
        
        {formData.businessReply && !showReplyForm ? (
          <div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
              <p className="text-gray-900 dark:text-white mb-2">
                {formData.businessReply}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formData.businessReplyDate && new Date(formData.businessReplyDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setShowReplyForm(true)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('reviews.editReply', 'Edit Reply')}
            </button>
          </div>
        ) : (
          <div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t('reviews.replyPlaceholder', 'Write your reply to this review...')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 resize-none mb-4"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmitReply}
                disabled={saving || (formData.status !== 'Approved' && !formData.businessReply)}
                className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
                title={formData.status !== 'Approved' && !formData.businessReply ? 'La reseña debe estar aprobada para publicar una respuesta' : ''}
              >
                {formData.businessReply 
                  ? t('reviews.updateReply', 'Update Reply')
                  : t('reviews.postReply', 'Post Reply')
                }
              </button>
              {showReplyForm && formData.businessReply && (
                <button
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText(formData.businessReply || '');
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}