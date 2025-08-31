'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { ChevronDown, ChevronUp, Image, Palette, Grid3x3, Type } from 'lucide-react';

interface RoomGalleryConfig {
  enabled: boolean;
  layoutStyle: 'airbnb' | 'grid' | 'carousel';
  colorScheme: 1 | 2 | 3 | 4 | 5;
  fontSize: {
    caption: number; // percentage (50-200)
    button: number; // percentage (50-200)
  };
  cornerRadius: 'none' | 'small' | 'medium' | 'large';
  showAllPhotosButton: boolean;
  buttonText: string;
  showCaptions: boolean;
  showShareSave: boolean; // Show Share/Save buttons
  cardSize: number; // Card size percentage (50-200), default 100
  containerWidth: number; // Container width percentage (50-100), default 100
  paddingTop: number; // Internal top padding (0-120)
  paddingBottom: number; // Internal bottom padding (0-120)
  containerPaddingTop: number; // External top margin (0-120)
  containerPaddingBottom: number; // External bottom margin (0-120)
}

interface RoomGalleryEditorProps {
  sectionId: string;
}

const getDefaultConfig = (): RoomGalleryConfig => ({
  enabled: true,
  layoutStyle: 'airbnb',
  colorScheme: 1,
  fontSize: {
    caption: 100,
    button: 100
  },
  cornerRadius: 'medium',
  showAllPhotosButton: true,
  buttonText: 'Show all photos',
  showCaptions: false,
  showShareSave: true, // Default to show
  cardSize: 100, // Default 100% size
  containerWidth: 100, // Default 100% width
  paddingTop: 0,
  paddingBottom: 0,
  containerPaddingTop: 0,
  containerPaddingBottom: 24
});

export default function RoomGalleryEditor({ sectionId }: RoomGalleryEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const { config: themeConfig } = useThemeConfigStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [localConfig, setLocalConfig] = useState<RoomGalleryConfig>(getDefaultConfig());

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

  const handleChange = (field: keyof RoomGalleryConfig, value: any) => {
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
        ...(localConfig[parent as keyof RoomGalleryConfig] as any || {}),
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
          <Image className="w-4 h-4" />
          <span className="font-medium text-sm">Room Gallery</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 border-b max-h-[600px] overflow-y-auto">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show gallery</label>
            <input
              type="checkbox"
              checked={localConfig.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="rounded"
            />
          </div>

          {/* Layout Style */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium">Layout Style</label>
            </div>
            <select 
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
              value={localConfig.layoutStyle}
              onChange={(e) => handleChange('layoutStyle', e.target.value as 'airbnb' | 'grid' | 'carousel')}
            >
              <option value="airbnb">Featured + Grid</option>
              <option value="grid">Simple Grid</option>
              <option value="carousel">Carousel Slider</option>
            </select>
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

          {/* Corner Radius */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Corner Radius</label>
            <select 
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
              value={localConfig.cornerRadius}
              onChange={(e) => handleChange('cornerRadius', e.target.value as 'none' | 'small' | 'medium' | 'large')}
            >
              <option value="none">None (0px)</option>
              <option value="small">Small (4px)</option>
              <option value="medium">Medium (8px)</option>
              <option value="large">Large (16px)</option>
            </select>
          </div>

          {/* Card Size Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Image Card Size</label>
              <span className="text-xs text-gray-500">{localConfig.cardSize ?? 100}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={200}
              step={5}
              value={localConfig.cardSize ?? 100}
              onChange={(e) => handleChange('cardSize', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Small (50%)</span>
              <span>Normal (100%)</span>
              <span>Large (200%)</span>
            </div>
          </div>

          {/* Container Width Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Container Width</label>
              <span className="text-xs text-gray-500">{localConfig.containerWidth ?? 100}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={localConfig.containerWidth ?? 100}
              onChange={(e) => handleChange('containerWidth', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Narrow (50%)</span>
              <span>Medium (75%)</span>
              <span>Full (100%)</span>
            </div>
          </div>

          {/* Font Size Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium">Font Sizes</h3>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Caption Size (%)</label>
                <input
                  type="number"
                  value={localConfig.fontSize?.caption || 100}
                  onChange={(e) => handleNestedChange('fontSize', 'caption', parseInt(e.target.value) || 100)}
                  min="50"
                  max="200"
                  className="w-full px-3 py-1.5 text-sm border rounded-md"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Button Text Size (%)</label>
                <input
                  type="number"
                  value={localConfig.fontSize?.button || 100}
                  onChange={(e) => handleNestedChange('fontSize', 'button', parseInt(e.target.value) || 100)}
                  min="50"
                  max="200"
                  className="w-full px-3 py-1.5 text-sm border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Show All Photos Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show All Photos Button</label>
              <input
                type="checkbox"
                checked={localConfig.showAllPhotosButton}
                onChange={(e) => handleChange('showAllPhotosButton', e.target.checked)}
                className="rounded"
              />
            </div>
            
            {localConfig.showAllPhotosButton && (
              <div>
                <label className="text-xs text-gray-600">Button Text</label>
                <input
                  type="text"
                  value={localConfig.buttonText}
                  onChange={(e) => handleChange('buttonText', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border rounded-md"
                  placeholder="Button text..."
                />
              </div>
            )}
          </div>

          {/* Show Captions */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Image Captions</label>
            <input
              type="checkbox"
              checked={localConfig.showCaptions}
              onChange={(e) => handleChange('showCaptions', e.target.checked)}
              className="rounded"
            />
          </div>

          {/* Show Share/Save Buttons */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Share/Save Buttons</label>
            <input
              type="checkbox"
              checked={localConfig.showShareSave}
              onChange={(e) => handleChange('showShareSave', e.target.checked)}
              className="rounded"
            />
          </div>

          {/* Container Top Spacing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Container Top Spacing</label>
              <span className="text-xs text-gray-500">{localConfig.containerPaddingTop ?? 0}px</span>
            </div>
            <input
              type="range"
              min={-100}
              max={120}
              step={4}
              value={localConfig.containerPaddingTop ?? 0}
              onChange={(e) => handleChange('containerPaddingTop', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
              <span className="text-xs text-gray-500">{localConfig.paddingTop ?? 0}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={120}
              step={8}
              value={localConfig.paddingTop ?? 0}
              onChange={(e) => handleChange('paddingTop', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
              <span className="text-xs text-gray-500">{localConfig.paddingBottom ?? 0}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={120}
              step={8}
              value={localConfig.paddingBottom ?? 0}
              onChange={(e) => handleChange('paddingBottom', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>None</span>
              <span>Normal</span>
              <span>Large</span>
            </div>
          </div>

          {/* Container Bottom Spacing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Container Bottom Spacing</label>
              <span className="text-xs text-gray-500">{localConfig.containerPaddingBottom ?? 24}px</span>
            </div>
            <input
              type="number"
              min={-60}
              max={120}
              step={4}
              value={localConfig.containerPaddingBottom ?? 24}
              onChange={(e) => handleChange('containerPaddingBottom', Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm border rounded-md mb-2"
              placeholder="Enter value (-60 to 120)..."
            />
            <input
              type="range"
              min={-60}
              max={120}
              step={4}
              value={localConfig.containerPaddingBottom ?? 24}
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
              <p>• Image zoom on hover</p>
              <p>• Lightbox gallery view</p>
              <p>• Auto-play for carousel</p>
              <p>• Image aspect ratio control</p>
              <p>• Lazy loading options</p>
              <p>• Custom grid columns</p>
              <p>• Image filters and effects</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}