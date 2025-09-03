/**
 * Cart Configuration Module
 * Manages shopping cart display and free shipping settings
 * Part of the modular theme system to avoid monolithic JSON
 */

/**
 * Cart drawer type options (based on Shopify reference)
 */
export type CartDrawerType = 'drawer-and-page' | 'drawer-only' | 'page-only';

/**
 * Free shipping configuration
 */
export interface FreeShippingConfig {
  /** Whether to show the progress bar */
  showProgress: boolean;
  
  /** Threshold amount for free shipping */
  threshold: number;
  
  /** Color of the progress bar */
  progressBarColor: string;
  
  /** Message shown when free shipping is achieved */
  successMessage: string;
  
  /** Message shown for progress (use {amount} as placeholder) */
  progressMessage: string;
}

/**
 * Cart status colors configuration
 */
export interface CartStatusColorsConfig {
  /** Background color for cart status */
  background: string;
  
  /** Text color for cart status */
  text: string;
}

/**
 * Complete cart configuration (matching backend structure)
 */
export interface CartConfig {
  /** How to display the cart */
  drawerType: CartDrawerType;
  
  /** Whether to show sticky cart */
  showStickyCart?: boolean;
  
  /** Cart status colors */
  cartStatusColors?: CartStatusColorsConfig;
  
  /** Free shipping settings */
  freeShipping: FreeShippingConfig;
}

/**
 * Default cart configuration
 * Matching backend defaults
 */
export const defaultCart: CartConfig = {
  drawerType: 'drawer-and-page',
  showStickyCart: false,
  cartStatusColors: {
    background: '#F0FF2E',
    text: '#383933'
  },
  freeShipping: {
    showProgress: true,
    threshold: 0,
    progressBarColor: '#383933',
    successMessage: '¡Envío gratis conseguido!',
    progressMessage: 'Te faltan {amount} para envío gratis'
  }
};

/**
 * Cart drawer type labels for UI
 */
export const CartDrawerTypeLabels: Record<CartDrawerType, string> = {
  'drawer-and-page': 'Drawer and page',
  'drawer-only': 'Drawer only',
  'page-only': 'Page only'
};

/**
 * Calculates free shipping progress
 * @param currentTotal - Current cart total
 * @param threshold - Free shipping threshold
 * @returns Progress percentage (0-100)
 */
export function calculateFreeShippingProgress(
  currentTotal: number,
  threshold: number
): number {
  if (threshold <= 0) return 100;
  if (currentTotal <= 0) return 0;
  
  const progress = (currentTotal / threshold) * 100;
  return Math.min(progress, 100);
}

/**
 * Generates free shipping message
 * @param currentTotal - Current cart total
 * @param threshold - Free shipping threshold
 * @param currencySymbol - Currency symbol to use
 * @returns Appropriate message
 */
export function getFreeShippingMessage(
  currentTotal: number,
  threshold: number,
  currencySymbol: string = '$'
): string {
  const remaining = threshold - currentTotal;
  
  if (remaining <= 0) {
    return '¡Felicitaciones! Tu pedido califica para envío gratis';
  }
  
  return `Agrega ${currencySymbol}${remaining.toFixed(2)} más para envío gratis`;
}

/**
 * Validates cart configuration
 * @param config - Cart configuration to validate
 * @returns true if valid, false otherwise
 */
export function validateCartConfig(config: Partial<CartConfig>): boolean {
  if (config.freeShipping?.threshold !== undefined) {
    if (config.freeShipping.threshold < 0) {
      return false;
    }
  }
  
  if (config.cartStatusColors?.background || config.cartStatusColors?.text) {
    // Validate hex colors
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (config.cartStatusColors.background && !hexRegex.test(config.cartStatusColors.background)) {
      return false;
    }
    if (config.cartStatusColors.text && !hexRegex.test(config.cartStatusColors.text)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Merges partial cart configuration with defaults
 * @param partial - Partial configuration to merge
 * @returns Complete cart configuration
 */
export function mergeCartWithDefaults(partial: Partial<CartConfig>): CartConfig {
  return {
    drawerType: partial.drawerType || defaultCart.drawerType,
    showStickyCart: partial.showStickyCart ?? defaultCart.showStickyCart,
    cartStatusColors: {
      ...defaultCart.cartStatusColors,
      ...(partial.cartStatusColors || {})
    } as CartStatusColorsConfig,
    freeShipping: {
      ...defaultCart.freeShipping,
      ...partial.freeShipping
    }
  };
}