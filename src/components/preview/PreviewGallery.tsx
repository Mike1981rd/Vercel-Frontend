/**
 * @file PreviewGallery.tsx
 * @max-lines 300
 * @module Gallery
 * @description Componente Preview UNIFICADO para editor y preview real
 */

'use client';

import React from 'react';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { GalleryConfig, GalleryItemConfig } from '@/components/editor/modules/Gallery/types';
import { cn } from '@/lib/utils';

interface PreviewGalleryProps {
  config: GalleryConfig;
  theme?: any;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
}

export default function PreviewGallery({ 
  config, 
  theme,
  deviceView = 'desktop',
  isEditor = false
}: PreviewGalleryProps) {
  
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;
  
  // Check device
  const isMobile = deviceView === 'mobile';
  
  // Solo ocultar si está explícitamente false
  if (config.enabled === false && !isEditor) return null;
  
  // Get color scheme
  const colorSchemeIndex = config.colorScheme ? parseInt(config.colorScheme) - 1 : 0;
  const colorScheme = themeConfig?.colorSchemes?.schemes?.[colorSchemeIndex] || {
    background: '#ffffff',
    text: '#171717',
    primary: '#000000',
    secondary: '#666666',
    accent: '#0066cc',
    border: '#e5e5e5'
  };
  
  // Get visible items or placeholders for editor
  const visibleItems = config.items?.filter(item => item.visible) || [];
  const itemsToRender = visibleItems.length > 0 ? visibleItems : (isEditor ? [
    { id: 'p1', heading: 'Bikinis', button: 'Shop Now', image: '/api/placeholder/400/500', visible: true, textOverlayPosition: 'bottom-center' as const },
    { id: 'p2', heading: 'One Pieces', button: 'Shop Now', image: '/api/placeholder/400/500', visible: true, textOverlayPosition: 'bottom-center' as const },
    { id: 'p3', heading: 'Swim Tops', button: 'Shop Now', image: '/api/placeholder/400/500', visible: true, textOverlayPosition: 'bottom-center' as const },
    { id: 'p4', heading: 'Beachwear', button: 'Shop Cover-Ups', image: '/api/placeholder/400/500', visible: true, textOverlayPosition: 'bottom-center' as const },
  ] as GalleryItemConfig[] : []);
  
  // Responsive columns
  const columnsDesktop = config.maxImagesPerRowDesktop || 2;
  const columnsMobile = config.imagesPerRowMobile || 1;
  const columns = isMobile ? columnsMobile : columnsDesktop;
  
  // Heights
  const imageHeight = config.imageHeight || 'natural';
  const desktopHeight = config.desktopImageRowHeights || 370;
  const mobileHeight = config.mobileImageRowHeights || 480;
  const height = isMobile ? mobileHeight : desktopHeight;
  
  // Typography
  const headingSize = isMobile 
    ? config.mobileHeadingTextSize || 34
    : config.desktopHeadingTextSize || 28;
  
  // Spacing
  const hasSpacing = config.addSpacingBetweenImages;
  const hasSectionSpacing = config.addSpacingAroundSection;
  
  // Get overlay styles
  const getOverlayStyles = () => {
    switch (config.overlayStyle) {
      case 'tint':
        return 'bg-black/30';
      case 'box':
        return 'bg-black/60';
      case 'shadow':
        return 'shadow-lg';
      case 'text-shadow-tint':
        return 'bg-gradient-to-t from-black/60 to-transparent';
      case 'text':
      case 'no-background':
      default:
        return '';
    }
  };
  
  // Get text position classes
  const getPositionClasses = (position: string) => {
    const base = 'absolute inset-0 flex';
    const positions: Record<string, string> = {
      'top-left': `${base} items-start justify-start`,
      'top-center': `${base} items-start justify-center`,
      'top-right': `${base} items-start justify-end`,
      'middle-left': `${base} items-center justify-start`,
      'middle-center': `${base} items-center justify-center`,
      'middle-right': `${base} items-center justify-end`,
      'bottom-left': `${base} items-end justify-start`,
      'bottom-center': `${base} items-end justify-center`,
      'bottom-right': `${base} items-end justify-end`,
    };
    return positions[position] || positions['bottom-center'];
  };
  
  // Get button styles
  const getButtonStyles = () => {
    switch (config.buttonStyle) {
      case 'primary':
        return 'bg-black text-white hover:bg-gray-800';
      case 'secondary':
        return 'bg-white text-black border border-black hover:bg-gray-100';
      case 'link':
        return 'text-white underline hover:no-underline';
      default:
        return 'bg-white text-black hover:bg-gray-100';
    }
  };
  
  const overlayPadding = config.overlayPadding === 'large' ? 'p-8' : 'p-4';
  
  return (
    <section 
      className={cn(
        "relative",
        config.fullPageWidth ? "w-full" : "container mx-auto",
        hasSectionSpacing ? (isMobile ? "py-8" : "py-16") : "",
        config.animateTextAndImagesOnScroll ? "animate-fade-in" : ""
      )}
      style={{
        maxWidth: config.fullPageWidth ? '100%' : `${config.maximumPageWidth || 1600}px`,
        backgroundColor: colorScheme?.background || '#ffffff',
        color: colorScheme?.text || '#000000'
      }}
    >
      {/* Custom CSS */}
      {config.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: config.customCSS }} />
      )}
      
      <div 
        className={cn(
          "grid",
          hasSpacing ? "gap-4" : "gap-0",
          columns === 1 ? "grid-cols-1" : 
          columns === 2 ? "grid-cols-1 md:grid-cols-2" :
          columns === 3 ? "grid-cols-1 md:grid-cols-3" :
          "grid-cols-2 md:grid-cols-4"
        )}
      >
        {itemsToRender.map((item, index) => (
          <div 
            key={item.id}
            className={cn(
              "relative overflow-hidden group",
              item.enlargeMedia ? "hover:scale-105 transition-transform duration-300" : ""
            )}
            style={{
              height: imageHeight === 'fixed' ? `${height}px` : 'auto'
            }}
          >
            {/* Media (Image or Video) */}
            <div className="relative w-full h-full">
              {item.video ? (
                <video 
                  src={item.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={cn(
                    "w-full object-cover",
                    imageHeight === 'fixed' ? "h-full" : "h-auto"
                  )}
                />
              ) : item.image ? (
                <img 
                  src={item.image}
                  alt={item.imageAlt || item.heading || ''}
                  className={cn(
                    "w-full object-cover",
                    imageHeight === 'fixed' ? "h-full" : "h-auto",
                    config.imageQuality === 'hd' ? "image-rendering-crisp" : ""
                  )}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No media</span>
                </div>
              )}
              
              {/* Overlay */}
              <div className={cn("absolute inset-0", getOverlayStyles())} />
              
              {/* Content */}
              <div className={getPositionClasses(item.textOverlayPosition || 'bottom-center')}>
                <div className={cn("text-center", overlayPadding)}>
                  {item.subheading && (
                    <p 
                      className="text-sm mb-2 opacity-90"
                      style={{ 
                        color: config.overlayStyle === 'no-background' ? colorScheme?.text : 'white',
                        textShadow: config.overlayStyle?.includes('shadow') ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                      }}
                    >
                      {item.subheading}
                    </p>
                  )}
                  
                  {item.heading && (
                    <h3 
                      className="font-bold mb-4"
                      style={{ 
                        fontSize: `${headingSize}px`,
                        color: config.overlayStyle === 'no-background' ? colorScheme?.text : 'white',
                        textShadow: config.overlayStyle?.includes('shadow') ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                      }}
                    >
                      {item.heading}
                    </h3>
                  )}
                  
                  {item.button && (
                    <a 
                      href={item.link || '#'}
                      className={cn(
                        "inline-block px-6 py-3 text-sm font-medium transition-colors",
                        getButtonStyles()
                      )}
                    >
                      {item.button}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Mobile Carousel Dots (if enabled) */}
      {isMobile && config.enableMobileCarousel && itemsToRender.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {itemsToRender.map((_, index) => (
            <button
              key={index}
              className="w-2 h-2 rounded-full bg-gray-400 hover:bg-gray-600"
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}