/**
 * Theme Configuration Index
 * Central export point for all theme configuration modules
 * This modular approach avoids the monolithic 24,000-line JSON from v1
 */

// Export all configuration modules
export * from './appearance';
export * from './typography';
export * from './colorSchemes';
export * from './productCards';
export * from './productBadges';
export * from './cart';
export * from './favicon';
export * from './navigation';
export * from './socialMedia';
export * from './swatches';

// Import types for the global configuration
import { AppearanceConfig, defaultAppearance } from './appearance';
import { TypographyConfig, defaultTypography } from './typography';
import { ColorSchemesConfig, defaultColorSchemes } from './colorSchemes';
import { ProductCardsConfig, defaultProductCards } from './productCards';
import { ProductBadgesConfig, defaultProductBadges } from './productBadges';
import { CartConfig, defaultCart } from './cart';
import { FaviconConfig, defaultFavicon } from './favicon';
import { NavigationConfig, defaultNavigation } from './navigation';
import { SocialMediaConfig, defaultSocialMedia } from './socialMedia';
import { SwatchesConfig, defaultSwatches } from './swatches';

/**
 * Complete global theme configuration
 * Combines all modular configurations into a single interface
 */
export interface GlobalThemeConfig {
  /** Page appearance settings */
  appearance: AppearanceConfig;
  
  /** Typography settings for different text types */
  typography: TypographyConfig;
  
  /** Color schemes (up to 5) */
  colorSchemes: ColorSchemesConfig;
  
  /** Product card display settings */
  productCards: ProductCardsConfig;
  
  /** Product badge settings */
  productBadges: ProductBadgesConfig;
  
  /** Shopping cart configuration */
  cart: CartConfig;
  
  /** Favicon settings */
  favicon: FaviconConfig;
  
  /** Navigation and search settings */
  navigation: NavigationConfig;
  
  /** Social media links */
  socialMedia: SocialMediaConfig;
  
  /** Product variant swatches */
  swatches: SwatchesConfig;
}

/**
 * Complete default theme configuration
 * Provides sensible defaults for all theme settings
 */
export const defaultGlobalTheme: GlobalThemeConfig = {
  appearance: defaultAppearance,
  typography: defaultTypography,
  colorSchemes: defaultColorSchemes,
  productCards: defaultProductCards,
  productBadges: defaultProductBadges,
  cart: defaultCart,
  favicon: defaultFavicon,
  navigation: defaultNavigation,
  socialMedia: defaultSocialMedia,
  swatches: defaultSwatches
};

/**
 * Theme configuration version
 * Used for migrations and compatibility checks
 */
export const THEME_CONFIG_VERSION = '2.0.0';

/**
 * Maximum file size for each configuration module (in lines)
 * Enforces the 300-line limit per file
 */
export const MAX_LINES_PER_MODULE = 300;

/**
 * Validates that a configuration object has all required properties
 * @param config - Configuration to validate
 * @returns true if valid, false otherwise
 */
export function isValidGlobalThemeConfig(config: any): config is GlobalThemeConfig {
  const requiredKeys: Array<keyof GlobalThemeConfig> = [
    'appearance',
    'typography',
    'colorSchemes',
    'productCards',
    'productBadges',
    'cart',
    'favicon',
    'navigation',
    'socialMedia',
    'swatches'
  ];
  
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  return requiredKeys.every(key => key in config);
}

/**
 * Merges a partial theme configuration with defaults
 * @param partial - Partial configuration to merge
 * @returns Complete theme configuration
 */
export function mergeWithGlobalDefaults(
  partial: Partial<GlobalThemeConfig>
): GlobalThemeConfig {
  return {
    appearance: partial.appearance || defaultAppearance,
    typography: partial.typography || defaultTypography,
    colorSchemes: partial.colorSchemes || defaultColorSchemes,
    productCards: partial.productCards || defaultProductCards,
    productBadges: partial.productBadges || defaultProductBadges,
    cart: partial.cart || defaultCart,
    favicon: partial.favicon || defaultFavicon,
    navigation: partial.navigation || defaultNavigation,
    socialMedia: partial.socialMedia || defaultSocialMedia,
    swatches: partial.swatches || defaultSwatches
  };
}

/**
 * Creates a deep copy of a theme configuration
 * @param config - Configuration to copy
 * @returns Deep copy of the configuration
 */
export function cloneThemeConfig(config: GlobalThemeConfig): GlobalThemeConfig {
  return JSON.parse(JSON.stringify(config));
}

/**
 * Extracts only the changed properties between two configurations
 * @param original - Original configuration
 * @param modified - Modified configuration
 * @returns Object containing only changed properties
 */
export function getConfigChanges(
  original: GlobalThemeConfig,
  modified: GlobalThemeConfig
): Partial<GlobalThemeConfig> {
  const changes: Partial<GlobalThemeConfig> = {};
  
  // Check each module for changes
  const modules: Array<keyof GlobalThemeConfig> = [
    'appearance',
    'typography',
    'colorSchemes',
    'productCards',
    'productBadges',
    'cart',
    'favicon',
    'navigation',
    'socialMedia',
    'swatches'
  ];
  
  for (const module of modules) {
    const originalJSON = JSON.stringify(original[module]);
    const modifiedJSON = JSON.stringify(modified[module]);
    
    if (originalJSON !== modifiedJSON) {
      changes[module] = modified[module] as any;
    }
  }
  
  return changes;
}

/**
 * Configuration module metadata
 * Used for UI organization and documentation
 */
export const configModules = [
  {
    key: 'appearance',
    name: 'Apariencia',
    description: 'Ancho de página, padding y bordes',
    icon: '🎨'
  },
  {
    key: 'typography',
    name: 'Tipografía',
    description: 'Fuentes para títulos, texto y botones',
    icon: '✏️'
  },
  {
    key: 'colorSchemes',
    name: 'Esquemas de Color',
    description: 'Paletas de colores (hasta 5)',
    icon: '🎨'
  },
  {
    key: 'productCards',
    name: 'Tarjetas de Producto',
    description: 'Configuración de visualización de productos',
    icon: '🛍️'
  },
  {
    key: 'productBadges',
    name: 'Insignias de Producto',
    description: 'Badges de oferta, agotado y personalizados',
    icon: '🏷️'
  },
  {
    key: 'cart',
    name: 'Carrito',
    description: 'Configuración del carrito de compras',
    icon: '🛒'
  },
  {
    key: 'favicon',
    name: 'Favicon',
    description: 'Icono del sitio web',
    icon: '🌐'
  },
  {
    key: 'navigation',
    name: 'Navegación',
    description: 'Búsqueda y botón volver arriba',
    icon: '🧭'
  },
  {
    key: 'socialMedia',
    name: 'Redes Sociales',
    description: 'Enlaces a 17 plataformas sociales',
    icon: '📱'
  },
  {
    key: 'swatches',
    name: 'Muestras',
    description: 'Visualización de variantes de productos',
    icon: '🎨'
  }
] as const;

// Type exports for convenience
export type ThemeConfigModule = keyof GlobalThemeConfig;
export type ThemeConfigModuleInfo = typeof configModules[number];