'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { ChevronDown, ChevronUp, Bed, Plus, X } from 'lucide-react';

interface SleepingArea {
  id: string;
  icon: string;
  title: string;
  description: string;
  image?: string;
}

interface RoomSleepingConfig {
  enabled: boolean;
  title: string;
  areas: SleepingArea[];
}

interface RoomSleepingEditorProps {
  sectionId: string;
}

const getDefaultConfig = (): RoomSleepingConfig => ({
  enabled: true,
  title: 'Where you\'ll sleep',
  areas: [
    {
      id: '1',
      icon: 'Bed',
      title: 'Bedroom 1',
      description: '1 queen bed'
    },
    {
      id: '2',
      icon: 'Bed',
      title: 'Bedroom 2', 
      description: '2 single beds'
    }
  ]
});

export default function RoomSleepingEditor({ sectionId }: RoomSleepingEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [localConfig, setLocalConfig] = useState<RoomSleepingConfig>(getDefaultConfig());

  const section = sections.template.find(s => s.id === sectionId) ||
                  sections.headerGroup.find(s => s.id === sectionId) ||
                  sections.footerGroup.find(s => s.id === sectionId);

  useEffect(() => {
    if (section?.settings) {
      const newConfig = { ...getDefaultConfig(), ...section.settings };
      setLocalConfig(newConfig);
    }
  }, [section?.settings]);

  const handleChange = (field: keyof RoomSleepingConfig, value: any) => {
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

  const handleAreaChange = (index: number, field: keyof SleepingArea, value: string) => {
    const newAreas = [...localConfig.areas];
    newAreas[index] = { ...newAreas[index], [field]: value };
    handleChange('areas', newAreas);
  };

  const addArea = () => {
    const newArea: SleepingArea = {
      id: Date.now().toString(),
      icon: 'Bed',
      title: 'New bedroom',
      description: '1 bed'
    };
    handleChange('areas', [...localConfig.areas, newArea]);
  };

  const removeArea = (index: number) => {
    const newAreas = localConfig.areas.filter((_, i) => i !== index);
    handleChange('areas', newAreas);
  };

  const commonIcons = ['Bed', 'Users', 'Moon', 'Home', 'Door', 'Sofa'];

  return (
    <div className="bg-white dark:bg-gray-900">
      <div 
        className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bed className="w-4 h-4" />
          <span className="font-medium text-sm">Room Sleeping</span>
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-600 uppercase">Sleeping Areas</h3>
              <button
                onClick={addArea}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>

            {localConfig.areas.map((area, index) => (
              <div key={area.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Area {index + 1}</span>
                  <button
                    onClick={() => removeArea(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <select
                  value={area.icon}
                  onChange={(e) => handleAreaChange(index, 'icon', e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded"
                >
                  {commonIcons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={area.title}
                  onChange={(e) => handleAreaChange(index, 'title', e.target.value)}
                  placeholder="Title"
                  className="w-full px-2 py-1 text-sm border rounded"
                />

                <input
                  type="text"
                  value={area.description}
                  onChange={(e) => handleAreaChange(index, 'description', e.target.value)}
                  placeholder="Description"
                  className="w-full px-2 py-1 text-sm border rounded"
                />

                <input
                  type="text"
                  value={area.image || ''}
                  onChange={(e) => handleAreaChange(index, 'image', e.target.value)}
                  placeholder="Image URL (optional)"
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}