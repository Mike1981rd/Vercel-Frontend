/**
 * @file FeaturedCollectionEditor.tsx
 * @max-lines 600
 * @module FeaturedCollection
 * @description Editor para la sección del template FeaturedCollection
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { FeaturedCollectionConfig, getDefaultFeaturedCollectionConfig } from './types';
import ItemSelector from './ItemSelector';

interface FeaturedCollectionEditorProps {
  sectionId: string;
}

export default function FeaturedCollectionEditor({ sectionId }: FeaturedCollectionEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const { config: themeConfig } = useThemeConfigStore();
  
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  
  const [localConfig, setLocalConfig] = useState<FeaturedCollectionConfig>(() => {
    const cfg = (section?.settings ?? {}) as Partial<FeaturedCollectionConfig>;
    const merged = { ...getDefaultFeaturedCollectionConfig(), ...cfg } as FeaturedCollectionConfig;
    // Ensure arrays are initialized
    merged.selectedCollections = merged.selectedCollections || [];
    merged.selectedProducts = merged.selectedProducts || [];
    merged.selectedRooms = merged.selectedRooms || [];
    merged.activeType = merged.activeType || null;
    return merged;
  });

  const [expandedSections, setExpandedSections] = useState({
    general: true,
    content: true,
    selection: true,
    cards: false,
    features: false,
    collectionCard: false,
    autoplay: false,
    spacing: false,
  });

  const [selectorOpen, setSelectorOpen] = useState<'collections' | 'products' | 'rooms' | null>(null);

  useEffect(() => {
    const currentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    if (currentSection?.settings) {
      const cfg = currentSection.settings as Partial<FeaturedCollectionConfig>;
      const safe = { ...getDefaultFeaturedCollectionConfig(), ...cfg } as FeaturedCollectionConfig;
      safe.selectedCollections = safe.selectedCollections || [];
      safe.selectedProducts = safe.selectedProducts || [];
      safe.selectedRooms = safe.selectedRooms || [];
      safe.activeType = safe.activeType || null;
      if (JSON.stringify(safe) !== JSON.stringify(localConfig)) {
        setLocalConfig(safe);
      }
    }
  }, [sectionId, sections]);

  const handleChange = (field: keyof FeaturedCollectionConfig, value: any) => {
    const updatedConfig = { ...localConfig, [field]: value };
    setLocalConfig(updatedConfig);
    
    if (section) {
      const groupId = Object.keys(sections).find(key => 
        sections[key as keyof typeof sections].includes(section)
      );
      if (groupId) {
        updateSectionSettings(groupId, section.id, updatedConfig);
      }
    }
  };

  const handleSelectionSave = (type: 'collections' | 'products' | 'rooms', ids: number[]) => {
    const updatedConfig = { 
      ...localConfig,
      selectedCollections: localConfig.selectedCollections || [],
      selectedProducts: localConfig.selectedProducts || [],
      selectedRooms: localConfig.selectedRooms || []
    };
    
    // Clear other selections if selecting new type
    if (ids.length > 0) {
      if (type !== 'collections') updatedConfig.selectedCollections = [];
      if (type !== 'products') updatedConfig.selectedProducts = [];
      if (type !== 'rooms') updatedConfig.selectedRooms = [];
      updatedConfig.activeType = type;
    }
    
    // Update selected items
    if (type === 'collections') updatedConfig.selectedCollections = ids;
    if (type === 'products') updatedConfig.selectedProducts = ids;
    if (type === 'rooms') updatedConfig.selectedRooms = ids;
    
    // If no items selected, clear active type
    if (ids.length === 0 && 
        (updatedConfig.selectedCollections?.length || 0) === 0 &&
        (updatedConfig.selectedProducts?.length || 0) === 0 &&
        (updatedConfig.selectedRooms?.length || 0) === 0) {
      updatedConfig.activeType = null;
    }
    
    setLocalConfig(updatedConfig);
    
    if (section) {
      const groupId = Object.keys(sections).find(key => 
        sections[key as keyof typeof sections].includes(section)
      );
      if (groupId) {
        updateSectionSettings(groupId, section.id, updatedConfig);
      }
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSelectionCount = (type: 'collections' | 'products' | 'rooms') => {
    switch(type) {
      case 'collections': return localConfig.selectedCollections?.length || 0;
      case 'products': return localConfig.selectedProducts?.length || 0;
      case 'rooms': return localConfig.selectedRooms?.length || 0;
      default: return 0;
    }
  };

  if (selectorOpen) {
    return (
      <ItemSelector
        type={selectorOpen}
        selectedIds={
          selectorOpen === 'collections' ? (localConfig.selectedCollections || []) :
          selectorOpen === 'products' ? (localConfig.selectedProducts || []) :
          (localConfig.selectedRooms || [])
        }
        onSave={(ids) => {
          handleSelectionSave(selectorOpen, ids);
          setSelectorOpen(null);
        }}
        onClose={() => setSelectorOpen(null)}
      />
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        
        {/* General Settings */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('general')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              General Settings
            </span>
            {expandedSections.general ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.general && (
            <div className="px-3 pb-3 space-y-3">
              {/* Color Scheme */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Color scheme</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.colorScheme}
                  onChange={(e) => handleChange('colorScheme', e.target.value)}
                >
                  {themeConfig?.colorSchemes?.schemes?.map((scheme, index) => (
                    <option key={index + 1} value={String(index + 1)}>
                      {scheme.name || `Color scheme ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Width */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Width</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="page">Page</option>
                </select>
              </div>

              {/* Desktop Layout */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Desktop layout</label>
                <div className="mt-1 space-y-1">
                  {['grid', 'carousel', 'slider'].map((layout) => (
                    <label key={layout} className="flex items-center">
                      <input
                        type="radio"
                        name="desktopLayout"
                        value={layout}
                        checked={localConfig.desktopLayout === layout}
                        onChange={(e) => handleChange('desktopLayout', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{layout}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Content */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('content')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Content
            </span>
            {expandedSections.content ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.content && (
            <div className="px-3 pb-3 space-y-3">
              {/* Heading */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Heading</label>
                <input
                  type="text"
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.heading}
                  onChange={(e) => handleChange('heading', e.target.value)}
                />
              </div>

              {/* Heading Size */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Heading size</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.headingSize}
                  onChange={(e) => handleChange('headingSize', e.target.value)}
                >
                  {['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'].map((size) => (
                    <option key={size} value={size}>Heading {size.substring(1)}</option>
                  ))}
                </select>
              </div>

              {/* Heading Alignment */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Heading alignment</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.headingAlignment || 'center'}
                  onChange={(e) => handleChange('headingAlignment', e.target.value)}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                </select>
              </div>

              {/* Heading Spacing */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Spacing after heading: {localConfig.headingSpacing ?? 32}px
                </label>
                <input
                  type="range"
                  className="w-full mt-1"
                  min="0"
                  max="80"
                  step="4"
                  value={localConfig.headingSpacing ?? 32}
                  onChange={(e) => handleChange('headingSpacing', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>40</span>
                  <span>80</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selection */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('selection')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Selection
            </span>
            {expandedSections.selection ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.selection && (
            <div className="px-3 pb-3 space-y-3">
              {/* Collection Selector */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Collection</label>
                <div className="space-y-2">
                  <div className="relative">
                    <select 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 appearance-none pr-10"
                      value=""
                      disabled
                    >
                      <option value="">Restaurantes</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                  
                  {getSelectionCount('collections') > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {getSelectionCount('collections')} collections selected
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSelectorOpen('collections')}
                    className="w-full py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    Cambiar
                  </button>
                </div>
              </div>

              {/* Products Selector */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Products</label>
                <div className="space-y-2">
                  {/* Selected items preview */}
                  {getSelectionCount('products') > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"></div>
                        <span className="text-sm truncate">Ejecutiva</span>
                      </div>
                      {getSelectionCount('products') > 1 && (
                        <div className="text-xs text-gray-500 px-2">
                          Mostrar más ({getSelectionCount('products') - 1})
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 p-2">No products selected</div>
                  )}
                  
                  <button
                    onClick={() => setSelectorOpen('products')}
                    className="w-full py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    Cambiar
                  </button>
                  
                  <div className="text-xs text-orange-600 mt-1">
                    Products have priority over a collection
                  </div>
                </div>
              </div>

              {/* Rooms Selector */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Rooms</label>
                <div className="space-y-2">
                  {/* Selected items preview */}
                  {getSelectionCount('rooms') > 0 ? (
                    <div className="space-y-1">
                      {/* Show first 3 selected rooms */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"></div>
                          <span className="text-sm truncate">Habitación</span>
                        </div>
                      </div>
                      {getSelectionCount('rooms') > 1 && (
                        <button className="text-xs text-blue-600 hover:underline px-2">
                          Mostrar más
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 p-2">No rooms selected</div>
                  )}
                  
                  <button
                    onClick={() => setSelectorOpen('rooms')}
                    className="w-full py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('cards')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Cards
            </span>
            {expandedSections.cards ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.cards && (
            <div className="px-3 pb-3 space-y-3">
              {/* Image Ratio */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Image ratio</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.imageRatio}
                  onChange={(e) => handleChange('imageRatio', e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                  <option value="square">Square</option>
                </select>
              </div>

              {/* Content Alignment */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Content alignment</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.contentAlignment || 'center'}
                  onChange={(e) => handleChange('contentAlignment', e.target.value)}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                </select>
              </div>

              {/* Content Position */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Content position</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.contentPosition}
                  onChange={(e) => handleChange('contentPosition', e.target.value)}
                >
                  <option value="bottom">Sobre imagen - Abajo</option>
                  <option value="top">Sobre imagen - Arriba</option>
                  <option value="center">Sobre imagen - Centro</option>
                </select>
              </div>

              {/* Cards to Show */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Cards to show: {localConfig.cardsToShow || 3}
                </label>
                <input
                  type="range"
                  className="w-full mt-1"
                  min="1"
                  max="12"
                  value={localConfig.cardsToShow || 3}
                  onChange={(e) => handleChange('cardsToShow', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>6</span>
                  <span>12</span>
                </div>
              </div>

              {/* Edge Rounding */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Edge rounding: {localConfig.edgeRounding ?? 12}px
                </label>
                <input
                  type="range"
                  className="w-full mt-1"
                  min="0"
                  max="32"
                  step="2"
                  value={localConfig.edgeRounding ?? 12}
                  onChange={(e) => handleChange('edgeRounding', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>16</span>
                  <span>32</span>
                </div>
              </div>

              {/* Desktop Cards per Row */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Desktop cards per row: {localConfig.desktopColumns || 3}
                </label>
                <input
                  type="range"
                  className="w-full mt-1"
                  min="1"
                  max="5"
                  value={localConfig.desktopColumns || 3}
                  onChange={(e) => handleChange('desktopColumns', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>

              {/* Desktop Space Between Cards */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Desktop space between cards: {localConfig.desktopGap ?? 24}px
                </label>
                <input
                  type="range"
                  className="w-full mt-1"
                  min="0"
                  max="80"
                  step="4"
                  value={localConfig.desktopGap ?? 24}
                  onChange={(e) => handleChange('desktopGap', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>40</span>
                  <span>80</span>
                </div>
              </div>

              {/* Mobile Space Between Cards */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Mobile space between cards: {localConfig.mobileGap ?? 16}px
                </label>
                <input
                  type="range"
                  className="w-full mt-1"
                  min="0"
                  max="48"
                  step="4"
                  value={localConfig.mobileGap ?? 16}
                  onChange={(e) => handleChange('mobileGap', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>24</span>
                  <span>48</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Card */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('collectionCard')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Collection card
            </span>
            {expandedSections.collectionCard ? (
              <ChevronUp className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            )}
          </button>
          
          {expandedSections.collectionCard && (
            <div className="px-3 pb-3 space-y-3">
              {/* Card Position */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Card position</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.cardPosition || 'after-all-items'}
                  onChange={(e) => handleChange('cardPosition', e.target.value)}
                >
                  <option value="after-all-items">After all items</option>
                  <option value="first">First</option>
                  <option value="last">Last</option>
                </select>
              </div>

              {/* Content Position */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Content position</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.collectionContentPosition || 'on-image-bottom'}
                  onChange={(e) => handleChange('collectionContentPosition', e.target.value)}
                >
                  <option value="on-image-bottom">On image - Bottom</option>
                  <option value="on-image-center">On image - Center</option>
                  <option value="on-image-top">On image - Top</option>
                  <option value="below-image">Below image</option>
                </select>
              </div>

              {/* Content Alignment */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Content alignment</label>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handleChange('collectionContentAlignment', 'left')}
                    className={`flex-1 p-2 border rounded ${
                      (localConfig.collectionContentAlignment || 'center') === 'left'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <svg className="w-4 h-4 mx-auto" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleChange('collectionContentAlignment', 'center')}
                    className={`flex-1 p-2 border rounded ${
                      (localConfig.collectionContentAlignment || 'center') === 'center'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <svg className="w-4 h-4 mx-auto" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleChange('collectionContentAlignment', 'right')}
                    className={`flex-1 p-2 border rounded ${
                      (localConfig.collectionContentAlignment || 'center') === 'right'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <svg className="w-4 h-4 mx-auto" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Collection Title Size */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Collection title size</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.collectionTitleSize || 'h6'}
                  onChange={(e) => handleChange('collectionTitleSize', e.target.value)}
                >
                  {['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'].map((size) => (
                    <option key={size} value={size}>Heading {size.substring(1)}</option>
                  ))}
                </select>
              </div>

              {/* Show Product Count */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600 dark:text-gray-400">Show product count</label>
                <button
                  onClick={() => handleChange('showProductCount', !localConfig.showProductCount)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showProductCount ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showProductCount ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Overlay Opacity */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Overlay opacity: {localConfig.overlayOpacity || 15}%
                </label>
                <input
                  type="range"
                  className="w-full mt-1"
                  min="0"
                  max="100"
                  step="10"
                  value={localConfig.overlayOpacity || 15}
                  onChange={(e) => handleChange('overlayOpacity', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Only for 'on image' positions
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Autoplay */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('autoplay')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Autoplay
            </span>
            {expandedSections.autoplay ? (
              <ChevronUp className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            )}
          </button>
          
          {expandedSections.autoplay && (
            <div className="px-3 pb-3 space-y-3">
              {/* Autoplay Mode */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Autoplay mode</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.autoplayMode || 'none'}
                  onChange={(e) => handleChange('autoplayMode', e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="one-at-a-time">One-at-a-time</option>
                  <option value="seamless">Seamless</option>
                </select>
              </div>

              {/* Autoplay Speed */}
              {localConfig.autoplayMode && localConfig.autoplayMode !== 'none' && (
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">
                    Autoplay speed: {localConfig.autoplaySpeed || 5}s
                  </label>
                  <input
                    type="range"
                    className="w-full mt-1"
                    min="3"
                    max="10"
                    step="1"
                    value={localConfig.autoplaySpeed || 5}
                    onChange={(e) => handleChange('autoplaySpeed', parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>3s</span>
                    <span>6s</span>
                    <span>10s</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('features')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Features
            </span>
            {expandedSections.features ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.features && (
            <div className="px-3 pb-3 space-y-3">
              {/* Show Arrow on Hover */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show arrow on hover</span>
                <button
                  onClick={() => handleChange('showArrowOnHover', !localConfig.showArrowOnHover)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showArrowOnHover ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showArrowOnHover ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Show Add to Cart */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show add to cart</span>
                <button
                  onClick={() => handleChange('showAddToCart', !localConfig.showAddToCart)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showAddToCart ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showAddToCart ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Add to Cart Button Text */}
              {localConfig.showAddToCart && (
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Button text</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                    value={localConfig.addToCartText || 'Agregar al carrito'}
                    onChange={(e) => handleChange('addToCartText', e.target.value)}
                    placeholder="Agregar al carrito"
                  />
                </div>
              )}

              {/* Show Buy Button */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show buy button</span>
                <button
                  onClick={() => handleChange('showBuyButton', !localConfig.showBuyButton)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showBuyButton ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showBuyButton ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Buy Button Text */}
              {localConfig.showBuyButton && (
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Button text</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                    value={localConfig.buyButtonText || 'Comprar ahora'}
                    onChange={(e) => handleChange('buyButtonText', e.target.value)}
                    placeholder="Comprar ahora"
                  />
                </div>
              )}

              {/* Show Reserve Button */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show reserve button</span>
                <button
                  onClick={() => handleChange('showReserveButton', !localConfig.showReserveButton)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showReserveButton ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showReserveButton ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Reserve Button Text */}
              {localConfig.showReserveButton && (
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Button text</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                    value={localConfig.reserveButtonText || 'Reservar'}
                    onChange={(e) => handleChange('reserveButtonText', e.target.value)}
                    placeholder="Reservar"
                  />
                </div>
              )}

              {/* Color Card Background */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Color card background</span>
                <button
                  onClick={() => handleChange('colorCardBackground', !localConfig.colorCardBackground)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.colorCardBackground ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.colorCardBackground ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Show Currency Code */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show currency code</span>
                <button
                  onClick={() => handleChange('showCurrencyCode', !localConfig.showCurrencyCode)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showCurrencyCode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showCurrencyCode ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Show Sale Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show 'Sale' badge</span>
                <button
                  onClick={() => handleChange('showSaleBadge', !localConfig.showSaleBadge)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showSaleBadge ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showSaleBadge ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Show Sale Badge Next to Price */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show 'Sale' badge next to price</span>
                <button
                  onClick={() => handleChange('showSaleBadgeNextToPrice', !localConfig.showSaleBadgeNextToPrice)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showSaleBadgeNextToPrice ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showSaleBadgeNextToPrice ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Show Sold Out Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show 'Sold out' badge</span>
                <button
                  onClick={() => handleChange('showSoldOutBadge', !localConfig.showSoldOutBadge)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showSoldOutBadge ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showSoldOutBadge ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Product Rating */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Product rating</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.productRating || 'stars-only'}
                  onChange={(e) => handleChange('productRating', e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="stars-only">Stars only</option>
                  <option value="review-count-only">Review count only</option>
                  <option value="average-rating-only">Average rating only</option>
                  <option value="review-count-and-stars">Review count and stars</option>
                  <option value="average-rating-and-stars">Average rating and stars</option>
                </select>
              </div>

              {/* Stars Color */}
              <div style={{ 
                display: localConfig.productRating && 
                         localConfig.productRating !== 'none' && 
                         localConfig.productRating !== 'review-count-only' && 
                         localConfig.productRating !== 'average-rating-only' ? 'block' : 'none' 
              }}>
                <label className="text-xs text-gray-600 dark:text-gray-400">Stars color</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={localConfig.starsColor || '#fbbf24'}
                    onChange={(e) => handleChange('starsColor', e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.starsColor || '#fbbf24'}
                    onChange={(e) => handleChange('starsColor', e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                    placeholder="#fbbf24"
                  />
                </div>
              </div>

              {/* Show Vendor */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show vendor</span>
                <button
                  onClick={() => handleChange('showVendor', !localConfig.showVendor)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showVendor ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showVendor ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Show Color Count */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show color count</span>
                <button
                  onClick={() => handleChange('showColorCount', !localConfig.showColorCount)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showColorCount ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showColorCount ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Desktop Button */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Desktop button</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.desktopButton || 'quick-add'}
                  onChange={(e) => handleChange('desktopButton', e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="quick-add">Quick add</option>
                  <option value="quick-shop">Quick shop</option>
                  <option value="view-product">View product</option>
                </select>
              </div>

              {/* Button Style */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Button style</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                  value={localConfig.buttonStyle}
                  onChange={(e) => handleChange('buttonStyle', e.target.value)}
                >
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Spacing */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('spacing')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Spacing
            </span>
            {expandedSections.spacing ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.spacing && (
            <div className="px-3 pb-3 space-y-3">
              {/* Top Spacing */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Top spacing: {localConfig.topSpacing ?? 40}px
                </label>
                <input
                  type="range"
                  className="w-full mt-1"
                  min="0"
                  max="120"
                  step="10"
                  value={localConfig.topSpacing ?? 40}
                  onChange={(e) => handleChange('topSpacing', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>60</span>
                  <span>120</span>
                </div>
              </div>

              {/* Heading Spacing */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Spacing below heading: {localConfig.headingSpacing ?? 32}px
                </label>
                <input
                  type="range"
                  className="w-full mt-1"
                  min="0"
                  max="80"
                  step="8"
                  value={localConfig.headingSpacing ?? 32}
                  onChange={(e) => handleChange('headingSpacing', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>40</span>
                  <span>80</span>
                </div>
              </div>

              {/* Bottom Spacing */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Bottom spacing: {localConfig.bottomSpacing ?? 40}px
                </label>
                <input
                  type="range"
                  className="w-full mt-1"
                  min="0"
                  max="120"
                  step="10"
                  value={localConfig.bottomSpacing ?? 40}
                  onChange={(e) => handleChange('bottomSpacing', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>60</span>
                  <span>120</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enabled Toggle */}
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Show section</span>
            <button
              onClick={() => handleChange('enabled', !localConfig.enabled)}
              className={`w-10 h-5 rounded-full transition-colors ${
                localConfig.enabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                localConfig.enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}