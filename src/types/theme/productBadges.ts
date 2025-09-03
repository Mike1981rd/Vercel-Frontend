/**
 * Product Badges Configuration Module
 * Manages display settings for various product badges (sale, sold out, custom)
 * Part of the modular theme system to avoid monolithic JSON
 */

/**
 * Badge display format options
 */
export type BadgeDisplayAs = 
  | 'sale'           // Simple "Sale" text
  | 'percentage'     // -10%
  | 'save-percentage' // Save 10%
  | 'amount'         // -$10
  | 'save-amount';   // Save $10

/**
 * Badge position on desktop
 */
export type BadgePosition = 'below-image' | 'on-image' | 'above-title';

/**
 * Individual badge configuration
 */
export interface BadgeConfig {
  /** Whether this badge is enabled */
  enabled: boolean;
  
  /** Background color (hex format) */
  background: string;
  
  /** Text color (hex format) */
  text: string;
  
  /** How to display the badge (for sale badges) */
  displayAs?: BadgeDisplayAs;
  
  /** Custom text content for the badge */
  textContent?: string;
  
  /** Label for the badge in settings */
  label?: string;
  
  /** Product tag for custom badges */
  tag?: string;
}

/**
 * Sale highlight configuration
 */
export interface SaleHighlightConfig {
  /** Whether sale highlight is enabled */
  enabled: boolean;
  
  /** Text color for sale price */
  textColor: string;
}

/**
 * Complete product badges configuration
 * Includes 7 different badge types
 */
export interface ProductBadgesConfig {
  /** Position settings for badges */
  position: {
    desktop: BadgePosition;
  };
  
  /** Sold out badge configuration */
  soldOut: BadgeConfig;
  
  /** General sale badge */
  sale: BadgeConfig;
  
  /** Sale by price badge */
  saleByPrice: BadgeConfig;
  
  /** Sale price highlight */
  saleHighlight: SaleHighlightConfig;
  
  /** Custom badge 1 (e.g., "Best seller") */
  custom1: BadgeConfig;
  
  /** Custom badge 2 */
  custom2: BadgeConfig;
  
  /** Custom badge 3 */
  custom3: BadgeConfig;
}

/**
 * Default product badges configuration
 * Based on specifications from prompt.pdf
 */
export const defaultProductBadges: ProductBadgesConfig = {
  position: {
    desktop: 'below-image'
  },
  soldOut: {
    enabled: true,
    background: '#FFFFFF',
    text: '#000000'
  },
  sale: {
    enabled: true,
    background: '#FF0000',
    text: '#FFFFFF',
    displayAs: 'sale'
  },
  saleByPrice: {
    enabled: false,
    background: '#000000',
    text: '#FFFFFF',
    displayAs: 'percentage'
  },
  saleHighlight: {
    enabled: false,
    textColor: '#000000'
  },
  custom1: {
    enabled: false,
    background: '#FFFFFF',
    text: '#FFFFFF',
    textContent: 'Best seller',
    label: 'Best Sellers'
  },
  custom2: {
    enabled: false,
    background: '#FFFFFF',
    text: '#FFFFFF',
    textContent: '',
    label: 'Custom Badge 2'
  },
  custom3: {
    enabled: true,
    background: '#FFFFFF',
    text: '#FFFFFF',
    textContent: '',
    label: 'Custom Badge 3'
  }
};

/**
 * Badge type enumeration for internal use
 */
export enum BadgeType {
  SoldOut = 'soldOut',
  Sale = 'sale',
  SaleByPrice = 'saleByPrice',
  Custom1 = 'custom1',
  Custom2 = 'custom2',
  Custom3 = 'custom3'
}

/**
 * Default badge texts
 */
export const DefaultBadgeTexts = {
  soldOut: 'Agotado',
  sale: 'Oferta',
  saleByPrice: 'Ahorra',
  custom1: 'Best Seller',
  custom2: 'Nuevo',
  custom3: 'Limitado'
} as const;

/**
 * Calculates sale percentage
 * @param originalPrice - Original price
 * @param salePrice - Sale price
 * @returns Percentage saved
 */
export function calculateSalePercentage(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice < 0) return 0;
  const discount = originalPrice - salePrice;
  return Math.round((discount / originalPrice) * 100);
}

/**
 * Formats badge text based on display type
 * @param displayAs - How to display the badge
 * @param originalPrice - Original price
 * @param salePrice - Sale price
 * @param currencySymbol - Currency symbol to use
 * @returns Formatted badge text
 */
export function formatBadgeText(
  displayAs: BadgeDisplayAs,
  originalPrice: number,
  salePrice: number,
  currencySymbol: string = '$'
): string {
  const percentage = calculateSalePercentage(originalPrice, salePrice);
  const saved = originalPrice - salePrice;
  
  switch (displayAs) {
    case 'sale':
      return 'Sale';
    
    case 'percentage':
      return `-${percentage}%`;
    
    case 'save-percentage':
      return `Save ${percentage}%`;
    
    case 'amount':
      return `-${currencySymbol}${saved.toFixed(0)}`;
    
    case 'save-amount':
      return `Save ${currencySymbol}${saved.toFixed(0)}`;
    
    default:
      return 'Sale';
  }
}

/**
 * Determines if a badge should be shown
 * @param badge - Badge configuration
 * @param productState - Product state (has sale, is sold out, etc.)
 * @returns Whether to show the badge
 */
export function shouldShowBadge(
  badge: BadgeConfig,
  productState: {
    isSoldOut?: boolean;
    hasSale?: boolean;
    originalPrice?: number;
    salePrice?: number;
  }
): boolean {
  if (!badge.enabled) return false;
  
  // Additional logic based on product state
  if (productState.isSoldOut && badge === defaultProductBadges.soldOut) {
    return true;
  }
  
  if (productState.hasSale && (badge === defaultProductBadges.sale || 
      badge === defaultProductBadges.saleByPrice)) {
    return productState.originalPrice !== undefined && 
           productState.salePrice !== undefined &&
           productState.originalPrice > productState.salePrice;
  }
  
  // Custom badges show if enabled and have content
  return badge.enabled && !!badge.textContent;
}