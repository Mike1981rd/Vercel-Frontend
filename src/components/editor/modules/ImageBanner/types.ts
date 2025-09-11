/**
 * @file types.ts
 * @max-lines 100
 * @current-lines 50
 * TypeScript types for Image Banner module
 */

export interface ImageBannerConfig {
  // General
  colorScheme: '1' | '2' | '3' | '4' | '5';
  colorBackground: boolean;
  showOnlyOnHomePage: boolean;
  width: 'small' | 'medium' | 'large' | 'page' | 'screen';
  desktopRatio: number;
  mobileRatio: number;
  
  // Media
  desktopImage: string;
  mobileImage?: string;
  desktopOverlayOpacity: number;
  mobileOverlayOpacity: number;
  videoSound: boolean; // Enable/disable sound for videos
  
  // Content
  subheading: string;
  heading: string;
  body: string;
  headingSize: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  bodySize: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  headingFontWeight?: string;
  bodyFontWeight?: string;
  
  // Position
  desktopPosition: 'top-left' | 'top-center' | 'top-right' | 
                   'center-left' | 'center' | 'center-right' | 
                   'bottom-left' | 'bottom-center' | 'bottom-right';
  desktopAlignment: 'left' | 'center';
  desktopWidth: number;
  desktopSpacing: number;
  mobilePosition: 'top' | 'center' | 'bottom';
  mobileAlignment: 'left' | 'center';
  
  // Background
  desktopBackground: 'solid' | 'outline' | 'blurred' | 'shadow' | 'transparent' | 'none';
  mobileBackground: 'solid' | 'outline' | 'blurred' | 'shadow' | 'transparent' | 'none';
  
  // Buttons
  firstButtonLabel: string;
  firstButtonLink: string;
  firstButtonStyle: 'solid' | 'outline' | 'text';
  secondButtonLabel?: string;
  secondButtonLink?: string;
  secondButtonStyle?: 'solid' | 'outline' | 'text';
  
  // Spacing
  addSidePaddings: boolean;
  topPadding: number;
  bottomPadding: number;
  mobileTopPadding?: number;
  mobileBottomPadding?: number;
}