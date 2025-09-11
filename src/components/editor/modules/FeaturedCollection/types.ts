/**
 * @file types.ts
 * @max-lines 100
 * @module FeaturedCollection
 * @description Tipos para la sección del template FeaturedCollection
 * @template-section true
 */

export interface SelectedItem {
  id: number;
  name: string;
  price?: number;
  originalPrice?: number;
  imageUrl?: string;
  description?: string;
  rating?: number;
  discount?: number;
}

export interface FeaturedCollectionConfig {
  // Basic
  enabled: boolean;
  
  // General Settings
  colorScheme?: string;
  width: 'small' | 'medium' | 'large' | 'page' | 'full';
  desktopLayout: 'grid' | 'carousel' | 'slider';
  mobileLayout?: 'carousel' | 'oneColumn' | 'twoColumn'; // Deprecated - always use oneColumn
  
  // Content
  heading: string;
  headingSize: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8';
  headingAlignment?: 'left' | 'center' | 'right';
  
  // Selection (only one type can have items)
  selectedCollections: number[];
  selectedProducts: number[];
  selectedRooms: number[];
  activeType: 'collections' | 'products' | 'rooms' | null;
  
  // Card Settings
  imageRatio: 'default' | 'landscape' | 'portrait' | 'square';
  contentPosition: 'bottom' | 'top' | 'center';
  contentAlignment?: 'left' | 'center';
  cardsToShow: number;
  cardSize?: number; // 50-150 representing percentage
  desktopColumns: number;
  desktopGap: number;
  mobileGap: number;
  edgeRounding?: number;
  
  // Autoplay
  autoplayMode?: 'none' | 'one-at-a-time' | 'seamless';
  autoplaySpeed?: number;
  
  // Features
  showArrowOnHover: boolean;
  showAddToCart: boolean;
  showBuyButton: boolean;
  showReserveButton: boolean;
  buttonStyle: 'solid' | 'outline';
  addToCartText?: string;
  buyButtonText?: string;
  reserveButtonText?: string;
  colorCardBackground?: boolean;
  showCurrencyCode?: boolean;
  showSaleBadge?: boolean;
  showSaleBadgeNextToPrice?: boolean;
  showSoldOutBadge?: boolean;
  productRating?: string;
  starsColor?: string;
  showVendor?: boolean;
  showColorCount?: boolean;
  desktopButton?: string;
  
  // Collection Card
  collectionCardPosition?: string;
  cardPosition?: string;
  collectionContentPosition?: string;
  collectionContentAlignment?: 'left' | 'center' | 'right';
  collectionTitleSize?: string;
  showProductCount: boolean;
  overlayOpacity: number;
  enableOverlay: boolean;
  
  // Spacing
  topSpacing: number;
  bottomSpacing: number;
  mobileTopSpacing?: number;
  mobileBottomSpacing?: number;
  headingSpacing?: number;
}

export function getDefaultFeaturedCollectionConfig(): FeaturedCollectionConfig {
  return {
    enabled: true,
    colorScheme: '1',
    width: 'page',
    desktopLayout: 'grid',
    mobileLayout: 'oneColumn',
    heading: 'Featured Collection',
    headingSize: 'h2',
    headingAlignment: 'center',
    selectedCollections: [],
    selectedProducts: [],
    selectedRooms: [],
    activeType: null,
    imageRatio: 'default',
    contentPosition: 'bottom',
    contentAlignment: 'center',
    cardsToShow: 3,
    cardSize: 100,
    desktopColumns: 3,
    desktopGap: 24,
    mobileGap: 16,
    edgeRounding: 12,
    autoplayMode: 'none',
    autoplaySpeed: 5,
    showArrowOnHover: true,
    showAddToCart: false,
    showBuyButton: false,
    showReserveButton: true,
    buttonStyle: 'solid',
    colorCardBackground: false,
    showCurrencyCode: true,
    showSaleBadge: true,
    showSaleBadgeNextToPrice: false,
    showSoldOutBadge: true,
    productRating: 'stars-only',
    starsColor: '#fbbf24',
    showVendor: false,
    showColorCount: false,
    desktopButton: 'quick-add',
    collectionCardPosition: 'after-all-items',
    cardPosition: 'after-all-items',
    collectionContentPosition: 'on-image-bottom',
    collectionContentAlignment: 'center',
    collectionTitleSize: 'h6',
    showProductCount: true,
    overlayOpacity: 15,
    enableOverlay: false,
    topSpacing: 40,
    bottomSpacing: 40,
    mobileTopSpacing: 20,
    mobileBottomSpacing: 20,
  };
}