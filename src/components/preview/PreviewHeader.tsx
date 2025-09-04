'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, Search, ShoppingCart, ShoppingBag, User, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PreviewHeaderProps {
  config: any;
  theme: any;
  deviceView?: 'desktop' | 'mobile' | 'tablet'; // Optional prop for editor preview sync
  isEditor?: boolean; // True when used inside EditorPreview
}

export default function PreviewHeader({ config, theme, deviceView, isEditor = false }: PreviewHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDrawerSubmenu, setActiveDrawerSubmenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile viewport or use deviceView prop
  useEffect(() => {
    // Always close drawer when device view changes
    setDrawerOpen(false);
    setActiveDrawerSubmenu(null);
    
    // If deviceView is provided (from editor), use it
    if (deviceView !== undefined) {
      setIsMobile(deviceView === 'mobile');
      return;
    }
    
    // Otherwise, detect actual viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Close drawer on resize
      setDrawerOpen(false);
      setActiveDrawerSubmenu(null);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [deviceView]);
  
  // Track wishlist items count
  useEffect(() => {
    const getWishlistCount = () => {
      const wishlistItems = localStorage.getItem('wishlistItems');
      if (wishlistItems) {
        try {
          const items = JSON.parse(wishlistItems);
          setWishlistCount(Array.isArray(items) ? items.length : 0);
        } catch (e) {
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0);
      }
    };
    
    getWishlistCount();
    // Listen for storage changes
    window.addEventListener('storage', getWishlistCount);
    // Also listen for custom wishlist update event
    window.addEventListener('wishlistUpdated', getWishlistCount);
    
    return () => {
      window.removeEventListener('storage', getWishlistCount);
      window.removeEventListener('wishlistUpdated', getWishlistCount);
    };
  }, []);

  // Parse config properly matching HeaderEditor structure
  const headerConfig = {
    // CRÍTICO: En móvil SIEMPRE usar drawer, igual que EditorPreview.tsx
    layout: (isMobile || deviceView === 'mobile') ? 'drawer' : (config?.layout || 'drawer'),
    sticky: config?.sticky || { enabled: false, alwaysShow: false },
    logo: config?.logo || {
      desktopUrl: '/placeholder-logo.svg',
      mobileUrl: '/placeholder-logo.svg',
      height: 40,
      mobileHeight: 30,
      altText: 'Logo'
    },
    menuId: config?.menuId,
    menuOpenOn: config?.menuOpenOn || 'hover',
    showSeparator: config?.showSeparator || false,
    iconStyle: config?.iconStyle || 'style2-outline',
    cart: config?.cart || {
      style: 'bag',
      showCount: true,
      countPosition: 'top-right',
      countBackground: '#000000',
      countText: '#FFFFFF'
    },
    colorScheme: config?.colorScheme || '1',
    width: config?.width || 'page',
    edgeRounding: config?.edgeRounding || 'size0',
    customCss: config?.customCss || '',
    height: config?.height || 145,
    showSearchIcon: config?.showSearchIcon !== false, // default true
    showUserIcon: config?.showUserIcon !== false, // default true
    showCartIcon: config?.showCartIcon !== false, // default true
    wishlist: config?.wishlist || {
      show: false,
      style: 'heart-outline',
      showCount: true,
      badgeColor: '#FF385C',
      position: 'before-cart'
    },
    hamburgerIconColor: config?.hamburgerIconColor || '', // custom hamburger color
    searchIconColor: config?.searchIconColor || '', // custom search icon color
    cartIconColor: config?.cartIconColor || '', // custom cart icon color
    userIconColor: config?.userIconColor || '' // custom user icon color
  };

  // Apply typography styles from theme (matching EditorPreview.tsx)
  const menuTypographyStyles = theme?.typography?.menu ? {
    fontFamily: `'${theme.typography.menu.fontFamily}', sans-serif`,
    fontWeight: theme.typography.menu.fontWeight || '400',
    textTransform: theme.typography.menu.useUppercase ? 'uppercase' as const : 'none' as const,
    fontSize: theme.typography.menu.fontSize ? 
      (theme.typography.menu.fontSize <= 100 ? 
        `${theme.typography.menu.fontSize}%` : 
        `${theme.typography.menu.fontSize}px`) : '94%',
    letterSpacing: `${theme.typography.menu.letterSpacing || 0}px`
  } : {};

  // Load menu items if menuId is specified
  useEffect(() => {
    const loadMenu = async () => {
      if (headerConfig.menuId && headerConfig.menuId !== 'none') {
        try {
          // Load real menu from API
          // Use local API in development, production API otherwise
          const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
          const apiUrl = isDevelopment 
            ? 'http://localhost:5266/api' 
            : (process.env.NEXT_PUBLIC_API_URL || 'https://api.test1hotelwebsite.online/api');
          
          console.log('Loading menu from:', apiUrl, 'Menu ID:', headerConfig.menuId);
          const response = await fetch(`${apiUrl}/NavigationMenu/${headerConfig.menuId}/public`);
          
          if (response.ok) {
            const menuData = await response.json();
            console.log('Loaded menu data:', menuData);
            
            // Transform menu items to the expected format - using subItems like EditorPreview
            const transformMenuItem = (item: any): any => ({
              id: item.id?.toString() || item.label,
              label: item.label || item.name,
              url: item.link || item.url || '#',
              subItems: item.subItems?.map(transformMenuItem) || item.children?.map(transformMenuItem) || item.items?.map(transformMenuItem)
            });
            
            const items = menuData.items?.map(transformMenuItem) || [];
            setMenuItems(items);
          } else {
            console.error('Failed to load menu:', response.status);
            // Fallback to basic menu
            setMenuItems([
              { id: '1', label: 'Home', url: '/' },
              { id: '2', label: 'Products', url: '/products' }
            ]);
          }
        } catch (error) {
          console.error('Error loading menu:', error);
          // Fallback to basic menu
          setMenuItems([
            { id: '1', label: 'Home', url: '/' },
            { id: '2', label: 'Products', url: '/products' }
          ]);
        }
      }
    };

    loadMenu();
  }, [headerConfig.menuId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerConfig.menuOpenOn === 'click') {
        const clickedOutside = Object.keys(dropdownRefs.current).every(
          key => !dropdownRefs.current[key]?.contains(event.target as Node)
        );
        if (clickedOutside) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [headerConfig.menuOpenOn]);

  // Apply color scheme from theme
  const colorScheme = theme?.colorSchemes?.schemes?.[parseInt(headerConfig.colorScheme) - 1];
  const headerStyles = {
    backgroundColor: colorScheme?.background || '#ffffff',
    borderColor: colorScheme?.accent?.default || '#e5e7eb',
    color: colorScheme?.text?.default || '#000000',
    height: `${headerConfig.height}px`
  };

  // Icon style helpers
  const iconStyle = headerConfig?.iconStyle || 'style2-outline';
  const cartType = headerConfig?.cart?.style || 'bag';
  const isStyle1 = iconStyle.startsWith('style1');
  const isSolid = iconStyle.includes('solid');

  // Helper function to determine if URL is internal
  const isInternalUrl = (url: string) => {
    if (!url) return false;
    return url.startsWith('/') && !url.startsWith('//');
  };

  // Normalize internal URLs for public site context
  const normalizeInternalPath = (url: string) => {
    if (!url) return url;
    // Map editor-only or admin routes to public-facing slugs
    const map: Record<string, string> = {
      '/habitaciones-lista': '/habitaciones', // Public rooms listing slug
      '/dashboard': '/home',
      '/editor': '/home'
    };
    return map[url] || url;
  };

  // Helper function to handle navigation
  const handleNavigation = (url: string, e?: React.MouseEvent) => {
    if (!url || url === '#') {
      if (e) e.preventDefault();
      return;
    }

    if (isInternalUrl(url)) {
      const normalized = normalizeInternalPath(url);
      if (e) e.preventDefault();
      // Close drawer if open
      setDrawerOpen(false);
      setActiveDrawerSubmenu(null);
      // Navigate using Next.js router
      router.push(normalized);
    }
    // For external URLs, let the default anchor behavior handle it
  };

  // Icon rendering functions (matching EditorPreview.tsx)
  const renderSearchIcon = () => {
    const iconClass = isMobile ? "w-4 h-4" : "w-5 h-5";
    const iconColor = headerConfig.searchIconColor || colorScheme?.text?.default || '#000000';
    if (isStyle1) {
      // Style 1 - Circle with magnifying glass
      return (
        <svg className={iconClass} fill={isSolid ? iconColor : 'none'} 
             stroke={iconColor} strokeWidth={isSolid ? "0" : "2"} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" fill={isSolid ? undefined : 'none'} />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
      );
    } else {
      // Style 2 - Standard search icon
      return (
        <svg className={iconClass} fill={isSolid ? iconColor : 'none'} 
             stroke={iconColor} strokeWidth={isSolid ? "0" : "2"} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                fill={isSolid ? iconColor : 'none'} />
        </svg>
      );
    }
  };
  
  const renderUserIcon = () => {
    const iconClass = isMobile ? "w-4 h-4" : "w-5 h-5";
    const iconColor = headerConfig.userIconColor || colorScheme?.text?.default || '#000000';
    if (isStyle1) {
      // Style 1 - Simple user
      return (
        <svg className={iconClass} fill={isSolid ? iconColor : 'none'} 
             stroke={iconColor} strokeWidth={isSolid ? "0" : "2"} viewBox="0 0 24 24">
          <circle cx="12" cy="7" r="4" />
          <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    } else {
      // Style 2 - Detailed user
      return (
        <svg className={iconClass} fill={isSolid ? iconColor : 'none'} 
             stroke={iconColor} strokeWidth={isSolid ? "0" : "2"} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    }
  };
  
  const renderWishlistIcon = () => {
    const iconClass = isMobile ? "w-4 h-4" : "w-5 h-5";
    const iconColor = headerConfig.wishlist?.iconColor || colorScheme?.text?.default || '#000000';
    const wishlistStyle = headerConfig.wishlist?.style || 'heart-outline';
    
    if (wishlistStyle === 'heart') {
      // Filled heart
      return (
        <div className="relative">
          <svg className={iconClass} fill={iconColor} viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {headerConfig.wishlist?.showCount && wishlistCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 text-[10px] font-bold text-white rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
              style={{ backgroundColor: headerConfig.wishlist?.badgeColor || '#FF385C' }}
            >
              {wishlistCount}
            </span>
          )}
        </div>
      );
    } else if (wishlistStyle === 'heart-outline') {
      // Outline heart
      return (
        <div className="relative">
          <svg className={iconClass} fill="none" stroke={iconColor} strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {headerConfig.wishlist?.showCount && wishlistCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 text-[10px] font-bold text-white rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
              style={{ backgroundColor: headerConfig.wishlist?.badgeColor || '#FF385C' }}
            >
              {wishlistCount}
            </span>
          )}
        </div>
      );
    } else if (wishlistStyle === 'star') {
      // Filled star
      return (
        <div className="relative">
          <svg className={iconClass} fill={iconColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {headerConfig.wishlist?.showCount && wishlistCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 text-[10px] font-bold text-white rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
              style={{ backgroundColor: headerConfig.wishlist?.badgeColor || '#FF385C' }}
            >
              {wishlistCount}
            </span>
          )}
        </div>
      );
    } else {
      // Outline star
      return (
        <div className="relative">
          <svg className={iconClass} fill="none" stroke={iconColor} strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {headerConfig.wishlist?.showCount && wishlistCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 text-[10px] font-bold text-white rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
              style={{ backgroundColor: headerConfig.wishlist?.badgeColor || '#FF385C' }}
            >
              {wishlistCount}
            </span>
          )}
        </div>
      );
    }
  };
  
  const renderCartIcon = () => {
    const iconClass = isMobile ? "w-4 h-4" : "w-5 h-5";
    const iconColor = headerConfig.cartIconColor || colorScheme?.text?.default || '#000000';
    if (cartType === 'bag') {
      // Bag icon
      return (
        <svg className={iconClass} fill={isSolid ? iconColor : 'none'} 
             stroke={iconColor} strokeWidth={isSolid ? "0" : "2"} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" 
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    } else {
      // Cart icon
      return (
        <svg className={iconClass} fill={isSolid ? iconColor : 'none'} 
             stroke={iconColor} strokeWidth={isSolid ? "0" : "2"} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    }
  };

  // Render menu items for non-drawer layouts
  const renderMenuItem = (item: any) => {
    const hasChildren = item.subItems && item.subItems.length > 0;
    const isOpen = openDropdown === item.label;
    const isInternal = isInternalUrl(item.url);

    return (
      <div
        key={item.id}
        className="relative group"
        ref={el => { dropdownRefs.current[item.id] = el; }}
        onMouseEnter={() => {
          if (headerConfig.menuOpenOn === 'hover' && hasChildren) {
            // Clear any existing timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            setOpenDropdown(item.label);
          }
        }}
        onMouseLeave={() => {
          if (headerConfig.menuOpenOn === 'hover') {
            // Add a delay before closing the dropdown
            timeoutRef.current = setTimeout(() => {
              setOpenDropdown(null);
            }, 150); // 150ms delay
          }
        }}
      >
        {isInternal ? (
          <Link
            href={normalizeInternalPath(item.url || '#')}
            className="relative flex items-center gap-1 transition-opacity hover:opacity-80 px-4 py-2"
            style={{ 
              color: colorScheme?.text?.default || '#000000',
              ...menuTypographyStyles
            }}
            onClick={(e) => {
              // Only prevent navigation if clicking for dropdown toggle on click mode
              if (hasChildren && headerConfig.menuOpenOn === 'click') {
                // Allow navigation but also toggle dropdown
                setOpenDropdown(isOpen ? null : item.label);
                // Don't prevent default - allow navigation to happen
              }
            }}
          >
            {item.label}
            {headerConfig.menuOpenOn === 'click' && hasChildren && (
              <ChevronDown className="w-3 h-3" />
            )}
            {/* Underline when dropdown is open */}
            {isOpen && (
              <span 
                className="absolute left-0 right-0 h-0.5"
                style={{ 
                  backgroundColor: colorScheme?.text?.default || '#000000',
                  bottom: '-2px'
                }}
              />
            )}
          </Link>
        ) : (
          <a
            href={item.url || '#'}
            className="relative flex items-center gap-1 transition-opacity hover:opacity-80 px-4 py-2"
            style={{ 
              color: colorScheme?.text?.default || '#000000',
              ...menuTypographyStyles
            }}
            onClick={(e) => {
              // For external links with children, prevent navigation only on dropdown toggle
              if (hasChildren && headerConfig.menuOpenOn === 'click') {
                setOpenDropdown(isOpen ? null : item.label);
              }
            }}
            target={item.url && !item.url.startsWith('#') ? '_blank' : undefined}
            rel={item.url && !item.url.startsWith('#') ? 'noopener noreferrer' : undefined}
          >
            {item.label}
            {headerConfig.menuOpenOn === 'click' && hasChildren && (
              <ChevronDown className="w-3 h-3" />
            )}
            {/* Underline when dropdown is open */}
            {isOpen && (
              <span 
                className="absolute left-0 right-0 h-0.5"
                style={{ 
                  backgroundColor: colorScheme?.text?.default || '#000000',
                  bottom: '-2px'
                }}
              />
            )}
          </a>
        )}
        
        {hasChildren && isOpen && (
          <div 
            className="absolute top-full left-0 mt-2 min-w-[200px] border shadow-lg rounded-md z-50"
            style={{ backgroundColor: colorScheme?.background || '#ffffff' }}
            onMouseEnter={() => {
              // Clear timeout when mouse enters dropdown
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            }}
            onMouseLeave={() => {
              // Close dropdown when mouse leaves
              if (headerConfig.menuOpenOn === 'hover') {
                timeoutRef.current = setTimeout(() => {
                  setOpenDropdown(null);
                }, 150);
              }
            }}
          >
            <div className="py-2">
              {item.subItems.map((child: any, childIndex: number) => {
                const isChildInternal = isInternalUrl(child.url);
                return isChildInternal ? (
                  <Link
                    key={child.id || `submenu-${item.id || item.label}-${childIndex}`}
                    href={normalizeInternalPath(child.url || '#')}
                    className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    style={{ ...menuTypographyStyles, color: colorScheme?.text?.default || '#000000' }}
                    onClick={() => setOpenDropdown(null)}
                  >
                    {child.label}
                  </Link>
                ) : (
                  <a
                    key={child.id || `submenu-${item.id || item.label}-${childIndex}`}
                    href={child.url || '#'}
                    className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    style={{ ...menuTypographyStyles, color: colorScheme?.text?.default || '#000000' }}
                    target={child.url && !child.url.startsWith('#') ? '_blank' : undefined}
                    rel={child.url && !child.url.startsWith('#') ? 'noopener noreferrer' : undefined}
                  >
                    {child.label}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Determine the layout structure
  // CRÍTICO: En móvil, deshabilitar todos los layouts especiales (igual que EditorPreview.tsx línea 806-811)
  const isLogoLeftMenuCenter = !isMobile && headerConfig?.layout === 'logo-left-menu-center-inline';
  const isLogoLeftMenuLeft = !isMobile && headerConfig?.layout === 'logo-left-menu-left-inline';
  const isLogoCenterMenuLeft = !isMobile && headerConfig?.layout === 'logo-center-menu-left-inline';
  const isLogoCenterMenuCenterBelow = !isMobile && headerConfig?.layout === 'logo-center-menu-center-below';
  const isLogoLeftMenuLeftBelow = !isMobile && headerConfig?.layout === 'logo-left-menu-left-below';
  const isMenuBelow = isLogoCenterMenuCenterBelow || isLogoLeftMenuLeftBelow;
  // IMPORTANTE: En móvil SIEMPRE usar drawer layout (igual que EditorPreview.tsx línea 461)
  const isDrawerLayout = headerConfig?.layout === 'drawer' || isMobile;

  const headerClasses = `
    ${headerConfig.sticky.enabled ? 'sticky top-0' : ''} 
    z-40 border-b transition-all duration-200
  `;

  // For layouts with menu below, we need a different structure
  if (isMenuBelow) {
    return (
      <header className={headerClasses} style={headerStyles}>
        <div className={`${headerConfig.width === 'full' ? 'w-full' : headerConfig.width === 'screen' ? 'w-full' : 'container mx-auto'} px-4`}>
          <div className="flex flex-col justify-center" style={{ height: headerStyles.height }}>
            {/* Top row with logo and icons */}
            <div className="flex items-center justify-between">
              {/* Logo section - Absolutely centered for logo center layout */}
              {isLogoCenterMenuCenterBelow ? (
                <>
                  {/* Empty spacer for balance */}
                  <div className="w-20"></div>
                  {/* Centered logo */}
                  <Link href="/home" className="flex items-center justify-center flex-1 cursor-pointer">
                    {headerConfig?.logo?.desktopUrl ? (
                      <img
                        src={headerConfig.logo.desktopUrl}
                        alt={headerConfig.logo.altText || 'Company Logo'}
                        className="self-center"
                        style={{ 
                          height: isMobile ? (headerConfig.logo.mobileHeight || 30) : (headerConfig.logo.height || 40),
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <div className="text-xl font-bold self-center" style={{ color: colorScheme?.text?.default || '#000000' }}>
                        Aurora
                      </div>
                    )}
                  </Link>
                </>
              ) : (
                // Logo left layout
                <Link href="/home" className="flex items-center cursor-pointer">
                  {headerConfig?.logo?.desktopUrl ? (
                    <img
                      src={headerConfig.logo.desktopUrl}
                      alt={headerConfig.logo.altText || 'Company Logo'}
                      className="self-center"
                      style={{ 
                        height: isMobile ? (headerConfig.logo.mobileHeight || 30) : (headerConfig.logo.height || 40),
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div className="text-xl font-bold self-center" style={{ color: colorScheme?.text?.default || '#000000' }}>
                      Aurora
                    </div>
                  )}
                </Link>
              )}
              
              {/* Icons */}
              <div className="flex items-center gap-4">
                {headerConfig.showSearchIcon && (
                  <button className="hover:opacity-70 transition-opacity">
                    {renderSearchIcon()}
                  </button>
                )}
                {headerConfig.showUserIcon && (
                  <button className="hover:opacity-70 transition-opacity">
                    {renderUserIcon()}
                  </button>
                )}
                {/* Wishlist icon - position based on config */}
                {headerConfig.wishlist?.show && headerConfig.wishlist?.position === 'before-cart' && (
                  <button className="hover:opacity-70 transition-opacity" onClick={() => window.location.href = '/wishlist'}>
                    {renderWishlistIcon()}
                  </button>
                )}
                <button className="hover:opacity-70 transition-opacity">
                  {renderCartIcon()}
                </button>
                {/* Wishlist icon - after cart */}
                {headerConfig.wishlist?.show && headerConfig.wishlist?.position === 'after-cart' && (
                  <button className="hover:opacity-70 transition-opacity" onClick={() => window.location.href = '/wishlist'}>
                    {renderWishlistIcon()}
                  </button>
                )}
                {/* Wishlist icon - after user (last position) */}
                {headerConfig.wishlist?.show && headerConfig.wishlist?.position === 'after-user' && (
                  <button className="hover:opacity-70 transition-opacity" onClick={() => window.location.href = '/wishlist'}>
                    {renderWishlistIcon()}
                  </button>
                )}
              </div>
            </div>
            
            {/* Bottom row with menu */}
            <div className={`${isLogoCenterMenuCenterBelow ? 'flex justify-center' : ''}`}>
              <nav className="flex gap-6">
                {menuItems.map((item: any, index: number) => (
                  <React.Fragment key={item.id || `menu-item-402-${index}`}>
                    {renderMenuItem(item)}
                  </React.Fragment>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // For drawer layout specifically - Matching EditorPreview exactly
  if (isDrawerLayout) {
    return (
      <div className="relative" style={{ overflow: isEditor && isMobile ? 'hidden' : 'visible' }}>
        <header className={headerClasses} style={headerStyles}>
          <div className={`${headerConfig.width === 'full' ? 'w-full' : headerConfig.width === 'screen' ? 'w-full' : 'container mx-auto'} px-4`}>
            {isMobile ? (
              // Mobile layout: Grid to ensure perfect centering and proper spacing
              <div className="grid [grid-template-columns:1fr_auto_1fr] items-center" style={{ height: headerStyles.height }}>
                {/* Left section - Hamburger */}
                <div className="justify-self-start flex items-center">
                  <button
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    className="p-1.5 hover:opacity-70 transition-opacity"
                    style={{ color: headerConfig?.hamburgerIconColor || colorScheme?.text?.default || '#000000' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                {/* Center section - Logo */}
                <Link href="/home" className="justify-self-center flex items-center justify-center cursor-pointer">
                  {headerConfig?.logo?.mobileUrl ? (
                    <img
                      src={headerConfig.logo.mobileUrl}
                      alt={headerConfig.logo.altText || 'Company Logo'}
                      style={{ 
                        height: headerConfig.logo.mobileHeight || 30,
                        objectFit: 'contain'
                      }}
                    />
                  ) : headerConfig?.logo?.desktopUrl ? (
                    <img
                      src={headerConfig.logo.desktopUrl}
                      alt={headerConfig.logo.altText || 'Company Logo'}
                      style={{ 
                        height: headerConfig.logo.mobileHeight || 30,
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div className="text-xl font-bold" style={{ color: colorScheme?.text?.default || '#000000' }}>
                      Aurora
                    </div>
                  )}
                </Link>

                {/* Right section - Icons */}
                <div className="justify-self-end flex items-center gap-2.5">
                  {headerConfig.showSearchIcon && (
                    <button className="inline-flex items-center justify-center p-0.5 hover:opacity-70 transition-opacity">
                      {renderSearchIcon()}
                    </button>
                  )}
                  {headerConfig.showUserIcon && (
                    <button className="inline-flex items-center justify-center p-0.5 hover:opacity-70 transition-opacity">
                      {renderUserIcon()}
                    </button>
                  )}
                  {/* Wishlist icon - before cart */}
                  {headerConfig.wishlist?.show && headerConfig.wishlist?.position === 'before-cart' && (
                    <button className="inline-flex items-center justify-center p-0.5 hover:opacity-70 transition-opacity" 
                            onClick={() => window.location.href = '/wishlist'}>
                      {renderWishlistIcon()}
                    </button>
                  )}
                  {headerConfig.showCartIcon && (
                    <button className="inline-flex items-center justify-center p-0.5 hover:opacity-70 transition-opacity">
                      {renderCartIcon()}
                    </button>
                  )}
                  {/* Wishlist icon - after cart */}
                  {headerConfig.wishlist?.show && headerConfig.wishlist?.position === 'after-cart' && (
                    <button className="inline-flex items-center justify-center p-0.5 hover:opacity-70 transition-opacity" 
                            onClick={() => window.location.href = '/wishlist'}>
                      {renderWishlistIcon()}
                    </button>
                  )}
                  {/* Wishlist icon - after user */}
                  {headerConfig.wishlist?.show && headerConfig.wishlist?.position === 'after-user' && (
                    <button className="inline-flex items-center justify-center p-0.5 hover:opacity-70 transition-opacity" 
                            onClick={() => window.location.href = '/wishlist'}>
                      {renderWishlistIcon()}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between" style={{ height: headerStyles.height }}>
                {/* Left section - Hamburger */}
                <div className="flex items-center">
                  <button
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    className="p-2 hover:opacity-70 transition-opacity"
                    style={{ color: headerConfig?.hamburgerIconColor || colorScheme?.text?.default || '#000000' }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                {/* Center section - Logo - keep absolute centering on non-mobile */}
                <Link href="/home" className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center cursor-pointer">
                  {headerConfig?.logo?.desktopUrl ? (
                    <img
                      src={headerConfig.logo.desktopUrl}
                      alt={headerConfig.logo.altText || 'Company Logo'}
                      style={{ 
                        height: headerConfig.logo.height || 40,
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div className="text-xl font-bold" style={{ color: colorScheme?.text?.default || '#000000' }}>
                      Aurora
                    </div>
                  )}
                </Link>

                {/* Right section - Icons */}
                <div className="flex items-center gap-4">
                  {headerConfig.showSearchIcon && (
                    <button className="p-2 hover:opacity-70 transition-opacity">
                      {renderSearchIcon()}
                    </button>
                  )}
                  {headerConfig.showUserIcon && (
                    <button className="p-2 hover:opacity-70 transition-opacity">
                      {renderUserIcon()}
                    </button>
                  )}
                  {/* Wishlist icon - before cart */}
                  {headerConfig.wishlist?.show && headerConfig.wishlist?.position === 'before-cart' && (
                    <button className="p-2 hover:opacity-70 transition-opacity" onClick={() => window.location.href = '/wishlist'}>
                      {renderWishlistIcon()}
                    </button>
                  )}
                  {headerConfig.showCartIcon && (
                    <div className="relative">
                      <button className="p-2 hover:opacity-70 transition-opacity">
                        {renderCartIcon()}
                      </button>
                    </div>
                  )}
                  {/* Wishlist icon - after cart */}
                  {headerConfig.wishlist?.show && headerConfig.wishlist?.position === 'after-cart' && (
                    <button className="p-2 hover:opacity-70 transition-opacity" onClick={() => window.location.href = '/wishlist'}>
                      {renderWishlistIcon()}
                    </button>
                  )}
                  {/* Wishlist icon - after user */}
                  {headerConfig.wishlist?.show && headerConfig.wishlist?.position === 'after-user' && (
                    <button className="p-2 hover:opacity-70 transition-opacity" onClick={() => window.location.href = '/wishlist'}>
                      {renderWishlistIcon()}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Overlay for drawer - contained within editor preview */}
        {drawerOpen && (
          <div 
            className="bg-black bg-opacity-50"
            style={{ 
              position: isEditor ? 'absolute' : 'fixed',
              top: isEditor ? `${headerConfig?.height || 80}px` : `${headerConfig?.height || 80}px`,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40
            }}
            onClick={() => {
              setDrawerOpen(false);
              setActiveDrawerSubmenu(null);
            }}
          />
        )}

        {/* Drawer Menu - Opens from LEFT, contained within editor preview */}
        <div 
          className={`bg-white transition-transform duration-300 ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ 
            position: isEditor ? 'absolute' : 'fixed',
            left: 0,
            top: isEditor ? `${headerConfig?.height || 80}px` : `${headerConfig?.height || 80}px`,  // Position right after the header
            bottom: 0,
            width: isEditor && isMobile ? '100%' : '280px',
            maxWidth: isEditor ? '100%' : '375px',  // In editor, respect container width
            height: isEditor ? 'calc(100% - 80px)' : `calc(100vh - ${headerConfig?.height || 80}px)`,
            backgroundColor: colorScheme?.background || '#ffffff',
            boxShadow: drawerOpen ? '2px 0 10px rgba(0,0,0,0.1)' : 'none',
            zIndex: 50,
            overflow: 'auto'
          }}
        >
          {/* Content wrapper for sliding effect - slides LEFT for submenu */}
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              width: '200%',
              transform: activeDrawerSubmenu ? 'translateX(-50%)' : 'translateX(0)'
            }}
          >
            {/* Main menu panel */}
            <div className="w-1/2 p-4">
              {/* Close button */}
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setActiveDrawerSubmenu(null);
                }}
                className="mb-6"
                style={{ color: colorScheme?.text?.default || '#000000' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Menu Items */}
              <nav className="space-y-2">
                {menuItems.map((item: any) => {
                  const hasChildren = item.subItems && item.subItems.length > 0;
                  const isInternal = isInternalUrl(item.url);
                  
                  // If has children, show as button that can expand submenu
                  if (hasChildren) {
                    return (
                      <div key={item.label} className="relative">
                        {/* Main item - clickable link if has URL */}
                        {item.url && item.url !== '#' ? (
                          isInternal ? (
                            <Link
                              href={item.url}
                              className="w-full flex items-center justify-between px-4 py-3 text-left rounded transition-colors"
                              style={{ 
                                color: colorScheme?.text?.default || '#000000',
                                backgroundColor: 'transparent'
                              }}
                              onClick={() => {
                                setDrawerOpen(false);
                                setActiveDrawerSubmenu(null);
                              }}
                            >
                              <span style={menuTypographyStyles}>{item.label}</span>
                            </Link>
                          ) : (
                            <a
                              href={item.url}
                              className="w-full flex items-center justify-between px-4 py-3 text-left rounded transition-colors"
                              style={{ 
                                color: colorScheme?.text?.default || '#000000',
                                backgroundColor: 'transparent'
                              }}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                setDrawerOpen(false);
                                setActiveDrawerSubmenu(null);
                              }}
                            >
                              <span style={menuTypographyStyles}>{item.label}</span>
                            </a>
                          )
                        ) : (
                          <div
                            className="w-full flex items-center justify-between px-4 py-3 text-left rounded transition-colors"
                            style={{ 
                              color: colorScheme?.text?.default || '#000000',
                              backgroundColor: 'transparent'
                            }}
                          >
                            <span style={menuTypographyStyles}>{item.label}</span>
                          </div>
                        )}
                        
                        {/* Expand button for submenu */}
                        <button
                          onClick={() => setActiveDrawerSubmenu(item.label)}
                          className="absolute right-0 top-0 h-full px-4 flex items-center"
                          style={{ color: colorScheme?.text?.default || '#000000' }}
                        >
                          <svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    );
                  }
                  
                  // No children - simple link
                  return (
                    <div key={item.label}>
                      {isInternal ? (
                        <Link
                          href={item.url || '#'}
                          className="w-full flex items-center px-4 py-3 text-left rounded transition-colors"
                          style={{ 
                            color: colorScheme?.text?.default || '#000000',
                            backgroundColor: 'transparent'
                          }}
                          onClick={() => {
                            setDrawerOpen(false);
                            setActiveDrawerSubmenu(null);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colorScheme?.text?.default ? 
                              `${colorScheme.text.default}10` : 'rgba(0,0,0,0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <span style={menuTypographyStyles}>{item.label}</span>
                        </Link>
                      ) : (
                        <a
                          href={item.url || '#'}
                          className="w-full flex items-center px-4 py-3 text-left rounded transition-colors"
                          style={{ 
                            color: colorScheme?.text?.default || '#000000',
                            backgroundColor: 'transparent'
                          }}
                          target={item.url && !item.url.startsWith('#') ? '_blank' : undefined}
                          rel={item.url && !item.url.startsWith('#') ? 'noopener noreferrer' : undefined}
                          onClick={() => {
                            if (item.url !== '#') {
                              setDrawerOpen(false);
                              setActiveDrawerSubmenu(null);
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colorScheme?.text?.default ? 
                              `${colorScheme.text.default}10` : 'rgba(0,0,0,0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <span style={menuTypographyStyles}>{item.label}</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
            
            {/* Submenu panel */}
            <div className="w-1/2 p-4">
              {/* Back button */}
              <button
                onClick={() => setActiveDrawerSubmenu(null)}
                className="flex items-center gap-2 mb-4 text-sm"
                style={{ color: colorScheme?.text?.default || '#000000' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              
              {/* Submenu Title */}
              {activeDrawerSubmenu && (
                <>
                  <h3 className="font-bold text-lg mb-4 uppercase" style={{ color: colorScheme?.text?.default || '#000000' }}>
                    {activeDrawerSubmenu}
                  </h3>
                  
                  {/* Submenu Items */}
                  <nav className="space-y-2">
                    {menuItems
                      .find((item: any) => item.label === activeDrawerSubmenu)
                      ?.subItems?.map((subItem: any, subIndex: number) => {
                        const isSubInternal = isInternalUrl(subItem.url);
                        return isSubInternal ? (
                          <Link
                            key={subItem.id || `drawer-submenu-${activeDrawerSubmenu}-${subIndex}`}
                            href={subItem.url || '#'}
                            className="block px-4 py-3 rounded transition-colors"
                            style={{ 
                              color: colorScheme?.text?.default || '#000000',
                              ...menuTypographyStyles
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colorScheme?.text?.default ? 
                                `${colorScheme.text.default}10` : 'rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={() => {
                              setDrawerOpen(false);
                              setActiveDrawerSubmenu(null);
                            }}
                          >
                            {subItem.label}
                          </Link>
                        ) : (
                          <a
                            key={subItem.id || `drawer-submenu-${activeDrawerSubmenu}-${subIndex}`}
                            href={subItem.url || '#'}
                            className="block px-4 py-3 rounded transition-colors"
                            style={{ 
                              color: colorScheme?.text?.default || '#000000',
                              ...menuTypographyStyles
                            }}
                            target={subItem.url && !subItem.url.startsWith('#') ? '_blank' : undefined}
                            rel={subItem.url && !subItem.url.startsWith('#') ? 'noopener noreferrer' : undefined}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colorScheme?.text?.default ? 
                                `${colorScheme.text.default}10` : 'rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={() => {
                              if (subItem.url !== '#') {
                                setDrawerOpen(false);
                                setActiveDrawerSubmenu(null);
                              }
                            }}
                          >
                            {subItem.label}
                          </a>
                        );
                      })}
                  </nav>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For all other non-drawer layouts
  return (
    <header className={headerClasses} style={headerStyles}>
      <div className={`${headerConfig.width === 'full' ? 'w-full' : headerConfig.width === 'screen' ? 'w-full' : 'container mx-auto'} px-4`}>
        <div className="flex items-center justify-between" style={{ height: headerStyles.height }}>
          
          {/* For Logo Center Menu Left - Menu comes first */}
          {isLogoCenterMenuLeft && (
            <nav className="flex gap-6">
              {menuItems.map((item: any, index: number) => (
                <React.Fragment key={item.id || `menu-item-685-${index}`}>
                  {renderMenuItem(item)}
                </React.Fragment>
              ))}
            </nav>
          )}
          
          {/* Left section - Logo for most layouts */}
          <div className={`flex items-center ${isLogoCenterMenuLeft ? 'flex-1 justify-center' : (isLogoLeftMenuLeft ? 'gap-8' : '')}`}>
            <Link href="/home" className="cursor-pointer">
              {headerConfig?.logo?.desktopUrl ? (
                <img
                  src={headerConfig.logo.desktopUrl}
                  alt={headerConfig.logo.altText || 'Company Logo'}
                  className="self-center"
                  style={{ 
                    height: isMobile ? (headerConfig.logo.mobileHeight || 30) : (headerConfig.logo.height || 40),
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div className="text-xl font-bold self-center" style={{ color: colorScheme?.text?.default || '#000000' }}>
                  Aurora
                </div>
              )}
            </Link>
            
            {/* Menu for Logo Left Menu Left Inline */}
            {isLogoLeftMenuLeft && (
              <nav className="flex gap-6 ml-8">
                {menuItems.map((item: any, index: number) => (
                  <React.Fragment key={item.id || `menu-item-710-${index}`}>
                    {renderMenuItem(item)}
                  </React.Fragment>
                ))}
              </nav>
            )}
          </div>
          
          {/* Center section - Navigation for logo-left-menu-center */}
          {isLogoLeftMenuCenter && !isLogoLeftMenuLeft && !isLogoCenterMenuLeft && (
            <nav className="flex gap-6">
              {menuItems.map((item: any, index: number) => (
                <React.Fragment key={item.id || `menu-item-718-${index}`}>
                  {renderMenuItem(item)}
                </React.Fragment>
              ))}
            </nav>
          )}
          
          {/* Right section - Icons */}
          <div className="flex items-center gap-4">
            {headerConfig.showSearchIcon && (
              <button className="hover:opacity-70 transition-opacity">
                {renderSearchIcon()}
              </button>
            )}
            {headerConfig.showUserIcon && (
              <button className="hover:opacity-70 transition-opacity">
                {renderUserIcon()}
              </button>
            )}
            {/* Wishlist icon - before cart */}
            {headerConfig.wishlist?.show && headerConfig.wishlist?.position === 'before-cart' && (
              <button className="hover:opacity-70 transition-opacity" onClick={() => window.location.href = '/wishlist'}>
                {renderWishlistIcon()}
              </button>
            )}
            <button className="hover:opacity-70 transition-opacity">
              {renderCartIcon()}
            </button>
            {/* Wishlist icon - after cart */}
            {headerConfig.wishlist?.show && headerConfig.wishlist?.position === 'after-cart' && (
              <button className="hover:opacity-70 transition-opacity" onClick={() => window.location.href = '/wishlist'}>
                {renderWishlistIcon()}
              </button>
            )}
            {/* Wishlist icon - after user */}
            {headerConfig.wishlist?.show && headerConfig.wishlist?.position === 'after-user' && (
              <button className="hover:opacity-70 transition-opacity" onClick={() => window.location.href = '/wishlist'}>
                {renderWishlistIcon()}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
