/**
 * @file TestimonialsChildren.tsx  
 * @max-lines 300
 * @module Testimonials
 * @description Gestión de testimonios hijos con drag & drop
 */

import React from 'react';
import { ChevronRight, Eye, EyeOff, Trash2, GripVertical, Plus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '@/stores/useEditorStore';
import { TestimonialsConfig, TestimonialsItemConfig, getDefaultTestimonialsItemConfig } from './types';

interface TestimonialsChildrenProps {
  section: any;
  groupId: string;
}

function SortableTestimonialItem({ 
  item, 
  onToggleVisibility, 
  onDelete, 
  onSelect 
}: {
  item: TestimonialsItemConfig;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-3 bg-white border rounded-lg
        ${!item.visible ? 'opacity-50' : ''}
        hover:bg-gray-50 transition-colors group
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={16} className="text-gray-400" />
      </div>
      
      <button
        onClick={onSelect}
        className="flex-1 flex items-center gap-2 text-left"
      >
        <ChevronRight size={16} />
        <span className="text-sm font-medium truncate">
          {item.authorName || 'Testimonial'}
        </span>
        {item.rating && (
          <span className="text-xs text-yellow-500">
            {'★'.repeat(Math.floor(item.rating))}
          </span>
        )}
      </button>
      
      <button
        onClick={onToggleVisibility}
        className="p-1 hover:bg-gray-200 rounded"
      >
        {item.visible ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
      
      <button
        onClick={onDelete}
        className="p-1 hover:bg-red-100 rounded text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function TestimonialsChildren({ section, groupId }: TestimonialsChildrenProps) {
  const { updateSectionSettings, selectSection, toggleConfigPanel } = useEditorStore();
  const config = section.settings as TestimonialsConfig;
  const items = config?.items || [];
  
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
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sortOrder: index
      }));
      
      updateSectionSettings(groupId, section.id, {
        ...config,
        items: newItems
      });
    }
  };
  
  const handleAddTestimonial = () => {
    const newItem = getDefaultTestimonialsItemConfig();
    const newItems = [...items, newItem];
    
    updateSectionSettings(groupId, section.id, {
      ...config,
      items: newItems
    });
    
    // Select the new item
    selectSection(`${section.id}:child:${newItem.id}`);
    toggleConfigPanel(true);
  };
  
  const handleToggleVisibility = (itemId: string) => {
    const newItems = items.map(item => 
      item.id === itemId ? { ...item, visible: !item.visible } : item
    );
    
    updateSectionSettings(groupId, section.id, {
      ...config,
      items: newItems
    });
  };
  
  const handleDelete = (itemId: string) => {
    const newItems = items.filter(item => item.id !== itemId);
    
    updateSectionSettings(groupId, section.id, {
      ...config,
      items: newItems
    });
  };
  
  const handleSelectItem = (itemId: string) => {
    selectSection(`${section.id}:child:${itemId}`);
    toggleConfigPanel(true);
  };
  
  return (
    <div className="ml-8 mt-2 space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableTestimonialItem
              key={item.id}
              item={item}
              onToggleVisibility={() => handleToggleVisibility(item.id)}
              onDelete={() => handleDelete(item.id)}
              onSelect={() => handleSelectItem(item.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      <button
        onClick={handleAddTestimonial}
        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg
                 hover:border-blue-400 hover:bg-blue-50 transition-colors
                 flex items-center justify-center gap-2 text-blue-600"
      >
        <Plus size={16} />
        <span className="text-sm font-medium">Add testimonial</span>
      </button>
    </div>
  );
}