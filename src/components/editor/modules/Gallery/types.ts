/**
 * @file types.ts
 * @max-lines 100
 * @module Gallery
 * @description Tipos para la sección del template Gallery
 * @template-section true
 */

import { SectionType } from '@/types/editor.types';

export interface GalleryConfig {
  // Configuración básica
  enabled: boolean;
  colorScheme: string;
  
  // Layout
  maxImagesPerRowDesktop: number;
  imagesPerRowMobile: number;
  imageHeight: 'natural' | 'fixed';
  desktopImageRowHeights?: number;
  mobileImageRowHeights?: number;
  
  // Typography
  desktopHeadingTextSize?: number;
  mobileHeadingTextSize?: number;
  
  // Spacing
  addSpacingBetweenImages: boolean;
  addSpacingAroundSection: boolean;
  fullPageWidth: boolean;
  maximumPageWidth?: number;
  
  // Appearance
  overlayStyle: 'tint' | 'box' | 'text' | 'shadow' | 'text-shadow-tint' | 'no-background';
  overlayPadding: 'standard' | 'large';
  buttonStyle: 'primary' | 'secondary' | 'link';
  imageQuality: 'high' | 'hd';
  
  // Mobile
  enableMobileCarousel: boolean;
  
  // Animations
  animateTextAndImagesOnScroll: boolean;
  disableAnimationsOnFirstSection: boolean;
  
  // Custom CSS
  customCSS?: string;
  
  // Items/hijos de la sección
  items: GalleryItemConfig[];
}

export interface GalleryItemConfig {
  id: string;
  visible: boolean;
  
  // Media
  image?: string;
  imageAlt?: string;
  video?: string;
  enlargeMedia: boolean;
  
  // Content
  subheading?: string;
  heading?: string;
  button?: string;
  link?: string;
  
  // Layout
  textOverlayPosition: 'top-left' | 'top-center' | 'top-right' | 
                       'middle-left' | 'middle-center' | 'middle-right' | 
                       'bottom-left' | 'bottom-center' | 'bottom-right';
}

export function getDefaultGalleryItemConfig(): GalleryItemConfig {
  return {
    id: `item_${Date.now()}`,
    visible: true,
    enlargeMedia: false,
    image: '',
    imageAlt: '',
    video: '',
    subheading: '',
    heading: 'Gallery Item',
    button: 'Shop Now',
    link: '',
    textOverlayPosition: 'bottom-center'
  };
}

export function getDefaultGalleryConfig(): GalleryConfig {
  return {
    enabled: true,
    colorScheme: '1',
    maxImagesPerRowDesktop: 2,
    imagesPerRowMobile: 1,
    imageHeight: 'natural',
    desktopImageRowHeights: 370,
    mobileImageRowHeights: 480,
    desktopHeadingTextSize: 28,
    mobileHeadingTextSize: 34,
    addSpacingBetweenImages: false,
    addSpacingAroundSection: false,
    fullPageWidth: false,
    maximumPageWidth: 1600,
    overlayStyle: 'text-shadow-tint',
    overlayPadding: 'standard',
    buttonStyle: 'secondary',
    imageQuality: 'high',
    enableMobileCarousel: false,
    animateTextAndImagesOnScroll: false,
    disableAnimationsOnFirstSection: false,
    customCSS: '',
    items: []
  };
}

// Tipo de sección para el editor
export const GallerySectionType = SectionType.GALLERY;
