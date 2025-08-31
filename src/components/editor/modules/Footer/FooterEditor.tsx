/**
 * @file FooterEditor.tsx
 * @max-lines 300
 * @module Footer
 * @created 2025-01-15
 * 
 * CHECKPOINT VALIDATIONS:
 * ✅ File will be < 300 lines
 * ✅ Following modular architecture
 * ✅ Using useStructuralComponents hook
 * ✅ Will update isDirty on changes
 * ✅ Will sync with props via useEffect
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { useNavigationMenus } from '@/hooks/useNavigationMenus';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FooterConfig, getDefaultFooterConfig } from './FooterTypes';
import FooterSocialMedia from './FooterSocialMedia';
import FooterExpandibleSections from './FooterExpandibleSections';
import FooterPaddingSection from './FooterPaddingSection';
import PaymentProvidersConfig from './PaymentProvidersConfig';

export default function FooterEditor() {
  const { 
    config: structuralComponents, 
    updateFooterConfigLocal
  } = useStructuralComponents();
  
  const { menus, loading: menusLoading } = useNavigationMenus();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    followOnShop: false,
    languageSelector: false,
    currencySelector: false,
    policyLinks: false,
    copyrightNotice: false,
    paymentProviders: false
  });
  
  const [localConfig, setLocalConfig] = useState<FooterConfig>(() => 
    structuralComponents?.footer || getDefaultFooterConfig()
  );

  // Initialize footer if it doesn't exist
  useEffect(() => {
    if (!structuralComponents?.footer) {
      const defaultConfig = getDefaultFooterConfig();
      updateFooterConfigLocal(defaultConfig);
    }
  }, []);

  // Sync with props
  useEffect(() => {
    const newConfig = structuralComponents?.footer || getDefaultFooterConfig();
    if (JSON.stringify(newConfig) !== JSON.stringify(localConfig)) {
      setLocalConfig(newConfig);
    }
  }, [structuralComponents?.footer]);

  const handleChange = (field: string, value: any) => {
    const updatedConfig = {
      ...localConfig,
      [field]: value
    };
    
    setLocalConfig(updatedConfig);
    updateFooterConfigLocal(updatedConfig);
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    const updatedConfig = {
      ...localConfig,
      [parent]: {
        ...(localConfig[parent as keyof FooterConfig] as any || {}),
        [field]: value
      }
    };
    
    setLocalConfig(updatedConfig);
    updateFooterConfigLocal(updatedConfig);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className="font-medium text-gray-900 dark:text-white">
          Footer
        </span>
        {isExpanded ? 
          <ChevronUp className="w-4 h-4 text-gray-500" /> : 
          <ChevronDown className="w-4 h-4 text-gray-500" />
        }
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          
          {/* Color scheme */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Color scheme
            </label>
            <select 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={localConfig.colorScheme}
              onChange={(e) => handleChange('colorScheme', e.target.value)}
            >
              <option value="1">Scheme 1</option>
              <option value="2">Scheme 2</option>
              <option value="3">Scheme 3</option>
              <option value="4">Scheme 4</option>
              <option value="5">Scheme 5</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Learn more about <a href="#" className="text-blue-500 hover:underline">color schemes</a>
            </p>
          </div>

          {/* Color background */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Color background
            </label>
            <button
              onClick={() => handleChange('colorBackground', !localConfig.colorBackground)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                localConfig.colorBackground ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                localConfig.colorBackground ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Navigation menu */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Navigation menu
            </label>
            <select 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={localConfig.navigationMenuId || ''}
              onChange={(e) => handleChange('navigationMenuId', e.target.value)}
              disabled={menusLoading}
            >
              <option value="">Select a menu</option>
              {menus.map(menu => (
                <option key={menu.id} value={menu.id.toString()}>
                  {menu.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              <a href="/dashboard/navigation-menus" className="text-blue-500 hover:underline">
                Create or edit menus
              </a>
            </p>
          </div>

          {/* Desktop column count */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Desktop column count
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleChange('desktopColumnCount', 3)}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                  localConfig.desktopColumnCount === 3
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                3
              </button>
              <button
                onClick={() => handleChange('desktopColumnCount', 4)}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                  localConfig.desktopColumnCount === 4
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                4
              </button>
            </div>
          </div>

          {/* Show separator */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Show separator
            </label>
            <button
              onClick={() => handleChange('showSeparator', !localConfig.showSeparator)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                localConfig.showSeparator ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                localConfig.showSeparator ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Bottom bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Bottom bar
              </label>
              <button
                onClick={() => handleNestedChange('bottomBar', 'enabled', !localConfig.bottomBar?.enabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  localConfig.bottomBar?.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  localConfig.bottomBar?.enabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {localConfig.bottomBar?.enabled && (
              <div className="pl-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Choose
                  </label>
                  <select 
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                               focus:outline-none focus:ring-1 focus:ring-blue-500 
                               dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    value={localConfig.bottomBar?.content || 'subscribed'}
                    onChange={(e) => handleNestedChange('bottomBar', 'content', e.target.value)}
                  >
                    <option value="subscribed">Subscribed</option>
                    <option value="payment">Payment Icons</option>
                    <option value="locale">Language/Currency</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Payment Providers Configuration */}
                <PaymentProvidersConfig
                  localConfig={localConfig}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                  handleNestedChange={handleNestedChange}
                />
              </div>
            )}
          </div>

          {/* Secciones expandibles */}
          <FooterExpandibleSections
            localConfig={localConfig}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            handleChange={handleChange}
            handleNestedChange={handleNestedChange}
          />

          {/* Paddings */}
          <FooterPaddingSection
            padding={localConfig.padding}
            onNestedChange={handleNestedChange}
          />

          {/* Social Media - Component separado */}
          <FooterSocialMedia
            socialMedia={localConfig.socialMedia || {}}
            onChange={(socialMedia) => handleChange('socialMedia', socialMedia)}
          />

          {/* CSS personalizado */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md 
                             hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 
                             dark:hover:bg-gray-700 transition-colors">
              CSS personalizado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}