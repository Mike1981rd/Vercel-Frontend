import React, { useState } from 'react';
import { Star, Users, Maximize, Home, Calendar, Eye } from 'lucide-react';
import { ProductCardsConfig } from '@/types/theme/productCards';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';

interface RoomCardProps {
  room: {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    basePrice: number;
    comparePrice?: number;
    maxOccupancy: number;
    viewType?: string;
    floorNumber?: number;
    squareMeters?: number;
    images?: string[];
    amenities?: string[];
    rating?: number;
    reviewCount?: number;
  };
  productCardsConfig?: ProductCardsConfig;
  colorScheme?: any;
  viewMode: 'grid' | 'list';
  currency: string;
}

export default function RoomCard({ 
  room, 
  productCardsConfig, 
  colorScheme,
  viewMode,
  currency 
}: RoomCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { convertPrice, formatPrice: formatCurrencyPrice, baseCurrency } = useCurrency();

  // Get image URL with fallback
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '/api/placeholder/400/300';
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5266${imageUrl}`;
  };

  // Format price with currency conversion
  const formatPrice = (price: number) => {
    // Price is stored in store currency (DOP), convert to selected currency
    const convertedPrice = convertPrice(price, undefined, currency as any);
    return formatCurrencyPrice(convertedPrice, currency as any);
  };

  // Calculate discount percentage
  const discountPercentage = room.comparePrice 
    ? Math.round(((room.comparePrice - room.basePrice) / room.comparePrice) * 100)
    : 0;

  // Get aspect ratio style
  const getAspectRatioStyle = () => {
    const ratio = productCardsConfig?.image?.defaultRatio || 'default';
    console.log('Current ratio setting:', ratio);
    const aspectMap: Record<string, string> = {
      'default': '1 / 1',
      'portrait': '3 / 4', 
      'landscape': '4 / 3'
    };
    const aspectValue = aspectMap[ratio] || '1 / 1';
    console.log('Applied aspect ratio:', aspectValue);
    return { aspectRatio: aspectValue };
  };

  // Get object fit from config
  const getObjectFit = () => {
    return 'object-cover'; // Always use cover for better appearance
  };
  
  // Get card scale
  const getCardScale = () => {
    return productCardsConfig?.cardSize?.scale || 1;
  };

  // Handle hover effects
  const handleMouseEnter = () => {
    setIsHovered(true);
    const effect = productCardsConfig?.effects?.hoverEffect;
    if (effect === 'show-second-media' && room.images && room.images.length > 1) {
      setCurrentImageIndex(1);
    } else if (effect === 'show-all-media' && room.images && room.images.length > 1) {
      // Start rotating images
      let index = 1;
      const interval = setInterval(() => {
        setCurrentImageIndex(index);
        index = (index + 1) % room.images!.length;
      }, 1000);
      // Store interval ID in element dataset to clear later
      (event?.currentTarget as HTMLElement)?.setAttribute('data-interval', String(interval));
    }
  };

  const handleMouseLeave = (event: React.MouseEvent) => {
    setIsHovered(false);
    setCurrentImageIndex(0);
    // Clear interval if exists
    const intervalId = (event.currentTarget as HTMLElement).getAttribute('data-interval');
    if (intervalId) {
      clearInterval(Number(intervalId));
    }
  };

  // Get price label size classes
  const getPriceLabelSize = () => {
    const size = productCardsConfig?.price?.labelSize || 'large';
    const sizeMap = {
      'extra-small': 'text-xs',
      'small': 'text-sm',
      'medium': 'text-base',
      'large': 'text-lg font-semibold'
    };
    return sizeMap[size];
  };

  // Render rating stars
  const renderRating = () => {
    const ratingStyle = productCardsConfig?.rating?.productRating || 'average-and-stars';
    if (ratingStyle === 'none' || !room.rating) return null;

    const stars = Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(room.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));

    switch (ratingStyle) {
      case 'stars-only':
        return <div className="flex">{stars}</div>;
      case 'average-only':
        return <span className="text-sm text-gray-600">{room.rating.toFixed(1)}</span>;
      case 'reviews-count-only':
        return <span className="text-sm text-gray-600">({room.reviewCount || 0} reviews)</span>;
      case 'reviews-and-stars':
        return (
          <div className="flex items-center gap-1">
            <div className="flex">{stars}</div>
            <span className="text-sm text-gray-600">({room.reviewCount || 0})</span>
          </div>
        );
      case 'average-and-stars':
      default:
        return (
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{room.rating.toFixed(1)}</span>
            <div className="flex">{stars}</div>
          </div>
        );
    }
  };

  if (viewMode === 'list') {
    // List view layout
    return (
      <div 
        className="flex gap-4 p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
        style={{ 
          backgroundColor: productCardsConfig?.visibility?.colorizeCardBackground 
            ? colorScheme?.background?.surface 
            : 'white',
          borderRadius: `${productCardsConfig?.cardStyle?.borderRadius ?? 8}px`
        }}
      >
        {/* Image */}
        <div className="w-48 h-32 flex-shrink-0">
          {room.slug ? (
            <Link href={`/habitaciones/${room.slug}`}>
              <img
                src={getImageUrl(room.images?.[0])}
                alt={room.name}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                style={{ borderRadius: `${productCardsConfig?.cardStyle?.borderRadius ?? 8}px` }}
              />
            </Link>
          ) : (
            <img
              src={getImageUrl(room.images?.[0])}
              alt={room.name}
              className="w-full h-full object-cover"
              style={{ borderRadius: `${productCardsConfig?.cardStyle?.borderRadius ?? 8}px` }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              {room.slug ? (
                <Link href={`/habitaciones/${room.slug}`}>
                  <h3 className="text-lg font-semibold mb-1 hover:text-blue-600 cursor-pointer transition-colors">{room.name}</h3>
                </Link>
              ) : (
                <h3 className="text-lg font-semibold mb-1">{room.name}</h3>
              )}
              {room.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{room.description}</p>
              )}
              
              {/* Features */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {room.maxOccupancy} personas
                </span>
                {room.viewType && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Vista {room.viewType}
                  </span>
                )}
                {room.squareMeters && (
                  <span className="flex items-center gap-1">
                    <Maximize className="w-4 h-4" />
                    {room.squareMeters} m²
                  </span>
                )}
                {room.floorNumber && (
                  <span className="flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    Piso {room.floorNumber}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="mt-2">{renderRating()}</div>
            </div>

            {/* Price and Action */}
            <div className="text-right">
              {room.comparePrice && (
                <div className="text-sm text-gray-400 line-through">
                  {formatPrice(room.comparePrice)}
                </div>
              )}
              <div className={getPriceLabelSize()}>
                {formatPrice(room.basePrice)}
                {productCardsConfig?.visibility?.showCurrencyCode && (
                  <span className="text-xs ml-1">{currency}</span>
                )}
              </div>
              <div className="text-sm text-gray-500">por noche</div>
              
              {/* Reserve Button */}
              {productCardsConfig?.buttons?.showAddToCart && room.slug && (
                <Link 
                  href={`/habitaciones/${room.slug}`}
                  className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver detalles
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view layout
  return (
    <div 
      className="group relative bg-white shadow-sm hover:shadow-lg transition-all duration-300"
      style={{ 
        backgroundColor: productCardsConfig?.visibility?.colorizeCardBackground 
          ? colorScheme?.background?.surface 
          : 'white',
        borderRadius: `${productCardsConfig?.cardStyle?.borderRadius ?? 8}px`
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Container */}
      <div 
        className="relative overflow-hidden"
        style={{
          ...getAspectRatioStyle(),
          borderTopLeftRadius: `${productCardsConfig?.cardStyle?.borderRadius ?? 8}px`,
          borderTopRightRadius: `${productCardsConfig?.cardStyle?.borderRadius ?? 8}px`
        }}
      >
        {room.slug ? (
          <Link href={`/habitaciones/${room.slug}`}>
            <img
              src={getImageUrl(room.images?.[currentImageIndex])}
              alt={room.name}
              className={`w-full h-full ${getObjectFit()} transition-transform duration-300 cursor-pointer ${
                productCardsConfig?.effects?.hoverEffect === 'zoom' && isHovered ? 'scale-110' : ''
              }`}
              style={{
                filter: productCardsConfig?.visibility?.darkenImageBackground ? 'brightness(0.9)' : undefined
              }}
            />
          </Link>
        ) : (
          <img
            src={getImageUrl(room.images?.[currentImageIndex])}
            alt={room.name}
            className={`w-full h-full ${getObjectFit()} transition-transform duration-300 ${
              productCardsConfig?.effects?.hoverEffect === 'zoom' && isHovered ? 'scale-110' : ''
            }`}
            style={{
              filter: productCardsConfig?.visibility?.darkenImageBackground ? 'brightness(0.9)' : undefined
            }}
          />
        )}
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            -{discountPercentage}%
          </div>
        )}

        {/* Quick Actions (on hover) */}
        {productCardsConfig?.buttons?.showOnHover && isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-2">
            {productCardsConfig?.buttons?.showQuickView && (
              <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                <Eye className="w-5 h-5" />
              </button>
            )}
            {productCardsConfig?.buttons?.quickBuy && (
              <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                <Calendar className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        {room.slug ? (
          <Link href={`/habitaciones/${room.slug}`}>
            <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer transition-colors">{room.name}</h3>
          </Link>
        ) : (
          <h3 className="font-semibold text-gray-900 mb-1">{room.name}</h3>
        )}

        {/* Features */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {room.maxOccupancy}
          </span>
          {room.viewType && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {room.viewType}
            </span>
          )}
          {room.squareMeters && (
            <span className="flex items-center gap-1">
              <Maximize className="w-3 h-3" />
              {room.squareMeters}m²
            </span>
          )}
        </div>

        {/* Rating */}
        {renderRating()}

        {/* Price */}
        <div className="mt-2">
          {room.comparePrice && (
            <span className="text-sm text-gray-400 line-through mr-2">
              {formatPrice(room.comparePrice)}
            </span>
          )}
          <span className={getPriceLabelSize()}>
            {formatPrice(room.basePrice)}
          </span>
          {productCardsConfig?.visibility?.showCurrencyCode && (
            <span className="text-xs ml-1">{currency}</span>
          )}
          <span className="text-sm text-gray-500 ml-1">/ noche</span>
        </div>

        {/* Action Buttons (always visible or on hover) */}
        {(!productCardsConfig?.buttons?.showOnHover || isHovered) && productCardsConfig?.buttons?.showAddToCart && room.slug && (
          <Link 
            href={`/habitaciones/${room.slug}`}
            className="block mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
          >
            Ver detalles
          </Link>
        )}
      </div>
    </div>
  );
}