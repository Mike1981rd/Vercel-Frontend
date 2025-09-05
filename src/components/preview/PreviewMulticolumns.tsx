/**
 * @file PreviewMulticolumns.tsx
 * @max-lines 300
 * @module Multicolumns
 * @description Preview unificado para Multicolumns - sirve tanto para editor como para preview final
 * @template-section true
 * @unified-preview true
 */

'use client';

import React from 'react';
import { 
  Star, Heart, Check, Zap, Award, Flag, ThumbsUp, ShoppingCart, Truck, Gift, Percent, Tag, Lock, CreditCard, Phone, Mail, HelpCircle, ScanLine, ChevronLeft, ChevronRight,
  Settings, Search, Eye, EyeOff, User, ThumbsDown, Lightbulb, Trash2, FileText, Copy, Share2, Plus, Minus, X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ChevronUp, ChevronDown
} from 'lucide-react';
import { MulticolumnsConfig } from '@/components/editor/modules/Multicolumns/types';
import useThemeConfigStore from '@/stores/useThemeConfigStore';

interface PreviewMulticolumnsProps {
  config: MulticolumnsConfig;
  theme?: any;
  deviceView: 'mobile' | 'tablet' | 'desktop';
  isEditor?: boolean;
}

// Map icon names to components (matching AnnouncementBar icons)
const iconMap: Record<string, any> = {
  // General icons
  'Settings': Settings,
  'Search': Search,
  'Eye': Eye,
  'EyeOff': EyeOff,
  'User': User,
  'HeartOutline': Heart,
  'HeartSolid': Heart,
  'ThumbsUp': ThumbsUp,
  'ThumbsDown': ThumbsDown,
  'Lightbulb': Lightbulb,
  'StarOutline': Star,
  'StarSolid': Star,
  'Trash2': Trash2,
  'FileText': FileText,
  'Copy': Copy,
  'Share2': Share2,
  'Plus': Plus,
  'Minus': Minus,
  'X': X,
  'Check': Check,
  'ArrowUp': ArrowUp,
  'ArrowDown': ArrowDown,
  'ArrowLeft': ArrowLeft,
  'ArrowRight': ArrowRight,
  'ChevronUp': ChevronUp,
  'ChevronDown': ChevronDown,
  'ChevronLeft': ChevronLeft,
  'ChevronRight': ChevronRight,
  // Commerce icons (backwards compatibility)
  'star': Star,
  'heart': Heart,
  'check': Check,
  'zap': Zap,
  'award': Award,
  'flag': Flag,
  'thumbs-up': ThumbsUp,
  'barcode': ScanLine,
  'shopping-cart': ShoppingCart,
  'truck': Truck,
  'gift': Gift,
  'percent': Percent,
  'tag': Tag,
  'lock': Lock,
  'credit-card': CreditCard,
  'phone': Phone,
  'mail': Mail,
  'help-circle': HelpCircle,
};

export default function PreviewMulticolumns({ 
  config, 
  theme, 
  deviceView, 
  isEditor = false 
}: PreviewMulticolumnsProps) {
  // Use theme from props or from store (unified architecture pattern)
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;
  
  // Solo ocultar en preview real si está explícitamente deshabilitado (false)
  // En editor siempre mostrar (con opacidad si está deshabilitado)
  // Si enabled es undefined, asumimos true para mantener compatibilidad
  if (config.enabled === false && !isEditor) {
    return null;
  }

  // Get color scheme (with fallback) - matching other components structure
  const colorSchemeIndex = config.colorScheme ? parseInt(config.colorScheme) - 1 : 0;
  const colorScheme = themeConfig?.colorSchemes?.schemes?.[colorSchemeIndex] || 
    themeConfig?.colorSchemes?.schemes?.[0] || 
    { background: '#ffffff', backgroundSecondary: '#f9fafb', text: '#111827', textSecondary: '#6b7280', link: '#3b82f6', buttonBackground: '#3b82f6', buttonText: '#ffffff' };

  // Get typography with proper structure (following typography-header.md pattern)
  const headingTypography = themeConfig?.typography?.headings;
  const headingStyle = headingTypography ? {
    fontFamily: headingTypography.fontFamily ? `'${headingTypography.fontFamily}', sans-serif` : 'inherit',
    fontWeight: headingTypography.fontWeight || '600',
    textTransform: headingTypography.useUppercase ? 'uppercase' as const : 'none' as const,
    fontSize: headingTypography.fontSize ? 
      (headingTypography.fontSize <= 100 ? 
        `${(headingTypography.fontSize * (config.headingSize || 1))}%` : 
        `${headingTypography.fontSize * (config.headingSize || 1)}px`) : 
      `${32 * (config.headingSize || 1)}px`,
    letterSpacing: `${headingTypography.letterSpacing || 0}px`,
    color: colorScheme?.text,
  } : {
    fontSize: `${32 * (config.headingSize || 1)}px`,
    color: colorScheme?.text,
  };

  const bodyTypography = themeConfig?.typography?.body;
  const bodyStyle = bodyTypography ? {
    fontFamily: bodyTypography.fontFamily ? `'${bodyTypography.fontFamily}', sans-serif` : 'inherit',
    fontWeight: bodyTypography.fontWeight || '400',
    textTransform: bodyTypography.useUppercase ? 'uppercase' as const : 'none' as const,
    fontSize: bodyTypography.fontSize ? 
      (bodyTypography.fontSize <= 100 ? 
        `${(bodyTypography.fontSize * (config.bodySize || 1))}%` : 
        `${bodyTypography.fontSize * (config.bodySize || 1)}px`) : 
      `${16 * (config.bodySize || 1)}px`,
    letterSpacing: `${bodyTypography.letterSpacing || 0}px`,
    lineHeight: bodyTypography.lineHeight || '1.5',
    color: colorScheme?.textSecondary || colorScheme?.text,
  } : {
    fontSize: `${16 * (config.bodySize || 1)}px`,
    color: colorScheme?.textSecondary || colorScheme?.text,
  };

  // Typography for columns (children) - reusing heading and body typography
  const columnsHeadingStyle = headingTypography ? {
    fontFamily: headingTypography.fontFamily ? `'${headingTypography.fontFamily}', sans-serif` : 'inherit',
    fontWeight: headingTypography.fontWeight || '600',
    textTransform: headingTypography.useUppercase ? 'uppercase' as const : 'none' as const,
    fontSize: headingTypography.fontSize ? 
      (headingTypography.fontSize <= 100 ? 
        `${(headingTypography.fontSize * 0.75 * (config.columnsHeadingSize || 1))}%` : // Smaller for columns
        `${headingTypography.fontSize * 0.75 * (config.columnsHeadingSize || 1)}px`) : 
      `${24 * (config.columnsHeadingSize || 1)}px`,
    letterSpacing: `${headingTypography.letterSpacing || 0}px`,
    color: colorScheme?.text,
  } : {
    fontSize: `${24 * (config.columnsHeadingSize || 1)}px`,
    color: colorScheme?.text,
  };

  const columnsBodyStyle = bodyTypography ? {
    fontFamily: bodyTypography.fontFamily ? `'${bodyTypography.fontFamily}', sans-serif` : 'inherit',
    fontWeight: bodyTypography.fontWeight || '400',
    textTransform: bodyTypography.useUppercase ? 'uppercase' as const : 'none' as const,
    fontSize: bodyTypography.fontSize ? 
      (bodyTypography.fontSize <= 100 ? 
        `${(bodyTypography.fontSize * 0.875 * (config.columnsBodySize || 1))}%` : // Slightly smaller for columns
        `${bodyTypography.fontSize * 0.875 * (config.columnsBodySize || 1)}px`) : 
      `${14 * (config.columnsBodySize || 1)}px`,
    letterSpacing: `${bodyTypography.letterSpacing || 0}px`,
    lineHeight: bodyTypography.lineHeight || '1.5',
    color: colorScheme?.textSecondary || colorScheme?.text,
  } : {
    fontSize: `${14 * (config.columnsBodySize || 1)}px`,
    color: colorScheme?.textSecondary || colorScheme?.text,
  };

  // Determine layout based on device (with fallbacks) - unify mobile detection like ImageBanner
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
  const layout = isMobile ? (config.mobileLayout || '1column') : (config.desktopLayout || 'grid');
  const cardsPerRow = isMobile ? 1 : (config.desktopCardsPerRow || 3);
  const spacing = isMobile ? (config.mobileSpacing || 24) : (config.desktopSpacing || 24);
  const cardSpacing = isMobile ? (config.mobileSpaceBetweenCards || 16) : (config.desktopSpaceBetweenCards || 24);

  // Width classes
  const widthClasses = {
    'screen': 'w-full',
    'page': 'max-w-7xl mx-auto',
    'large': 'max-w-6xl mx-auto',
    'medium': 'max-w-4xl mx-auto'
  };

  // Render icon
  const renderIcon = (item: any) => {
    if (item.icon === 'custom' && item.customIcon) {
      return <div dangerouslySetInnerHTML={{ __html: item.customIcon }} />;
    }
    const IconComponent = iconMap[item.icon] || Star;
    return <IconComponent style={{ width: item.iconSize, height: item.iconSize, color: colorScheme?.textSecondary || colorScheme?.text }} />;
  };

  // Render column
  const renderColumn = (item: any, index: number) => {
    if (!item.visible) return null;

    // Get icon alignment (use iconAlignment if set, otherwise use contentAlignment)
    const iconAlign = config.iconAlignment || config.contentAlignment || 'left';
    const getIconAlignClass = () => {
      switch(iconAlign) {
        case 'center': return 'justify-center';
        case 'right': return 'justify-end';
        default: return 'justify-start';
      }
    };

    // Render image column
    if (item.type === 'image') {
      const imageSize = isMobile ? (item.mobileImageSize || 100) : (item.desktopImageSize || 100);
      const aspectRatio = item.imageRatio || 1;
      
      return (
        <div 
          key={item.id || index}
          className={`flex flex-col ${config.contentAlignment === 'center' ? 'items-center text-center' : config.contentAlignment === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
          style={{
            backgroundColor: config.colorColumns ? (colorScheme?.backgroundSecondary || '#f9fafb') : 'transparent',
            padding: config.colorColumns ? '24px' : '0',
            borderRadius: config.colorColumns ? '8px' : '0',
          }}
        >
          {/* Image or Video */}
          {(item.image || item.video) && (
            <div 
              className="mb-4 overflow-hidden rounded-lg"
              style={{
                width: `${imageSize}%`,
                maxWidth: '100%',
              }}
            >
              {item.video ? (
                // Render video
                <div style={{ paddingBottom: `${100 / aspectRatio}%`, position: 'relative' }}>
                  <video 
                    src={item.video} 
                    className="absolute inset-0 w-full h-full object-cover"
                    controls
                    muted
                    playsInline
                  />
                </div>
              ) : (
                // Render image
                <div style={{ paddingBottom: `${100 / aspectRatio}%`, position: 'relative' }}>
                  <img 
                    src={item.image} 
                    alt={item.heading || 'Column image'}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Heading */}
          {item.heading && (
            <h3 style={columnsHeadingStyle} className="mb-2">
              {item.heading}
            </h3>
          )}

          {/* Body */}
          {item.body && (
            <p style={columnsBodyStyle} className="mb-4">
              {item.body}
            </p>
          )}

          {/* Link */}
          {item.linkLabel && item.link && (
            <a 
              href={item.link} 
              style={{ color: colorScheme?.link || '#3b82f6' }}
              className="underline hover:no-underline transition-all"
            >
              {item.linkLabel} →
            </a>
          )}
        </div>
      );
    }

    // Render icon column (existing code)
    return (
      <div 
        key={item.id || index}
        className={`flex flex-col ${config.contentAlignment === 'center' ? 'text-center' : config.contentAlignment === 'right' ? 'text-right' : 'text-left'}`}
        style={{
          backgroundColor: config.colorColumns ? (colorScheme?.backgroundSecondary || '#f9fafb') : 'transparent',
          padding: config.colorColumns ? '24px' : '0',
          borderRadius: config.colorColumns ? '8px' : '0',
        }}
      >
        {/* Icon with independent alignment */}
        <div className={`flex ${getIconAlignClass()} mb-4`}>
          {renderIcon(item)}
        </div>

        {/* Heading */}
        {item.heading && (
          <h3 style={columnsHeadingStyle} className="mb-2">
            {item.heading}
          </h3>
        )}

        {/* Body */}
        {item.body && (
          <p style={columnsBodyStyle} className="mb-4">
            {item.body}
          </p>
        )}

        {/* Link */}
        {item.linkLabel && item.link && (
          <a 
            href={item.link} 
            style={{ color: colorScheme?.link || '#3b82f6' }}
            className="underline hover:no-underline transition-all"
          >
            {item.linkLabel} →
          </a>
        )}
      </div>
    );
  };

  // Carousel/Slideshow controls
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const visibleItems = (config.items || []).filter(item => item.visible);
  
  // Si no hay items y estamos en el editor, mostrar placeholders
  const itemsToRender = visibleItems.length > 0 ? visibleItems : (isEditor ? [
    { id: 'placeholder1', type: 'icon', visible: true, icon: 'star', iconSize: 64, heading: 'Column 1', body: 'Add content here', linkLabel: '', link: '' },
    { id: 'placeholder2', type: 'icon', visible: true, icon: 'heart', iconSize: 64, heading: 'Column 2', body: 'Add content here', linkLabel: '', link: '' },
    { id: 'placeholder3', type: 'icon', visible: true, icon: 'check', iconSize: 64, heading: 'Column 3', body: 'Add content here', linkLabel: '', link: '' }
  ] : []);
  
  // Calculate items per view for carousel
  const itemsPerView = isMobile ? 1 : Math.min(cardsPerRow, itemsToRender.length);
  const totalSlides = Math.ceil(itemsToRender.length / itemsPerView);

  // Autoplay implementation
  React.useEffect(() => {
    if (config.autoplay !== 'none' && itemsToRender.length > 1 && !isEditor) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % itemsToRender.length);
      }, config.autoplaySpeed || 5000);
      
      return () => clearInterval(interval);
    }
  }, [config.autoplay, config.autoplaySpeed, itemsToRender.length, isEditor]);

  const handlePrev = () => {
    if (layout === 'carousel' && !isMobile) {
      // For desktop carousel, move by group
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    } else {
      // For mobile or slideshow, move one by one
      setCurrentIndex((prev) => (prev - 1 + itemsToRender.length) % itemsToRender.length);
    }
  };

  const handleNext = () => {
    if (layout === 'carousel' && !isMobile) {
      // For desktop carousel, move by group
      setCurrentIndex((prev) => Math.min(totalSlides - 1, prev + 1));
    } else {
      // For mobile or slideshow, move one by one
      setCurrentIndex((prev) => (prev + 1) % itemsToRender.length);
    }
  };

  return (
    <>
      {/* Custom CSS */}
      {config.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: config.customCSS }} />
      )}
      
      <section 
        style={{ 
          backgroundColor: colorScheme?.background || '#ffffff',
          paddingTop: `${config.topPadding || 0}px`,
          paddingBottom: `${config.bottomPadding || 0}px`,
          paddingLeft: config.addSidePaddings ? '20px' : '0',
          paddingRight: config.addSidePaddings ? '20px' : '0',
          minHeight: config.containerHeight && config.containerHeight > 0 ? `${config.containerHeight}px` : 'auto',
        }}
        className={`multicolumns-section ${config.enabled === false && isEditor ? 'opacity-50' : ''}`}
      >
      <div className={widthClasses[config.width || 'large']}>
        {/* Main heading and body */}
        {(config.heading || config.body) && (
          <div 
            className={`mb-8 ${config.contentAlignment === 'center' ? 'text-center' : config.contentAlignment === 'right' ? 'text-right' : 'text-left'}`}
          >
            {config.heading && (
              <h2 style={headingStyle} className="mb-4">
                {config.heading}
              </h2>
            )}
            {config.body && (
              <p style={bodyStyle}>
                {config.body}
              </p>
            )}
          </div>
        )}

        {/* Columns layout */}
        {layout === 'grid' && (
          <div 
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${cardsPerRow}, 1fr)`,
              gap: `${cardSpacing}px`,
              marginTop: `${spacing}px`
            }}
          >
            {itemsToRender.map((item, index) => renderColumn(item, index))}
          </div>
        )}

        {/* Carousel layout */}
        {(layout === 'carousel' || layout === 'slideshow') && (
          <div className={`relative ${config.showArrowsOnHover ? 'group' : ''}`}>
            {/* Arrow controls - Bottom right corner with elegant effect */}
            {config.showArrowsOnHover && (
              <div className="absolute bottom-6 right-6 flex items-center gap-1 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-2xl flex p-1">
                  <button
                    onClick={handlePrev}
                    className="p-2 hover:bg-gray-100 text-gray-800 rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous"
                    disabled={currentIndex === 0 && layout === 'carousel' && !isMobile}
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
                  <button
                    onClick={handleNext}
                    className="p-2 hover:bg-gray-100 text-gray-800 rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next"
                    disabled={currentIndex === totalSlides - 1 && layout === 'carousel' && !isMobile}
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-lg">
              {layout === 'carousel' && !isMobile && itemsPerView > 1 ? (
                // Desktop carousel - show multiple items
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                    gap: `${cardSpacing}px`
                  }}
                >
                  {itemsToRender.map((item, index) => (
                    <div 
                      key={item.id || index} 
                      className="flex-none"
                      style={{ width: `calc(${100 / itemsPerView}% - ${cardSpacing * (itemsPerView - 1) / itemsPerView}px)` }}
                    >
                      {renderColumn(item, index)}
                    </div>
                  ))}
                </div>
              ) : (
                // Mobile carousel, slideshow, or single item desktop carousel
                <div className="relative">
                  <div 
                    className="flex transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${currentIndex * 100}%)`
                    }}
                  >
                    {itemsToRender.map((item, index) => (
                      <div key={item.id || index} className="flex-none w-full">
                        {renderColumn(item, index)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dots indicator */}
            {layout === 'slideshow' && (
              <div className="flex justify-center gap-2 mt-4">
                {itemsToRender.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-gray-800 w-6' : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 1 Column layout for mobile */}
        {layout === '1column' && (
          <div className="space-y-6" style={{ marginTop: `${spacing}px` }}>
            {itemsToRender.map((item, index) => renderColumn(item, index))}
          </div>
        )}

        {/* Button with typography */}
        {config.buttonLabel && config.buttonLink && (() => {
          const buttonTypography = themeConfig?.typography?.buttons;
          const buttonStyle = buttonTypography ? {
            fontFamily: buttonTypography.fontFamily ? `'${buttonTypography.fontFamily}', sans-serif` : 'inherit',
            fontWeight: buttonTypography.fontWeight || '500',
            textTransform: buttonTypography.useUppercase ? 'uppercase' as const : 'none' as const,
            fontSize: buttonTypography.fontSize ? 
              (buttonTypography.fontSize <= 100 ? `${buttonTypography.fontSize}%` : `${buttonTypography.fontSize}px`) : 
              '14px',
            letterSpacing: `${buttonTypography.letterSpacing || 0}px`,
          } : {};

          return (
            <div className={`mt-8 ${config.contentAlignment === 'center' ? 'text-center' : config.contentAlignment === 'right' ? 'text-right' : 'text-left'}`}>
              <a
                href={config.buttonLink}
                className={`inline-block px-6 py-3 rounded transition-all ${
                  config.buttonStyle === 'solid' 
                    ? 'text-white' 
                    : 'border-2'
                }`}
                style={{
                  backgroundColor: config.buttonStyle === 'solid' ? (colorScheme?.buttonBackground || '#3b82f6') : 'transparent',
                  borderColor: colorScheme?.buttonBackground || '#3b82f6',
                  color: config.buttonStyle === 'solid' ? (colorScheme?.buttonText || '#ffffff') : (colorScheme?.buttonBackground || '#3b82f6'),
                  ...buttonStyle
                }}
              >
                {config.buttonLabel}
              </a>
            </div>
          );
        })()}
      </div>
    </section>
    </>
  );
}