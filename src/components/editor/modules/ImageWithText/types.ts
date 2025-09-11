/**
 * @file types.ts
 * @max-lines 100
 * @module ImageWithText
 * @description Tipos para la sección del template ImageWithText
 * @template-section true
 */

import { SectionType } from '@/types/editor.types';

// Estructura para cada item hijo (imagen/video)
export interface ImageWithTextItem {
  id: string;
  type: 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  altText?: string;
  visible: boolean;
}

export interface ImageWithTextConfig {
  // Configuración básica de la sección
  enabled: boolean;
  colorScheme: string;
  
  // Layout y apariencia
  width: 'small' | 'medium' | 'large' | 'page';
  contentLayout: 'left' | 'right';
  imageLayout: 'grid' | 'collage';
  imageRatio: number;
  mobileImageRatio?: number;
  rotateImages: boolean;
  imageBorderRadius: number; // New: control border radius (0-20px)
  icon?: string;
  
  // Contenido
  subheading?: string;
  heading?: string;
  body?: string;
  headingSize: number;
  bodySize: number;
  contentAlignment: 'left' | 'center' | 'right';
  desktopWidth: number;
  
  // Items (hijos - imágenes/videos)
  items: ImageWithTextItem[];
  
  // Botones
  firstButtonLabel?: string;
  firstButtonLink?: string;
  firstButtonStyle: 'solid' | 'outline' | 'text';
  secondButtonLabel?: string;
  secondButtonLink?: string;
  secondButtonStyle: 'solid' | 'outline' | 'text';
  
  // Padding
  addSidePaddings: boolean;
  topPadding: number;
  bottomPadding: number;
  mobileTopPadding?: number;
  mobileBottomPadding?: number;
  
  // CSS personalizado
  customCss?: string;
}

export function getDefaultImageWithTextConfig(): ImageWithTextConfig {
  return {
    enabled: true,
    colorScheme: '1',
    width: 'large',
    contentLayout: 'left',
    imageLayout: 'grid',
    imageRatio: 0.8,
    mobileImageRatio: 0.9,
    rotateImages: false,
    imageBorderRadius: 12,
    
    subheading: '',
    heading: 'Why Choose Us?',
    body: 'Share information about your brand with your customers.',
    headingSize: 36,
    bodySize: 16,
    contentAlignment: 'left',
    desktopWidth: 360,
    
    items: [], // Array vacío de items
    
    firstButtonLabel: '',
    firstButtonLink: '',
    firstButtonStyle: 'solid',
    secondButtonLabel: '',
    secondButtonLink: '',
    secondButtonStyle: 'outline',
    
    addSidePaddings: false,
    topPadding: 48,
    bottomPadding: 80,
    mobileTopPadding: 20,
    mobileBottomPadding: 20,
    
    customCss: ''
  };
}

// Tipo de sección para el editor
export const ImageWithTextSectionType = SectionType.IMAGE_WITH_TEXT;
