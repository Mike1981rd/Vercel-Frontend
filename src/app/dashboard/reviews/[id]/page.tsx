'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePrimaryColor } from '@/contexts/PrimaryColorContext';
import { ReviewEditForm } from '@/components/reviews/ReviewEditForm';
import { ArrowLeftIcon } from '@/components/ui/Icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

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

export default function ReviewEditPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const { user } = useAuth();
  const { primaryColor } = usePrimaryColor();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReview();
  }, [params.id]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch review');

      const data = await response.json();
      setReview(data);
    } catch (error) {
      console.error('Error fetching review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedReview: Partial<Review>) => {
    try {
      setSaving(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedReview),
      });

      if (!response.ok) throw new Error('Failed to update review');

      await fetchReview();
      try {
        localStorage.setItem('reviews_updated', String(Date.now()));
        window.dispatchEvent(new CustomEvent('reviews:updated'));
      } catch {}
      router.push('/dashboard/reviews');
    } catch (error) {
      console.error('Error updating review:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReply = async (reply: string) => {
    try {
      setSaving(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${params.id}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply }),
      });

      if (!response.ok) throw new Error('Failed to add reply');

      await fetchReview();
      try {
        localStorage.setItem('reviews_updated', String(Date.now()));
        window.dispatchEvent(new CustomEvent('reviews:updated'));
      } catch {}
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    // Show confirmation dialog
    const actionText = status === 'Approved' ? 'aprobar' : status === 'Rejected' ? 'rechazar' : 'actualizar';
    const confirmed = window.confirm(`¿Estás seguro de que deseas ${actionText} esta reseña?`);
    
    if (!confirmed) return;

    try {
      setSaving(true);
      toast.loading(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} reseña...`);
      
      const endpoint = status === 'Approved' 
        ? `/reviews/${params.id}/approve`
        : status === 'Rejected'
        ? `/reviews/${params.id}/reject`
        : `/reviews/${params.id}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: status === 'Approved' || status === 'Rejected' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        ...(status !== 'Approved' && status !== 'Rejected' && {
          body: JSON.stringify({ status })
        })
      });

      if (!response.ok) throw new Error('Failed to update status');

      await fetchReview();
      try {
        localStorage.setItem('reviews_updated', String(Date.now()));
        window.dispatchEvent(new CustomEvent('reviews:updated'));
      } catch {}
      
      // Show success message with emoji
      toast.dismiss();
      if (status === 'Approved') {
        toast.success('✅ Reseña aprobada exitosamente');
      } else if (status === 'Rejected') {
        toast.success('❌ Reseña rechazada exitosamente');
      } else {
        toast.success('✔️ Estado actualizado exitosamente');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.dismiss();
      toast.error('Error al actualizar el estado de la reseña');
    } finally {
      setSaving(false);
    }
  };

  const handlePin = async (isPinned: boolean) => {
    try {
      setSaving(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${params.id}/pin?isPinned=${isPinned}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to pin/unpin review');

      await fetchReview();
    } catch (error) {
      console.error('Error pinning review:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {t('reviews.notFound', 'Review not found')}
          </p>
          <button
            onClick={() => router.push('/dashboard/reviews')}
            className="mt-4 px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            {t('common.goBack', 'Go Back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/reviews')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeftIcon size={20} />
          {t('common.back', 'Back')}
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('reviews.manageReview', 'Manage Review')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('reviews.reviewId', 'Review ID')}: #{review.id}
        </p>
      </div>

      {/* Review Edit Form */}
      <ReviewEditForm
        review={review}
        onSave={handleSave}
        onReply={handleReply}
        onStatusChange={handleStatusChange}
        onPin={handlePin}
        saving={saving}
      />
    </div>
  );
}