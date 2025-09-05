/**
 * @file MulticolumnsImageItemEditor.tsx
 * @max-lines 300
 * @module Multicolumns
 * @description Editor para items de tipo imagen de Multicolumns (Image columns)
 * @template-section true
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Bold, Italic, Link, List, ListOrdered, Trash2, Upload, Video } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { MulticolumnsConfig, MulticolumnsItemConfig } from './types';

interface MulticolumnsImageItemEditorProps {
  sectionId: string;
  itemId: string;
}

export default function MulticolumnsImageItemEditor({ sectionId, itemId }: MulticolumnsImageItemEditorProps) {
  const { sections, updateSectionSettings, selectSection } = useEditorStore();
  
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  const config = section?.settings as MulticolumnsConfig;
  const item = config?.items?.find(i => i.id === itemId);
  
  const [localItem, setLocalItem] = useState<MulticolumnsItemConfig | null>(item || null);
  const [expandedSections, setExpandedSections] = useState({
    image: true,
    content: false,
    link: false,
  });

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Crear FormData para upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'multicolumns');
      
      try {
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          handleChange('image', data.url);
        } else {
          // Por ahora usar un placeholder local
          const reader = new FileReader();
          reader.onload = (e) => {
            handleChange('image', e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        // Fallback: usar FileReader para preview local
        const reader = new FileReader();
        reader.onload = (e) => {
          handleChange('image', e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const handleVideoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/webm,video/ogg';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Crear FormData para upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');
      
      try {
        const response = await fetch('/api/upload/video', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          handleChange('video', data.url);
        } else {
          // Por ahora usar un placeholder local
          const videoUrl = URL.createObjectURL(file);
          handleChange('video', videoUrl);
        }
      } catch (error) {
        // Fallback: usar URL.createObjectURL para preview local
        const videoUrl = URL.createObjectURL(file);
        handleChange('video', videoUrl);
      }
    };
    
    input.click();
  };

  useEffect(() => {
    const currentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    const currentConfig = currentSection?.settings as MulticolumnsConfig;
    const currentItem = currentConfig?.items?.find(i => i.id === itemId);
    
    if (currentItem && JSON.stringify(currentItem) !== JSON.stringify(localItem)) {
      setLocalItem(currentItem);
    }
  }, [sectionId, itemId, sections]);

  const handleChange = (field: keyof MulticolumnsItemConfig, value: any) => {
    if (!localItem || !section || !config) return;
    
    const updatedItem = { ...localItem, [field]: value };
    setLocalItem(updatedItem);
    
    const updatedItems = config.items.map(i =>
      i.id === itemId ? updatedItem : i
    );
    
    const groupId = Object.keys(sections).find(key => 
      sections[key as keyof typeof sections].includes(section)
    );
    
    if (groupId) {
      updateSectionSettings(groupId, section.id, {
        ...config,
        items: updatedItems
      });
    }
  };

  const handleBack = () => {
    selectSection(null);
  };

  const handleDeleteItem = () => {
    if (!section || !config) return;
    
    const updatedItems = config.items.filter(i => i.id !== itemId);
    const groupId = Object.keys(sections).find(key => 
      sections[key as keyof typeof sections].includes(section)
    );
    
    if (groupId) {
      updateSectionSettings(groupId, section.id, {
        ...config,
        items: updatedItems
      });
      selectSection(null);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!localItem || localItem.type !== 'image') {
    return (
      <div className="w-[320px] p-4 text-center text-gray-500">
        <p className="text-xs">Item not found or invalid type</p>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleBack}
          className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-medium">Image column</span>
        </button>
        
        {/* Visibility toggle */}
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Visible</span>
            <button
              onClick={() => handleChange('visible', !localItem.visible)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                localItem.visible ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                localItem.visible ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        
        {/* Image Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('image')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium">Image</span>
            {expandedSections.image ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.image && (
            <div className="px-3 pb-3 space-y-3">
              {/* Image Upload */}
              <div>
                <label className="text-xs text-gray-600">Image</label>
                {localItem.image ? (
                  <div className="mt-1 relative">
                    <img 
                      src={localItem.image} 
                      alt="Column image" 
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <button
                      onClick={() => handleChange('image', '')}
                      className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-1">
                    <button
                      onClick={handleImageUpload}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors flex flex-col items-center justify-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPG, PNG, GIF up to 10MB
                      </p>
                    </button>
                    <div className="mt-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-xs border rounded"
                        placeholder="Or enter image URL"
                        value={localItem.image || ''}
                        onChange={(e) => handleChange('image', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Video */}
              <div>
                <label className="text-xs text-gray-600">Video</label>
                {localItem.video ? (
                  <div className="mt-1 relative">
                    <video 
                      src={localItem.video} 
                      className="w-full h-32 object-cover rounded-md border"
                      controls
                    />
                    <button
                      onClick={() => handleChange('video', '')}
                      className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-1">
                    <button 
                      onClick={handleVideoUpload}
                      className="w-full px-3 py-2 text-xs border rounded-md hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Video className="w-3 h-3" />
                      Select video
                    </button>
                    <input
                      type="text"
                      className="mt-2 w-full px-2 py-1 text-xs border rounded"
                      placeholder="Or enter video URL (YouTube, Vimeo, etc.)"
                      value={localItem.video || ''}
                      onChange={(e) => handleChange('video', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Desktop Image Size */}
              <div>
                <label className="text-xs text-gray-600">Desktop image size</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={localItem.desktopImageSize || 100}
                    onChange={(e) => handleChange('desktopImageSize', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs w-12 text-right">{localItem.desktopImageSize || 100}</span>
                </div>
              </div>

              {/* Mobile Image Size */}
              <div>
                <label className="text-xs text-gray-600">Mobile image size</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={localItem.mobileImageSize || 100}
                    onChange={(e) => handleChange('mobileImageSize', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs w-12 text-right">{localItem.mobileImageSize || 100}</span>
                </div>
              </div>

              {/* Image Ratio */}
              <div>
                <label className="text-xs text-gray-600">Image ratio</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={localItem.imageRatio || 1}
                    onChange={(e) => handleChange('imageRatio', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs w-12 text-right">{localItem.imageRatio || 1}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('content')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium">Content</span>
            {expandedSections.content ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.content && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Heading</label>
                <input
                  type="text"
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localItem.heading}
                  onChange={(e) => handleChange('heading', e.target.value)}
                  placeholder="Image column"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Body</label>
                {/* Rich text toolbar */}
                <div className="mt-1 flex items-center gap-1 p-1 border border-b-0 rounded-t-md bg-gray-50">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <Bold className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <Italic className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <Link className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <List className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <ListOrdered className="w-3 h-3" />
                  </button>
                </div>
                <textarea
                  className="w-full px-2 py-1.5 text-sm border border-t-0 rounded-b-md"
                  rows={4}
                  value={localItem.body}
                  onChange={(e) => handleChange('body', e.target.value)}
                  placeholder="Pair text with an image to focus on your chosen product, collection or piece of news..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Link Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('link')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium">Link</span>
            {expandedSections.link ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.link && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Link label</label>
                <input
                  type="text"
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localItem.linkLabel}
                  onChange={(e) => handleChange('linkLabel', e.target.value)}
                  placeholder="Link label"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Link</label>
                <input
                  type="url"
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localItem.link}
                  onChange={(e) => handleChange('link', e.target.value)}
                  placeholder="Pega un enlace o busca"
                />
              </div>

              <p className="text-xs text-gray-500">
                Leave link label empty to make the whole column a link
              </p>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <div className="p-3">
          <button
            onClick={handleDeleteItem}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Eliminar bloque</span>
          </button>
        </div>

      </div>
    </div>
  );
}