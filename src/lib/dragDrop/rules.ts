/**
 * Drag & Drop Rules Engine
 * Defines all business rules for section movements
 */

import { SectionType } from '@/types/editor.types';
import { GroupId, DragItem, DropZone } from './types';
import { GROUP_RESTRICTIONS } from './constants';

/**
 * Check if a section can be moved from one group to another
 */
export function canMoveToGroup(
  sourceGroup: GroupId,
  targetGroup: GroupId
): boolean {
  // Can't move structural components between groups
  if (sourceGroup !== targetGroup) {
    const restrictions = GROUP_RESTRICTIONS[sourceGroup];
    return restrictions.canMoveTo.includes(targetGroup);
  }
  return true;
}

/**
 * Check if a group can receive a specific section type
 */
export function canGroupReceiveType(
  groupId: GroupId,
  sectionType: SectionType
): boolean {
  const restrictions = GROUP_RESTRICTIONS[groupId];
  
  // If allowedTypes is empty, it means dynamic (template group)
  if (restrictions.allowedTypes.length === 0) {
    // Template can receive most section types except structural ones
    const structuralTypes = [
      SectionType.HEADER,
      SectionType.FOOTER,
      SectionType.ANNOUNCEMENT_BAR,
      SectionType.CART_DRAWER,
      SectionType.SEARCH_DRAWER
    ];
    return !structuralTypes.includes(sectionType);
  }
  
  return restrictions.allowedTypes.includes(sectionType);
}

/**
 * Check if moving a section would violate fixed order rules
 */
export function validateFixedOrder(
  groupId: GroupId,
  sectionType: SectionType,
  targetIndex: number,
  currentSections: Array<{ type: SectionType }>
): boolean {
  const restrictions = GROUP_RESTRICTIONS[groupId];
  
  if (!restrictions.fixedOrder) {
    return true; // No fixed order rules
  }
  
  // Check if this section type has a fixed position
  const fixedIndex = restrictions.fixedOrder.indexOf(sectionType);
  if (fixedIndex === -1) {
    return true; // Not in fixed order list
  }
  
  // Check sections before target position
  for (let i = 0; i < targetIndex; i++) {
    const otherType = currentSections[i]?.type;
    const otherFixedIndex = restrictions.fixedOrder.indexOf(otherType);
    
    if (otherFixedIndex > fixedIndex) {
      // There's a section that should come after this one
      return false;
    }
  }
  
  // Check sections after target position
  for (let i = targetIndex; i < currentSections.length; i++) {
    const otherType = currentSections[i]?.type;
    const otherFixedIndex = restrictions.fixedOrder.indexOf(otherType);
    
    if (otherFixedIndex !== -1 && otherFixedIndex < fixedIndex) {
      // There's a section that should come before this one
      return false;
    }
  }
  
  return true;
}

/**
 * Check if a section can be nested inside another
 */
export function canNestSection(
  parentType: SectionType,
  childType: SectionType
): boolean {
  // Define which sections can contain others
  const containerTypes = [
    SectionType.IMAGE_WITH_TEXT,
    (SectionType as any).PRODUCT_GRID
  ];
  
  // Structural components cannot be nested
  const nonNestableTypes = [
    SectionType.HEADER,
    SectionType.FOOTER,
    SectionType.ANNOUNCEMENT_BAR,
    SectionType.CART_DRAWER
  ];
  
  if (nonNestableTypes.includes(childType)) {
    return false;
  }
  
  return containerTypes.includes(parentType);
}

/**
 * Check if section types are siblings (can be reordered with each other)
 */
export function areSiblingTypes(
  type1: SectionType,
  type2: SectionType,
  groupId: GroupId
): boolean {
  const restrictions = GROUP_RESTRICTIONS[groupId];
  
  // Both must be allowed in the group
  if (!canGroupReceiveType(groupId, type1) || !canGroupReceiveType(groupId, type2)) {
    return false;
  }
  
  // If there's a fixed order, check they don't violate it
  if (restrictions.fixedOrder) {
    const index1 = restrictions.fixedOrder.indexOf(type1);
    const index2 = restrictions.fixedOrder.indexOf(type2);
    
    // If both are in fixed order, they can't be reordered
    if (index1 !== -1 && index2 !== -1) {
      return false;
    }
  }
  
  return true;
}

/**
 * Master validation function
 */
export function validateDrop(
  dragItem: DragItem,
  dropZone: DropZone | null
): { valid: boolean; reason?: string } {
  if (!dropZone) {
    return { valid: false, reason: 'No valid drop zone' };
  }
  
  // Rule 1: Check group restrictions
  if (!canMoveToGroup(dragItem.groupId, dropZone.groupId)) {
    return { 
      valid: false, 
      reason: `Cannot move from ${dragItem.groupId} to ${dropZone.groupId}` 
    };
  }
  
  // Rule 2: Check if group accepts this section type
  if (!canGroupReceiveType(dropZone.groupId, dragItem.type)) {
    return { 
      valid: false, 
      reason: `${dropZone.groupId} does not accept ${dragItem.type} sections` 
    };
  }
  
  // Rule 3: Don't allow dropping on itself
  if (dragItem.id === dropZone.groupId && dragItem.index === dropZone.index) {
    return { valid: false, reason: 'Cannot drop on itself' };
  }
  
  return { valid: true };
}