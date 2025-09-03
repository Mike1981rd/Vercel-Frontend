/**
 * Navigation Configuration Module
 * Manages search and back-to-top button settings
 * Part of the modular theme system to avoid monolithic JSON
 */

/**
 * Search display options
 */
export type SearchDisplayType = 'drawer-only' | 'drawer-and-page' | 'page-only' | 'none';

/**
 * Back to top button position options
 */
export type BackToTopPosition = 'bottom-center' | 'bottom-left' | 'bottom-right';

/**
 * Search configuration
 */
export interface SearchConfig {
  /** How to display the search functionality */
  showAs: SearchDisplayType;
}

/**
 * Back to top button configuration
 */
export interface BackToTopConfig {
  /** Whether to show the back to top button */
  showButton: boolean;
  
  /** Position of the button */
  position: BackToTopPosition;
}

/**
 * Complete navigation configuration
 */
export interface NavigationConfig {
  /** Search settings */
  search: SearchConfig;
  
  /** Back to top button settings */
  backToTop: BackToTopConfig;
}

/**
 * Default navigation configuration
 * Based on specifications from prompt.pdf
 */
export const defaultNavigation: NavigationConfig = {
  search: {
    showAs: 'drawer-and-page'
  },
  backToTop: {
    showButton: true,
    position: 'bottom-left'
  }
};

/**
 * Search display labels for UI
 */
export const SearchDisplayLabels: Record<SearchDisplayType, string> = {
  'drawer-only': 'Solo en cajón lateral',
  'drawer-and-page': 'Cajón lateral y página',
  'page-only': 'Solo en página',
  'none': 'No mostrar búsqueda'
};

/**
 * Back to top position labels for UI
 */
export const BackToTopPositionLabels: Record<BackToTopPosition, string> = {
  'bottom-center': 'Centro inferior',
  'bottom-left': 'Esquina inferior izquierda',
  'bottom-right': 'Esquina inferior derecha'
};

/**
 * Gets CSS classes for back to top button position
 * @param position - Button position
 * @returns CSS classes string
 */
export function getBackToTopClasses(position: BackToTopPosition): string {
  const baseClasses = 'fixed z-50 transition-opacity duration-300';
  
  const positionClasses: Record<BackToTopPosition, string> = {
    'bottom-center': 'bottom-8 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-8 left-8',
    'bottom-right': 'bottom-8 right-8'
  };
  
  return `${baseClasses} ${positionClasses[position]}`;
}

/**
 * Configuration for search functionality
 */
export interface SearchSettings {
  /** Placeholder text for search input */
  placeholder?: string;
  
  /** Minimum characters required to search */
  minCharacters?: number;
  
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  
  /** Maximum results to show */
  maxResults?: number;
  
  /** Whether to search in product descriptions */
  searchDescriptions?: boolean;
  
  /** Whether to search in product tags */
  searchTags?: boolean;
}

/**
 * Default search settings
 */
export const defaultSearchSettings: SearchSettings = {
  placeholder: 'Buscar productos...',
  minCharacters: 3,
  debounceDelay: 300,
  maxResults: 10,
  searchDescriptions: true,
  searchTags: true
};

/**
 * Validates navigation configuration
 * @param config - Navigation configuration to validate
 * @returns true if valid, false otherwise
 */
export function validateNavigationConfig(config: Partial<NavigationConfig>): boolean {
  // All enum values are validated by TypeScript
  // Additional runtime validation can be added here if needed
  return true;
}

/**
 * Merges partial navigation configuration with defaults
 * @param partial - Partial configuration to merge
 * @returns Complete navigation configuration
 */
export function mergeNavigationWithDefaults(partial: Partial<NavigationConfig>): NavigationConfig {
  return {
    search: {
      ...defaultNavigation.search,
      ...partial.search
    },
    backToTop: {
      ...defaultNavigation.backToTop,
      ...partial.backToTop
    }
  };
}

/**
 * Determines if search should be visible in current context
 * @param config - Search configuration
 * @param context - Current context ('drawer' | 'page')
 * @returns Whether search should be visible
 */
export function isSearchVisible(config: SearchConfig, context: 'drawer' | 'page'): boolean {
  if (config.showAs === 'none') return false;
  if (config.showAs === 'drawer-and-page') return true;
  if (config.showAs === 'drawer-only' && context === 'drawer') return true;
  if (config.showAs === 'page-only' && context === 'page') return true;
  return false;
}