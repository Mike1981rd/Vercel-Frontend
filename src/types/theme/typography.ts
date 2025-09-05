/**
 * Typography Configuration Module
 * Manages font settings for 5 different text types
 * Part of the modular theme system to avoid monolithic JSON
 */

/**
 * Configuration for individual font settings
 */
export interface FontConfig {
  /** Font family name (e.g., 'Playfair Display', 'Poppins') */
  fontFamily: string;
  
  /** Font weight (e.g., '400' for normal, '700' for bold) */
  fontWeight?: string;
  
  /** Whether to use uppercase transformation */
  useUppercase?: boolean;
  
  /** Font size in pixels or percentage (100% = inherit) */
  fontSize?: number;
  
  /** Letter spacing in pixels (can be negative) */
  letterSpacing?: number;
}

/**
 * Complete typography configuration for all text types
 * Includes 5 distinct typography settings as per specifications
 */
export interface TypographyConfig {
  /** Configuration for headings (h1, h2, h3, etc.) */
  headings: FontConfig;
  
  /** Configuration for body text (paragraphs, general content) */
  body: FontConfig;
  
  /** Configuration for navigation menu items */
  menu: FontConfig;
  
  /** Configuration for product card names/titles */
  productCardName: FontConfig;
  
  /** Configuration for buttons and CTAs */
  buttons: FontConfig;
}

/**
 * Default typography configuration
 * Based on the specifications from prompt.pdf
 */
export const defaultTypography: TypographyConfig = {
  headings: {
    fontFamily: 'Playfair Display',
    fontWeight: '400',
    useUppercase: false,
    fontSize: 100,
    letterSpacing: -1.7
  },
  body: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    useUppercase: false,
    fontSize: 15,
    letterSpacing: 0
  },
  menu: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    useUppercase: false,
    fontSize: 94,
    letterSpacing: 0
  },
  productCardName: {
    fontFamily: 'Assistant',
    fontWeight: '400',
    useUppercase: false,
    fontSize: 100, // 100% = inherit from parent
    letterSpacing: 0
  },
  buttons: {
    fontFamily: 'Assistant',
    fontWeight: '400',
    useUppercase: false,
    fontSize: 100, // 100% = inherit from parent
    letterSpacing: 0
  }
};

/**
 * List of commonly available web fonts
 * Used for validation and font picker UI
 */
export const availableFonts = [
  'Playfair Display',
  'Poppins',
  'Assistant',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Raleway',
  'Source Sans Pro',
  'Oswald',
  'Merriweather',
  'PT Sans',
  'Nunito',
  'Ubuntu',
  'Bebas Neue',
  'Work Sans',
  'Quicksand',
  'Josefin Sans',
  'Archivo'
] as const;

/**
 * Validates a font configuration
 * @param config - Font configuration to validate
 * @returns true if valid, false otherwise
 */
export function validateFontConfig(config: Partial<FontConfig>): boolean {
  if (config.fontSize !== undefined) {
    // Font size should be between 8px and 200px, or 50% to 200%
    if (config.fontSize < 8 || config.fontSize > 200) {
      return false;
    }
  }
  
  if (config.letterSpacing !== undefined) {
    // Letter spacing typically between -5px and 10px
    if (config.letterSpacing < -5 || config.letterSpacing > 10) {
      return false;
    }
  }
  
  return true;
}

/**
 * Generates CSS properties from font configuration
 * @param config - Font configuration
 * @returns CSS properties object
 */
export function fontConfigToCSS(config: FontConfig): Record<string, string> {
  const css: Record<string, string> = {
    fontFamily: `'${config.fontFamily}', sans-serif`
  };
  
  if (config.fontWeight !== undefined) {
    css.fontWeight = config.fontWeight;
  }
  
  if (config.useUppercase) {
    css.textTransform = 'uppercase';
  }
  
  if (config.fontSize !== undefined) {
    // If fontSize is 100 or less, treat as percentage
    css.fontSize = config.fontSize <= 100 ? `${config.fontSize}%` : `${config.fontSize}px`;
  }
  
  if (config.letterSpacing !== undefined) {
    css.letterSpacing = `${config.letterSpacing}px`;
  }
  
  return css;
}

/**
 * Merges partial typography configuration with defaults
 * @param partial - Partial configuration to merge
 * @returns Complete typography configuration
 */
export function mergeTypographyWithDefaults(partial: Partial<TypographyConfig>): TypographyConfig {
  return {
    headings: { ...defaultTypography.headings, ...partial.headings },
    body: { ...defaultTypography.body, ...partial.body },
    menu: { ...defaultTypography.menu, ...partial.menu },
    productCardName: { ...defaultTypography.productCardName, ...partial.productCardName },
    buttons: { ...defaultTypography.buttons, ...partial.buttons }
  };
}