/**
 * @file ImageWithTextItemEditor.tsx
 * @max-lines 250
 * @module ImageWithText
 * @description Editor para cada item hijo (imagen/video) de ImageWithText
 * @template-section true
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Image, Video, X, Eye, EyeOff } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { ImageWithTextItem } from './types';

interface ImageWithTextItemEditorProps {
  sectionId: string;
  itemId: string;
}

export default function ImageWithTextItemEditor({ sectionId, itemId }: ImageWithTextItemEditorProps) {
  const { sections, updateSectionSettings, selectSection, toggleConfigPanel } = useEditorStore();
  
  // Buscar la sección y el item
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  const items = section?.settings?.items || [];
  const item = items.find((i: ImageWithTextItem) => i.id === itemId);
  
  const [localItem, setLocalItem] = useState<ImageWithTextItem>(
    item || {
      id: itemId,
      type: 'image',
      imageUrl: '',
      videoUrl: '',
      altText: '',
      visible: true
    }
  );

  useEffect(() => {
    const currentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    const currentItems = currentSection?.settings?.items || [];
    const currentItem = currentItems.find((i: ImageWithTextItem) => i.id === itemId);
    
    if (currentItem) {
      setLocalItem(currentItem);
    }
  }, [sectionId, itemId, sections]);

  const handleUpdate = (updates: Partial<ImageWithTextItem>) => {
    const updatedItem = { ...localItem, ...updates };
    setLocalItem(updatedItem);
    
    // Actualizar en el store
    if (section) {
      const groupId = Object.keys(sections).find(key => 
        sections[key as keyof typeof sections].includes(section)
      );
      
      if (groupId) {
        const updatedItems = items.map((i: ImageWithTextItem) => 
          i.id === itemId ? updatedItem : i
        );
        
        updateSectionSettings(groupId, section.id, {
          ...section.settings,
          items: updatedItems
        });
      }
    }
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
          console.log('Image uploaded:', data.url);
          handleUpdate({ 
            imageUrl: data.url, 
            type: 'image',
            videoUrl: '' 
          });
        } else {
          console.error('Upload failed:', await response.text());
          alert('Error uploading image. Please try again.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Connection error. Make sure the backend is running.');
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
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const token = localStorage.getItem('token');
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
          console.log('Video uploaded:', data.url);
          handleUpdate({ 
            videoUrl: data.url, 
            type: 'video',
            imageUrl: '' 
          });
        } else {
          console.error('Upload failed:', await response.text());
          alert('Error uploading video. Please try again.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Connection error. Make sure the backend is running.');
      }
    };
    
    input.click();
  };

  const handleDelete = () => {
    if (section) {
      const groupId = Object.keys(sections).find(key => 
        sections[key as keyof typeof sections].includes(section)
      );
      
      if (groupId) {
        const updatedItems = items.filter((i: ImageWithTextItem) => i.id !== itemId);
        
        updateSectionSettings(groupId, section.id, {
          ...section.settings,
          items: updatedItems
        });
        
        // Volver al editor principal
        selectSection(null);
        toggleConfigPanel(false);
      }
    }
  };

  const handleBack = () => {
    // DEBE volver al panel lateral principal, no al editor del padre
    selectSection(null);
    toggleConfigPanel(false);
  };

  if (!item) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 p-4">
        <div className="text-sm text-gray-500">Item not found</div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">
              {localItem.type === 'video' ? 'Video' : 'Image'} Settings
            </span>
          </div>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Media Upload */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
            Media
          </label>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleImageUpload}
              className={`flex-1 p-2 border rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 ${
                localItem.type === 'image' ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <Image className="w-4 h-4" />
              <span className="text-xs">Image</span>
            </button>
            <button
              onClick={handleVideoUpload}
              className={`flex-1 p-2 border rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 ${
                localItem.type === 'video' ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <Video className="w-4 h-4" />
              <span className="text-xs">Video</span>
            </button>
          </div>

          {/* Preview */}
          {(localItem.imageUrl || localItem.videoUrl) ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              {localItem.type === 'image' && localItem.imageUrl ? (
                <img 
                  src={localItem.imageUrl} 
                  alt={localItem.altText || ''} 
                  className="w-full h-32 object-cover"
                />
              ) : localItem.type === 'video' && localItem.videoUrl ? (
                <video 
                  src={localItem.videoUrl} 
                  className="w-full h-32 object-cover"
                  controls
                />
              ) : null}
              
              <button
                onClick={() => handleUpdate({ imageUrl: '', videoUrl: '' })}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div 
              onClick={localItem.type === 'video' ? handleVideoUpload : handleImageUpload}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Click to upload</p>
              <p className="text-xs text-gray-400 mt-1">
                {localItem.type === 'video' ? 'MP4, WEBM, OGG' : 'PNG, JPG, GIF up to 50MB'}
              </p>
            </div>
          )}
        </div>

        {/* Alt Text */}
        {localItem.type === 'image' && (
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Alt text
            </label>
            <input
              type="text"
              value={localItem.altText || ''}
              onChange={(e) => handleUpdate({ altText: e.target.value })}
              placeholder="Describe the image"
              className="w-full px-2 py-1.5 text-sm border rounded-md"
            />
          </div>
        )}

        {/* Visibility */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Visible
          </span>
          <button
            onClick={() => handleUpdate({ visible: !localItem.visible })}
            className={`w-10 h-5 rounded-full transition-colors ${
              localItem.visible ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              localItem.visible ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}