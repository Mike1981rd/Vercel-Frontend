import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2, Bold, Italic, Underline, Link, Info, X } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { ContactFormConfig, getDefaultContactFormConfig } from './types';

interface ContactFormEditorProps {
  sectionId: string;
}

export default function ContactFormEditor({ sectionId }: ContactFormEditorProps) {
  const { sections, updateSectionSettings, removeSection } = useEditorStore();
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  const { config: themeConfig } = useThemeConfigStore();
  
  const [localConfig, setLocalConfig] = useState<ContactFormConfig>(
    section?.settings || getDefaultContactFormConfig()
  );
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['content']);
  const [showColorInfo, setShowColorInfo] = useState(false);

  useEffect(() => {
    if (section?.settings) {
      setLocalConfig(section.settings);
    }
  }, [section?.settings]);

  const handleUpdate = (updates: Partial<ContactFormConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    
    // Find the group ID for this section
    const groupId = Object.entries(sections).find(([_, sectionsList]) =>
      sectionsList.some(s => s.id === sectionId)
    )?.[0];
    
    if (groupId) {
      updateSectionSettings(groupId, sectionId, newConfig);
    }
  };

  const togglePanel = (panel: string) => {
    setExpandedPanels(prev =>
      prev.includes(panel)
        ? prev.filter(p => p !== panel)
        : [...prev, panel]
    );
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      // Find the group ID for this section
      const groupId = Object.entries(sections).find(([_, sectionsList]) =>
        sectionsList.some(s => s.id === sectionId)
      )?.[0];
      
      if (groupId) {
        removeSection(groupId, sectionId);
      }
    }
  };

  const applyTextFormat = (format: string) => {
    const textarea = document.getElementById('body-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localConfig.body?.substring(start, end) || '';
    const beforeText = localConfig.body?.substring(0, start) || '';
    const afterText = localConfig.body?.substring(end) || '';
    
    let newText = '';
    switch(format) {
      case 'bold':
        newText = beforeText + `<b>${selectedText}</b>` + afterText;
        break;
      case 'italic':
        newText = beforeText + `<i>${selectedText}</i>` + afterText;
        break;
      case 'underline':
        newText = beforeText + `<u>${selectedText}</u>` + afterText;
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          newText = beforeText + `<a href="${url}">${selectedText}</a>` + afterText;
        } else {
          return;
        }
        break;
    }
    
    handleUpdate({ body: newText });
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Color Scheme & Card Style */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Color scheme
                <button
                  onClick={() => setShowColorInfo(true)}
                  className="ml-2 text-blue-600 hover:text-blue-700 inline-flex items-center"
                  title="View color mapping"
                >
                  <Info className="w-4 h-4" />
                </button>
              </label>
              <select
                value={localConfig.colorScheme || '3'}
                onChange={(e) => handleUpdate({ colorScheme: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
              >
                {themeConfig?.colorSchemes?.schemes?.map((scheme, index) => (
                  <option key={index} value={String(index + 1)}>
                    {scheme.name || `Scheme ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Card style</label>
              <select
                value={localConfig.cardStyle || 'none'}
                onChange={(e) => handleUpdate({ cardStyle: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
              >
                <option value="none">None (No card)</option>
                <option value="elevated">Elevated (Shadow)</option>
                <option value="glass">Glass (Glassmorphism)</option>
                <option value="gradient">Gradient Border</option>
                <option value="neumorphic">Neumorphic (Soft UI)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Choose how the form container appears</p>
            </div>

            {/* Card Padding - Only show when card style is not 'none' */}
            {localConfig.cardStyle !== 'none' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Card padding: {localConfig.cardPadding || 32}px
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="16"
                    max="64"
                    step="4"
                    value={localConfig.cardPadding || 32}
                    onChange={(e) => handleUpdate({ cardPadding: parseInt(e.target.value) })}
                    className="flex-1 min-w-0"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="16"
                      max="64"
                      step="4"
                      value={localConfig.cardPadding || 32}
                      onChange={(e) => handleUpdate({ cardPadding: parseInt(e.target.value) })}
                      className="w-16 px-2 py-1 border rounded text-sm"
                    />
                    <span className="text-sm text-gray-500">px</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Adjust the spacing inside the card</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Width</label>
              <select
                value={localConfig.width || 'extra-small'}
                onChange={(e) => handleUpdate({ width: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
              >
                <option value="extra-small">Extra small</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra large</option>
              </select>
            </div>
          </div>

          {/* Content Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => togglePanel('content')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="font-medium">Content</span>
              {expandedPanels.includes('content') ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedPanels.includes('content') && (
              <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium mb-2">Heading</label>
                  <textarea
                    value={localConfig.heading || ''}
                    onChange={(e) => handleUpdate({ heading: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    placeholder="Enter heading text"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Body</label>
                  <div className="border rounded-lg">
                    <div className="flex items-center gap-2 p-2 border-b">
                      <button
                        onClick={() => applyTextFormat('bold')}
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => applyTextFormat('italic')}
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => applyTextFormat('underline')}
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="Underline"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => applyTextFormat('link')}
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="Link"
                      >
                        <Link className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      id="body-textarea"
                      value={localConfig.body || ''}
                      onChange={(e) => handleUpdate({ body: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 dark:bg-gray-800 rounded-b-lg"
                      placeholder="Enter body text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Heading size</label>
                    <select
                      value={localConfig.headingSize || 'h5'}
                      onChange={(e) => handleUpdate({ headingSize: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    >
                      <option value="h1">Heading 1</option>
                      <option value="h2">Heading 2</option>
                      <option value="h3">Heading 3</option>
                      <option value="h4">Heading 4</option>
                      <option value="h5">Heading 5</option>
                      <option value="h6">Heading 6</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Body size</label>
                    <select
                      value={localConfig.bodySize || 'body3'}
                      onChange={(e) => handleUpdate({ bodySize: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    >
                      <option value="body1">Body 1</option>
                      <option value="body2">Body 2</option>
                      <option value="body3">Body 3</option>
                      <option value="body4">Body 4</option>
                      <option value="body5">Body 5</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content alignment</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate({ contentAlignment: 'left' })}
                      className={`flex-1 py-2 px-4 border rounded-lg ${
                        localConfig.contentAlignment === 'left' || !localConfig.contentAlignment
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      Left
                    </button>
                    <button
                      onClick={() => handleUpdate({ contentAlignment: 'center' })}
                      className={`flex-1 py-2 px-4 border rounded-lg ${
                        localConfig.contentAlignment === 'center'
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      Center
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => togglePanel('form')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="font-medium">Form</span>
              {expandedPanels.includes('form') ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedPanels.includes('form') && (
              <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium mb-2">Input style</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate({ inputStyle: 'solid' })}
                      className={`flex-1 py-2 px-4 border rounded-lg ${
                        localConfig.inputStyle === 'solid' || !localConfig.inputStyle
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      Solid
                    </button>
                    <button
                      onClick={() => handleUpdate({ inputStyle: 'outline' })}
                      className={`flex-1 py-2 px-4 border rounded-lg ${
                        localConfig.inputStyle === 'outline'
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      Outline
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Show phone number input</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConfig.showPhoneInput || false}
                      onChange={(e) => handleUpdate({ showPhoneInput: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Show reCAPTCHA terms</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConfig.showRecaptcha || false}
                      onChange={(e) => handleUpdate({ showRecaptcha: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium mb-2">Button text</label>
                  <input
                    type="text"
                    value={localConfig.buttonText || 'SEND'}
                    onChange={(e) => handleUpdate({ buttonText: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    placeholder="Enter button text"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Paddings Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => togglePanel('paddings')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="font-medium">Paddings</span>
              {expandedPanels.includes('paddings') ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedPanels.includes('paddings') && (
              <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Add side paddings</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConfig.addSidePaddings !== false}
                      onChange={(e) => handleUpdate({ addSidePaddings: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Top padding
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={localConfig.topPadding || 96}
                      onChange={(e) => handleUpdate({ topPadding: parseInt(e.target.value) })}
                      className="flex-1 min-w-0"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={localConfig.topPadding || 96}
                        onChange={(e) => handleUpdate({ topPadding: parseInt(e.target.value) })}
                        className="w-16 px-2 py-1 border rounded"
                      />
                      <span className="text-sm text-gray-500">px</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bottom padding
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={localConfig.bottomPadding || 96}
                      onChange={(e) => handleUpdate({ bottomPadding: parseInt(e.target.value) })}
                      className="flex-1 min-w-0"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={localConfig.bottomPadding || 96}
                        onChange={(e) => handleUpdate({ bottomPadding: parseInt(e.target.value) })}
                        className="w-16 px-2 py-1 border rounded"
                      />
                      <span className="text-sm text-gray-500">px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CSS personalizado */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => togglePanel('css')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="font-medium">CSS personalizado</span>
              {expandedPanels.includes('css') ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedPanels.includes('css') && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <textarea
                  value={localConfig.customCss || ''}
                  onChange={(e) => handleUpdate({ customCss: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 font-mono text-sm"
                  placeholder="/* Custom CSS */"
                />
              </div>
            )}
          </div>

          {/* Delete Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar sección</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Color Scheme Info Modal */}
      {showColorInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Color Scheme Mapping</h3>
              <button
                onClick={() => setShowColorInfo(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Here's how the selected color scheme is applied to the Contact Form:
              </p>
              
              {themeConfig?.colorSchemes?.schemes?.[parseInt(localConfig.colorScheme || '3') - 1] && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: themeConfig.colorSchemes.schemes[parseInt(localConfig.colorScheme || '3') - 1].background }}
                    />
                    <span className="font-medium">Background:</span>
                    <span>Section background</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: themeConfig.colorSchemes.schemes[parseInt(localConfig.colorScheme || '3') - 1].text }}
                    />
                    <span className="font-medium">Text:</span>
                    <span>Headings, body text, labels</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: themeConfig.colorSchemes.schemes[parseInt(localConfig.colorScheme || '3') - 1].foreground }}
                    />
                    <span className="font-medium">Foreground:</span>
                    <span>Solid input backgrounds</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: themeConfig.colorSchemes.schemes[parseInt(localConfig.colorScheme || '3') - 1].border }}
                    />
                    <span className="font-medium">Border:</span>
                    <span>Input borders, card borders</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: themeConfig.colorSchemes.schemes[parseInt(localConfig.colorScheme || '3') - 1].solidButton }}
                    />
                    <span className="font-medium">Solid Button:</span>
                    <span>Button background (solid style)</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: themeConfig.colorSchemes.schemes[parseInt(localConfig.colorScheme || '3') - 1].solidButtonText }}
                    />
                    <span className="font-medium">Button Text:</span>
                    <span>Text on solid button</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: themeConfig.colorSchemes.schemes[parseInt(localConfig.colorScheme || '3') - 1].outlineButton }}
                    />
                    <span className="font-medium">Outline Button:</span>
                    <span>Button border (outline style)</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: themeConfig.colorSchemes.schemes[parseInt(localConfig.colorScheme || '3') - 1].link }}
                    />
                    <span className="font-medium">Link:</span>
                    <span>Links in reCAPTCHA text</span>
                  </div>
                </div>
              )}
              
              <div className="pt-3 mt-3 border-t">
                <p className="text-xs text-gray-500">
                  <strong>Tip:</strong> Card styles will adapt these colors automatically for the best visual effect.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}