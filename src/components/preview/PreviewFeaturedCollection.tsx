/**
 * @file PreviewFeaturedCollection.tsx
 * @description Preview unificado para FeaturedCollection
 * @max-lines 400
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Star, ShoppingCart, CreditCard, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { FeaturedCollectionConfig, getDefaultFeaturedCollectionConfig } from '@/components/editor/modules/FeaturedCollection/types';
import { GlobalThemeConfig } from '@/types/theme';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { useCompany } from '@/contexts/CompanyContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

interface PreviewFeaturedCollectionProps {
  config?: Partial<FeaturedCollectionConfig>;
  theme?: GlobalThemeConfig;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
}

interface Item {
  id: number;
  name: string;
  slug?: string;
  price?: number;
  originalPrice?: number;
  imageUrl?: string;
  description?: string;
  rating?: number;
  discount?: number;
  vendor?: string;
  reviewCount?: number;
  soldOut?: boolean;
  colorCount?: number;
}

export default function PreviewFeaturedCollection({
  config,
  theme,
  deviceView,
  isEditor = false
}: PreviewFeaturedCollectionProps) {
  
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;
  const { company } = useCompany();
  const { selectedCurrency, convertPrice, formatPrice: formatCurrencyPrice, baseCurrency } = useCurrency();
  
  // Format price with currency conversion
  const formatPrice = (price: number): string => {
    // Price is stored in store currency, convert to selected currency
    const convertedPrice = convertPrice(price, undefined, selectedCurrency);
    return formatCurrencyPrice(convertedPrice, selectedCurrency);
  };
  
  // Memoize final config to avoid recreating default arrays on every render
  const finalConfig: FeaturedCollectionConfig = useMemo(() => (
    { ...getDefaultFeaturedCollectionConfig(), ...(config as any) }
  ), [config]);
  
  // Debug log
  console.log('PreviewFeaturedCollection rendering:', {
    config,
    finalConfig,
    isEditor,
    enabled: finalConfig.enabled
  });
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Mobile detection - using canonical pattern like Multicolumns
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  React.useEffect(() => {
    if (deviceView !== undefined) {
      setIsMobile(deviceView === 'mobile');
      return;
    }
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [deviceView]);
  
  // Debug log
  console.log('FeaturedCollection mobile detection:', {
    deviceView,
    isMobile,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'SSR',
    isEditor
  });
  
  // Fetch items based on selection - MUST be before any conditional returns
  useEffect(() => {
    const fetchItems = async () => {
      if (!finalConfig.activeType) {
        // Show placeholder items in editor
        if (isEditor) {
          setItems([
            { id: 1, name: 'Sample Item 1', price: 99.99, originalPrice: 149.99, discount: 33, rating: 4.5, imageUrl: '/api/placeholder/400/500' },
            { id: 2, name: 'Sample Item 2', price: 79.99, originalPrice: 119.99, discount: 33, rating: 4.5, imageUrl: '/api/placeholder/400/500' },
            { id: 3, name: 'Sample Item 3', price: 129.99, originalPrice: 199.99, discount: 35, rating: 4.5, imageUrl: '/api/placeholder/400/500' },
            { id: 4, name: 'Sample Item 4', price: 49.99, originalPrice: 89.99, discount: 44, rating: 4.5, imageUrl: '/api/placeholder/400/500' },
          ]);
        }
        return;
      }
      
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        let endpoint = '';
        let selectedIds: number[] = [];
        
        console.log('FeaturedCollection - Fetching items:', {
          activeType: finalConfig.activeType,
          selectedCollections: finalConfig.selectedCollections,
          selectedProducts: finalConfig.selectedProducts,
          selectedRooms: finalConfig.selectedRooms
        });
        
        switch(finalConfig.activeType) {
          case 'collections':
            endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/Collections`;
            selectedIds = finalConfig.selectedCollections || [];
            break;
          case 'products':
            endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/Products`;
            selectedIds = finalConfig.selectedProducts || [];
            break;
          case 'rooms':
            endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/rooms/company/1/public`;
            selectedIds = finalConfig.selectedRooms || [];
            break;
        }
        
        console.log('FeaturedCollection - Request details:', {
          endpoint,
          selectedIds,
          token: token ? 'exists' : 'missing'
        });
        
        if (endpoint && selectedIds.length > 0) {
          const response = await fetch(endpoint, { cache: 'no-store' });
          
          console.log('FeaturedCollection - Response status:', response.status);
          
          if (response.ok) {
            const allItems = await response.json();
            console.log('FeaturedCollection - Items from API:', allItems.length, 'items');
            console.log('FeaturedCollection - First item example:', allItems[0]);
            
            const filtered = allItems.filter((item: any) => selectedIds.includes(item.id || item.Id));
            console.log('FeaturedCollection - Filtered items:', filtered.length, filtered);
            
            // Log específico para rooms
            if (finalConfig.activeType === 'rooms' && filtered.length > 0) {
              console.log('FeaturedCollection - Room structure example:', {
                firstRoom: filtered[0],
                imagesField: filtered[0].Images || filtered[0].images,
                hasImages: !!(filtered[0].Images || filtered[0].images),
                imagesLength: (filtered[0].Images || filtered[0].images || []).length
              });
            }
            
            // Helper to ensure absolute image URLs
            const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api').replace(/\/?api$/, '');
            const getImageUrl = (imageUrl: string | undefined | null): string => {
              if (!imageUrl) {
                console.log('No image URL provided, using placeholder');
                return '/api/placeholder/400/500';
              }
              
              // Convert to string if needed
              const url = String(imageUrl);
              
              // If it's a data URL (base64), return as is
              if (url.startsWith('data:')) {
                return url;
              }
              
              // If it's already an absolute URL, return as is
              if (url.startsWith('http://') || url.startsWith('https://')) {
                return url.replace(/^https?:\/\/localhost:5266/, apiBase);
              }
              
              // If it starts with /uploads, /wwwroot, or /images prepend the backend URL
              if (url.startsWith('/uploads') || url.startsWith('/wwwroot') || url.startsWith('/images')) {
                return `${apiBase}${url}`;
              }
              
              // If it starts with uploads/ (without leading slash)
              if (url.startsWith('uploads/') || url.startsWith('wwwroot/') || url.startsWith('images/')) {
                return `${apiBase}/${url}`;
              }
              
              // If it starts with /, assume it's relative to backend
              if (url.startsWith('/')) {
                return `${apiBase}${url}`;
              }
              
              // Otherwise, assume it needs the full path
              return `${apiBase}/${url}`;
            };
            
            // Map items to consistent structure
            const mappedItems = filtered.map((item: any) => {
              console.log('FeaturedCollection - Original item:', item);
              // Handle different API structures
              if (finalConfig.activeType === 'rooms') {
                // Rooms use Images (with capital I) as an array of strings
                let roomImage = null;
                
                // Primary check for Images array (Room DTO structure)
                if (item.Images && Array.isArray(item.Images) && item.Images.length > 0) {
                  roomImage = item.Images[0];
                } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
                  roomImage = item.images[0];
                } else if (item.photos && Array.isArray(item.photos) && item.photos.length > 0) {
                  // If photos is an array of objects with url or path
                  if (typeof item.photos[0] === 'object') {
                    roomImage = item.photos[0].url || item.photos[0].path || item.photos[0].imageUrl;
                  } else {
                    // If photos is an array of strings
                    roomImage = item.photos[0];
                  }
                } else if (item.mainImage) {
                  roomImage = item.mainImage;
                } else if (item.imageUrl) {
                  roomImage = item.imageUrl;
                } else if (item.image) {
                  roomImage = item.image;
                } else if (item.imagePath) {
                  roomImage = item.imagePath;
                } else if (item.photo) {
                  roomImage = item.photo;
                }
                
                // Log más detallado para debugging
                const imageDebug = {
                  hasImagesField: !!item.Images,
                  hasImagesLowercase: !!item.images,
                  ImagesValue: item.Images,
                  imagesValue: item.images,
                  ImagesType: typeof item.Images,
                  ImagesIsArray: Array.isArray(item.Images),
                  ImagesLength: item.Images?.length,
                  firstImage: item.Images?.[0],
                  firstImageLength: item.Images?.[0]?.length,
                  extractedImage: roomImage,
                  extractedImageLength: roomImage?.length,
                  finalUrl: getImageUrl(roomImage),
                  finalUrlLength: getImageUrl(roomImage)?.length
                };
                console.log('Room image detailed debug:', imageDebug);
                
                const calculatedDiscount = item.discount || item.discountPercentage || 
                  (item.comparePrice && item.basePrice ? 
                    Math.round(((item.comparePrice - item.basePrice) / item.comparePrice) * 100) : 
                    (item.ComparePrice && item.BasePrice ? 
                      Math.round(((item.ComparePrice - item.BasePrice) / item.ComparePrice) * 100) : 0));
                
                const mappedRoom = {
                  id: item.id || item.Id,
                  name: item.name || item.Name || item.title || item.roomName || 'Unnamed Room',
                  slug: item.slug || item.Slug, // Add slug for room navigation
                  price: item.basePrice || item.BasePrice || item.price || item.pricePerNight || item.nightlyRate,
                  originalPrice: item.comparePrice || item.ComparePrice || item.originalPrice || item.regularPrice,
                  imageUrl: getImageUrl(roomImage),
                  description: item.description || item.Description,
                  rating: item.rating || 4.5,
                  discount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
                  vendor: item.vendor || item.Vendor || 'Hotel Aurora',
                  reviewCount: item.reviewCount || Math.floor(Math.random() * 100) + 1,
                  soldOut: item.soldOut || item.SoldOut || false,
                  colorCount: item.colorCount || 0
                };
                console.log('[DEBUG] Mapped room:', mappedRoom.name, 'Slug:', mappedRoom.slug);
                return mappedRoom;
              } else if (finalConfig.activeType === 'products') {
                // Products may have images as an array
                let productImage = null;
                if (item.images && Array.isArray(item.images) && item.images.length > 0) {
                  productImage = item.images[0];
                } else if (item.image) {
                  productImage = item.image;
                } else if (item.imageUrl) {
                  productImage = item.imageUrl;
                } else if (item.mainImage) {
                  productImage = item.mainImage;
                }
                
                const productDiscount = item.discount || (item.originalPrice && item.price ? 
                  Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0);
                
                return {
                  id: item.id || item.Id,
                  name: item.name || item.Name || item.title || 'Unnamed Product',
                  price: item.price || item.Price || item.salePrice,
                  originalPrice: item.originalPrice || item.OriginalPrice || item.regularPrice,
                  imageUrl: getImageUrl(productImage),
                  description: item.description || item.Description,
                  rating: item.rating || 4.2,
                  discount: productDiscount > 0 ? productDiscount : undefined,
                  vendor: item.vendor || item.Vendor || 'Aurora Store',
                  reviewCount: item.reviewCount || Math.floor(Math.random() * 50) + 5,
                  soldOut: item.soldOut || item.SoldOut || false,
                  colorCount: item.colorCount || Math.floor(Math.random() * 5)
                };
              } else {
                // Collections
                const collectionImage = item.image || item.Image || item.imageUrl || item.ImageUrl || item.mainImage;
                return {
                  id: item.id || item.Id,
                  name: item.name || item.Name || item.title || 'Unnamed Collection',
                  imageUrl: getImageUrl(collectionImage),
                  description: item.description || item.Description
                };
              }
            });
            
            console.log('FeaturedCollection - Mapped items with image URLs:', mappedItems);
            setItems(mappedItems);
          } else {
            console.error('FeaturedCollection - API error:', response.status, response.statusText);
          }
        } else {
          console.log('FeaturedCollection - No endpoint or IDs to fetch');
        }
      } catch (error) {
        console.error('FeaturedCollection - Error fetching items:', error);
        
        // In editor, show sample data on error
        if (isEditor) {
          console.log('FeaturedCollection - Using sample data due to error');
          setItems([
            { id: 1, name: 'Sample Item 1', price: 99.99, originalPrice: 149.99, discount: 33, rating: 4.5, imageUrl: '/api/placeholder/400/500' },
            { id: 2, name: 'Sample Item 2', price: 79.99, originalPrice: 119.99, discount: 33, rating: 4.5, imageUrl: '/api/placeholder/400/500' },
            { id: 3, name: 'Sample Item 3', price: 129.99, originalPrice: 199.99, discount: 35, rating: 4.5, imageUrl: '/api/placeholder/400/500' },
            { id: 4, name: 'Sample Item 4', price: 49.99, originalPrice: 89.99, discount: 44, rating: 4.5, imageUrl: '/api/placeholder/400/500' },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
    // NOTE: use stable string keys to prevent infinite loops when arrays are recreated
  }, [
    finalConfig.activeType,
    JSON.stringify(finalConfig.selectedCollections || []),
    JSON.stringify(finalConfig.selectedProducts || []),
    JSON.stringify(finalConfig.selectedRooms || []),
    isEditor
  ]);
  
  // Only hide if explicitly disabled and not in editor
  if (finalConfig.enabled === false && !isEditor) return null;
  
  // In editor, show disabled state
  if (finalConfig.enabled === false && isEditor) {
    return (
      <section className="relative min-h-[100px] bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="text-lg font-medium">Featured Collection (Disabled)</div>
          <div className="text-sm">Enable in settings to preview</div>
        </div>
      </section>
    );
  }
  
  // Get color scheme with proper structure
  const colorSchemeIndex = finalConfig.colorScheme ? parseInt(finalConfig.colorScheme) - 1 : 0;
  const colorScheme: any = themeConfig?.colorSchemes?.schemes?.[colorSchemeIndex] || {
    background: '#ffffff',
    text: '#000000',
    foreground: '#000000',
    border: '#e5e5e5',
    link: '#0066cc',
    solidButton: '#000000',
    solidButtonText: '#ffffff',
    outlineButton: '#000000',
    outlineButtonText: '#000000',
    imageOverlay: 'rgba(0,0,0,0.3)',
    primary: '#000000',
    secondary: '#666666'
  };
  
  // Get typography
  const typography: any = themeConfig?.typography || {};
  const headingStyles: any = typography?.headings || {};
  
  // Generate heading typography styles
  const getHeadingStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: headingStyles.fontFamily ? `'${headingStyles.fontFamily}', sans-serif` : undefined,
      fontWeight: headingStyles.fontWeight || '600',
      textTransform: headingStyles.useUppercase ? 'uppercase' : 'none',
      letterSpacing: `${headingStyles.letterSpacing || 0}px`
    };
    
    // Apply font size based on heading size setting
    const headingSizes: Record<string, string> = {
      h1: '2.5rem',
      h2: '2rem', 
      h3: '1.75rem',
      h4: '1.5rem',
      h5: '1.25rem',
      h6: '1.125rem',
      h7: '1rem',
      h8: '0.875rem'
    };
    
    const fontSize = headingSizes[finalConfig.headingSize || 'h2'] || '2rem';
    
    return {
      ...baseStyles,
      fontSize,
      textAlign: (finalConfig.headingAlignment || 'center') as 'left' | 'center' | 'right',
      color: colorScheme.text
    };
  };
  
  // Get aspect ratio class - simplified options
  const getAspectRatio = () => {
    switch(finalConfig.imageRatio) {
      case 'square': 
        return 'aspect-square';
      case 'portrait': 
        return 'aspect-[3/4]';
      case 'landscape': 
        return 'aspect-[3/2]';
      case 'default':
      default: 
        return 'aspect-[4/3]';
    }
  };
  
  const getObjectFit = () => {
    return 'object-cover';
  };
  
  const getImageContainerClass = () => {
    return cn(
      "relative overflow-hidden bg-gray-100",
      getAspectRatio()
    );
  };
  
  // Calculate columns
  const getGridCols = () => {
    if (isMobile) {
      return finalConfig.mobileLayout === 'twoColumn' ? 'grid-cols-2' : 'grid-cols-1';
    }
    switch(finalConfig.desktopColumns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-4';
    }
  };
  
  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };
  
  const handleNext = () => {
    const maxIndex = Math.max(0, itemsToShow.length - (isMobile ? 1 : finalConfig.desktopColumns));
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };
  
  const getButtonText = () => {
    // Use custom button text if provided
    if (finalConfig.showReserveButton && finalConfig.reserveButtonText) {
      return finalConfig.reserveButtonText;
    }
    if (finalConfig.showBuyButton && finalConfig.buyButtonText) {
      return finalConfig.buyButtonText;
    }
    if (finalConfig.showAddToCart && finalConfig.addToCartText) {
      return finalConfig.addToCartText;
    }
    
    // Default text based on button type
    if (finalConfig.showReserveButton) return 'Reservar';
    if (finalConfig.showBuyButton) return 'Comprar ahora';
    if (finalConfig.showAddToCart) return 'Agregar al carrito';
    
    // Fallback based on active type
    switch(finalConfig.activeType) {
      case 'rooms': return 'Reservar';
      case 'collections': return 'Ver colección';
      default: return 'Agregar';
    }
  };
  
  const getTitle = () => {
    if (finalConfig.heading) return finalConfig.heading;
    switch(finalConfig.activeType) {
      case 'rooms': return 'Habitaciones';
      case 'collections': return 'Colecciones';
      case 'products': return 'Productos destacados';
      default: return 'Featured Collection';
    }
  };
  
  // Apply cardsToShow limit
  const itemsToShow = items.slice(0, finalConfig.cardsToShow || 4);
  
  console.log('FeaturedCollection - Rendering with items:', itemsToShow.length, itemsToShow);
  
  const renderCard = (item: Item) => {
    // Determine if we should make the card clickable
    const isClickable = !isEditor && (
      (finalConfig.activeType === 'rooms' && item.slug) ||
      (finalConfig.activeType === 'products' && item.slug) ||
      (finalConfig.activeType === 'collections')
    );
    
    console.log('[DEBUG] RenderCard:', {
      itemName: item.name,
      slug: item.slug,
      isEditor,
      activeType: finalConfig.activeType,
      isClickable
    });
    
    const cardContent = (
      <div 
        className={cn(
          "group relative",
          isMobile && "bg-white shadow-sm",
          isClickable && "cursor-pointer"
        )}
        style={{
          borderRadius: `${finalConfig.edgeRounding ?? 12}px`,
          backgroundColor: isMobile ? colorScheme.background : undefined
        }}
      >
        {/* Image Container */}
        <div 
        className={cn(
          getImageContainerClass(),
          isMobile && "aspect-[4/3]" // Force more square aspect for mobile
        )}
        style={{ 
          borderTopLeftRadius: `${finalConfig.edgeRounding ?? 12}px`,
          borderTopRightRadius: `${finalConfig.edgeRounding ?? 12}px`,
          borderBottomLeftRadius: (finalConfig.contentPosition === 'bottom' || isMobile) ? 0 : `${finalConfig.edgeRounding ?? 12}px`,
          borderBottomRightRadius: (finalConfig.contentPosition === 'bottom' || isMobile) ? 0 : `${finalConfig.edgeRounding ?? 12}px`,
          backgroundColor: finalConfig.colorCardBackground ? ((colorScheme.secondary ?? '#666') + '10') : undefined
        }}
      >
        {/* Badge Container - Top Left */}
        {(item.discount && item.discount > 0 && finalConfig.showSaleBadge || 
          item.soldOut && finalConfig.showSoldOutBadge) && (
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {(item.discount && item.discount > 0 && finalConfig.showSaleBadge) && (
              <span className="inline-block px-2 py-1 text-xs font-semibold text-white"
                    style={{ 
                      backgroundColor: '#ef4444',
                      borderRadius: '4px'
                    }}>
                -{item.discount}% Oferta
              </span>
            )}
            {(item.soldOut && finalConfig.showSoldOutBadge) && (
              <span className="inline-block px-2 py-1 text-xs font-semibold text-white"
                    style={{ 
                      backgroundColor: '#6b7280',
                      borderRadius: '4px'
                    }}>
                Agotado
              </span>
            )}
          </div>
        )}
        
        <img
          src={item.imageUrl || '/api/placeholder/400/500'}
          alt={item.name}
          className={cn(
            "w-full h-full group-hover:scale-105 transition-transform duration-300",
            getObjectFit(),
            isClickable && "cursor-pointer"
          )}
        />
        
        {/* Content Overlay - Only for desktop when not bottom */}
        {!isMobile && finalConfig.contentPosition !== 'bottom' && (
          <div 
            className={cn(
              "absolute inset-0 p-4 flex flex-col",
              finalConfig.contentPosition === 'top' ? 'justify-start' : 'justify-center',
              finalConfig.activeType === 'collections' && finalConfig.collectionContentAlignment === 'left' ? 'items-start' :
              finalConfig.activeType === 'collections' && finalConfig.collectionContentAlignment === 'right' ? 'items-end' :
              'items-center'
            )}
            style={{
              background: finalConfig.activeType === 'collections' && finalConfig.enableOverlay
                ? `linear-gradient(to top, rgba(0,0,0,${(finalConfig.overlayOpacity || 15) / 100}) 0%, transparent 100%)`
                : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)'
            }}
          >
            <h3 className="text-white font-semibold text-lg">{item.name}</h3>
            
            {/* Show product count for collections */}
            {finalConfig.activeType === 'collections' && finalConfig.showProductCount && (
              <p className="text-white/90 text-sm mt-1">
                {Math.floor(Math.random() * 20) + 5} productos
              </p>
            )}
            
            {/* Show rating for products/rooms */}
            {finalConfig.activeType !== 'collections' && item.rating && (
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn(
                    "w-3 h-3",
                    i < Math.floor(item.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  )} />
                ))}
                <span className="text-white text-sm ml-1">{item.rating}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Content and Button Section */}
      <div className={cn(
        "pt-3",
        isMobile ? "px-3 pb-3" : "", // Add padding for mobile
        finalConfig.contentAlignment === 'center' ? 'text-center' : 'text-left'
      )}>
        {/* Show content if position is bottom OR on mobile */}
        {(finalConfig.contentPosition === 'bottom' || isMobile) && (
          <>
            {/* Name */}
            <h3 className={cn(
              "font-normal leading-tight",
              isMobile ? "text-base" : "text-sm"
            )} style={{ color: colorScheme.text }}>
              {item.name}
            </h3>
          
          {/* Vendor */}
          {finalConfig.showVendor && item.vendor && !isMobile && (
            <p className="text-xs mt-1" style={{ color: colorScheme.secondary ?? '#666' }}>
              {item.vendor}
            </p>
          )}
          
          {/* Color Count */}
          {finalConfig.showColorCount && item.colorCount && item.colorCount > 0 && !isMobile && (
            <p className="text-xs mt-1" style={{ color: colorScheme.secondary ?? '#666' }}>
              {item.colorCount} {item.colorCount === 1 ? 'color' : 'colores'} disponibles
            </p>
          )}
          
          {/* Rating */}
          {item.rating && finalConfig.productRating !== 'none' && (
            <div className={cn(
              "flex items-center gap-1",
              isMobile ? "mt-2" : "mt-1.5",
              finalConfig.contentAlignment === 'center' ? 'justify-center' : 'justify-start'
            )}>
              {(finalConfig.productRating === 'stars-only' || 
                finalConfig.productRating === 'review-count-and-stars' ||
                finalConfig.productRating === 'average-rating-and-stars') && (
                [...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={isMobile ? "w-4 h-4" : "w-3 h-3"}
                    style={{
                      fill: i < Math.floor(item.rating || 0) ? (finalConfig.starsColor || '#fbbf24') : '#e5e7eb',
                      color: i < Math.floor(item.rating || 0) ? (finalConfig.starsColor || '#fbbf24') : '#e5e7eb'
                    }}
                  />
                ))
              )}
              {(finalConfig.productRating === 'average-rating-only' || 
                finalConfig.productRating === 'average-rating-and-stars') && (
                <span className={cn(
                  "ml-0.5",
                  isMobile ? "text-sm" : "text-xs"
                )} style={{ color: colorScheme.secondary ?? '#666' }}>
                  {item.rating}
                </span>
              )}
              {(finalConfig.productRating === 'review-count-only' || 
                finalConfig.productRating === 'review-count-and-stars') && (
                <span className={cn(
                  "ml-0.5",
                  isMobile ? "text-sm" : "text-xs"
                )} style={{ color: colorScheme.secondary ?? '#666' }}>
                  ({item.reviewCount || 0})
                </span>
              )}
            </div>
          )}
          
          {/* Prices */}
          {item.price && (
            <div className={isMobile ? "mt-3" : "mt-2"}>
              <div className={cn(
                "flex items-baseline gap-2 flex-wrap",
                finalConfig.contentAlignment === 'center' ? 'justify-center' : 'justify-start'
              )}>
                <span className={cn(
                  "font-bold whitespace-nowrap",
                  isMobile ? "text-xl" : "text-base font-semibold"
                )} style={{ color: colorScheme.text }}>
                  {formatPrice(item.price)}{finalConfig.showCurrencyCode ? ` ${selectedCurrency}` : ''}
                </span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className={cn(
                    "line-through whitespace-nowrap",
                    isMobile ? "text-base" : "text-sm"
                  )} style={{ color: colorScheme.secondary ?? '#666', opacity: 0.7 }}>
                    {formatPrice(item.originalPrice)}{finalConfig.showCurrencyCode ? ` ${selectedCurrency}` : ''}
                  </span>
                )}
                {item.originalPrice && item.originalPrice > item.price && item.discount && (
                  <span className={cn(
                    "font-semibold whitespace-nowrap",
                    isMobile ? "text-sm text-red-600" : "text-xs px-1.5 py-0.5 rounded"
                  )}
                        style={{ 
                          backgroundColor: isMobile ? 'transparent' : '#fef2f2',
                          color: isMobile ? undefined : '#ef4444'
                        }}>
                    {item.discount}% OFF
                  </span>
                )}
              </div>
            </div>
          )}
          </>
        )}
        
        {/* Buttons - Show all enabled buttons */}
        {(finalConfig.showAddToCart || finalConfig.showBuyButton || finalConfig.showReserveButton) && (
          <div className={cn(
            "space-y-2",
            isMobile ? "mt-4" : "mt-3"
          )}>
            {finalConfig.showAddToCart && (
            <button
              className={cn(
                "w-full rounded-md font-medium transition-colors flex items-center justify-center gap-2",
                isMobile ? "px-4 py-3 text-base" : "px-4 py-2.5 text-sm",
                finalConfig.buttonStyle === 'solid' 
                  ? "text-white hover:opacity-90"
                  : "border-2 hover:bg-opacity-10"
              )}
              style={{
                backgroundColor: finalConfig.buttonStyle === 'solid' ? 
                  (colorScheme.solidButton || '#000000') : 
                  'transparent',
                borderColor: finalConfig.buttonStyle === 'outline' ? 
                  (colorScheme.outlineButton || '#000000') : 
                  'transparent',
                color: finalConfig.buttonStyle === 'solid' ? 
                  (colorScheme.solidButtonText || '#FFFFFF') : 
                  (colorScheme.outlineButtonText || '#000000')
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              {finalConfig.addToCartText || 'Agregar al carrito'}
            </button>
          )}
          
          {finalConfig.showBuyButton && (
            <button
              className={cn(
                "w-full rounded-md font-medium transition-colors flex items-center justify-center gap-2",
                isMobile ? "px-4 py-3 text-base" : "px-4 py-2.5 text-sm",
                finalConfig.buttonStyle === 'solid' 
                  ? "text-white hover:opacity-90"
                  : "border-2 hover:bg-opacity-10"
              )}
              style={{
                backgroundColor: finalConfig.buttonStyle === 'solid' ? 
                  (colorScheme.solidButton || '#000000') : 
                  'transparent',
                borderColor: finalConfig.buttonStyle === 'outline' ? 
                  (colorScheme.outlineButton || '#000000') : 
                  'transparent',
                color: finalConfig.buttonStyle === 'solid' ? 
                  (colorScheme.solidButtonText || '#FFFFFF') : 
                  (colorScheme.outlineButtonText || '#000000')
              }}
            >
              <CreditCard className="w-4 h-4" />
              {finalConfig.buyButtonText || 'Comprar ahora'}
            </button>
          )}
          
          {finalConfig.showReserveButton && (
            // If card is wrapped with an anchor already (isClickable), avoid nested <a> by rendering a button
            finalConfig.activeType === 'rooms' && item.slug && !isEditor && isClickable ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/habitaciones/${item.slug}`;
                }}
                className={cn(
                  "w-full rounded-md font-medium transition-colors flex items-center justify-center gap-2",
                  isMobile ? "px-4 py-3 text-base" : "px-4 py-2.5 text-sm",
                  finalConfig.buttonStyle === 'solid' 
                    ? "text-white hover:opacity-90"
                    : "border-2 hover:bg-opacity-10"
                )}
                style={{
                  backgroundColor: finalConfig.buttonStyle === 'solid' ? 
                    (colorScheme.solidButton || '#000000') : 
                    'transparent',
                  borderColor: finalConfig.buttonStyle === 'outline' ? 
                    (colorScheme.outlineButton || '#000000') : 
                    'transparent',
                  color: finalConfig.buttonStyle === 'solid' ? 
                    (colorScheme.solidButtonText || '#FFFFFF') : 
                    (colorScheme.outlineButtonText || '#000000')
                }}
              >
                <Calendar className="w-4 h-4" />
                {finalConfig.reserveButtonText || 'Reservar'}
              </button>
            ) : finalConfig.activeType === 'rooms' && item.slug && !isEditor ? (
              <a 
                href={`/habitaciones/${item.slug}`}
                className={cn(
                  "w-full rounded-md font-medium transition-colors flex items-center justify-center gap-2 inline-block",
                  isMobile ? "px-4 py-3 text-base" : "px-4 py-2.5 text-sm",
                  finalConfig.buttonStyle === 'solid' 
                    ? "text-white hover:opacity-90"
                    : "border-2 hover:bg-opacity-10"
                )}
                style={{
                  backgroundColor: finalConfig.buttonStyle === 'solid' ? 
                    (colorScheme.solidButton || '#000000') : 
                    'transparent',
                  borderColor: finalConfig.buttonStyle === 'outline' ? 
                    (colorScheme.outlineButton || '#000000') : 
                    'transparent',
                  color: finalConfig.buttonStyle === 'solid' ? 
                    (colorScheme.solidButtonText || '#FFFFFF') : 
                    (colorScheme.outlineButtonText || '#000000')
                }}
              >
                <Calendar className="w-4 h-4" />
                {finalConfig.reserveButtonText || 'Reservar'}
              </a>
            ) : (
              <button
                className={cn(
                  "w-full rounded-md font-medium transition-colors flex items-center justify-center gap-2",
                  isMobile ? "px-4 py-3 text-base" : "px-4 py-2.5 text-sm",
                  finalConfig.buttonStyle === 'solid' 
                    ? "text-white hover:opacity-90"
                    : "border-2 hover:bg-opacity-10"
                )}
                style={{
                  backgroundColor: finalConfig.buttonStyle === 'solid' ? 
                    (colorScheme.solidButton || '#000000') : 
                    'transparent',
                  borderColor: finalConfig.buttonStyle === 'outline' ? 
                    (colorScheme.outlineButton || '#000000') : 
                    'transparent',
                  color: finalConfig.buttonStyle === 'solid' ? 
                    (colorScheme.solidButtonText || '#FFFFFF') : 
                    (colorScheme.outlineButtonText || '#000000')
                }}
              >
                <Calendar className="w-4 h-4" />
                {finalConfig.reserveButtonText || 'Reservar'}
              </button>
            )
          )}
          </div>
        )}
      </div>
    </div>
    );
    
    // Wrap in link if clickable
    if (isClickable) {
      let href = '#';
      
      if (finalConfig.activeType === 'rooms' && item.slug) {
        // Navigate to specific room page
        href = `/habitaciones/${item.slug}`;
      } else if (finalConfig.activeType === 'products' && item.slug) {
        // Navigate to specific product page
        href = `/product/${item.slug}`;
      } else if (finalConfig.activeType === 'collections') {
        // Navigate to collection page
        href = `/collection/${item.slug || item.id}`;
      }
      
      return (
        <a href={href} className="block">
          {cardContent}
        </a>
      );
    }
    
    return cardContent;
  };
  
  return (
    <section
      className={cn(
        "relative min-h-[200px]",
        finalConfig.width === 'full' ? 'w-full' : 'container mx-auto px-4'
      )}
      style={{
        paddingTop: `${isMobile ? 20 : (finalConfig.topSpacing ?? 40)}px`,
        paddingBottom: `${isMobile ? 20 : (finalConfig.bottomSpacing ?? 40)}px`,
        backgroundColor: colorScheme?.background || '#ffffff',
      }}
    >
      {/* Heading */}
      {finalConfig.heading && (
        <div style={{ marginBottom: `${finalConfig.headingSpacing ?? 32}px` }}>
          <h2 style={getHeadingStyles()}>
            {getTitle()}
          </h2>
        </div>
      )}
      
      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-current" 
                style={{ borderColor: colorScheme.primary ?? '#000' }} />

        </div>
      ) : itemsToShow.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-gray-500">
            <div className="text-lg font-medium mb-2">No items selected</div>
            <div className="text-sm">
              {isEditor ? 'Use the configuration panel to select collections, products, or rooms' : 'No items to display'}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Grid Layout */}
          {finalConfig.desktopLayout === 'grid' && !isMobile && (
            <div 
              className={cn("grid", getGridCols())}
              style={{ gap: `${finalConfig.desktopGap ?? 24}px` }}
            >
              {itemsToShow.map(item => (
                <div key={item.id}>
                  {renderCard(item)}
                </div>
              ))}
            </div>
          )}
          
          {/* Carousel Layout - Desktop only */}
          {!isMobile && (finalConfig.desktopLayout === 'carousel' || 
            finalConfig.desktopLayout === 'slider') && (
            <div className="relative group">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300"
                  style={{
                    transform: `translateX(-${currentIndex * (100 / (isMobile ? 1 : finalConfig.desktopColumns))}%)`,
                    gap: `${isMobile ? finalConfig.mobileGap : finalConfig.desktopGap}px`
                  }}
                >
                  {itemsToShow.map(item => (
                    <div 
                      key={item.id}
                      className="flex-shrink-0"
                      style={{ width: `calc(${100 / (isMobile ? 1 : finalConfig.desktopColumns)}% - ${(isMobile ? finalConfig.mobileGap : finalConfig.desktopGap) * (finalConfig.desktopColumns - 1) / finalConfig.desktopColumns}px)` }}
                    >
                      {renderCard(item)}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation Arrows - Desktop only, bottom right corner */}
              {!isMobile && finalConfig.showArrowOnHover && itemsToShow.length > finalConfig.desktopColumns && (
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={handlePrevious}
                    className="p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: `${colorScheme.background}ee`,
                      border: `1px solid ${colorScheme.border || '#e5e5e5'}`
                    }}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" style={{ color: colorScheme.text }} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: `${colorScheme.background}ee`,
                      border: `1px solid ${colorScheme.border || '#e5e5e5'}`
                    }}
                    disabled={currentIndex >= itemsToShow.length - finalConfig.desktopColumns}
                  >
                    <ChevronRight className="w-4 h-4" style={{ color: colorScheme.text }} />
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Mobile Layout - Always one column */}
          {isMobile && (
            <div 
              className="grid grid-cols-1"
              style={{ gap: `${finalConfig.mobileGap ?? 16}px` }}
            >
              {itemsToShow.map(item => (
                <div key={item.id}>
                  {renderCard(item)}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
