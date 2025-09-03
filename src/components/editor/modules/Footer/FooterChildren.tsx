/**
 * @file FooterChildren.tsx
 * @max-lines 300
 * @module Footer
 * Manages footer blocks/children in the sidebar
 */

'use client';

import React from 'react';
import { Plus, Trash2, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { FooterBlock, FooterBlockType } from './FooterTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface FooterChildrenProps {
  onSelectChild: (childId: string) => void;
  selectedChildId?: string;
}

const blockTypeLabels: Record<FooterBlockType, string> = {
  [FooterBlockType.LOGO_WITH_TEXT]: 'Logo con texto',
  [FooterBlockType.SUBSCRIBE]: 'Suscripción',
  [FooterBlockType.SOCIAL_MEDIA]: 'Redes sociales',
  [FooterBlockType.MENU]: 'Menú',
  [FooterBlockType.TEXT]: 'Texto',
  [FooterBlockType.IMAGE]: 'Imagen'
};

export default function FooterChildren({ 
  onSelectChild, 
  selectedChildId 
}: FooterChildrenProps) {
  const { config, updateFooterConfigLocal } = useStructuralComponents();
  const footerConfig = config?.footer;
  const blocks = footerConfig?.blocks || [];
  const [expandedBlock, setExpandedBlock] = React.useState<string | null>(null);
  const [newBlockType, setNewBlockType] = React.useState<FooterBlockType>(FooterBlockType.TEXT);

  const handleAddBlock = () => {
    const newBlock: FooterBlock = {
      id: `footer-block-${Date.now()}`,
      type: newBlockType,
      title: blockTypeLabels[newBlockType],
      visible: true,
      settings: getDefaultSettings(newBlockType)
    };

    updateFooterConfigLocal({
      ...footerConfig,
      blocks: [...blocks, newBlock]
    });

    // Auto-select the new block
    onSelectChild(newBlock.id);
    setExpandedBlock(newBlock.id);
  };

  const handleDeleteBlock = (blockId: string) => {
    updateFooterConfigLocal({
      ...footerConfig,
      blocks: blocks.filter((b: any) => b.id !== blockId)
    });

    // Clear selection if deleted block was selected
    if (selectedChildId === blockId) {
      onSelectChild('');
    }
  };

  const handleToggleVisibility = (blockId: string) => {
    updateFooterConfigLocal({
      ...footerConfig,
      blocks: blocks.map((b: any) => 
        b.id === blockId ? { ...b, visible: !b.visible } : b
      )
    });
  };

  const getDefaultSettings = (type: FooterBlockType) => {
    switch (type) {
      case FooterBlockType.TEXT:
        return { content: 'Tu texto aquí' };
      case FooterBlockType.MENU:
        return { links: ['Enlace 1', 'Enlace 2'] };
      case FooterBlockType.SOCIAL_MEDIA:
        return { platforms: [] };
      case FooterBlockType.SUBSCRIBE:
        return { placeholder: 'Correo electrónico' };
      case FooterBlockType.LOGO_WITH_TEXT:
        return { text: 'Descripción de tu empresa' };
      case FooterBlockType.IMAGE:
        return { url: '', alt: '' };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-4">
      {/* Lista de bloques existentes */}
      <div className="space-y-2">
        {blocks.map((block: any, index: number) => (
          <div 
            key={block.id}
            className={`
              border rounded-lg transition-all
              ${selectedChildId === block.id 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                : 'border-gray-200 dark:border-gray-700'
              }
            `}
          >
            <div 
              className="flex items-center gap-2 p-3 cursor-pointer"
              onClick={() => {
                onSelectChild(block.id);
                setExpandedBlock(expandedBlock === block.id ? null : block.id);
              }}
            >
              <ChevronRight 
                className={`w-4 h-4 transition-transform ${
                  expandedBlock === block.id ? 'rotate-90' : ''
                }`}
              />
              <span className="text-sm flex-1 text-left">
                {block.title || blockTypeLabels[block.type as FooterBlockType]}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVisibility(block.id);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  {block.visible ? (
                    <Eye className="w-4 h-4 text-gray-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBlock(block.id);
                  }}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            
            {expandedBlock === block.id && (
              <div className="px-3 pb-3 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700">
                Tipo: {blockTypeLabels[block.type as FooterBlockType]}
                {!block.visible && (
                  <span className="ml-2 text-orange-500">(Oculto)</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botón para agregar nuevo bloque */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex gap-2">
          <Select
            value={newBlockType}
            onValueChange={(value) => setNewBlockType(value as FooterBlockType)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(blockTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleAddBlock}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar bloque
        </Button>
      </div>
    </div>
  );
}