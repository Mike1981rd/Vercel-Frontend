/**
 * @file FooterTypes.ts
 * @max-lines 100
 * @module Footer
 * @created 2025-01-15
 */

export enum FooterBlockType {
  LOGO_WITH_TEXT = 'logo-with-text',
  SUBSCRIBE = 'subscribe',
  SOCIAL_MEDIA = 'social-media',
  MENU = 'menu',
  TEXT = 'text',
  IMAGE = 'image'
}

export interface FooterBlock {
  id: string;
  type: FooterBlockType;
  title: string;
  visible: boolean;
  settings: any; // Configuración específica según el tipo
}

export interface FooterConfig {
  enabled: boolean;
  colorScheme: string;
  colorBackground: boolean;
  navigationMenuId?: string;
  desktopColumnCount: number;
  showSeparator: boolean;
  blocks: FooterBlock[]; // Bloques hijos del footer
  bottomBar: {
    enabled: boolean;
    content: 'subscribed' | 'payment' | 'locale' | 'none';
    showPaymentIcons: boolean;
    paymentProviders?: {
      visa?: boolean;
      mastercard?: boolean;
      amex?: boolean;
      discover?: boolean;
      diners?: boolean;
      applePay?: boolean;
      googlePay?: boolean;
      amazonPay?: boolean;
    };
    paymentLogos?: {
      visa?: string;
      mastercard?: string;
      amex?: string;
      discover?: string;
      diners?: string;
      applePay?: string;
      googlePay?: string;
      amazonPay?: string;
    };
  };
  copyrightNotice: string;
  contactEmail?: string;
  contactPhone?: string;
  followOnShop: {
    enabled: boolean;
  };
  languageSelector: {
    enabled: boolean;
    showSelector: boolean;
    defaultLanguage?: string;
  };
  currencySelector: {
    enabled: boolean;
    showSelector: boolean;
    defaultCurrency?: string;
  };
  policyLinks: {
    enabled: boolean;
    showLinks: boolean;
  };
  padding: {
    enabled: boolean;
    top: number;
    bottom: number;
  };
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    pinterest?: string;
    tiktok?: string;
    reddit?: string;
    tumblr?: string;
    snapchat?: string;
    linkedin?: string;
    vimeo?: string;
    flickr?: string;
    behance?: string;
    discord?: string;
    dribbble?: string;
    medium?: string;
    twitch?: string;
    whatsapp?: string;
    video?: string;
    telegram?: string;
    email?: string;
    balance?: string;
  };
  customCSS?: string;
}

export const getDefaultFooterConfig = (): FooterConfig => ({
  enabled: true,
  colorScheme: '1',
  colorBackground: false,
  navigationMenuId: '',
  desktopColumnCount: 3,
  showSeparator: false,
  blocks: [],
  bottomBar: {
    enabled: true,
    content: 'subscribed',
    showPaymentIcons: true,
    paymentProviders: {
      visa: true,
      mastercard: true,
      amex: true,
      discover: true,
      diners: false,
      applePay: true,
      googlePay: true,
      amazonPay: true
    }
  },
  copyrightNotice: '',
  contactEmail: '',
  contactPhone: '',
  followOnShop: {
    enabled: false
  },
  languageSelector: {
    enabled: true,
    showSelector: true,
    defaultLanguage: 'Español'
  },
  currencySelector: {
    enabled: true,
    showSelector: true,
    defaultCurrency: 'DOP'
  },
  policyLinks: {
    enabled: true,
    showLinks: true
  },
  padding: {
    enabled: false,
    top: 0,
    bottom: 0
  },
  socialMedia: {},
  customCSS: ''
});