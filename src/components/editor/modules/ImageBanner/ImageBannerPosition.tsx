/**
 * @file ImageBannerPosition.tsx
 * @max-lines 250
 * @current-lines 240
 * Position configuration for Image Banner
 */

'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ImageBannerConfig } from './types';

interface ImageBannerPositionProps {
  config: ImageBannerConfig;
  onChange: (updates: Partial<ImageBannerConfig>) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ImageBannerPosition({ config, onChange, isExpanded, onToggle }: ImageBannerPositionProps) {
  const desktopPositions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'center-left', label: 'Center Left' },
    { value: 'center', label: 'Center' },
    { value: 'center-right', label: 'Center Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-right', label: 'Bottom Right' }
  ];

  const backgroundStyles = [
    { value: 'solid', label: 'Solid' },
    { value: 'outline', label: 'Outline' },
    { value: 'blurred', label: 'Blurred' },
    { value: 'shadow', label: 'Shadow' },
    { value: 'transparent', label: 'Transparent' },
    { value: 'none', label: 'None' }
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className="text-xs font-medium text-gray-900 dark:text-white">
          Content position
        </span>
        {isExpanded ? 
          <ChevronUp className="w-3 h-3 text-gray-500" /> : 
          <ChevronDown className="w-3 h-3 text-gray-500" />
        }
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Desktop Position */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Desktop position
            </label>
            <select 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={config.desktopPosition}
              onChange={(e) => onChange({ desktopPosition: e.target.value as any })}
            >
              {desktopPositions.map(pos => (
                <option key={pos.value} value={pos.value}>{pos.label}</option>
              ))}
            </select>
          </div>

          {/* Desktop Alignment */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Desktop alignment
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onChange({ desktopAlignment: 'left' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                  config.desktopAlignment === 'left' 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Left
              </button>
              <button
                onClick={() => onChange({ desktopAlignment: 'center' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                  config.desktopAlignment === 'center' 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Center
              </button>
            </div>
          </div>

          {/* Desktop Width */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Desktop width
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="20"
                max="100"
                value={config.desktopWidth}
                onChange={(e) => onChange({ desktopWidth: parseInt(e.target.value) })}
                className="flex-1 min-w-0"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="w-12 px-1 py-1 text-xs border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={config.desktopWidth}
                  onChange={(e) => onChange({ desktopWidth: parseInt(e.target.value) })}
                  min="20"
                  max="100"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">%</span>
              </div>
            </div>
          </div>

          {/* Desktop Spacing */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Desktop spacing
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={config.desktopSpacing}
                onChange={(e) => onChange({ desktopSpacing: parseInt(e.target.value) })}
                className="flex-1 min-w-0"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="w-12 px-1 py-1 text-xs border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={config.desktopSpacing}
                  onChange={(e) => onChange({ desktopSpacing: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Adjust the spacing between headings and body
            </p>
          </div>

          {/* Mobile Position */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Mobile position
            </label>
            <div className="flex gap-2">
              {['top', 'center', 'bottom'].map(pos => (
                <button
                  key={pos}
                  onClick={() => onChange({ mobilePosition: pos as any })}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                    config.mobilePosition === pos 
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Alignment */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Mobile alignment
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onChange({ mobileAlignment: 'left' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                  config.mobileAlignment === 'left' 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Left
              </button>
              <button
                onClick={() => onChange({ mobileAlignment: 'center' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                  config.mobileAlignment === 'center' 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Center
              </button>
            </div>
          </div>

          {/* Content Background */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Content background
            </h3>
            
            {/* Desktop Background */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Desktop
              </label>
              <select 
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={config.desktopBackground}
                onChange={(e) => onChange({ desktopBackground: e.target.value as any })}
              >
                {backgroundStyles.map(style => (
                  <option key={style.value} value={style.value}>{style.label}</option>
                ))}
              </select>
            </div>

            {/* Mobile Background */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mobile
              </label>
              <select 
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={config.mobileBackground}
                onChange={(e) => onChange({ mobileBackground: e.target.value as any })}
              >
                {backgroundStyles.map(style => (
                  <option key={style.value} value={style.value}>{style.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}