/**
 * @file PreviewSlideshow.tsx
 * @description Preview component for Slideshow in the editor
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SlideshowConfig, SlideConfig } from '../editor/modules/Slideshow/types';

interface PreviewSlideshowProps {
  settings: SlideshowConfig;
  isEditor?: boolean;
  theme?: any;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
}

// Videos are now uploaded files, not URLs

export default function PreviewSlideshow({ 
  settings, 
  isEditor = false,
  theme,
  deviceView 
}: PreviewSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isHovered, setIsHovered] = useState(false);
  const visibleSlides = settings.slides?.filter(s => s.visible) || [];
  
  // Get the color scheme
  const selectedSchemeIndex = parseInt(settings.colorScheme || '1') - 1;
  const colorScheme = theme?.colorSchemes?.schemes?.[selectedSchemeIndex] || 
                      theme?.colorSchemes?.schemes?.[0];
  
  // Get typography styles for headings (WITHOUT fontSize - Slideshow handles that)
  const headingStyles = theme?.typography?.headings ? {
    fontFamily: `'${theme.typography.headings.fontFamily}', sans-serif`,
    fontWeight: theme.typography.headings.fontWeight || '700',
    textTransform: theme.typography.headings.useUppercase ? 'uppercase' as const : 'none' as const,
    letterSpacing: `${theme.typography.headings.letterSpacing || 0}px`
    // Note: fontSize is handled by Slideshow's headingSize config
  } : {};
  
  // Get typography styles for body text (WITHOUT fontSize - Slideshow handles that)
  const bodyStyles = theme?.typography?.body ? {
    fontFamily: `'${theme.typography.body.fontFamily}', sans-serif`,
    fontWeight: theme.typography.body.fontWeight || '400',
    textTransform: theme.typography.body.useUppercase ? 'uppercase' as const : 'none' as const,
    letterSpacing: `${theme.typography.body.letterSpacing || 0}px`
    // Note: fontSize is handled by Slideshow's bodySize config
  } : {};
  
  // Get typography styles for buttons (keeping fontSize for buttons)
  const buttonStyles = theme?.typography?.buttons ? {
    fontFamily: `'${theme.typography.buttons.fontFamily}', sans-serif`,
    fontWeight: theme.typography.buttons.fontWeight || '500',
    textTransform: theme.typography.buttons.useUppercase ? 'uppercase' as const : 'none' as const,
    fontSize: theme.typography.buttons.fontSize ? 
      (theme.typography.buttons.fontSize <= 100 ? 
        `${theme.typography.buttons.fontSize}%` : 
        `${theme.typography.buttons.fontSize}px`) : '100%',
    letterSpacing: `${theme.typography.buttons.letterSpacing || 0}px`
  } : {};
  
  // Auto-play functionality
  useEffect(() => {
    if (settings.autoplayMode === 'one-at-a-time' && visibleSlides.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        handleNext();
      }, (settings.autoplaySpeed || 5) * 1000);
      
      return () => clearInterval(interval);
    }
  }, [settings.autoplayMode, settings.autoplaySpeed, visibleSlides.length, isPaused, currentSlide]);

  // Get current slide or use defaults
  const slide = visibleSlides[currentSlide] || {};
  // Unified mobile detection (match PreviewImageBanner)
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
  
  // Debug font sizes
  if (slide.heading || slide.body) {
    console.log('[DEBUG PreviewSlideshow] Slide font sizes:', {
      slideId: slide.id,
      headingSize: slide.headingSize,
      bodySize: slide.bodySize,
      heading: slide.heading?.substring(0, 20),
      body: slide.body?.substring(0, 20)
    });
  }
  
  // Get position classes for desktop content
  const getDesktopPositionClasses = (position: string) => {
    const posMap: Record<string, string> = {
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
    return posMap[position] || 'items-center justify-center';
  };
  
  // Get mobile position classes
  const getMobilePositionClasses = (position: string) => {
    const posMap: Record<string, string> = {
      'top': 'items-start',
      'center': 'items-center',
      'bottom': 'items-end'
    };
    return posMap[position] || 'items-center';
  };
  
  // Get content background styles
  const getContentBackgroundStyles = (bgType: string, isMobile: boolean) => {
    const colorSchemeToUse = colorScheme || {};
    switch(bgType) {
      case 'solid':
        return {
          backgroundColor: colorSchemeToUse.background || 'rgba(255,255,255,0.95)',
          padding: '24px',
          borderRadius: '4px'
        };
      case 'outline':
        return {
          border: `2px solid ${colorSchemeToUse.text || '#ffffff'}`,
          padding: '24px',
          borderRadius: '4px',
          backgroundColor: 'transparent'
        };
      case 'shadow':
        return {
          backgroundColor: colorSchemeToUse.background || 'rgba(255,255,255,0.95)',
          padding: '24px',
          borderRadius: '4px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        };
      case 'blurred':
        return {
          backgroundColor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          padding: '24px',
          borderRadius: '4px'
        };
      case 'transparent':
        return {
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '24px',
          borderRadius: '4px'
        };
      case 'none':
      default:
        return {};
    }
  };
  
  // Determine width class based on settings
  const widthClass = settings.width === 'screen' ? 'w-full' : 
                     settings.width === 'page' ? 'max-w-7xl mx-auto' : 
                     'max-w-5xl mx-auto';

  const handleSlideChange = (newSlide: number, direction: 'left' | 'right' = 'right') => {
    if (settings.transitionStyle === 'fade') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(newSlide);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 300);
    } else if (settings.transitionStyle === 'swipe') {
      setSlideDirection(direction);
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(newSlide);
        setIsTransitioning(false);
      }, 500);
    } else {
      // Seamless transition
      setCurrentSlide(newSlide);
    }
  };
  
  const handlePrevious = () => {
    const newSlide = (currentSlide - 1 + visibleSlides.length) % visibleSlides.length;
    handleSlideChange(newSlide, 'left');
  };
  
  const handleNext = () => {
    const newSlide = (currentSlide + 1) % visibleSlides.length;
    handleSlideChange(newSlide, 'right');
  };

  const showArrows = settings.showNavigationArrows === 'always' || 
                     (settings.showNavigationArrows === 'hover' && (isHovered || isEditor));

  // Pattern background SVG
  const patternSvg = `data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' stroke-width='0.5' opacity='0.08'%3E%3C!-- Camera --%3E%3Crect x='340' y='40' width='40' height='30' rx='4'/%3E%3Ccircle cx='360' cy='55' r='8'/%3E%3C!-- Watch --%3E%3Ccircle cx='50' cy='50' r='20'/%3E%3Crect x='45' y='30' width='10' height='40' rx='2'/%3E%3C!-- Bow tie --%3E%3Cpath d='M120 50 L140 40 L140 60 Z M160 50 L140 40 L140 60 Z'/%3E%3C!-- Diamond --%3E%3Cpath d='M250 30 L270 50 L250 70 L230 50 Z'/%3E%3C!-- Sunglasses --%3E%3Cellipse cx='50' cy='150' rx='20' ry='15'/%3E%3Cellipse cx='90' cy='150' rx='20' ry='15'/%3E%3Cpath d='M70 150 L70 150'/%3E%3C!-- Shopping bag --%3E%3Crect x='330' y='140' width='40' height='50' rx='2'/%3E%3Cpath d='M340 140 Q350 130 360 140'/%3E%3C!-- Perfume bottle --%3E%3Crect x='140' y='130' width='30' height='40' rx='4'/%3E%3Crect x='150' y='120' width='10' height='10'/%3E%3C!-- Shoe --%3E%3Cellipse cx='250' cy='160' rx='35' ry='12'/%3E%3Cpath d='M280 160 Q280 140 270 140'/%3E%3C!-- Handbag --%3E%3Cellipse cx='50' cy='250' rx='30' ry='20'/%3E%3Cpath d='M30 240 Q50 230 70 240'/%3E%3C!-- Necklace --%3E%3Ccircle cx='150' cy='250' r='25'/%3E%3Ccircle cx='150' cy='270' r='5'/%3E%3C!-- Ring --%3E%3Ccircle cx='250' cy='250' r='15'/%3E%3Ccircle cx='250' cy='250' r='8'/%3E%3C!-- Lipstick --%3E%3Crect x='340' y='240' width='10' height='30' rx='2'/%3E%3Crect x='338' y='235' width='14' height='8' rx='2'/%3E%3C!-- Earrings --%3E%3Ccircle cx='50' cy='350' r='8'/%3E%3Ccircle cx='50' cy='365' r='12'/%3E%3C!-- Wallet --%3E%3Crect x='130' y='340' width='50' height='35' rx='3'/%3E%3C!-- Belt --%3E%3Crect x='230' y='350' width='60' height='15' rx='2'/%3E%3Crect x='250' y='352' width='12' height='11' rx='1'/%3E%3C!-- Hat --%3E%3Cellipse cx='350' cy='360' rx='30' ry='10'/%3E%3Crect x='335' y='340' width='30' height='20' rx='10'/%3E%3C/g%3E%3C/svg%3E`;

  return (
    <div 
      className={`slideshow-container ${widthClass}`}
      style={{
        paddingTop: `${settings.topPadding || 0}px`,
        paddingBottom: `${settings.bottomPadding || 0}px`,
        paddingLeft: settings.addSidePaddings ? '20px' : '0',
        paddingRight: settings.addSidePaddings ? '20px' : '0',
      }}
    >
      <div 
        className="relative overflow-hidden group"
        style={{ 
          aspectRatio: (isMobile ? settings.mobileRatio : settings.desktopRatio) || '16/9',
          minHeight: isMobile ? '300px' : '400px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background container for seamless transitions */}
        <div 
          className="absolute inset-0"
          style={settings.colorBackground && colorScheme ? {
            backgroundColor: colorScheme.background
          } : {
            backgroundImage: `linear-gradient(135deg, #C4A962 0%, #B8995A 100%), url("${patternSvg}")`,
            backgroundSize: 'cover, 400px 400px',
            backgroundPosition: 'center, center'
          }}
        />
        
        {/* Slide container with transitions */}
        <div
          className="absolute inset-0"
          style={{
            opacity: isTransitioning && settings.transitionStyle === 'fade' ? 0 : 1,
            transform: settings.transitionStyle === 'swipe' && isTransitioning ? 
              (slideDirection === 'right' ? 'translateX(-100%)' : 'translateX(100%)') : 
              'translateX(0)',
            transition: settings.transitionStyle === 'fade' ? 'opacity 0.3s ease-in-out' : 
                        settings.transitionStyle === 'swipe' ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' :
                        settings.transitionStyle === 'seamless' ? 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' :
                        'none'
          }}
        >
        {/* Check if slide has an actual image or video */}
        {(slide.mobileImage || slide.desktopImage || slide.mobileVideo || slide.desktopVideo) ? (
          <>
            {/* Video or Image Background */}
            {(isMobile ? slide.mobileVideo : slide.desktopVideo) ? (
              <video
                src={isMobile ? slide.mobileVideo : slide.desktopVideo}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (isMobile ? slide.mobileImage : slide.desktopImage) ? (
              <img 
                src={isMobile ? slide.mobileImage : slide.desktopImage}
                alt={settings.slideshowAltText || slide.heading || 'Slideshow image'}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null}
            
            {/* Overlay with opacity */}
            {((isMobile && slide.mobileOverlayOpacity > 0) || (!isMobile && slide.desktopOverlayOpacity > 0)) && (
              <div 
                className="absolute inset-0"
                style={{
                  backgroundColor: 'black',
                  opacity: (isMobile ? slide.mobileOverlayOpacity : slide.desktopOverlayOpacity) / 100
                }}
              />
            )}
            
            {/* Content overlay on image */}
            <div className={`absolute inset-0 flex ${isMobile ? 'p-4' : 'p-8'} ${
              isMobile ? 
                getMobilePositionClasses(slide.mobilePosition || 'center') + ' justify-center'  // Always center on mobile
              : 
                getDesktopPositionClasses(slide.desktopPosition || 'center')
            }`}
            style={{
              // Add padding bottom on mobile when content is at bottom to avoid dots collision
              paddingBottom: isMobile && slide.mobilePosition === 'bottom' ? 
                (slide.firstButtonLabel || slide.secondButtonLabel ? '40px' : '60px') : 
                undefined
            }}>
              <div 
                className={`${
                  isMobile ? 'w-full text-center' : ''  // Always center text on mobile
                } ${
                  !isMobile ? 
                    (slide.desktopAlignment === 'center' ? 'text-center' : 
                     slide.desktopAlignment === 'right' ? 'text-right' : 
                     'text-left') : ''
                }`}
                style={{
                  ...(isMobile ? 
                    getContentBackgroundStyles(slide.mobileBackground || 'none', true) :
                    getContentBackgroundStyles(slide.desktopBackground || 'none', false)
                  ),
                  maxWidth: !isMobile ? `${slide.desktopWidth || 560}px` : 'auto',
                  margin: !isMobile && slide.desktopSpacing ? `${slide.desktopSpacing}px` : undefined
                }}>
                {slide.subheading && (
                  <p 
                    className="text-xs font-medium tracking-wider uppercase mb-2 text-white/80 drop-shadow"
                    style={{
                      ...bodyStyles
                    }}
                  >
                    {slide.subheading}
                  </p>
                )}
                {slide.heading && (
                  <h2 
                    className="font-bold mb-4 text-white drop-shadow-lg"
                    style={{
                      fontSize: isMobile ? 
                        `${(slide.headingSize || 48) * 0.7}px` : 
                        `${slide.headingSize || 48}px`,
                      ...headingStyles
                    }}
                  >
                    {slide.heading}
                  </h2>
                )}
                {slide.body && (
                  <p 
                    className="mb-6 text-white/90 drop-shadow leading-relaxed"
                    style={{
                      fontSize: isMobile ? 
                        `${(slide.bodySize || 16) * 0.9}px` : 
                        `${slide.bodySize || 16}px`,
                      ...bodyStyles
                    }}
                  >
                    {slide.body}
                  </p>
                )}
                {(slide.firstButtonLabel || slide.secondButtonLabel) && (
                  <div className={`flex gap-3 ${isMobile ? 'flex-col sm:flex-row' : ''} ${
                    isMobile ?
                      'items-center justify-center' :  // Always center buttons on mobile
                      (slide.desktopAlignment === 'center' ? 'justify-center' : 
                       slide.desktopAlignment === 'right' ? 'justify-end' : 
                       'justify-start')
                  }`}>
                    {slide.firstButtonLabel && (
                      <a 
                        href={slide.firstButtonLink || '#'}
                        className={`inline-block ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} font-medium transition-colors cursor-pointer`}
                        style={{
                          backgroundColor: slide.firstButtonStyle === 'solid' ? 'white' : 'transparent',
                          color: slide.firstButtonStyle === 'solid' ? 'black' : 'white',
                          border: slide.firstButtonStyle === 'outline' ? '2px solid white' : 'none',
                          textDecoration: slide.firstButtonStyle === 'text' ? 'underline' : 'none',
                          ...buttonStyles
                        }}
                        onClick={(e) => {
                          if (!slide.firstButtonLink || isEditor) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {slide.firstButtonLabel}
                      </a>
                    )}
                    {slide.secondButtonLabel && (
                      <a 
                        href={slide.secondButtonLink || '#'}
                        className={`inline-block ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} font-medium transition-colors cursor-pointer`}
                        style={{
                          backgroundColor: slide.secondButtonStyle === 'solid' ? 'white' : 'transparent',
                          color: slide.secondButtonStyle === 'solid' ? 'black' : 'white',
                          border: slide.secondButtonStyle === 'outline' ? '2px solid white' : 'none',
                          textDecoration: slide.secondButtonStyle === 'text' ? 'underline' : 'none',
                          ...buttonStyles
                        }}
                        onClick={(e) => {
                          if (!slide.secondButtonLink || isEditor) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {slide.secondButtonLabel}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Default template structure when no image */
          <div className="absolute inset-0 flex items-center justify-center"
            style={{
              // Add padding bottom on mobile to avoid dots collision
              paddingBottom: isMobile ? '60px' : '0'
            }}>
            <div className={`text-center ${isMobile ? 'max-w-sm px-4' : 'max-w-2xl px-8'}`}>
              {/* Subheading - Small Label */}
              {(slide.subheading || !slide.heading) && (
                <div 
                  className="text-xs font-medium tracking-[0.2em] uppercase mb-6"
                  style={{ 
                    color: settings.colorBackground && colorScheme ? 
                      `${colorScheme.text}99` : 'rgba(0,0,0,0.6)',
                    ...bodyStyles
                  }}
                >
                  {slide.subheading || 'IMAGE SLIDE'}
                </div>
              )}
              
              {/* Main Heading */}
              <h2 
                className="font-serif mb-4"
                style={{ 
                  color: settings.colorBackground && colorScheme ? 
                    colorScheme.text : '#000000',
                  fontSize: isMobile ? 
                    `${(slide.headingSize || 48) * 0.7}px` : 
                    `${slide.headingSize || 48}px`,
                  ...headingStyles
                }}
              >
                {slide.heading || 'Image with text'}
              </h2>
              
              {/* Body Text */}
              <p 
                className="mb-8 max-w-xl mx-auto leading-relaxed"
                style={{ 
                  color: settings.colorBackground && colorScheme ? 
                    `${colorScheme.text}CC` : 'rgba(0,0,0,0.8)',
                  fontSize: isMobile ? 
                    `${(slide.bodySize || 16) * 0.9}px` : 
                    `${slide.bodySize || 16}px`,
                  ...bodyStyles
                }}
              >
                {slide.body || 'Fill in the text to tell customers by what your products are inspired.'}
              </p>
              
              {/* Buttons */}
              {(slide.firstButtonLabel || slide.secondButtonLabel) && (
                <div className={`flex gap-4 justify-center ${isMobile ? 'flex-col items-center mb-4' : ''}`}>
                  {slide.firstButtonLabel && (
                    <a 
                      href={slide.firstButtonLink || '#'}
                      className="inline-block px-8 py-3 font-medium transition-colors cursor-pointer"
                      style={{ 
                        minWidth: '150px',
                        textAlign: 'center',
                        backgroundColor: slide.firstButtonStyle === 'solid' ? 
                          (settings.colorBackground && colorScheme ? colorScheme.button : '#000000') :
                          'transparent',
                        color: slide.firstButtonStyle === 'solid' ?
                          (settings.colorBackground && colorScheme ? colorScheme.buttonText : '#ffffff') :
                          (settings.colorBackground && colorScheme ? colorScheme.text : '#000000'),
                        border: slide.firstButtonStyle === 'outline' ? 
                          `1px solid ${settings.colorBackground && colorScheme ? colorScheme.text : '#000000'}` :
                          'none',
                        textDecoration: slide.firstButtonStyle === 'text' ? 'underline' : 'none',
                        ...buttonStyles
                      }}
                      onClick={(e) => {
                        if (!slide.firstButtonLink || isEditor) {
                          e.preventDefault();
                        }
                      }}
                    >
                      {slide.firstButtonLabel}
                    </a>
                  )}
                  
                  {slide.secondButtonLabel && (
                    <a 
                      href={slide.secondButtonLink || '#'}
                      className="inline-block px-8 py-3 font-medium transition-colors cursor-pointer"
                      style={{ 
                        minWidth: '150px',
                        textAlign: 'center',
                        backgroundColor: slide.secondButtonStyle === 'solid' ? 
                          (settings.colorBackground && colorScheme ? colorScheme.button : '#000000') :
                          'transparent',
                        color: slide.secondButtonStyle === 'solid' ?
                          (settings.colorBackground && colorScheme ? colorScheme.buttonText : '#ffffff') :
                          (settings.colorBackground && colorScheme ? colorScheme.text : '#000000'),
                        border: slide.secondButtonStyle === 'outline' ? 
                          `1px solid ${settings.colorBackground && colorScheme ? colorScheme.text : '#000000'}` :
                          'none',
                        textDecoration: slide.secondButtonStyle === 'text' ? 'underline' : 'none',
                        ...buttonStyles
                      }}
                      onClick={(e) => {
                        if (!slide.secondButtonLink || isEditor) {
                          e.preventDefault();
                        }
                      }}
                    >
                      {slide.secondButtonLabel}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Navigation Arrows */}
        {showArrows && visibleSlides.length > 1 && !isMobile && (
          settings.desktopArrowsPosition === 'corner' ? (
            // Corner layout - both arrows together in bottom right
            <div className={`absolute bottom-4 right-4 flex gap-2 transition-all duration-300 ${
              settings.showNavigationArrows === 'hover' ? 
                (isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4') : 
                'opacity-100'
            }`}>
              <button
                onClick={handlePrevious}
                className="w-10 h-10 rounded-full transition-all hover:scale-110 flex items-center justify-center backdrop-blur-sm"
                style={{
                  backgroundColor: settings.colorBackground && colorScheme ? 
                    `${colorScheme.text}15` : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${settings.colorBackground && colorScheme ? 
                    `${colorScheme.text}30` : 'rgba(0,0,0,0.2)'}`,
                  color: settings.colorBackground && colorScheme ? 
                    colorScheme.text : '#000000'
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full transition-all hover:scale-110 flex items-center justify-center backdrop-blur-sm"
                style={{
                  backgroundColor: settings.colorBackground && colorScheme ? 
                    `${colorScheme.text}15` : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${settings.colorBackground && colorScheme ? 
                    `${colorScheme.text}30` : 'rgba(0,0,0,0.2)'}`,
                  color: settings.colorBackground && colorScheme ? 
                    colorScheme.text : '#000000'
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            // Side layout - arrows on left and right
            <>
              <button
                onClick={handlePrevious}
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full transition-all hover:scale-110 flex items-center justify-center backdrop-blur-sm duration-300 ${
                  settings.showNavigationArrows === 'hover' ? 
                    (isHovered ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-4') : 
                    'opacity-100'
                }`}
                style={{
                  backgroundColor: settings.colorBackground && colorScheme ? 
                    `${colorScheme.text}15` : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${settings.colorBackground && colorScheme ? 
                    `${colorScheme.text}30` : 'rgba(0,0,0,0.2)'}`,
                  color: settings.colorBackground && colorScheme ? 
                    colorScheme.text : '#000000'
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full transition-all hover:scale-110 flex items-center justify-center backdrop-blur-sm duration-300 ${
                  settings.showNavigationArrows === 'hover' ? 
                    (isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4') : 
                    'opacity-100'
                }`}
                style={{
                  backgroundColor: settings.colorBackground && colorScheme ? 
                    `${colorScheme.text}15` : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${settings.colorBackground && colorScheme ? 
                    `${colorScheme.text}30` : 'rgba(0,0,0,0.2)'}`,
                  color: settings.colorBackground && colorScheme ? 
                    colorScheme.text : '#000000'
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )
        )}

        {/* Navigation Dots */}
        {(settings.showNavigationCircles || isMobile) && visibleSlides.length > 1 && (
          <div className={`absolute left-1/2 -translate-x-1/2 flex z-20 ${
            isMobile ? 'gap-3' : 'gap-2'
          } ${
            // Position dots lower on mobile when content with buttons is at bottom
            isMobile && slide.mobilePosition === 'bottom' && (slide.firstButtonLabel || slide.secondButtonLabel) ? 
              'bottom-2' : 
              (isMobile ? 'bottom-6' : 'bottom-4')
          }`}>
            {visibleSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSlideChange(index, index > currentSlide ? 'right' : 'left')}
                className={`rounded-full transition-all duration-300 hover:scale-110 ${
                  isMobile ? 
                    (index === currentSlide ? 'w-8 h-3' : 'w-3 h-3') : 
                    (index === currentSlide ? 'w-6 h-2' : 'w-2 h-2')
                }`}
                style={{
                  backgroundColor: index === currentSlide ? 
                    (settings.colorBackground && colorScheme ? colorScheme.text : '#ffffff') :
                    (settings.colorBackground && colorScheme ? `${colorScheme.text}40` : 'rgba(255,255,255,0.3)'),
                  backdropFilter: 'blur(4px)',
                  border: isMobile ? `1px solid ${settings.colorBackground && colorScheme ? 
                    `${colorScheme.text}30` : 'rgba(255,255,255,0.2)'}` : 'none'
                }}
              />
            ))}
          </div>
        )}

        {/* Play/Pause Button */}
        {settings.showPlayPauseButton && settings.autoplayMode === 'one-at-a-time' && visibleSlides.length > 1 && (
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="absolute bottom-4 left-4 w-12 h-12 rounded-full transition-all hover:scale-110 flex items-center justify-center backdrop-blur-md shadow-lg"
            style={{
              backgroundColor: settings.colorBackground && colorScheme ? 
                `${colorScheme.background}E6` : 'rgba(255,255,255,0.9)',
              border: `2px solid ${settings.colorBackground && colorScheme ? 
                `${colorScheme.text}20` : 'rgba(0,0,0,0.1)'}`,
              color: settings.colorBackground && colorScheme ? 
                colorScheme.text : '#000000'
            }}
          >
            {isPaused ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}