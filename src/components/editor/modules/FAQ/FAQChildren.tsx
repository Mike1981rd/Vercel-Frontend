/**
 * @file FAQChildren.tsx
 * @max-lines 300
 * @module FAQ
 * @description Maneja los items de la sección FAQ en el sidebar
 * @template-section true
 */

'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Eye, EyeOff, Trash2, GripVertical, Image, FolderPlus, FilePlus, X } from 'lucide-react';
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
import { FAQConfig, FAQItemConfig, FAQCategoryConfig, getDefaultFAQItemConfig } from './types';
import FAQCategoriesChildren from './FAQCategoriesChildren';

interface FAQChildrenProps {
  section: Section;
  groupId: string;
}

interface DraggableItemProps {
  item: FAQItemConfig;
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
        ${!item.visible ? 'opacity-50' : ''}
        ${isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''}
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

      {/* Item Icon */}
      <Image className="w-3.5 h-3.5 text-gray-500 mr-2" />
      
      {/* Item Title */}
      <span className="flex-1 text-sm text-gray-700">
        {item.heading || `FAQ block ${index + 1}`}
      </span>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {item.visible ? 
              <Eye className="w-3 h-3 text-gray-500" /> : 
              <EyeOff className="w-3 h-3 text-gray-500" />
            }
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function FAQChildren({ section, groupId }: FAQChildrenProps) {
  const { 
    updateSectionSettings, 
    selectSection,
    toggleConfigPanel,
    selectedSectionId 
  } = useEditorStore();

  const config = section.settings as FAQConfig;
  const items = config?.items || [];
  const categories = config?.categories || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categories[0]?.id || null);

  // IDs para drag & drop
  const itemIds = useMemo(() => items.map(item => item.id), [items]);

  const handleAddItem = () => setShowAddModal(true);

  const createContentTab = () => {
    const newItem = { ...getDefaultFAQItemConfig(), categoryId: selectedCategoryId || undefined };
    updateSectionSettings(groupId, section.id, {
      ...config,
      items: [...items, newItem]
    });
    selectSection(`${section.id}:child:${newItem.id}`);
    toggleConfigPanel(true);
    setShowAddModal(false);
  };

  const createCategory = () => {
    const newCategory: FAQCategoryConfig = {
      id: `cat_${Date.now()}`,
      title: 'New category',
      alignment: 'left',
      visible: true,
      items: []
    };
    updateSectionSettings(groupId, section.id, {
      ...config,
      categories: [...categories, newCategory]
    });
    // No abre editor de item; la categoría se configura desde el padre
    setShowAddModal(false);
  };

  const handleSelectItem = (itemId: string) => {
    // Usar formato especial para items FAQ - DEBE ser :child:
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
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      updateSectionSettings(groupId, section.id, {
        ...config,
        items: newItems
      });
    }
  };

  return (
    <div className="pl-8 pb-2">
      {categories.length > 0 && (<FAQCategoriesChildren section={section} groupId={groupId} />)}
      {/* Add Item Button - ESTILO AZUL LIMPIO COMO SLIDESHOW */}
      <button
        onClick={handleAddItem}
        className="w-full flex items-center gap-2 pl-8 pr-4 py-2 text-xs text-blue-600 dark:text-blue-400 
                   hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
      >
        <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Plus className="w-3 h-3" />
        </div>
        <span className="font-medium">Add FAQ block</span>
      </button>

      {/* Modal para elegir tipo: Category o Content tab */}
      {showAddModal && (
        <div className="p-3">
          <div className="border border-gray-300 rounded-md shadow-sm bg-white">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <div className="text-xs font-medium">Add block</div>
              <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setShowAddModal(false)}>
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="p-3 space-y-2">
              <button onClick={createCategory} className="w-full flex items-center gap-2 px-3 py-2 text-xs border rounded hover:bg-gray-50">
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Create Category</span>
              </button>
              <button onClick={createContentTab} className="w-full flex items-center gap-2 px-3 py-2 text-xs border rounded hover:bg-gray-50">
                <FilePlus className="w-3.5 h-3.5" />
                <span>Create Content tab</span>
              </button>
              {categories.length > 0 && (
                <div className="pt-2">
                  <label className="text-xs text-gray-600">Category for the new content tab</label>
                  <select
                    className="mt-1 w-full text-xs border rounded px-2 py-1"
                    value={selectedCategoryId || ''}
                    onChange={(e) => setSelectedCategoryId(e.target.value || null)}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.title || cat.id}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      {items.length > 0 && (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={itemIds}
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
      )}
    </div>
  );
}
