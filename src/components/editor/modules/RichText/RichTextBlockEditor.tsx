// RichTextBlockEditor.tsx - Individual Block Editor
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Bold, 
  Italic, 
  Link, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Columns,
  Settings
} from 'lucide-react';
import { RichTextBlock } from './types';

interface RichTextBlockEditorProps {
  block: RichTextBlock;
  onUpdate: (updates: Partial<RichTextBlock>) => void;
  onBack: () => void;
}

export default function RichTextBlockEditor({ block, onUpdate, onBack }: RichTextBlockEditorProps) {
  const [localBlock, setLocalBlock] = useState(block);

  useEffect(() => {
    setLocalBlock(block);
  }, [block]);

  const handleChange = (updates: any) => {
    const newBlock = { ...localBlock, ...updates };
    setLocalBlock(newBlock);
    onUpdate(updates);
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'icon':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Icon</label>
              <select
                value={localBlock.icon || 'none'}
                onChange={(e) => handleChange({ icon: e.target.value === 'none' ? null : e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="none">None</option>
                <option value="settings">Settings</option>
                <option value="star">Star</option>
                <option value="heart">Heart</option>
                <option value="check">Check</option>
                <option value="info">Info</option>
              </select>
              <button className="text-xs text-blue-600 hover:underline mt-1">
                See what icon stands for each label
              </button>
            </div>

            {localBlock.icon && (
              <div className="p-4 border-2 border-dashed rounded-lg text-center">
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                  <Settings size={16} className="inline mr-2" />
                  Seleccionar
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Explorar imágenes gratuitas
                </p>
              </div>
            )}

            <div>
              <label className="flex items-center justify-between text-sm mb-2">
                <span>Icon size</span>
                <span className="text-gray-500">{localBlock.size} px</span>
              </label>
              <input
                type="range"
                min="16"
                max="120"
                value={localBlock.size}
                onChange={(e) => handleChange({ size: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'subheading':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Subheading</label>
              <input
                type="text"
                value={localBlock.text}
                onChange={(e) => handleChange({ text: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Enter subheading text"
              />
            </div>
          </div>
        );

      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Heading</label>
              <div className="border rounded-lg">
                <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
                  <button
                    onClick={() => handleChange({ 
                      formatting: { ...localBlock.formatting, bold: !localBlock.formatting?.bold }
                    })}
                    className={`p-1 rounded hover:bg-gray-200 ${
                      localBlock.formatting?.bold ? 'bg-gray-200' : ''
                    }`}
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    onClick={() => handleChange({ 
                      formatting: { ...localBlock.formatting, italic: !localBlock.formatting?.italic }
                    })}
                    className={`p-1 rounded hover:bg-gray-200 ${
                      localBlock.formatting?.italic ? 'bg-gray-200' : ''
                    }`}
                  >
                    <Italic size={16} />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-200">
                    <Link size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  value={localBlock.text}
                  onChange={(e) => handleChange({ text: e.target.value })}
                  className="w-full px-3 py-2 text-sm"
                  placeholder="Enter heading text"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Heading size</label>
              <select
                value={localBlock.size}
                onChange={(e) => handleChange({ size: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
              </select>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Columns</label>
              <div className="flex gap-1">
                {[1, 2, 3].map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      const newContent = [...localBlock.columnContent];
                      if (col > newContent.length) {
                        for (let i = newContent.length; i < col; i++) {
                          newContent.push('');
                        }
                      } else {
                        newContent.splice(col);
                      }
                      handleChange({ columns: col as 1 | 2 | 3, columnContent: newContent });
                    }}
                    className={`flex-1 px-3 py-2 border rounded ${
                      localBlock.columns === col
                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {Array.from({ length: localBlock.columns }).map((_, index) => (
              <div key={index}>
                <label className="block text-xs text-gray-600 mb-1">
                  Column {index + 1}
                </label>
                <div className="border rounded-lg">
                  <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
                    <button className="p-1 rounded hover:bg-gray-200">
                      <Bold size={16} />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-200">
                      <Italic size={16} />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-200">
                      <Link size={16} />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <button className="p-1 rounded hover:bg-gray-200">
                      <List size={16} />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-200">
                      <ListOrdered size={16} />
                    </button>
                  </div>
                  <textarea
                    value={localBlock.columnContent[index] || ''}
                    onChange={(e) => {
                      const newContent = [...localBlock.columnContent];
                      newContent[index] = e.target.value;
                      handleChange({ columnContent: newContent });
                    }}
                    className="w-full px-3 py-2 text-sm resize-none"
                    rows={4}
                    placeholder="Enter text content"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs text-gray-600 mb-1">Body size</label>
              <select
                value={localBlock.bodySize}
                onChange={(e) => handleChange({ bodySize: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="body1">Body 1</option>
                <option value="body2">Body 2</option>
                <option value="body3">Body 3</option>
                <option value="body4">Body 4</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                For "Paragraph" body text formatting
              </p>
            </div>
          </div>
        );

      case 'buttons':
        return (
          <div className="space-y-4">
            {localBlock.buttons.map((button, index) => (
              <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium">
                  {index === 0 ? 'First button' : 'Second button'}
                </h4>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {index === 0 ? 'First button label' : 'Second button label'}
                  </label>
                  <input
                    type="text"
                    value={button.label}
                    onChange={(e) => {
                      const newButtons = [...localBlock.buttons];
                      newButtons[index] = { ...button, label: e.target.value };
                      handleChange({ buttons: newButtons });
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Button label"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {index === 0 ? 'First button link' : 'Second button link'}
                  </label>
                  <input
                    type="text"
                    value={button.link}
                    onChange={(e) => {
                      const newButtons = [...localBlock.buttons];
                      newButtons[index] = { ...button, link: e.target.value };
                      handleChange({ buttons: newButtons });
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Page URL or search"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {index === 0 ? 'First button style' : 'Second button style'}
                  </label>
                  <div className="flex gap-1">
                    {(['solid', 'outline', 'text'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => {
                          const newButtons = [...localBlock.buttons];
                          newButtons[index] = { ...button, style };
                          handleChange({ buttons: newButtons });
                        }}
                        className={`flex-1 px-3 py-2 border rounded capitalize ${
                          button.style === style
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {index === 0 && localBlock.buttons.length === 1 && (
                  <button
                    onClick={() => {
                      handleChange({ 
                        buttons: [...localBlock.buttons, {
                          label: 'Button',
                          link: '#',
                          style: 'outline'
                        }]
                      });
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Add second button
                  </button>
                )}

                {localBlock.buttons.length > 1 && (
                  <button
                    onClick={() => {
                      const newButtons = localBlock.buttons.filter((_, i) => i !== index);
                      handleChange({ buttons: newButtons });
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove button
                  </button>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const getBlockTitle = () => {
    switch (block.type) {
      case 'icon': return 'Icon';
      case 'subheading': return 'Subheading';
      case 'heading': return 'Heading';
      case 'text': return 'Text';
      case 'buttons': return 'Buttons';
      default: return 'Block';
    }
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-medium text-gray-900 dark:text-white">{getBlockTitle()}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {renderEditor()}
      </div>
    </div>
  );
}