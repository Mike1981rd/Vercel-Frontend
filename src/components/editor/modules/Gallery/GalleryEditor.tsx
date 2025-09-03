/**
 * @file GalleryEditor.tsx
 * @max-lines 300
 * @module Gallery
 * @description Editor para la sección del template Gallery
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { GalleryConfig, getDefaultGalleryConfig } from './types';

interface GalleryEditorProps {
  sectionId: string;
}

export default function GalleryEditor({ sectionId }: GalleryEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const { config: themeConfig } = useThemeConfigStore();
  
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  
  const [localConfig, setLocalConfig] = useState<GalleryConfig>(() => {
    return (section?.settings || getDefaultGalleryConfig()) as GalleryConfig;
  });

  const [expandedSections, setExpandedSections] = useState({
    general: true,
    layout: false,
    appearance: false,
    mobile: false,
  });

  useEffect(() => {
    const currentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    if (currentSection?.settings) {
      const newSettings = currentSection.settings as GalleryConfig;
      if (JSON.stringify(newSettings) !== JSON.stringify(localConfig)) {
        setLocalConfig(newSettings);
      }
    }
  }, [sectionId, sections]);

  const handleUpdate = (updates: Partial<GalleryConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    
    if (section) {
      const groupId = Object.keys(sections).find(key => 
        sections[key as keyof typeof sections].includes(section)
      );
      if (groupId) {
        updateSectionSettings(groupId, section.id, newConfig);
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
        <div className="p-4 space-y-1">
          
          {/* General Settings */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleSection('general')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="font-medium">General Settings</span>
              {expandedSections.general ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.general && (
              <div className="px-4 pb-4 space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localConfig.enabled !== false}
                    onChange={(e) => handleUpdate({ enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Enable section</span>
                </label>

                <div>
                  <label className="block text-sm font-medium mb-2">Color Scheme</label>
                  <select
                    value={localConfig.colorScheme}
                    onChange={(e) => handleUpdate({ colorScheme: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {themeConfig?.colorSchemes?.schemes?.map((scheme, index) => (
                      <option key={index} value={String(index + 1)}>
                        {scheme.name || `Color scheme ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localConfig.fullPageWidth}
                    onChange={(e) => handleUpdate({ fullPageWidth: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Full page width</span>
                </label>
              </div>
            )}
          </div>

          {/* Layout Settings */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleSection('layout')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="font-medium">Layout</span>
              {expandedSections.layout ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.layout && (
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Desktop columns: {localConfig.maxImagesPerRowDesktop}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={localConfig.maxImagesPerRowDesktop}
                    onChange={(e) => handleUpdate({ maxImagesPerRowDesktop: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mobile columns: {localConfig.imagesPerRowMobile}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    value={localConfig.imagesPerRowMobile}
                    onChange={(e) => handleUpdate({ imagesPerRowMobile: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Image Height</label>
                  <select
                    value={localConfig.imageHeight}
                    onChange={(e) => handleUpdate({ imageHeight: e.target.value as 'natural' | 'fixed' })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="natural">Natural</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>

                {localConfig.imageHeight === 'fixed' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Desktop height (px)</label>
                      <input
                        type="number"
                        value={localConfig.desktopImageRowHeights || 370}
                        onChange={(e) => handleUpdate({ desktopImageRowHeights: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Mobile height (px)</label>
                      <input
                        type="number"
                        value={localConfig.mobileImageRowHeights || 480}
                        onChange={(e) => handleUpdate({ mobileImageRowHeights: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </>
                )}

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localConfig.addSpacingBetweenImages}
                    onChange={(e) => handleUpdate({ addSpacingBetweenImages: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Add spacing between images</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localConfig.addSpacingAroundSection}
                    onChange={(e) => handleUpdate({ addSpacingAroundSection: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Add spacing around section</span>
                </label>
              </div>
            )}
          </div>

          {/* Appearance Settings */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleSection('appearance')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="font-medium">Appearance</span>
              {expandedSections.appearance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.appearance && (
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Overlay Style</label>
                  <select
                    value={localConfig.overlayStyle}
                    onChange={(e) => handleUpdate({ overlayStyle: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="tint">Tint</option>
                    <option value="box">Box</option>
                    <option value="text">Text</option>
                    <option value="shadow">Shadow</option>
                    <option value="text-shadow-tint">Text Shadow and Tint</option>
                    <option value="no-background">No Background</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Overlay Padding</label>
                  <select
                    value={localConfig.overlayPadding}
                    onChange={(e) => handleUpdate({ overlayPadding: e.target.value as 'standard' | 'large' })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="standard">Standard</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Button Style</label>
                  <select
                    value={localConfig.buttonStyle}
                    onChange={(e) => handleUpdate({ buttonStyle: e.target.value as 'primary' | 'secondary' | 'link' })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="link">Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Image Quality</label>
                  <select
                    value={localConfig.imageQuality}
                    onChange={(e) => handleUpdate({ imageQuality: e.target.value as 'high' | 'hd' })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="high">High</option>
                    <option value="hd">HD</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Settings */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleSection('mobile')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="font-medium">Mobile & Animations</span>
              {expandedSections.mobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.mobile && (
              <div className="px-4 pb-4 space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localConfig.enableMobileCarousel}
                    onChange={(e) => handleUpdate({ enableMobileCarousel: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Enable mobile carousel</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localConfig.animateTextAndImagesOnScroll}
                    onChange={(e) => handleUpdate({ animateTextAndImagesOnScroll: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Animate on scroll</span>
                </label>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}