/**
 * Appearance Configuration Module
 * Handles page width, padding, and border radius settings
 * Part of the modular theme system to avoid monolithic JSON
 */

/**
 * Border radius size options for UI elements
 */
export type BorderRadiusSize = 'size-0' | 'size-1' | 'size-2' | 'size-3' | 'size-4' | 'size-5' | 'size-6' | 'size-7' | 'size-8';

/**
 * Human-readable labels for border radius sizes with pixel values
 */
export const BorderRadiusLabels = {
  'size-0': 'Size 0 - None',
  'size-1': 'Size 1 - 2px',
  'size-2': 'Size 2 - 4px',
  'size-3': 'Size 3 - 8px',
  'size-4': 'Size 4 - 12px',
  'size-5': 'Size 5 - 16px',
  'size-6': 'Size 6 - 20px',
  'size-7': 'Size 7 - 24px',
  'size-8': 'Size 8 - 28px'
} as const;

/**
 * Pixel values for each border radius size
 */
export const BorderRadiusValues = {
  'size-0': 0,
  'size-1': 2,
  'size-2': 4,
  'size-3': 8,
  'size-4': 12,
  'size-5': 16,
  'size-6': 20,
  'size-7': 24,
  'size-8': 28
} as const;

/**
 * Configuration interface for page appearance settings
 */
export interface AppearanceConfig {
  /** Maximum page width in pixels (slider control, max 3000px) */
  pageWidth: number;
  
  /** Side padding size in pixels (slider control) */
  lateralPadding: number;
  
  /** Border radius size for UI elements */
  borderRadius: BorderRadiusSize;
}

/**
 * Default appearance configuration
 * These values are used when no custom configuration is provided
 */
export const defaultAppearance: AppearanceConfig = {
  pageWidth: 1400,
  lateralPadding: 34,
  borderRadius: 'size-3'
};

/**
 * Validates appearance configuration
 * @param config - Configuration to validate
 * @returns true if valid, false otherwise
 */
export function validateAppearanceConfig(config: Partial<AppearanceConfig>): boolean {
  if (config.pageWidth !== undefined) {
    if (config.pageWidth < 320 || config.pageWidth > 3000) {
      return false;
    }
  }
  
  if (config.lateralPadding !== undefined) {
    if (config.lateralPadding < 0 || config.lateralPadding > 200) {
      return false;
    }
  }
  
  if (config.borderRadius !== undefined) {
    const validSizes: BorderRadiusSize[] = ['size-0', 'size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7', 'size-8'];
    if (!validSizes.includes(config.borderRadius)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Merges partial configuration with defaults
 * @param partial - Partial configuration to merge
 * @returns Complete appearance configuration
 */
export function mergeWithDefaults(partial: Partial<AppearanceConfig>): AppearanceConfig {
  return {
    ...defaultAppearance,
    ...partial
  };
}