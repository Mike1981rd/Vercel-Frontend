'use client';

import React, { Fragment } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { Section, SectionType, PageType } from '@/types/editor.types';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useColorSchemes } from '@/hooks/useColorSchemes';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { useNavigationMenus } from '@/hooks/useNavigationMenus';
import useThemeConfigStore from '@/stores/useThemeConfigStore';

// Import preview components to avoid duplication
import PreviewHeader from '@/components/preview/PreviewHeader';
import PreviewAnnouncementBar from '@/components/preview/PreviewAnnouncementBar';
import PreviewFooter from '@/components/preview/PreviewFooter';
import PreviewSlideshow from '@/components/preview/PreviewSlideshow';
import PreviewMulticolumns from '@/components/preview/PreviewMulticolumns';
import PreviewGallery from '@/components/preview/PreviewGallery';
import PreviewImageWithText from './modules/ImageWithText/PreviewImageWithText';
import PreviewFeaturedCollection from '@/components/preview/PreviewFeaturedCollection';
import PreviewFAQ from '@/components/preview/PreviewFAQ';
import PreviewTestimonials from '@/components/preview/PreviewTestimonials';
import PreviewRichText from '@/components/preview/PreviewRichText';
import PreviewNewsletter from '@/components/preview/PreviewNewsletter';
import PreviewContactForm from '@/components/preview/PreviewContactForm';
import PreviewRoomsPage from '@/components/preview/PreviewRoomsPage';
import PreviewRoomGallery from '@/components/preview/PreviewRoomGallery';
import PreviewRoomTitleHost from '@/components/preview/PreviewRoomTitleHost';
import PreviewRoomHighlights from '@/components/preview/PreviewRoomHighlights';
import PreviewRoomDescription from '@/components/preview/PreviewRoomDescription';
import PreviewRoomAmenities from '@/components/preview/PreviewRoomAmenities';
import PreviewRoomSleeping from '@/components/preview/PreviewRoomSleeping';
import PreviewRoomReviews from '@/components/preview/PreviewRoomReviews';
import PreviewRoomMap from '@/components/preview/PreviewRoomMap';
import PreviewRoomCalendar from '@/components/preview/PreviewRoomCalendar';
import PreviewRoomHostCard from '@/components/preview/PreviewRoomHostCard';
import PreviewRoomThings from '@/components/preview/modules/RoomThingsPreview';

type DeviceView = 'desktop' | 'mobile';

interface EditorPreviewProps {
  deviceView?: 'desktop' | 'mobile';
}

// CSS for animations
const animationStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideInFromBottom {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes typewriter {
    from {
      width: 0;
      opacity: 0;
    }
    to {
      width: 100%;
      opacity: 1;
    }
  }
  
  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-33%);  /* Ajustado para loop más compacto */
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  .animate-slideInFromRight {
    animation: slideInFromRight 0.5s ease-out;
  }
  
  .animate-slideInFromBottom {
    animation: slideInFromBottom 0.4s ease-out;
  }
  
  .animate-typewriter {
    animation: typewriter 0.8s steps(30, end);
    overflow: hidden;
    white-space: nowrap;
  }
  
  .marquee-container {
    overflow: hidden;
    width: 100%;
    position: relative;
  }
  
  .marquee-content {
    display: inline-flex;
    animation: marquee 20s linear infinite;
    white-space: nowrap;
  }
`;

export function EditorPreview({ deviceView = 'desktop' }: EditorPreviewProps) {
  const { sections, selectedSectionId, selectSection, hoveredSectionId, setHoveredSection, selectedPageType } = useEditorStore();
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const { colorSchemes } = useColorSchemes();
  const { config: structuralComponents } = useStructuralComponents();
  const { menus } = useNavigationMenus();
  const { config: themeConfig } = useThemeConfigStore();
  
  // Close dropdown when clicking outside (only for click mode)
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only close if clicking outside of navigation area
      if (!target.closest('nav') && !target.closest('.dropdown-menu')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);



  // Separate sections by group for proper layout
  const headerSections = sections.headerGroup.filter(s => s.visible);
  const templateSections = sections.template.filter(s => s.visible);
  const footerSections = sections.footerGroup.filter(s => s.visible);
  const asideSections = sections.asideGroup.filter(s => s.visible);

  const getPreviewWidth = () => {
    switch (deviceView) {
      case 'mobile':
        return 'w-[375px]';
      default:
        return 'w-full';
    }
  };

  // Social media icons for announcement bar
  const socialIcons: { [key: string]: JSX.Element } = {
    instagram: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
      </svg>
    ),
    facebook: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    youtube: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    pinterest: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
      </svg>
    ),
    tiktok: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    linkedin: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    whatsapp: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    )
  };

  // Outline versions of social media icons
  const socialIconsOutline: { [key: string]: JSX.Element } = {
    instagram: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
    facebook: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
      </svg>
    ),
    twitter: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
      </svg>
    ),
    youtube: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
      </svg>
    ),
    pinterest: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 11.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 2.12-1.5 3.9-3.5 4.36-.25-.5-.5-1.29-.5-1.86 0 0 1-4 1-4a2 2 0 0 0-2-2c-1.1 0-2 .9-2 2 0 .67.25 1.25.25 1.25s-1 4.25-1.17 5c-.35 1.5 0 3.33.03 3.5"></path>
      </svg>
    ),
    tiktok: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 12a4 4 0 1 0 4-4v8.5a2.5 2.5 0 1 1-2.5-2.5"></path>
        <path d="M13 8V3.5A3.5 3.5 0 0 0 16.5 7a6.5 6.5 0 0 0 4 1.5"></path>
      </svg>
    ),
    linkedin: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
    ),
    whatsapp: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
    )
  };

  const renderSocialIcon = (platform: string, style: string = 'solid') => {
    // Normalize platform name to lowercase for matching
    const normalizedPlatform = platform.toLowerCase();
    const icons = style === 'outline' ? socialIconsOutline : socialIcons;
    return icons[normalizedPlatform] || icons[platform] || (
      <div className="w-4 h-4 rounded-full bg-current opacity-60"></div>
    );
  };

  const getAnnouncementAnimationClass = (animationStyle: string | undefined) => {
    if (!animationStyle || animationStyle === 'no-animation') return '';
    
    switch (animationStyle) {
      case 'fade':
        return 'animate-fadeIn';
      case 'slide-horizontal':
        return 'animate-slideInFromRight';
      case 'slide-vertical':
        return 'animate-slideInFromBottom';
      case 'typewriter':
        return 'animate-typewriter';
      case 'infinite-marquee':
        return ''; // Marquee has its own special structure, no class needed here
      default:
        return '';
    }
  };

  const renderAnnouncementIcon = (iconValue: string) => {
    // Map of icon values to their corresponding Lucide components
    const iconMap: { [key: string]: any } = {
      // General
      'Settings': Icons.Settings,
      'Search': Icons.Search,
      'Eye': Icons.Eye,
      'EyeOff': Icons.EyeOff,
      'User': Icons.User,
      'HeartOutline': Icons.Heart,
      'HeartSolid': Icons.Heart,
      'ThumbsUp': Icons.ThumbsUp,
      'ThumbsDown': Icons.ThumbsDown,
      'Lightbulb': Icons.Lightbulb,
      'StarOutline': Icons.Star,
      'StarSolid': Icons.Star,
      'Trash2': Icons.Trash2,
      'FileText': Icons.FileText,
      'Copy': Icons.Copy,
      'Share2': Icons.Share2,
      'Plus': Icons.Plus,
      'Minus': Icons.Minus,
      'Check': Icons.Check,
      'ArrowRight': Icons.ArrowRight,
      'ArrowLeft': Icons.ArrowLeft,
      'Undo': Icons.Undo,
      'Redo': Icons.Redo,
      'RefreshCw': Icons.RefreshCw,
      'Bell': Icons.Bell,
      'Clock': Icons.Clock,
      'Calendar': Icons.Calendar,
      'Info': Icons.Info,
      // Shop
      'ShoppingBag': Icons.ShoppingBag,
      'ShoppingCart': Icons.ShoppingCart,
      'Barcode': Icons.Barcode,
      'Coupon': Icons.Tag,
      'Gift': Icons.Gift,
      'TrendingDown': Icons.TrendingDown,
      'Percent': Icons.Percent,
      'Award': Icons.Award,
      'Pen': Icons.Pen,
      'Palette': Icons.Palette,
      'Car': Icons.Truck,
      'Coffee': Icons.Coffee,
      'Cake': Icons.Coffee,
      'Anchor': Icons.Anchor,
      'TShirt': Icons.Shirt,
      'Dress': Icons.Shirt,
      'Gem': Icons.Circle,
      'Home': Icons.Home,
      'Play': Icons.Play,
      // Shipping
      'Package': Icons.Package,
      'MapPin': Icons.MapPin,
      'FastDelivery': Icons.Truck,
      'DeliveryTruck': Icons.Truck,
      'RotateCcw': Icons.RotateCcw,
      'Globe': Icons.Globe,
      'Plane': Icons.Send,
      'SearchOrder': Icons.Search,
      'Briefcase': Icons.Briefcase,
      'Archive': Icons.Archive,
      'Navigation': Icons.Navigation,
      // Payment
      'CreditCard': Icons.CreditCard,
      'Lock': Icons.Lock,
      'Shield': Icons.Shield,
      'SecurePayment': Icons.Lock,
      'Wallet': Icons.CreditCard,
      'DollarSign': Icons.DollarSign,
      'Receipt': Icons.FileText,
      'Tag': Icons.Tag,
      'List': Icons.List,
      'Scan': Icons.Maximize,
      // Communication
      'Phone': Icons.Phone,
      'MessageCircle': Icons.MessageCircle,
      'MessageSquare': Icons.MessageSquare,
      'Mail': Icons.Mail,
      'HelpCircle': Icons.HelpCircle,
      'Printer': Icons.Printer,
      'Smartphone': Icons.Smartphone,
      // Ecology
      'Bug': Icons.Bug,
      'Mask': Icons.Shield,
      'Leaf': Icons.Feather,
      'GitBranch': Icons.GitBranch,
      // Social
      'Twitter': Icons.Twitter,
      'Facebook': Icons.Facebook,
      'Pinterest': Icons.Share2,
      'Instagram': Icons.Instagram,
      'TikTok': Icons.Music,
      'Tumblr': Icons.Circle,
      'Snapchat': Icons.Camera,
      'Youtube': Icons.Youtube,
      'Vimeo': Icons.Video,
      'Linkedin': Icons.Linkedin,
      'Flickr': Icons.Image,
      'Reddit': Icons.Hash,
      'EmailSocial': Icons.Mail,
      'Behance': Icons.Circle,
      'Discord': Icons.MessageCircle,
      'Dribbble': Icons.Dribbble,
      'Medium': Icons.Edit3,
      'Twitch': Icons.Twitch,
      'WhatsApp': Icons.MessageSquare,
      'Viber': Icons.Headphones,
      'Telegram': Icons.Send
    };

    const IconComponent = iconMap[iconValue];
    if (IconComponent) {
      return <IconComponent className="w-5 h-5" />;
    }
    return null;
  };

  const renderSectionPreview = (section: Section) => {
    const isSelected = selectedSectionId === section.id;
    const isHovered = hoveredSectionId === section.id;
    
    // Define schemeToUse outside switch for drawer access
    let schemeToUse: any = null;
    let headerConfig: any = null;
    let isDrawerLayout = false;
    let menuItems: any[] = [];
    let selectedMenuId: number | undefined = undefined;
    
    // Typography styles for menu items
    const menuTypographyStyles = themeConfig?.typography?.menu ? {
      fontFamily: `'${themeConfig.typography.menu.fontFamily}', sans-serif`,
      fontWeight: themeConfig.typography.menu.fontWeight || '400',
      textTransform: themeConfig.typography.menu.useUppercase ? 'uppercase' as const : 'none' as const,
      fontSize: themeConfig.typography.menu.fontSize ? 
        (themeConfig.typography.menu.fontSize <= 100 ? 
          `${themeConfig.typography.menu.fontSize}%` : 
          `${themeConfig.typography.menu.fontSize}px`) : '94%',
      letterSpacing: `${themeConfig.typography.menu.letterSpacing || 0}px`
    } : {};
    
    // Calculate header-specific values if this is a header section
    if (section.type === SectionType.HEADER) {
      headerConfig = section.settings as any || structuralComponents?.header;
      const selectedSchemeIndex = headerConfig?.colorScheme ? parseInt(headerConfig.colorScheme) - 1 : 0;
      const activeScheme = colorSchemes?.schemes?.[selectedSchemeIndex];
      const fallbackScheme = colorSchemes?.schemes?.[0];
      schemeToUse = activeScheme || fallbackScheme;
      // IMPORTANT: In mobile view, ALWAYS use drawer layout (like Shopify)
      isDrawerLayout = headerConfig?.layout === 'drawer' || deviceView === 'mobile';
      
      // Get menu items
      selectedMenuId = headerConfig?.menuId;
      const selectedMenu = menus?.find(m => m.id === selectedMenuId);
      menuItems = selectedMenu?.items || [];
    }

    switch (section.type as any) {
      case SectionType.ANNOUNCEMENT_BAR:
        const announcementConfig = structuralComponents?.announcementBar || section.settings;
        
        // Use the PreviewAnnouncementBar component
        return (
          <PreviewAnnouncementBar
            config={announcementConfig}
            theme={themeConfig ?? null}
            pageType={selectedPageType as string}
            deviceView={deviceView}
            isEditor={true}
          />
        );

      case SectionType.HEADER:
        // Use the PreviewHeader component
        return (
          <PreviewHeader
            config={headerConfig || structuralComponents?.header}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case SectionType.FOOTER:
        // Use the PreviewFooter component with default config
        const footerConfig = structuralComponents?.footer || section.settings || { enabled: true };
        // Debug: log the blocks to verify they're updating
        console.log('[EditorPreview] Footer blocks order:', footerConfig?.blocks?.map((b: any, i: number) => `${i+1}. ${b.title || b.type} (${b.id})`).join(', ') || 'No blocks');
        // Create a key based on block order to force re-render when order changes
        const footerKey = footerConfig?.blocks?.map((b: any) => b.id).join('-') || 'default';
        return (
          <PreviewFooter
            key={`footer-${footerKey}`}
            config={footerConfig}
            theme={themeConfig || undefined}
            deviceView={deviceView as 'desktop' | 'mobile'}
            isEditor={true}
          />
        );
      case SectionType.IMAGE_BANNER:
        const PreviewImageBanner = require('@/components/preview/PreviewImageBanner').default;
        return (
          <PreviewImageBanner
            config={section.settings}
            isEditor={true}
            deviceView={deviceView}
            pageType={selectedPageType as string}
          />
        );

      case SectionType.FOOTER:
        return (
          <div className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-8">
              <div className="grid grid-cols-4 gap-8">
                <div>
                  <h3 className="font-semibold mb-3">Company</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>About</li>
                    <li>Careers</li>
                    <li>Press</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Products</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>Features</li>
                    <li>Pricing</li>
                    <li>Security</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Support</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>Help Center</li>
                    <li>Contact</li>
                    <li>Status</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Legal</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>Privacy</li>
                    <li>Terms</li>
                    <li>Cookie Policy</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
                © 2025 Your Company. All rights reserved.
              </div>
            </div>
          </div>
        );

      case SectionType.SLIDESHOW:
        return (
          <PreviewSlideshow
            settings={section.settings as any}
            isEditor={true}
            theme={themeConfig || undefined}
            deviceView={deviceView as 'desktop' | 'mobile'}
          />
        );

      case SectionType.MULTICOLUMNS:
        return (
          <PreviewMulticolumns
            config={section.settings as any}
            isEditor={true}
            theme={themeConfig || undefined}
            deviceView={deviceView as 'desktop' | 'mobile'}
          />
        );
      
      case SectionType.GALLERY:
        return (
          <PreviewGallery
            config={section.settings as any}
            isEditor={true}
            theme={themeConfig || undefined}
            deviceView={deviceView as 'desktop' | 'mobile'}
          />
        );
      
      case SectionType.IMAGE_WITH_TEXT:
        return (
          <PreviewImageWithText
            config={section.settings as any}
            isEditor={true}
          />
        );

      case SectionType.FEATURED_COLLECTION:
        return (
          <PreviewFeaturedCollection
            config={section.settings}
            theme={themeConfig || undefined}
            deviceView={deviceView as 'desktop' | 'mobile'}
            isEditor={true}
          />
        );

      case SectionType.FAQ:
        // Ensure config has items array
        const faqConfig = section.settings || {};
        if (!faqConfig.items) {
          faqConfig.items = [];
        }
        return (
          <PreviewFAQ
            config={faqConfig as any}
            theme={themeConfig || undefined}
            deviceView={deviceView as 'desktop' | 'mobile'}
            isEditor={true}
          />
        );

      case SectionType.TESTIMONIALS:
        const testimonialsConfig = section.settings || {};
        if (!testimonialsConfig.items) {
          testimonialsConfig.items = [];
        }
        return (
          <PreviewTestimonials
            config={testimonialsConfig as any}
            theme={themeConfig || undefined}
            deviceView={deviceView as 'desktop' | 'mobile'}
            isEditor={true}
          />
        );

      case SectionType.RICH_TEXT:
        const richTextConfig = section.settings || {
          colorScheme: '1',
          colorBackground: false,
          width: 'page',
          contentAlignment: 'center',
          paddingTop: 64,
          paddingBottom: 64,
          customCSS: '',
          blocks: []
        };
        return (
          <PreviewRichText
            config={richTextConfig as any}
            deviceView={deviceView}
            isEditor={true}
          />
        );

      case SectionType.CONTACT_FORM:
        return (
          <PreviewContactForm
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case 'room_gallery':
        return (
          <PreviewRoomGallery
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case 'room_title_host':
        return (
          <PreviewRoomTitleHost
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case 'room_highlights':
        return (
          <PreviewRoomHighlights
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case 'room_description':
        return (
          <PreviewRoomDescription
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case 'room_amenities':
        return (
          <PreviewRoomAmenities
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case 'room_sleeping':
        return (
          <PreviewRoomSleeping
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case 'room_reviews':
        return (
          <PreviewRoomReviews
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case 'room_map':
        return (
          <PreviewRoomMap
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case 'room_calendar':
        return (
          <PreviewRoomCalendar
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case 'room_host_card':
        return (
          <PreviewRoomHostCard
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case 'room_things':
        return (
          <PreviewRoomThings
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );
      case SectionType.NEWSLETTER:
        return (
          <PreviewNewsletter
            config={section.settings as any}
            theme={themeConfig || undefined}
            deviceView={deviceView}
            isEditor={true}
          />
        );

      default:
        return (
          <div className="py-12 px-4 bg-gray-50 dark:bg-gray-800">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">{section.name}</div>
              <div className="text-sm">Preview coming soon...</div>
            </div>
          </div>
        );
    }
  };

  const renderSection = (section: Section) => {
    // All sections are rendered the same way now
    return (
      <div
        key={section.id}
        className={`
          relative group cursor-pointer transition-all
          ${selectedSectionId === section.id ? 'outline outline-2 outline-blue-500 outline-offset-2' : ''}
          ${hoveredSectionId === section.id && selectedSectionId !== section.id ? 'outline outline-2 outline-blue-300 outline-offset-2' : ''}
        `}
        onClick={() => selectSection(section.id)}
        onMouseEnter={() => setHoveredSection(section.id)}
        onMouseLeave={() => setHoveredSection(null)}
      >
        {renderSectionPreview(section)}
        
        {/* Section Label on Hover */}
        {(hoveredSectionId === section.id || selectedSectionId === section.id) && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            {section.name}
          </div>
        )}
      </div>
    );
  };

  const hasContent = headerSections.length > 0 || templateSections.length > 0 || footerSections.length > 0;

  return (
    <>
      {/* Inject animation styles */}
      <style jsx>{animationStyles}</style>
      <div className="flex-1 bg-white h-full flex flex-col">
      {/* Preview Area */}
      <div className="flex-1 overflow-y-auto flex justify-center bg-gray-100">
        <div className={`bg-white ${getPreviewWidth()} min-h-full shadow-lg flex flex-col relative`}>
          {!hasContent ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
              <div className="text-center">
                <div className="text-lg mb-2">No hay secciones visibles</div>
                <div className="text-sm">Las secciones estructurales están configuradas pero ocultas</div>
              </div>
            </div>
          ) : (
            <>
              {/* Header sections at the top */}
              <div className="flex-shrink-0">
                {headerSections.map(renderSection)}
              </div>

              {/* Main content area */}
              <div className="flex-grow">
                {templateSections.length === 0 ? (
                  <div className="h-[400px] flex items-center justify-center text-gray-400 bg-gray-50">
                    <div className="text-center">
                      <div className="text-lg mb-2">Área de contenido vacía</div>
                      <div className="text-sm">Agrega secciones de contenido desde la barra lateral</div>
                    </div>
                  </div>
                ) : (
                  templateSections.map(renderSection)
                )}
              </div>

              {/* Footer sections at the bottom */}
              <div className="flex-shrink-0">
                {footerSections.map(renderSection)}
              </div>
            </>
          )}

          {/* Aside sections like cart drawer would be rendered as overlays */}
          {asideSections.map(section => (
            <div key={section.id} className="hidden">
              {/* Cart drawer and search drawer are hidden by default, shown on interaction */}
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
