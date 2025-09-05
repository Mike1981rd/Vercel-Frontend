/**
 * @file FooterLogoWithTextEditor.tsx
 * @max-lines 300
 * @current-lines 0
 * @architecture modular
 * @validates-rules ✅
 * 
 * Configuration editor for Footer Logo with Text blocks
 * Allows logo upload, size adjustment, heading and body text
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building, Bold, Italic, Link2, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { useEditorStore } from '@/stores/useEditorStore';
import { ImageUpload } from '@/components/ui/image-upload';

interface FooterLogoWithTextSettings {
  logoUrl?: string;
  logoSize?: number;
  heading?: string;
  body?: string;
}

interface FooterLogoWithTextEditorProps {
  blockId: string;
}

export default function FooterLogoWithTextEditor({ blockId }: FooterLogoWithTextEditorProps) {
  const { config: structuralComponents, updateFooterConfigLocal } = useStructuralComponents();
  const { toggleConfigPanel, selectSection } = useEditorStore();
  
  // Get the specific block from footer config
  const footerConfig = structuralComponents?.footer || {};
  const blocks = footerConfig.blocks || [];
  const currentBlock = blocks.find((b: any) => b.id === blockId);
  
  // Initialize local state with current settings
  const [localSettings, setLocalSettings] = useState<FooterLogoWithTextSettings>(() => {
    return currentBlock?.settings || {
      logoUrl: '',
      logoSize: 190,
      heading: '',
      body: ''
    };
  });

  // Sync with props when they change
  useEffect(() => {
    const block = blocks.find((b: any) => b.id === blockId);
    if (block?.settings) {
      const newSettings = block.settings || { logoUrl: '', logoSize: 190, heading: '', body: '' };
      if (JSON.stringify(newSettings) !== JSON.stringify(localSettings)) {
        setLocalSettings(newSettings);
      }
    }
  }, [blockId, blocks]);

  const handleBack = () => {
    // Close config panel and return to sidebar
    toggleConfigPanel(false);
    selectSection(null);
  };

  const handleChange = (field: keyof FooterLogoWithTextSettings, value: any) => {
    const updatedSettings = {
      ...localSettings,
      [field]: value
    };
    
    console.log('FooterLogoWithTextEditor - Updating field:', field, 'with value:', value);
    console.log('Updated settings:', updatedSettings);
    
    setLocalSettings(updatedSettings);
    
    // Update the block in footer config
    const updatedBlocks = blocks.map((block: any) => 
      block.id === blockId 
        ? { ...block, settings: updatedSettings }
        : block
    );
    
    const updatedConfig = {
      ...footerConfig,
      blocks: updatedBlocks
    };
    
    updateFooterConfigLocal(updatedConfig);
  };

  const handleLogoUpload = (url: string) => {
    handleChange('logoUrl', url);
  };

  return (
    <div className="w-[320px] h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleBack}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h2 className="text-base font-medium text-gray-900 dark:text-white">
            Logo with text
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          
          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Logo
            </label>
            <ImageUpload
              value={localSettings.logoUrl}
              onChange={handleLogoUpload}
              label=""
              maxWidth={320}
              maxHeight={120}
              className=""
            />
          </div>

          {/* Logo Size Slider */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Logo size
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="100"
                max="300"
                value={localSettings.logoSize || 190}
                onChange={(e) => handleChange('logoSize', parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="w-14 px-2 py-1 text-sm border border-gray-300 rounded
                             dark:bg-gray-800 dark:border-gray-600 dark:text-white
                             focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={localSettings.logoSize || 190}
                  onChange={(e) => handleChange('logoSize', parseInt(e.target.value) || 190)}
                  min="100"
                  max="300"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Adjust the maximum width of your logo
            </p>
          </div>

          {/* Heading */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Heading
            </label>
            <input
              type="text"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500"
              value={localSettings.heading || ''}
              onChange={(e) => handleChange('heading', e.target.value)}
              placeholder="Optional heading"
            />
          </div>

          {/* Body Text with Rich Text Toolbar */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Body
            </label>
            
            {/* Rich Text Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 border-b-0 rounded-t-md">
              <button 
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={() => {/* TODO: Implement bold */}}
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button 
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={() => {/* TODO: Implement italic */}}
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
              <button 
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={() => {/* TODO: Implement link */}}
                title="Link"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
              <button 
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={() => {/* TODO: Implement list */}}
                title="List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button 
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={() => {/* TODO: Implement ordered list */}}
                title="Ordered List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Textarea */}
            <textarea
              className="w-full px-3 py-2 text-sm border-x border-b border-gray-300 rounded-b-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              value={localSettings.body || ''}
              onChange={(e) => handleChange('body', e.target.value)}
              placeholder="Add a description about your company..."
              rows={4}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This text will appear below your logo in the footer
            </p>
          </div>

          {/* Preview Section */}
          {(localSettings.logoUrl || localSettings.heading || localSettings.body) && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Preview
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                {localSettings.logoUrl && (
                  <img 
                    src={localSettings.logoUrl} 
                    alt="Logo preview" 
                    className="mb-3 object-contain"
                    style={{ maxWidth: `${localSettings.logoSize}px`, height: 'auto' }}
                  />
                )}
                {localSettings.heading && (
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {localSettings.heading}
                  </h4>
                )}
                {localSettings.body && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {localSettings.body}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • Logo will display at the specified size
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • Heading is optional and appears above the body text
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • Body text supports basic formatting (coming soon)
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • This block typically appears in the first footer column
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}