/**
 * @file SlideImageVideoEditor.tsx
 * @max-lines 300
 * @module Slideshow
 * Image and video overlay editor for slides
 */

'use client';

import React from 'react';
import { API_URL } from '@/lib/constants';
import { ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { SlideConfig } from './types';

interface SlideImageVideoEditorProps {
  slide: SlideConfig;
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;
  onChange: (field: keyof SlideConfig, value: any) => void;
}

export function SlideImageVideoEditor({
  slide,
  expandedSections,
  onToggleSection,
  onChange
}: SlideImageVideoEditorProps) {
  
  const handleImageUpload = async (field: 'desktopImage' | 'mobileImage') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Crear FormData para upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'slideshow');
      
      try {
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        
        // Usar la API real del backend
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
          onChange(field, data.url);
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
  
  const handleVideoUpload = async (field: 'desktopVideo' | 'mobileVideo') => {
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
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        
        // Usar la API real del backend
        const response = await fetch(`${API_URL}/MediaUpload/video`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          onChange(field, data.url);
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
    <>
      {/* Image Section */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onToggleSection('image')}
          className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            Image
          </span>
          {expandedSections.image ? 
            <ChevronUp className="w-3 h-3 text-gray-500" /> : 
            <ChevronDown className="w-3 h-3 text-gray-500" />
          }
        </button>
        
        {expandedSections.image && (
          <div className="px-3 pb-3 space-y-3">
            {/* Desktop Image */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Desktop image</label>
              <div className="mt-1">
                {slide.desktopImage ? (
                  <div className="relative">
                    <img 
                      src={slide.desktopImage} 
                      alt="Desktop" 
                      className="w-full h-32 object-cover rounded border"
                    />
                    <button
                      onClick={() => onChange('desktopImage', '')}
                      className="absolute top-1 right-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleImageUpload('desktopImage')}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Select image</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Image */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Mobile image</label>
              <div className="mt-1">
                {slide.mobileImage ? (
                  <div className="relative">
                    <img 
                      src={slide.mobileImage} 
                      alt="Mobile" 
                      className="w-full h-32 object-cover rounded border"
                    />
                    <button
                      onClick={() => onChange('mobileImage', '')}
                      className="absolute top-1 right-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleImageUpload('mobileImage')}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Select image</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Section */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onToggleSection('video')}
          className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            Video
          </span>
          {expandedSections.video ? 
            <ChevronUp className="w-3 h-3 text-gray-500" /> : 
            <ChevronDown className="w-3 h-3 text-gray-500" />
          }
        </button>
        
        {expandedSections.video && (
          <div className="px-3 pb-3 space-y-3">
            {/* Desktop Video */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Desktop video</label>
              <div className="mt-1">
                {slide.desktopVideo ? (
                  <div className="relative">
                    <video 
                      src={slide.desktopVideo} 
                      className="w-full h-32 object-cover rounded border"
                      muted
                      loop
                    />
                    <button
                      onClick={() => onChange('desktopVideo', '')}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleVideoUpload('desktopVideo')}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Upload video</span>
                    <span className="text-xs text-gray-400">MP4, WebM</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Video */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Mobile video</label>
              <div className="mt-1">
                {slide.mobileVideo ? (
                  <div className="relative">
                    <video 
                      src={slide.mobileVideo} 
                      className="w-full h-32 object-cover rounded border"
                      muted
                      loop
                    />
                    <button
                      onClick={() => onChange('mobileVideo', '')}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleVideoUpload('mobileVideo')}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Upload video</span>
                    <span className="text-xs text-gray-400">MP4, WebM</span>
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Overlay Opacity */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">
                Desktop overlay opacity: {slide.desktopOverlayOpacity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={slide.desktopOverlayOpacity}
                onChange={(e) => onChange('desktopOverlayOpacity', parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>

            {/* Mobile Overlay Opacity */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">
                Mobile overlay opacity: {slide.mobileOverlayOpacity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={slide.mobileOverlayOpacity}
                onChange={(e) => onChange('mobileOverlayOpacity', parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
