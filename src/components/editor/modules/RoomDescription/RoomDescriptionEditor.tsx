'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { ChevronDown, ChevronUp, FileText, Palette, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface RoomDescriptionConfig {
  enabled: boolean;
  colorScheme: 1 | 2 | 3 | 4 | 5;
  alignment: 'left' | 'center' | 'right' | 'justify';
  mobileAlignment?: 'left' | 'center' | 'right' | 'justify';
  fontSize: {
    heading: number; // percentage (50-200)
    body: number; // percentage (50-200)
  };
  showHeading: boolean;
  headingText: string;
  headingBold?: boolean;
  headingItalic?: boolean;
  headingUnderline?: boolean;
  showMore: boolean;
  paddingTop: number; // Internal top padding (0-120)
  paddingBottom: number; // Internal bottom padding (0-120)
  containerPaddingTop: number; // External top margin (0-120)
  containerPaddingBottom: number; // External bottom margin (0-120)
}

interface RoomDescriptionEditorProps {
  sectionId: string;
}

const getDefaultConfig = (): RoomDescriptionConfig => ({
  enabled: true,
  colorScheme: 1,
  alignment: 'left',
  mobileAlignment: 'center',
  fontSize: {
    heading: 100,
    body: 100
  },
  showHeading: true,
  headingText: 'About this space',
  headingBold: true,
  headingItalic: false,
  headingUnderline: false,
  showMore: true,
  paddingTop: 24,
  paddingBottom: 24,
  containerPaddingTop: 0,  // Sin espacio superior por defecto
  containerPaddingBottom: 0  // Sin espacio inferior por defecto
});

export default function RoomDescriptionEditor({ sectionId }: RoomDescriptionEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const { config: themeConfig } = useThemeConfigStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [localConfig, setLocalConfig] = useState<RoomDescriptionConfig>(getDefaultConfig());

  // Find the section
  const section = sections.template.find(s => s.id === sectionId) ||
                  sections.headerGroup.find(s => s.id === sectionId) ||
                  sections.footerGroup.find(s => s.id === sectionId);

  // Sync with store
  useEffect(() => {
    if (section?.settings) {
      const newConfig = { ...getDefaultConfig(), ...section.settings };
      setLocalConfig(newConfig);
    }
  }, [section?.settings]);

  const handleChange = (field: keyof RoomDescriptionConfig, value: any) => {
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

  const handleNestedChange = (parent: string, field: string, value: any) => {
    const updatedConfig = {
      ...localConfig,
      [parent]: {
        ...(localConfig[parent as keyof RoomDescriptionConfig] as any || {}),
        [field]: value
      }
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
    <div className="bg-white dark:bg-gray-900 w-[320px]" style={{ zoom: 0.95 }}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="font-medium text-sm">Room Description</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 border-b max-h-[600px] overflow-y-auto">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show section</label>
            <input
              type="checkbox"
              checked={localConfig.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="rounded"
            />
          </div>

          {/* Color Scheme Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium">Color Scheme</label>
            </div>
            <select 
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
              value={localConfig.colorScheme}
              onChange={(e) => handleChange('colorScheme', parseInt(e.target.value) as 1|2|3|4|5)}
            >
              <option value={1}>Scheme 1 (Primary)</option>
              <option value={2}>Scheme 2 (Secondary)</option>
              <option value={3}>Scheme 3 (Tertiary)</option>
              <option value={4}>Scheme 4 (Quaternary)</option>
              <option value={5}>Scheme 5 (Quinary)</option>
            </select>
          </div>

          {/* Text Alignment - Desktop */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Text Alignment (Desktop)</label>
            <div className="flex gap-1">
              <button
                onClick={() => handleChange('alignment', 'left')}
                className={`flex-1 p-2 border rounded-l-md transition-colors ${
                  localConfig.alignment === 'left' 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                <AlignLeft className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => handleChange('alignment', 'center')}
                className={`flex-1 p-2 border-t border-b transition-colors ${
                  localConfig.alignment === 'center' 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                <AlignCenter className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => handleChange('alignment', 'right')}
                className={`flex-1 p-2 border-t border-b transition-colors ${
                  localConfig.alignment === 'right' 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                <AlignRight className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => handleChange('alignment', 'justify')}
                className={`flex-1 p-2 border rounded-r-md transition-colors ${
                  localConfig.alignment === 'justify' 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                <AlignJustify className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>

          {/* Text Alignment - Mobile */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Body Text Alignment (Mobile)</label>
            <div className="flex gap-1">
              <button
                onClick={() => handleChange('mobileAlignment', 'left')}
                className={`flex-1 p-2 border rounded-l-md transition-colors ${
                  localConfig.mobileAlignment === 'left' 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                <AlignLeft className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => handleChange('mobileAlignment', 'center')}
                className={`flex-1 p-2 border-t border-b transition-colors ${
                  localConfig.mobileAlignment === 'center' 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                <AlignCenter className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => handleChange('mobileAlignment', 'right')}
                className={`flex-1 p-2 border-t border-b transition-colors ${
                  localConfig.mobileAlignment === 'right' 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                <AlignRight className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => handleChange('mobileAlignment', 'justify')}
                className={`flex-1 p-2 border rounded-r-md transition-colors ${
                  localConfig.mobileAlignment === 'justify' 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                <AlignJustify className="w-4 h-4 mx-auto" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Body text alignment for mobile (header always centered)
            </p>
          </div>

          {/* Font Size Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium">Font Sizes</h3>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Heading Size (%)</label>
                <input
                  type="number"
                  value={localConfig.fontSize?.heading || 100}
                  onChange={(e) => handleNestedChange('fontSize', 'heading', parseInt(e.target.value) || 100)}
                  min="50"
                  max="200"
                  className="w-full px-3 py-1.5 text-sm border rounded-md"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Body Text Size (%)</label>
                <input
                  type="number"
                  value={localConfig.fontSize?.body || 100}
                  onChange={(e) => handleNestedChange('fontSize', 'body', parseInt(e.target.value) || 100)}
                  min="50"
                  max="200"
                  className="w-full px-3 py-1.5 text-sm border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Heading Configuration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Heading</label>
              <input
                type="checkbox"
                checked={localConfig.showHeading}
                onChange={(e) => handleChange('showHeading', e.target.checked)}
                className="rounded"
              />
            </div>
            
            {localConfig.showHeading && (
              <>
                <div>
                  <label className="text-xs text-gray-600">Heading Text</label>
                  <input
                    type="text"
                    value={localConfig.headingText}
                    onChange={(e) => handleChange('headingText', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded-md"
                    placeholder="Section heading..."
                  />
                </div>
                
                {/* Heading Format Options */}
                <div>
                  <label className="text-xs text-gray-600 mb-1.5 block">Heading Format</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange('headingBold', !localConfig.headingBold)}
                      className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                        localConfig.headingBold 
                          ? 'bg-gray-900 text-white border-gray-900' 
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
                          ? 'bg-gray-900 text-white border-gray-900' 
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
                          ? 'bg-gray-900 text-white border-gray-900' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <u>U</u>
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Applies to both desktop and mobile views
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Show More Button */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show More/Less Button</label>
            <input
              type="checkbox"
              checked={localConfig.showMore}
              onChange={(e) => handleChange('showMore', e.target.checked)}
              className="rounded"
            />
          </div>

          {/* Container Top Spacing - PERMITE VALORES MUY NEGATIVOS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Container Top Spacing</label>
              <span className="text-xs text-gray-500">{localConfig.containerPaddingTop || 0}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="120"
              step="4"
              value={localConfig.containerPaddingTop || 0}
              onChange={(e) => handleChange('containerPaddingTop', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #111827 0%, #111827 ${((localConfig.containerPaddingTop + 100) / 220) * 100}%, #e5e7eb ${((localConfig.containerPaddingTop + 100) / 220) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>-100px</span>
              <span>0px</span>
              <span>120px</span>
            </div>
          </div>

          {/* Internal Top Padding */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Internal Top Padding</label>
              <span className="text-xs text-gray-500">{localConfig.paddingTop || 24}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="8"
              value={localConfig.paddingTop || 24}
              onChange={(e) => handleChange('paddingTop', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #111827 0%, #111827 ${((localConfig.paddingTop || 24) / 120) * 100}%, #e5e7eb ${((localConfig.paddingTop || 24) / 120) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>None</span>
              <span>Normal</span>
              <span>Large</span>
            </div>
          </div>

          {/* Internal Bottom Padding */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Internal Bottom Padding</label>
              <span className="text-xs text-gray-500">{localConfig.paddingBottom || 24}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="8"
              value={localConfig.paddingBottom || 24}
              onChange={(e) => handleChange('paddingBottom', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #111827 0%, #111827 ${((localConfig.paddingBottom || 24) / 120) * 100}%, #e5e7eb ${((localConfig.paddingBottom || 24) / 120) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>None</span>
              <span>Normal</span>
              <span>Large</span>
            </div>
          </div>

          {/* Container Bottom Spacing - PERMITE VALORES NEGATIVOS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Container Bottom Spacing</label>
              <span className="text-xs text-gray-500">{localConfig.containerPaddingBottom ?? 0}px</span>
            </div>
            {/* Input directo para control exacto */}
            <input
              type="number"
              min={-60}
              max={120}
              step={4}
              value={localConfig.containerPaddingBottom ?? 0}
              onChange={(e) => handleChange('containerPaddingBottom', Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm border rounded-md mb-2"
              placeholder="Enter value (-60 to 120)..."
            />
            <input
              type="range"
              min={-60}
              max={120}
              step={4}
              value={localConfig.containerPaddingBottom ?? 0}
              onChange={(e) => handleChange('containerPaddingBottom', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>-60px</span>
              <span>0px</span>
              <span>120px</span>
            </div>
          </div>

          {/* Additional Options (Coming Soon) */}
          <div className="space-y-3 pt-3 border-t">
            <h3 className="text-sm font-medium text-gray-700">Additional Options (Coming Soon)</h3>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Line height control</p>
              <p>• Letter spacing adjustment</p>
              <p>• Custom border styles</p>
              <p>• Expandable sections</p>
              <p>• Icon integration</p>
              <p>• Multi-column layout</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}