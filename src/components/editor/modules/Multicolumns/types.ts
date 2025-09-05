/**
 * @file types.ts
 * @max-lines 100
 * @module Multicolumns
 * @description Tipos para la sección del template Multicolumns
 * @template-section true
 */

import { SectionType } from '@/types/editor.types';

export interface MulticolumnsConfig {
  // Configuración básica de la sección
  enabled: boolean;
  colorScheme: string;
  
  // Layout y apariencia
  width: 'screen' | 'page' | 'large' | 'medium';
  desktopLayout: 'grid' | 'carousel';
  mobileLayout: '1column' | 'carousel' | 'slideshow';
  
  // Contenido principal
  heading: string;
  body: string;
  headingSize: number; // Factor de escala para override de tamaño
  bodySize: number; // Factor de escala para override de tamaño
  contentAlignment: 'left' | 'center' | 'right';
  iconAlignment?: 'left' | 'center' | 'right'; // Alineación independiente para iconos
  
  // Configuración de columnas
  columnsHeadingSize: number; // Tamaño para headings de columnas
  columnsBodySize: number; // Tamaño para body de columnas
  
  // Layout de tarjetas
  desktopCardsPerRow: number;
  desktopSpaceBetweenCards: number;
  desktopSpacing: number;
  mobileSpaceBetweenCards: number; 
  mobileSpacing: number;
  
  // Opciones visuales
  colorColumns: boolean;
  showArrowsOnHover: boolean;
  
  // Botón opcional
  buttonLabel: string;
  buttonLink: string;
  buttonStyle: 'solid' | 'outline';
  
  // Autoplay
  autoplay: 'none' | 'oneAtATime' | 'seamless';
  autoplaySpeed?: number;
  
  // Paddings & Sizing
  addSidePaddings: boolean;
  topPadding: number;
  bottomPadding: number;
  containerHeight: number; // Min height in pixels, 0 = auto
  
  // CSS personalizado
  customCSS: string;
  
  // Items/hijos de la sección
  items: MulticolumnsItemConfig[];
}

export interface MulticolumnsItemConfig {
  id: string;
  type: 'icon' | 'image'; // Tipo de columna
  visible: boolean;
  
  // Para icon columns
  icon?: string; // Nombre del icono o 'custom'
  customIcon?: string; // SVG personalizado si icon === 'custom'
  iconSize?: number;
  
  // Para image columns
  image?: string; // URL de la imagen
  video?: string; // URL del video opcional
  desktopImageSize?: number; // Tamaño de imagen desktop
  mobileImageSize?: number; // Tamaño de imagen mobile
  imageRatio?: number; // Relación de aspecto de imagen
  
  // Campos comunes
  heading: string;
  body: string;
  linkLabel: string;
  link: string;
}

export function getDefaultMulticolumnsItemConfig(type: 'icon' | 'image' = 'icon'): MulticolumnsItemConfig {
  const baseConfig = {
    id: `item_${Date.now()}`,
    type,
    visible: true,
    heading: type === 'icon' ? 'Icon column' : 'Image column',
    body: 'Pair text with an image to focus on your chosen product, collection or piece of news. Add details on shipping and return conditions, product availability, care instructions, matching colors and accessories.',
    linkLabel: 'Link label',
    link: ''
  };

  if (type === 'icon') {
    return {
      ...baseConfig,
      icon: 'star',
      iconSize: 64
    };
  } else {
    return {
      ...baseConfig,
      image: '',
      video: '',
      desktopImageSize: 100,
      mobileImageSize: 100,
      imageRatio: 1
    };
  }
}

export function getDefaultMulticolumnsConfig(): MulticolumnsConfig {
  return {
    enabled: true,
    colorScheme: '1',
    width: 'large',
    desktopLayout: 'grid',
    mobileLayout: '1column',
    heading: 'Multicolumn',
    body: '',
    headingSize: 1.0,
    bodySize: 1.0,
    contentAlignment: 'left',
    columnsHeadingSize: 1.0,
    columnsBodySize: 1.0,
    desktopCardsPerRow: 3,
    desktopSpaceBetweenCards: 24,
    desktopSpacing: 24,
    mobileSpaceBetweenCards: 16,
    mobileSpacing: 24,
    colorColumns: false,
    showArrowsOnHover: false,
    buttonLabel: '',
    buttonLink: '',
    buttonStyle: 'solid',
    autoplay: 'none',
    addSidePaddings: false,
    topPadding: 0,
    bottomPadding: 0,
    containerHeight: 0,
    customCSS: '',
    items: [
      getDefaultMulticolumnsItemConfig('icon'),
      { ...getDefaultMulticolumnsItemConfig('icon'), id: `item_${Date.now() + 1}` },
      { ...getDefaultMulticolumnsItemConfig('icon'), id: `item_${Date.now() + 2}` }
    ]
  };
}

// Tipo de sección para el editor
export const MulticolumnsSectionType = SectionType.MULTICOLUMNS;
