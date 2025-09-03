'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';

interface RoomCalendarConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  minimumNights: number;
  blockedDates: string[];
}

interface RoomCalendarEditorProps {
  sectionId: string;
}

const getDefaultConfig = (): RoomCalendarConfig => ({
  enabled: true,
  title: 'Select check-in date',
  subtitle: 'Add your travel dates for exact pricing',
  minimumNights: 2,
  blockedDates: []
});

export default function RoomCalendarEditor({ sectionId }: RoomCalendarEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [localConfig, setLocalConfig] = useState<RoomCalendarConfig>(getDefaultConfig());

  const section = sections.template.find(s => s.id === sectionId) ||
                  sections.headerGroup.find(s => s.id === sectionId) ||
                  sections.footerGroup.find(s => s.id === sectionId);

  useEffect(() => {
    if (section?.settings) {
      const newConfig = { ...getDefaultConfig(), ...section.settings };
      setLocalConfig(newConfig);
    }
  }, [section?.settings]);

  const handleChange = (field: keyof RoomCalendarConfig, value: any) => {
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
          <Calendar className="w-4 h-4" />
          <span className="font-medium text-sm">Room Calendar</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 border-b">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show calendar</label>
            <input
              type="checkbox"
              checked={localConfig.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="rounded"
            />
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={localConfig.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Title"
              className="w-full px-3 py-1.5 text-sm border rounded-md"
            />

            <input
              type="text"
              value={localConfig.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="Subtitle"
              className="w-full px-3 py-1.5 text-sm border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Minimum nights</label>
            <input
              type="number"
              value={localConfig.minimumNights}
              onChange={(e) => handleChange('minimumNights', parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-1.5 text-sm border rounded-md"
            />
          </div>

        </div>
      )}
    </div>
  );
}