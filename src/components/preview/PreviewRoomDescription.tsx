'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { fetchRoomData } from '@/lib/api/rooms';

interface RoomDescriptionConfig {
  enabled: boolean;
  colorScheme?: 1 | 2 | 3 | 4 | 5;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  mobileAlignment?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: {
    heading: number;
    body: number;
  };
  showHeading?: boolean;
  headingText?: string;
  headingBold?: boolean;
  headingItalic?: boolean;
  headingUnderline?: boolean;
  showMore?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  containerPaddingTop?: number;
  containerPaddingBottom?: number;
}

interface PreviewRoomDescriptionProps {
  config: RoomDescriptionConfig;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
  theme?: any;
}

export default function PreviewRoomDescription({ 
  config, 
  deviceView, 
  isEditor = false,
  theme 
}: PreviewRoomDescriptionProps) {
  
  // Get theme config from store or prop
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;
  
  // Get the selected color scheme
  const colorScheme = useMemo(() => {
    if (!themeConfig?.colorSchemes?.schemes) return null;
    
    const schemeIndex = (config.colorScheme || 1) - 1;
    return themeConfig.colorSchemes.schemes[schemeIndex] || themeConfig.colorSchemes.schemes[0];
  }, [themeConfig, config.colorScheme]);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
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

  // Auto-fetch room data for both editor and preview
  useEffect(() => {
    const loadRoomData = async () => {
      const companyId = localStorage.getItem('companyId') || '1';
      
      setLoading(true);
      try {
        // Use helper function that checks for slug
        const data = await fetchRoomData(companyId);
        if (data) {
          setRoomData(data);
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (config.enabled) {
      loadRoomData();
    }
  }, [config.enabled]);

  if (!config.enabled) {
    return null;
  }

  // Use room data if available, otherwise fall back to default
  const description = roomData?.description || 
    `This stylish apartment is perfect for your San Francisco stay. Located in the heart of the city, you'll be within walking distance of the best restaurants, cafes, and attractions.

The space features modern amenities, comfortable furnishings, and plenty of natural light. The fully equipped kitchen allows you to prepare your own meals, while the cozy living area is perfect for relaxing after a day of exploring.

Whether you're here for business or pleasure, this apartment provides the perfect home base for your San Francisco adventure.`;

  const shouldShowButton = config.showMore !== false && description.length > 200;
  const displayText = !isExpanded && shouldShowButton 
    ? description.slice(0, 200) + '...'
    : description;

  // Get alignment style for header - always centered on mobile
  const getHeaderAlignment = () => {
    // Header is always centered on mobile for better readability
    if (isMobile) {
      return 'text-center';
    }
    
    // Desktop alignment for header
    switch(config.alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'justify': return 'text-justify';
      default: return 'text-left';
    }
  };

  // Get alignment style for body text - respects mobile alignment setting
  const getBodyAlignment = () => {
    // Use mobile alignment when on mobile if configured
    if (isMobile) {
      const mobileAlign = config.mobileAlignment || 'center'; // Default to center on mobile
      switch(mobileAlign) {
        case 'center': return 'text-center';
        case 'right': return 'text-right';
        case 'justify': return 'text-justify';
        case 'left': return 'text-left';
        default: return 'text-center';
      }
    }
    
    // Desktop alignment for body
    switch(config.alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'justify': return 'text-justify';
      default: return 'text-left';
    }
  };

  // Get typography from theme config
  const headingTypography: React.CSSProperties = themeConfig?.typography?.headings ? {
    fontFamily: `'${themeConfig.typography.headings.fontFamily}', sans-serif`,
    fontWeight: themeConfig.typography.headings.fontWeight || '400',
    textTransform: themeConfig.typography.headings.useUppercase ? 'uppercase' as const : 'none' as const,
    fontSize: `${config.fontSize?.heading || 100}%`,
    letterSpacing: `${themeConfig.typography.headings.letterSpacing || 0}px`
  } : { fontSize: `${config.fontSize?.heading || 100}%` };

  const bodyTypography: React.CSSProperties = themeConfig?.typography?.body ? {
    fontFamily: `'${themeConfig.typography.body.fontFamily}', sans-serif`,
    fontWeight: themeConfig.typography.body.fontWeight || '400',
    textTransform: themeConfig.typography.body.useUppercase ? 'uppercase' as const : 'none' as const,
    fontSize: `${config.fontSize?.body || 100}%`,
    letterSpacing: `${themeConfig.typography.body.letterSpacing || 0}px`
  } : { fontSize: `${config.fontSize?.body || 100}%` };

  return (
    <div style={{ 
      marginTop: config.containerPaddingTop !== undefined ? `${config.containerPaddingTop}px` : '0px',
      marginBottom: `${config.containerPaddingBottom || 24}px`
    }}>
      {/* Contenedor principal con color SIN BORDE */}
      <div 
        style={{
          backgroundColor: colorScheme?.background || '#ffffff',
          color: colorScheme?.text || '#000000',
          paddingTop: `${config.paddingTop || 24}px`,
          paddingBottom: `${config.paddingBottom || 24}px`
        }}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            {/* Heading */}
            {config.showHeading !== false && config.headingText && (
              <h2 
                className={`text-2xl md:text-3xl mb-4 ${getHeaderAlignment()}`}
                style={{
                  ...headingTypography,
                  color: colorScheme?.text || '#000000',
                  fontWeight: config.headingBold !== false ? 'bold' : 'normal',
                  fontStyle: config.headingItalic ? 'italic' : 'normal',
                  textDecoration: config.headingUnderline ? 'underline' : 'none'
                }}
              >
                {config.headingText}
              </h2>
            )}
            
            {/* Description */}
            <p 
              className={`text-base whitespace-pre-wrap ${getBodyAlignment()}`}
              style={{
                ...bodyTypography,
                color: colorScheme?.text || '#000000'
              }}
            >
              {displayText}
            </p>
            
            {/* Show More/Less Button */}
            {shouldShowButton && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`mt-3 flex items-center gap-1 font-semibold underline hover:no-underline ${
                  config.alignment === 'center' ? 'mx-auto' : 
                  config.alignment === 'right' ? 'ml-auto' : ''
                }`}
                style={{ color: colorScheme?.link || colorScheme?.text || '#000000' }}
              >
                {isExpanded ? 'Show less' : 'Show more'}
                <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}