/**
 * @file FooterSubscribeEditor.tsx
 * @max-lines 300
 * @current-lines 0
 * @architecture modular
 * @validates-rules ✅
 * 
 * Configuration editor for Footer Subscribe blocks
 * Allows newsletter subscription form configuration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Bold, Italic, Link2, List, AlignLeft, AlignCenter, AlignRight, AlertCircle } from 'lucide-react';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { useEditorStore } from '@/stores/useEditorStore';

interface FooterSubscribeSettings {
  heading?: string;
  body?: string;
  inputStyle?: 'solid' | 'outline';
  placeholderText?: string;
  buttonText?: string;
  successMessage?: string;
  errorMessage?: string;
}

interface FooterSubscribeEditorProps {
  blockId: string;
}

export default function FooterSubscribeEditor({ blockId }: FooterSubscribeEditorProps) {
  const { config: structuralComponents, updateFooterConfigLocal } = useStructuralComponents();
  const { toggleConfigPanel, selectSection } = useEditorStore();
  
  // Get the specific block from footer config
  const footerConfig = structuralComponents?.footer || {};
  const blocks = footerConfig.blocks || [];
  const currentBlock = blocks.find((b: any) => b.id === blockId);
  
  // Initialize local state with current settings
  const [localSettings, setLocalSettings] = useState<FooterSubscribeSettings>(() => {
    return currentBlock?.settings || {
      heading: 'Subscribe',
      body: '',
      inputStyle: 'solid',
      placeholderText: 'Email address',
      buttonText: 'Subscribe',
      successMessage: 'Thanks for subscribing!',
      errorMessage: 'Please enter a valid email address'
    };
  });

  // Sync with props when they change
  useEffect(() => {
    const block = blocks.find((b: any) => b.id === blockId);
    if (block?.settings) {
      const newSettings = block.settings || getDefaultSettings();
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

  const handleChange = (field: keyof FooterSubscribeSettings, value: any) => {
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

  function getDefaultSettings(): FooterSubscribeSettings {
    return {
      heading: 'Subscribe',
      body: '',
      inputStyle: 'solid',
      placeholderText: 'Email address',
      buttonText: 'Subscribe',
      successMessage: 'Thanks for subscribing!',
      errorMessage: 'Please enter a valid email address'
    };
  }

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
          <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h2 className="text-base font-medium text-gray-900 dark:text-white">
            Subscribe
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          
          {/* Info Message */}
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Each email subscription creates a{' '}
            <a href="#" className="text-blue-600 hover:underline">
              customer account
            </a>
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
              placeholder="Subscribe"
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
              placeholder="Join our mailing list for updates and exclusive offers"
              rows={3}
            />
          </div>

          {/* Input Style */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Input style
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleChange('inputStyle', 'solid')}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                  localSettings.inputStyle === 'solid' 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Solid
              </button>
              <button
                onClick={() => handleChange('inputStyle', 'outline')}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                  localSettings.inputStyle === 'outline' 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Outline
              </button>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Advanced Settings
            </h3>
            
            {/* Placeholder Text */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Placeholder text
              </label>
              <input
                type="text"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                           focus:outline-none focus:ring-1 focus:ring-blue-500 
                           dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={localSettings.placeholderText || ''}
                onChange={(e) => handleChange('placeholderText', e.target.value)}
                placeholder="Email address"
              />
            </div>
            
            {/* Button Text */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Button text
              </label>
              <input
                type="text"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                           focus:outline-none focus:ring-1 focus:ring-blue-500 
                           dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={localSettings.buttonText || ''}
                onChange={(e) => handleChange('buttonText', e.target.value)}
                placeholder="Subscribe"
              />
            </div>
          </div>

          {/* Preview Section */}
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
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {localSettings.body}
                </p>
              )}
              <div className="flex gap-2">
                <input
                  type="email"
                  className={`flex-1 px-3 py-1.5 text-xs rounded-md ${
                    localSettings.inputStyle === 'solid'
                      ? 'bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                      : 'bg-transparent border border-gray-400 dark:border-gray-500'
                  }`}
                  placeholder={localSettings.placeholderText || 'Email address'}
                  disabled
                />
                <button 
                  className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-md dark:bg-white dark:text-gray-900"
                  disabled
                >
                  {localSettings.buttonText || 'Subscribe'}
                </button>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Newsletter Integration
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Subscriptions are automatically saved to your customer database. 
                  You can manage subscribers in the Customers section.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}