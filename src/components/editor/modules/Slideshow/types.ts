/**
 * @file types.ts
 * @module Slideshow
 * Type definitions for Slideshow module
 */

export interface SlideConfig {
  id: string;
  // Image
  desktopImage: string;
  mobileImage: string;
  
  // Video
  desktopVideo: string;
  mobileVideo: string;
  
  // Video overlay
  desktopOverlayOpacity: number;
  mobileOverlayOpacity: number;
  
  // Content
  subheading: string;
  heading: string;
  body: string;
  headingSize: number; // 20-80px for desktop, controls individual slide heading size
  bodySize: number; // 12-24px, controls individual slide body text size
  
  // Content position
  desktopPosition: 'top-left' | 'top-center' | 'top-right' | 
                   'center-left' | 'center' | 'center-right' | 
                   'bottom-left' | 'bottom-center' | 'bottom-right';
  desktopAlignment: 'left' | 'center' | 'right';
  desktopWidth: number; // 200-800px
  desktopSpacing: number; // 0-200px
  mobilePosition: 'top' | 'center' | 'bottom';
  mobileAlignment: 'left' | 'center';
  
  // Content background
  desktopBackground: 'solid' | 'outline' | 'shadow' | 'blurred' | 'transparent' | 'none';
  mobileBackground: 'solid' | 'outline' | 'shadow' | 'blurred' | 'transparent' | 'none';
  
  // Buttons
  firstButtonLabel: string;
  firstButtonLink: string;
  firstButtonStyle: 'solid' | 'outline' | 'text';
  secondButtonLabel: string;
  secondButtonLink: string;
  secondButtonStyle: 'solid' | 'outline' | 'text';
  
  // Legacy compatibility (deprecated - usar desktopAlignment)
  contentAlignment?: 'left' | 'center' | 'right';
  buttonText?: string;
  secondButtonText?: string;
  buttonLink?: string;
  buttonStyle?: string;
  
  // Visibility
  visible: boolean;
}

export interface SlideshowConfig {
  // General
  colorScheme: '1' | '2' | '3' | '4' | '5';
  colorBackground: boolean;
  width: 'screen' | 'page' | 'large';
  desktopRatio: number; // 0.1-2.0
  mobileRatio: number; // 0.1-2.0
  
  // Navigation
  showNavigationCircles: boolean;
  showNavigationArrows: 'never' | 'always' | 'hover';
  desktopArrowsPosition: 'corner' | 'sides';
  transitionStyle: 'fade' | 'swipe' | 'seamless';
  
  // Autoplay
  autoplayMode: 'none' | 'one-at-a-time';
  autoplaySpeed: number; // 3-10 seconds
  showPlayPauseButton: boolean;
  
  // Accessibility
  slideshowAltText: string;
  
  // Paddings
  addSidePaddings: boolean;
  topPadding: number; // 0-120px
  bottomPadding: number; // 0-120px
  
  // Slides
  slides: SlideConfig[];
}

export function getDefaultSlideshowConfig(): SlideshowConfig {
  return {
    colorScheme: '1',
    colorBackground: false,
    width: 'screen',
    desktopRatio: 0.4,
    mobileRatio: 1.6,
    showNavigationCircles: true,
    showNavigationArrows: 'hover',
    desktopArrowsPosition: 'corner',
    transitionStyle: 'swipe',
    autoplayMode: 'none',
    autoplaySpeed: 3,
    showPlayPauseButton: false,
    slideshowAltText: 'Slideshow about our brand',
    addSidePaddings: false,
    topPadding: 48,
    bottomPadding: 48,
    slides: []
  };
}

export function getDefaultSlideConfig(): SlideConfig {
  return {
    id: `slide-${Date.now()}`,
    desktopImage: '',
    mobileImage: '',
    desktopVideo: '',
    mobileVideo: '',
    desktopOverlayOpacity: 20,
    mobileOverlayOpacity: 20,
    subheading: 'IMAGE SLIDE',
    heading: 'Image with text',
    body: 'Fill in the text to tell customers by what your products are inspired.',
    headingSize: 48, // Default 48px for heading
    bodySize: 16, // Default 16px for body
    desktopPosition: 'bottom-center',
    desktopAlignment: 'center',
    desktopWidth: 560,
    desktopSpacing: 116,
    mobilePosition: 'center',
    mobileAlignment: 'center',
    desktopBackground: 'none',
    mobileBackground: 'none',
    firstButtonLabel: 'Button label',
    firstButtonLink: '',
    firstButtonStyle: 'solid',
    secondButtonLabel: 'Button label',
    secondButtonLink: '',
    secondButtonStyle: 'outline',
    visible: true
  };
}