/**
 * Drag & Drop Types and Interfaces
 * Keeps all type definitions in one place
 */

import { SectionType, Section } from '@/types/editor.types';

export type GroupId = 'headerGroup' | 'asideGroup' | 'template' | 'footerGroup';

export interface DragItem {
  id: string;
  type: SectionType;
  groupId: GroupId;
  index: number;
  section: Section;
}

export interface DropZone {
  groupId: GroupId;
  index: number;
  accepts: SectionType[];
  maxItems?: number;
}

export interface DragState {
  isDragging: boolean;
  draggedItem: DragItem | null;
  draggedOverGroup: GroupId | null;
  draggedOverIndex: number | null;
  canDrop: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  suggestedAction?: string;
}

export interface GroupRestrictions {
  canReceiveFrom: GroupId[];
  canMoveTo: GroupId[];
  allowedTypes: SectionType[];
  fixedOrder?: SectionType[];
  maxItems?: number;
}

export interface DragEndEvent {
  active: {
    id: string;
    data: {
      current?: DragItem;
    };
  };
  over: {
    id: string;
    data?: {
      current?: DropZone;
    };
  } | null;
}

export interface DragOverEvent {
  active: {
    id: string;
    data: {
      current?: DragItem;
    };
  };
  over: {
    id: string;
    data?: {
      current?: DropZone;
    };
  } | null;
}

export type DragFeedbackType = 'idle' | 'dragging' | 'valid-drop' | 'invalid-drop';