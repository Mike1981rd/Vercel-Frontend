/**
 * @file GalleryChildren.tsx
 * @max-lines 300
 * @module Gallery
 * @description Maneja los items de la sección Gallery en el sidebar
 */

'use client';

import React, { useMemo } from 'react';
import { Plus, Eye, EyeOff, Trash2, GripVertical, Image, ChevronRight } from 'lucide-react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable,
  arrayMove 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '@/stores/useEditorStore';
import { Section } from '@/types/editor.types';
import { GalleryConfig, GalleryItemConfig, getDefaultGalleryItemConfig } from './types';
import { cn } from '@/lib/utils';

interface GalleryChildrenProps {
  section: Section;
  groupId: string;
}

interface DraggableItemProps {
  item: GalleryItemConfig;
  index: number;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  isSelected: boolean;
}

function DraggableItem({ 
  item, 
  index, 
  onSelect, 
  onToggleVisibility, 
  onDelete,
  isSelected 
}: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-lg border transition-all",
        isDragging ? "opacity-50 z-50" : "",
        isSelected ? "border-blue-500 bg-blue-50 dark:bg-gray-700" : "border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="flex items-center p-3">
        <div 
          {...attributes} 
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-move mr-2"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        
        <ChevronRight className="w-3 h-3 mr-2 text-gray-400" />
        <Image className="w-4 h-4 mr-2 text-gray-500" />
        
        <button
          onClick={onSelect}
          className="flex-1 text-left text-sm truncate"
        >
          {item.heading || `Gallery Item ${index + 1}`}
        </button>

        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleVisibility}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {item.visible ? 
              <Eye className="w-4 h-4 text-gray-500" /> : 
              <EyeOff className="w-4 h-4 text-gray-400" />
            }
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Trash2 className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GalleryChildren({ section, groupId }: GalleryChildrenProps) {
  const { 
    updateSectionSettings, 
    selectSection, 
    selectedSectionId,
    toggleConfigPanel 
  } = useEditorStore();
  
  const config = section.settings as GalleryConfig;
  const items = config?.items || [];

  const sortableItems = useMemo(() => items.map(item => item.id), [items]);

  const handleAddItem = () => {
    const newItem = getDefaultGalleryItemConfig();
    const updatedItems = [...items, newItem];
    
    updateSectionSettings(groupId, section.id, {
      ...config,
      items: updatedItems
    });
    
    // Select the new item immediately
    selectSection(`${section.id}:child:${newItem.id}`);
    toggleConfigPanel(true);
  };

  const handleSelectItem = (itemId: string) => {
    selectSection(`${section.id}:child:${itemId}`);
    toggleConfigPanel(true);
  };

  const handleToggleVisibility = (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, visible: !item.visible } : item
    );
    updateSectionSettings(groupId, section.id, {
      ...config,
      items: updatedItems
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    updateSectionSettings(groupId, section.id, {
      ...config,
      items: updatedItems
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      updateSectionSettings(groupId, section.id, {
        ...config,
        items: newItems
      });
    }
  };

  return (
    <div className="ml-4 space-y-2 pb-2">
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableItems}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, index) => (
            <DraggableItem
              key={item.id}
              item={item}
              index={index}
              onSelect={() => handleSelectItem(item.id)}
              onToggleVisibility={() => handleToggleVisibility(item.id)}
              onDelete={() => handleDeleteItem(item.id)}
              isSelected={selectedSectionId === `${section.id}:child:${item.id}`}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={handleAddItem}
        className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Add gallery item</span>
      </button>
    </div>
  );
}