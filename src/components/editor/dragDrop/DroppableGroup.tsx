'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Section } from '@/types/editor.types';
import { GroupId, DropZone } from '@/lib/dragDrop/types';
import { GROUP_RESTRICTIONS } from '@/lib/dragDrop/constants';

interface DroppableGroupProps {
  groupId: GroupId;
  sections: Section[];
  children: React.ReactNode;
  className?: string;
}

export function DroppableGroup({ 
  groupId, 
  sections, 
  children,
  className = ''
}: DroppableGroupProps) {
  const dropZone: DropZone = {
    groupId,
    index: sections.length,
    accepts: GROUP_RESTRICTIONS[groupId].allowedTypes,
    maxItems: GROUP_RESTRICTIONS[groupId].maxItems
  };

  const { setNodeRef, isOver, active } = useDroppable({
    id: `${groupId}-drop`,
    data: dropZone
  });

  // Get drag item data
  const draggedItem = active?.data?.current as any;
  const canDrop = draggedItem && 
    GROUP_RESTRICTIONS[groupId].canReceiveFrom.includes(draggedItem.groupId);

  // Visual feedback
  const dropIndicatorClass = isOver && canDrop
    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
    : isOver && !canDrop
    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
    : '';

  return (
    <div 
      ref={setNodeRef}
      className={`
        min-h-[100px] rounded-lg border-2 border-dashed border-transparent
        transition-all duration-200
        ${dropIndicatorClass}
        ${className}
      `}
    >
      <SortableContext 
        items={sections.map(s => s.id)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>

      {/* Empty state */}
      {sections.length === 0 && !isOver && (
        <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
          No sections in this group
        </div>
      )}

      {/* Drop feedback */}
      {isOver && !canDrop && (
        <div className="p-2 text-xs text-red-600 dark:text-red-400 text-center">
          Cannot move sections between different groups
        </div>
      )}
    </div>
  );
}