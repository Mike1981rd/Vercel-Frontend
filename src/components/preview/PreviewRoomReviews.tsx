'use client';

import React, { useState, useEffect } from 'react';
import { Star, Heart, Smile, ThumbsUp, Loader2 } from 'lucide-react';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import WriteReviewModal from '@/components/reviews/WriteReviewModal';
import { getRoomReviews, type ReviewDto, type ReviewStatisticsDto } from '@/lib/api/reviews';
import type { ColorScheme } from '@/types/theme/colorSchemes';
import { fetchRoomData } from '@/lib/api/rooms';

interface RoomReviewsConfig {
  enabled: boolean;
  colorSchemeId?: string;
  ratingIcon?: 'star' | 'heart' | 'smile' | 'like';
  ratingIconColor?: string;
  bodyType?: 'standard' | 'rounded-grid' | 'list-grid' | 'square-grid';
  cardStyle?: 'elegant' | 'glassmorphic' | 'gradient' | 'material' | 'neumorphic';
  cardBackgroundColor?: string;
  cardBorderColor?: string;
  headerSize?: number;
  topPadding?: number;
  bottomPadding?: number;
  showBusinessReplies?: boolean;
  headerStyle?: 'style1' | 'style2';
  headerBackgroundColor?: string;
  cardBorderRadius?: number;
}

interface PreviewRoomReviewsProps {
  config: RoomReviewsConfig;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
  theme?: any;
  roomId?: number;
}

export default function PreviewRoomReviews({ 
  config, 
  deviceView, 
  isEditor = false,
  theme,
  roomId
}: PreviewRoomReviewsProps) {
  
  const [showAll, setShowAll] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatisticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstActiveRoomId, setFirstActiveRoomId] = useState<number | null>(null);
  
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  const { config: themeConfig } = useThemeConfigStore();

  useEffect(() => {
    if (deviceView !== undefined) {
      setIsMobile(deviceView === 'mobile');
      return;
    }
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [deviceView]);

  // Fetch first active room ID when needed (editor or no roomId provided in live)
  useEffect(() => {
    const loadRoomData = async () => {
      const companyId = localStorage.getItem('companyId') || '1';
      
      try {
        // Use helper function that checks for slug
        const data = await fetchRoomData(companyId);
        if (data?.id) {
          setFirstActiveRoomId(data.id);
        }
      } catch (error) {
        console.error('Error fetching first active room:', error);
      }
    };

    const configRoomId = (config as any)?.roomId as number | undefined;
    // Fetch when enabled and either in editor OR no room id is provided in live
    if (config.enabled && (isEditor || (!roomId && !configRoomId))) {
      loadRoomData();
    }
  }, [isEditor, config.enabled, roomId, config]);

  // Load reviews when roomId (prop or config) is available or when we have firstActiveRoomId
  useEffect(() => {
    const roomIdFromConfig = (config as any)?.roomId as number | undefined;
    const effectiveRoomId = roomId || roomIdFromConfig || firstActiveRoomId;
    if (effectiveRoomId) {
      loadReviews(effectiveRoomId);
    }
  }, [roomId, firstActiveRoomId, isEditor, config]);

  // Listen to cross-tab updates (from backoffice approvals) and reload
  useEffect(() => {
    const onUpdated = () => {
      const roomIdFromConfig = (config as any)?.roomId as number | undefined;
      const effectiveRoomId = roomId || roomIdFromConfig || firstActiveRoomId;
      if (effectiveRoomId) loadReviews(effectiveRoomId);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'reviews_updated') onUpdated();
    };
    window.addEventListener('reviews:updated', onUpdated as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('reviews:updated', onUpdated as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, [roomId, firstActiveRoomId]);

  const loadReviews = async (reviewRoomId: number) => {
    if (!reviewRoomId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getRoomReviews(reviewRoomId, 'Approved');
      setReviews(data.reviews);
      setStatistics(data.statistics);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError('Failed to load reviews');
      // In case of error, show empty state
      setReviews([]);
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Server-only guard: always ensure we end with some content in live preview
  useEffect(() => {
    if (!reviews.length && !isLoading && !error) {
      console.log('[PreviewRoomReviews] No reviews loaded; check roomId source (prop/config/firstActive).');
    }
  }, [reviews, isLoading, error]);

  const handleReviewSubmitted = () => {
    // Reload reviews after successful submission
    const configRoomId = (config as any)?.roomId as number | undefined;
    const effectiveRoomId = roomId || configRoomId || firstActiveRoomId;
    if (effectiveRoomId) {
      loadReviews(effectiveRoomId);
    }
  };

  if (!config.enabled) {
    return null;
  }

  // Get configuration values with defaults
  const colorSchemeId = config.colorSchemeId || 'scheme-1';
  const ratingIcon = config.ratingIcon || 'star';
  const ratingIconColor = config.ratingIconColor || '#FFB800';
  const bodyType = config.bodyType || 'standard';
  const cardStyle = config.cardStyle || 'elegant';
  const headerSize = config.headerSize || 32;
  const topPadding = config.topPadding || 40;
  const bottomPadding = config.bottomPadding || 40;

  // Get the selected color scheme from theme config
  const colorScheme = themeConfig?.colorSchemes?.schemes?.find(s => s.id === colorSchemeId) || null;
  
  // Use color scheme colors or fallback to defaults
  const bgColor = colorScheme?.background || '#FFFFFF';
  const textColor = colorScheme?.text || '#000000';
  const borderColor = colorScheme?.border || '#E5E7EB';
  const outlineButtonColor = colorScheme?.outlineButton || '#000000';
  const outlineButtonText = colorScheme?.outlineButtonText || '#000000';

  // Card colors (derive after borderColor is available)
  const cardBg = config.cardBackgroundColor || bgColor;
  const cardBorder = config.cardBorderColor || borderColor;

  // Calculate display values
  const averageRating = statistics?.averageRating || 0;
  const totalReviews = statistics?.totalReviews || 0;
  const reviewsPerPage = isMobile ? 2 : 4;
  const displayedReviews = showAll ? reviews : reviews.slice(0, reviewsPerPage);

  const RatingIcon = ({ filled, size = 'sm' }: { filled: boolean; size?: 'sm' | 'lg' }) => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
    const iconProps = {
      className: sizeClass,
      style: { 
        color: filled ? ratingIconColor : borderColor,
        fill: filled ? ratingIconColor : borderColor
      }
    };

    switch(ratingIcon) {
      case 'heart': return <Heart {...iconProps} />;
      case 'smile': return <Smile {...iconProps} />;
      case 'like': return <ThumbsUp {...iconProps} />;
      default: return <Star {...iconProps} />;
    }
  };

  const getBodyClasses = () => {
    switch(bodyType) {
      case 'rounded-grid':
        return { 
          wrapper: 'rounded-xl p-4',
          style: { backgroundColor: `${cardBg}`, border: `1px solid ${cardBorder}` }
        };
      case 'list-grid':
        return { 
          wrapper: 'pb-4',
          style: { borderBottom: `1px solid ${cardBorder}` }
        };
      case 'square-grid':
        return { 
          wrapper: 'p-4',
          style: { border: `1px solid ${cardBorder}`, backgroundColor: `${cardBg}` }
        };
      default:
        return { wrapper: '', style: { backgroundColor: `${cardBg}` } };
    }
  };

  const bodyClasses = getBodyClasses();
  
  // Get card style classes and inline styles based on selected style
  const getCardStyles = () => {
    const borderRadius = config.cardBorderRadius || 8;
    
    switch(cardStyle) {
      case 'elegant':
        // Clean, minimalist design like Airbnb
        return {
          className: '',
          wrapperStyle: {
            borderRadius: `${borderRadius}px`
          },
          containerStyle: {}
        };
      case 'glassmorphic':
        // Modern glass effect with blur
        return {
          className: 'p-6 backdrop-blur-md border',
          wrapperStyle: {
            background: `${cardBg}CC`,
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            borderColor: `${cardBorder}30`,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
            borderRadius: `${borderRadius}px`
          },
          containerStyle: {}
        };
      case 'gradient':
        // Subtle gradient background with color accents
        return {
          className: 'p-6 border',
          wrapperStyle: {
            background: `linear-gradient(135deg, ${cardBg} 0%, ${cardBg}F5 100%)`,
            borderColor: `${cardBorder}20`,
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.08)',
            borderRadius: `${borderRadius}px`
          },
          containerStyle: {}
        };
      case 'material':
        // Google Material Design inspired
        return {
          className: 'p-6 hover:shadow-lg transition-shadow duration-300',
          wrapperStyle: {
            backgroundColor: cardBg,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
            borderRadius: `${borderRadius}px`
          },
          containerStyle: {}
        };
      case 'neumorphic':
        // Soft UI with embossed effect
        return {
          className: 'p-6',
          wrapperStyle: {
            background: cardBg,
            boxShadow: `6px 6px 12px ${cardBorder}25, -6px -6px 12px ${cardBg}`,
            border: `1px solid ${cardBorder}15`,
            borderRadius: `${borderRadius}px`
          },
          containerStyle: {}
        };
      default:
        return {
          className: '',
          wrapperStyle: {},
          containerStyle: {}
        };
    }
  };
  
  const cardStyles = getCardStyles();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const getApiOrigin = () => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
    try {
      return new URL(api).origin;
    } catch {
      return 'http://localhost:5266';
    }
  };

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return '';
    // If it's an absolute URL, return as is
    if (/^https?:\/\//i.test(url)) return url;
    // If it's a relative upload path, prefix with API origin
    if (url.startsWith('/uploads/')) return `${getApiOrigin()}${url}`;
    if (url.startsWith('uploads/')) return `${getApiOrigin()}/${url}`;
    return url;
  };

  return (
    <div 
      className="container mx-auto px-6"
      style={{ 
        paddingTop: `${topPadding}px`,
        paddingBottom: `${bottomPadding}px`,
        backgroundColor: bgColor
      }}
    >
      {/* Header Design Based on Style */}
      {config.headerStyle === 'style2' ? (
        // Style 2 - Box Rating Design
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div 
                className="px-4 py-3 rounded-lg text-center"
                style={{ backgroundColor: config.headerBackgroundColor || '#FACC15' }}
              >
                <div className="text-3xl font-bold text-white">
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-xs text-white/90 mt-1">
                  de 5
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-3" style={{ color: textColor }}>
                  Residencia en {totalReviews} reseñas
                </p>
                {/* Rating distribution bars */}
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = statistics?.[`${['one', 'two', 'three', 'four', 'five'][rating - 1]}StarCount` as keyof ReviewStatisticsDto] as number || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3"
                              style={{ 
                                color: i < rating ? ratingIconColor : '#E5E7EB',
                                fill: i < rating ? ratingIconColor : '#E5E7EB'
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-300"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: config.headerBackgroundColor || '#FACC15'
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowWriteReview(true)}
              className="px-4 py-2 rounded-lg font-medium transition hover:opacity-90 text-sm"
              style={{ 
                border: `1px solid ${outlineButtonColor}`,
                color: outlineButtonText,
                backgroundColor: 'transparent'
              }}
            >
              Write a review
            </button>
          </div>
        </div>
      ) : (
        // Style 1 - Trophy Design (Default)
        <div className="mb-8">
          {/* Trophy Rating Display */}
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-3 mb-4">
              {/* Left laurel */}
              <div className="text-5xl">🌿</div>
              <div className="text-6xl font-bold" style={{ color: textColor }}>
                {averageRating.toFixed(1)}
              </div>
              {/* Right laurel */}
              <div className="text-5xl scale-x-[-1]">🌿</div>
            </div>
          </div>
          
          {/* Results Box - Star Distribution */}
          <div className="max-w-md mx-auto mb-6">
            <p className="text-sm font-medium mb-3" style={{ color: textColor }}>
              Residencia en {totalReviews} reseñas
            </p>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = statistics?.[`${['one', 'two', 'three', 'four', 'five'][rating - 1]}StarCount` as keyof ReviewStatisticsDto] as number || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex gap-0.5 w-24">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4"
                          style={{ 
                            color: i < rating ? config.headerBackgroundColor || '#FACC15' : '#E5E7EB',
                            fill: i < rating ? config.headerBackgroundColor || '#FACC15' : '#E5E7EB'
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500 rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: config.headerBackgroundColor || '#FACC15'
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-10 text-right">
                      ({count})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setShowWriteReview(true)}
              className="px-6 py-3 rounded-lg font-medium transition hover:opacity-90"
              style={{ 
                backgroundColor: config.headerBackgroundColor || '#FACC15',
                color: '#FFFFFF'
              }}
            >
              Write a review
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: borderColor }} />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-8" style={{ color: textColor }}>
          <p className="opacity-70">Unable to load reviews at this time.</p>
        </div>
      )}

      {/* Reviews Grid */}
      {!isLoading && !error && reviews.length > 0 && (
        <>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6 mb-8`}>
            {displayedReviews.map((review) => {
              // Render based on card style
              if (cardStyle === 'elegant') {
                // Clean Airbnb-style design
                return (
                  <div key={review.id} className="p-6 mb-4 border" style={{ 
                    borderColor: cardBorder, 
                    backgroundColor: cardBg,
                    borderRadius: `${config.cardBorderRadius || 8}px`
                  }}>
                    <div className="flex gap-4 mb-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {(review.customer?.avatarUrl || (review.media && review.media.length > 0)) ? (
                          <img
                            src={resolveImageUrl(
                              review.customer?.avatarUrl || 
                              (review.media && review.media[0] && (review.media[0].thumbnailUrl || review.media[0].mediaUrl))
                            )}
                            alt={review.authorName}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              const imgElement = e.currentTarget as HTMLImageElement;
                              imgElement.style.display = 'none';
                              // Create and insert initials div
                              const wrapper = imgElement.parentElement;
                              if (wrapper && !wrapper.querySelector('.initials-fallback')) {
                                const initialsDiv = document.createElement('div');
                                initialsDiv.className = 'initials-fallback w-12 h-12 rounded-full flex items-center justify-center font-semibold';
                                initialsDiv.style.backgroundColor = '#F0F0F0';
                                initialsDiv.style.color = '#717171';
                                initialsDiv.textContent = getInitials(review.authorName);
                                wrapper.appendChild(initialsDiv);
                              }
                            }}
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
                            style={{ 
                              backgroundColor: '#F0F0F0',
                              color: '#717171'
                            }}
                          >
                            {getInitials(review.authorName)}
                          </div>
                        )}
                      </div>
                      
                      {/* Author info and content */}
                      <div className="flex-1">
                        <div className="mb-1">
                          <p className="font-semibold text-base" style={{ color: textColor }}>
                            {review.authorName}
                          </p>
                          <p className="text-sm" style={{ color: '#717171' }}>
                            {review.country || 'Guest'}
                          </p>
                        </div>
                        
                        {/* Rating and date */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <RatingIcon key={i} filled={i < review.rating} />
                          ))}
                          <span className="ml-2 text-sm" style={{ color: '#717171' }}>
                            · {formatDate(review.createdAt)} · Stayed a few nights
                          </span>
                        </div>
                        
                        {/* Review content */}
                        <p className="text-base leading-relaxed" style={{ color: textColor }}>
                          {review.content}
                        </p>
                        
                        {/* Show more link if content is long */}
                        {review.content.length > 200 && (
                          <button className="mt-2 font-semibold underline text-sm" style={{ color: textColor }}>
                            Show more
                          </button>
                        )}
                        
                        {/* Business Reply */}
                        {review.businessReply && (config.showBusinessReplies !== false) && (
                          <div className="mt-4 pl-4 border-l-2" style={{ borderColor: borderColor }}>
                            <p className="text-sm font-semibold mb-1" style={{ color: textColor }}>
                              Response from owner
                            </p>
                            <p className="text-sm" style={{ color: '#717171' }}>
                              {review.businessReply}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Other card styles
                return (
                  <div 
                    key={review.id} 
                    className={`${cardStyles.className}`}
                    style={cardStyles.wrapperStyle}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {review.customer?.avatarUrl ? (
                        <img
                          src={resolveImageUrl(review.customer.avatarUrl)}
                          alt={review.authorName}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            const imgElement = e.currentTarget as HTMLImageElement;
                            // If image fails to load, replace with initials div
                            const initialsDiv = document.createElement('div');
                            initialsDiv.className = 'w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm';
                            initialsDiv.style.backgroundColor = ratingIconColor + '20';
                            initialsDiv.style.color = ratingIconColor;
                            initialsDiv.textContent = getInitials(review.authorName);
                            imgElement.parentNode?.replaceChild(initialsDiv, imgElement);
                          }}
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm"
                          style={{ 
                            backgroundColor: ratingIconColor + '20',
                            color: ratingIconColor
                          }}
                        >
                          {getInitials(review.authorName)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: textColor }}>
                          {review.authorName}
                        </p>
                        <p className="text-xs" style={{ color: textColor, opacity: 0.7 }}>
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <RatingIcon key={i} filled={i < review.rating} />
                      ))}
                    </div>

                    {review.title && (
                      <p className="font-semibold text-sm mb-2" style={{ color: textColor }}>
                        {review.title}
                      </p>
                    )}

                    <p className="text-sm leading-relaxed" style={{ color: textColor, opacity: 0.9 }}>
                      {review.content}
                    </p>

                    {/* Display review images if any */}
                    {review.media && review.media.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.media.slice(0, 3).map((media) => (
                          <img
                            key={media.id}
                            src={resolveImageUrl(media.thumbnailUrl || media.mediaUrl)}
                            alt={media.caption || 'Review image'}
                            className="w-16 h-16 object-cover rounded"
                            style={{ border: `1px solid ${borderColor}` }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Business Reply */}
                    {review.businessReply && (config.showBusinessReplies !== false) && (
                      <div 
                        className="mt-3 p-3 rounded-lg"
                        style={{ backgroundColor: `${borderColor}20` }}
                      >
                        <p className="text-xs font-semibold mb-1" style={{ color: textColor }}>
                          Response from the owner
                        </p>
                        <p className="text-sm" style={{ color: textColor, opacity: 0.9 }}>
                          {review.businessReply}
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
            })}
          </div>

          {/* Show all button */}
          {reviews.length > reviewsPerPage && (
            <div className={isMobile ? 'flex justify-center' : ''}>
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-3 rounded-lg font-medium transition hover:opacity-90"
                style={{ 
                  border: `1px solid ${outlineButtonColor}`,
                  color: outlineButtonText,
                  backgroundColor: 'transparent'
                }}
              >
                {showAll ? 'Show less' : `Show all ${totalReviews} reviews`}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State for Editor - only show if there are no reviews */}
      {isEditor && !isLoading && reviews.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor }}>
          <p className="text-sm opacity-70" style={{ color: textColor }}>
            {firstActiveRoomId 
              ? "No reviews yet for this room. Reviews will appear here when customers submit them."
              : "No active room found. Please create and activate a room first."}
          </p>
          <p className="text-xs opacity-50 mt-2" style={{ color: textColor }}>
            This is a preview showing data from the first active room.
          </p>
        </div>
      )}

      {/* Empty State for Live Site */}
      {!isEditor && !isLoading && !error && reviews.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm opacity-70 mb-4" style={{ color: textColor }}>
            Be the first to share your experience!
          </p>
          {roomId && (
            <button
              onClick={() => setShowWriteReview(true)}
              className="px-6 py-3 rounded-lg font-medium transition hover:opacity-90"
              style={{ 
                backgroundColor: ratingIconColor,
                color: '#FFFFFF'
              }}
            >
              Write the first review
            </button>
          )}
        </div>
      )}

      {/* Write Review Modal */}
      {(roomId || firstActiveRoomId) && (
        <WriteReviewModal
          isOpen={showWriteReview}
          onClose={() => setShowWriteReview(false)}
          onSuccess={handleReviewSubmitted}
          roomId={roomId || firstActiveRoomId!}
          ratingIcon={ratingIcon}
          ratingIconColor={ratingIconColor}
          colorScheme={colorScheme}
        />
      )}
    </div>
  );
}