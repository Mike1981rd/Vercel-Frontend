// RichTextSidebarChildren.tsx - Rich Text blocks management in sidebar with drag & drop
import React, { useState } from 'react';
import { ChevronRight, Eye, EyeOff, Trash2, GripVertical, Plus, Type, Hash, Image, AlignLeft, Square } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '@/stores/useEditorStore';
import { RichTextBlock, RichTextBlockType } from './types';

interface RichTextSidebarChildrenProps {
  blocks: RichTextBlock[];
  section?: any;
  groupId?: string;
}

function SortableRichTextBlock({ 
  block, 
  onToggleVisibility, 
  onDelete, 
  onSelect 
}: {
  block: RichTextBlock & { visible?: boolean };
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
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case 'icon': return '🎯';
      case 'subheading': return 'T';
      case 'heading': return 'T';
      case 'text': return '≡';
      case 'buttons': return '🔲';
      default: return '•';
    }
  };

  const getBlockLabel = () => {
    switch (block.type) {
      case 'icon': 
        return 'Icon';
      case 'subheading': 
        return 'Subheading';
      case 'heading': 
        return `Heading${block.text ? ' – ' + block.text.substring(0, 15) + (block.text.length > 15 ? '...' : '') : ''}`;
      case 'text': 
        return `Text${block.columnContent?.[0] ? ' – ' + block.columnContent[0].substring(0, 20) + '...' : ''}`;
      case 'buttons': 
        return 'Buttons';
      default: 
        return 'Block';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-2 bg-white border rounded-lg mb-1
        ${(block as any).visible === false ? 'opacity-50' : ''}
        hover:bg-gray-50 transition-colors group
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <GripVertical size={14} className="text-gray-400" />
      </div>
      
      <button
        onClick={onSelect}
        className="flex-1 flex items-center gap-2 text-left min-w-0"
      >
        <span className="text-xs opacity-60 flex-shrink-0">{getBlockIcon()}</span>
        <span className="text-xs truncate">
          {getBlockLabel()}
        </span>
      </button>
      
      <button
        onClick={onToggleVisibility}
        className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
      >
        {(block as any).visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
      
      <button
        onClick={onDelete}
        className="p-1 hover:bg-red-100 rounded text-red-600 flex-shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function RichTextSidebarChildren({ blocks, section, groupId }: RichTextSidebarChildrenProps) {
  const { updateSectionSettings, selectSection, toggleConfigPanel } = useEditorStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  // If no section/groupId provided, just display blocks (backward compatibility)
  if (!section || !groupId) {
    return (
      <div className="ml-2 space-y-1">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
          >
            <span className="text-sm opacity-60">
              {block.type === 'icon' ? '🎯' : 
               block.type === 'subheading' || block.type === 'heading' ? 'T' :
               block.type === 'text' ? '≡' : '🔲'}
            </span>
            <span className="flex-1 truncate">
              {block.type === 'heading' && block.text ? `Heading – ${block.text.substring(0, 15)}...` :
               block.type === 'text' && block.columnContent?.[0] ? `Text – ${block.columnContent[0].substring(0, 20)}...` :
               block.type.charAt(0).toUpperCase() + block.type.slice(1)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  
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
      const oldIndex = blocks.findIndex(block => block.id === active.id);
      const newIndex = blocks.findIndex(block => block.id === over.id);
      
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      
      updateSectionSettings(groupId, section.id, {
        ...section.settings,
        blocks: newBlocks
      });
    }
  };
  
  const handleAddBlock = (type: RichTextBlockType) => {
    const timestamp = Date.now();
    let newBlock: RichTextBlock;
    
    switch (type) {
      case 'icon':
        newBlock = {
          id: `icon-${timestamp}`,
          type: 'icon',
          icon: null,
          size: 48
        };
        break;
      case 'subheading':
        newBlock = {
          id: `subheading-${timestamp}`,
          type: 'subheading',
          text: 'SUBHEADING'
        };
        break;
      case 'heading':
        newBlock = {
          id: `heading-${timestamp}`,
          type: 'heading',
          text: 'Add a heading',
          size: 'h5'
        };
        break;
      case 'text':
        newBlock = {
          id: `text-${timestamp}`,
          type: 'text',
          columns: 1,
          columnContent: ['Add your text content here'],
          bodySize: 'body3'
        };
        break;
      case 'buttons':
        newBlock = {
          id: `buttons-${timestamp}`,
          type: 'buttons',
          buttons: [
            {
              label: 'Button',
              link: '#',
              style: 'solid'
            }
          ]
        };
        break;
    }
    
    const newBlocks = [...blocks, newBlock];
    
    updateSectionSettings(groupId, section.id, {
      ...section.settings,
      blocks: newBlocks
    });
    
    // Select the new block - DEBE usar :child: como Testimonials
    selectSection(`${section.id}:child:${newBlock.id}`);
    toggleConfigPanel(true);
    setShowAddMenu(false);
  };
  
  const handleToggleVisibility = (blockId: string) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId 
        ? { ...block, visible: block.visible === false ? true : false } 
        : block
    );
    
    updateSectionSettings(groupId, section.id, {
      ...section.settings,
      blocks: newBlocks
    });
  };
  
  const handleDeleteBlock = (blockId: string) => {
    const newBlocks = blocks.filter(block => block.id !== blockId);
    
    updateSectionSettings(groupId, section.id, {
      ...section.settings,
      blocks: newBlocks
    });
  };
  
  const handleSelectBlock = (blockId: string) => {
    // DEBE usar :child: como Testimonials, no :richtext:
    const sectionId = `${section.id}:child:${blockId}`;
    console.log('[DEBUG] RichTextSidebarChildren - Selecting block:', {
      sectionId,
      blockId,
      section,
      groupId
    });
    selectSection(sectionId);
    toggleConfigPanel(true);
  };
  
  return (
    <div className="ml-2 mr-2 space-y-1">
      {/* Add block button */}
      <div className="relative">
        <button 
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-blue-600 hover:bg-blue-50 rounded"
        >
          <Plus size={14} />
          <span>Agregar bloque</span>
        </button>
        
        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
            <button
              onClick={() => handleAddBlock('icon')}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left text-sm"
            >
              <Image size={14} />
              <span>Icon</span>
            </button>
            <button
              onClick={() => handleAddBlock('subheading')}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left text-sm"
            >
              <Hash size={14} />
              <span>Subheading</span>
            </button>
            <button
              onClick={() => handleAddBlock('heading')}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left text-sm"
            >
              <Type size={14} />
              <span>Heading</span>
            </button>
            <button
              onClick={() => handleAddBlock('text')}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left text-sm"
            >
              <AlignLeft size={14} />
              <span>Text</span>
            </button>
            <button
              onClick={() => handleAddBlock('buttons')}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left text-sm rounded-b-lg"
            >
              <Square size={14} />
              <span>Buttons</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Blocks list with drag & drop */}
      {blocks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block) => (
              <SortableRichTextBlock
                key={block.id}
                block={block}
                onToggleVisibility={() => handleToggleVisibility(block.id)}
                onDelete={() => handleDeleteBlock(block.id)}
                onSelect={() => handleSelectBlock(block.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-4 text-gray-500 text-xs">
          No blocks added yet
        </div>
      )}
    </div>
  );
}