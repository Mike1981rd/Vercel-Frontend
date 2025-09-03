/**
 * Drag & Drop Validators
 * Runtime validation functions for drag operations
 */

import { Section } from '@/types/editor.types';
import { DragItem, DropZone, ValidationResult, GroupId } from './types';
import { 
  canMoveToGroup, 
  canGroupReceiveType, 
  validateFixedOrder,
  validateDrop 
} from './rules';

/**
 * Validate if a drag operation is allowed
 */
export function validateDragOperation(
  dragItem: DragItem,
  dropZone: DropZone | null,
  currentSections: Record<GroupId, Section[]>
): ValidationResult {
  // Basic validation
  if (!dropZone) {
    return {
      isValid: false,
      reason: 'Invalid drop zone',
      suggestedAction: 'Drop the section in a valid area'
    };
  }

  // Use master validation from rules
  const basicValidation = validateDrop(dragItem, dropZone);
  if (!basicValidation.valid) {
    return {
      isValid: false,
      reason: basicValidation.reason,
      suggestedAction: getSuggestedAction(basicValidation.reason || '')
    };
  }

  // Additional validation for fixed order
  const targetSections = currentSections[dropZone.groupId] || [];
  const isValidOrder = validateFixedOrder(
    dropZone.groupId,
    dragItem.type,
    dropZone.index,
    targetSections
  );

  if (!isValidOrder) {
    return {
      isValid: false,
      reason: 'This would violate the fixed order of sections',
      suggestedAction: 'Some sections must maintain a specific order'
    };
  }

  // Check max items limit
  if (dropZone.maxItems && targetSections.length >= dropZone.maxItems) {
    return {
      isValid: false,
      reason: `Maximum ${dropZone.maxItems} sections allowed in this group`,
      suggestedAction: 'Remove a section before adding a new one'
    };
  }

  return { isValid: true };
}

/**
 * Get a user-friendly suggestion based on validation failure
 */
function getSuggestedAction(reason: string): string {
  if (reason.includes('Cannot move from')) {
    return 'Sections can only be reordered within their own group';
  }
  if (reason.includes('does not accept')) {
    return 'This section type is not allowed in this area';
  }
  if (reason.includes('Cannot drop on itself')) {
    return 'Move the section to a different position';
  }
  return 'Try dropping in a different location';
}

/**
 * Check if two sections can be swapped
 */
export function canSwapSections(
  section1: Section,
  section2: Section,
  group1: GroupId,
  group2: GroupId
): boolean {
  // Can't swap between different groups
  if (group1 !== group2) {
    return false;
  }

  // Both must be allowed in their respective groups
  return canGroupReceiveType(group1, section1.type) &&
         canGroupReceiveType(group2, section2.type);
}

/**
 * Validate batch reorder operations
 */
export function validateBatchReorder(
  operations: Array<{
    sectionId: string;
    fromGroup: GroupId;
    toGroup: GroupId;
    fromIndex: number;
    toIndex: number;
  }>
): ValidationResult {
  // Check each operation
  for (const op of operations) {
    if (!canMoveToGroup(op.fromGroup, op.toGroup)) {
      return {
        isValid: false,
        reason: `Cannot move sections between ${op.fromGroup} and ${op.toGroup}`,
        suggestedAction: 'Reorder sections within their own groups'
      };
    }
  }

  return { isValid: true };
}

/**
 * Get valid drop zones for a dragged item
 */
export function getValidDropZones(
  dragItem: DragItem,
  allGroups: Record<GroupId, Section[]>
): GroupId[] {
  const validZones: GroupId[] = [];

  for (const groupId of Object.keys(allGroups) as GroupId[]) {
    if (canMoveToGroup(dragItem.groupId, groupId) &&
        canGroupReceiveType(groupId, dragItem.type)) {
      validZones.push(groupId);
    }
  }

  return validZones;
}

/**
 * Check if a section is draggable
 */
export function isSectionDraggable(section: Section): boolean {
  // All sections are draggable for reordering
  // But some might have restrictions on where they can go
  return section.visible !== false;
}