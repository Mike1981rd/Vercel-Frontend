/**
 * @file FAQItemEditor.tsx
 * @max-lines 300
 * @module FAQ
 * @description Editor completo para items individuales de FAQ
 * @template-section true
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bold, Italic, Link2, List, ListOrdered, ImageIcon, FileVideo } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { FAQConfig, FAQItemConfig } from './types';

interface FAQItemEditorProps {
  sectionId: string;
  itemId: string;
}

export default function FAQItemEditor({ sectionId, itemId }: FAQItemEditorProps) {
  const { sections, updateSectionSettings, selectSection } = useEditorStore();
  
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  const config = section?.settings as FAQConfig;
  const item = config?.items?.find(i => i.id === itemId);
  
  const [localItem, setLocalItem] = useState<FAQItemConfig | null>(item || null);

  useEffect(() => {
    const currentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    const currentConfig = currentSection?.settings as FAQConfig;
    const currentItem = currentConfig?.items?.find(i => i.id === itemId);
    
    if (currentItem && JSON.stringify(currentItem) !== JSON.stringify(localItem)) {
      setLocalItem(currentItem);
    }
  }, [sectionId, itemId, sections]);

  const handleChange = (field: keyof FAQItemConfig, value: any) => {
    if (!localItem || !section || !config) return;
    
    const updatedItem = { ...localItem, [field]: value };
    setLocalItem(updatedItem);
    
    // Actualizar en el store
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
    // Regresar a la configuración del padre FAQ
    selectSection(sectionId);
  };

  const imageInputRef = React.useRef<HTMLInputElement | null>(null);
  const videoInputRef = React.useRef<HTMLInputElement | null>(null);
  const customIconInputRef = React.useRef<HTMLInputElement | null>(null);

  const handlePickImage = () => {
    imageInputRef.current?.click();
  };

  const handlePickVideo = () => {
    videoInputRef.current?.click();
  };

  const handlePickCustomIcon = () => {
    customIconInputRef.current?.click();
  };

  const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    handleChange('image', url);
  };

  const handleVideoChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    handleChange('video', url);
  };

  const handleCustomIconChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    handleChange('customIcon', url);
  };

  if (!localItem) {
    return (
      <div className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="text-sm text-gray-500">Item not found</div>
      </div>
    );
  }

  // Lista de iconos disponibles (ejemplo)
  const availableIcons = [
    'none',
    'check-circle',
    'info-circle',
    'question-circle',
    'star',
    'heart',
    'bell',
    'flag',
    'bookmark',
    'tag',
  ];

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header con flecha de regreso */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleBack}
          className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            FAQ Item
          </span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-3 space-y-3">
          {/* Heading */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Heading</label>
            <input
              type="text"
              className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              value={localItem.heading}
              onChange={(e) => handleChange('heading', e.target.value)}
              placeholder="Cuentan con Material de Apoyo?"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Icon</label>
            <select 
              className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              value={localItem.icon || 'none'}
              onChange={(e) => handleChange('icon', e.target.value)}
            >
              {availableIcons.map(icon => (
                <option key={icon} value={icon}>
                  {icon === 'none' ? 'None' : icon.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            <div className="mt-1 text-xs text-blue-600 hover:underline cursor-pointer">
              See what icon stands for each label
            </div>
          </div>

          {/* Custom icon */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Custom icon</label>
            <button 
              onClick={handlePickCustomIcon}
              className="w-full py-2 px-3 text-sm border border-dashed border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Seleccionar</span>
            </button>
            <input ref={customIconInputRef} type="file" accept="image/*" className="hidden" onChange={handleCustomIconChange} />
            <div className="mt-1 text-xs text-blue-600 hover:underline cursor-pointer">
              Explorar imágenes gratuitas
            </div>
          </div>

          {/* Source (Rich Text Editor) */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Source</label>
            <div className="mt-1 border border-gray-300 rounded-md">
              <div className="flex items-center gap-1 p-1 border-b border-gray-200">
                <button className="p-1 hover:bg-gray-100 rounded"><Bold className="w-3 h-3" /></button>
                <button className="p-1 hover:bg-gray-100 rounded"><Italic className="w-3 h-3" /></button>
                <button className="p-1 hover:bg-gray-100 rounded"><Link2 className="w-3 h-3" /></button>
                <button className="p-1 hover:bg-gray-100 rounded"><List className="w-3 h-3" /></button>
                <button className="p-1 hover:bg-gray-100 rounded"><ListOrdered className="w-3 h-3" /></button>
              </div>
              <div className="px-2 py-1.5">
                <textarea
                  className="w-full min-h-[150px] text-sm outline-none resize-none"
                  value={localItem.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  placeholder="Sí, contamos con material de apoyo para que puedas estudiar mejor..."
                />
              </div>
            </div>
            
          </div>

          {/* Page */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Page</label>
            <button 
              className="w-full py-2 px-3 text-sm border border-dashed border-gray-300 rounded-md hover:bg-gray-50"
            >
              Seleccionar
            </button>
          </div>

          {/* Image */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Image</label>
            <button 
              onClick={handlePickImage}
              className="w-full py-2 px-3 text-sm border border-dashed border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Seleccionar</span>
            </button>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <div className="mt-1 text-xs text-blue-600 hover:underline cursor-pointer">
              Explorar imágenes gratuitas
            </div>
          </div>

          {/* Video */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Video</label>
            <button 
              onClick={handlePickVideo}
              className="w-full py-2 px-3 text-sm border border-dashed border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <FileVideo className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Seleccionar</span>
            </button>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
          </div>

          {/* Desktop image size */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Desktop image size</label>
              <span className="text-xs text-gray-500">{localItem.desktopImageSize}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={localItem.desktopImageSize}
              onChange={(e) => handleChange('desktopImageSize', Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Eliminar bloque */}
          <div className="pt-3 border-t border-gray-200">
            <button className="w-full py-2 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors">
              🗑 Eliminar bloque
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}