'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { ChevronDown, ChevronUp, Home, Palette, Type, AlignLeft, AlignCenter, AlignRight, Sparkles } from 'lucide-react';

interface Highlight {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface RoomTitleHostConfig {
  enabled: boolean;
  colorScheme: 1 | 2 | 3 | 4 | 5;
  fontSize: {
    title: number; // percentage or pixels
    subtitle: number;
    details: number;
  };
  alignment: 'left' | 'center' | 'right';
  showRating: boolean;
  showSuperhost: boolean;
  showHostImage: boolean;
  showHostVerification: boolean;
  showReservationWidget: boolean;
  reserveButtonText: string; // New option for button text
  showHighlights: boolean; // Show highlights section
  highlights: Highlight[]; // Highlights configuration
  spacing: 'compact' | 'comfortable' | 'spacious';
  hostImageSize: number; // Size in pixels (32-80)
  paddingTop: number; // Internal top padding in pixels (0-120)
  paddingBottom: number; // Internal bottom padding in pixels (0-120)
  containerPaddingTop: number; // External container top margin (0-120)
  containerPaddingBottom: number; // External container bottom margin (0-120)
  mobileTopSpacing?: number; // Mobile-specific top spacing (-60 to 60)
  mobileCardOffset?: number; // Mobile card vertical position offset (-40 to 40)
}

interface RoomTitleHostEditorProps {
  sectionId: string;
}

const getDefaultConfig = (): RoomTitleHostConfig => ({
  enabled: true,
  colorScheme: 1,
  fontSize: {
    title: 100, // 100% = default size
    subtitle: 90,
    details: 85
  },
  alignment: 'left',
  showRating: true,
  showSuperhost: true,
  showHostImage: true,
  showHostVerification: true,
  showReservationWidget: true,
  reserveButtonText: 'Reserve', // Default button text
  showHighlights: true, // Default to show highlights
  highlights: [
    {
      id: 'great-location',
      icon: 'MapPin',
      title: 'Great location',
      description: '90% of recent guests gave the location a 5-star rating.'
    },
    {
      id: 'self-checkin',
      icon: 'DoorOpen',
      title: 'Self check-in',
      description: 'Check yourself in with the keypad.'
    },
    {
      id: 'superhost',
      icon: 'Award',
      title: 'Superhost',
      description: 'Superhosts are experienced, highly rated hosts.'
    }
  ],
  spacing: 'comfortable',
  hostImageSize: 48, // Default 48px
  paddingTop: 24, // Default 24px internal
  paddingBottom: 24, // Default 24px internal
  containerPaddingTop: 0, // Default 0px external top
  containerPaddingBottom: 0, // Default 0px external bottom - sin espacio por defecto
  mobileTopSpacing: 0, // Default 0px mobile top spacing
  mobileCardOffset: 0 // Default 0px mobile card offset
});

export default function RoomTitleHostEditor({ sectionId }: RoomTitleHostEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const { config: themeConfig } = useThemeConfigStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [localConfig, setLocalConfig] = useState<RoomTitleHostConfig>(getDefaultConfig());

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

  const handleChange = (field: keyof RoomTitleHostConfig, value: any) => {
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
        ...(localConfig[parent as keyof RoomTitleHostConfig] as any || {}),
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
          <Home className="w-4 h-4" />
          <span className="font-medium text-sm">Room Title & Host</span>
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

          {/* Font Size Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium">Font Sizes</h3>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Title Size (%)</label>
                <input
                  type="number"
                  value={localConfig.fontSize?.title || 100}
                  onChange={(e) => handleNestedChange('fontSize', 'title', parseInt(e.target.value) || 100)}
                  min="50"
                  max="200"
                  className="w-full px-3 py-1.5 text-sm border rounded-md"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Subtitle Size (%)</label>
                <input
                  type="number"
                  value={localConfig.fontSize?.subtitle || 90}
                  onChange={(e) => handleNestedChange('fontSize', 'subtitle', parseInt(e.target.value) || 90)}
                  min="50"
                  max="200"
                  className="w-full px-3 py-1.5 text-sm border rounded-md"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Details Size (%)</label>
                <input
                  type="number"
                  value={localConfig.fontSize?.details || 85}
                  onChange={(e) => handleNestedChange('fontSize', 'details', parseInt(e.target.value) || 85)}
                  min="50"
                  max="200"
                  className="w-full px-3 py-1.5 text-sm border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Content Alignment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Alignment</label>
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
                className={`flex-1 p-2 border rounded-r-md transition-colors ${
                  localConfig.alignment === 'right' 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                <AlignRight className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>

          {/* Spacing */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Spacing</label>
            <select 
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
              value={localConfig.spacing}
              onChange={(e) => handleChange('spacing', e.target.value as 'compact' | 'comfortable' | 'spacious')}
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>

          {/* Container Top Padding (External) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Container Top Spacing</label>
              <span className="text-xs text-gray-500">{localConfig.containerPaddingTop || 0}px</span>
            </div>
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="120"
                step="8"
                value={localConfig.containerPaddingTop || 0}
                onChange={(e) => handleChange('containerPaddingTop', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                style={{
                  background: `linear-gradient(to right, #111827 0%, #111827 ${((localConfig.containerPaddingTop || 0) / 120) * 100}%, #e5e7eb ${((localConfig.containerPaddingTop || 0) / 120) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>None</span>
                <span>Normal</span>
                <span>Large</span>
              </div>
            </div>
          </div>

          {/* Mobile Top Spacing - Para acercar a Gallery */}
          <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-blue-900">Mobile Top Spacing</label>
                <p className="text-xs text-blue-700 mt-0.5">Adjust spacing to Room Gallery on mobile</p>
              </div>
              <span className="text-xs font-medium text-blue-900">{localConfig.mobileTopSpacing || 0}px</span>
            </div>
            <div className="space-y-1">
              <input
                type="range"
                min="-60"
                max="60"
                step="4"
                value={localConfig.mobileTopSpacing || 0}
                onChange={(e) => handleChange('mobileTopSpacing', parseInt(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #1e40af 0%, #1e40af ${((localConfig.mobileTopSpacing || 0) + 60) / 120 * 100}%, #dbeafe ${((localConfig.mobileTopSpacing || 0) + 60) / 120 * 100}%, #dbeafe 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-blue-700">
                <span>Closer</span>
                <span>Normal</span>
                <span>Further</span>
              </div>
            </div>
          </div>

          {/* Mobile Card Position - Mover el card arriba o abajo */}
          <div className="space-y-2 p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-purple-900">Mobile Card Position</label>
                <p className="text-xs text-purple-700 mt-0.5">Move the info card up or down</p>
              </div>
              <span className="text-xs font-medium text-purple-900">{localConfig.mobileCardOffset || 0}px</span>
            </div>
            <div className="space-y-1">
              <input
                type="range"
                min="-80"
                max="40"
                step="4"
                value={localConfig.mobileCardOffset || 0}
                onChange={(e) => handleChange('mobileCardOffset', parseInt(e.target.value))}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${((localConfig.mobileCardOffset || 0) + 80) / 120 * 100}%, #ede9fe ${((localConfig.mobileCardOffset || 0) + 80) / 120 * 100}%, #ede9fe 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-purple-700">
                <span>Up</span>
                <span>Center</span>
                <span>Down</span>
              </div>
            </div>
          </div>

          {/* Top Padding (Internal) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Internal Top Padding</label>
              <span className="text-xs text-gray-500">{localConfig.paddingTop || 24}px</span>
            </div>
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="120"
                step="8"
                value={localConfig.paddingTop || 24}
                onChange={(e) => handleChange('paddingTop', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
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
          </div>

          {/* Bottom Padding (Internal) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Internal Bottom Padding</label>
              <span className="text-xs text-gray-500">{localConfig.paddingBottom || 24}px</span>
            </div>
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="120"
                step="8"
                value={localConfig.paddingBottom || 24}
                onChange={(e) => handleChange('paddingBottom', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
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
          </div>

          {/* Container Bottom Spacing (External) - PERMITE NEGATIVOS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Container Bottom Spacing</label>
              <span className="text-xs text-gray-500">{localConfig.containerPaddingBottom ?? 0}px</span>
            </div>
            <div className="space-y-1">
              {/* Input directo para debug */}
              <input
                type="number"
                min={-60}
                max={120}
                step={4}
                value={localConfig.containerPaddingBottom ?? 0}
                onChange={(e) => handleChange('containerPaddingBottom', Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm border rounded-md mb-2"
                placeholder="Enter value directly..."
              />
              
              {/* Slider */}
              <input
                type="range"
                min={-60}
                max={120}
                step={4}
                value={localConfig.containerPaddingBottom ?? 0}
                onChange={(e) => handleChange('containerPaddingBottom', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-60px</span>
                <span>0px</span>
                <span>120px</span>
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Display Options</h3>
            
            <div className="space-y-2">
              
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">Show Rating</label>
                <input
                  type="checkbox"
                  checked={localConfig.showRating}
                  onChange={(e) => handleChange('showRating', e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">Show Superhost Badge</label>
                <input
                  type="checkbox"
                  checked={localConfig.showSuperhost}
                  onChange={(e) => handleChange('showSuperhost', e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">Show Host Image</label>
                <input
                  type="checkbox"
                  checked={localConfig.showHostImage}
                  onChange={(e) => handleChange('showHostImage', e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">Show Host Verification</label>
                <input
                  type="checkbox"
                  checked={localConfig.showHostVerification}
                  onChange={(e) => handleChange('showHostVerification', e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
          </div>

          {/* Show Reservation Widget */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Reservation Widget</label>
            <input
              type="checkbox"
              checked={localConfig.showReservationWidget !== false}
              onChange={(e) => handleChange('showReservationWidget', e.target.checked)}
              className="rounded"
            />
          </div>

          {/* Reserve Button Text */}
          {localConfig.showReservationWidget && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Reserve Button Text</label>
              <input
                type="text"
                value={localConfig.reserveButtonText || 'Reserve'}
                onChange={(e) => handleChange('reserveButtonText', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border rounded-md"
                placeholder="Button text..."
              />
            </div>
          )}

          {/* Show Highlights */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Highlights Section</label>
            <input
              type="checkbox"
              checked={localConfig.showHighlights !== false}
              onChange={(e) => handleChange('showHighlights', e.target.checked)}
              className="rounded"
            />
          </div>

          {/* Highlights Configuration */}
          {localConfig.showHighlights && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium">Room Highlights</label>
              </div>
              <div className="text-xs text-gray-500 p-2 bg-blue-50 rounded">
                Room highlights are now integrated below the host info. 
                The default highlights will show Great Location, Self Check-in, and Superhost status.
              </div>
            </div>
          )}

          {/* Host Image Size */}
          {localConfig.showHostImage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Host Image Size</label>
                <span className="text-xs text-gray-500">{localConfig.hostImageSize || 48}px</span>
              </div>
              <div className="space-y-1">
                <input
                  type="range"
                  min="32"
                  max="80"
                  step="4"
                  value={localConfig.hostImageSize || 48}
                  onChange={(e) => handleChange('hostImageSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  style={{
                    background: `linear-gradient(to right, #111827 0%, #111827 ${((localConfig.hostImageSize - 32) / 48) * 100}%, #e5e7eb ${((localConfig.hostImageSize - 32) / 48) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Small</span>
                  <span>Medium</span>
                  <span>Large</span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Configuration Suggestions */}
          <div className="space-y-3 pt-3 border-t">
            <h3 className="text-sm font-medium text-gray-700">Additional Options (Coming Soon)</h3>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Custom badge text and colors</p>
              <p>• Animation effects on hover</p>
              <p>• Custom icons for amenities</p>
              <p>• Review stars style (filled/outlined)</p>
              <p>• Host response time display</p>
              <p>• Availability calendar preview</p>
              <p>• Price range display options</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}