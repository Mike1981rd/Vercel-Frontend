/**
 * @file FAQEditor.tsx
 * @max-lines 300
 * @module FAQ
 * @description Editor completo para la sección FAQ con accordion
 * @template-section true
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Bold, Italic, Link2, List, ListOrdered } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { FAQConfig, FAQCategoryConfig, getDefaultFAQConfig } from './types';
import { GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';

interface FAQEditorProps {
  sectionId: string;
}

export default function FAQEditor({ sectionId }: FAQEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  
  const [localConfig, setLocalConfig] = useState<FAQConfig>(() => {
    const cfg = (section?.settings ?? {}) as Partial<FAQConfig>;
    const merged = { ...getDefaultFAQConfig(), ...cfg } as FAQConfig;
    if (!merged.items) merged.items = [];
    return merged;
  });

  const [expandedSections, setExpandedSections] = useState({
    accordion: true,
    categories: false,
    content: false,
    button: false,
    paddings: false,
    css: false,
  });

  const [activeButtonStyle, setActiveButtonStyle] = useState(localConfig.button?.style || 'solid');

  useEffect(() => {
    const currentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    if (currentSection?.settings) {
      const cfg = currentSection.settings as Partial<FAQConfig>;
      const safe = { ...getDefaultFAQConfig(), ...cfg } as FAQConfig;
      if (!safe.items) safe.items = [];
      if (JSON.stringify(safe) !== JSON.stringify(localConfig)) {
        setLocalConfig(safe);
      }
    }
  }, [sectionId, sections]);

  const handleChange = (field: keyof FAQConfig, value: any) => {
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

  const handleButtonChange = (field: string, value: any) => {
    const updatedButton = {
      ...localConfig.button,
      [field]: value
    };
    handleChange('button', updatedButton);
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
        
        {/* Categories Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('categories')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Categories
            </span>
            {expandedSections.categories ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          {expandedSections.categories && (
            <div className="px-3 pb-3 space-y-3">
              <div className="text-xs text-gray-600 dark:text-gray-400">Manage categories and alignment</div>
              <div className="space-y-2">
                {(localConfig.categories || []).map((cat: FAQCategoryConfig) => (
                  <div key={cat.id} className="flex items-center gap-2 p-2 border rounded">
                    <GripVertical className="w-3 h-3 text-gray-400" />
                    <input
                      value={cat.title}
                      onChange={(e) => {
                        const updated = (localConfig.categories || []).map(c => c.id === cat.id ? { ...c, title: e.target.value } : c);
                        handleChange('categories', updated);
                      }}
                      className="flex-1 px-2 py-1 text-sm border rounded"
                    />
                    <select
                      value={cat.alignment}
                      onChange={(e) => {
                        const updated = (localConfig.categories || []).map(c => c.id === cat.id ? { ...c, alignment: e.target.value as any } : c);
                        handleChange('categories', updated);
                      }}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                    <button
                      onClick={() => {
                        const updated = (localConfig.categories || []).map(c => c.id === cat.id ? { ...c, visible: !c.visible } : c);
                        handleChange('categories', updated);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {cat.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => {
                        const updated = (localConfig.categories || []).filter(c => c.id !== cat.id);
                        handleChange('categories', updated);
                      }}
                      className="p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Accordion Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('accordion')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Accordion
            </span>
            {expandedSections.accordion ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.accordion && (
            <div className="px-3 pb-3 space-y-3">
              {/* Color scheme */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Color scheme</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={localConfig.colorScheme}
                  onChange={(e) => handleChange('colorScheme', e.target.value)}
                >
                  <option value="1">Scheme 1</option>
                  <option value="2">Scheme 2</option>
                  <option value="3">Scheme 3</option>
                  <option value="4">Scheme 4</option>
                  <option value="5">Scheme 5</option>
                </select>
              </div>

              {/* Color background */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Color background</span>
                <button
                  onClick={() => handleChange('colorBackground', !localConfig.colorBackground)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.colorBackground ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.colorBackground ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Color tabs */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Color tabs</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={localConfig.colorTabs}
                  onChange={(e) => handleChange('colorTabs', e.target.value)}
                >
                  <option value="categories">Categories</option>
                  <option value="none">None</option>
                  <option value="all">All</option>
                  <option value="content_tabs">Content tabs</option>
                  <option value="all_separately">All separately</option>
                  <option value="content_tabs_separately">Content tabs separately</option>
                </select>
              </div>

              {/* Width */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Width</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={localConfig.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                >
                  <option value="extra_small">Extra small</option>
                  <option value="screen">Screen</option>
                  <option value="page">Page</option>
                  <option value="large">Large</option>
                  <option value="medium">Medium</option>
                  <option value="small">Small</option>
                </select>
              </div>

              {/* Layout */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Layout</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={localConfig.layout}
                  onChange={(e) => handleChange('layout', e.target.value)}
                >
                  <option value="tabs_bottom">Tabs at the bottom</option>
                  <option value="tabs_right">Tabs to the right</option>
                  <option value="tabs_left">Tabs to the left</option>
                </select>
              </div>

              {/* Expand first tab */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Expand first tab</span>
                <button
                  onClick={() => handleChange('expandFirstTab', !localConfig.expandFirstTab)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.expandFirstTab ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.expandFirstTab ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
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
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={localConfig.heading || ''}
                  onChange={(e) => handleChange('heading', e.target.value)}
                  placeholder="Preguntas Frecuentes"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Body</label>
                <div className="mt-1 border border-gray-300 rounded-md">
                  <div className="flex items-center gap-1 p-1 border-b border-gray-200">
                    <button className="p-1 hover:bg-gray-100 rounded"><Bold className="w-3 h-3" /></button>
                    <button className="p-1 hover:bg-gray-100 rounded"><Italic className="w-3 h-3" /></button>
                    <button className="p-1 hover:bg-gray-100 rounded"><Link2 className="w-3 h-3" /></button>
                    <button className="p-1 hover:bg-gray-100 rounded"><List className="w-3 h-3" /></button>
                    <button className="p-1 hover:bg-gray-100 rounded"><ListOrdered className="w-3 h-3" /></button>
                  </div>
                  <textarea
                    className="w-full px-2 py-1.5 text-sm resize-none"
                    rows={4}
                    value={localConfig.body || ''}
                    onChange={(e) => handleChange('body', e.target.value)}
                  />
                </div>
              </div>

              {/* Heading size */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Heading size</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={localConfig.headingSize}
                  onChange={(e) => handleChange('headingSize', e.target.value)}
                >
                  <option value="heading_1">Heading 1</option>
                  <option value="heading_2">Heading 2</option>
                  <option value="heading_3">Heading 3</option>
                  <option value="heading_4">Heading 4</option>
                  <option value="heading_5">Heading 5</option>
                  <option value="heading_6">Heading 6</option>
                </select>
              </div>

              {/* Heading weight */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Heading weight</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={localConfig.headingWeight || 'bold'}
                  onChange={(e) => handleChange('headingWeight', e.target.value as any)}
                >
                  <option value="light">Light</option>
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                </select>
              </div>

              {/* Body size */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Body size</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={localConfig.bodySize}
                  onChange={(e) => handleChange('bodySize', e.target.value)}
                >
                  <option value="body_1">Body 1</option>
                  <option value="body_2">Body 2</option>
                  <option value="body_3">Body 3</option>
                  <option value="body_4">Body 4</option>
                  <option value="body_5">Body 5</option>
                </select>
              </div>

              {/* Body weight */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Body weight</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={localConfig.bodyWeight || 'normal'}
                  onChange={(e) => handleChange('bodyWeight', e.target.value as any)}
                >
                  <option value="light">Light</option>
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                </select>
              </div>

              {/* Collapser style */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Collapser style</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={localConfig.collapserStyle || 'plus_minus'}
                  onChange={(e) => handleChange('collapserStyle', e.target.value as any)}
                >
                  <option value="plus_minus">Plus/Minus</option>
                  <option value="chevron">Chevron</option>
                  <option value="caret">Caret</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Button Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('button')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Button
            </span>
            {expandedSections.button ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.button && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Button label</label>
                <input
                  type="text"
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={localConfig.button?.label || ''}
                  onChange={(e) => handleButtonChange('label', e.target.value)}
                  placeholder="Pega un enlace o busca"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Button link</label>
                <input
                  type="text"
                  className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={localConfig.button?.link || ''}
                  onChange={(e) => handleButtonChange('link', e.target.value)}
                  placeholder="Pega un enlace o busca"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Button style</label>
                <div className="flex mt-1 border border-gray-300 rounded-md">
                  <button
                    className={`flex-1 py-1 text-xs ${activeButtonStyle === 'solid' ? 'bg-gray-100' : ''}`}
                    onClick={() => {
                      setActiveButtonStyle('solid');
                      handleButtonChange('style', 'solid');
                    }}
                  >
                    Solid
                  </button>
                  <button
                    className={`flex-1 py-1 text-xs border-l border-gray-300 ${activeButtonStyle === 'outline' ? 'bg-gray-100' : ''}`}
                    onClick={() => {
                      setActiveButtonStyle('outline');
                      handleButtonChange('style', 'outline');
                    }}
                  >
                    Outline
                  </button>
                  <button
                    className={`flex-1 py-1 text-xs border-l border-gray-300 ${activeButtonStyle === 'text' ? 'bg-gray-100' : ''}`}
                    onClick={() => {
                      setActiveButtonStyle('text');
                      handleButtonChange('style', 'text');
                    }}
                  >
                    Text
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Paddings Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('paddings')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Paddings
            </span>
            {expandedSections.paddings ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.paddings && (
            <div className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Add side paddings</span>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Top padding</label>
                  <span className="text-xs text-gray-500">{localConfig.topPadding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={localConfig.topPadding}
                  onChange={(e) => handleChange('topPadding', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Bottom padding</label>
                  <span className="text-xs text-gray-500">{localConfig.bottomPadding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={localConfig.bottomPadding}
                  onChange={(e) => handleChange('bottomPadding', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Mobile top padding</label>
                  <span className="text-xs text-gray-500">{localConfig.mobileTopPadding ?? 20}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={localConfig.mobileTopPadding ?? 20}
                  onChange={(e) => handleChange('mobileTopPadding', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Mobile bottom padding</label>
                  <span className="text-xs text-gray-500">{localConfig.mobileBottomPadding ?? 20}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={localConfig.mobileBottomPadding ?? 20}
                  onChange={(e) => handleChange('mobileBottomPadding', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* CSS Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('css')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              CSS personalizado
            </span>
            {expandedSections.css ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.css && (
            <div className="px-3 pb-3">
              <textarea
                className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded-md resize-none"
                rows={6}
                value={localConfig.customCss || ''}
                onChange={(e) => handleChange('customCss', e.target.value)}
                placeholder="/* Escribe tu CSS personalizado aquí */"
              />
            </div>
          )}
        </div>

        {/* Eliminar sección */}
        <div className="p-3">
          <button className="w-full py-2 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors">
            🗑 Eliminar sección
          </button>
        </div>
      </div>
    </div>
  );
}