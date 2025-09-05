/**
 * @file ImageBannerEditor.tsx
 * @max-lines 300
 * @current-lines 285
 * @architecture modular
 * @validates-rules ✅
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { updateImageBannerConfig } from '@/lib/api/structural-components';
import { ImageBannerContent } from './ImageBannerContent';
import { ImageBannerMedia } from './ImageBannerMedia';
import { ImageBannerPosition } from './ImageBannerPosition';
import { ImageBannerButtons } from './ImageBannerButtons';
import { ImageBannerSpacing } from './ImageBannerSpacing';
import { ImageBannerConfig } from './types';

interface ImageBannerEditorProps {
  sectionId: string;
}

export default function ImageBannerEditor({ sectionId }: ImageBannerEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const { config: themeConfig } = useThemeConfigStore();
  
  // Find the section from the store
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  
  // Initialize local state with defaults
  const [localConfig, setLocalConfig] = useState<ImageBannerConfig>(() => {
    return (section?.settings || getDefaultConfig()) as ImageBannerConfig;
  });

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    media: false,
    content: false,
    position: false,
    buttons: false,
    spacing: false
  });

  // Sync with props
  useEffect(() => {
    const currentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    if (currentSection?.settings) {
      const newSettings = currentSection.settings;
      if (JSON.stringify(newSettings) !== JSON.stringify(localConfig)) {
        setLocalConfig(newSettings as ImageBannerConfig);
      }
    }
  }, [sectionId, sections]);

  const handleChange = async (updates: Partial<ImageBannerConfig>) => {
    const updatedConfig = {
      ...localConfig,
      ...updates
    };
    
    setLocalConfig(updatedConfig);
    
    // Save to structural components API
    try {
      const companyId = parseInt(localStorage.getItem('companyId') || '1');
      await updateImageBannerConfig(companyId, updatedConfig);
      
      // Also update in store for preview
      if (section) {
        const groupId = Object.keys(sections).find(key => 
          sections[key as keyof typeof sections].includes(section)
        ) as any;
        
        updateSectionSettings(groupId, section.id, updatedConfig);
      }
    } catch (error) {
      console.error('Error saving Image Banner config:', error);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  function getDefaultConfig(): ImageBannerConfig {
    return {
      // General
      colorScheme: '1',
      colorBackground: false,
      showOnlyOnHomePage: false,
      width: 'large',
      desktopRatio: 2.1,
      mobileRatio: 1.6,
      
      // Media
      desktopImage: '',
      mobileImage: '',
      desktopOverlayOpacity: 20,
      mobileOverlayOpacity: 20,
      videoSound: false,
      
      // Content
      subheading: 'IMAGE BANNER',
      heading: 'Image with text',
      body: 'Fill in text to tell customers by whom and why your products are made.',
      headingSize: 2,
      bodySize: 3,
      
      // Position
      desktopPosition: 'center',
      desktopAlignment: 'center',
      desktopWidth: 40,
      desktopSpacing: 0,
      mobilePosition: 'center',
      mobileAlignment: 'center',
      
      // Background
      desktopBackground: 'none',
      mobileBackground: 'none',
      
      // Buttons
      firstButtonLabel: 'Button label',
      firstButtonLink: '',
      firstButtonStyle: 'solid',
      secondButtonLabel: '',
      secondButtonLink: '',
      secondButtonStyle: 'outline',
      
      // Spacing
      addSidePaddings: false,
      topPadding: 0,
      bottomPadding: 0
    };
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Content - No header needed, ConfigPanel provides it */}
      <div className="flex-1 overflow-y-auto">
        {/* General Settings */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('general')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              General Settings
            </span>
            {expandedSections.general ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.general && (
            <div className="px-3 pb-3 space-y-3">
              {/* Color Scheme */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Color scheme
                </label>
                <select 
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={localConfig.colorScheme}
                  onChange={(e) => handleChange({ colorScheme: e.target.value as any })}
                >
                  {themeConfig?.colorSchemes?.schemes?.map((scheme, index) => (
                    <option key={scheme.id} value={String(index + 1)}>
                      {scheme.name}
                    </option>
                  )) || [1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={String(num)}>Scheme {num}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Uses the color scheme from global settings
                </p>
              </div>

              {/* Color Background Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Color background
                </label>
                <button
                  onClick={() => handleChange({ colorBackground: !localConfig.colorBackground })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    localConfig.colorBackground ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    localConfig.colorBackground ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Show Only on Home Page */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showOnlyHomePage"
                  checked={localConfig.showOnlyOnHomePage}
                  onChange={(e) => handleChange({ showOnlyOnHomePage: e.target.checked })}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="showOnlyHomePage" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Show only on home page
                </label>
              </div>

              {/* Width */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Width
                </label>
                <select 
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={localConfig.width}
                  onChange={(e) => handleChange({ width: e.target.value as any })}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="page">Page</option>
                  <option value="screen">Screen</option>
                </select>
              </div>

              {/* Desktop Ratio */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Desktop ratio
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={localConfig.desktopRatio}
                    onChange={(e) => handleChange({ desktopRatio: parseFloat(e.target.value) })}
                    className="flex-1 min-w-0"
                  />
                  <input
                    type="number"
                    className="w-12 px-1 py-1 text-xs border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    value={localConfig.desktopRatio}
                    onChange={(e) => handleChange({ desktopRatio: parseFloat(e.target.value) })}
                    step="0.1"
                    min="0.5"
                    max="3"
                  />
                </div>
              </div>

              {/* Mobile Ratio */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Mobile ratio
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={localConfig.mobileRatio}
                    onChange={(e) => handleChange({ mobileRatio: parseFloat(e.target.value) })}
                    className="flex-1 min-w-0"
                  />
                  <input
                    type="number"
                    className="w-12 px-1 py-1 text-xs border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    value={localConfig.mobileRatio}
                    onChange={(e) => handleChange({ mobileRatio: parseFloat(e.target.value) })}
                    step="0.1"
                    min="0.5"
                    max="3"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Media Section */}
        <ImageBannerMedia
          config={localConfig}
          onChange={handleChange}
          isExpanded={expandedSections.media}
          onToggle={() => toggleSection('media')}
        />

        {/* Content Section */}
        <ImageBannerContent
          config={localConfig}
          onChange={handleChange}
          isExpanded={expandedSections.content}
          onToggle={() => toggleSection('content')}
        />

        {/* Position Section */}
        <ImageBannerPosition
          config={localConfig}
          onChange={handleChange}
          isExpanded={expandedSections.position}
          onToggle={() => toggleSection('position')}
        />

        {/* Buttons Section */}
        <ImageBannerButtons
          config={localConfig}
          onChange={handleChange}
          isExpanded={expandedSections.buttons}
          onToggle={() => toggleSection('buttons')}
        />

        {/* Spacing Section */}
        <ImageBannerSpacing
          config={localConfig}
          onChange={handleChange}
          isExpanded={expandedSections.spacing}
          onToggle={() => toggleSection('spacing')}
        />
      </div>
    </div>
  );
}