// RichTextItemEditor.tsx - Editor for individual Rich Text blocks
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { RichTextBlock } from './types';
import RichTextBlockEditor from './RichTextBlockEditor';

interface RichTextItemEditorProps {
  sectionId: string;
  blockId: string;
}

export default function RichTextItemEditor({ sectionId, blockId }: RichTextItemEditorProps) {
  const { sections, updateSectionSettings, selectSection } = useEditorStore();
  
  // Find the section and block
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  const blocks = section?.settings?.blocks || [];
  const block = blocks.find((b: RichTextBlock) => b.id === blockId);
  
  const [localBlock, setLocalBlock] = useState<RichTextBlock | null>(block || null);
  
  useEffect(() => {
    if (block) {
      setLocalBlock(block);
    }
  }, [block]);
  
  const handleUpdate = (updates: Partial<RichTextBlock>) => {
    if (!localBlock) return;
    
    const updatedBlock = { ...localBlock, ...updates };
    setLocalBlock(updatedBlock);
    
    // Update the blocks array
    const newBlocks = blocks.map((b: RichTextBlock) => 
      b.id === blockId ? updatedBlock : b
    );
    
    // Find the correct group ID
    const groupId = Object.entries(sections).find(([_, sectionsList]) =>
      sectionsList.some(s => s.id === sectionId)
    )?.[0];
    
    if (groupId) {
      updateSectionSettings(groupId, sectionId, {
        ...section?.settings,
        blocks: newBlocks
      });
    }
  };
  
  const handleBack = () => {
    // DEBE volver al panel lateral principal, no al editor del padre
    selectSection(null);
  };
  
  if (!localBlock) {
    return (
      <div className="p-4">
        <button onClick={handleBack} className="text-sm text-gray-600 hover:text-gray-900">
          ← Back
        </button>
        <p className="mt-4 text-gray-500">Block not found</p>
      </div>
    );
  }
  
  return (
    <RichTextBlockEditor
      block={localBlock}
      onUpdate={handleUpdate}
      onBack={handleBack}
    />
  );
}