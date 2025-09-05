'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import RoomInfoDisplay from '../RoomInfoDisplay';

interface RoomHighlightsConfig {
  enabled: boolean;
  colorScheme: string;
  title: string;
  topPadding: number;
  bottomPadding: number;
  titleSpacing?: number;
  mobileTitleSpacing?: number;
  headingSize?: number;
  headingWeight?: string;
  headingItalic?: boolean;
  headingUnderline?: boolean;
  headingBold?: boolean;
  contentBold?: boolean;
  contentItalic?: boolean;
  contentUnderline?: boolean;
}

interface RoomHighlightsEditorProps {
  sectionId: string;
}

const getDefaultConfig = (): RoomHighlightsConfig => ({
  enabled: true,
  colorScheme: '1',
  title: 'Shared spaces & amenities',
  topPadding: 32,
  bottomPadding: 32,
  titleSpacing: 24,
  mobileTitleSpacing: 16,
  headingSize: 20,
  headingWeight: '600',
  headingItalic: false,
  headingUnderline: false,
  headingBold: false,
  contentBold: false,
  contentItalic: false,
  contentUnderline: false
});

export default function RoomHighlightsEditor({ sectionId }: RoomHighlightsEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const { config: themeConfig } = useThemeConfigStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [localConfig, setLocalConfig] = useState<RoomHighlightsConfig>(getDefaultConfig());

  const section = sections.template.find(s => s.id === sectionId) ||
                  sections.headerGroup.find(s => s.id === sectionId) ||
                  sections.footerGroup.find(s => s.id === sectionId);

  useEffect(() => {
    if (section?.settings) {
      const newConfig = { ...getDefaultConfig(), ...section.settings };
      setLocalConfig(newConfig);
    }
  }, [section?.settings]);

  const handleChange = (field: keyof RoomHighlightsConfig, value: any) => {
    const updatedConfig = {
      ...localConfig,
      [field]: value
    };
    
    setLocalConfig(updatedConfig);
    
    if (section) {
      const groupId = Object.keys(sections).find(key => 
        sections[key as keyof typeof sections].includes(section)
      ) || 'template';
      
      updateSectionSettings(groupId as any, section.id, updatedConfig);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <div 
        className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium text-sm">Common Spaces</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 border-b max-h-[600px] overflow-y-auto">
          {/* Room Information Display */}
          <RoomInfoDisplay />

          {/* Color Scheme Selector - PRIMERA OPCIÓN */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Color scheme
            </label>
            <select 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={localConfig.colorScheme}
              onChange={(e) => handleChange('colorScheme', e.target.value)}
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

          {/* Header Title Input */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Section title
            </label>
            <input
              type="text"
              value={localConfig.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter section title"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md
                         focus:outline-none focus:ring-1 focus:ring-blue-500
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Title displayed above the highlights
            </p>
          </div>

          {/* Heading Size Slider */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Heading size
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="14"
                max="36"
                step="2"
                value={localConfig.headingSize || 20}
                onChange={(e) => handleChange('headingSize', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[40px]">
                {localConfig.headingSize || 20}px
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Small</span>
              <span>Medium</span>
              <span>Large</span>
            </div>
          </div>

          {/* Heading Weight */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Heading weight
            </label>
            <select 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={localConfig.headingWeight || '600'}
              onChange={(e) => handleChange('headingWeight', e.target.value)}
            >
              <option value="300">Light (300)</option>
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi-Bold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>

          {/* Heading Format Options */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Heading format
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleChange('headingBold', !localConfig.headingBold)}
                className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                  localConfig.headingBold 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => handleChange('headingItalic', !localConfig.headingItalic)}
                className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                  localConfig.headingItalic 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => handleChange('headingUnderline', !localConfig.headingUnderline)}
                className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                  localConfig.headingUnderline 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <u>U</u>
              </button>
            </div>
          </div>

          {/* Content Format Options */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Content format
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleChange('contentBold', !localConfig.contentBold)}
                className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                  localConfig.contentBold 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => handleChange('contentItalic', !localConfig.contentItalic)}
                className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                  localConfig.contentItalic 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => handleChange('contentUnderline', !localConfig.contentUnderline)}
                className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                  localConfig.contentUnderline 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <u>U</u>
              </button>
            </div>
          </div>

          {/* Title Spacing Slider - Desktop */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Title spacing (Desktop)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="8"
                max="80"
                step="4"
                value={localConfig.titleSpacing || 24}
                onChange={(e) => handleChange('titleSpacing', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[40px]">
                {localConfig.titleSpacing || 24}px
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Close</span>
              <span>Normal</span>
              <span>Far</span>
            </div>
          </div>

          {/* Title Spacing Slider - Mobile */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Title spacing (Mobile)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="8"
                max="60"
                step="4"
                value={localConfig.mobileTitleSpacing || 16}
                onChange={(e) => handleChange('mobileTitleSpacing', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[40px]">
                {localConfig.mobileTitleSpacing || 16}px
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Close</span>
              <span>Normal</span>
              <span>Far</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Space between title and content on mobile devices
            </p>
          </div>

          {/* Top Padding Slider */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Top padding
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="120"
                step="8"
                value={localConfig.topPadding}
                onChange={(e) => handleChange('topPadding', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[45px]">
                {localConfig.topPadding}px
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>None</span>
              <span>Normal</span>
              <span>Large</span>
            </div>
          </div>

          {/* Bottom Padding Slider */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Bottom padding
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="120"
                step="8"
                value={localConfig.bottomPadding}
                onChange={(e) => handleChange('bottomPadding', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[45px]">
                {localConfig.bottomPadding}px
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>None</span>
              <span>Normal</span>
              <span>Large</span>
            </div>
          </div>

          {/* Nota informativa sobre los espacios comunes */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> This section displays the common spaces configured in the room's Sleeping Arrangements. 
              To add or modify common spaces, edit the room and go to the "Sleeping Arrangements" section.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}