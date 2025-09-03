/**
 * @file SlideContentEditor.tsx
 * @max-lines 300
 * @module Slideshow
 * Content, position, background and buttons editor for slides
 */

'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SlideConfig } from './types';

interface SlideContentEditorProps {
  slide: SlideConfig;
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;
  onChange: (field: keyof SlideConfig, value: any) => void;
}

export function SlideContentEditor({
  slide,
  expandedSections,
  onToggleSection,
  onChange
}: SlideContentEditorProps) {
  
  // Ensure default values for font sizes
  const headingSize = slide.headingSize || 48;
  const bodySize = slide.bodySize || 16;
  
  return (
    <>
      {/* Content Section */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onToggleSection('content')}
          className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            Content
          </span>
          {expandedSections.content ? 
            <ChevronUp className="w-3 h-3 text-gray-500" /> : 
            <ChevronDown className="w-3 h-3 text-gray-500" />
          }
        </button>
        
        {expandedSections.content && (
          <div className="px-3 pb-3 space-y-3">
            {/* Subheading */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Subheading</label>
              <input
                type="text"
                value={slide.subheading}
                onChange={(e) => onChange('subheading', e.target.value)}
                className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                placeholder="IMAGE SLIDE"
              />
            </div>

            {/* Heading */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Heading</label>
              <input
                type="text"
                value={slide.heading}
                onChange={(e) => onChange('heading', e.target.value)}
                className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                placeholder="Image with text"
              />
            </div>

            {/* Body */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Body</label>
              <textarea
                value={slide.body}
                onChange={(e) => onChange('body', e.target.value)}
                className="w-full mt-1 px-2 py-1.5 text-sm border rounded resize-none"
                rows={3}
                placeholder="Fill in the text..."
              />
            </div>

            {/* Heading Size */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">
                Heading size: {headingSize}px
              </label>
              <input
                type="range"
                min="20"
                max="80"
                step="2"
                value={headingSize}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  console.log('[DEBUG] Changing headingSize to:', newValue);
                  onChange('headingSize', newValue);
                }}
                className="w-full mt-1"
              />
            </div>

            {/* Body Size */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">
                Body size: {bodySize}px
              </label>
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={bodySize}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  console.log('[DEBUG] Changing bodySize to:', newValue);
                  onChange('bodySize', newValue);
                }}
                className="w-full mt-1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content Position */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onToggleSection('position')}
          className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            Content position
          </span>
          {expandedSections.position ? 
            <ChevronUp className="w-3 h-3 text-gray-500" /> : 
            <ChevronDown className="w-3 h-3 text-gray-500" />
          }
        </button>
        
        {expandedSections.position && (
          <div className="px-3 pb-3 space-y-3">
            {/* Desktop Position */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Desktop position</label>
              <select 
                className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                value={slide.desktopPosition}
                onChange={(e) => onChange('desktopPosition', e.target.value)}
              >
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="center-left">Center Left</option>
                <option value="center">Center</option>
                <option value="center-right">Center Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>

            {/* Desktop Alignment */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Desktop alignment</label>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => onChange('desktopAlignment', 'left')}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    slide.desktopAlignment === 'left'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Left
                </button>
                <button
                  onClick={() => onChange('desktopAlignment', 'center')}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    slide.desktopAlignment === 'center'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Center
                </button>
                <button
                  onClick={() => onChange('desktopAlignment', 'right')}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    slide.desktopAlignment === 'right'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Right
                </button>
              </div>
            </div>

            {/* Desktop Width */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">
                Desktop width: {slide.desktopWidth}px
              </label>
              <input
                type="range"
                min="200"
                max="800"
                step="20"
                value={slide.desktopWidth}
                onChange={(e) => onChange('desktopWidth', parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>

            {/* Desktop Spacing */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">
                Desktop spacing: {slide.desktopSpacing}px
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={slide.desktopSpacing}
                onChange={(e) => onChange('desktopSpacing', parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>

            {/* Mobile Position */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Mobile position</label>
              <select 
                className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                value={slide.mobilePosition}
                onChange={(e) => onChange('mobilePosition', e.target.value)}
              >
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>

            {/* Mobile Alignment */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Mobile alignment</label>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => onChange('mobileAlignment', 'left')}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    slide.mobileAlignment === 'left'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Left
                </button>
                <button
                  onClick={() => onChange('mobileAlignment', 'center')}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    slide.mobileAlignment === 'center'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Center
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Background */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onToggleSection('background')}
          className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            Content background
          </span>
          {expandedSections.background ? 
            <ChevronUp className="w-3 h-3 text-gray-500" /> : 
            <ChevronDown className="w-3 h-3 text-gray-500" />
          }
        </button>
        
        {expandedSections.background && (
          <div className="px-3 pb-3 space-y-3">
            {/* Desktop Background */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Desktop</label>
              <select 
                className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                value={slide.desktopBackground}
                onChange={(e) => onChange('desktopBackground', e.target.value)}
              >
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
                <option value="shadow">Shadow</option>
                <option value="blurred">Blurred</option>
                <option value="transparent">Transparent</option>
                <option value="none">None</option>
              </select>
            </div>

            {/* Mobile Background */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Mobile</label>
              <select 
                className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                value={slide.mobileBackground}
                onChange={(e) => onChange('mobileBackground', e.target.value)}
              >
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
                <option value="shadow">Shadow</option>
                <option value="blurred">Blurred</option>
                <option value="transparent">Transparent</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onToggleSection('buttons')}
          className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            Buttons
          </span>
          {expandedSections.buttons ? 
            <ChevronUp className="w-3 h-3 text-gray-500" /> : 
            <ChevronDown className="w-3 h-3 text-gray-500" />
          }
        </button>
        
        {expandedSections.buttons && (
          <div className="px-3 pb-3 space-y-3">
            {/* First Button */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700">First button</h4>
              <input
                type="text"
                value={slide.firstButtonLabel}
                onChange={(e) => onChange('firstButtonLabel', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded"
                placeholder="Button label"
              />
              <input
                type="text"
                value={slide.firstButtonLink}
                onChange={(e) => onChange('firstButtonLink', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded"
                placeholder="Link URL"
              />
              <select 
                className="w-full px-2 py-1.5 text-sm border rounded"
                value={slide.firstButtonStyle}
                onChange={(e) => onChange('firstButtonStyle', e.target.value)}
              >
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
                <option value="text">Text</option>
              </select>
            </div>

            {/* Second Button */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700">Second button</h4>
              <input
                type="text"
                value={slide.secondButtonLabel}
                onChange={(e) => onChange('secondButtonLabel', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded"
                placeholder="Button label (optional)"
              />
              <input
                type="text"
                value={slide.secondButtonLink}
                onChange={(e) => onChange('secondButtonLink', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded"
                placeholder="Link URL"
              />
              <select 
                className="w-full px-2 py-1.5 text-sm border rounded"
                value={slide.secondButtonStyle}
                onChange={(e) => onChange('secondButtonStyle', e.target.value)}
              >
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
                <option value="text">Text</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </>
  );
}