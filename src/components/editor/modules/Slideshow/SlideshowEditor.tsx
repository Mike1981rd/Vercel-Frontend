/**
 * @file SlideshowEditor.tsx
 * @max-lines 300
 * @module Slideshow
 * Main editor component for Slideshow
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { SlideshowConfig, getDefaultSlideshowConfig } from './types';

interface SlideshowEditorProps {
  sectionId: string;
}

export default function SlideshowEditor({ sectionId }: SlideshowEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  
  // Find section
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  
  // Local state with defaults
  const [localConfig, setLocalConfig] = useState<SlideshowConfig>(() => {
    const defaults = getDefaultSlideshowConfig();
    const sectionSettings = section?.settings || {};
    return {
      ...defaults,
      ...sectionSettings,
      // Ensure critical fields always have values
      mobileRatio: (sectionSettings as any).mobileRatio ?? defaults.mobileRatio,
      desktopRatio: (sectionSettings as any).desktopRatio ?? defaults.desktopRatio,
    } as SlideshowConfig;
  });

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    navigation: false,
    autoplay: false,
    accessibility: false,
    paddings: false
  });

  // Sync with props
  useEffect(() => {
    const currentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    if (currentSection?.settings) {
      const defaults = getDefaultSlideshowConfig();
      const newSettings = {
        ...defaults,
        ...currentSection.settings,
        // Ensure critical fields always have values
        mobileRatio: (currentSection.settings as any).mobileRatio ?? defaults.mobileRatio,
        desktopRatio: (currentSection.settings as any).desktopRatio ?? defaults.desktopRatio,
      };
      if (JSON.stringify(newSettings) !== JSON.stringify(localConfig)) {
        setLocalConfig(newSettings as SlideshowConfig);
      }
    }
  }, [sectionId, sections]);

  const handleChange = (field: keyof SlideshowConfig, value: any) => {
    const updatedConfig = { ...localConfig, [field]: value };
    setLocalConfig(updatedConfig);
    
    // Update store
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
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                  value={localConfig.colorScheme}
                  onChange={(e) => handleChange('colorScheme', e.target.value)}
                >
                  <option value="1">Color scheme 1</option>
                  <option value="2">Color scheme 2</option>
                  <option value="3">Color scheme 3</option>
                  <option value="4">Color scheme 4</option>
                  <option value="5">Color scheme 5</option>
                </select>
              </div>

              {/* Color Background */}
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

              {/* Width */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Width</label>
                <div className="flex gap-1 mt-1">
                  {['screen', 'page', 'large'].map((width) => (
                    <button
                      key={width}
                      onClick={() => handleChange('width', width)}
                      className={`flex-1 px-2 py-1 text-xs rounded capitalize ${
                        localConfig.width === width
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {width}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Ratio */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Desktop ratio: {localConfig.desktopRatio}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={localConfig.desktopRatio}
                  onChange={(e) => handleChange('desktopRatio', parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* Mobile Ratio */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Mobile ratio: {localConfig.mobileRatio}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={localConfig.mobileRatio}
                  onChange={(e) => handleChange('mobileRatio', parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('navigation')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Navigation
            </span>
            {expandedSections.navigation ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.navigation && (
            <div className="px-3 pb-3 space-y-3">
              {/* Show Navigation Circles */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Show navigation circles</span>
                <button
                  onClick={() => handleChange('showNavigationCircles', !localConfig.showNavigationCircles)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    localConfig.showNavigationCircles ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    localConfig.showNavigationCircles ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Show Navigation Arrows */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Show navigation arrows</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                  value={localConfig.showNavigationArrows}
                  onChange={(e) => handleChange('showNavigationArrows', e.target.value)}
                >
                  <option value="never">Never</option>
                  <option value="always">Always</option>
                  <option value="hover">On hover</option>
                </select>
              </div>

              {/* Desktop Arrows Position */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Desktop arrows position</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                  value={localConfig.desktopArrowsPosition}
                  onChange={(e) => handleChange('desktopArrowsPosition', e.target.value)}
                >
                  <option value="corner">Arrows in the corner</option>
                  <option value="sides">Arrows in the sides</option>
                </select>
              </div>

              {/* Transition Style */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Transition style</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                  value={localConfig.transitionStyle}
                  onChange={(e) => handleChange('transitionStyle', e.target.value)}
                >
                  <option value="fade">Fade</option>
                  <option value="swipe">Swipe</option>
                  <option value="seamless">Seamless</option>
                </select>
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
            {expandedSections.autoplay ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.autoplay && (
            <div className="px-3 pb-3 space-y-3">
              {/* Autoplay Mode */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Autoplay mode</label>
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => handleChange('autoplayMode', 'none')}
                    className={`flex-1 px-2 py-1 text-xs rounded ${
                      localConfig.autoplayMode === 'none'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    None
                  </button>
                  <button
                    onClick={() => handleChange('autoplayMode', 'one-at-a-time')}
                    className={`flex-1 px-2 py-1 text-xs rounded ${
                      localConfig.autoplayMode === 'one-at-a-time'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    One-at-a-time
                  </button>
                </div>
              </div>

              {/* Autoplay Speed */}
              {localConfig.autoplayMode === 'one-at-a-time' && (
                <>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">
                      Autoplay speed: {localConfig.autoplaySpeed}s
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      step="1"
                      value={localConfig.autoplaySpeed}
                      onChange={(e) => handleChange('autoplaySpeed', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>

                  {/* Show Play/Pause Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Show play/pause button</span>
                    <button
                      onClick={() => handleChange('showPlayPauseButton', !localConfig.showPlayPauseButton)}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        localConfig.showPlayPauseButton ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localConfig.showPlayPauseButton ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Accessibility */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('accessibility')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Accessibility
            </span>
            {expandedSections.accessibility ? 
              <ChevronUp className="w-3 h-3 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 text-gray-500" />
            }
          </button>
          
          {expandedSections.accessibility && (
            <div className="px-3 pb-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Slideshow alt text</label>
                <input
                  type="text"
                  value={localConfig.slideshowAltText}
                  onChange={(e) => handleChange('slideshowAltText', e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                  placeholder="Slideshow about our brand"
                />
              </div>
            </div>
          )}
        </div>

        {/* Paddings */}
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
              {/* Add Side Paddings */}
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

              {/* Top Padding */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Top padding: {localConfig.topPadding}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="8"
                  value={localConfig.topPadding}
                  onChange={(e) => handleChange('topPadding', parseInt(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* Bottom Padding */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Bottom padding: {localConfig.bottomPadding}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="8"
                  value={localConfig.bottomPadding}
                  onChange={(e) => handleChange('bottomPadding', parseInt(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}