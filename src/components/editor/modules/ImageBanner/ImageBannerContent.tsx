/**
 * @file ImageBannerContent.tsx
 * @max-lines 200
 * @current-lines 135
 * Content configuration for Image Banner
 */

'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ImageBannerConfig } from './types';

interface ImageBannerContentProps {
  config: ImageBannerConfig;
  onChange: (updates: Partial<ImageBannerConfig>) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ImageBannerContent({ config, onChange, isExpanded, onToggle }: ImageBannerContentProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className="text-xs font-medium text-gray-900 dark:text-white">
          Content
        </span>
        {isExpanded ? 
          <ChevronUp className="w-3 h-3 text-gray-500" /> : 
          <ChevronDown className="w-3 h-3 text-gray-500" />
        }
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Subheading */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Subheading
            </label>
            <input
              type="text"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={config.subheading}
              onChange={(e) => onChange({ subheading: e.target.value })}
              placeholder="Enter subheading"
            />
          </div>

          {/* Heading */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Heading
            </label>
            <input
              type="text"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={config.heading}
              onChange={(e) => onChange({ heading: e.target.value })}
              placeholder="Enter heading"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Body
            </label>
            <textarea
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none"
              value={config.body}
              onChange={(e) => onChange({ body: e.target.value })}
              placeholder="Enter body text"
              rows={4}
            />
          </div>

          {/* Heading Font Weight */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Heading font weight
            </label>
            <select 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={config.headingFontWeight || '700'}
              onChange={(e) => onChange({ headingFontWeight: e.target.value })}
            >
              <option value="100">Thin (100)</option>
              <option value="200">Extra Light (200)</option>
              <option value="300">Light (300)</option>
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi Bold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>

          {/* Heading Size */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Heading size
            </label>
            <select 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={config.headingSize}
              onChange={(e) => onChange({ headingSize: parseInt(e.target.value) as any })}
            >
              {[1, 2, 3, 4, 5, 6, 7].map(size => (
                <option key={size} value={size}>Heading {size}</option>
              ))}
            </select>
          </div>

          {/* Body Font Weight */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Body font weight
            </label>
            <select 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={config.bodyFontWeight || '400'}
              onChange={(e) => onChange({ bodyFontWeight: e.target.value })}
            >
              <option value="100">Thin (100)</option>
              <option value="200">Extra Light (200)</option>
              <option value="300">Light (300)</option>
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi Bold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>

          {/* Body Size */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Body size
            </label>
            <select 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={config.bodySize}
              onChange={(e) => onChange({ bodySize: parseInt(e.target.value) as any })}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                <option key={size} value={size}>Body {size}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Inherits heading size font family
            </p>
          </div>
        </div>
      )}
    </div>
  );
}