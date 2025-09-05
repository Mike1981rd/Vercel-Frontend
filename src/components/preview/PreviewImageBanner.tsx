/**
 * @file PreviewImageBanner.tsx
 * @max-lines 300
 * @current-lines 295
 * @architecture modular
 * @validates-rules ✅
 */

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ImageBannerConfig } from '@/components/editor/modules/ImageBanner/types';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { useImageBannerTypography } from '@/components/editor/modules/ImageBanner/useImageBannerTypography';

interface PreviewImageBannerProps {
  config: ImageBannerConfig;
  isEditor?: boolean;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  theme?: any; // Theme from PreviewPage for live preview
  pageType?: string; // To check if current page is home
}

export default function PreviewImageBanner({ config, isEditor = false, deviceView, theme, pageType }: PreviewImageBannerProps) {
  // Mobile detection state
  const [isMobile, setIsMobile] = useState(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  // Get color schemes from global theme config or prop
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig; // Use prop theme in live preview, store in editor
  
  // Get typography styles
  const { headingTypographyStyles, bodyTypographyStyles, buttonTypographyStyles } = useImageBannerTypography(themeConfig);

  // Update mobile state based on deviceView or window size
  useEffect(() => {
    if (deviceView !== undefined) {
      setIsMobile(deviceView === 'mobile');
      return;
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [deviceView]);

  // Apply defaults to config BEFORE any hooks
  const configWithDefaults = useMemo(() => {
    if (!config) return null;
    
    return {
      ...config,
      // Add defaults for properties that might be missing in config
      colorScheme: config.colorScheme || '1',
      colorBackground: config.colorBackground ?? false,
      showOnlyOnHomePage: config.showOnlyOnHomePage ?? false,
      width: config.width || 'page' as const,
      desktopRatio: config.desktopRatio || 16/9,
      mobileRatio: config.mobileRatio || 1,
      desktopPosition: config.desktopPosition || 'center',
      desktopAlignment: config.desktopAlignment || 'center' as const,
      desktopWidth: config.desktopWidth || 50,
      desktopSpacing: config.desktopSpacing || 4,
      mobilePosition: config.mobilePosition || 'center' as const,
      mobileAlignment: config.mobileAlignment || 'center' as const,
      desktopBackground: config.desktopBackground || 'none' as const,
      mobileBackground: config.mobileBackground || 'none' as const,
      headingSize: config.headingSize || 2 as const,
      bodySize: config.bodySize || 1 as const,
      firstButtonStyle: config.firstButtonStyle || 'solid' as const,
      secondButtonStyle: config.secondButtonStyle || 'outline' as const,
      desktopOverlayOpacity: config.desktopOverlayOpacity ?? 0,
      mobileOverlayOpacity: config.mobileOverlayOpacity ?? 0,
      topPadding: config.topPadding ?? 0,
      bottomPadding: config.bottomPadding ?? 0,
      addSidePaddings: config.addSidePaddings ?? false
    };
  }, [config]);
  
  // Get the selected color scheme
  const colorScheme = useMemo(() => {
    if (!themeConfig?.colorSchemes?.schemes || !configWithDefaults) {
      // Fallback to default if no theme config
      return {
        text: '#000000',
        background: '#FFFFFF',
        solidButton: '#000000',
        solidButtonText: '#FFFFFF',
        outlineButton: '#000000',
        outlineButtonText: '#000000'
      };
    }
    
    // Find the scheme by ID (configWithDefaults.colorScheme is "1", "2", etc.)
    const schemeIndex = parseInt(configWithDefaults.colorScheme) - 1;
    const selectedScheme = themeConfig.colorSchemes.schemes[schemeIndex];
    
    if (!selectedScheme) {
      // If scheme not found, use the first one
      return themeConfig.colorSchemes.schemes[0];
    }
    
    return selectedScheme;
  }, [themeConfig, configWithDefaults]);

  // Width classes
  const widthClasses = {
    small: 'max-w-4xl mx-auto',
    medium: 'max-w-6xl mx-auto',
    large: 'max-w-7xl mx-auto',
    page: 'w-full',
    screen: 'w-screen relative left-1/2 right-1/2 -mx-[50vw]'
  };

  // Position classes for desktop
  const desktopPositionClasses = {
    'top-left': 'items-start justify-start',
    'top-center': 'items-start justify-center',
    'top-right': 'items-start justify-end',
    'center-left': 'items-center justify-start',
    'center': 'items-center justify-center',
    'center-right': 'items-center justify-end',
    'bottom-left': 'items-end justify-start',
    'bottom-center': 'items-end justify-center',
    'bottom-right': 'items-end justify-end'
  };

  // Mobile position classes
  const mobilePositionClasses = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end'
  };

  // Text alignment classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center'
  };

  // Heading size classes
  const headingSizeClasses = {
    1: 'text-3xl md:text-4xl lg:text-5xl',
    2: 'text-2xl md:text-3xl lg:text-4xl',
    3: 'text-xl md:text-2xl lg:text-3xl'
  };

  // Body size classes
  const bodySizeClasses = {
    1: 'text-sm md:text-base',
    2: 'text-base md:text-lg',
    3: 'text-lg md:text-xl'
  };

  // Background styles for content - using real color values
  const backgroundStyles = {
    solid: `bg-opacity-95`,
    outline: `border-2`,
    blurred: 'backdrop-blur-md bg-white/70 dark:bg-gray-900/70',
    shadow: 'shadow-2xl',
    transparent: 'bg-transparent',
    none: ''
  };

  // Button styles using actual scheme colors
  const getButtonClasses = (style: string) => {
    switch (style) {
      case 'solid':
        return 'transition-colors';
      case 'outline':
        return 'border-2 transition-colors';
      case 'text':
        return 'underline hover:no-underline';
      default:
        return 'transition-colors';
    }
  };

  // Style object for inline styles (since we're using hex colors)
  const getButtonStyles = (style: string) => {
    switch (style) {
      case 'solid':
        return {
          backgroundColor: colorScheme.solidButton,
          color: colorScheme.solidButtonText,
        };
      case 'outline':
        return {
          borderColor: colorScheme.outlineButton,
          color: colorScheme.outlineButtonText,
          backgroundColor: 'transparent'
        };
      case 'text':
        return {
          color: colorScheme.link,
          backgroundColor: 'transparent'
        };
      default:
        return {
          backgroundColor: colorScheme.solidButton,
          color: colorScheme.solidButtonText,
        };
    }
  };

  const getContentBackgroundStyle = (style: string) => {
    if (style === 'solid') {
      return { backgroundColor: colorScheme.background };
    } else if (style === 'outline') {
      return { borderColor: colorScheme.border };
    }
    return {};
  };

  // Check if media is video
  const isVideo = (url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  // NOW we can do conditional returns, after all hooks
  // Check if config is valid
  if (!configWithDefaults) {
    return null;
  }
  
  // Check if should show based on page type
  if (configWithDefaults.showOnlyOnHomePage && pageType && pageType !== 'HOME' && pageType !== 'home') {
    return null;
  }
  
  // Check if there's no content to display
  if (!configWithDefaults.heading && !configWithDefaults.body && !configWithDefaults.subheading && 
      !configWithDefaults.desktopImage && !configWithDefaults.mobileImage) {
    return null;
  }

  return (
    <section 
      className={`relative overflow-hidden`}
      style={{
        paddingTop: `${configWithDefaults.topPadding}px`,
        paddingBottom: `${configWithDefaults.bottomPadding}px`,
        ...(configWithDefaults.colorBackground ? { backgroundColor: colorScheme.background } : {})
      }}
    >
      {/* Desktop View */}
      {!isMobile && (
        <div 
          className={`relative ${widthClasses[configWithDefaults.width]} ${configWithDefaults.addSidePaddings ? 'px-4 lg:px-8' : ''}`}
          style={{ 
            aspectRatio: configWithDefaults.desktopRatio,
            ...(configWithDefaults.width === 'screen' ? {
              // Compensate container padding to avoid horizontal scroll
              marginLeft: 'calc(-50vw + var(--content-padding, 0px))',
              marginRight: 'calc(-50vw + var(--content-padding, 0px))'
            } : {})
          }}
        >
          {/* Background Media */}
          {configWithDefaults.desktopImage && (
            <>
              {isVideo(configWithDefaults.desktopImage) ? (
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src={configWithDefaults.desktopImage}
                  autoPlay
                  loop
                  muted={!configWithDefaults.videoSound}
                  playsInline
                />
              ) : (
                <img
                  src={configWithDefaults.desktopImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {/* Overlay */}
              <div 
                className="absolute inset-0 bg-black"
                style={{ opacity: configWithDefaults.desktopOverlayOpacity !== undefined ? configWithDefaults.desktopOverlayOpacity / 100 : 0 }}
              />
            </>
          )}

          {/* Content Container */}
          <div className={`relative h-full flex ${desktopPositionClasses[configWithDefaults.desktopPosition]} p-8`}>
            <div 
              className={`${backgroundStyles[configWithDefaults.desktopBackground]} ${configWithDefaults.desktopBackground !== 'none' ? 'p-8 rounded-lg' : ''}`}
              style={{ 
                width: `${configWithDefaults.desktopWidth}%`,
                maxWidth: '800px',
                ...getContentBackgroundStyle(configWithDefaults.desktopBackground)
              }}
            >
              <div className={`${alignmentClasses[configWithDefaults.desktopAlignment]} space-y-${Math.ceil(configWithDefaults.desktopSpacing / 20) || 4}`}>
                {/* Subheading */}
                {configWithDefaults.subheading && (
                  <p 
                    className={`text-sm opacity-80`}
                    style={{ 
                      color: colorScheme.text,
                      ...bodyTypographyStyles
                    } as React.CSSProperties}
                  >
                    {configWithDefaults.subheading}
                  </p>
                )}

                {/* Heading */}
                {configWithDefaults.heading && (
                  <h2 
                    className={`${(headingSizeClasses as any)[configWithDefaults.headingSize] || ''}`}
                    style={{ 
                      color: colorScheme.text,
                      ...headingTypographyStyles,
                      fontWeight: configWithDefaults.headingFontWeight || (headingTypographyStyles as any)?.fontWeight || '700'
                    } as React.CSSProperties}
                  >
                    {configWithDefaults.heading}
                  </h2>
                )}

                {/* Body */}
                {configWithDefaults.body && (
                  <p 
                    className={`${(bodySizeClasses as any)[configWithDefaults.bodySize] || ''} opacity-90`}
                    style={{ 
                      color: colorScheme.text,
                      ...bodyTypographyStyles,
                      fontWeight: configWithDefaults.bodyFontWeight || (bodyTypographyStyles as any)?.fontWeight || '400'
                    } as React.CSSProperties}
                  >
                    {configWithDefaults.body}
                  </p>
                )}

                {/* Buttons */}
                {(configWithDefaults.firstButtonLabel || configWithDefaults.secondButtonLabel) && (
                  <div className={`flex gap-4 mt-6 ${configWithDefaults.desktopAlignment === 'center' ? 'justify-center' : ''}`}>
                    {configWithDefaults.firstButtonLabel && (
                      <a
                        href={configWithDefaults.firstButtonLink || '#'}
                        className={`px-6 py-3 rounded-md ${getButtonClasses(configWithDefaults.firstButtonStyle || 'solid')}`}
                        style={{
                          ...getButtonStyles(configWithDefaults.firstButtonStyle || 'solid'),
                          ...buttonTypographyStyles
                        } as React.CSSProperties}
                      >
                        {configWithDefaults.firstButtonLabel}
                      </a>
                    )}
                    {configWithDefaults.secondButtonLabel && (
                      <a
                        href={configWithDefaults.secondButtonLink || '#'}
                        className={`px-6 py-3 rounded-md ${getButtonClasses(configWithDefaults.secondButtonStyle || 'outline')}`}
                        style={{
                          ...getButtonStyles(configWithDefaults.secondButtonStyle || 'outline'),
                          ...buttonTypographyStyles
                        } as React.CSSProperties}
                      >
                        {configWithDefaults.secondButtonLabel}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile View */}
      {isMobile && (
        <div 
          className={`relative ${configWithDefaults.addSidePaddings ? 'mx-4' : ''}`}
          style={{ 
            aspectRatio: configWithDefaults.mobileRatio,
            ...(configWithDefaults.width === 'screen' ? {
              marginLeft: 'calc(-50vw + var(--content-padding, 0px))',
              marginRight: 'calc(-50vw + var(--content-padding, 0px))'
            } : {})
          }}
        >
          {/* Background Media - Use mobile image if available, otherwise desktop */}
          {(configWithDefaults.mobileImage || configWithDefaults.desktopImage) && (
            <>
              {(() => {
                const mediaUrl = configWithDefaults.mobileImage || configWithDefaults.desktopImage;
                if (isVideo(mediaUrl)) {
                  return (
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      src={mediaUrl}
                      autoPlay
                      loop
                      muted={!configWithDefaults.videoSound}
                      playsInline
                    />
                  );
                } else {
                  return (
                    <img
                      src={mediaUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  );
                }
              })()}
              {/* Overlay */}
              <div 
                className="absolute inset-0 bg-black"
                style={{ opacity: configWithDefaults.mobileOverlayOpacity !== undefined ? configWithDefaults.mobileOverlayOpacity / 100 : 0 }}
              />
            </>
          )}

          {/* Content Container */}
          <div className={`relative h-full flex ${mobilePositionClasses[configWithDefaults.mobilePosition]} ${configWithDefaults.mobileAlignment === 'center' ? 'justify-center' : 'justify-start'} p-6`}>
            <div 
              className={`${backgroundStyles[configWithDefaults.mobileBackground]} ${configWithDefaults.mobileBackground !== 'none' ? 'p-6 rounded-lg' : ''} w-full max-w-md`}
              style={getContentBackgroundStyle(configWithDefaults.mobileBackground)}
            >
              <div className={`${alignmentClasses[configWithDefaults.mobileAlignment]} space-y-3`}>
                {/* Subheading */}
                {configWithDefaults.subheading && (
                  <p 
                    className={`text-xs opacity-80`}
                    style={{ 
                      color: colorScheme.text,
                      ...bodyTypographyStyles
                    } as React.CSSProperties}
                  >
                    {configWithDefaults.subheading}
                  </p>
                )}

                {/* Heading */}
                {configWithDefaults.heading && (
                  <h2 
                    className={`${(headingSizeClasses as any)[configWithDefaults.headingSize] || ''}`}
                    style={{ 
                      color: colorScheme.text,
                      ...headingTypographyStyles,
                      fontWeight: configWithDefaults.headingFontWeight || (headingTypographyStyles as any)?.fontWeight || '700'
                    } as React.CSSProperties}
                  >
                    {configWithDefaults.heading}
                  </h2>
                )}

                {/* Body */}
                {configWithDefaults.body && (
                  <p 
                    className={`${(bodySizeClasses as any)[configWithDefaults.bodySize] || ''} opacity-90`}
                    style={{ 
                      color: colorScheme.text,
                      ...bodyTypographyStyles,
                      fontWeight: configWithDefaults.bodyFontWeight || (bodyTypographyStyles as any)?.fontWeight || '400'
                    } as React.CSSProperties}
                  >
                    {configWithDefaults.body}
                  </p>
                )}

                {/* Buttons */}
                {(configWithDefaults.firstButtonLabel || configWithDefaults.secondButtonLabel) && (
                  <div className={`flex flex-col sm:flex-row gap-3 mt-4 ${configWithDefaults.mobileAlignment === 'center' ? 'items-center justify-center' : 'items-start'}`}>
                    {configWithDefaults.firstButtonLabel && (
                      <a
                        href={configWithDefaults.firstButtonLink || '#'}
                        className={`px-5 py-2.5 rounded-md text-sm ${getButtonClasses(configWithDefaults.firstButtonStyle)}`}
                        style={{
                          ...getButtonStyles(configWithDefaults.firstButtonStyle || 'solid'),
                          ...buttonTypographyStyles
                        } as React.CSSProperties}
                      >
                        {configWithDefaults.firstButtonLabel}
                      </a>
                    )}
                    {configWithDefaults.secondButtonLabel && (
                      <a
                        href={configWithDefaults.secondButtonLink || '#'}
                        className={`px-5 py-2.5 rounded-md text-sm ${getButtonClasses(configWithDefaults.secondButtonStyle || 'outline')}`}
                        style={{
                          ...getButtonStyles(configWithDefaults.secondButtonStyle || 'outline'),
                          ...buttonTypographyStyles
                        } as React.CSSProperties}
                      >
                        {configWithDefaults.secondButtonLabel}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Overlay */}
      {isEditor && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500 opacity-0 hover:opacity-100 transition-opacity">
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Image Banner
          </div>
        </div>
      )}
    </section>
  );
}
