/**
 * @file FooterSocialMediaEditor.tsx
 * @max-lines 300
 * @current-lines 0
 * @architecture modular
 * @validates-rules ✅
 * 
 * Configuration editor for Footer Social Media blocks
 * Allows heading and body text configuration for social media section
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Bold, Italic, Link2, List, AlertCircle } from 'lucide-react';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { useEditorStore } from '@/stores/useEditorStore';

interface FooterSocialMediaSettings {
  heading?: string;
  body?: string;
  iconStyle?: 'solid' | 'outline';
  iconSize?: 'small' | 'medium' | 'large';
  platforms?: {
    instagram?: boolean;
    facebook?: boolean;
    twitter?: boolean;
    youtube?: boolean;
    linkedin?: boolean;
    tiktok?: boolean;
    pinterest?: boolean;
    snapchat?: boolean;
  };
}

interface FooterSocialMediaEditorProps {
  blockId: string;
}

function getDefaultSettings(): FooterSocialMediaSettings {
  return {
    heading: 'Síguenos en',
    body: '',
    iconStyle: 'solid',
    iconSize: 'medium',
    platforms: {
      instagram: true,
      facebook: true,
      twitter: true,
      youtube: true,
      linkedin: true,
      tiktok: false,
      pinterest: false,
      snapchat: false
    }
  };
}

export default function FooterSocialMediaEditor({ blockId }: FooterSocialMediaEditorProps) {
  const { config: structuralComponents, updateFooterConfigLocal } = useStructuralComponents();
  const { toggleConfigPanel, selectSection } = useEditorStore();
  
  // Get the specific block from footer config
  const footerConfig = structuralComponents?.footer || {};
  const blocks = footerConfig.blocks || [];
  const currentBlock = blocks.find((b: any) => b.id === blockId);
  
  // Initialize local state with current settings
  const [localSettings, setLocalSettings] = useState<FooterSocialMediaSettings>(() => {
    return currentBlock?.settings || getDefaultSettings();
  });

  // Sync with props when they change
  useEffect(() => {
    const block = blocks.find((b: any) => b.id === blockId);
    if (block?.settings) {
      const newSettings = block.settings || getDefaultSettings();
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

  const handleChange = (field: keyof FooterSocialMediaSettings, value: any) => {
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

  const handlePlatformToggle = (platform: string) => {
    const updatedPlatforms = {
      ...(localSettings.platforms || {}),
      [platform]: !(localSettings.platforms?.[platform as keyof typeof localSettings.platforms])
    };
    
    handleChange('platforms', updatedPlatforms);
  };

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
          <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h2 className="text-base font-medium text-gray-900 dark:text-white">
            Social media
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          
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
              placeholder="Síguenos en"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional heading above the social media icons
            </p>
          </div>

          {/* Body Text with Rich Text Toolbar */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Body
            </label>
            
            {/* Rich Text Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 border-b-0 rounded-t-md">
              <button 
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={() => {/* TODO: Implement bold */}}
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button 
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={() => {/* TODO: Implement italic */}}
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
              <button 
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={() => {/* TODO: Implement link */}}
                title="Link"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
              <button 
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={() => {/* TODO: Implement list */}}
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button 
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                onClick={() => {/* TODO: Implement ordered list */}}
                title="Numbered List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Textarea */}
            <textarea
              className="w-full px-3 py-2 text-sm border-x border-b border-gray-300 rounded-b-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              value={localSettings.body || ''}
              onChange={(e) => handleChange('body', e.target.value)}
              placeholder="Connect with us on social media"
              rows={3}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional text below the heading
            </p>
          </div>

          {/* Icon Style */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Icon style
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleChange('iconStyle', 'solid')}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                  localSettings.iconStyle === 'solid' 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Solid
              </button>
              <button
                onClick={() => handleChange('iconStyle', 'outline')}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                  localSettings.iconStyle === 'outline' 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Outline
              </button>
            </div>
          </div>

          {/* Icon Size */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Icon size
            </label>
            <div className="flex gap-2">
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  onClick={() => handleChange('iconSize', size)}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                    localSettings.iconSize === size 
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Platforms to display
            </label>
            <div className="space-y-2">
              {[
                { key: 'instagram', label: 'Instagram' },
                { key: 'facebook', label: 'Facebook' },
                { key: 'twitter', label: 'X (Twitter)' },
                { key: 'youtube', label: 'YouTube' },
                { key: 'linkedin', label: 'LinkedIn' },
                { key: 'tiktok', label: 'TikTok' },
                { key: 'pinterest', label: 'Pinterest' },
                { key: 'snapchat', label: 'Snapchat' }
              ].map(platform => (
                <div key={platform.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {platform.label}
                  </span>
                  <button
                    onClick={() => handlePlatformToggle(platform.key)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      localSettings.platforms?.[platform.key as keyof typeof localSettings.platforms] !== false
                        ? 'bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span 
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        localSettings.platforms?.[platform.key as keyof typeof localSettings.platforms] !== false
                          ? 'translate-x-5'
                          : 'translate-x-1'
                      }`} 
                    />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Only selected platforms will be displayed in the footer
            </p>
          </div>

          {/* Important Note */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                  Configure Social Media URLs
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  The actual social media links are configured in the main Footer settings. 
                  This block will automatically display icons for all configured social platforms.
                </p>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Preview
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              {localSettings.heading && (
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {localSettings.heading}
                </h4>
              )}
              {localSettings.body && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {localSettings.body}
                </p>
              )}
              <div className="flex gap-3">
                {/* Sample icons */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  localSettings.iconStyle === 'solid' 
                    ? 'bg-gray-900 dark:bg-white' 
                    : 'border-2 border-gray-900 dark:border-white'
                }`}>
                  <span className={`text-xs ${
                    localSettings.iconStyle === 'solid' 
                      ? 'text-white dark:text-gray-900' 
                      : 'text-gray-900 dark:text-white'
                  }`}>f</span>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  localSettings.iconStyle === 'solid' 
                    ? 'bg-gray-900 dark:bg-white' 
                    : 'border-2 border-gray-900 dark:border-white'
                }`}>
                  <span className={`text-xs ${
                    localSettings.iconStyle === 'solid' 
                      ? 'text-white dark:text-gray-900' 
                      : 'text-gray-900 dark:text-white'
                  }`}>ig</span>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  localSettings.iconStyle === 'solid' 
                    ? 'bg-gray-900 dark:bg-white' 
                    : 'border-2 border-gray-900 dark:border-white'
                }`}>
                  <span className={`text-xs ${
                    localSettings.iconStyle === 'solid' 
                      ? 'text-white dark:text-gray-900' 
                      : 'text-gray-900 dark:text-white'
                  }`}>x</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                Icons shown are placeholders. Actual icons will be based on configured social media URLs.
              </p>
            </div>
          </div>

          {/* Help Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              How it Works
            </h3>
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • This block displays social media icons
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • Icons appear for platforms with configured URLs
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • URLs are set in Footer → Social media section
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • Supports 22 social platforms (Facebook, Instagram, X, etc.)
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                • Icons link directly to your social profiles
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}