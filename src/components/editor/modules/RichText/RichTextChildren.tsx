// RichTextChildren.tsx - Manages Rich Text Blocks
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, ChevronRight, Type, Image, Hash, AlignLeft, Square } from 'lucide-react';
import { RichTextBlock, RichTextBlockType } from './types';
import RichTextBlockEditor from './RichTextBlockEditor';

interface RichTextChildrenProps {
  blocks: RichTextBlock[];
  onBlocksChange: (blocks: RichTextBlock[]) => void;
}

interface SortableBlockProps {
  block: RichTextBlock;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableBlock({ block, onEdit, onDelete }: SortableBlockProps) {
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
      case 'icon': return 'Icon';
      case 'subheading': return `Subheading${block.text ? ' - ' + block.text.substring(0, 20) : ''}`;
      case 'heading': return `Heading${block.text ? ' - ' + block.text.substring(0, 20) : ''}`;
      case 'text': return 'Text - Share information about y...';
      case 'buttons': return 'Buttons';
      default: return 'Block';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-white hover:bg-gray-50 border rounded-lg mb-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={16} />
      </div>
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm">{getBlockIcon()}</span>
        <span className="text-sm flex-1">{getBlockLabel()}</span>
      </div>
      <button
        onClick={onEdit}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <ChevronRight size={16} />
      </button>
      <button
        onClick={onDelete}
        className="p-1 hover:bg-red-50 text-red-600 rounded"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function RichTextChildren({ blocks, onBlocksChange }: RichTextChildrenProps) {
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
      }
    }
  };

  const handleAddBlock = (type: RichTextBlockType) => {
    const newBlock: RichTextBlock = createNewBlock(type);
    onBlocksChange([...blocks, newBlock]);
    setShowAddMenu(false);
    setEditingBlock(newBlock.id);
  };

  const createNewBlock = (type: RichTextBlockType): RichTextBlock => {
    const baseId = `${type}-${Date.now()}`;
    
    switch (type) {
      case 'icon':
        return {
          id: baseId,
          type: 'icon',
          icon: null,
          size: 48
        };
      case 'subheading':
        return {
          id: baseId,
          type: 'subheading',
          text: 'SUBHEADING'
        };
      case 'heading':
        return {
          id: baseId,
          type: 'heading',
          text: 'Add a heading',
          size: 'h5'
        };
      case 'text':
        return {
          id: baseId,
          type: 'text',
          columns: 1,
          columnContent: ['Add your text content here'],
          bodySize: 'body3'
        };
      case 'buttons':
        return {
          id: baseId,
          type: 'buttons',
          buttons: [
            {
              label: 'Button',
              link: '#',
              style: 'solid'
            }
          ]
        };
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    onBlocksChange(blocks.filter(b => b.id !== blockId));
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<RichTextBlock>) => {
    onBlocksChange(blocks.map(b => 
      b.id === blockId ? { ...b, ...updates } as RichTextBlock : b
    ));
  };

  // If editing a block, show the block editor
  if (editingBlock) {
    const block = blocks.find(b => b.id === editingBlock);
    if (block) {
      return (
        <RichTextBlockEditor
          block={block}
          onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
          onBack={() => setEditingBlock(null)}
        />
      );
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-3">Rich text</h4>
        
        {/* Add Block Button */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50"
          >
            <Plus size={16} />
            <span className="text-sm">Agregar bloque</span>
          </button>

          {/* Add Block Menu */}
          {showAddMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
              <button
                onClick={() => handleAddBlock('icon')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                <Image size={16} className="text-gray-600" />
                <span className="text-sm">Icon</span>
              </button>
              <button
                onClick={() => handleAddBlock('subheading')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                <Hash size={16} className="text-gray-600" />
                <span className="text-sm">Subheading</span>
              </button>
              <button
                onClick={() => handleAddBlock('heading')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                <Type size={16} className="text-gray-600" />
                <span className="text-sm">Heading</span>
              </button>
              <button
                onClick={() => handleAddBlock('text')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                <AlignLeft size={16} className="text-gray-600" />
                <span className="text-sm">Text</span>
              </button>
              <button
                onClick={() => handleAddBlock('buttons')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left rounded-b-lg"
              >
                <Square size={16} className="text-gray-600" />
                <span className="text-sm">Buttons</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Blocks List */}
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
            <div className="space-y-2">
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onEdit={() => setEditingBlock(block.id)}
                  onDelete={() => handleDeleteBlock(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm mb-2">No blocks added yet</p>
          <p className="text-xs">Click "Agregar bloque" to add content</p>
        </div>
      )}
    </div>
  );
}