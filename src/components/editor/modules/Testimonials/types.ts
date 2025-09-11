/**
 * @file types.ts
 * @max-lines 150
 * @module Testimonials
 * @description Tipos y configuraciones para Testimonials
 */

export interface TestimonialsConfig {
  // SIEMPRE INCLUIR ESTOS CAMPOS BASE
  enabled: boolean;
  colorScheme: string; // '1' - '5'
  colorBackground: boolean;
  colorTestimonials: boolean;
  width: 'extra_small' | 'screen' | 'page' | 'large' | 'medium' | 'small';
  
  // Layout
  desktopLayout: 'bottom-carousel' | 'left-vertical' | 'right-vertical' | 'bottom-slideshow' | 'bottom-grid';
  mobileLayout: 'slideshow';
  desktopCardsPerRow: number;
  desktopSpaceBetweenCards: number;
  desktopContentAlignment: 'left' | 'center';
  mobileContentAlignment: 'left' | 'center';
  
  // Rating
  showRating: boolean;
  ratingStarsColor: string;
  
  // Content
  subheading?: string;
  heading?: string;
  headingSize: string; // 'heading_1' - 'heading_6'
  body?: string;
  bodySize: string; // 'body_1' - 'body_5'
  linkLabel?: string;
  link?: string;
  
  // Background
  backgroundImage?: string;
  overlayOpacity: number;
  imageSize: number;
  
  // Autoplay
  autoplay: 'none' | 'one-at-a-time' | 'seamless';
  autoplayMode: 'none' | 'one-at-a-time' | 'seamless';
  autoplaySpeed: number;
  
  // Paddings
  addSidePaddings: boolean;
  topPadding: number;
  bottomPadding: number;
  mobileTopPadding?: number;
  mobileBottomPadding?: number;
  
  // Custom CSS
  customCss?: string;
  
  // Items
  items: TestimonialsItemConfig[];
}

export interface TestimonialsItemConfig {
  id: string;
  visible: boolean;
  sortOrder: number;
  rating: number;
  testimonial: string;
  authorAvatar?: string;
  authorName: string;
  authorDetails?: string;
  product?: string;
  image?: string;
  imagePriority?: boolean;
  testimonialLink?: string;
}

export function getDefaultTestimonialsConfig(): TestimonialsConfig {
  return {
    enabled: true,
    colorScheme: '1',
    colorBackground: false,
    colorTestimonials: false,
    width: 'page',
    desktopLayout: 'bottom-carousel',
    mobileLayout: 'slideshow',
    desktopCardsPerRow: 2,
    desktopSpaceBetweenCards: 16,
    desktopContentAlignment: 'left',
    mobileContentAlignment: 'left',
    showRating: true,
    ratingStarsColor: '#FAA613',
    subheading: 'TESTIMONIALS',
    heading: 'Customer stories',
    headingSize: 'heading_3',
    body: 'Show customer reviews: tweets, blog posts, or interviews. Invite customers to share their impressions of your products.',
    bodySize: 'body_3',
    overlayOpacity: 20,
    imageSize: 100,
    autoplay: 'none',
    autoplayMode: 'none',
    autoplaySpeed: 3,
    addSidePaddings: true,
    topPadding: 96,
    bottomPadding: 30,
    mobileTopPadding: 20,
    mobileBottomPadding: 20,
    items: []
  };
}

export function getDefaultTestimonialsItemConfig(): TestimonialsItemConfig {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    visible: true,
    sortOrder: 0,
    rating: 5,
    testimonial: 'Add authentic testimonials of your customers talking about your products or brand in their own words, so that future customers can identify with them and their needs.',
    authorName: 'Author',
    authorDetails: 'Author details'
  };
}