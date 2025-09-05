/**
 * @file PaymentProvidersConfig.tsx
 * @max-lines 300
 * Configuration component for payment providers with custom logo upload
 */

'use client';

import React, { useState } from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { ChevronDown, ChevronUp, Upload } from 'lucide-react';

interface PaymentProvidersConfigProps {
  localConfig: any;
  expandedSections: any;
  toggleSection: (section: string) => void;
  handleNestedChange: (parent: string, field: string, value: any) => void;
}

const defaultProviders = [
  { key: 'visa', label: 'Visa', defaultLogo: '/payment-icons/visa.svg' },
  { key: 'mastercard', label: 'Mastercard', defaultLogo: '/payment-icons/mastercard.svg' },
  { key: 'amex', label: 'American Express', defaultLogo: '/payment-icons/amex.svg' },
  { key: 'discover', label: 'Discover', defaultLogo: '/payment-icons/discover.svg' },
  { key: 'diners', label: 'Diners Club', defaultLogo: '/payment-icons/diners.svg' },
  { key: 'applePay', label: 'Apple Pay', defaultLogo: '/payment-icons/apple-pay.svg' },
  { key: 'googlePay', label: 'Google Pay', defaultLogo: '/payment-icons/google-pay.svg' },
  { key: 'amazonPay', label: 'Amazon Pay', defaultLogo: '/payment-icons/amazon-pay.svg' }
];

export default function PaymentProvidersConfig({
  localConfig,
  expandedSections,
  toggleSection,
  handleNestedChange
}: PaymentProvidersConfigProps) {
  const [uploadingProvider, setUploadingProvider] = useState<string | null>(null);

  const handleLogoUpload = (providerKey: string, logoUrl: string) => {
    const currentLogos = localConfig.bottomBar?.paymentLogos || {};
    handleNestedChange('bottomBar', 'paymentLogos', {
      ...currentLogos,
      [providerKey]: logoUrl
    });
    setUploadingProvider(null);
  };

  const handleToggleProvider = (providerKey: string) => {
    const currentProviders = localConfig.bottomBar?.paymentProviders || {};
    const isCurrentlyEnabled = currentProviders[providerKey] === true;
    handleNestedChange('bottomBar', 'paymentProviders', {
      ...currentProviders,
      [providerKey]: !isCurrentlyEnabled
    });
  };

  return (
    <div>
      <button
        onClick={() => toggleSection('paymentProviders')}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Payment providers
        </span>
        {expandedSections.paymentProviders ? 
          <ChevronUp className="w-3 h-3 text-gray-500" /> : 
          <ChevronDown className="w-3 h-3 text-gray-500" />
        }
      </button>
      
      {expandedSections.paymentProviders && (
        <div className="mt-2 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Show payment icons
            </label>
            <button
              onClick={() => handleNestedChange('bottomBar', 'showPaymentIcons', !localConfig.bottomBar?.showPaymentIcons)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                localConfig.bottomBar?.showPaymentIcons ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                localConfig.bottomBar?.showPaymentIcons ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Individual payment providers */}
          {localConfig.bottomBar?.showPaymentIcons && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select payment methods and customize their logos
              </p>
              
              {defaultProviders.map(provider => {
                const isEnabled = localConfig.bottomBar?.paymentProviders?.[provider.key] === true;
                const customLogo = localConfig.bottomBar?.paymentLogos?.[provider.key];
                
                return (
                  <div key={provider.key} className="border border-gray-200 dark:border-gray-700 rounded-md p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {provider.label}
                      </span>
                      <button
                        onClick={() => handleToggleProvider(provider.key)}
                        className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                          isEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span 
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            isEnabled ? 'translate-x-4' : 'translate-x-1'
                          }`} 
                        />
                      </button>
                    </div>
                    
                    {/* Logo upload section */}
                    {isEnabled && (
                      <div className="mt-2">
                        {uploadingProvider === provider.key ? (
                          <ImageUpload
                            value={customLogo || ''}
                            onChange={(url) => handleLogoUpload(provider.key, url)}
                            label=""
                            maxWidth={120}
                            maxHeight={40}
                            className="text-xs"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            {customLogo ? (
                              <img 
                                src={customLogo} 
                                alt={provider.label}
                                className="h-6 w-auto object-contain"
                              />
                            ) : (
                              <div className="h-6 px-2 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                                <span className="text-[10px] text-gray-500">Default logo</span>
                              </div>
                            )}
                            <button
                              onClick={() => setUploadingProvider(provider.key)}
                              className="text-[10px] text-blue-500 hover:text-blue-600 flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              {customLogo ? 'Change' : 'Upload'} logo
                            </button>
                            {customLogo && (
                              <button
                                onClick={() => handleLogoUpload(provider.key, '')}
                                className="text-[10px] text-red-500 hover:text-red-600"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}