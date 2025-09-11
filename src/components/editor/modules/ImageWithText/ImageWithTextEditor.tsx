/**
 * @file ImageWithTextEditor.tsx
 * @max-lines 300
 * @module ImageWithText
 * @description Editor para la sección del template ImageWithText
 * @template-section true
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { ImageWithTextConfig, getDefaultImageWithTextConfig } from './types';

interface ImageWithTextEditorProps {
  sectionId: string;
}

export default function ImageWithTextEditor({ sectionId }: ImageWithTextEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const { config: themeConfig } = useThemeConfigStore();
  
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  
  const [localConfig, setLocalConfig] = useState<ImageWithTextConfig>(() => {
    return (section?.settings as ImageWithTextConfig) || getDefaultImageWithTextConfig();
  });

  const [expandedSections, setExpandedSections] = useState({
    general: true,
    layout: false,
    content: false,
    buttons: false,
    padding: false
  });

  useEffect(() => {
    const currentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    if (currentSection?.settings) {
      const newSettings = currentSection.settings as ImageWithTextConfig;
      if (JSON.stringify(newSettings) !== JSON.stringify(localConfig)) {
        setLocalConfig(newSettings);
      }
    }
  }, [sectionId, sections]);

  const handleUpdate = (updates: Partial<ImageWithTextConfig>) => {
    const updatedConfig = { ...localConfig, ...updates };
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
            <span className="text-xs font-medium text-gray-900 dark:text-white">General</span>
            {expandedSections.general ? 
              <ChevronUp className="w-3 h-3" /> : 
              <ChevronDown className="w-3 h-3" />
            }
          </button>
          
          {expandedSections.general && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Color scheme</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.colorScheme}
                  onChange={(e) => handleUpdate({ colorScheme: e.target.value })}
                >
                  {themeConfig?.colorSchemes?.schemes?.map((scheme, index) => (
                    <option key={index} value={String(index + 1)}>
                      {scheme.name || `Color scheme ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show section</span>
                <button
                  onClick={() => handleUpdate({ enabled: !localConfig.enabled })}
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
          )}
        </div>

        {/* Layout Settings */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('layout')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">Layout</span>
            {expandedSections.layout ? 
              <ChevronUp className="w-3 h-3" /> : 
              <ChevronDown className="w-3 h-3" />
            }
          </button>
          
          {expandedSections.layout && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Width</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.width}
                  onChange={(e) => handleUpdate({ width: e.target.value as any })}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="page">Page</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Content layout</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.contentLayout}
                  onChange={(e) => handleUpdate({ contentLayout: e.target.value as any })}
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Image layout</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.imageLayout}
                  onChange={(e) => handleUpdate({ imageLayout: e.target.value as any })}
                >
                  <option value="grid">Grid</option>
                  <option value="collage">Collage</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Image ratio: {localConfig.imageRatio}
                </label>
                <input 
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={localConfig.imageRatio}
                  onChange={(e) => handleUpdate({ imageRatio: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Mobile image ratio: {localConfig.mobileImageRatio ?? localConfig.imageRatio}
                </label>
                <input 
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={(localConfig.mobileImageRatio ?? localConfig.imageRatio)}
                  onChange={(e) => handleUpdate({ mobileImageRatio: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Rotate images</span>
                <button
                  onClick={() => handleUpdate({ rotateImages: !localConfig.rotateImages })}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.rotateImages ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.rotateImages ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Image border radius: {localConfig.imageBorderRadius || 12}px
                </label>
                <input 
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={localConfig.imageBorderRadius || 12}
                  onChange={(e) => handleUpdate({ imageBorderRadius: parseInt(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Icon</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.icon || ''}
                  onChange={(e) => handleUpdate({ icon: e.target.value })}
                >
                  <option value="">None</option>
                  <option value="Settings">Settings</option>
                  <option value="Search">Search</option>
                  <option value="Home">Home</option>
                  <option value="User">User</option>
                  <option value="ShoppingBag">Shopping Bag</option>
                  <option value="ShoppingCart">Shopping Cart</option>
                  <option value="Heart">Heart</option>
                  <option value="Star">Star</option>
                  <option value="Bell">Bell</option>
                  <option value="Mail">Mail</option>
                  <option value="MessageCircle">Message</option>
                  <option value="Phone">Phone</option>
                  <option value="MapPin">Map Pin</option>
                  <option value="Calendar">Calendar</option>
                  <option value="Clock">Clock</option>
                  <option value="Globe">Globe</option>
                  <option value="CreditCard">Credit Card</option>
                  <option value="Gift">Gift</option>
                  <option value="Truck">Truck</option>
                  <option value="Package">Package</option>
                  <option value="Info">Info</option>
                  <option value="AlertCircle">Alert</option>
                  <option value="CheckCircle">Check</option>
                  <option value="XCircle">X Circle</option>
                  <option value="Zap">Zap</option>
                  <option value="Award">Award</option>
                  <option value="Shield">Shield</option>
                  <option value="Percent">Percent</option>
                  <option value="Tag">Tag</option>
                  <option value="TrendingUp">Trending Up</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Content Settings */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('content')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">Content</span>
            {expandedSections.content ? 
              <ChevronUp className="w-3 h-3" /> : 
              <ChevronDown className="w-3 h-3" />
            }
          </button>
          
          {expandedSections.content && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Subheading</label>
                <input 
                  type="text"
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.subheading || ''}
                  onChange={(e) => handleUpdate({ subheading: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Heading</label>
                <input 
                  type="text"
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.heading || ''}
                  onChange={(e) => handleUpdate({ heading: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Body</label>
                <textarea 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  rows={4}
                  value={localConfig.body || ''}
                  onChange={(e) => handleUpdate({ body: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                  Heading size: {localConfig.headingSize}
                </label>
                <input 
                  type="range"
                  min="20"
                  max="60"
                  value={localConfig.headingSize}
                  onChange={(e) => handleUpdate({ headingSize: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                  Body size: {localConfig.bodySize}
                </label>
                <input 
                  type="range"
                  min="12"
                  max="24"
                  value={localConfig.bodySize}
                  onChange={(e) => handleUpdate({ bodySize: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Content alignment</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.contentAlignment}
                  onChange={(e) => handleUpdate({ contentAlignment: e.target.value as any })}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                  Desktop width: {localConfig.desktopWidth}px
                </label>
                <input 
                  type="range"
                  min="200"
                  max="600"
                  value={localConfig.desktopWidth}
                  onChange={(e) => handleUpdate({ desktopWidth: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons Settings */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('buttons')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">Buttons</span>
            {expandedSections.buttons ? 
              <ChevronUp className="w-3 h-3" /> : 
              <ChevronDown className="w-3 h-3" />
            }
          </button>
          
          {expandedSections.buttons && (
            <div className="px-3 pb-3 space-y-3">
              <div className="space-y-2">
                <h4 className="text-xs font-medium">First button</h4>
                <input 
                  type="text"
                  placeholder="Button label"
                  className="w-full px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.firstButtonLabel || ''}
                  onChange={(e) => handleUpdate({ firstButtonLabel: e.target.value })}
                />
                <input 
                  type="text"
                  placeholder="Button link"
                  className="w-full px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.firstButtonLink || ''}
                  onChange={(e) => handleUpdate({ firstButtonLink: e.target.value })}
                />
                <select 
                  className="w-full px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.firstButtonStyle}
                  onChange={(e) => handleUpdate({ firstButtonStyle: e.target.value as any })}
                >
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                  <option value="text">Text</option>
                </select>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium">Second button</h4>
                <input 
                  type="text"
                  placeholder="Button label"
                  className="w-full px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.secondButtonLabel || ''}
                  onChange={(e) => handleUpdate({ secondButtonLabel: e.target.value })}
                />
                <input 
                  type="text"
                  placeholder="Button link"
                  className="w-full px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.secondButtonLink || ''}
                  onChange={(e) => handleUpdate({ secondButtonLink: e.target.value })}
                />
                <select 
                  className="w-full px-2 py-1.5 text-sm border rounded-md"
                  value={localConfig.secondButtonStyle}
                  onChange={(e) => handleUpdate({ secondButtonStyle: e.target.value as any })}
                >
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                  <option value="text">Text</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Padding Settings */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('padding')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">Padding</span>
            {expandedSections.padding ? 
              <ChevronUp className="w-3 h-3" /> : 
              <ChevronDown className="w-3 h-3" />
            }
          </button>
          
          {expandedSections.padding && (
            <div className="px-3 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Add side paddings</span>
                <button
                  onClick={() => handleUpdate({ addSidePaddings: !localConfig.addSidePaddings })}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.addSidePaddings ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.addSidePaddings ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                  Top: {localConfig.topPadding}px
                </label>
                <input 
                  type="range"
                  min="0"
                  max="120"
                  value={localConfig.topPadding}
                  onChange={(e) => handleUpdate({ topPadding: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                  Bottom: {localConfig.bottomPadding}px
                </label>
                <input 
                  type="range"
                  min="0"
                  max="120"
                  value={localConfig.bottomPadding}
                  onChange={(e) => handleUpdate({ bottomPadding: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                  Mobile Top: {localConfig.mobileTopPadding ?? 20}px
                </label>
                <input 
                  type="range"
                  min="0"
                  max="80"
                  value={localConfig.mobileTopPadding ?? 20}
                  onChange={(e) => handleUpdate({ mobileTopPadding: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                  Mobile Bottom: {localConfig.mobileBottomPadding ?? 20}px
                </label>
                <input 
                  type="range"
                  min="0"
                  max="80"
                  value={localConfig.mobileBottomPadding ?? 20}
                  onChange={(e) => handleUpdate({ mobileBottomPadding: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}