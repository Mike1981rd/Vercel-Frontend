/**
 * @file ImageBannerButtons.tsx
 * @max-lines 200
 * @current-lines 180
 * Button configuration for Image Banner
 */

'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ImageBannerConfig } from './types';

interface ImageBannerButtonsProps {
  config: ImageBannerConfig;
  onChange: (updates: Partial<ImageBannerConfig>) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ImageBannerButtons({ config, onChange, isExpanded, onToggle }: ImageBannerButtonsProps) {
  const buttonStyles = [
    { value: 'solid', label: 'Solid' },
    { value: 'outline', label: 'Outline' },
    { value: 'text', label: 'Text' }
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className="text-xs font-medium text-gray-900 dark:text-white">
          Buttons
        </span>
        {isExpanded ? 
          <ChevronUp className="w-3 h-3 text-gray-500" /> : 
          <ChevronDown className="w-3 h-3 text-gray-500" />
        }
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* First Button */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              First button
            </h4>
            
            {/* First Button Label */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Label
              </label>
              <input
                type="text"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={config.firstButtonLabel}
                onChange={(e) => onChange({ firstButtonLabel: e.target.value })}
                placeholder="Button label"
              />
            </div>

            {/* First Button Link */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={config.firstButtonLink}
                  onChange={(e) => onChange({ firstButtonLink: e.target.value })}
                  placeholder="Page or URL"
                />
                <button className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                  Browse
                </button>
              </div>
            </div>

            {/* First Button Style */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Style
              </label>
              <div className="flex gap-2">
                {buttonStyles.map(style => (
                  <button
                    key={style.value}
                    onClick={() => onChange({ firstButtonStyle: style.value as any })}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                      config.firstButtonStyle === style.value 
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Second Button */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Second button
              <span className="text-gray-500 dark:text-gray-400 ml-1 font-normal">(optional)</span>
            </h4>
            
            {/* Second Button Label */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Label
              </label>
              <input
                type="text"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={config.secondButtonLabel || ''}
                onChange={(e) => onChange({ secondButtonLabel: e.target.value })}
                placeholder="Button label (optional)"
              />
            </div>

            {/* Second Button Link */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={config.secondButtonLink || ''}
                  onChange={(e) => onChange({ secondButtonLink: e.target.value })}
                  placeholder="Page or URL"
                />
                <button className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                  Browse
                </button>
              </div>
            </div>

            {/* Second Button Style */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Style
              </label>
              <div className="flex gap-2">
                {buttonStyles.map(style => (
                  <button
                    key={style.value}
                    onClick={() => onChange({ secondButtonStyle: style.value as any })}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                      config.secondButtonStyle === style.value 
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}