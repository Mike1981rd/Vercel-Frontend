/**
 * Favicon Configuration Module
 * Manages custom favicon settings for the website
 * Part of the modular theme system to avoid monolithic JSON
 */

/**
 * Favicon configuration interface
 */
export interface FaviconConfig {
  /** Whether to use a custom favicon */
  customFavicon: boolean;
  
  /** URL/path to the custom favicon file */
  faviconUrl?: string;
}

/**
 * Default favicon configuration
 * Based on specifications from prompt.pdf
 */
export const defaultFavicon: FaviconConfig = {
  customFavicon: true,
  faviconUrl: '/favicon-custom.ico'
};

/**
 * Supported favicon formats
 */
export const SUPPORTED_FAVICON_FORMATS = [
  '.ico',
  '.png',
  '.svg',
  '.jpg',
  '.jpeg'
] as const;

/**
 * Favicon size recommendations
 */
export const FAVICON_SIZES = {
  ico: '16x16, 32x32, 48x48',
  png: '16x16, 32x32, 96x96, 192x192',
  appleTouch: '180x180',
  android: '192x192, 512x512'
} as const;

/**
 * Validates favicon URL/path
 * @param url - Favicon URL to validate
 * @returns true if valid, false otherwise
 */
export function validateFaviconUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    return false;
  }
  
  // Check if it's a valid URL or path
  try {
    // Check if it's an absolute URL
    new URL(url);
    return true;
  } catch {
    // If not a URL, check if it's a valid path
    const pathRegex = /^\/[a-zA-Z0-9-_./]+$/;
    if (!pathRegex.test(url)) {
      return false;
    }
  }
  
  // Check if it has a supported extension
  const hasValidExtension = SUPPORTED_FAVICON_FORMATS.some(format => 
    url.toLowerCase().endsWith(format)
  );
  
  return hasValidExtension;
}

/**
 * Generates favicon link tags for HTML head
 * @param config - Favicon configuration
 * @returns Array of link tag objects
 */
export function generateFaviconLinks(config: FaviconConfig): Array<{
  rel: string;
  type?: string;
  sizes?: string;
  href: string;
}> {
  if (!config.customFavicon || !config.faviconUrl) {
    return [];
  }
  
  const links = [];
  const url = config.faviconUrl;
  
  // Main favicon
  links.push({
    rel: 'icon',
    type: getFaviconMimeType(url),
    href: url
  });
  
  // Apple touch icon (if PNG)
  if (url.endsWith('.png')) {
    links.push({
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: url
    });
  }
  
  // Shortcut icon for older browsers
  links.push({
    rel: 'shortcut icon',
    href: url
  });
  
  return links;
}

/**
 * Gets MIME type for favicon based on extension
 * @param url - Favicon URL
 * @returns MIME type string
 */
export function getFaviconMimeType(url: string): string {
  const extension = url.toLowerCase().split('.').pop();
  
  const mimeTypes: Record<string, string> = {
    'ico': 'image/x-icon',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg'
  };
  
  return mimeTypes[extension || ''] || 'image/x-icon';
}

/**
 * Validates favicon configuration
 * @param config - Favicon configuration to validate
 * @returns true if valid, false otherwise
 */
export function validateFaviconConfig(config: Partial<FaviconConfig>): boolean {
  if (config.customFavicon && config.faviconUrl) {
    return validateFaviconUrl(config.faviconUrl);
  }
  
  // If custom favicon is disabled, no URL is needed
  return true;
}

/**
 * Merges partial favicon configuration with defaults
 * @param partial - Partial configuration to merge
 * @returns Complete favicon configuration
 */
export function mergeFaviconWithDefaults(partial: Partial<FaviconConfig>): FaviconConfig {
  return {
    ...defaultFavicon,
    ...partial
  };
}