'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  NavigationConfig,
  SearchDisplayType,
  BackToTopPosition,
  defaultNavigation
} from '@/types/theme/navigation';
import { useGlobalSettingsTranslations } from '@/hooks/useEditorTranslations';

interface NavigationSectionProps {
  config: NavigationConfig;
  onChange: (config: NavigationConfig) => void;
}

// Search display options
const searchDisplayOptions: SearchDisplayType[] = [
  'drawer-and-page',
  'drawer-only', 
  'page-only',
  'none'
];

// Back to top position options
const backToTopPositions: BackToTopPosition[] = [
  'bottom-left',
  'bottom-center',
  'bottom-right'
];

export function NavigationSection({ config, onChange }: NavigationSectionProps) {
  const { t } = useGlobalSettingsTranslations();
  
  // Ensure complete config with defaults
  const ensuredConfig: NavigationConfig = {
    search: {
      showAs: config.search?.showAs || defaultNavigation.search.showAs
    },
    backToTop: {
      showButton: config.backToTop?.showButton ?? defaultNavigation.backToTop.showButton,
      position: config.backToTop?.position || defaultNavigation.backToTop.position
    }
  };

  const handleSearchChange = (showAs: SearchDisplayType) => {
    onChange({
      ...ensuredConfig,
      search: {
        ...ensuredConfig.search,
        showAs
      }
    });
  };

  const handleBackToTopToggle = () => {
    onChange({
      ...ensuredConfig,
      backToTop: {
        ...ensuredConfig.backToTop,
        showButton: !ensuredConfig.backToTop.showButton
      }
    });
  };

  const handlePositionChange = (position: BackToTopPosition) => {
    onChange({
      ...ensuredConfig,
      backToTop: {
        ...ensuredConfig.backToTop,
        position
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('themeConfig.navigation.search.title', 'Search')}
        </h4>
        
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
            {t('themeConfig.navigation.search.showAs', 'Show as')}
          </label>
          <div className="relative">
            <select
              value={ensuredConfig.search.showAs}
              onChange={(e) => handleSearchChange(e.target.value as SearchDisplayType)}
              className="w-full px-3 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {searchDisplayOptions.map((option) => (
                <option key={option} value={option}>
                  {t(`themeConfig.navigation.search.options.${option}`, getSearchDisplayLabel(option))}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Back-to-top Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('themeConfig.navigation.backToTop.title', 'Back-to-top')}
        </h4>

        {/* Show button toggle */}
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-600 dark:text-gray-400">
            {t('themeConfig.navigation.backToTop.showButton', 'Show back-to-top button')}
          </label>
          <button
            onClick={handleBackToTopToggle}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              ensuredConfig.backToTop.showButton ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                ensuredConfig.backToTop.showButton ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Button position */}
        {ensuredConfig.backToTop.showButton && (
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
              {t('themeConfig.navigation.backToTop.position', 'Button position')}
            </label>
            <div className="relative">
              <select
                value={ensuredConfig.backToTop.position}
                onChange={(e) => handlePositionChange(e.target.value as BackToTopPosition)}
                className="w-full px-3 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {backToTopPositions.map((position) => (
                  <option key={position} value={position}>
                    {t(`themeConfig.navigation.backToTop.positions.${position}`, getPositionLabel(position))}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Info text */}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('themeConfig.navigation.backToTop.mobileInfo', 'Always "Bottom left" on mobile')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for labels
function getSearchDisplayLabel(option: SearchDisplayType): string {
  const labels: Record<SearchDisplayType, string> = {
    'drawer-and-page': 'Drawer and page',
    'drawer-only': 'Drawer only',
    'page-only': 'Page only',
    'none': 'None'
  };
  return labels[option];
}

function getPositionLabel(position: BackToTopPosition): string {
  const labels: Record<BackToTopPosition, string> = {
    'bottom-left': 'Bottom left',
    'bottom-center': 'Bottom center',
    'bottom-right': 'Bottom right'
  };
  return labels[position];
}