/**
 * Cart Drawer Component Configuration
 * Side panel or page for shopping cart
 */

/**
 * Cart display type
 */
export type CartDisplayType = 'drawer' | 'page' | 'modal';

/**
 * Drawer position
 */
export type DrawerPosition = 'left' | 'right';

/**
 * Free shipping progress bar configuration
 */
export interface FreeShippingBarConfig {
  /** Show free shipping progress bar */
  enabled: boolean;
  
  /** Threshold amount for free shipping */
  threshold: number;
  
  /** Message when below threshold */
  messageBelowThreshold: string;
  
  /** Message when threshold reached */
  messageThresholdReached: string;
  
  /** Show progress bar */
  showProgressBar: boolean;
  
  /** Progress bar color */
  progressBarColor: string;
  
  /** Progress bar background color */
  progressBarBackgroundColor: string;
  
  /** Progress bar height in pixels */
  progressBarHeight: number;
}

/**
 * Cart item display configuration
 */
export interface CartItemConfig {
  /** Show product image */
  showImage: boolean;
  
  /** Image size in pixels */
  imageSize: number;
  
  /** Show product vendor */
  showVendor: boolean;
  
  /** Show product SKU */
  showSku: boolean;
  
  /** Show variant options */
  showVariants: boolean;
  
  /** Show remove button */
  showRemoveButton: boolean;
  
  /** Enable quantity selector */
  enableQuantitySelector: boolean;
  
  /** Show price per item */
  showPricePerItem: boolean;
  
  /** Show line total */
  showLineTotal: boolean;
  
  /** Show discount labels */
  showDiscounts: boolean;
}

/**
 * Cart notes configuration
 */
export interface CartNotesConfig {
  /** Enable order notes */
  enabled: boolean;
  
  /** Notes label */
  label: string;
  
  /** Placeholder text */
  placeholder: string;
  
  /** Max characters */
  maxLength: number;
  
  /** Required field */
  required: boolean;
}

/**
 * Upsell/Cross-sell configuration
 */
export interface UpsellConfig {
  /** Enable upsell section */
  enabled: boolean;
  
  /** Section title */
  title: string;
  
  /** Product selection method */
  method: 'manual' | 'related' | 'bestsellers' | 'recently-viewed';
  
  /** Manual product IDs (if method is 'manual') */
  productIds?: string[];
  
  /** Max products to show */
  maxProducts: number;
  
  /** Layout */
  layout: 'carousel' | 'grid';
}

/**
 * Cart buttons configuration
 */
export interface CartButtonsConfig {
  /** Show continue shopping button */
  showContinueShopping: boolean;
  
  /** Continue shopping button text */
  continueShoppingText: string;
  
  /** Continue shopping action */
  continueShoppingAction: 'close' | 'back' | 'home' | 'collections';
  
  /** Checkout button text */
  checkoutButtonText: string;
  
  /** Checkout button style */
  checkoutButtonStyle: 'solid' | 'outline';
  
  /** Show express checkout buttons */
  showExpressCheckout: boolean;
  
  /** Express checkout options */
  expressCheckoutOptions: Array<'paypal' | 'applepay' | 'googlepay' | 'stripe'>;
  
  /** Show view cart link (for drawer only) */
  showViewCartLink: boolean;
}

/**
 * Empty cart configuration
 */
export interface EmptyCartConfig {
  /** Empty cart message */
  message: string;
  
  /** Show image */
  showImage: boolean;
  
  /** Image URL */
  imageUrl?: string;
  
  /** Show continue shopping button */
  showContinueButton: boolean;
  
  /** Continue button text */
  continueButtonText: string;
  
  /** Continue button URL */
  continueButtonUrl: string;
}

/**
 * Cart totals configuration
 */
export interface CartTotalsConfig {
  /** Show subtotal */
  showSubtotal: boolean;
  
  /** Show tax estimate */
  showTaxEstimate: boolean;
  
  /** Show shipping estimate */
  showShippingEstimate: boolean;
  
  /** Show discount field */
  showDiscountField: boolean;
  
  /** Discount field placeholder */
  discountPlaceholder: string;
  
  /** Show total savings */
  showTotalSavings: boolean;
  
  /** Highlight total */
  highlightTotal: boolean;
}

/**
 * Complete cart drawer configuration
 */
export interface CartDrawerConfig {
  /** Cart display type */
  displayType: CartDisplayType;
  
  /** Drawer position (if displayType is 'drawer') */
  drawerPosition: DrawerPosition;
  
  /** Drawer width in pixels (if displayType is 'drawer') */
  drawerWidth: number;
  
  /** Auto open cart when item added */
  autoOpen: boolean;
  
  /** Auto open delay in milliseconds */
  autoOpenDelay: number;
  
  /** Cart title */
  title: string;
  
  /** Show cart count in title */
  showCountInTitle: boolean;
  
  /** Free shipping bar configuration */
  freeShippingBar: FreeShippingBarConfig;
  
  /** Cart item display configuration */
  itemDisplay: CartItemConfig;
  
  /** Cart notes configuration */
  notes: CartNotesConfig;
  
  /** Upsell configuration */
  upsell: UpsellConfig;
  
  /** Cart buttons configuration */
  buttons: CartButtonsConfig;
  
  /** Empty cart configuration */
  emptyCart: EmptyCartConfig;
  
  /** Cart totals configuration */
  totals: CartTotalsConfig;
  
  /** Background color */
  backgroundColor: string;
  
  /** Text color */
  textColor: string;
  
  /** Border color */
  borderColor: string;
  
  /** Show overlay when drawer is open */
  showOverlay: boolean;
  
  /** Overlay opacity (0-100) */
  overlayOpacity: number;
  
  /** Close on overlay click */
  closeOnOverlayClick: boolean;
  
  /** Show close button */
  showCloseButton: boolean;
  
  /** Animation duration in ms */
  animationDuration: number;
  
  /** Custom CSS class */
  customClass?: string;
}

/**
 * Default cart drawer configuration
 */
export const defaultCartDrawerConfig: CartDrawerConfig = {
  displayType: 'drawer',
  drawerPosition: 'right',
  drawerWidth: 400,
  autoOpen: true,
  autoOpenDelay: 0,
  title: 'Your Cart',
  showCountInTitle: true,
  freeShippingBar: {
    enabled: true,
    threshold: 50,
    messageBelowThreshold: 'You\'re ${amount} away from free shipping!',
    messageThresholdReached: 'You\'ve qualified for free shipping!',
    showProgressBar: true,
    progressBarColor: '#4CAF50',
    progressBarBackgroundColor: '#e0e0e0',
    progressBarHeight: 4
  },
  itemDisplay: {
    showImage: true,
    imageSize: 80,
    showVendor: false,
    showSku: false,
    showVariants: true,
    showRemoveButton: true,
    enableQuantitySelector: true,
    showPricePerItem: true,
    showLineTotal: false,
    showDiscounts: true
  },
  notes: {
    enabled: true,
    label: 'Order notes',
    placeholder: 'Add a note to your order',
    maxLength: 500,
    required: false
  },
  upsell: {
    enabled: false,
    title: 'You might also like',
    method: 'related',
    maxProducts: 3,
    layout: 'carousel'
  },
  buttons: {
    showContinueShopping: true,
    continueShoppingText: 'Continue Shopping',
    continueShoppingAction: 'close',
    checkoutButtonText: 'Checkout',
    checkoutButtonStyle: 'solid',
    showExpressCheckout: false,
    expressCheckoutOptions: ['paypal', 'applepay'],
    showViewCartLink: true
  },
  emptyCart: {
    message: 'Your cart is empty',
    showImage: true,
    imageUrl: '/empty-cart.svg',
    showContinueButton: true,
    continueButtonText: 'Start Shopping',
    continueButtonUrl: '/collections/all'
  },
  totals: {
    showSubtotal: true,
    showTaxEstimate: false,
    showShippingEstimate: false,
    showDiscountField: true,
    discountPlaceholder: 'Discount code',
    showTotalSavings: true,
    highlightTotal: true
  },
  backgroundColor: '#ffffff',
  textColor: '#333333',
  borderColor: '#e0e0e0',
  showOverlay: true,
  overlayOpacity: 50,
  closeOnOverlayClick: true,
  showCloseButton: true,
  animationDuration: 300
};