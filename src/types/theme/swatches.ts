/**
 * Swatches Configuration Module
 * Manages visual display of product variants (colors, sizes, materials)
 * Part of the modular theme system to avoid monolithic JSON
 */

/**
 * Shape options for swatches
 */
export type SwatchShape = 'Portrait' | 'Round' | 'Square' | 'Landscape';

/**
 * Primary swatch configuration
 */
export interface PrimarySwatchConfig {
  /** Whether to show swatches */
  enabled: boolean;
  
  /** Option name (e.g., "Color", "Size", etc.) */
  optionName?: string;
  
  /** Shape configuration for product cards */
  shapeForProductCards?: SwatchShape;
  /** Size for product cards (1-5) */
  sizeForProductCards: number;
  
  /** Shape configuration for product pages */
  shapeForProductPages?: SwatchShape;
  /** Size for product pages (1-5) */
  sizeForProductPages: number;
  
  /** Shape configuration for filters */
  shapeForFilters?: SwatchShape;
  /** Size for filters (1-5) */
  sizeForFilters: number;
  
  /** Custom colors and patterns (multiline text) */
  customColorsAndPatterns?: string;
}

/**
 * Secondary swatch configuration
 */
export interface SecondarySwatchConfig {
  /** Option names for secondary swatches (multiline) */
  optionNames?: string;
  
  /** Shape configuration for product pages */
  shapeForProductPages?: SwatchShape;
  /** Size for product pages (1-5) */
  sizeForProductPages: number;
  
  /** Shape configuration for filters */
  shapeForFilters?: SwatchShape;
  /** Size for filters (1-5) */
  sizeForFilters: number;
  
  /** Custom colors and patterns (multiline text) */
  customColorsAndPatterns?: string;
}

/**
 * Complete swatches configuration
 */
export interface SwatchesConfig {
  /** Primary swatch configuration */
  primary?: PrimarySwatchConfig;
  
  /** Secondary swatch configuration */
  secondary?: SecondarySwatchConfig;
}

/**
 * Default primary swatch configuration
 */
export const defaultPrimarySwatchConfig: PrimarySwatchConfig = {
  enabled: false,
  optionName: 'Color',
  shapeForProductCards: 'Portrait',
  sizeForProductCards: 3,
  shapeForProductPages: 'Round',
  sizeForProductPages: 4,
  shapeForFilters: 'Square',
  sizeForFilters: 1,
  customColorsAndPatterns: `Ultramarine: #0437F2
Cherry blossom: #FFB7C5
Sunny day: yellow/green/blue
Summertime: #F8FBF8/#F8058/#4`
};

/**
 * Default secondary swatch configuration
 */
export const defaultSecondarySwatchConfig: SecondarySwatchConfig = {
  optionNames: 'Material\nFrame',
  shapeForProductPages: 'Square',
  sizeForProductPages: 4,
  shapeForFilters: 'Square',
  sizeForFilters: 1,
  customColorsAndPatterns: `Ultramarine: #0437F2
Cherry blossom: #FFB7C5
Sunny day: yellow/green/blue
Summertime: #F8FBF8/#F8058/#4`
};

/**
 * Default swatches configuration
 */
export const defaultSwatches: SwatchesConfig = {
  primary: defaultPrimarySwatchConfig,
  secondary: defaultSecondarySwatchConfig
};

/**
 * Available shape options for dropdowns
 */
export const swatchShapeOptions: SwatchShape[] = ['Portrait', 'Round', 'Square', 'Landscape'];

/**
 * Gets label for swatch shape
 * @param shape - Swatch shape
 * @returns Display label
 */
export function getSwatchShapeLabel(shape: SwatchShape): string {
  const labels: Record<SwatchShape, string> = {
    'Portrait': 'Portrait',
    'Round': 'Round',
    'Square': 'Square',
    'Landscape': 'Landscape'
  };
  
  return labels[shape];
}

/**
 * Validates size value (must be between 1 and 5)
 * @param size - Size value
 * @returns true if valid, false otherwise
 */
export function validateSwatchSize(size: number): boolean {
  return size >= 1 && size <= 5;
}

/**
 * Parses custom colors and patterns text
 * @param text - Multiline text with color definitions
 * @returns Array of color definitions
 */
export function parseCustomColors(text: string): Array<{ name: string; value: string }> {
  if (!text) return [];
  
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.includes(':'))
    .map(line => {
      const [name, value] = line.split(':').map(s => s.trim());
      return { name, value };
    });
}

/**
 * Validates swatches configuration
 * @param config - Swatches configuration to validate
 * @returns Object with validation results
 */
export function validateSwatchesConfig(config: Partial<SwatchesConfig>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate primary swatch config
  if (config.primary) {
    if (config.primary.sizeForProductCards && !validateSwatchSize(config.primary.sizeForProductCards)) {
      errors.push('Size for product cards must be between 1 and 5');
    }
    if (config.primary.sizeForProductPages && !validateSwatchSize(config.primary.sizeForProductPages)) {
      errors.push('Size for product pages must be between 1 and 5');
    }
    if (config.primary.sizeForFilters && !validateSwatchSize(config.primary.sizeForFilters)) {
      errors.push('Size for filters must be between 1 and 5');
    }
  }
  
  // Validate secondary swatch config
  if (config.secondary) {
    if (config.secondary.sizeForProductPages && !validateSwatchSize(config.secondary.sizeForProductPages)) {
      errors.push('Secondary size for product pages must be between 1 and 5');
    }
    if (config.secondary.sizeForFilters && !validateSwatchSize(config.secondary.sizeForFilters)) {
      errors.push('Secondary size for filters must be between 1 and 5');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Merges partial swatches configuration with defaults
 * @param partial - Partial configuration to merge
 * @returns Complete swatches configuration
 */
export function mergeSwatchesWithDefaults(partial: Partial<SwatchesConfig>): SwatchesConfig {
  return {
    primary: partial.primary ? {
      ...defaultPrimarySwatchConfig,
      ...partial.primary
    } : defaultPrimarySwatchConfig,
    secondary: partial.secondary ? {
      ...defaultSecondarySwatchConfig,
      ...partial.secondary
    } : defaultSecondarySwatchConfig
  };
}