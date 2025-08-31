/**
 * @file FooterPaddingSection.tsx
 * @max-lines 100
 * @module Footer
 * @created 2025-01-15
 */

import React from 'react';

interface FooterPaddingSectionProps {
  padding: any;
  onNestedChange: (parent: string, field: string, value: any) => void;
}

export default function FooterPaddingSection({ padding, onNestedChange }: FooterPaddingSectionProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Paddings
      </h3>
      
      {/* Add info paddings toggle */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Add info paddings
        </label>
        <button
          onClick={() => onNestedChange('padding', 'enabled', !padding?.enabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            padding?.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            padding?.enabled ? 'translate-x-5' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Top padding */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Top padding
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={padding?.top || 0}
            onChange={(e) => onNestedChange('padding', 'top', parseInt(e.target.value))}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              className="w-14 px-2 py-1 text-sm border border-gray-300 rounded
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={padding?.top || 0}
              onChange={(e) => onNestedChange('padding', 'top', parseInt(e.target.value))}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Bottom padding
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={padding?.bottom || 0}
            onChange={(e) => onNestedChange('padding', 'bottom', parseInt(e.target.value))}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              className="w-14 px-2 py-1 text-sm border border-gray-300 rounded
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={padding?.bottom || 0}
              onChange={(e) => onNestedChange('padding', 'bottom', parseInt(e.target.value))}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
          </div>
        </div>
      </div>
    </div>
  );
}