'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface RoomThingsConfig {
  enabled: boolean;
  title: string;
  houseRules: string[];
  safetyProperty: string[];
  cancellationPolicy: string[];
  showMoreButton: boolean;
  colorScheme: string;
  syncWithRoom: boolean; // New field to control sync
}

interface RoomThingsEditorProps {
  sectionId: string;
}


const getDefaultConfig = (): RoomThingsConfig => ({
  enabled: true,
  title: 'Things to know',
  houseRules: [],
  safetyProperty: [],
  cancellationPolicy: [],
  showMoreButton: true,
  colorScheme: '1',
  syncWithRoom: true // Default to sync with room data
});


export default function RoomThingsEditor({ sectionId }: RoomThingsEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const { config: themeConfig } = useThemeConfigStore();
  const { t, language } = useI18n();
  const [isExpanded, setIsExpanded] = useState(true);
  const [localConfig, setLocalConfig] = useState<RoomThingsConfig>(getDefaultConfig());

  const section = sections.template.find(s => s.id === sectionId) ||
                  sections.headerGroup.find(s => s.id === sectionId) ||
                  sections.footerGroup.find(s => s.id === sectionId);

  useEffect(() => {
    if (section?.settings) {
      const newConfig = { ...getDefaultConfig(), ...section.settings };
      console.log('RoomThingsEditor - Loading settings:', section.settings);
      console.log('RoomThingsEditor - New config:', newConfig);
      setLocalConfig(newConfig);
    }
  }, [section?.settings]);

  const handleChange = (field: keyof RoomThingsConfig, value: any) => {
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
          <Info className="w-4 h-4" />
          <span className="font-medium text-sm">Room Things to Know</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 border-b max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show section</label>
            <input
              type="checkbox"
              checked={localConfig.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="rounded"
            />
          </div>

          <input
            type="text"
            value={localConfig.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Section title"
            className="w-full px-3 py-1.5 text-sm border rounded-md"
          />

          <div className="flex items-center justify-between">
            <label className="text-sm">Show more button</label>
            <input
              type="checkbox"
              checked={localConfig.showMoreButton}
              onChange={(e) => handleChange('showMoreButton', e.target.checked)}
              className="rounded"
            />
          </div>

          {/* Sync with Room Data Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {t('editor.syncWithRoomData', 'Sync with room data')}
            </label>
            <input
              type="checkbox"
              checked={localConfig.syncWithRoom}
              onChange={(e) => handleChange('syncWithRoom', e.target.checked)}
              className="rounded"
            />
          </div>

          {/* Information about data source */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {localConfig.syncWithRoom 
                ? t('editor.roomThingsInfo', 'Data will be automatically loaded from the selected room\'s policies and settings')
                : t('editor.roomThingsManual', 'Using manual configuration (not synced with room data)')
              }
            </p>
          </div>

          {/* Color Scheme Selector */}
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

        </div>
      )}
    </div>
  );
}