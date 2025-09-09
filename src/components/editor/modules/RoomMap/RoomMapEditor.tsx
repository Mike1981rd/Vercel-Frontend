'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';

interface RoomMapConfig {
  enabled: boolean;
  title: string;
  address: string;
  neighborhood: string;
  city: string;
  description: string;
  mapImage: string;
  showExactLocation: boolean;
}

interface RoomMapEditorProps {
  sectionId: string;
}

const getDefaultConfig = (): RoomMapConfig => ({
  enabled: true,
  title: 'Where you\'ll be',
  address: '123 Main Street, San Francisco, CA 94102',
  neighborhood: 'Downtown',
  city: 'San Francisco, California',
  description: 'Great location with easy access to public transportation and local attractions.',
  mapImage: '',
  showExactLocation: false
});

export default function RoomMapEditor({ sectionId }: RoomMapEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [localConfig, setLocalConfig] = useState<RoomMapConfig>(getDefaultConfig());

  const section = sections.template.find(s => s.id === sectionId) ||
                  sections.headerGroup.find(s => s.id === sectionId) ||
                  sections.footerGroup.find(s => s.id === sectionId);

  useEffect(() => {
    if (section?.settings) {
      const newConfig = { ...getDefaultConfig(), ...section.settings };
      setLocalConfig(newConfig);
    }
  }, [section?.settings]);

  const handleChange = (field: keyof RoomMapConfig, value: any) => {
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
          <MapPin className="w-4 h-4" />
          <span className="font-medium text-sm">Room Map</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 border-b">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show map</label>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Location Details</label>
            
            <input
              type="text"
              value={localConfig.neighborhood}
              onChange={(e) => handleChange('neighborhood', e.target.value)}
              placeholder="Neighborhood"
              className="w-full px-3 py-1.5 text-sm border rounded-md"
            />

            <input
              type="text"
              value={localConfig.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="City, State"
              className="w-full px-3 py-1.5 text-sm border rounded-md"
            />

            <textarea
              value={localConfig.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Location description"
              rows={3}
              className="w-full px-3 py-1.5 text-sm border rounded-md resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Exact Address</label>
            <input
              type="text"
              value={localConfig.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Full address"
              className="w-full px-3 py-1.5 text-sm border rounded-md"
            />
            
            <div className="flex items-center justify-between">
              <label className="text-sm">Show exact location</label>
              <input
                type="checkbox"
                checked={localConfig.showExactLocation}
                onChange={(e) => handleChange('showExactLocation', e.target.checked)}
                className="rounded"
              />
            </div>
            <p className="text-xs text-gray-500">
              {localConfig.showExactLocation 
                ? 'Exact address will be shown'
                : 'Only general area will be shown'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Map Image URL</label>
            <input
              type="text"
              value={localConfig.mapImage}
              onChange={(e) => handleChange('mapImage', e.target.value)}
              placeholder="Map image URL (optional)"
              className="w-full px-3 py-1.5 text-sm border rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}