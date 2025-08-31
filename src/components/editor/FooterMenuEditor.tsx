/**
 * @file FooterMenuEditor.tsx
 * @max-lines 300
 * @current-lines 0
 * @architecture modular
 * @validates-rules ✅
 * 
 * Configuration editor for Footer Menu blocks
 * Allows selection of navigation menus and heading configuration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, Menu, AlertCircle } from 'lucide-react';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { useEditorStore } from '@/stores/useEditorStore';
import { useNavigationMenus } from '@/hooks/useNavigationMenus';

interface FooterMenuSettings {
  navigationMenuId?: string;
  heading?: string;
}

interface FooterMenuEditorProps {
  blockId: string;
}

export default function FooterMenuEditor({ blockId }: FooterMenuEditorProps) {
  const { config: structuralComponents, updateFooterConfigLocal } = useStructuralComponents();
  const { toggleConfigPanel, selectSection } = useEditorStore();
  const { menus, loading: menusLoading } = useNavigationMenus();
  
  // Get the specific block from footer config
  const footerConfig = structuralComponents?.footer || {};
  const blocks = footerConfig.blocks || [];
  const currentBlock = blocks.find((b: any) => b.id === blockId);
  
  // Initialize local state with current settings
  const [localSettings, setLocalSettings] = useState<FooterMenuSettings>(() => {
    return currentBlock?.settings || {
      navigationMenuId: '',
      heading: ''
    };
  });

  // Sync with props when they change
  useEffect(() => {
    const block = blocks.find((b: any) => b.id === blockId);
    if (block?.settings) {
      const newSettings = block.settings || { navigationMenuId: '', heading: '' };
      if (JSON.stringify(newSettings) !== JSON.stringify(localSettings)) {
        setLocalSettings(newSettings);
      }
    }
  }, [blockId, blocks]);

  const handleBack = () => {
    // Close config panel and return to sidebar
    toggleConfigPanel(false);
    selectSection(null);
  };

  const handleChange = (field: keyof FooterMenuSettings, value: string) => {
    const updatedSettings = {
      ...localSettings,
      [field]: value
    };
    
    setLocalSettings(updatedSettings);
    
    // Update the block in footer config
    const updatedBlocks = blocks.map((block: any) => 
      block.id === blockId 
        ? { ...block, settings: updatedSettings }
        : block
    );
    
    const updatedConfig = {
      ...footerConfig,
      blocks: updatedBlocks
    };
    
    updateFooterConfigLocal(updatedConfig);
  };

  // Get selected menu details
  const selectedMenu = menus.find(m => m.id.toString() === localSettings.navigationMenuId);

  return (
    <div className="w-[320px] h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleBack}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex items-center gap-2">
          <Menu className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h2 className="text-base font-medium text-gray-900 dark:text-white">
            Menu
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          
          {/* Navigation Menu Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Choose navigation menu
            </label>
            
            {menusLoading ? (
              <div className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
                <span className="text-gray-500 dark:text-gray-400">Loading menus...</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                             focus:outline-none focus:ring-1 focus:ring-blue-500 
                             dark:bg-gray-800 dark:border-gray-600 dark:text-white
                             appearance-none pr-8 cursor-pointer"
                  value={localSettings.navigationMenuId || ''}
                  onChange={(e) => handleChange('navigationMenuId', e.target.value)}
                >
                  <option value="">Select a menu</option>
                  {menus.map(menu => (
                    <option key={menu.id} value={menu.id.toString()}>
                      {menu.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            )}
            
            {selectedMenu && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Menu without dropdown items
              </p>
            )}
            
            {!selectedMenu && localSettings.navigationMenuId && (
              <div className="mt-2 flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  The selected menu no longer exists. Please choose another one.
                </p>
              </div>
            )}
          </div>

          {/* Heading */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Heading
            </label>
            <input
              type="text"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500"
              value={localSettings.heading || ''}
              onChange={(e) => handleChange('heading', e.target.value)}
              placeholder="Soporte"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional heading above the menu links
            </p>
          </div>

          {/* Info Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              About Footer Menus
            </h3>
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • The menu will display as a vertical list of links
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • Only first-level menu items will be shown (no dropdowns)
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • You can manage menu items in the Navigation module
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • The heading is optional and will appear above the links
              </p>
            </div>
          </div>

          {/* Preview Section */}
          {selectedMenu && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Preview
              </h3>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {localSettings.heading && (
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 uppercase">
                    {localSettings.heading}
                  </h4>
                )}
                <div className="space-y-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Menu: {selectedMenu.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                    Links will be loaded from the menu configuration
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Tip: Create footer-specific menus
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Go to Navigation → Create a new menu specifically for footer links like 
                  "Customer Service", "Company", or "Legal" to keep your footer organized.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}