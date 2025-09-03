import { apiClient } from './client';

// Types
export interface CreateReviewDto {
  productId?: number;
  roomId?: number;
  customerId?: number;
  authorName: string;
  authorEmail: string;
  country?: string;
  title?: string;
  content: string;
  rating: number;
  source?: string;
  isVerifiedPurchase?: boolean;
  originalLanguage?: string;
}

export interface ReviewMediaDto {
  id: number;
  reviewId: number;
  mediaType: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  sortOrder: number;
  uploadedAt: string;
}

export interface ReviewDto {
  id: number;
  companyId: number;
  productId?: number;
  roomId?: number;
  customerId?: number;
  authorName: string;
  authorEmail: string;
  country: string;
  title: string;
  content: string;
  rating: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Hidden' | 'Flagged' | 'Archived';
  source: string;
  isPinned: boolean;
  isVerifiedPurchase: boolean;
  businessReply?: string;
  businessReplyDate?: string;
  repliedByUserId?: number;
  repliedByUserName?: string;
  likesCount: number;
  dislikesCount: number;
  helpfulCount: number;
  createdAt: string;
  approvedAt?: string;
  modifiedAt?: string;
  originalLanguage?: string;
  translatedTitle?: string;
  translatedContent?: string;
  media: ReviewMediaDto[];
  customer?: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
  userHasInteracted: boolean;
  userInteractionType?: 'Like' | 'Dislike' | 'Helpful' | 'Report';
}

export interface ReviewFilterDto {
  productId?: number;
  roomId?: number;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Hidden' | 'Flagged' | 'Archived';
  rating?: number;
  isVerifiedPurchase?: boolean;
  hasReply?: boolean;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  sortBy?: string;
  sortDescending?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ReviewStatisticsDto {
  totalReviews: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  positiveReviewsCount: number;
  positivePercentage: number;
  newReviewsThisWeek: number;
  weeklyGrowthPercentage: number;
}

// API Functions

/**
 * Create a new review (public endpoint - no authentication required)
 */
export async function createReview(data: CreateReviewDto): Promise<ReviewDto> {
  try {
    // For public reviews, we need to send without auth header
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create review');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

/**
 * Upload media for a review
 */
export async function uploadReviewMedia(
  reviewId: number,
  file: File,
  caption?: string
): Promise<ReviewMediaDto> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}/media`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload media');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading review media:', error);
    throw error;
  }
}

/**
 * Get reviews with filters
 */
export async function getReviews(filter: ReviewFilterDto = {}): Promise<{
  reviews: ReviewDto[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  statistics?: ReviewStatisticsDto;
}> {
  try {
    const params = new URLSearchParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reviews?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('token')
            ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
            : {}),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch reviews');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

/**
 * Get reviews for a specific room
 */
export async function getRoomReviews(
  roomId: number,
  status: 'Approved' | 'All' = 'Approved'
): Promise<{
  reviews: ReviewDto[];
  statistics: ReviewStatisticsDto;
}> {
  try {
    // Use public endpoint to allow fetching from editor/preview without auth
    const params = new URLSearchParams();
    params.append('roomId', roomId.toString());

    // Backend public endpoint always returns only Approved; keep param for future flexibility
    if (status === 'Approved') {
      // no-op; server enforces approved
    }

    const authHeaders =
      typeof window !== 'undefined' && localStorage.getItem('token')
        ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
        : {};
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reviews/public?${params.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json', ...authHeaders } as any }
    );
    let data: { reviews: ReviewDto[]; statistics?: ReviewStatisticsDto };
    if (!response.ok) {
      // Fallback: try authorized endpoint if public returns 401
      if (response.status === 401) {
        const fallback = await getReviews({ roomId, sortBy: 'CreatedAt', sortDescending: true, pageSize: 100, status: 'Approved' });
        data = { reviews: fallback.reviews, statistics: fallback.statistics } as any;
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to fetch public room reviews');
      }
    } else {
      data = await response.json();
    }

    return {
      reviews: data.reviews || [],
      statistics:
        data.statistics || {
          totalReviews: data.reviews?.length || 0,
          averageRating: calculateAverageRating(data.reviews || []),
          fiveStarCount: (data.reviews || []).filter(r => r.rating === 5).length,
          fourStarCount: (data.reviews || []).filter(r => r.rating === 4).length,
          threeStarCount: (data.reviews || []).filter(r => r.rating === 3).length,
          twoStarCount: (data.reviews || []).filter(r => r.rating === 2).length,
          oneStarCount: (data.reviews || []).filter(r => r.rating === 1).length,
          positiveReviewsCount: (data.reviews || []).filter(r => r.rating >= 4).length,
          positivePercentage: calculatePositivePercentage(data.reviews || []),
          newReviewsThisWeek: 0,
          weeklyGrowthPercentage: 0,
        },
    };
  } catch (error) {
    console.error('Error fetching room reviews:', error);
    return {
      reviews: [],
      statistics: {
        totalReviews: 0,
        averageRating: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0,
        positiveReviewsCount: 0,
        positivePercentage: 0,
        newReviewsThisWeek: 0,
        weeklyGrowthPercentage: 0,
      },
    };
  }
}

/**
 * Get a single review by ID
 */
export async function getReviewById(id: number): Promise<ReviewDto> {
  try {
    const response = await apiClient.get(`/reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
}

/**
 * Update a review (requires authentication)
 */
export async function updateReview(
  id: number,
  data: Partial<CreateReviewDto>
): Promise<ReviewDto> {
  try {
    const response = await apiClient.put(`/reviews/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

/**
 * Delete a review (requires authentication)
 */
export async function deleteReview(id: number): Promise<void> {
  try {
    await apiClient.delete(`/reviews/${id}`);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}

/**
 * Interact with a review (like, dislike, helpful, report)
 */
export async function interactWithReview(
  reviewId: number,
  type: 'Like' | 'Dislike' | 'Helpful' | 'Report',
  sessionId?: string
): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}/interact`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          sessionId: sessionId || generateSessionId(),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to interact with review');
    }
  } catch (error) {
    console.error('Error interacting with review:', error);
    throw error;
  }
}

// Helper functions

function calculateAverageRating(reviews: ReviewDto[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 100) / 100;
}

function calculatePositivePercentage(reviews: ReviewDto[]): number {
  if (reviews.length === 0) return 0;
  const positive = reviews.filter(r => r.rating >= 4).length;
  return Math.round((positive / reviews.length) * 100);
}

function generateSessionId(): string {
  // Generate a unique session ID for anonymous users
  const stored = localStorage.getItem('review_session_id');
  if (stored) return stored;
  
  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('review_session_id', newId);
  return newId;
}

// Export all functions
export const reviewsApi = {
  createReview,
  uploadReviewMedia,
  getReviews,
  getRoomReviews,
  getReviewById,
  updateReview,
  deleteReview,
  interactWithReview,
};