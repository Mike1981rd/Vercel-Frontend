/**
 * @file GalleryItemEditor.tsx
 * @max-lines 300
 * @module Gallery
 * @description Editor para items individuales de Gallery
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { GalleryItemConfig, getDefaultGalleryItemConfig, GalleryConfig } from './types';

interface GalleryItemEditorProps {
  sectionId: string;
  itemId: string;
}

export default function GalleryItemEditor({ sectionId, itemId }: GalleryItemEditorProps) {
  const { sections, updateSectionSettings, selectSection } = useEditorStore();
  
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  const config = section?.settings as GalleryConfig;
  const item = config?.items?.find(i => i.id === itemId);
  
  const [localItem, setLocalItem] = useState<GalleryItemConfig>(() => {
    return item || getDefaultGalleryItemConfig();
  });

  useEffect(() => {
    const currentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    const currentConfig = currentSection?.settings as GalleryConfig;
    const currentItem = currentConfig?.items?.find(i => i.id === itemId);
    if (currentItem) {
      setLocalItem(currentItem);
    }
  }, [sectionId, itemId, sections]);

  const handleUpdate = (updates: Partial<GalleryItemConfig>) => {
    const newItem = { ...localItem, ...updates };
    setLocalItem(newItem);
    
    if (section && config) {
      const updatedItems = config.items.map(i =>
        i.id === itemId ? newItem : i
      );
      
      const groupId = Object.keys(sections).find(key => 
        sections[key as keyof typeof sections].includes(section)
      );
      
      if (groupId) {
        updateSectionSettings(groupId, sectionId, {
          ...config,
          items: updatedItems
        });
      }
    }
  };

  const handleBackToGallery = () => {
    // DEBE volver al panel lateral principal, no al editor del padre
    selectSection(null);
  };

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
      
      try {
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        
        // Usar la API real del backend
        const response = await fetch('http://localhost:5266/api/MediaUpload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          handleUpdate({ image: data.url });
        } else {
          const error = await response.text();
          console.error('Upload failed:', error);
          alert('Error al subir la imagen. Por favor intenta de nuevo.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Error de conexión. Asegúrate de que el backend esté ejecutándose.');
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
      
      try {
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        
        // Usar la API real del backend
        const response = await fetch('http://localhost:5266/api/MediaUpload/video', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          handleUpdate({ video: data.url });
        } else {
          const error = await response.text();
          console.error('Upload failed:', error);
          alert('Error al subir el video. Por favor intenta de nuevo.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Error de conexión. Asegúrate de que el backend esté ejecutándose.');
      }
    };
    
    input.click();
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleBackToGallery}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </button>
        <h3 className="text-lg font-semibold mt-2">Edit Gallery Item</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Media Section */}
        <div className="space-y-4">
          <h4 className="font-medium">Media</h4>
          
          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            <div 
              onClick={handleImageUpload}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 cursor-pointer transition-colors"
            >
              {localItem.image ? (
                <div className="relative">
                  <img 
                    src={localItem.image} 
                    alt="Gallery item" 
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <p className="text-xs text-gray-500">Click to change image</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate({ image: '' });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
          </div>

          {localItem.image && (
            <div>
              <label className="block text-sm font-medium mb-2">Image Alt Text</label>
              <input
                type="text"
                value={localItem.imageAlt || ''}
                onChange={(e) => handleUpdate({ imageAlt: e.target.value })}
                placeholder="Describe the image for accessibility..."
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">Important for SEO and accessibility</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Video (optional)</label>
            <button 
              onClick={handleVideoUpload}
              className="w-full px-3 py-2 border rounded-md text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span>{localItem.video ? 'Change video' : 'Select video'}</span>
              <Upload className="w-4 h-4 text-gray-400" />
            </button>
            {localItem.video && (
              <div className="mt-2">
                <video 
                  src={localItem.video} 
                  className="w-full h-32 object-cover rounded"
                  controls
                />
                <button
                  onClick={() => handleUpdate({ video: '' })}
                  className="text-xs text-red-600 hover:text-red-700 mt-1"
                >
                  Remove video
                </button>
              </div>
            )}
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={localItem.enlargeMedia}
              onChange={(e) => handleUpdate({ enlargeMedia: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Enlarge media on hover</span>
          </label>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          <h4 className="font-medium">Content</h4>
          
          <div>
            <label className="block text-sm font-medium mb-2">Subheading</label>
            <input
              type="text"
              value={localItem.subheading || ''}
              onChange={(e) => handleUpdate({ subheading: e.target.value })}
              placeholder="Enter subheading..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Heading</label>
            <input
              type="text"
              value={localItem.heading || ''}
              onChange={(e) => handleUpdate({ heading: e.target.value })}
              placeholder="Enter heading..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Button Text</label>
            <input
              type="text"
              value={localItem.button || ''}
              onChange={(e) => handleUpdate({ button: e.target.value })}
              placeholder="Shop Now"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Link</label>
            <input
              type="url"
              value={localItem.link || ''}
              onChange={(e) => handleUpdate({ link: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* Layout Section */}
        <div className="space-y-4">
          <h4 className="font-medium">Layout</h4>
          
          <div>
            <label className="block text-sm font-medium mb-2">Text Overlay Position</label>
            <select
              value={localItem.textOverlayPosition}
              onChange={(e) => handleUpdate({ textOverlayPosition: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
              <option value="middle-left">Middle Left</option>
              <option value="middle-center">Middle Center</option>
              <option value="middle-right">Middle Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>
        </div>

        {/* Visibility */}
        <div className="pt-4 border-t">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={localItem.visible}
              onChange={(e) => handleUpdate({ visible: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium">Visible</span>
          </label>
        </div>

      </div>
    </div>
  );
}