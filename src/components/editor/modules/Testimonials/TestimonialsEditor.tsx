/**
 * @file TestimonialsEditor.tsx
 * @max-lines 300
 * @module Testimonials
 * @description Editor principal para configuración de Testimonials
 */

import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/constants';
import { ChevronDown, ChevronUp, Upload, Image, X } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { TestimonialsConfig, getDefaultTestimonialsConfig } from './types';

interface TestimonialsEditorProps {
  sectionId: string;
}

export default function TestimonialsEditor({ sectionId }: TestimonialsEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const { config: themeConfig } = useThemeConfigStore();
  
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  const [localConfig, setLocalConfig] = useState<TestimonialsConfig>(
    (section?.settings as TestimonialsConfig) || getDefaultTestimonialsConfig()
  );
  
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    layout: false,
    content: false,
    background: false,
    autoplay: false,
    paddings: false,
    custom: false
  });
  
  useEffect(() => {
    setLocalConfig((section?.settings as TestimonialsConfig) || getDefaultTestimonialsConfig());
  }, [section?.settings]);
  
  const handleUpdate = (updates: Partial<TestimonialsConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    
    const groupId = Object.entries(sections).find(([_, items]) => 
      items.some(s => s.id === sectionId)
    )?.[0] || 'template';
    
    updateSectionSettings(groupId, sectionId, newConfig);
  };
  
  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/MediaUpload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          handleUpdate({ backgroundImage: data.url });
        } else {
          alert('Error al subir la imagen. Por favor intenta de nuevo.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Error de conexión. Asegúrate de que el backend esté ejecutándose.');
      }
    };
    
    input.click();
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          
          {/* General Settings */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('general')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">General Settings</span>
              {expandedSections.general ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.general && (
              <div className="p-4 space-y-4 border-t">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localConfig.enabled}
                      onChange={(e) => handleUpdate({ enabled: e.target.checked })}
                    />
                    <span>Enabled</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Color Scheme</label>
                  <select
                    value={localConfig.colorScheme}
                    onChange={(e) => handleUpdate({ colorScheme: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    {themeConfig?.colorSchemes?.schemes?.map((scheme: any, index: number) => (
                      <option key={index} value={String(index + 1)}>
                        {scheme.name || `Color scheme ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localConfig.colorBackground}
                      onChange={(e) => handleUpdate({ colorBackground: e.target.checked })}
                    />
                    <span>Color background</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localConfig.colorTestimonials}
                      onChange={(e) => handleUpdate({ colorTestimonials: e.target.checked })}
                    />
                    <span>Color testimonials</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Width</label>
                  <select
                    value={localConfig.width}
                    onChange={(e) => handleUpdate({ width: e.target.value as any })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="screen">Screen</option>
                    <option value="page">Page</option>
                    <option value="large">Large</option>
                    <option value="medium">Medium</option>
                    <option value="small">Small</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Layout Settings */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('layout')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">Layout</span>
              {expandedSections.layout ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.layout && (
              <div className="p-4 space-y-4 border-t">
                <div>
                  <label className="block text-sm font-medium mb-2">Desktop Layout</label>
                  <select
                    value={localConfig.desktopLayout}
                    onChange={(e) => handleUpdate({ desktopLayout: e.target.value as any })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="bottom-carousel">Bottom - Carousel</option>
                    <option value="left-vertical">Left - Vertical</option>
                    <option value="right-vertical">Right - Vertical</option>
                    <option value="bottom-slideshow">Bottom - Slideshow</option>
                    <option value="bottom-grid">Bottom - Grid</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Desktop cards per row: {localConfig.desktopCardsPerRow}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={localConfig.desktopCardsPerRow}
                    onChange={(e) => handleUpdate({ desktopCardsPerRow: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Desktop space between cards: {localConfig.desktopSpaceBetweenCards}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={localConfig.desktopSpaceBetweenCards}
                    onChange={(e) => handleUpdate({ desktopSpaceBetweenCards: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Desktop Content Alignment</label>
                  <select
                    value={localConfig.desktopContentAlignment}
                    onChange={(e) => handleUpdate({ desktopContentAlignment: e.target.value as any })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Content Alignment</label>
                  <select
                    value={localConfig.mobileContentAlignment}
                    onChange={(e) => handleUpdate({ mobileContentAlignment: e.target.value as any })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localConfig.showRating}
                      onChange={(e) => handleUpdate({ showRating: e.target.checked })}
                    />
                    <span>Show rating</span>
                  </label>
                </div>
                
                {localConfig.showRating && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating Stars Color</label>
                    <input
                      type="color"
                      value={localConfig.ratingStarsColor}
                      onChange={(e) => handleUpdate({ ratingStarsColor: e.target.value })}
                      className="w-full h-10 border rounded"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Content Settings */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('content')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">Content</span>
              {expandedSections.content ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.content && (
              <div className="p-4 space-y-4 border-t">
                <div>
                  <label className="block text-sm font-medium mb-2">Subheading</label>
                  <input
                    type="text"
                    value={localConfig.subheading || ''}
                    onChange={(e) => handleUpdate({ subheading: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="TESTIMONIALS"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Heading</label>
                  <input
                    type="text"
                    value={localConfig.heading || ''}
                    onChange={(e) => handleUpdate({ heading: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Customer stories"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Body</label>
                  <textarea
                    value={localConfig.body || ''}
                    onChange={(e) => handleUpdate({ body: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={4}
                    placeholder="Description..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Link Label</label>
                  <input
                    type="text"
                    value={localConfig.linkLabel || ''}
                    onChange={(e) => handleUpdate({ linkLabel: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Link</label>
                  <input
                    type="text"
                    value={localConfig.link || ''}
                    onChange={(e) => handleUpdate({ link: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Paddings */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('paddings')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">Paddings</span>
              {expandedSections.paddings ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.paddings && (
              <div className="p-4 space-y-4 border-t">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localConfig.addSidePaddings}
                      onChange={(e) => handleUpdate({ addSidePaddings: e.target.checked })}
                    />
                    <span>Add side paddings</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Top padding: {localConfig.topPadding}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={localConfig.topPadding}
                    onChange={(e) => handleUpdate({ topPadding: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bottom padding: {localConfig.bottomPadding}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={localConfig.bottomPadding}
                    onChange={(e) => handleUpdate({ bottomPadding: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
