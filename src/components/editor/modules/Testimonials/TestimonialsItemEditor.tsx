/**
 * @file TestimonialsItemEditor.tsx
 * @max-lines 300
 * @module Testimonials
 * @description Editor para testimonios individuales
 */

import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/constants';
import { ArrowLeft, Upload, X, Trash2 } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { TestimonialsConfig, TestimonialsItemConfig } from './types';

interface TestimonialsItemEditorProps {
  sectionId: string;
  itemId: string;
}

export default function TestimonialsItemEditor({ sectionId, itemId }: TestimonialsItemEditorProps) {
  const { sections, updateSectionSettings, selectSection } = useEditorStore();
  
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  const config = section?.settings as TestimonialsConfig;
  const item = config?.items?.find(i => i.id === itemId);
  
  const [localItem, setLocalItem] = useState<TestimonialsItemConfig>(
    item || {
      id: itemId,
      visible: true,
      sortOrder: 0,
      rating: 5,
      testimonial: '',
      authorName: '',
      authorDetails: ''
    }
  );
  
  useEffect(() => {
    if (item) {
      setLocalItem(item);
    }
  }, [item]);
  
  const handleUpdate = (updates: Partial<TestimonialsItemConfig>) => {
    const newItem = { ...localItem, ...updates };
    setLocalItem(newItem);
    
    const groupId = Object.entries(sections).find(([_, items]) => 
      items.some(s => s.id === sectionId)
    )?.[0] || 'template';
    
    const newItems = config.items.map(i => 
      i.id === itemId ? newItem : i
    );
    
    updateSectionSettings(groupId, sectionId, {
      ...config,
      items: newItems
    });
  };
  
  const handleDelete = () => {
    const groupId = Object.entries(sections).find(([_, items]) => 
      items.some(s => s.id === sectionId)
    )?.[0] || 'template';
    
    const newItems = config.items.filter(i => i.id !== itemId);
    
    updateSectionSettings(groupId, sectionId, {
      ...config,
      items: newItems
    });
    
    selectSection(null);
  };
  
  const handleAvatarUpload = async () => {
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
          handleUpdate({ authorAvatar: data.url });
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
          handleUpdate({ image: data.url });
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
  
  if (!item) {
    return (
      <div className="p-4">
        <p>Testimonial not found</p>
      </div>
    );
  }
  
  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => selectSection(null)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <ArrowLeft size={20} />
          </button>
          <h3 className="font-medium text-gray-900 dark:text-white">Testimonial</h3>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Rating: {localItem.rating}
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={localItem.rating}
            onChange={(e) => handleUpdate({ rating: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        
        {/* Testimonial Text */}
        <div>
          <label className="block text-sm font-medium mb-2">Testimonial</label>
          <textarea
            value={localItem.testimonial}
            onChange={(e) => handleUpdate({ testimonial: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={6}
            placeholder="Add authentic testimonials of your customers..."
          />
        </div>
        
        {/* Author Avatar */}
        <div>
          <label className="block text-sm font-medium mb-2">Author avatar</label>
          <div 
            onClick={handleAvatarUpload}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 cursor-pointer transition-colors"
          >
            {localItem.authorAvatar ? (
              <div className="relative">
                <img 
                  src={localItem.authorAvatar} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full mx-auto object-cover mb-2"
                />
                <p className="text-xs text-gray-500">Click to change avatar</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdate({ authorAvatar: '' });
                  }}
                  className="absolute top-0 right-1/3 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload avatar</p>
              </>
            )}
          </div>
        </div>
        
        {/* Author Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Author name</label>
          <input
            type="text"
            value={localItem.authorName}
            onChange={(e) => handleUpdate({ authorName: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Author"
          />
        </div>
        
        {/* Author Details */}
        <div>
          <label className="block text-sm font-medium mb-2">Author details</label>
          <input
            type="text"
            value={localItem.authorDetails || ''}
            onChange={(e) => handleUpdate({ authorDetails: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Author details"
          />
        </div>
        
        {/* Product */}
        <div>
          <label className="block text-sm font-medium mb-2">Product</label>
          <input
            type="text"
            value={localItem.product || ''}
            onChange={(e) => handleUpdate({ product: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Select product..."
          />
        </div>
        
        {/* Image */}
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
                  alt="Product" 
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <p className="text-xs text-gray-500">Click to change image</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdate({ image: '' });
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload image</p>
              </>
            )}
          </div>
        </div>
        
        {/* Image Priority */}
        {localItem.image && (
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localItem.imagePriority || false}
                onChange={(e) => handleUpdate({ imagePriority: e.target.checked })}
              />
              <span className="text-sm">Image has priority over product</span>
            </label>
          </div>
        )}
        
        {/* Testimonial Link */}
        <div>
          <label className="block text-sm font-medium mb-2">Testimonial link</label>
          <input
            type="text"
            value={localItem.testimonialLink || ''}
            onChange={(e) => handleUpdate({ testimonialLink: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Pega un enlace o busca"
          />
        </div>
        
        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          <span>Eliminar bloque</span>
        </button>
        
      </div>
    </div>
  );
}
