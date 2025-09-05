/**
 * @file MulticolumnsItemEditor.tsx
 * @max-lines 300
 * @module Multicolumns
 * @description Editor para items individuales de Multicolumns (Icon columns)
 * @template-section true
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Bold, Italic, Link, List, ListOrdered, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { MulticolumnsConfig, MulticolumnsItemConfig } from './types';

// Predefined icons organized by category (same as AnnouncementBar)
const ICON_CATEGORIES = [
  {
    name: 'General',
    icons: [
      { value: 'Settings', label: 'Settings', icon: Icons.Settings },
      { value: 'Search', label: 'Search', icon: Icons.Search },
      { value: 'Eye', label: 'Eye', icon: Icons.Eye },
      { value: 'EyeOff', label: 'Eye slash', icon: Icons.EyeOff },
      { value: 'User', label: 'User', icon: Icons.User },
      { value: 'HeartOutline', label: 'Love outline', icon: Icons.Heart },
      { value: 'HeartSolid', label: 'Love solid', icon: Icons.Heart },
      { value: 'ThumbsUp', label: 'Like', icon: Icons.ThumbsUp },
      { value: 'ThumbsDown', label: 'Dislike', icon: Icons.ThumbsDown },
      { value: 'Lightbulb', label: 'Lamp', icon: Icons.Lightbulb },
      { value: 'StarOutline', label: 'Star outline', icon: Icons.Star },
      { value: 'StarSolid', label: 'Star solid', icon: Icons.Star },
      { value: 'Trash2', label: 'Trash', icon: Icons.Trash2 },
      { value: 'FileText', label: 'Document', icon: Icons.FileText },
      { value: 'Copy', label: 'Copy', icon: Icons.Copy },
      { value: 'Share2', label: 'Share', icon: Icons.Share2 },
      { value: 'Plus', label: 'Plus', icon: Icons.Plus },
      { value: 'Minus', label: 'Minus', icon: Icons.Minus },
      { value: 'X', label: 'X', icon: Icons.X },
      { value: 'Check', label: 'Check', icon: Icons.Check },
      { value: 'ArrowUp', label: 'Arrow up', icon: Icons.ArrowUp },
      { value: 'ArrowDown', label: 'Arrow down', icon: Icons.ArrowDown },
      { value: 'ArrowLeft', label: 'Arrow left', icon: Icons.ArrowLeft },
      { value: 'ArrowRight', label: 'Arrow right', icon: Icons.ArrowRight },
      { value: 'ChevronUp', label: 'Chevron up', icon: Icons.ChevronUp },
      { value: 'ChevronDown', label: 'Chevron down', icon: Icons.ChevronDown },
      { value: 'ChevronLeft', label: 'Chevron left', icon: Icons.ChevronLeft },
      { value: 'ChevronRight', label: 'Chevron right', icon: Icons.ChevronRight }
    ]
  },
  {
    name: 'Commerce',
    icons: [
      { value: 'barcode', label: 'Barcode', icon: Icons.ScanLine },
      { value: 'star', label: 'Star', icon: Icons.Star },
      { value: 'shopping-cart', label: 'Cart', icon: Icons.ShoppingCart },
      { value: 'truck', label: 'Shipping', icon: Icons.Truck },
      { value: 'gift', label: 'Gift', icon: Icons.Gift },
      { value: 'percent', label: 'Discount', icon: Icons.Percent },
      { value: 'tag', label: 'Tag', icon: Icons.Tag },
      { value: 'lock', label: 'Secure', icon: Icons.Lock },
      { value: 'credit-card', label: 'Payment', icon: Icons.CreditCard },
      { value: 'phone', label: 'Phone', icon: Icons.Phone },
      { value: 'mail', label: 'Email', icon: Icons.Mail },
      { value: 'help-circle', label: 'Support', icon: Icons.HelpCircle },
    ]
  }
];

interface MulticolumnsItemEditorProps {
  sectionId: string;
  itemId: string;
}

export default function MulticolumnsItemEditor({ sectionId, itemId }: MulticolumnsItemEditorProps) {
  const { sections, updateSectionSettings, selectSection } = useEditorStore();
  
  const section = Object.values(sections).flat().find(s => s.id === sectionId);
  const config = section?.settings as MulticolumnsConfig;
  const item = config?.items?.find(i => i.id === itemId);
  
  const [localItem, setLocalItem] = useState<MulticolumnsItemConfig | null>(item || null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [useCustomIcon, setUseCustomIcon] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    icon: true,
    content: false,
    link: false,
  });

  useEffect(() => {
    const currentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    const currentConfig = currentSection?.settings as MulticolumnsConfig;
    const currentItem = currentConfig?.items?.find(i => i.id === itemId);
    
    if (currentItem && JSON.stringify(currentItem) !== JSON.stringify(localItem)) {
      setLocalItem(currentItem);
      setUseCustomIcon(currentItem.icon === 'custom');
    }
  }, [sectionId, itemId, sections]);

  const handleChange = (field: keyof MulticolumnsItemConfig, value: any) => {
    if (!localItem || !section || !config) return;
    
    const updatedItem = { ...localItem, [field]: value };
    setLocalItem(updatedItem);
    
    const updatedItems = config.items.map(i =>
      i.id === itemId ? updatedItem : i
    );
    
    const groupId = Object.keys(sections).find(key => 
      sections[key as keyof typeof sections].includes(section)
    );
    
    if (groupId) {
      updateSectionSettings(groupId, section.id, {
        ...config,
        items: updatedItems
      });
    }
  };

  const handleBack = () => {
    selectSection(null);
  };

  const handleDeleteItem = () => {
    if (!section || !config) return;
    
    const updatedItems = config.items.filter(i => i.id !== itemId);
    const groupId = Object.keys(sections).find(key => 
      sections[key as keyof typeof sections].includes(section)
    );
    
    if (groupId) {
      updateSectionSettings(groupId, section.id, {
        ...config,
        items: updatedItems
      });
      selectSection(null);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!localItem) {
    return (
      <div className="w-[320px] p-4 text-center text-gray-500">
        <p className="text-xs">Item not found</p>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleBack}
          className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-medium">Icon column</span>
        </button>
        
        {/* Visibility toggle */}
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Visible</span>
            <button
              onClick={() => handleChange('visible', !localItem.visible)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                localItem.visible ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                localItem.visible ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        
        {/* Icon Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('icon')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium">Icon</span>
            {expandedSections.icon ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.icon && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Icon</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={useCustomIcon ? 'custom' : localItem.icon}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setUseCustomIcon(true);
                      handleChange('icon', 'custom');
                    } else {
                      setUseCustomIcon(false);
                      handleChange('icon', e.target.value);
                    }
                  }}
                >
                  {ICON_CATEGORIES.map(category => (
                    <optgroup key={category.name} label={category.name}>
                      {category.icons.map(icon => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="custom">Custom icon</option>
                </select>
              </div>

              {useCustomIcon && (
                <div>
                  <label className="text-xs text-gray-600">Custom icon SVG</label>
                  <textarea
                    className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md font-mono"
                    rows={4}
                    value={localItem.customIcon || ''}
                    onChange={(e) => handleChange('customIcon', e.target.value)}
                    placeholder="<svg>...</svg>"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste SVG code here
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-600">Icon size</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="24"
                    max="128"
                    value={localItem.iconSize}
                    onChange={(e) => handleChange('iconSize', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs w-12 text-right">{localItem.iconSize}px</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('content')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium">Content</span>
            {expandedSections.content ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.content && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Heading</label>
                <input
                  type="text"
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localItem.heading}
                  onChange={(e) => handleChange('heading', e.target.value)}
                  placeholder="Enter heading"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Body</label>
                <textarea
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  rows={4}
                  value={localItem.body}
                  onChange={(e) => handleChange('body', e.target.value)}
                  placeholder="Enter body text"
                />
              </div>
            </div>
          )}
        </div>

        {/* Link Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('link')}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-xs font-medium">Link</span>
            {expandedSections.link ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {expandedSections.link && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Link label</label>
                <input
                  type="text"
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localItem.linkLabel}
                  onChange={(e) => handleChange('linkLabel', e.target.value)}
                  placeholder="Enter link text"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Link</label>
                <input
                  type="url"
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  value={localItem.link}
                  onChange={(e) => handleChange('link', e.target.value)}
                  placeholder="https://example.com or /page"
                />
              </div>

              <p className="text-xs text-gray-500">
                Leave link label empty to make the whole column a link
              </p>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <div className="p-3">
          <button
            onClick={handleDeleteItem}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Eliminar bloque</span>
          </button>
        </div>

      </div>
    </div>
  );
}