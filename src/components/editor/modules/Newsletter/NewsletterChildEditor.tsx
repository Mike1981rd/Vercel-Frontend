// NewsletterChildEditor.tsx - Editor for individual newsletter blocks
import React, { useEffect, useState } from 'react';
import { Bold, Italic, Link, ChevronLeft } from 'lucide-react';
import { NewsletterBlock } from './types';

interface NewsletterChildEditorProps {
  block: NewsletterBlock;
  onUpdate: (updates: Partial<NewsletterBlock>) => void;
  onClose: () => void;
}

export default function NewsletterChildEditor({
  block,
  onUpdate,
  onClose
}: NewsletterChildEditorProps) {
  const [localBlock, setLocalBlock] = useState<NewsletterBlock>(block);

  useEffect(() => {
    setLocalBlock(block);
  }, [block]);

  const handleChange = (updates: Partial<NewsletterBlock>) => {
    const newBlock = { ...localBlock, ...updates } as NewsletterBlock;
    setLocalBlock(newBlock);
    onUpdate(updates);
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'subheading':
        return (
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Subheading</label>
            <input
              type="text"
              value={localBlock.type === 'subheading' ? localBlock.text : ''}
              onChange={(e) => handleChange({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter subheading text"
            />
          </div>
        );

      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Heading</label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex items-center gap-1 p-2 border-b border-gray-300 dark:border-gray-600">
                  <button
                    onClick={() => {
                      if (localBlock.type === 'heading') {
                        handleChange({
                          formatting: {
                            ...localBlock.formatting,
                            bold: !localBlock.formatting?.bold
                          }
                        });
                      }
                    }}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      localBlock.type === 'heading' && localBlock.formatting?.bold ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (localBlock.type === 'heading') {
                        handleChange({
                          formatting: {
                            ...localBlock.formatting,
                            italic: !localBlock.formatting?.italic
                          }
                        });
                      }
                    }}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      localBlock.type === 'heading' && localBlock.formatting?.italic ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (localBlock.type === 'heading') {
                        const link = prompt('Enter link URL:', localBlock.formatting?.link || '');
                        handleChange({
                          formatting: {
                            ...localBlock.formatting,
                            link: link || undefined
                          }
                        });
                      }
                    }}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      localBlock.type === 'heading' && localBlock.formatting?.link ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Link size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={localBlock.type === 'heading' ? localBlock.text : ''}
                  onChange={(e) => handleChange({ text: e.target.value })}
                  className="w-full px-3 py-2 text-sm outline-none bg-transparent text-gray-900 dark:text-white"
                  placeholder="Enter heading text"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Heading size</label>
              <select
                value={localBlock.type === 'heading' ? localBlock.size : 'h4'}
                onChange={(e) => handleChange({ size: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Body</label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex items-center gap-1 p-2 border-b border-gray-300 dark:border-gray-600">
                  <button
                    onClick={() => {
                      if (localBlock.type === 'text') {
                        handleChange({
                          formatting: {
                            ...localBlock.formatting,
                            bold: !localBlock.formatting?.bold
                          }
                        });
                      }
                    }}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      localBlock.type === 'text' && localBlock.formatting?.bold ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (localBlock.type === 'text') {
                        handleChange({
                          formatting: {
                            ...localBlock.formatting,
                            italic: !localBlock.formatting?.italic
                          }
                        });
                      }
                    }}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      localBlock.type === 'text' && localBlock.formatting?.italic ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (localBlock.type === 'text') {
                        const link = prompt('Enter link URL:', localBlock.formatting?.link || '');
                        handleChange({
                          formatting: {
                            ...localBlock.formatting,
                            link: link || undefined
                          }
                        });
                      }
                    }}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      localBlock.type === 'text' && localBlock.formatting?.link ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Link size={14} />
                  </button>
                </div>
                <textarea
                  value={localBlock.type === 'text' ? localBlock.content : ''}
                  onChange={(e) => handleChange({ content: e.target.value })}
                  className="w-full px-3 py-2 text-sm outline-none resize-none bg-transparent text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Enter text content"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Body size</label>
              <select
                value={localBlock.type === 'text' ? localBlock.bodySize : 'body3'}
                onChange={(e) => handleChange({ bodySize: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="body1">Body 1</option>
                <option value="body2">Body 2</option>
                <option value="body3">Body 3</option>
                <option value="body4">Body 4</option>
              </select>
            </div>
          </div>
        );

      case 'subscribe':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Input style</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleChange({ inputStyle: 'solid' })}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                    localBlock.type === 'subscribe' && localBlock.inputStyle === 'solid'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Solid
                </button>
                <button
                  onClick={() => handleChange({ inputStyle: 'outline' })}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                    localBlock.type === 'subscribe' && localBlock.inputStyle === 'outline'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Outline
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Placeholder text</label>
              <input
                type="text"
                value={localBlock.type === 'subscribe' ? localBlock.placeholder : ''}
                onChange={(e) => handleChange({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter placeholder text"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Button text</label>
              <input
                type="text"
                value={localBlock.type === 'subscribe' ? localBlock.buttonText : ''}
                onChange={(e) => handleChange({ buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter button text"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (block.type) {
      case 'subheading': return 'Subheading';
      case 'heading': return 'Heading';
      case 'text': return 'Text';
      case 'subscribe': return 'Subscribe';
      default: return 'Block';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-medium text-gray-900 dark:text-white">{getTitle()}</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderEditor()}
      </div>
    </div>
  );
}