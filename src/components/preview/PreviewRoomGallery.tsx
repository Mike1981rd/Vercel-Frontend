'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Grid3x3, X, Share, Heart } from 'lucide-react';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { fetchRoomData } from '@/lib/api/rooms';

interface RoomGalleryConfig {
  enabled: boolean;
  layoutStyle?: 'airbnb' | 'grid' | 'carousel';
  colorScheme?: 1 | 2 | 3 | 4 | 5;
  fontSize?: {
    caption: number;
    button: number;
  };
  cornerRadius?: 'none' | 'small' | 'medium' | 'large';
  showAllPhotosButton?: boolean;
  buttonText?: string;
  showCaptions?: boolean;
  showShareSave?: boolean; // Add option for share/save buttons
  cardSize?: number; // Card size percentage (50-200), default 100
  containerWidth?: number; // Container width percentage (50-100), default 100
  paddingTop?: number;
  paddingBottom?: number;
  containerPaddingTop?: number;
  containerPaddingBottom?: number;
}

interface PreviewRoomGalleryProps {
  config: RoomGalleryConfig;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
  theme?: any;
}

export default function PreviewRoomGallery({ 
  config, 
  deviceView, 
  isEditor = false,
  theme 
}: PreviewRoomGalleryProps) {
  
  // Get theme config from store or prop
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;
  
  // Get the selected color scheme
  const colorScheme = useMemo(() => {
    if (!themeConfig?.colorSchemes?.schemes) return null;
    
    const schemeIndex = (config.colorScheme || 1) - 1;
    return themeConfig.colorSchemes.schemes[schemeIndex] || themeConfig.colorSchemes.schemes[0];
  }, [themeConfig, config.colorScheme]);
  
  // Calculate card size scale
  const cardScale = (config.cardSize || 100) / 100;
  const baseHeight = 400; // Base height in pixels
  const scaledHeight = Math.round(baseHeight * cardScale);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Fetch room images
  useEffect(() => {
    const loadRoomData = async () => {
      const companyId = localStorage.getItem('companyId') || '1';
      
      setLoading(true);
      try {
        // Use helper function that checks for slug
        const roomData = await fetchRoomData(companyId);
        if (roomData) {
          if (roomData?.images?.length > 0) {
            setImages(roomData.images.slice(0, 5));
          } else {
            // Fallback images
            setImages([
              "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/f2563160-2ae7-4e77-ba23-ddc37eb69a16.jpeg?w=1200",
              "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/bd736170-1ade-409f-85f9-a83e607efa66.jpeg?w=800",
              "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/76e5f102-3099-42f5-997e-3fb1bb9c2c6e.jpeg?w=800",
              "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/889862f5-5804-4b68-ab1e-1edf2586105f.jpeg?w=800",
              "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/5d9241e9-ab07-444d-b476-f509f74a3df8.jpeg?w=800"
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
        // Use fallback images
        setImages([
          "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/f2563160-2ae7-4e77-ba23-ddc37eb69a16.jpeg?w=1200",
          "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/bd736170-1ade-409f-85f9-a83e607efa66.jpeg?w=800",
          "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/76e5f102-3099-42f5-997e-3fb1bb9c2c6e.jpeg?w=800",
          "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/889862f5-5804-4b68-ab1e-1edf2586105f.jpeg?w=800",
          "https://a0.muscache.com/im/pictures/miso/Hosting-52250898/original/5d9241e9-ab07-444d-b476-f509f74a3df8.jpeg?w=800"
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (config.enabled) {
      loadRoomData();
    }
  }, [config.enabled]);

  if (!config.enabled || images.length === 0) {
    return null;
  }

  // Get corner radius
  const getCornerRadius = () => {
    switch(config.cornerRadius) {
      case 'none': return '0px';
      case 'small': return '4px';
      case 'large': return '16px';
      default: return '8px'; // medium
    }
  };

  const cornerRadius = getCornerRadius();

  // Get typography styles
  const buttonTypography = themeConfig?.typography?.buttons ? {
    fontFamily: `'${themeConfig.typography.buttons.fontFamily}', sans-serif`,
    fontWeight: themeConfig.typography.buttons.fontWeight || '400',
    fontSize: `${config.fontSize?.button || 100}%`,
    letterSpacing: `${themeConfig.typography.buttons.letterSpacing || 0}px`
  } : { fontSize: `${config.fontSize?.button || 100}%` };

  const captionTypography = themeConfig?.typography?.body ? {
    fontFamily: `'${themeConfig.typography.body.fontFamily}', sans-serif`,
    fontWeight: themeConfig.typography.body.fontWeight || '400',
    fontSize: `${config.fontSize?.caption || 100}%`,
    letterSpacing: `${themeConfig.typography.body.letterSpacing || 0}px`
  } : { fontSize: `${config.fontSize?.caption || 100}%` };

  // Get container spacing
  const containerTopPadding = config.containerPaddingTop !== undefined ? config.containerPaddingTop : 0;
  const containerBottomPadding = config.containerPaddingBottom !== undefined ? config.containerPaddingBottom : 24;

  // Container wrapper with margins
  return (
    <div style={{ 
      marginTop: `${containerTopPadding}px`,
      marginBottom: `${containerBottomPadding}px`
    }}>
      {/* Width-constrained container */}
      <div style={{
        maxWidth: `${config.containerWidth || 100}%`,
        margin: '0 auto'
      }}>
        {/* Main content with background and internal padding */}
        <div style={{
          backgroundColor: colorScheme?.background || 'transparent',
          paddingTop: `${config.paddingTop || 0}px`,
          paddingBottom: `${config.paddingBottom || 0}px`
        }}>
        {/* Debug indicator for editor mode */}
        {isEditor && (
          <div className="container mx-auto px-6 mb-2">
            <div className="text-xs" style={{ color: colorScheme?.text || '#6b7280', opacity: 0.6 }}>
              {loading ? '⏳ Loading gallery images...' : images.length > 0 ? '✅ Using real room images' : '📝 Using default images'}
            </div>
          </div>
        )}

        {/* Airbnb Style Layout */}
        {config.layoutStyle === 'airbnb' && !isMobile && (
          <div className="relative">
            {/* Share and Save buttons in top-right corner */}
            {config.showShareSave !== false && (
              <div className="absolute top-4 right-4 z-10 flex gap-3">
                <button 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition backdrop-blur-sm"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#000000',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  }}
                >
                  <Share className="w-4 h-4" />
                  <span className="text-sm font-medium underline">Share</span>
                </button>
                <button 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition backdrop-blur-sm"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#000000',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  }}
                >
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium underline">Save</span>
                </button>
              </div>
            )}
            
            <div className="flex gap-2" style={{ height: `${scaledHeight}px` }}>
              {/* Main large image - takes half width */}
              <div className="flex-1">
                <img
                  src={images[0]}
                  alt="Room 1"
                  className="w-full h-full object-cover"
                  style={{ borderRadius: `${cornerRadius} 0 0 ${cornerRadius}` }}
                />
              </div>
              
              {/* Grid of 4 smaller images - takes other half */}
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">
                {images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Room ${index + 2}`}
                      className="w-full h-full object-cover"
                      style={{ 
                        borderRadius: index === 1 ? `0 ${cornerRadius} 0 0` : 
                                    index === 3 ? `0 0 ${cornerRadius} 0` : '0'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Show all photos button */}
            {config.showAllPhotosButton !== false && (
              <button
                onClick={() => setShowAllPhotos(true)}
                className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all hover:shadow-xl"
                style={{
                  backgroundColor: colorScheme?.buttonBackground || '#ffffff',
                  color: colorScheme?.buttonText || '#000000',
                  border: `1px solid ${colorScheme?.border || '#000000'}`,
                  ...buttonTypography
                }}
              >
                <Grid3x3 className="w-4 h-4" />
                {config.buttonText || 'Show all photos'}
              </button>
            )}
          </div>
        )}

        {/* Grid Layout */}
        {config.layoutStyle === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="relative aspect-[4/3]"
                style={{ 
                  transform: `scale(${cardScale})`,
                  transformOrigin: 'center',
                  margin: cardScale < 1 ? `${(1 - cardScale) * -15}%` : undefined
                }}
              >
                <img
                  src={image}
                  alt={`Room ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{ borderRadius: cornerRadius }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Carousel Layout */}
        {config.layoutStyle === 'carousel' && (
          <div className="relative">
            <div className="overflow-hidden" style={{ borderRadius: cornerRadius }}>
              <img
                src={images[currentImageIndex]}
                alt={`Room ${currentImageIndex + 1}`}
                className="w-full object-cover"
                style={{ height: `${scaledHeight}px` }}
              />
            </div>
            
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg"
                  style={{
                    backgroundColor: colorScheme?.buttonBackground || '#ffffff',
                    color: colorScheme?.buttonText || '#000000'
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg"
                  style={{
                    backgroundColor: colorScheme?.buttonBackground || '#ffffff',
                    color: colorScheme?.buttonText || '#000000'
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            
            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'w-8' : ''
                  }`}
                  style={{
                    backgroundColor: index === currentImageIndex 
                      ? colorScheme?.buttonBackground || '#ffffff'
                      : 'rgba(255,255,255,0.5)'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Layout - Always carousel */}
        {isMobile && config.layoutStyle !== 'carousel' && (
          <div className="relative">
            <div className="overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={`Room ${currentImageIndex + 1}`}
                className="w-full object-cover"
                style={{ 
                  borderRadius: cornerRadius,
                  height: `${Math.round(300 * cardScale)}px`
                }}
              />
            </div>
            
            {/* Mobile navigation dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'w-8' : ''
                  }`}
                  style={{
                    backgroundColor: index === currentImageIndex 
                      ? colorScheme?.buttonBackground || '#ffffff'
                      : 'rgba(255,255,255,0.5)'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Full screen modal */}
        {showAllPhotos && (
          <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
            <div className="container mx-auto py-4">
              <button
                onClick={() => setShowAllPhotos(false)}
                className="fixed top-4 right-4 p-2 bg-white rounded-full shadow-lg z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="space-y-4">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Room ${index + 1}`}
                    className="w-full max-w-4xl mx-auto"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}