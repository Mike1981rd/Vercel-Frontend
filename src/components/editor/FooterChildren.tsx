/**
 * @file FooterChildren.tsx
 * @max-lines 250
 * Footer blocks management in sidebar - Similar to AnnouncementChildren
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Eye, EyeOff, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { useEditorStore } from '@/stores/useEditorStore';
import { Section } from '@/types/editor.types';
import { FooterBlockType } from './modules/Footer/FooterTypes';
import { AddFooterBlockModal } from './AddFooterBlockModal';
import { DraggableFooterBlock } from './dragDrop/DraggableFooterBlock';

interface FooterChildrenProps {
  section: Section;
  groupId: string;
}

const blockTypeLabels: Record<FooterBlockType, string> = {
  [FooterBlockType.LOGO_WITH_TEXT]: 'Logo con texto',
  [FooterBlockType.SUBSCRIBE]: 'Suscripción',
  [FooterBlockType.SOCIAL_MEDIA]: 'Redes sociales',
  [FooterBlockType.MENU]: 'Menú',
  [FooterBlockType.TEXT]: 'Texto',
  [FooterBlockType.IMAGE]: 'Imagen'
};

export function FooterChildren({ section, groupId }: FooterChildrenProps) {
  const { config: structuralComponents, updateFooterConfigLocal } = useStructuralComponents();
  const { selectSection, toggleConfigPanel, saveHistory } = useEditorStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get footer blocks from structural components config
  const footerConfig = structuralComponents?.footer || {};
  const blocks = footerConfig.blocks || [];
  
  // Create sortable IDs for drag & drop
  const sortableIds = useMemo(() => blocks.map((b: any) => b.id), [blocks]);

  const handleAddBlock = (type: FooterBlockType) => {
    const newBlock = {
      id: `footer-block-${Date.now()}`,
      type: type,
      title: blockTypeLabels[type],
      visible: true,
      settings: getDefaultSettings(type)
    };
    
    const updatedConfig = {
      ...footerConfig,
      blocks: [...blocks, newBlock]
    };
    
    updateFooterConfigLocal(updatedConfig);
  };

  const getDefaultSettings = (type: FooterBlockType) => {
    switch (type) {
      case FooterBlockType.TEXT:
        return { heading: 'Título', body: 'Tu texto aquí' };
      case FooterBlockType.MENU:
        return { links: ['Enlace 1', 'Enlace 2'] };
      case FooterBlockType.SOCIAL_MEDIA:
        return { 
          heading: 'Síguenos en',
          body: '',
          platforms: {
            instagram: true,
            facebook: true,
            twitter: true,
            youtube: true,
            linkedin: true
          }
        };
      case FooterBlockType.SUBSCRIBE:
        return { 
          heading: 'Suscríbete',
          body: 'Recibe nuestras últimas noticias y ofertas exclusivas',
          inputStyle: 'solid',
          placeholderText: 'Tu correo electrónico',
          buttonText: 'Suscribir'
        };
      case FooterBlockType.LOGO_WITH_TEXT:
        return { 
          logoUrl: '',
          logoSize: 190,
          heading: '',
          body: 'Descripción de tu empresa'
        };
      case FooterBlockType.IMAGE:
        return { url: '', alt: '' };
      default:
        return {};
    }
  };

  const handleSelectBlock = (blockId: string) => {
    // Select the block item
    selectSection(blockId);
    toggleConfigPanel(true);
  };

  const handleToggleBlockVisibility = (blockId: string) => {
    const block = blocks.find((b: any) => b.id === blockId);
    if (block) {
      const updatedBlocks = blocks.map((b: any) => 
        b.id === blockId 
          ? { ...b, visible: !b.visible } 
          : b
      );
      
      const updatedConfig = {
        ...footerConfig,
        blocks: updatedBlocks
      };
      
      updateFooterConfigLocal(updatedConfig);
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    const updatedBlocks = blocks.filter((b: any) => b.id !== blockId);
    
    const updatedConfig = {
      ...footerConfig,
      blocks: updatedBlocks
    };
    
    updateFooterConfigLocal(updatedConfig);
  };

  // Handle drag end for reordering blocks
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = blocks.findIndex((b: any) => b.id === active.id);
    const newIndex = blocks.findIndex((b: any) => b.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex);
      
      console.log('[FooterChildren] Drag & Drop - Old order:', blocks.map((b: any, i: number) => `${i+1}. ${b.title || b.type}`).join(', '));
      console.log('[FooterChildren] Drag & Drop - New order:', reorderedBlocks.map((b: any, i: number) => `${i+1}. ${b.title || b.type}`).join(', '));
      
      const updatedConfig = {
        ...footerConfig,
        blocks: reorderedBlocks
      };
      
      updateFooterConfigLocal(updatedConfig);
      
      // Save history for undo/redo functionality
      saveHistory();
    }
  };

  const getBlockIcon = (type: FooterBlockType) => {
    switch(type) {
      case FooterBlockType.TEXT:
        return '📝';
      case FooterBlockType.MENU:
        return '☰';
      case FooterBlockType.SOCIAL_MEDIA:
        return '🔗';
      case FooterBlockType.SUBSCRIBE:
        return '✉️';
      case FooterBlockType.LOGO_WITH_TEXT:
        return '🏢';
      case FooterBlockType.IMAGE:
        return '🖼️';
      default:
        return '📦';
    }
  };

  return (
    <div className="pl-8">
      {/* Add Block Button - Blue like Announcement */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-blue-600 dark:text-blue-400 
                   hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
      >
        <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Plus className="w-3 h-3" />
        </div>
        <span>Agregar bloque</span>
      </button>

      {/* List of Blocks with local DnD */}
      <DndContext 
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <SortableContext 
          items={sortableIds} 
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block: any, index: number) => (
            <DraggableFooterBlock key={block.id} blockId={block.id}>
              {({ setNodeRef, attributes, listeners, isDragging, style }) => (
                <div
                  ref={setNodeRef}
                  style={style}
                  className={`group flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors select-none 
                    ${isDragging 
                      ? 'ring-1 ring-blue-200/60 shadow-sm bg-white dark:bg-gray-900' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  onClick={() => handleSelectBlock(block.id)}
                >
                  {/* Drag Handle */}
                  <button
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    aria-label="Reordenar bloque"
                  >
                    <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  
                  {/* Block icon */}
                  <span className="text-sm">{getBlockIcon(block.type)}</span>
                  
                  {/* Block name */}
                  <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">
                    {block.title || blockTypeLabels[block.type as FooterBlockType]}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBlockVisibility(block.id);
                      }}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label="Mostrar/Ocultar"
                    >
                      {block.visible !== false ? (
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(block.id);
                      }}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              )}
            </DraggableFooterBlock>
          ))}
        </SortableContext>
      </DndContext>

      {/* Add Footer Block Modal */}
      <AddFooterBlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddBlock={handleAddBlock}
      />
    </div>
  );
}