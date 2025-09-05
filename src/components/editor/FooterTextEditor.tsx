/**
 * @file FooterTextEditor.tsx
 * @max-lines 300
 * @current-lines 0
 * @architecture modular
 * @validates-rules ✅
 * 
 * Configuration editor for Footer Text blocks
 * Allows heading and body text configuration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Type, Bold, Italic, Link2, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { useEditorStore } from '@/stores/useEditorStore';

interface FooterTextSettings {
  heading?: string;
  body?: string;
}

interface FooterTextEditorProps {
  blockId: string;
}

export default function FooterTextEditor({ blockId }: FooterTextEditorProps) {
  const { config: structuralComponents, updateFooterConfigLocal } = useStructuralComponents();
  const { toggleConfigPanel, selectSection } = useEditorStore();
  
  // Get the specific block from footer config
  const footerConfig = structuralComponents?.footer || {};
  const blocks = footerConfig.blocks || [];
  const currentBlock = blocks.find((b: any) => b.id === blockId);
  
  // Initialize local state with current settings
  const [localSettings, setLocalSettings] = useState<FooterTextSettings>(() => {
    return currentBlock?.settings || {
      heading: '',
      body: ''
    };
  });

  // Sync with props when they change
  useEffect(() => {
    const block = blocks.find((b: any) => b.id === blockId);
    if (block?.settings) {
      const newSettings = block.settings || { heading: '', body: '' };
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

  const handleChange = (field: keyof FooterTextSettings, value: string) => {
    const updatedSettings = {
      ...localSettings,
      [field]: value
    };
    
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
          <Type className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h2 className="text-base font-medium text-gray-900 dark:text-white">
            Text
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          
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
              placeholder="Direccion"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional heading for this text block
            </p>
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
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button 
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={() => {/* TODO: Implement ordered list */}}
                title="Numbered List"
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
              placeholder="Calle Leonardo Da Vinci #87, Renacimiento, Santo Domingo, República Dominicana"
              rows={4}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Add any text content for your footer (address, hours, policies, etc.)
            </p>
          </div>

          {/* Preview Section */}
          {(localSettings.heading || localSettings.body) && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Preview
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
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

          {/* Help Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Usage Tips
            </h3>
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • Use this block for any text content in your footer
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • Common uses: Address, business hours, legal text, policies
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • The heading is optional - leave blank if not needed
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • Line breaks in the body text will be preserved
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • Rich text formatting will be available soon
              </p>
            </div>
          </div>

          {/* Examples Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Example Uses
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address Block
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Heading: "Visit Us"<br/>
                  Body: "123 Main Street<br/>New York, NY 10001<br/>USA"
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Hours
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Heading: "Hours"<br/>
                  Body: "Mon-Fri: 9AM - 6PM<br/>Sat: 10AM - 4PM<br/>Sun: Closed"
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Legal Text
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Heading: "" (no heading)<br/>
                  Body: "© 2025 Company Name. All rights reserved."
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}