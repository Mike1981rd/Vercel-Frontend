/**
 * @file ImageBannerSpacing.tsx
 * @max-lines 150
 * @current-lines 110
 * Spacing configuration for Image Banner
 */

'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ImageBannerConfig } from './types';

interface ImageBannerSpacingProps {
  config: ImageBannerConfig;
  onChange: (updates: Partial<ImageBannerConfig>) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ImageBannerSpacing({ config, onChange, isExpanded, onToggle }: ImageBannerSpacingProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className="text-xs font-medium text-gray-900 dark:text-white">
          Paddings
        </span>
        {isExpanded ? 
          <ChevronUp className="w-3 h-3 text-gray-500" /> : 
          <ChevronDown className="w-3 h-3 text-gray-500" />
        }
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Add Side Paddings */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Add side paddings
            </label>
            <button
              onClick={() => onChange({ addSidePaddings: !config.addSidePaddings })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                config.addSidePaddings ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                config.addSidePaddings ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Top Padding */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Top padding
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={config.topPadding}
                onChange={(e) => onChange({ topPadding: parseInt(e.target.value) })}
                className="flex-1 min-w-0"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="w-12 px-1 py-1 text-xs border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={config.topPadding}
                  onChange={(e) => onChange({ topPadding: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
              </div>
            </div>
          </div>

          {/* Bottom Padding */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Bottom padding
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={config.bottomPadding}
                onChange={(e) => onChange({ bottomPadding: parseInt(e.target.value) })}
                className="flex-1 min-w-0"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="w-12 px-1 py-1 text-xs border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={config.bottomPadding}
                  onChange={(e) => onChange({ bottomPadding: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}