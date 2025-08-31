/**
 * @file MulticolumnsEditor.tsx
 * @max-lines 300
 * @module Multicolumns
 * @description Editor para la sección del template Multicolumns
 * @template-section true
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { MulticolumnsConfig, getDefaultMulticolumnsConfig } from './types';

interface MulticolumnsEditorProps {
  sectionId: string;
}

export default function MulticolumnsEditor({ sectionId }: MulticolumnsEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const { config: themeConfig } = useThemeConfigStore();
  
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  
  const [localConfig, setLocalConfig] = useState<MulticolumnsConfig>(() => {
    return (section?.settings || getDefaultMulticolumnsConfig()) as MulticolumnsConfig;
  });

  const [expandedSections, setExpandedSections] = useState({
    general: true,
    content: false,
    columns: false,
    layout: false,
    appearance: false,
    button: false,
    autoplay: false,
    paddings: false
  });

  useEffect(() => {
    const currentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    if (currentSection?.settings) {
      const newSettings = currentSection.settings;
      if (JSON.stringify(newSettings) !== JSON.stringify(localConfig)) {
        setLocalConfig(newSettings as MulticolumnsConfig);
      }
    }
  }, [sectionId, sections]);

  const handleChange = (field: keyof MulticolumnsConfig, value: any) => {
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        
        {/* General Settings */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('general')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium">General Settings</span>
            {expandedSections.general ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.general && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Color scheme</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.colorScheme}
                  onChange={(e) => handleChange('colorScheme', e.target.value)}
                >
                  {themeConfig?.colorSchemes?.schemes?.map((scheme, index) => (
                    <option key={index} value={String(index + 1)}>
                      {scheme.name || `Color scheme ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Width</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                >
                  <option value="screen">Full screen</option>
                  <option value="page">Page width</option>
                  <option value="large">Large</option>
                  <option value="medium">Medium</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Desktop layout</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.desktopLayout}
                  onChange={(e) => handleChange('desktopLayout', e.target.value)}
                >
                  <option value="grid">Grid</option>
                  <option value="carousel">Carousel</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Mobile layout</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.mobileLayout}
                  onChange={(e) => handleChange('mobileLayout', e.target.value)}
                >
                  <option value="1column">1 Column</option>
                  <option value="carousel">Carousel</option>
                  <option value="slideshow">Slideshow</option>
                </select>
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
                  value={localConfig.heading}
                  onChange={(e) => handleChange('heading', e.target.value)}
                  placeholder="Enter heading text"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Body</label>
                <textarea
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  rows={3}
                  value={localConfig.body}
                  onChange={(e) => handleChange('body', e.target.value)}
                  placeholder="Enter body text"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Heading size</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={localConfig.headingSize}
                    onChange={(e) => handleChange('headingSize', parseFloat(e.target.value))}
                    className="flex-1 min-w-0"
                  />
                  <span className="text-xs flex-shrink-0 text-right">{localConfig.headingSize}x</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Body size</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={localConfig.bodySize}
                    onChange={(e) => handleChange('bodySize', parseFloat(e.target.value))}
                    className="flex-1 min-w-0"
                  />
                  <span className="text-xs flex-shrink-0 text-right">{localConfig.bodySize}x</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Content alignment</label>
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => handleChange('contentAlignment', 'left')}
                    className={`p-2 rounded ${localConfig.contentAlignment === 'left' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <AlignLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleChange('contentAlignment', 'center')}
                    className={`p-2 rounded ${localConfig.contentAlignment === 'center' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <AlignCenter className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleChange('contentAlignment', 'right')}
                    className={`p-2 rounded ${localConfig.contentAlignment === 'right' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <AlignRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Icon alignment</label>
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => handleChange('iconAlignment', 'left')}
                    className={`p-2 rounded ${(localConfig.iconAlignment || localConfig.contentAlignment) === 'left' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <AlignLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleChange('iconAlignment', 'center')}
                    className={`p-2 rounded ${(localConfig.iconAlignment || localConfig.contentAlignment) === 'center' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <AlignCenter className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleChange('iconAlignment', 'right')}
                    className={`p-2 rounded ${(localConfig.iconAlignment || localConfig.contentAlignment) === 'right' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <AlignRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columns */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('columns')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium">Columns</span>
            {expandedSections.columns ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.columns && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Heading size</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={localConfig.columnsHeadingSize}
                    onChange={(e) => handleChange('columnsHeadingSize', parseFloat(e.target.value))}
                    className="flex-1 min-w-0"
                  />
                  <span className="text-xs flex-shrink-0 text-right">{localConfig.columnsHeadingSize}x</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Body size</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={localConfig.columnsBodySize}
                    onChange={(e) => handleChange('columnsBodySize', parseFloat(e.target.value))}
                    className="flex-1 min-w-0"
                  />
                  <span className="text-xs flex-shrink-0 text-right">{localConfig.columnsBodySize}x</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layout */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('layout')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium">Layout</span>
            {expandedSections.layout ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.layout && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Desktop cards per row</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={localConfig.desktopCardsPerRow}
                    onChange={(e) => handleChange('desktopCardsPerRow', parseInt(e.target.value))}
                    className="flex-1 min-w-0"
                  />
                  <span className="text-xs flex-shrink-0 text-right">{localConfig.desktopCardsPerRow}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Desktop space between cards</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="4"
                    value={localConfig.desktopSpaceBetweenCards}
                    onChange={(e) => handleChange('desktopSpaceBetweenCards', parseInt(e.target.value))}
                    className="flex-1 min-w-0"
                  />
                  <span className="text-xs flex-shrink-0 text-right">{localConfig.desktopSpaceBetweenCards}px</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Desktop spacing</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="4"
                    value={localConfig.desktopSpacing}
                    onChange={(e) => handleChange('desktopSpacing', parseInt(e.target.value))}
                    className="flex-1 min-w-0"
                  />
                  <span className="text-xs flex-shrink-0 text-right">{localConfig.desktopSpacing}px</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Mobile space between cards</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="4"
                    value={localConfig.mobileSpaceBetweenCards}
                    onChange={(e) => handleChange('mobileSpaceBetweenCards', parseInt(e.target.value))}
                    className="flex-1 min-w-0"
                  />
                  <span className="text-xs flex-shrink-0 text-right">{localConfig.mobileSpaceBetweenCards}px</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Mobile spacing</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="4"
                    value={localConfig.mobileSpacing}
                    onChange={(e) => handleChange('mobileSpacing', parseInt(e.target.value))}
                    className="flex-1 min-w-0"
                  />
                  <span className="text-xs flex-shrink-0 text-right">{localConfig.mobileSpacing}px</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('appearance')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium">Appearance</span>
            {expandedSections.appearance ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.appearance && (
            <div className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Color columns</span>
                <button
                  onClick={() => handleChange('colorColumns', !localConfig.colorColumns)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.colorColumns ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.colorColumns ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Show arrows on hover</span>
                <button
                  onClick={() => handleChange('showArrowsOnHover', !localConfig.showArrowsOnHover)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showArrowsOnHover ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showArrowsOnHover ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Button */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('button')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium">Button</span>
            {expandedSections.button ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.button && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Button label</label>
                <input
                  type="text"
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.buttonLabel}
                  onChange={(e) => handleChange('buttonLabel', e.target.value)}
                  placeholder="Button text"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Button link</label>
                <input
                  type="text"
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.buttonLink}
                  onChange={(e) => handleChange('buttonLink', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Button style</label>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handleChange('buttonStyle', 'solid')}
                    className={`px-3 py-1 text-xs rounded ${
                      localConfig.buttonStyle === 'solid' ? 'bg-blue-600 text-white' : 'border'
                    }`}
                  >
                    Solid
                  </button>
                  <button
                    onClick={() => handleChange('buttonStyle', 'outline')}
                    className={`px-3 py-1 text-xs rounded ${
                      localConfig.buttonStyle === 'outline' ? 'bg-blue-600 text-white' : 'border'
                    }`}
                  >
                    Outline
                  </button>
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
            <span className="text-xs font-medium">Autoplay</span>
            {expandedSections.autoplay ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.autoplay && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Autoplay mode</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.autoplay}
                  onChange={(e) => handleChange('autoplay', e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="oneAtATime">One at a time</option>
                  <option value="seamless">Seamless</option>
                </select>
              </div>

              {localConfig.autoplay !== 'none' && (
                <div>
                  <label className="text-xs text-gray-600">Autoplay speed</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min="1000"
                      max="10000"
                      step="500"
                      value={localConfig.autoplaySpeed || 3000}
                      onChange={(e) => handleChange('autoplaySpeed', parseInt(e.target.value))}
                      className="flex-1 min-w-0"
                    />
                    <span className="text-xs flex-shrink-0 text-right">{((localConfig.autoplaySpeed || 3000) / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Paddings */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('paddings')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium">Paddings</span>
            {expandedSections.paddings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.paddings && (
            <div className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Add side paddings</span>
                <button
                  onClick={() => handleChange('addSidePaddings', !localConfig.addSidePaddings)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.addSidePaddings ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.addSidePaddings ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div>
                <label className="text-xs text-gray-600">Top padding</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localConfig.topPadding}
                    onChange={(e) => handleChange('topPadding', parseInt(e.target.value))}
                    className="flex-1 min-w-0"
                  />
                  <span className="text-xs flex-shrink-0 text-right">{localConfig.topPadding}px</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Bottom padding</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localConfig.bottomPadding}
                    onChange={(e) => handleChange('bottomPadding', parseInt(e.target.value))}
                    className="flex-1 min-w-0"
                  />
                  <span className="text-xs flex-shrink-0 text-right">{localConfig.bottomPadding}px</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Container height</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="800"
                    step="50"
                    value={localConfig.containerHeight}
                    onChange={(e) => handleChange('containerHeight', parseInt(e.target.value))}
                    className="flex-1 min-w-0"
                  />
                  <span className="text-xs flex-shrink-0 text-right">
                    {localConfig.containerHeight === 0 ? 'Auto' : `${localConfig.containerHeight}px`}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Set to 0 for automatic height</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}