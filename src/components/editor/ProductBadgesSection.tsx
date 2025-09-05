'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  ProductBadgesConfig, 
  BadgeDisplayAs,
  formatBadgeText 
} from '@/types/theme/productBadges';
import { useGlobalSettingsTranslations } from '@/hooks/useEditorTranslations';

interface ProductBadgesSectionProps {
  config: ProductBadgesConfig;
  onChange: (config: ProductBadgesConfig) => void;
}

export function ProductBadgesSection({ config, onChange }: ProductBadgesSectionProps) {
  const { t } = useGlobalSettingsTranslations();
  
  // Ensure all badges and fields exist with default values to match backend requirements
  const ensuredConfig: ProductBadgesConfig = {
    position: config.position || { desktop: 'below-image' },
    soldOut: {
      enabled: config.soldOut?.enabled ?? true,
      background: config.soldOut?.background || '#FFFFFF',
      text: config.soldOut?.text || '#000000',
      displayAs: config.soldOut?.displayAs || undefined,
      textContent: config.soldOut?.textContent || '',
      tag: config.soldOut?.tag || ''
    },
    sale: {
      enabled: config.sale?.enabled ?? true,
      background: config.sale?.background || '#FF0000',
      text: config.sale?.text || '#FFFFFF',
      displayAs: config.sale?.displayAs || 'sale',
      textContent: config.sale?.textContent || '',
      tag: config.sale?.tag || ''
    },
    saleByPrice: {
      enabled: config.saleByPrice?.enabled ?? false,
      background: config.saleByPrice?.background || '#000000',
      text: config.saleByPrice?.text || '#FFFFFF',
      displayAs: config.saleByPrice?.displayAs || 'percentage',
      textContent: config.saleByPrice?.textContent || '',
      tag: config.saleByPrice?.tag || ''
    },
    saleHighlight: {
      enabled: config.saleHighlight?.enabled ?? false,
      textColor: config.saleHighlight?.textColor || '#000000'
    },
    custom1: {
      enabled: config.custom1?.enabled ?? false,
      background: config.custom1?.background || '#FFFFFF',
      text: config.custom1?.text || '#000000',
      displayAs: config.custom1?.displayAs || undefined,
      textContent: config.custom1?.textContent || 'Best seller',
      tag: config.custom1?.tag || ''
    },
    custom2: {
      enabled: config.custom2?.enabled ?? false,
      background: config.custom2?.background || '#FFFFFF',
      text: config.custom2?.text || '#000000',
      displayAs: config.custom2?.displayAs || undefined,
      textContent: config.custom2?.textContent || '',
      tag: config.custom2?.tag || ''
    },
    custom3: {
      enabled: config.custom3?.enabled ?? false,
      background: config.custom3?.background || '#FFFFFF',
      text: config.custom3?.text || '#000000',
      displayAs: config.custom3?.displayAs || undefined,
      textContent: config.custom3?.textContent || '',
      tag: config.custom3?.tag || ''
    }
  };

  const handleBadgeChange = (
    badgeKey: keyof ProductBadgesConfig,
    field: string,
    value: any
  ) => {
    // Create a deep copy of the ensured config to maintain all required fields
    const updatedConfig: ProductBadgesConfig = JSON.parse(JSON.stringify(ensuredConfig));
    
    if (badgeKey === 'position') {
      updatedConfig.position = { ...updatedConfig.position, [field]: value };
    } else if (badgeKey === 'saleHighlight') {
      updatedConfig.saleHighlight = { ...updatedConfig.saleHighlight, [field]: value };
    } else {
      // Ensure the badge maintains all required fields
      const currentBadge = updatedConfig[badgeKey] as any;
      if (currentBadge) {
        currentBadge[field] = value;
        // Ensure all fields remain defined
        currentBadge.enabled = currentBadge.enabled ?? false;
        currentBadge.background = currentBadge.background || '#FFFFFF';
        currentBadge.text = currentBadge.text || '#000000';
        if ('displayAs' in currentBadge) {
          currentBadge.displayAs = currentBadge.displayAs || '';
        }
        if ('textContent' in currentBadge) {
          currentBadge.textContent = currentBadge.textContent || '';
        }
        if ('tag' in currentBadge) {
          currentBadge.tag = currentBadge.tag || '';
        }
      }
    }
    
    onChange(updatedConfig);
  };

  const displayAsOptions: { value: BadgeDisplayAs; label: string }[] = [
    { value: 'sale', label: 'Sale' },
    { value: 'percentage', label: '-10%' },
    { value: 'save-percentage', label: 'Save 10%' },
    { value: 'amount', label: '-$10' },
    { value: 'save-amount', label: 'Save $10' },
  ];

  const renderBadgeSection = (
    title: string,
    badgeKey: keyof ProductBadgesConfig,
    showDisplayAs: boolean = false,
    showCustomText: boolean = false
  ) => {
    const badge = ensuredConfig[badgeKey] as any;
    
    if (!badge) return null;

    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {title}
        </h4>
        
        {/* Show as dropdown for sale badges */}
        {showDisplayAs && (
          <div className="mb-3">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              {t('themeConfig.productBadges.showAs', 'Show as')}
            </label>
            <div className="relative">
              <select
                value={badge.displayAs || 'sale'}
                onChange={(e) => handleBadgeChange(badgeKey, 'displayAs', e.target.value)}
                className="w-full px-3 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {displayAsOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Background color */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('themeConfig.productBadges.background', 'Background')}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="color"
                value={badge.background || '#000000'}
                onChange={(e) => handleBadgeChange(badgeKey, 'background', e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer"
                style={{ backgroundColor: badge.background || '#000000' }}
              />
            </div>
            <input
              type="text"
              value={badge.background || '#000000'}
              onChange={(e) => handleBadgeChange(badgeKey, 'background', e.target.value)}
              className="w-24 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Text color */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('themeConfig.productBadges.text', 'Text')}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="color"
                value={badge.text || badge.textColor || '#FFFFFF'}
                onChange={(e) => handleBadgeChange(badgeKey, badge.textColor !== undefined ? 'textColor' : 'text', e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer"
                style={{ backgroundColor: badge.text || badge.textColor || '#FFFFFF' }}
              />
            </div>
            <input
              type="text"
              value={badge.text || badge.textColor || '#FFFFFF'}
              onChange={(e) => handleBadgeChange(badgeKey, badge.textColor !== undefined ? 'textColor' : 'text', e.target.value)}
              className="w-24 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        {/* Custom text for custom badges */}
        {showCustomText && (
          <>
            <div className="mb-3">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                {t('themeConfig.productBadges.customText', 'Text')}
              </label>
              <input
                type="text"
                value={badge.textContent || ''}
                onChange={(e) => handleBadgeChange(badgeKey, 'textContent', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
                placeholder={badge.label || 'Enter badge text'}
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                {t('themeConfig.productBadges.tag', 'Tag')}
              </label>
              <input
                type="text"
                value={badge.tag || ''}
                onChange={(e) => handleBadgeChange(badgeKey, 'tag', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
                placeholder=""
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        {t('themeConfig.productBadges.description', 
          'Adjust the view and colors for badges. You can turn them on in the "Badges" block on the product page in Theme settings>Product cards.'
        )}
      </p>

      {/* Sold out badge */}
      {renderBadgeSection(
        t('themeConfig.productBadges.soldOut', "'Sold out' badge"),
        'soldOut'
      )}

      {/* Sale badge */}
      {renderBadgeSection(
        t('themeConfig.productBadges.sale', "'Sale' badge"),
        'sale',
        true // showDisplayAs
      )}

      {/* Sale badge next to price */}
      {renderBadgeSection(
        t('themeConfig.productBadges.saleByPrice', "'Sale' badge next to price"),
        'saleByPrice',
        true // showDisplayAs
      )}

      {/* Sale price highlight */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('themeConfig.productBadges.saleHighlight', 'Sale price highlight')}
        </h4>
        <div className="mb-3">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('themeConfig.productBadges.text', 'Text')}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="color"
                value={ensuredConfig.saleHighlight?.textColor || '#000000'}
                onChange={(e) => handleBadgeChange('saleHighlight', 'textColor', e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer"
                style={{ backgroundColor: ensuredConfig.saleHighlight?.textColor || '#000000' }}
              />
            </div>
            <input
              type="text"
              value={ensuredConfig.saleHighlight?.textColor || '#000000'}
              onChange={(e) => handleBadgeChange('saleHighlight', 'textColor', e.target.value)}
              className="w-24 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      {/* Custom badge 1 */}
      {renderBadgeSection(
        t('themeConfig.productBadges.custom1', "'Custom 1' badge"),
        'custom1',
        false, // showDisplayAs
        true   // showCustomText (includes Tag field)
      )}

      {/* Custom badge 2 */}
      {renderBadgeSection(
        t('themeConfig.productBadges.custom2', "'Custom 2' badge"),
        'custom2',
        false, // showDisplayAs
        true   // showCustomText (includes Tag field)
      )}

      {/* Custom badge 3 */}
      {renderBadgeSection(
        t('themeConfig.productBadges.custom3', "'Custom 3' badge"),
        'custom3',
        false, // showDisplayAs
        true   // showCustomText (includes Tag field)
      )}
    </div>
  );
}