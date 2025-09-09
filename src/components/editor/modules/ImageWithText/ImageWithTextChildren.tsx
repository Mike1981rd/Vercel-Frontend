/**
 * @file ImageWithTextChildren.tsx
 * @max-lines 200
 * @module ImageWithText
 * @description Gestión de hijos (imágenes/videos) para ImageWithText
 * @template-section true
 */

'use client';

import React from 'react';
import { Plus, ChevronRight, GripVertical, Image, Video } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '@/stores/useEditorStore';
import { ImageWithTextItem } from './types';

interface ImageWithTextChildrenProps {
  section: any;
  groupId: string;
}

interface SortableItemProps {
  item: ImageWithTextItem;
  onSelect: () => void;
}

function SortableItem({ item, onSelect }: SortableItemProps) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = item.type === 'video' ? Video : Image;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pl-8 pr-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between group ${
        isDragging ? 'bg-gray-100 dark:bg-gray-800' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <IconComponent className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {item.type === 'video' ? 'Video' : 'Image'} {item.imageUrl || item.videoUrl ? '' : '(empty)'}
        </span>
      </div>
      {!item.visible && (
        <span className="text-xs text-gray-400">Hidden</span>
      )}
    </div>
  );
}

export default function ImageWithTextChildren({ section, groupId }: ImageWithTextChildrenProps) {
  const { selectSection, toggleConfigPanel, updateSectionSettings } = useEditorStore();
  
  const items = section.settings?.items || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15,
        tolerance: 5,
        delay: 150
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item: ImageWithTextItem) => item.id === active.id);
      const newIndex = items.findIndex((item: ImageWithTextItem) => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      updateSectionSettings(groupId, section.id, {
        ...section.settings,
        items: newItems
      });
    }
  };

  const handleAddItem = () => {
    const newItem: ImageWithTextItem = {
      id: `item-${Date.now()}`,
      type: 'image',
      imageUrl: '',
      videoUrl: '',
      altText: '',
      visible: true
    };

    updateSectionSettings(groupId, section.id, {
      ...section.settings,
      items: [...items, newItem]
    });

    // Seleccionar el nuevo item para editarlo
    selectSection(`${section.id}:child:${newItem.id}`);
    toggleConfigPanel(true);
  };

  const handleSelectItem = (itemId: string) => {
    // Usar formato especial para hijos
    selectSection(`${section.id}:child:${itemId}`);
    toggleConfigPanel(true);
  };

  return (
    <div className="pl-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item: ImageWithTextItem) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item: ImageWithTextItem) => (
            <SortableItem
              key={item.id}
              item={item}
              onSelect={() => handleSelectItem(item.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      <button
        onClick={handleAddItem}
        className="pl-8 pr-3 py-2 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 
                   flex items-center gap-2 text-blue-600 dark:text-blue-400"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Add image or video</span>
      </button>
    </div>
  );
}