'use client';

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { AnnouncementBarConfig } from '@/types/components/announcement-bar';
import { GlobalThemeConfig } from '@/types/theme';
import { PageType } from '@/types/editor.types';
import { useCurrency } from '@/contexts/CurrencyContext';

interface PreviewAnnouncementBarProps {
  config: AnnouncementBarConfig | null;
  theme: GlobalThemeConfig | null;
  pageType?: PageType | string;
  deviceView?: 'desktop' | 'mobile';
  isEditor?: boolean; // True when used inside EditorPreview
}

// Animation styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInFromRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInFromBottom {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes typewriter {
    from { width: 0; opacity: 0; }
    to { width: 100%; opacity: 1; }
  }
  
  @keyframes marquee {
    from { transform: translateX(100%); }
    to { transform: translateX(-100%); }
  }
  
  .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
  .animate-slideInFromRight { animation: slideInFromRight 0.5s ease-out; }
  .animate-slideInFromBottom { animation: slideInFromBottom 0.4s ease-out; }
  .animate-typewriter { animation: typewriter 0.8s steps(30, end); overflow: hidden; white-space: nowrap; }
`;

export default function PreviewAnnouncementBar({ 
  config, 
  theme, 
  pageType, 
  deviceView,
  isEditor = false 
}: PreviewAnnouncementBarProps) {
  // Cast config to any to handle structure mismatches with the current implementation
  const configAny = config as any;
  const { selectedCurrency, availableCurrencies, changeCurrency } = useCurrency();
  
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize with deviceView if provided, otherwise check window width
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });
  
  // Detect mobile viewport or use deviceView prop
  useEffect(() => {
    console.log('PreviewAnnouncementBar - deviceView:', deviceView, 'isEditor:', isEditor);
    
    // If deviceView is provided (from editor), use it directly
    if (deviceView !== undefined) {
      setIsMobile(deviceView === 'mobile');
      console.log('Setting isMobile from deviceView:', deviceView === 'mobile');
      return;
    }
    
    // Otherwise, detect actual viewport size
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      console.log('Setting isMobile from window width:', mobile, 'width:', window.innerWidth);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [deviceView]);
  
  // Get announcements
  const announcements = configAny?.announcements || [];
  const currentAnnouncement = announcements[currentAnnouncementIndex];
  
  // Auto-play functionality
  useEffect(() => {
    // Skip interval for infinite marquee
    if (configAny?.animationStyle === 'infinite-marquee') {
      setCurrentAnnouncementIndex(0);
      return;
    }
    
    if (configAny?.autoplay?.mode === 'one-at-a-time' && 
        announcements.length > 1 && 
        configAny?.animationStyle !== 'infinite-marquee') {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
          setIsAnimating(false);
        }, 300);
      }, (configAny?.autoplay?.speed || 5) * 1000);

      return () => clearInterval(interval);
    }
    
    // Reset index when no autoplay
    if (configAny?.autoplay?.mode === 'none') {
      setCurrentAnnouncementIndex(0);
    }
  }, [
    configAny?.autoplay?.mode,
    configAny?.autoplay?.speed,
    configAny?.animationStyle,
    announcements.length
  ]);
  
  // Force re-render when animation style changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [configAny?.animationStyle]);

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentAnnouncementIndex((prev) => 
      prev === 0 ? announcements.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentAnnouncementIndex((prev) => 
      (prev + 1) % announcements.length
    );
  };

  // Get animation class
  const getAnimationClass = (style?: string) => {
    switch(style) {
      case 'fade': return 'animate-fadeIn';
      case 'slide-horizontal': return 'animate-slideInFromRight';
      case 'slide-vertical': return 'animate-slideInFromBottom';
      case 'typewriter': return 'animate-typewriter';
      case 'infinite-marquee': return '';
      default: return '';
    }
  };

  // Render icon
  const renderIcon = (iconValue: string) => {
    const iconMap: { [key: string]: any } = {
      'Settings': Icons.Settings,
      'Search': Icons.Search,
      'Eye': Icons.Eye,
      'User': Icons.User,
      'Heart': Icons.Heart,
      'ThumbsUp': Icons.ThumbsUp,
      'Star': Icons.Star,
      'Bell': Icons.Bell,
      'Clock': Icons.Clock,
      'Calendar': Icons.Calendar,
      'Info': Icons.Info,
      'ShoppingBag': Icons.ShoppingBag,
      'ShoppingCart': Icons.ShoppingCart,
      'Gift': Icons.Gift,
      'Percent': Icons.Percent,
      'Award': Icons.Award,
      'Package': Icons.Package,
      'MapPin': Icons.MapPin,
      'Truck': Icons.Truck,
      'Globe': Icons.Globe,
      'CreditCard': Icons.CreditCard,
      'Lock': Icons.Lock,
      'Shield': Icons.Shield,
      'DollarSign': Icons.DollarSign,
      'Tag': Icons.Tag,
      'Phone': Icons.Phone,
      'MessageCircle': Icons.MessageCircle,
      'Mail': Icons.Mail,
      'HelpCircle': Icons.HelpCircle,
      'Leaf': Icons.Feather,
      'Twitter': Icons.Twitter,
      'Facebook': Icons.Facebook,
      'Instagram': Icons.Instagram,
      'Youtube': Icons.Youtube,
      'Linkedin': Icons.Linkedin,
    };

    const IconComponent = iconMap[iconValue];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  // Social media icons
  const socialIcons: { [key: string]: JSX.Element } = {
    instagram: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
      </svg>
    ),
    facebook: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    pinterest: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 14.002-7.496 14.002-13.986 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
      </svg>
    ),
    youtube: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    linkedin: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  };

  // Render social icon
  const renderSocialIcon = (platform: string, style: string = 'solid') => {
    const icon = socialIcons[platform.toLowerCase()];
    if (icon) return icon;
    
    // Fallback to generic icon for unrecognized platforms
    return <Icons.Globe className="w-6 h-6" />;
  };

  // Determine max width
  const getMaxWidth = () => {
    switch(configAny?.width) {
      case 'screen': return '100%';
      case 'page': return '100%';
      case 'large': return '1400px';
      case 'medium': return '1200px';
      default: return '100%';
    }
  };

  // Validate configuration - AFTER all hooks
  if (!configAny?.enabled || !configAny?.announcements || configAny?.announcements?.length === 0) {
    return null;
  }
  
  // Check if should show based on page type
  if (configAny?.showOnlyHomePage && pageType !== PageType.HOME && pageType !== 'home') {
    return null;
  }
  
  // Extract color scheme
  const colorScheme = theme?.colorSchemes?.schemes?.[parseInt(configAny?.colorScheme || '1') - 1];
  const borderRadius = `${configAny?.edgeRounding || 0}px`;

  // Debug log final mobile state
  console.log('Final render - isMobile:', isMobile, 'deviceView:', deviceView, 'window.innerWidth:', typeof window !== 'undefined' ? window.innerWidth : 'SSR');

  return (
    <>
      {/* Inject animation styles */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      <div 
        style={{ 
          backgroundColor: colorScheme?.background || '#000000',
          color: colorScheme?.text || '#ffffff',
          borderRadius: configAny?.width !== 'screen' ? borderRadius : '0',
          maxWidth: getMaxWidth(),
          margin: configAny?.width !== 'screen' ? '0 auto' : '0'
        }}
        className="relative"
      >
        <div className={`flex items-center justify-between py-2 ${isMobile ? 'px-2' : 'px-4'}`}>
          {/* Left side - Social media icons (only desktop) */}
          <div className={isMobile ? '' : 'flex items-center gap-4'}>
            {!isMobile && configAny?.socialMediaIcons?.enabled && configAny?.socialMediaIcons?.showOnDesktop && (
              Object.entries(configAny?.socialMediaUrls || {})
                .filter(([_, url]) => url)
                .slice(0, 5)
                .map(([platform, url]) => (
                  <a key={platform} href={url as string} className="hover:opacity-70" aria-label={platform}>
                    {renderSocialIcon(platform, configAny?.socialMediaIcons?.iconStyle || 'solid')}
                  </a>
                ))
            )}
          </div>

          {/* Center - Announcement text */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Announcement content with arrows positioned absolutely */}
            {configAny?.animationStyle === 'infinite-marquee' ? (
              // Marquee animation
              <div className="overflow-hidden whitespace-nowrap flex-1 relative">
                <div 
                  className="inline-flex"
                  style={{ 
                    animation: 'marquee 15s linear infinite',
                    paddingLeft: '100%'
                  }}
                >
                  {[...Array(3)].map((_, copyIndex) => (
                    announcements.map((announcement: any, idx: number) => (
                      <div key={`${copyIndex}-${idx}`} className="inline-flex items-center gap-2 mx-4">
                        {announcement?.icon && renderIcon(announcement.icon)}
                        <span 
                          style={{ 
                            fontSize: `${configAny?.textSize || (isMobile ? 12 : 14)}px` 
                          }}
                        >
                          {announcement?.text || 'Welcome to our store!'}
                        </span>
                        {announcement?.linkText && announcement?.linkUrl && (
                          <a 
                            href={announcement.linkUrl}
                            className="underline hover:opacity-70"
                            style={{ color: colorScheme?.text || '#ffffff' }}
                          >
                            {announcement.linkText}
                          </a>
                        )}
                        <span className="mx-2">•</span>
                      </div>
                    ))
                  ))}
                </div>
              </div>
            ) : (
              // Static mode and other animations - centered content with absolute arrows
              <>
                {/* Previous button - positioned absolutely with offset */}
                {configAny?.showNavigationArrows && announcements.length > 1 && (
                  <button 
                    className="absolute hover:opacity-70 transition-opacity"
                    onClick={handlePrevious}
                    style={{ 
                      left: isMobile ? '50%' : '55%',  // Center on mobile, offset on desktop
                      transform: `translateX(calc(${isMobile ? '-50%' : '-55%'} - ${150 + (isMobile ? (configAny?.arrowSpacingMobile ?? 4) : (configAny?.arrowSpacing || 8))}px))`,
                      padding: `0 ${isMobile ? (configAny?.arrowSpacingMobile ?? 4) : (configAny?.arrowSpacing || 8)}px`
                    }}
                  >
                    <Icons.ChevronLeft 
                      style={{ 
                        width: `${configAny?.arrowSize || (isMobile ? 12 : 16)}px`,
                        height: `${configAny?.arrowSize || (isMobile ? 12 : 16)}px`
                      }} 
                    />
                  </button>
                )}
                
                {/* Announcement text - centered on mobile, offset on desktop */}
                <div 
                  className={`flex items-center gap-2 ${configAny?.animationStyle && configAny?.autoplay?.mode !== 'none' ? getAnimationClass(configAny?.animationStyle) : ''}`}
                  key={`announcement-${currentAnnouncementIndex}-${animationKey}`}
                  style={{ 
                    marginLeft: isMobile ? '0' : '10%'  // Centered on mobile, offset on desktop
                  }}
                >
                  {currentAnnouncement?.icon && renderIcon(currentAnnouncement?.icon)}
                  <span 
                    style={{ 
                      fontSize: `${configAny?.textSize || (isMobile ? 12 : 14)}px` 
                    }}
                  >
                    {currentAnnouncement?.text || 'Welcome to our store!'}
                  </span>
                  {currentAnnouncement?.linkText && currentAnnouncement?.linkUrl && (
                    <a 
                      href={currentAnnouncement.linkUrl}
                      className="underline ml-2 hover:opacity-70"
                      style={{ color: colorScheme?.text || '#ffffff' }}
                    >
                      {currentAnnouncement.linkText}
                    </a>
                  )}
                </div>
                
                {/* Next button - positioned absolutely with offset */}
                {configAny?.showNavigationArrows && announcements.length > 1 && (
                  <button 
                    className="absolute hover:opacity-70 transition-opacity"
                    onClick={handleNext}
                    style={{ 
                      right: isMobile ? '50%' : '45%',  // Center on mobile, offset on desktop
                      transform: `translateX(calc(${isMobile ? '50%' : '45%'} + ${150 + (isMobile ? (configAny?.arrowSpacingMobile ?? 4) : (configAny?.arrowSpacing || 8))}px))`,
                      padding: `0 ${isMobile ? (configAny?.arrowSpacingMobile ?? 4) : (configAny?.arrowSpacing || 8)}px`
                    }}
                  >
                    <Icons.ChevronRight 
                      style={{ 
                        width: `${configAny?.arrowSize || (isMobile ? 12 : 16)}px`,
                        height: `${configAny?.arrowSize || (isMobile ? 12 : 16)}px`
                      }} 
                    />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Right side - Language/Currency selectors (only desktop) */}
          <div className={isMobile ? '' : 'flex items-center gap-6'}>
            {!isMobile && configAny?.languageSelector?.enabled && configAny?.languageSelector?.showOnDesktop && (
              <select 
                className="bg-transparent text-base font-medium border-0 outline-none cursor-pointer px-1"
                style={{ color: 'inherit' }}
                defaultValue="ES"
              >
                <option value="ES">Español</option>
                <option value="EN">English</option>
              </select>
            )}
            {!isMobile && configAny?.currencySelector?.enabled && configAny?.currencySelector?.showOnDesktop && (
              <select 
                className="bg-transparent text-base font-medium border-0 outline-none cursor-pointer px-1"
                style={{ color: 'inherit' }}
                value={selectedCurrency}
                onChange={(e) => changeCurrency(e.target.value as any)}
              >
                {availableCurrencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
    </>
  );
}