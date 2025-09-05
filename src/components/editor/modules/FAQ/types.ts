/**
 * @file types.ts
 * @max-lines 100
 * @module FAQ
 * @description Tipos para la sección del template FAQ
 * @template-section true
 */

import { SectionType } from '@/types/editor.types';

export interface FAQConfig {
  // Configuración básica
  enabled: boolean;
  colorScheme: string; // '1' - '5'
  colorBackground: boolean;
  colorTabs: 'categories' | 'none' | 'all' | 'content_tabs' | 'all_separately' | 'content_tabs_separately';
  
  // Layout y apariencia
  width: 'extra_small' | 'screen' | 'page' | 'large' | 'medium' | 'small';
  layout: 'tabs_bottom' | 'tabs_right' | 'tabs_left';
  expandFirstTab: boolean;
  
  // Content
  heading?: string;
  body?: string;
  headingSize: string; // 'heading_1' - 'heading_6'
  bodySize: string; // 'body_1' - 'body_5'
  headingWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  bodyWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  collapserStyle?: 'plus_minus' | 'chevron' | 'caret' | 'none';
  
  // Button (opcional)
  button?: {
    label?: string;
    link?: string;
    style: 'solid' | 'outline' | 'text';
  };
  
  // Paddings
  addSidePaddings: boolean;
  topPadding: number; // px value
  bottomPadding: number; // px value
  
  // CSS personalizado
  customCss?: string;
  
  // Items/hijos de la sección
  items: FAQItemConfig[];
  // Categorías opcionales
  categories?: FAQCategoryConfig[];
}

export interface FAQItemConfig {
  id: string;
  visible: boolean;
  heading: string; // La pregunta
  categoryId?: string; // Relación con categoría
  icon?: string; // 'none' o nombre del icono
  customIcon?: string; // URL de imagen personalizada
  source: string; // HTML de la respuesta (rich text)
  page?: string; // Página relacionada
  image?: string; // URL de imagen
  video?: string; // URL de video
  desktopImageSize: number; // Porcentaje 0-100
}

export interface FAQCategoryConfig {
  id: string;
  title: string;
  alignment: 'left' | 'center' | 'right';
  visible: boolean;
  items: FAQItemConfig[];
}

export function getDefaultFAQItemConfig(): FAQItemConfig {
  return {
    id: `item_${Date.now()}`,
    visible: true,
    heading: 'Nueva pregunta',
    icon: 'none',
    source: '<p>Ingrese la respuesta aquí...</p>',
    desktopImageSize: 100
  };
}

export function getDefaultFAQConfig(): FAQConfig {
  return {
    enabled: true,
    colorScheme: '1',
    colorBackground: false,
    colorTabs: 'categories',
    width: 'page',
    layout: 'tabs_bottom',
    expandFirstTab: false,
    heading: 'Preguntas Frecuentes',
    body: '',
    headingSize: 'heading_3',
    bodySize: 'body_3',
    headingWeight: 'bold',
    bodyWeight: 'normal',
    collapserStyle: 'plus_minus',
    addSidePaddings: false,
    topPadding: 96,
    bottomPadding: 96,
    items: [],
    categories: []
  };
}

// Tipo de sección para el editor
export const FAQSectionType = SectionType.FAQ;