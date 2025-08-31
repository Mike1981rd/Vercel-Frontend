/**
 * @file PreviewTestimonials.tsx
 * @max-lines 400
 * @module Testimonials
 * @description Componente Preview UNIFICADO para editor y preview real
 * @unified-architecture true
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { TestimonialsConfig } from '@/components/editor/modules/Testimonials/types';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewTestimonialsProps {
  config: TestimonialsConfig;
  theme?: any;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
}

export default function PreviewTestimonials({ 
  config, 
  theme,
  deviceView,
  isEditor = false
}: PreviewTestimonialsProps) {
  
  // 🔴 COPIAR EXACTO - NO MODIFICAR
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;
  
  // 🔴 COPIAR EXACTO - PATRÓN CANÓNICO MÓVIL
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });
  
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
  
  // 🔴 COPIAR EXACTO - COLOR SCHEME
  const colorScheme = useMemo(() => {
    if (!themeConfig?.colorSchemes?.schemes) {
      return {
        text: '#000000',
        background: '#FFFFFF',
        solidButton: '#000000',
        solidButtonText: '#FFFFFF',
        outlineButton: '#000000',
        outlineButtonText: '#000000',
      };
    }
    const schemeIndex = parseInt(config.colorScheme || '1') - 1;
    const selectedScheme = themeConfig.colorSchemes.schemes[schemeIndex];
    return selectedScheme || themeConfig.colorSchemes.schemes[0];
  }, [themeConfig, config.colorScheme]);
  
  // 🔴 COPIAR EXACTO - TYPOGRAPHY HEADINGS
  const headingTypographyStyles = useMemo(() => {
    if (!themeConfig?.typography?.headings) return {};
    const typography = themeConfig.typography.headings;
    return {
      fontFamily: `'${typography.fontFamily}', sans-serif`,
      fontWeight: typography.fontWeight || '700',
      textTransform: typography.useUppercase ? 'uppercase' as const : 'none' as const,
      fontSize: typography.fontSize ? 
        (typography.fontSize <= 100 ? 
          `${typography.fontSize}%` : 
          `${typography.fontSize}px`) : '100%',
      letterSpacing: `${typography.letterSpacing || 0}px`
    };
  }, [themeConfig?.typography?.headings]);
  
  // 🔴 COPIAR EXACTO - TYPOGRAPHY BODY
  const bodyTypographyStyles = useMemo(() => {
    if (!themeConfig?.typography?.body) return {};
    const typography = themeConfig.typography.body;
    return {
      fontFamily: `'${typography.fontFamily}', sans-serif`,
      fontWeight: typography.fontWeight || '400',
      textTransform: typography.useUppercase ? 'uppercase' as const : 'none' as const,
      fontSize: typography.fontSize ? 
        (typography.fontSize <= 100 ? 
          `${typography.fontSize}%` : 
          `${typography.fontSize}px`) : '100%',
      letterSpacing: `${typography.letterSpacing || 0}px`
    };
  }, [themeConfig?.typography?.body]);
  
  // 🔴 REGLA CRÍTICA - VALIDACIÓN DESPUÉS DE HOOKS
  if (config?.enabled === false && !isEditor) {
    return null;
  }
  
  const visibleItems = config?.items?.filter(item => item.visible) || [];
  
  // Placeholder items for editor
  const itemsToRender = visibleItems.length > 0 ? visibleItems : (isEditor ? [
    {
      id: 'p1',
      visible: true,
      sortOrder: 0,
      rating: 5,
      testimonial: 'I absolutely love the quality of products from this store. The attention to detail is amazing and the customer service is top-notch!',
      authorName: 'Sarah Johnson',
      authorDetails: 'CEO at TechCorp'
    },
    {
      id: 'p2',
      visible: true,
      sortOrder: 1,
      rating: 5,
      testimonial: 'Fast shipping, great prices, and excellent quality. I\'ve been a customer for years and have never been disappointed.',
      authorName: 'Michael Chen',
      authorDetails: 'Marketing Director'
    }
  ] : []);
  
  // Get width classes
  const getWidthClasses = () => {
    switch (config.width) {
      case 'extra_small': return 'max-w-3xl';
      case 'small': return 'max-w-5xl';
      case 'medium': return 'max-w-6xl';
      case 'large': return 'max-w-7xl';
      case 'page': return 'max-w-[1200px]';
      case 'screen': return 'max-w-full';
      default: return 'max-w-[1200px]';
    }
  };
  
  // Get heading size
  const getHeadingSize = () => {
    const sizes: Record<string, string> = {
      'heading_1': isMobile ? 'text-3xl' : 'text-5xl',
      'heading_2': isMobile ? 'text-2xl' : 'text-4xl',
      'heading_3': isMobile ? 'text-xl' : 'text-3xl',
      'heading_4': isMobile ? 'text-lg' : 'text-2xl',
      'heading_5': isMobile ? 'text-base' : 'text-xl',
      'heading_6': isMobile ? 'text-sm' : 'text-lg',
    };
    return sizes[config.headingSize] || sizes['heading_3'];
  };
  
  // Get body size
  const getBodySize = () => {
    const sizes: Record<string, string> = {
      'body_1': 'text-xs',
      'body_2': 'text-sm',
      'body_3': 'text-base',
      'body_4': 'text-lg',
      'body_5': 'text-xl',
    };
    return sizes[config.bodySize] || 'text-base';
  };
  
  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={cn(
              star <= rating ? 'fill-current' : 'fill-none',
              'transition-colors'
            )}
            style={{ 
              color: config.showRating ? (config.ratingStarsColor || '#FAA613') : 'transparent' 
            }}
          />
        ))}
      </div>
    );
  };
  
  // Get layout classes
  const getLayoutClasses = () => {
    if (isMobile) return 'flex flex-col gap-4';
    
    const cardsPerRow = config.desktopCardsPerRow || 2;
    const gapSize = config.desktopSpaceBetweenCards || 16;
    
    switch (config.desktopLayout) {
      case 'left-vertical':
      case 'right-vertical':
        return 'flex flex-col gap-4';
      case 'bottom-grid':
        return `grid grid-cols-${cardsPerRow} gap-${gapSize / 4}`;
      case 'bottom-carousel':
      case 'bottom-slideshow':
      default:
        return `grid grid-cols-${cardsPerRow} gap-4`;
    }
  };
  
  // Get alignment
  const textAlign = isMobile 
    ? (config.mobileContentAlignment || 'left')
    : (config.desktopContentAlignment || 'left');
  
  return (
    <section
      style={{
        paddingTop: `${config.topPadding}px`,
        paddingBottom: `${config.bottomPadding}px`,
        backgroundColor: config.colorBackground ? colorScheme.background : 'transparent',
        backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}
      className="relative"
    >
      {/* Overlay */}
      {config.backgroundImage && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(0,0,0,' + (config.overlayOpacity / 100) + ')',
            pointerEvents: 'none'
          }}
        />
      )}
      
      <div className={cn(
        'mx-auto relative z-10',
        getWidthClasses(),
        config.addSidePaddings && 'px-4 md:px-8'
      )}>
        {/* Header Section */}
        <div className={cn(
          'mb-8',
          textAlign === 'center' && 'text-center'
        )}>
          {config.subheading && (
            <p 
              className={cn('mb-2 uppercase tracking-wider', getBodySize())}
              style={{ 
                ...bodyTypographyStyles,
                color: colorScheme.text,
                fontSize: '0.875rem'
              }}
            >
              {config.subheading}
            </p>
          )}
          
          {config.heading && (
            <h2 
              className={cn('mb-4', getHeadingSize())}
              style={{ 
                ...headingTypographyStyles,
                color: colorScheme.text 
              }}
            >
              {config.heading}
            </h2>
          )}
          
          {config.body && (
            <div 
              className={cn('mb-6', getBodySize())}
              style={{ 
                ...bodyTypographyStyles,
                color: colorScheme.text 
              }}
              dangerouslySetInnerHTML={{ __html: config.body }}
            />
          )}
          
          {config.linkLabel && config.link && (
            <a
              href={config.link}
              className="inline-block px-6 py-2 rounded transition-colors"
              style={{
                backgroundColor: colorScheme.solidButton,
                color: colorScheme.solidButtonText
              }}
            >
              {config.linkLabel}
            </a>
          )}
        </div>
        
        {/* Testimonials Grid/Carousel */}
        <div className={getLayoutClasses()}>
          {itemsToRender.map((item) => (
            <div
              key={item.id}
              className={cn(
                'rounded-lg p-6 transition-all',
                config.colorTestimonials && 'shadow-lg'
              )}
              style={{
                backgroundColor: config.colorTestimonials 
                  ? '#F5D563' // Yellow testimonial cards like in image
                  : 'transparent',
                border: !config.colorTestimonials ? `1px solid ${colorScheme.text}20` : 'none'
              }}
            >
              {/* Rating */}
              {config.showRating && (
                <div className="mb-3">
                  {renderStars(item.rating)}
                </div>
              )}
              
              {/* Testimonial Text */}
              <div 
                className={cn('mb-4', getBodySize())}
                style={{ 
                  ...bodyTypographyStyles,
                  color: config.colorTestimonials ? '#000' : colorScheme.text 
                }}
                dangerouslySetInnerHTML={{ __html: item.testimonial }}
              />
              
              {/* Author Section */}
              <div className="flex items-center gap-3 mt-4">
                {item.authorAvatar && (
                  <img
                    src={item.authorAvatar}
                    alt={item.authorName}
                    className="w-12 h-12 rounded-full object-cover"
                    style={{ width: `${config.imageSize}px`, height: `${config.imageSize}px` }}
                  />
                )}
                
                <div>
                  <p 
                    className="font-semibold"
                    style={{ 
                      ...bodyTypographyStyles,
                      fontWeight: '600',
                      color: config.colorTestimonials ? '#000' : colorScheme.text 
                    }}
                  >
                    {item.authorName}
                  </p>
                  {item.authorDetails && (
                    <p 
                      className="text-sm opacity-75"
                      style={{ 
                        ...bodyTypographyStyles,
                        fontSize: '0.875rem',
                        color: config.colorTestimonials ? '#000' : colorScheme.text 
                      }}
                    >
                      {item.authorDetails}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Product/Image */}
              {item.image && (
                <img
                  src={item.image}
                  alt="Product"
                  className="mt-4 w-full h-48 object-cover rounded"
                  loading={item.imagePriority ? 'eager' : 'lazy'}
                />
              )}
              
              {/* Link */}
              {item.testimonialLink && (
                <a
                  href={item.testimonialLink}
                  className="text-sm underline mt-2 inline-block"
                  style={{ color: colorScheme.text }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View original
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Custom CSS */}
      {config.customCss && (
        <style dangerouslySetInnerHTML={{ __html: config.customCss }} />
      )}
    </section>
  );
}