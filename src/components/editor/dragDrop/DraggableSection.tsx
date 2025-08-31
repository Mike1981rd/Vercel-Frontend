'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section } from '@/types/editor.types';
import { GroupId, DragItem } from '@/lib/dragDrop/types';
import { GripVertical } from 'lucide-react';
import { DropIndicator } from './DropIndicator';

interface DraggableSectionProps {
  section: Section;
  groupId: GroupId;
  index: number;
  children: React.ReactNode;
  isDragOverlay?: boolean;
}

export function DraggableSection({ 
  section, 
  groupId, 
  index, 
  children,
  isDragOverlay = false 
}: DraggableSectionProps) {
  const dragItem: DragItem = {
    id: section.id,
    type: section.type,
    groupId,
    index,
    section
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    active
  } = useSortable({
    id: section.id,
    data: dragItem,
    disabled: false // Permitir drag incluso si no está visible
  });

  // Determinar si mostrar el indicador de drop
  const showDropIndicator = isOver && active?.id !== section.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    opacity: isDragging && !isDragOverlay ? 0.4 : 1
  };

  return (
    <>
      {/* Drop Indicator - Aparece arriba de la sección cuando está sobre ella */}
      {showDropIndicator && (
        <div className="relative w-full py-1 -mt-1 -mb-1">
          <DropIndicator isActive={true} />
        </div>
      )}
      
      <div 
        ref={setNodeRef} 
        style={style}
        className={`
          relative group transition-all duration-200
          ${isDragging && !isDragOverlay ? 'z-50 shadow-2xl' : ''}
          ${!section.visible ? 'opacity-50' : ''}
        `}
      >
        {/* Drag Handle - Minimalista */}
        <div 
          {...attributes}
          {...listeners}
          className={`
            absolute top-1/2 -translate-y-1/2
            w-5 h-6 flex items-center justify-center
            cursor-grab active:cursor-grabbing
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            hover:bg-gray-100 dark:hover:bg-gray-800 rounded
            ${isDragging ? 'opacity-100 bg-gray-100 dark:bg-gray-800' : ''}
            z-10
          `}
          style={{ 
            left: '-26px'
          }}
          title="Arrastrar para reordenar"
        >
          <GripVertical className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Section Content */}
        {children}
      </div>
    </>
  );
}