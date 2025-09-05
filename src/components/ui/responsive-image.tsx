import React, { useState, useEffect } from 'react';
import { getResponsiveImageProps, generateBlurPlaceholder, preloadImage } from '@/lib/image-optimizer';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  objectFit = 'contain',
  onLoad,
  onError
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(generateBlurPlaceholder());

  useEffect(() => {
    if (!src) return;

    // Ensure the URL is complete with backend host if it's a relative path
    const fullUrl = src.startsWith('http') 
      ? src 
      : `http://localhost:5266${src}`;

    // Preload image if priority
    if (priority) {
      preloadImage(fullUrl)
        .then(() => {
          setImageSrc(fullUrl);
          setIsLoading(false);
          setHasError(false);
        })
        .catch(() => {
          setHasError(true);
          setIsLoading(false);
        });
    } else {
      setImageSrc(fullUrl);
    }
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generate responsive props - use the full URL
  const fullUrl = src && !src.startsWith('http') 
    ? `http://localhost:5266${src}`
    : src;
    
  const responsiveProps = fullUrl ? getResponsiveImageProps(fullUrl, alt, {
    maxWidth: width,
    sizes: width ? `(max-width: 768px) 100vw, ${width}px` : undefined
  }) : null;

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        style={{ width, height }}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" />
      )}
      
      <picture>
        {/* WebP source for browsers that support it */}
        {responsiveProps && (
          <source 
            type="image/webp"
            srcSet={responsiveProps.srcSet.replace(/\.(jpg|jpeg|png)/g, '.webp')}
            sizes={responsiveProps.sizes}
          />
        )}
        
        {/* Original format fallback */}
        <img
          src={imageSrc}
          srcSet={responsiveProps?.srcSet}
          sizes={responsiveProps?.sizes}
          alt={alt}
          width={width}
          height={height}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={{ 
            objectFit,
            width: '100%',
            height: '100%'
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      </picture>
    </div>
  );
}