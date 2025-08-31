'use client';

import { useState, useCallback } from 'react';
import { 
  DragEndEvent as DndDragEndEvent,
  DragOverEvent as DndDragOverEvent,
  DragStartEvent,
  UniqueIdentifier
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useEditorStore } from '@/stores/useEditorStore';
import { Section } from '@/types/editor.types';
import { 
  DragItem, 
  GroupId, 
  DragState,
  ValidationResult 
} from '@/lib/dragDrop/types';
import { validateDragOperation } from '@/lib/dragDrop/validators';

export function useSectionDragDrop() {
  const { 
    sections, 
    reorderSections, 
    saveHistory
  } = useEditorStore();

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    draggedOverGroup: null,
    draggedOverIndex: null,
    canDrop: false
  });

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Get active section for overlay
  const getActiveSection = useCallback((): Section | null => {
    if (!activeId) return null;
    
    for (const group of Object.values(sections)) {
      const section = group.find(s => s.id === activeId);
      if (section) return section;
    }
    return null;
  }, [activeId, sections]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const dragItem = active.data.current as DragItem;
    
    if (!dragItem) return;

    setActiveId(active.id);
    setDragState({
      isDragging: true,
      draggedItem: dragItem,
      draggedOverGroup: null,
      draggedOverIndex: null,
      canDrop: false
    });

    // No need to save history here, only save after actual changes
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((event: DndDragOverEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDragState(prev => ({
        ...prev,
        draggedOverGroup: null,
        draggedOverIndex: null,
        canDrop: false
      }));
      return;
    }

    const dragItem = active.data.current as DragItem;
    const dropData = over.data?.current as any;
    
    if (!dragItem || !dropData) return;

    // Determine target group and index
    let targetGroup: GroupId;
    let targetIndex: number;

    if (dropData.groupId) {
      // Dropping on a group
      targetGroup = dropData.groupId;
      targetIndex = dropData.index || 0;
    } else if (dropData.section) {
      // Dropping on another section
      targetGroup = dropData.groupId;
      targetIndex = dropData.index;
    } else {
      return;
    }

    // Validate the drop
    const validation = validateDragOperation(
      dragItem,
      { groupId: targetGroup, index: targetIndex, accepts: [] },
      sections
    );

    setDragState(prev => ({
      ...prev,
      draggedOverGroup: targetGroup,
      draggedOverIndex: targetIndex,
      canDrop: validation.isValid
    }));
  }, [sections]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DndDragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setDragState({
      isDragging: false,
      draggedItem: null,
      draggedOverGroup: null,
      draggedOverIndex: null,
      canDrop: false
    });

    if (!over) return;

    const dragItem = active.data.current as DragItem;
    const overItem = over.data?.current as DragItem;
    
    if (!dragItem) return;

    // If dropping on the same item, do nothing
    if (active.id === over.id) return;

    const sourceGroup = dragItem.groupId;
    const sourceIndex = dragItem.index;
    
    // Determine target position
    let targetGroup = sourceGroup;
    let targetIndex = sourceIndex;

    if (overItem?.groupId) {
      targetGroup = overItem.groupId;
      targetIndex = overItem.index;
    }

    // Validate the move
    const validation = validateDragOperation(
      dragItem,
      { groupId: targetGroup, index: targetIndex, accepts: [] },
      sections
    );

    if (!validation.isValid) {
      console.warn('Invalid drop:', validation.reason);
      return;
    }

    // Only allow reordering within the same group
    if (sourceGroup === targetGroup) {
      // Get the current sections in the group
      const groupSections = [...sections[sourceGroup]];
      
      // Find the actual indices
      const oldIndex = groupSections.findIndex(s => s.id === active.id);
      const newIndex = groupSections.findIndex(s => s.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        console.log(`[DragDrop] Reordering in ${sourceGroup}: ${oldIndex} -> ${newIndex}`);
        // Reorder using the store function (this will set isDirty automatically)
        reorderSections(sourceGroup, oldIndex, newIndex);
        // Save to history after successful reorder
        saveHistory();
      }
    }
  }, [sections, reorderSections, saveHistory]);

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setDragState({
      isDragging: false,
      draggedItem: null,
      draggedOverGroup: null,
      draggedOverIndex: null,
      canDrop: false
    });
  }, []);

  return {
    dragState,
    activeSection: getActiveSection(),
    handlers: {
      handleDragStart,
      handleDragOver,
      handleDragEnd,
      handleDragCancel
    }
  };
}