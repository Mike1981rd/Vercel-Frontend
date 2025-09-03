/**
 * @file FooterImageEditor.tsx
 * @max-lines 300
 * @current-lines 0
 * @architecture modular
 * @validates-rules ✅
 * 
 * Configuration editor for Footer Image blocks
 * Allows image upload, sizing, ratio and link configuration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon, Upload, AlertCircle } from 'lucide-react';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { useEditorStore } from '@/stores/useEditorStore';
import { ImageUpload } from '@/components/ui/image-upload';

interface FooterImageSettings {
  imageUrl?: string;
  imageRatio?: number;
  imageSize?: number;
  linkUrl?: string;
  linkTarget?: '_self' | '_blank';
  altText?: string;
}

interface FooterImageEditorProps {
  blockId: string;
}

export default function FooterImageEditor({ blockId }: FooterImageEditorProps) {
  const { config: structuralComponents, updateFooterConfigLocal } = useStructuralComponents();
  const { toggleConfigPanel, selectSection } = useEditorStore();
  
  // Get the specific block from footer config
  const footerConfig = structuralComponents?.footer || {};
  const blocks = footerConfig.blocks || [];
  const currentBlock = blocks.find((b: any) => b.id === blockId);
  
  // Initialize local state with current settings
  const [localSettings, setLocalSettings] = useState<FooterImageSettings>(() => {
    return currentBlock?.settings || {
      imageUrl: '',
      imageRatio: 0.4,
      imageSize: 56,
      linkUrl: '',
      linkTarget: '_blank',
      altText: ''
    };
  });

  // State for video dropdown (not implemented in this version)
  const [videoOption, setVideoOption] = useState('Seleccionar');

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

  const handleChange = (field: keyof FooterImageSettings, value: any) => {
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

  const handleImageUpload = (url: string) => {
    handleChange('imageUrl', url);
  };

  function getDefaultSettings(): FooterImageSettings {
    return {
      imageUrl: '',
      imageRatio: 0.4,
      imageSize: 56,
      linkUrl: '',
      linkTarget: '_blank',
      altText: ''
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
          <ImageIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h2 className="text-base font-medium text-gray-900 dark:text-white">
            Image
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          
          {/* Image Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Image
            </label>
            <ImageUpload
              value={localSettings.imageUrl}
              onChange={handleImageUpload}
              label=""
              maxWidth={320}
              maxHeight={180}
              className=""
            />
          </div>

          {/* Video Selector (Placeholder for future implementation) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Video
            </label>
            <select
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white
                         appearance-none"
              value={videoOption}
              onChange={(e) => setVideoOption(e.target.value)}
              disabled
            >
              <option value="Seleccionar">Seleccionar</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Video support coming soon
            </p>
          </div>

          {/* Image Ratio Slider */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Image ratio
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.2"
                max="2"
                step="0.1"
                value={localSettings.imageRatio || 0.4}
                onChange={(e) => handleChange('imageRatio', parseFloat(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                className="w-14 px-2 py-1 text-sm border border-gray-300 rounded
                           dark:bg-gray-800 dark:border-gray-600 dark:text-white
                           focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={localSettings.imageRatio || 0.4}
                onChange={(e) => handleChange('imageRatio', parseFloat(e.target.value) || 0.4)}
                min="0.2"
                max="2"
                step="0.1"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Adjust the aspect ratio of your image (width/height)
            </p>
          </div>

          {/* Image Size Slider */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Image size
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="20"
                max="200"
                value={localSettings.imageSize || 56}
                onChange={(e) => handleChange('imageSize', parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="w-14 px-2 py-1 text-sm border border-gray-300 rounded
                             dark:bg-gray-800 dark:border-gray-600 dark:text-white
                             focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={localSettings.imageSize || 56}
                  onChange={(e) => handleChange('imageSize', parseInt(e.target.value) || 56)}
                  min="20"
                  max="200"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Maximum height of the image in pixels
            </p>
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Link
            </label>
            <input
              type="text"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500"
              value={localSettings.linkUrl || ''}
              onChange={(e) => handleChange('linkUrl', e.target.value)}
              placeholder="Pega un enlace o busca"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional link when image is clicked
            </p>
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Alt text
            </label>
            <input
              type="text"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500"
              value={localSettings.altText || ''}
              onChange={(e) => handleChange('altText', e.target.value)}
              placeholder="Image description for accessibility"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Important for SEO and accessibility
            </p>
          </div>

          {/* Preview Section */}
          {localSettings.imageUrl && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Preview
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="relative">
                  <img 
                    src={localSettings.imageUrl} 
                    alt={localSettings.altText || 'Footer image'} 
                    className="w-full object-contain"
                    style={{ 
                      maxHeight: `${localSettings.imageSize}px`,
                      aspectRatio: localSettings.imageRatio
                    }}
                  />
                  {localSettings.linkUrl && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Linked
                    </div>
                  )}
                </div>
                {localSettings.linkUrl && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Links to: {localSettings.linkUrl}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Image Tips
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  • Use high-quality images (PNG or WebP recommended)<br/>
                  • Common uses: Payment methods, certifications, partner logos<br/>
                  • Consider mobile display when setting size<br/>
                  • Always add alt text for better accessibility
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}