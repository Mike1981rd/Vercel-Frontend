/**
 * Drag & Drop Constants and Configuration
 */

import { SectionType } from '@/types/editor.types';
import { GroupRestrictions, GroupId } from './types';

// Visual feedback styles
export const DRAG_STATES = {
  idle: {
    opacity: 1,
    cursor: 'grab',
    transform: 'scale(1)'
  },
  dragging: {
    opacity: 0.5,
    cursor: 'grabbing',
    transform: 'scale(1.02)'
  },
  validDrop: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  invalidDrop: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    cursor: 'not-allowed'
  }
} as const;

// Animation configuration
export const ANIMATION_CONFIG = {
  duration: 200,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
} as const;

// Maximum nesting level for sections
export const MAX_NESTING_LEVEL = 2;

// Group restrictions configuration
export const GROUP_RESTRICTIONS: Record<GroupId, GroupRestrictions> = {
  headerGroup: {
    canReceiveFrom: ['headerGroup'],
    canMoveTo: ['headerGroup'],
    allowedTypes: [
      SectionType.HEADER,
      SectionType.ANNOUNCEMENT_BAR
    ]
    // Removed fixedOrder - now Header and AnnouncementBar can be reordered freely
  },
  template: {
    canReceiveFrom: ['template'],
    canMoveTo: ['template'],
    allowedTypes: [] // Dynamic based on page type
  },
  footerGroup: {
    canReceiveFrom: ['footerGroup'],
    canMoveTo: ['footerGroup'],
    allowedTypes: [
      SectionType.FOOTER
    ]
  },
  asideGroup: {
    canReceiveFrom: ['asideGroup'],
    canMoveTo: ['asideGroup'],
    allowedTypes: [
      SectionType.CART_DRAWER,
      SectionType.SEARCH_DRAWER
    ]
  }
};