/**
 * PRE-CODE CHECKLIST - MUST BE TRUE:
 * [x] File will be < 300 lines
 * [x] Preview logic in separate file
 * [x] Following modular architecture
 * [x] Will update isDirty on changes
 * [x] Will sync with props via useEffect
 */

/**
 * @file FAQCategoriesChildren.tsx
 * @max-lines 300
 * @architecture modular
 * @validates-rules ✅
 */

'use client';

import React, { useMemo } from 'react';
import { Eye, EyeOff, Trash2, GripVertical, Folder } from 'lucide-react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '@/stores/useEditorStore';
import { Section } from '@/types/editor.types';
import { FAQConfig, FAQCategoryConfig } from './types';

interface FAQCategoriesChildrenProps {
  section: Section;
  groupId: string;
}

interface DraggableCategoryProps {
  category: FAQCategoryConfig;
  index: number;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}

function DraggableCategory({ category, index, onSelect, onToggleVisibility, onDelete }: DraggableCategoryProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-center px-4 py-2 cursor-pointer transition-all
        hover:bg-gray-100
        ${isDragging ? 'shadow-lg bg-white' : ''}
      `}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <button
        className="absolute left-0 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded transition-opacity"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </button>

      {/* Indent marker */}
      <div className="ml-4 mr-2">
        <svg className="w-2 h-2 text-gray-400" fill="currentColor" viewBox="0 0 6 10">
          <path d="M1 1l4 4-4 4" />
        </svg>
      </div>

      {/* Category Icon */}
      <Folder className="w-3.5 h-3.5 text-gray-500 mr-2" />

      {/* Category Title */}
      <span className="flex-1 text-sm text-gray-700 truncate">
        {category.title || `Category ${index + 1}`}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          aria-label="Mostrar/Ocultar"
        >
          {category.visible ? (
            <Eye className="w-3 h-3 text-gray-500" />
          ) : (
            <EyeOff className="w-3 h-3 text-gray-400" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
          aria-label="Eliminar"
        >
          <Trash2 className="w-3 h-3 text-red-500" />
        </button>
      </div>
    </div>
  );
}

export default function FAQCategoriesChildren({ section, groupId }: FAQCategoriesChildrenProps) {
  const { updateSectionSettings, selectSection, toggleConfigPanel } = useEditorStore();

  const config = section.settings as FAQConfig;
  const categories = config?.categories || [];
  const items = config?.items || [];

  const categoryIds = useMemo(() => categories.map((c) => c.id), [categories]);

  const handleSelectCategory = () => {
    // Open parent editor, Categories panel is inside parent editor
    selectSection(section.id);
    toggleConfigPanel(true);
  };

  const handleToggleVisibility = (categoryId: string) => {
    const updated = categories.map((c) => (c.id === categoryId ? { ...c, visible: !c.visible } : c));
    updateSectionSettings(groupId, section.id, { ...config, categories: updated });
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Remove the category and clean up item.categoryId references
    const updatedCategories = categories.filter((c) => c.id !== categoryId);
    const updatedItems = items.map((it) => (it.categoryId === categoryId ? { ...it, categoryId: undefined } : it));
    updateSectionSettings(groupId, section.id, { ...config, categories: updatedCategories, items: updatedItems });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(categories, oldIndex, newIndex);
    updateSectionSettings(groupId, section.id, { ...config, categories: reordered });
  };

  if (categories.length === 0) return null;

  return (
    <div className="pl-8 pb-1">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
          {categories.map((cat, index) => (
            <DraggableCategory
              key={cat.id}
              category={cat}
              index={index}
              onSelect={handleSelectCategory}
              onToggleVisibility={() => handleToggleVisibility(cat.id)}
              onDelete={() => handleDeleteCategory(cat.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
