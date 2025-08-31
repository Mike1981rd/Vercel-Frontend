'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { X, Globe, Home, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShippingZone } from '../ShippingConfiguration';

interface CreateZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateZone: (zone: Omit<ShippingZone, 'id'>) => void;
  primaryColor: string;
}

export function CreateZoneModal({ isOpen, onClose, onCreateZone, primaryColor }: CreateZoneModalProps) {
  const { t } = useI18n();
  const [zoneName, setZoneName] = useState('');
  const [zoneType, setZoneType] = useState<'domestic' | 'international' | 'custom'>('domestic');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['US']);

  const handleCreate = () => {
    if (!zoneName.trim()) {
      return;
    }

    onCreateZone({
      name: zoneName,
      zoneType,
      countries: selectedCountries,
      rates: [],
      isActive: true,
      displayOrder: 0
    });

    // Reset form
    setZoneName('');
    setZoneType('domestic');
    setSelectedCountries(['US']);
  };

  const handleCancel = () => {
    setZoneName('');
    setZoneType('domestic');
    setSelectedCountries(['US']);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('empresa.shipping.createZoneTitle', 'Create Shipping Zone')}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Zone Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('empresa.shipping.zoneName', 'Zone Name')}
                  </label>
                  <input
                    type="text"
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    placeholder={t('empresa.shipping.zoneNamePlaceholder', 'e.g., Europe, Asia Pacific')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    style={{ outline: `2px solid ${primaryColor}` } as React.CSSProperties}
                  />
                </div>

                {/* Zone Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('empresa.shipping.zoneType', 'Zone Type')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setZoneType('domestic')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        zoneType === 'domestic'
                          ? 'border-current bg-opacity-10'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{
                        borderColor: zoneType === 'domestic' ? primaryColor : undefined,
                        backgroundColor: zoneType === 'domestic' ? `${primaryColor}15` : undefined
                      }}
                    >
                      <Home className="h-5 w-5 mb-1" style={{ color: zoneType === 'domestic' ? primaryColor : undefined }} />
                      <span className="text-xs text-center">{t('empresa.shipping.domestic', 'Domestic')}</span>
                    </button>
                    <button
                      onClick={() => setZoneType('international')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        zoneType === 'international'
                          ? 'border-current bg-opacity-10'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{
                        borderColor: zoneType === 'international' ? primaryColor : undefined,
                        backgroundColor: zoneType === 'international' ? `${primaryColor}15` : undefined
                      }}
                    >
                      <Globe className="h-5 w-5 mb-1" style={{ color: zoneType === 'international' ? primaryColor : undefined }} />
                      <span className="text-xs text-center">{t('empresa.shipping.international', 'International')}</span>
                    </button>
                    <button
                      onClick={() => setZoneType('custom')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        zoneType === 'custom'
                          ? 'border-current bg-opacity-10'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{
                        borderColor: zoneType === 'custom' ? primaryColor : undefined,
                        backgroundColor: zoneType === 'custom' ? `${primaryColor}15` : undefined
                      }}
                    >
                      <MapPin className="h-5 w-5 mb-1" style={{ color: zoneType === 'custom' ? primaryColor : undefined }} />
                      <span className="text-xs text-center">{t('empresa.shipping.custom', 'Custom')}</span>
                    </button>
                  </div>
                </div>

                {/* Countries Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('empresa.shipping.countries', 'Countries')}
                  </label>
                  <select
                    value={selectedCountries[0]}
                    onChange={(e) => setSelectedCountries([e.target.value])}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="MX">Mexico</option>
                    <option value="UK">United Kingdom</option>
                    <option value="JP">Japan</option>
                    <option value="CN">China</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="ES">Spain</option>
                    <option value="IT">Italy</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!zoneName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: zoneName.trim() ? primaryColor : '#9ca3af' }}
                >
                  {t('empresa.shipping.createZone', 'Create Zone')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}