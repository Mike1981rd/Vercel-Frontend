/**
 * Product Cards Configuration Module
 * Manages display settings for product cards in the e-commerce system
 * Part of the modular theme system to avoid monolithic JSON
 */

/**
 * Image aspect ratio options (simplified to 3 options)
 */
export type ImageRatio =
  | 'default' // Square 1:1
  | 'portrait' // Portrait 3:4
  | 'landscape'; // Landscape 4:3

/**
 * Product rating display options (6 different styles)
 */
export type ProductRating =
  | 'average-and-stars'
  | 'none'
  | 'stars-only'
  | 'reviews-count-only'
  | 'average-only'
  | 'reviews-and-stars';

/**
 * Price label size options
 */
export type PriceLabelSize = 'extra-small' | 'small' | 'medium' | 'large';

/**
 * Hover effect options for product cards
 */
export type HoverEffect = 'none' | 'zoom' | 'show-all-media' | 'show-second-media';

/**
 * Desktop display style for buttons
 */
export type ButtonStyle = 'labels' | 'icons';

/**
 * Position options for swatches on desktop and mobile
 */
export type SwatchPosition = 'on-image' | 'below-image' | 'above-title';

/**
 * What type of swatches to display
 */
export type SwatchDisplayType = 'color-swatches' | 'variant-images' | 'both';

/**
 * Complete product cards configuration
 */
export interface ProductCardsConfig {
  /** Image display settings */
  image: {
    defaultRatio: ImageRatio;
  };
  
  /** Card size settings */
  cardSize?: {
    scale: number; // 0 to 2.0 (0% to 200%)
  };
  
  /** Card style settings */
  cardStyle?: {
    borderRadius: number; // 0 to 50 (px)
  };
  
  /** Visibility settings for various elements */
  visibility: {
    showVendor: boolean;
    showCurrencyCode: boolean;
    showColorCount: boolean;
    colorizeCardBackground: boolean;
    darkenImageBackground: boolean;
  };
  
  /** Product rating display settings */
  rating: {
    productRating: ProductRating;
  };
  
  /** Price display settings */
  price: {
    labelSize: PriceLabelSize;
  };
  
  /** Hover effects configuration */
  effects: {
    hoverEffect: HoverEffect;
  };
  
  /** Swatches/variants display settings */
  swatches: {
    whatToShow: SwatchDisplayType;
    desktopPosition: SwatchPosition;
    mobilePosition: SwatchPosition;
    hideForSingleColor: boolean;
  };
  
  /** Action buttons configuration */
  buttons: {
    quickBuy: boolean;
    showQuickView: boolean;
    showAddToCart: boolean;
    desktopStyle: ButtonStyle;
    showOnHover: boolean;
  };
}

/**
 * Default product cards configuration
 */
export const defaultProductCards: ProductCardsConfig = {
  image: {
    defaultRatio: 'default'
  },
  cardSize: {
    scale: 1.0
  },
  cardStyle: {
    borderRadius: 8
  },
  visibility: {
    showVendor: false,
    showCurrencyCode: true,
    showColorCount: true,
    colorizeCardBackground: true,
    darkenImageBackground: true
  },
  rating: {
    productRating: 'average-and-stars'
  },
  price: {
    labelSize: 'large'
  },
  effects: {
    hoverEffect: 'none'
  },
  swatches: {
    whatToShow: 'color-swatches',
    desktopPosition: 'below-image',
    mobilePosition: 'below-image',
    hideForSingleColor: true
  },
  buttons: {
    quickBuy: false,
    showQuickView: false,
    showAddToCart: false,
    desktopStyle: 'labels',
    showOnHover: true
  }
};

/**
 * Human-readable labels for image ratios
 */
export const ImageRatioLabels: Record<ImageRatio, string> = {
  'default': 'Default (Square)',
  'portrait': 'Portrait',
  'landscape': 'Landscape'
};

/**
 * Human-readable labels for rating options
 */
export const RatingLabels: Record<ProductRating, string> = {
  'average-and-stars': 'Promedio y estrellas',
  'none': 'No mostrar',
  'stars-only': 'Solo estrellas',
  'reviews-count-only': 'Solo contador de reseñas',
  'average-only': 'Solo promedio',
  'reviews-and-stars': 'Reseñas y estrellas'
};

/**
 * Calculates aspect ratio for CSS
 * @param ratio - Image ratio type
 * @returns CSS aspect ratio value
 */
export function getAspectRatio(ratio: ImageRatio): string {
  const ratioMap: Record<ImageRatio, string> = {
    'default': '1 / 1',
    'portrait': '3 / 4',
    'landscape': '4 / 3'
  };
  
  return ratioMap[ratio] || '1 / 1';
}

/**
 * Determines object-fit CSS property based on ratio
 * @param ratio - Image ratio type
 * @returns CSS object-fit value
 */
export function getObjectFit(ratio: ImageRatio): 'cover' | 'contain' {
  return 'cover'; // Always use cover for better appearance
}