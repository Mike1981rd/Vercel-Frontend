'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AnnouncementBarConfig {
  enabled: boolean;
  showOnlyHomePage: boolean;
  colorScheme: string;
  width: 'screen' | 'page' | 'large' | 'medium';
  showNavigationArrows: boolean;
  animationStyle: 'no-animation' | 'fade' | 'slide-horizontal' | 'slide-vertical' | 'typewriter' | 'infinite-marquee';
  
  autoplay: {
    mode: 'none' | 'one-at-a-time';
    speed: number;
  };
  
  languageSelector: {
    enabled: boolean;
    showOnDesktop: boolean;
  };
  
  currencySelector: {
    enabled: boolean;
    showOnDesktop: boolean;
  };
  
  socialMediaIcons: {
    enabled: boolean;
    showOnDesktop: boolean;
    iconStyle: 'solid' | 'outline';
  };
  
  socialMediaUrls: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    pinterest?: string;
    tiktok?: string;
    tumblr?: string;
    snapchat?: string;
    linkedin?: string;
    vimeo?: string;
    flickr?: string;
    reddit?: string;
    email?: string;
    discord?: string;
    medium?: string;
    twitch?: string;
    whatsapp?: string;
    viber?: string;
    telegram?: string;
  };
  
  edgeRounding: number;
  
  // New slider controls
  arrowSize: number;      // Size of navigation arrows (12-24px)
  textSize: number;       // Size of announcement text (12-20px)
  arrowSpacing: number;   // Spacing between arrows and content (0-20px)
  arrowSpacingMobile?: number;   // Mobile spacing between arrows and content (0-20px)
  
  announcements: Array<{
    id: string;
    text: string;
    link?: string;
  }>;
}

function getDefaultConfig(): AnnouncementBarConfig {
  return {
    enabled: true,
    showOnlyHomePage: false,
    colorScheme: '1',
    width: 'screen',
    showNavigationArrows: true,
    animationStyle: 'slide-horizontal',
    autoplay: {
      mode: 'none',
      speed: 5
    },
    languageSelector: {
      enabled: false,
      showOnDesktop: true
    },
    currencySelector: {
      enabled: false,
      showOnDesktop: true
    },
    socialMediaIcons: {
      enabled: false,
      showOnDesktop: true,
      iconStyle: 'solid'
    },
    socialMediaUrls: {},
    edgeRounding: 0,
    arrowSize: 16,      // Default arrow size
    textSize: 14,       // Default text size
    arrowSpacing: 8,    // Default arrow spacing
    arrowSpacingMobile: 4, // Default mobile arrow spacing (smaller for mobile)
    announcements: []
  };
}

export default function AnnouncementBarEditor() {
  const { config: structuralComponents, updateAnnouncementBarConfigLocal } = useStructuralComponents();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [localConfig, setLocalConfig] = useState<AnnouncementBarConfig>(() => 
    structuralComponents?.announcementBar || getDefaultConfig()
  );
  const [showThemeConfig, setShowThemeConfig] = useState(false);

  // Sync with props
  useEffect(() => {
    const newConfig = structuralComponents?.announcementBar || getDefaultConfig();
    if (JSON.stringify(newConfig) !== JSON.stringify(localConfig)) {
      setLocalConfig(newConfig);
    }
  }, [structuralComponents?.announcementBar]);

  const handleChange = (field: string, value: any) => {
    const updatedConfig = {
      ...localConfig,
      [field]: value
    };
    
    setLocalConfig(updatedConfig);
    updateAnnouncementBarConfigLocal(updatedConfig);
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    const updatedConfig = {
      ...localConfig,
      [parent]: {
        ...(localConfig[parent as keyof AnnouncementBarConfig] as any || {}),
        [field]: value
      }
    };
    
    setLocalConfig(updatedConfig);
    updateAnnouncementBarConfigLocal(updatedConfig);
  };

  const handleSocialMediaUrlChange = (platform: string, value: string) => {
    const updatedConfig = {
      ...localConfig,
      socialMediaUrls: {
        ...localConfig.socialMediaUrls,
        [platform]: value
      }
    };
    
    setLocalConfig(updatedConfig);
    updateAnnouncementBarConfigLocal(updatedConfig);
  };

  // Announcement management moved to sidebar - individual announcements are now separate items

  const socialPlatforms = [
    { key: 'instagram', label: 'Instagram' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'twitter', label: 'Twitter' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'pinterest', label: 'Pinterest' },
    { key: 'tiktok', label: 'TikTok' },
    { key: 'tumblr', label: 'Tumblr' },
    { key: 'snapchat', label: 'Snapchat' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'vimeo', label: 'Vimeo' },
    { key: 'flickr', label: 'Flickr' },
    { key: 'reddit', label: 'Reddit' },
    { key: 'email', label: 'Email' },
    { key: 'discord', label: 'Discord' },
    { key: 'medium', label: 'Medium' },
    { key: 'twitch', label: 'Twitch' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'viber', label: 'Viber' },
    { key: 'telegram', label: 'Telegram' }
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className="font-medium text-gray-900 dark:text-white">
          Announcement bar
        </span>
        {isExpanded ? 
          <ChevronUp className="w-4 h-4 text-gray-500" /> : 
          <ChevronDown className="w-4 h-4 text-gray-500" />
        }
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          
          {/* Main Settings */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showOnlyHomePage"
              checked={localConfig.showOnlyHomePage}
              onChange={(e) => handleChange('showOnlyHomePage', e.target.checked)}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="showOnlyHomePage" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Show only on home page
            </label>
          </div>

          {/* Color Scheme */}
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
            </select>
          </div>

          {/* Width */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Width
            </label>
            <select 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={localConfig.width}
              onChange={(e) => handleChange('width', e.target.value)}
            >
              <option value="screen">Screen</option>
              <option value="page">Page</option>
              <option value="large">Large</option>
              <option value="medium">Medium</option>
            </select>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showNavigationArrows"
              checked={localConfig.showNavigationArrows}
              onChange={(e) => handleChange('showNavigationArrows', e.target.checked)}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="showNavigationArrows" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Show navigation arrows
            </label>
          </div>

          {/* Animation Style */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Animation style
            </label>
            <select 
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              value={localConfig.animationStyle}
              onChange={(e) => handleChange('animationStyle', e.target.value)}
            >
              <option value="no-animation">No animation</option>
              <option value="fade">Fade</option>
              <option value="slide-horizontal">Slide horizontal</option>
              <option value="slide-vertical">Slide vertical</option>
              <option value="typewriter">Typewriter</option>
              <option value="infinite-marquee">Infinite marquee</option>
            </select>
          </div>

          {/* Autoplay Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Autoplay
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Autoplay mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNestedChange('autoplay', 'mode', 'none')}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                      localConfig.autoplay?.mode === 'none' 
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    None
                  </button>
                  <button
                    onClick={() => handleNestedChange('autoplay', 'mode', 'one-at-a-time')}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                      localConfig.autoplay?.mode === 'one-at-a-time' 
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    One-at-a-time
                  </button>
                </div>
              </div>

              {localConfig.autoplay?.mode !== 'none' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Autoplay speed
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={localConfig.autoplay?.speed || 5}
                      onChange={(e) => handleNestedChange('autoplay', 'speed', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        className="w-14 px-2 py-1 text-sm border border-gray-300 rounded
                                   dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        value={localConfig.autoplay?.speed || 5}
                        onChange={(e) => handleNestedChange('autoplay', 'speed', parseInt(e.target.value))}
                        min="3"
                        max="10"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language Selector */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Language selector
              </h3>
              <button
                onClick={() => handleNestedChange('languageSelector', 'enabled', !localConfig.languageSelector?.enabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  localConfig.languageSelector?.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  localConfig.languageSelector?.enabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            {localConfig.languageSelector?.enabled && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="langDesktop"
                  checked={localConfig.languageSelector?.showOnDesktop || false}
                  onChange={(e) => handleNestedChange('languageSelector', 'showOnDesktop', e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="langDesktop" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Show selector on desktop
                </label>
              </div>
            )}
          </div>

          {/* Currency Selector */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Currency selector
              </h3>
              <button
                onClick={() => handleNestedChange('currencySelector', 'enabled', !localConfig.currencySelector?.enabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  localConfig.currencySelector?.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  localConfig.currencySelector?.enabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            {localConfig.currencySelector?.enabled && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="currencyDesktop"
                  checked={localConfig.currencySelector?.showOnDesktop || false}
                  onChange={(e) => handleNestedChange('currencySelector', 'showOnDesktop', e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="currencyDesktop" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Show selector on desktop
                </label>
              </div>
            )}
          </div>

          {/* Social Media Icons */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Social media icons
              </h3>
              <button
                onClick={() => handleNestedChange('socialMediaIcons', 'enabled', !localConfig.socialMediaIcons?.enabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  localConfig.socialMediaIcons?.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  localConfig.socialMediaIcons?.enabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            {localConfig.socialMediaIcons?.enabled && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="socialDesktop"
                  checked={localConfig.socialMediaIcons?.showOnDesktop || false}
                  onChange={(e) => handleNestedChange('socialMediaIcons', 'showOnDesktop', e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="socialDesktop" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Show icons on desktop
                </label>
              </div>
            )}
          </div>

          {/* Theme Configuration - Social Media URLs */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={() => setShowThemeConfig(!showThemeConfig)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Configuración del tema
              </h3>
              {showThemeConfig ? 
                <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                <ChevronDown className="w-4 h-4 text-gray-500" />
              }
            </button>
            
            {showThemeConfig && (
              <div className="space-y-3">
                {/* Social Media URLs */}
                <div className="space-y-2">
                  {socialPlatforms.map(platform => (
                    <div key={platform.key}>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {platform.label}
                      </label>
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                                   focus:outline-none focus:ring-1 focus:ring-blue-500 
                                   dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        value={localConfig.socialMediaUrls?.[platform.key as keyof typeof localConfig.socialMediaUrls] || ''}
                        onChange={(e) => handleSocialMediaUrlChange(platform.key, e.target.value)}
                        placeholder={platform.key === 'email' ? 'mailto:example@store.com' : `https://${platform.key}.com/username`}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Icon Style */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Icon style
                  </label>
                  <select 
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                               focus:outline-none focus:ring-1 focus:ring-blue-500 
                               dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    value={localConfig.socialMediaIcons?.iconStyle || 'solid'}
                    onChange={(e) => handleNestedChange('socialMediaIcons', 'iconStyle', e.target.value)}
                  >
                    <option value="solid">Solid</option>
                    <option value="outline">Outline</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Edge Rounding */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Edge rounding
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10"
                value={localConfig.edgeRounding}
                onChange={(e) => handleChange('edgeRounding', parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px]">
                  {localConfig.edgeRounding === 0 ? 'None' : `Size ${localConfig.edgeRounding}`}
                </span>
              </div>
            </div>
          </div>

          {/* Arrow Size Control */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tamaño de flechas de navegación
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="12"
                max="24"
                value={localConfig.arrowSize || 16}
                onChange={(e) => handleChange('arrowSize', parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px] text-right">
                  {localConfig.arrowSize || 16}px
                </span>
              </div>
            </div>
          </div>

          {/* Text Size Control */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tamaño del texto de anuncios
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="12"
                max="20"
                value={localConfig.textSize || 14}
                onChange={(e) => handleChange('textSize', parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px] text-right">
                  {localConfig.textSize || 14}px
                </span>
              </div>
            </div>
          </div>

          {/* Arrow Spacing Control - Desktop */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Espaciado de flechas (Desktop)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="50"
                value={localConfig.arrowSpacing || 8}
                onChange={(e) => handleChange('arrowSpacing', parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px] text-right">
                  {localConfig.arrowSpacing || 8}px
                </span>
              </div>
            </div>
          </div>

          {/* Arrow Spacing Control - Mobile */}
          <div className="pt-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Espaciado de flechas (Móvil)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="30"
                value={localConfig.arrowSpacingMobile ?? 4}
                onChange={(e) => handleChange('arrowSpacingMobile', parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px] text-right">
                  {localConfig.arrowSpacingMobile ?? 4}px
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
              Espaciado optimizado para pantallas móviles
            </span>
          </div>


        </div>
      )}
    </div>
  );
}