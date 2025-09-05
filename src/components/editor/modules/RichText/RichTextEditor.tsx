// RichTextEditor.tsx - Main Rich Text Editor Component
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RichTextConfig, defaultRichTextConfig } from './types';

interface RichTextEditorProps {
  sectionId: string;
  config: RichTextConfig;
  onUpdate: (config: RichTextConfig) => void;
  onClose: () => void;
}

export default function RichTextEditor({
  sectionId,
  config,
  onUpdate,
  onClose
}: RichTextEditorProps) {
  const [localConfig, setLocalConfig] = useState<RichTextConfig>(
    config || defaultRichTextConfig
  );
  const [expandedSections, setExpandedSections] = useState({
    appearance: true,
    padding: true,
    css: false
  });

  // Sync with props when they change
  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleChange = (updates: Partial<RichTextConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onUpdate(newConfig);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - sin flecha porque ConfigPanel ya la tiene */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Rich text</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Appearance Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('appearance')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Appearance</span>
            {expandedSections.appearance ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.appearance && (
            <div className="px-4 pb-4 space-y-4">
              {/* Color Scheme */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Color scheme
                </label>
                <select
                  value={localConfig.colorScheme}
                  onChange={(e) => handleChange({ colorScheme: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="1">Scheme 1</option>
                  <option value="2">Scheme 2</option>
                  <option value="3">Scheme 3</option>
                  <option value="4">Scheme 4</option>
                  <option value="5">Scheme 5</option>
                </select>
                <button className="text-xs text-blue-600 hover:underline mt-1">
                  Learn about color schemes
                </button>
              </div>

              {/* Color Background */}
              <div className="flex items-center justify-between">
                <label className="text-sm">Color background</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.colorBackground}
                    onChange={(e) => handleChange({ colorBackground: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Width */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Width
                </label>
                <select
                  value={localConfig.width}
                  onChange={(e) => handleChange({ width: e.target.value as 'page' | 'full' | 'narrow' })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="page">Page</option>
                  <option value="full">Full width</option>
                  <option value="narrow">Narrow</option>
                </select>
              </div>

              {/* Content Alignment */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Content alignment
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleChange({ contentAlignment: 'left' })}
                    className={`flex-1 px-3 py-2 border rounded-l-lg ${
                      localConfig.contentAlignment === 'left'
                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    ⬅
                  </button>
                  <button
                    onClick={() => handleChange({ contentAlignment: 'center' })}
                    className={`flex-1 px-3 py-2 border-t border-b ${
                      localConfig.contentAlignment === 'center'
                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    ↔
                  </button>
                  <button
                    onClick={() => handleChange({ contentAlignment: 'right' })}
                    className={`flex-1 px-3 py-2 border rounded-r-lg ${
                      localConfig.contentAlignment === 'right'
                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    ➡
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Paddings Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('padding')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Paddings</span>
            {expandedSections.padding ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.padding && (
            <div className="px-4 pb-4 space-y-4">
              {/* Add side paddings toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm">Add side paddings</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={false}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Top padding */}
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>Top padding</span>
                  <span className="text-gray-500">{localConfig.paddingTop} px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={localConfig.paddingTop}
                  onChange={(e) => handleChange({ paddingTop: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Bottom padding */}
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>Bottom padding</span>
                  <span className="text-gray-500">{localConfig.paddingBottom} px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={localConfig.paddingBottom}
                  onChange={(e) => handleChange({ paddingBottom: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* CSS personalizado */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('css')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-sm font-medium">CSS personalizado</span>
            {expandedSections.css ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.css && (
            <div className="px-4 pb-4">
              <textarea
                value={localConfig.customCSS || ''}
                onChange={(e) => handleChange({ customCSS: e.target.value })}
                placeholder="/* Add your custom CSS here */"
                className="w-full h-32 px-3 py-2 border rounded-lg text-sm font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <button className="text-sm text-red-600 hover:underline">
          Eliminar sección
        </button>
      </div>
    </div>
  );
}