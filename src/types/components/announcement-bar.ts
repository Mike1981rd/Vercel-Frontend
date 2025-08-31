/**
 * Announcement Bar Component Configuration
 * Top bar for announcements, promotions, and important messages
 */

/**
 * Animation style for rotating announcements
 */
export type AnnouncementAnimation = 
  | 'none'
  | 'slide'
  | 'fade'
  | 'marquee'
  | 'typewriter';

/**
 * Individual announcement configuration
 */
export interface Announcement {
  /** Unique identifier */
  id: string;
  
  /** Announcement text/HTML content */
  content: string;
  
  /** Optional link URL */
  link?: string;
  
  /** Link target */
  linkTarget?: '_self' | '_blank';
  
  /** Background color override */
  backgroundColor?: string;
  
  /** Text color override */
  textColor?: string;
  
  /** Start date for scheduled announcements */
  startDate?: string;
  
  /** End date for scheduled announcements */
  endDate?: string;
  
  /** Show only on specific pages */
  pageFilter?: string[];
  
  /** Show only in specific countries */
  countryFilter?: string[];
  
  /** Priority (higher shows first) */
  priority: number;
  
  /** Is active */
  isActive: boolean;
}

/**
 * Announcement bar position
 */
export type BarPosition = 'top' | 'below-header';

/**
 * Close button configuration
 */
export interface CloseButtonConfig {
  /** Show close button */
  show: boolean;
  
  /** Remember closed state in session */
  rememberInSession: boolean;
  
  /** Remember closed state permanently (localStorage) */
  rememberPermanently: boolean;
  
  /** Close button style */
  style: 'x' | 'text' | 'icon';
  
  /** Close button text (if style is 'text') */
  text?: string;
}

/**
 * Language/Currency selector configuration
 */
export interface SelectorConfig {
  /** Show language selector */
  showLanguage: boolean;
  
  /** Show currency selector */
  showCurrency: boolean;
  
  /** Selector style */
  style: 'dropdown' | 'flags' | 'text';
  
  /** Position within bar */
  position: 'left' | 'right';
}

/**
 * Social icons configuration
 */
export interface SocialIconsConfig {
  /** Show social icons */
  show: boolean;
  
  /** Position within bar */
  position: 'left' | 'right';
  
  /** Icon size in pixels */
  size: number;
  
  /** Icon style */
  style: 'solid' | 'outline' | 'branded';
}

/**
 * Autoplay configuration for multiple announcements
 */
export interface AutoplayConfig {
  /** Enable autoplay */
  enabled: boolean;
  
  /** Delay between announcements in seconds */
  delay: number;
  
  /** Pause on hover */
  pauseOnHover: boolean;
  
  /** Show navigation dots */
  showDots: boolean;
  
  /** Show navigation arrows */
  showArrows: boolean;
}

/**
 * Complete announcement bar configuration
 */
export interface AnnouncementBarConfig {
  /** Enable announcement bar */
  enabled: boolean;
  
  /** Bar position */
  position: BarPosition;
  
  /** List of announcements */
  announcements: Announcement[];
  
  /** Animation style */
  animation: AnnouncementAnimation;
  
  /** Autoplay configuration */
  autoplay: AutoplayConfig;
  
  /** Close button configuration */
  closeButton: CloseButtonConfig;
  
  /** Selector configuration */
  selectors: SelectorConfig;
  
  /** Social icons configuration */
  socialIcons: SocialIconsConfig;
  
  /** Default background color */
  backgroundColor: string;
  
  /** Default text color */
  textColor: string;
  
  /** Font size in pixels */
  fontSize: number;
  
  /** Font weight */
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  
  /** Text alignment */
  textAlign: 'left' | 'center' | 'right';
  
  /** Padding in pixels */
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
  /** Show on mobile */
  showOnMobile: boolean;
  
  /** Show on desktop */
  showOnDesktop: boolean;
  
  /** Custom CSS class */
  customClass?: string;
  
  /** Z-index for stacking */
  zIndex: number;
}

/**
 * Default announcement bar configuration
 */
export const defaultAnnouncementBarConfig: AnnouncementBarConfig = {
  enabled: true,
  position: 'top',
  announcements: [
    {
      id: '1',
      content: 'Free shipping on orders over $50!',
      link: '/shipping',
      linkTarget: '_self',
      priority: 1,
      isActive: true
    }
  ],
  animation: 'none',
  autoplay: {
    enabled: false,
    delay: 5,
    pauseOnHover: true,
    showDots: false,
    showArrows: false
  },
  closeButton: {
    show: true,
    rememberInSession: true,
    rememberPermanently: false,
    style: 'x'
  },
  selectors: {
    showLanguage: false,
    showCurrency: false,
    style: 'dropdown',
    position: 'right'
  },
  socialIcons: {
    show: false,
    position: 'right',
    size: 16,
    style: 'solid'
  },
  backgroundColor: '#000000',
  textColor: '#FFFFFF',
  fontSize: 14,
  fontWeight: 'normal',
  textAlign: 'center',
  padding: {
    top: 8,
    bottom: 8,
    left: 20,
    right: 20
  },
  showOnMobile: true,
  showOnDesktop: true,
  zIndex: 9999
};