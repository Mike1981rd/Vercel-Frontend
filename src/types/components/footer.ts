/**
 * Footer Component Configuration
 * Global footer that appears on all pages
 */

/**
 * Footer block types
 */
export type FooterBlockType = 
  | 'logo'
  | 'menu'
  | 'newsletter'
  | 'social'
  | 'text'
  | 'payment-icons';

/**
 * Logo block configuration
 */
export interface FooterLogoBlock {
  type: 'logo';
  /** Logo image URL */
  imageUrl: string;
  /** Logo height in pixels */
  height: number;
  /** Logo width in pixels */
  width?: number;
  /** Alt text */
  alt: string;
  /** Optional tagline text below logo */
  tagline?: string;
}

/**
 * Menu block configuration
 */
export interface FooterMenuBlock {
  type: 'menu';
  /** Menu title */
  title: string;
  /** Menu items */
  items: Array<{
    label: string;
    url: string;
    openInNewTab?: boolean;
  }>;
  /** Show title */
  showTitle: boolean;
}

/**
 * Newsletter block configuration
 */
export interface FooterNewsletterBlock {
  type: 'newsletter';
  /** Block title */
  title: string;
  /** Description text */
  description: string;
  /** Input placeholder */
  placeholder: string;
  /** Button text */
  buttonText: string;
  /** Success message */
  successMessage: string;
  /** Error message */
  errorMessage: string;
  /** Newsletter provider integration */
  provider?: 'mailchimp' | 'klaviyo' | 'custom';
}

/**
 * Social media block configuration
 */
export interface FooterSocialBlock {
  type: 'social';
  /** Block title */
  title: string;
  /** Show title */
  showTitle: boolean;
  /** Icon size in pixels */
  iconSize: number;
  /** Icon style */
  iconStyle: 'solid' | 'outline' | 'branded';
  /** Icon spacing in pixels */
  spacing: number;
}

/**
 * Text block configuration
 */
export interface FooterTextBlock {
  type: 'text';
  /** Block title */
  title?: string;
  /** HTML content */
  content: string;
  /** Show title */
  showTitle: boolean;
}

/**
 * Payment icons block configuration
 */
export interface FooterPaymentBlock {
  type: 'payment-icons';
  /** Title */
  title?: string;
  /** Payment methods to show */
  methods: Array<'visa' | 'mastercard' | 'amex' | 'paypal' | 'stripe' | 'applepay' | 'googlepay'>;
  /** Icon size */
  iconSize: 'small' | 'medium' | 'large';
}

/**
 * Union type for all footer blocks
 */
export type FooterBlock = 
  | FooterLogoBlock
  | FooterMenuBlock
  | FooterNewsletterBlock
  | FooterSocialBlock
  | FooterTextBlock
  | FooterPaymentBlock;

/**
 * Footer section configuration (row of blocks)
 */
export interface FooterSection {
  /** Unique section ID */
  id: string;
  /** Blocks in this section */
  blocks: FooterBlock[];
  /** Column layout for desktop */
  desktopColumns: 1 | 2 | 3 | 4 | 5 | 6;
  /** Column layout for mobile */
  mobileColumns: 1 | 2;
  /** Gap between columns in pixels */
  columnGap: number;
  /** Background color override */
  backgroundColor?: string;
  /** Padding */
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * Bottom bar configuration (copyright section)
 */
export interface BottomBarConfig {
  /** Show bottom bar */
  show: boolean;
  /** Copyright text */
  copyrightText: string;
  /** Show current year automatically */
  showCurrentYear: boolean;
  /** Additional menu items */
  menuItems: Array<{
    label: string;
    url: string;
    openInNewTab?: boolean;
  }>;
  /** Text alignment */
  textAlign: 'left' | 'center' | 'right';
  /** Background color */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Padding */
  padding: {
    top: number;
    bottom: number;
  };
}

/**
 * Complete footer configuration
 */
export interface FooterConfig {
  /** Enable footer */
  enabled: boolean;
  
  /** Footer sections (rows) */
  sections: FooterSection[];
  
  /** Bottom bar configuration */
  bottomBar: BottomBarConfig;
  
  /** Default background color */
  backgroundColor: string;
  
  /** Default text color */
  textColor: string;
  
  /** Link color */
  linkColor: string;
  
  /** Link hover color */
  linkHoverColor: string;
  
  /** Heading font size */
  headingFontSize: number;
  
  /** Text font size */
  textFontSize: number;
  
  /** Container max width */
  maxWidth: 'full' | 'container';
  
  /** Separator line between sections */
  showSeparators: boolean;
  
  /** Separator color */
  separatorColor?: string;
  
  /** Show on mobile */
  showOnMobile: boolean;
  
  /** Show on desktop */
  showOnDesktop: boolean;
  
  /** Custom CSS class */
  customClass?: string;
}

/**
 * Default footer configuration
 */
export const defaultFooterConfig: FooterConfig = {
  enabled: true,
  sections: [
    {
      id: 'main',
      desktopColumns: 4,
      mobileColumns: 1,
      columnGap: 40,
      padding: {
        top: 60,
        bottom: 40,
        left: 20,
        right: 20
      },
      blocks: [
        {
          type: 'logo',
          imageUrl: '/logo.png',
          height: 40,
          alt: 'Company Logo',
          tagline: 'Your tagline here'
        },
        {
          type: 'menu',
          title: 'Quick Links',
          showTitle: true,
          items: [
            { label: 'About Us', url: '/about' },
            { label: 'Contact', url: '/contact' },
            { label: 'FAQ', url: '/faq' }
          ]
        },
        {
          type: 'menu',
          title: 'Customer Service',
          showTitle: true,
          items: [
            { label: 'Shipping Info', url: '/shipping' },
            { label: 'Returns', url: '/returns' },
            { label: 'Size Guide', url: '/size-guide' }
          ]
        },
        {
          type: 'newsletter',
          title: 'Newsletter',
          description: 'Subscribe to get special offers and updates',
          placeholder: 'Your email',
          buttonText: 'Subscribe',
          successMessage: 'Thanks for subscribing!',
          errorMessage: 'Please enter a valid email'
        }
      ]
    }
  ],
  bottomBar: {
    show: true,
    copyrightText: '© [year] [company]. All rights reserved.',
    showCurrentYear: true,
    menuItems: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' }
    ],
    textAlign: 'center',
    padding: {
      top: 20,
      bottom: 20
    }
  },
  backgroundColor: '#f8f8f8',
  textColor: '#333333',
  linkColor: '#666666',
  linkHoverColor: '#000000',
  headingFontSize: 16,
  textFontSize: 14,
  maxWidth: 'container',
  showSeparators: true,
  separatorColor: '#e0e0e0',
  showOnMobile: true,
  showOnDesktop: true
};