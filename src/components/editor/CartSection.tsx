'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  CartConfig, 
  CartDrawerType,
  CartDrawerTypeLabels,
  defaultCart
} from '@/types/theme/cart';
import { useGlobalSettingsTranslations } from '@/hooks/useEditorTranslations';

interface CartSectionProps {
  config: CartConfig;
  onChange: (config: CartConfig) => void;
}

export function CartSection({ config, onChange }: CartSectionProps) {
  const { t } = useGlobalSettingsTranslations();
  
  // Ensure complete config with defaults
  const ensuredConfig: CartConfig = {
    drawerType: config.drawerType || defaultCart.drawerType,
    showStickyCart: config.showStickyCart ?? defaultCart.showStickyCart,
    cartStatusColors: {
      background: config.cartStatusColors?.background || defaultCart.cartStatusColors!.background,
      text: config.cartStatusColors?.text || defaultCart.cartStatusColors!.text
    },
    freeShipping: {
      showProgress: config.freeShipping?.showProgress ?? defaultCart.freeShipping.showProgress,
      threshold: config.freeShipping?.threshold ?? defaultCart.freeShipping.threshold,
      progressBarColor: config.freeShipping?.progressBarColor || defaultCart.freeShipping.progressBarColor,
      successMessage: config.freeShipping?.successMessage || defaultCart.freeShipping.successMessage,
      progressMessage: config.freeShipping?.progressMessage || defaultCart.freeShipping.progressMessage
    }
  };

  const handleChange = (field: string, value: any) => {
    const updatedConfig = JSON.parse(JSON.stringify(ensuredConfig));
    
    if (field === 'drawerType') {
      updatedConfig.drawerType = value;
    } else if (field === 'showStickyCart') {
      updatedConfig.showStickyCart = value;
    } else if (field.startsWith('cartStatusColors.')) {
      const colorField = field.split('.')[1];
      updatedConfig.cartStatusColors[colorField] = value;
    } else if (field.startsWith('freeShipping.')) {
      const fsField = field.split('.')[1];
      updatedConfig.freeShipping[fsField] = value;
    }
    
    onChange(updatedConfig);
  };

  return (
    <div className="space-y-4">
      {/* Show as dropdown */}
      <div>
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          {t('themeConfig.cart.showAs', 'Show as')}
        </label>
        <button className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-2">
          {t('themeConfig.cart.learnAbout', 'Learn about')} {t('themeConfig.cart.cartView', 'cart view')}
        </button>
        <div className="relative">
          <select
            value={ensuredConfig.drawerType}
            onChange={(e) => handleChange('drawerType', e.target.value as CartDrawerType)}
            className="w-full px-3 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {Object.entries(CartDrawerTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {t(`themeConfig.cart.drawerTypes.${value}`, label)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Show sticky cart toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-600 dark:text-gray-400">
          {t('themeConfig.cart.showStickyCart', 'Show sticky cart')}
        </label>
        <button
          onClick={() => handleChange('showStickyCart', !ensuredConfig.showStickyCart)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            ensuredConfig.showStickyCart ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              ensuredConfig.showStickyCart ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Cart status colors */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('themeConfig.cart.cartStatusColors', 'Cart status colors')}
        </h4>
        
        {/* Background color */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('themeConfig.cart.background', 'Background')}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="color"
                value={ensuredConfig.cartStatusColors?.background || '#F0FF2E'}
                onChange={(e) => handleChange('cartStatusColors.background', e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer"
                style={{ backgroundColor: ensuredConfig.cartStatusColors?.background || '#F0FF2E' }}
              />
            </div>
            <input
              type="text"
              value={ensuredConfig.cartStatusColors?.background || '#F0FF2E'}
              onChange={(e) => handleChange('cartStatusColors.background', e.target.value)}
              className="w-24 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
              placeholder="#F0FF2E"
            />
          </div>
        </div>

        {/* Text color */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('themeConfig.cart.text', 'Text')}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="color"
                value={ensuredConfig.cartStatusColors?.text || '#383933'}
                onChange={(e) => handleChange('cartStatusColors.text', e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer"
                style={{ backgroundColor: ensuredConfig.cartStatusColors?.text || '#383933' }}
              />
            </div>
            <input
              type="text"
              value={ensuredConfig.cartStatusColors?.text || '#383933'}
              onChange={(e) => handleChange('cartStatusColors.text', e.target.value)}
              className="w-24 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
              placeholder="#383933"
            />
          </div>
        </div>
      </div>

      {/* Free shipping bar */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('themeConfig.cart.freeShippingBar', 'Free shipping bar')}
        </h4>

        {/* Show progress bar toggle */}
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-gray-600 dark:text-gray-400">
            {t('themeConfig.cart.showProgressBar', 'Show progress bar')}
          </label>
          <button
            onClick={() => handleChange('freeShipping.showProgress', !ensuredConfig.freeShipping.showProgress)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              ensuredConfig.freeShipping.showProgress ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                ensuredConfig.freeShipping.showProgress ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Free shipping goal */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('themeConfig.cart.freeShippingGoal', 'Free shipping goal')}
          </label>
          <input
            type="number"
            value={ensuredConfig.freeShipping.threshold}
            onChange={(e) => handleChange('freeShipping.threshold', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
            placeholder="0"
            min="0"
            step="0.01"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('themeConfig.cart.freeShippingNote', 'Fill in the value in your store\'s main currency. Set up your ')}
            <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              {t('themeConfig.cart.shippingRate', 'shipping rate')}
            </a>
            {t('themeConfig.cart.orAutomatic', ' or ')}
            <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              {t('themeConfig.cart.automaticFreeShipping', 'automatic free shipping discount')}
            </a>
            {t('themeConfig.cart.toMatchGoal', ' to match the goal.')}
          </p>
        </div>

        {/* Progress bar color */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('themeConfig.cart.progressBar', 'Progress bar')}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="color"
                value={ensuredConfig.freeShipping.progressBarColor}
                onChange={(e) => handleChange('freeShipping.progressBarColor', e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer"
                style={{ backgroundColor: ensuredConfig.freeShipping.progressBarColor }}
              />
            </div>
            <input
              type="text"
              value={ensuredConfig.freeShipping.progressBarColor}
              onChange={(e) => handleChange('freeShipping.progressBarColor', e.target.value)}
              className="w-24 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
              placeholder="#383933"
            />
          </div>
        </div>

        {/* Progress bar gradient */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('themeConfig.cart.progressBarGradient', 'Progress bar gradient')}
          </label>
          <div className="relative">
            <select
              className="w-full px-3 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              defaultValue="degraded"
            >
              <option value="degraded">
                {t('themeConfig.cart.degraded', 'Degradado...')}
              </option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Message text - Currently using default color, can be made configurable if needed */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('themeConfig.cart.message', 'Message')}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="color"
                value="#383933"
                onChange={() => {}} // Read-only for now
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer"
                style={{ backgroundColor: '#383933' }}
              />
            </div>
            <input
              type="text"
              value="#383933"
              onChange={() => {}} // Read-only for now
              className="w-24 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
              placeholder="#383933"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}