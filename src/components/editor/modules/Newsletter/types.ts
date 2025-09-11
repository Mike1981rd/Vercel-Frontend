// types.ts - Newsletter Module Types
export type NewsletterBlockType = 'subheading' | 'heading' | 'text' | 'subscribe';

export interface NewsletterSubheading {
  id: string;
  type: 'subheading';
  text: string;
  visible?: boolean;
}

export interface NewsletterHeading {
  id: string;
  type: 'heading';
  text: string;
  size: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    link?: string;
  };
  visible?: boolean;
}

export interface NewsletterText {
  id: string;
  type: 'text';
  content: string;
  bodySize: 'body1' | 'body2' | 'body3' | 'body4';
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    link?: string;
  };
  visible?: boolean;
}

export interface NewsletterSubscribe {
  id: string;
  type: 'subscribe';
  inputStyle: 'solid' | 'outline';
  placeholder?: string;
  buttonText?: string;
  visible?: boolean;
}

export type NewsletterBlock = 
  | NewsletterSubheading 
  | NewsletterHeading 
  | NewsletterText 
  | NewsletterSubscribe;

export type ContentBackgroundType = 'none' | 'solid' | 'outline' | 'shadow' | 'blurred' | 'transparent';
export type WidthType = 'screen' | 'page' | 'large' | 'medium';
export type PositionType = 'left' | 'center' | 'right';
export type AlignmentType = 'left' | 'center';
export type MobilePositionType = 'top' | 'center' | 'bottom';
export type CardStyleType = 'minimal' | 'flat' | 'raised' | 'bordered' | 'rounded' | 'modern';

export interface NewsletterConfig {
  // Color scheme and background
  colorScheme: string;
  colorBackground: boolean;
  
  // Width and ratios
  width: WidthType;
  desktopRatio: number;
  mobileRatio: number;
  
  // Images and video
  desktopImage?: string;
  mobileImage?: string;
  video?: string;
  desktopOverlayOpacity: number;
  mobileOverlayOpacity: number;
  
  // Content position - Desktop
  desktopPosition: PositionType;
  desktopAlignment: AlignmentType;
  desktopWidth: number;
  desktopSpacing: number;
  
  // Content position - Mobile
  mobilePosition: MobilePositionType;
  mobileAlignment: AlignmentType;
  
  // Content background
  desktopContentBackground: ContentBackgroundType;
  mobileContentBackground: ContentBackgroundType;
  
  // Card settings
  cardStyle: CardStyleType;
  cardSize: number; // 50-150 percentage
  
  // Paddings
  addSidePaddings: boolean;
  paddingTop: number;
  paddingBottom: number;
  mobilePaddingTop?: number;
  mobilePaddingBottom?: number;
  
  // Custom CSS
  customCSS?: string;
  
  // Visibility toggle
  enabled?: boolean;
  
  // Child blocks
  blocks: NewsletterBlock[];
}

export const defaultNewsletterConfig: NewsletterConfig = {
  colorScheme: '3',
  colorBackground: false,
  width: 'screen',
  desktopRatio: 0.2,
  mobileRatio: 1.6,
  desktopImage: '',
  mobileImage: '',
  video: '',
  desktopOverlayOpacity: 0,
  mobileOverlayOpacity: 0,
  desktopPosition: 'left',
  desktopAlignment: 'left',
  desktopWidth: 704,
  desktopSpacing: 16,
  mobilePosition: 'top',
  mobileAlignment: 'left',
  desktopContentBackground: 'solid',
  mobileContentBackground: 'solid',
  cardStyle: 'rounded',
  cardSize: 100,
  addSidePaddings: true,
  paddingTop: 10,
  paddingBottom: 85,
  mobilePaddingTop: 20,
  mobilePaddingBottom: 20,
  customCSS: '',
  blocks: []
};

// Helper function to create default blocks
export const createDefaultNewsletterBlocks = (): NewsletterBlock[] => {
  const timestamp = Date.now();
  return [
    {
      id: `subheading-${timestamp}`,
      type: 'subheading',
      text: 'NEWSLETTER',
      visible: true
    },
    {
      id: `heading-${timestamp + 1}`,
      type: 'heading',
      text: 'Subscribe',
      size: 'h4',
      visible: true
    },
    {
      id: `text-${timestamp + 2}`,
      type: 'text',
      content: 'Subscribe for early sale access, new in, promotions, and more.',
      bodySize: 'body3',
      visible: true
    },
    {
      id: `subscribe-${timestamp + 3}`,
      type: 'subscribe',
      inputStyle: 'solid',
      placeholder: 'Correo electrónico',
      buttonText: 'Suscribirse',
      visible: true
    }
  ];
};