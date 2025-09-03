/**
 * @file SlideEditor.tsx
 * @max-lines 300
 * @module Slideshow
 * Editor for individual slide configuration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { SlideshowConfig, SlideConfig } from './types';
import { SlideImageVideoEditor } from './SlideImageVideoEditor';
import { SlideContentEditor } from './SlideContentEditor';

interface SlideEditorProps {
  sectionId: string;
  slideId: string;
}

export default function SlideEditor({ sectionId, slideId }: SlideEditorProps) {
  const { sections, updateSectionSettings, selectSection } = useEditorStore();
  
  // Find section and slide
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  const config = section?.settings as SlideshowConfig;
  const slides = config?.slides || [];
  const currentSlide = slides.find((s: SlideConfig) => s.id === slideId);
  
  // Local state
  const [localSlide, setLocalSlide] = useState<SlideConfig | null>(currentSlide || null);
  const [expandedSections, setExpandedSections] = useState({
    image: true,
    video: false,
    content: false,
    position: false,
    background: false,
    buttons: false
  });
  
  // Sync with props
  useEffect(() => {
    const updatedSection = Object.values(sections).flat().find(s => s.id === sectionId);
    const updatedConfig = updatedSection?.settings as SlideshowConfig;
    const updatedSlide = updatedConfig?.slides?.find((s: SlideConfig) => s.id === slideId);
    
    if (updatedSlide && JSON.stringify(updatedSlide) !== JSON.stringify(localSlide)) {
      setLocalSlide(updatedSlide);
    }
  }, [sectionId, slideId, sections]);
  
  if (!localSlide) {
    return (
      <div className="w-[320px] h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-500">Slide not found</p>
      </div>
    );
  }
  
  const handleBack = () => {
    selectSection(null);  // Go back to main sidebar
  };
  
  const handleChange = (field: keyof SlideConfig, value: any) => {
    console.log('[DEBUG SlideEditor] handleChange:', { field, value, slideId });
    const updatedSlide = { ...localSlide, [field]: value };
    setLocalSlide(updatedSlide);
    
    // Update in store
    if (section && config) {
      const updatedSlides = slides.map((s: SlideConfig) => 
        s.id === slideId ? updatedSlide : s
      );
      
      const groupId = Object.keys(sections).find(key => 
        sections[key as keyof typeof sections].includes(section)
      );
      
      if (groupId) {
        console.log('[DEBUG SlideEditor] Updating store with:', { groupId, sectionId: section.id, field, value });
        updateSectionSettings(groupId, section.id, {
          ...config,
          slides: updatedSlides
        });
      }
    }
  };
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };
  
  const handleDeleteSlide = () => {
    if (section && config) {
      const updatedSlides = slides.filter((s: SlideConfig) => s.id !== slideId);
      
      const groupId = Object.keys(sections).find(key => 
        sections[key as keyof typeof sections].includes(section)
      );
      
      if (groupId) {
        updateSectionSettings(groupId, section.id, {
          ...config,
          slides: updatedSlides
        });
        handleBack();
      }
    }
  };
  
  return (
    <div className="w-[320px] h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-medium">Image slide</h3>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image and Video sections */}
        <SlideImageVideoEditor
          slide={localSlide}
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
          onChange={handleChange}
        />
        
        {/* Content and position sections */}
        <SlideContentEditor
          slide={localSlide}
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
          onChange={handleChange}
        />
      </div>
      
      {/* Footer with delete button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleDeleteSlide}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Eliminar bloque</span>
        </button>
      </div>
    </div>
  );
}