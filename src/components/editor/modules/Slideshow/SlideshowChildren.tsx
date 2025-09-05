/**
 * @file SlideshowChildren.tsx
 * @max-lines 300
 * @module Slideshow
 * Manages slideshow slides in the sidebar
 */

'use client';

import React, { useMemo } from 'react';
import { Plus, Eye, EyeOff, Trash2, GripVertical, Image } from 'lucide-react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '@/stores/useEditorStore';
import { Section } from '@/types/editor.types';
import { SlideshowConfig, getDefaultSlideConfig } from './types';

interface SlideshowChildrenProps {
  section: Section;
  groupId: string;
}

interface DraggableSlideItemProps {
  slide: any;
  index: number;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  isSelected: boolean;
}

function DraggableSlideItem({ 
  slide, 
  index, 
  onSelect, 
  onToggleVisibility, 
  onDelete,
  isSelected 
}: DraggableSlideItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [showActions, setShowActions] = React.useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-center px-4 py-2 cursor-pointer transition-all
        hover:bg-gray-100
        ${isDragging ? 'shadow-lg bg-white' : ''}
        ${!slide.visible ? 'opacity-50' : ''}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onSelect}
    >
      {/* Drag Handle - Only visible on hover */}
      <button
        className="absolute left-0 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </button>

      {/* Indent for nested item */}
      <div className="ml-4 mr-2">
        <svg className="w-2 h-2 text-gray-400" fill="currentColor" viewBox="0 0 6 10">
          <path d="M1 1l4 4-4 4" />
        </svg>
      </div>

      {/* Slide Icon */}
      <Image className="w-3.5 h-3.5 text-gray-500 mr-2" />
      
      {/* Slide Title */}
      <span className="flex-1 text-sm text-gray-700">
        Image slide – {slide.heading || 'Sin título'}
      </span>
      
      {/* Actions - Only visible on hover */}
      {showActions && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title={slide.visible ? 'Ocultar slide' : 'Mostrar slide'}
          >
            {slide.visible ? (
              <Eye className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="Eliminar slide"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SlideshowChildren({ section, groupId }: SlideshowChildrenProps) {
  const { selectSection, toggleConfigPanel, updateSectionSettings, sections } = useEditorStore();
  const [selectedSlideId, setSelectedSlideId] = React.useState<string | null>(null);
  
  // Get slideshow config
  const config = section.settings as SlideshowConfig;
  const slides = config?.slides || [];

  // Sortable IDs
  const sortableIds = useMemo(
    () => slides.map((slide: any) => slide.id),
    [slides]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s: any) => s.id === active.id);
    const newIndex = slides.findIndex((s: any) => s.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newSlides = [...slides];
      const [movedSlide] = newSlides.splice(oldIndex, 1);
      newSlides.splice(newIndex, 0, movedSlide);

      updateSectionSettings(groupId, section.id, {
        ...config,
        slides: newSlides
      });
    }
  };

  const handleAddSlide = () => {
    const newSlide = getDefaultSlideConfig();
    const updatedConfig = {
      ...config,
      slides: [...slides, newSlide]
    };
    
    updateSectionSettings(groupId, section.id, updatedConfig);
    
    // Auto-select new slide
    setSelectedSlideId(newSlide.id);
    selectSection(`${section.id}:slide:${newSlide.id}`);
    toggleConfigPanel(true);
  };

  const handleSelectSlide = (slideId: string) => {
    console.log('[DEBUG] handleSelectSlide called:', {
      sectionId: section.id,
      slideId: slideId,
      specialId: `${section.id}:slide:${slideId}`
    });
    
    setSelectedSlideId(slideId);
    // Use special ID format for child selection
    selectSection(`${section.id}:slide:${slideId}`);
    toggleConfigPanel(true);
  };

  const handleToggleSlideVisibility = (slideId: string) => {
    const updatedSlides = slides.map((slide: any) => 
      slide.id === slideId 
        ? { ...slide, visible: !slide.visible }
        : slide
    );
    
    updateSectionSettings(groupId, section.id, {
      ...config,
      slides: updatedSlides
    });
  };

  const handleDeleteSlide = (slideId: string) => {
    const updatedSlides = slides.filter((slide: any) => slide.id !== slideId);
    
    updateSectionSettings(groupId, section.id, {
      ...config,
      slides: updatedSlides
    });
    
    // Clear selection if deleted slide was selected
    if (selectedSlideId === slideId) {
      setSelectedSlideId(null);
      selectSection(section.id);
    }
  };

  return (
    <div>
      {/* Slides List with DnD */}
      {slides.length > 0 && (
        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            <div className="pl-4">
              {slides.map((slide: any, index: number) => (
                <DraggableSlideItem
                  key={slide.id}
                  slide={slide}
                  index={index}
                  onSelect={() => handleSelectSlide(slide.id)}
                  onToggleVisibility={() => handleToggleSlideVisibility(slide.id)}
                  onDelete={() => handleDeleteSlide(slide.id)}
                  isSelected={selectedSlideId === slide.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      
      {/* Add Slide Button - Positioned after the slides */}
      <button
        onClick={handleAddSlide}
        className="w-full flex items-center gap-2 pl-8 pr-4 py-2 text-xs text-blue-600 dark:text-blue-400 
                   hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
      >
        <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Plus className="w-3 h-3" />
        </div>
        <span>Agregar Image Slide</span>
      </button>

      {/* Empty State */}
      {slides.length === 0 && (
        <div className="px-4 py-3 text-xs text-gray-500 text-center">
          No hay slides. Agrega uno para comenzar.
        </div>
      )}
    </div>
  );
}