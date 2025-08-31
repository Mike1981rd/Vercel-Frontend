'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TabsNavigation } from '@/components/empresa/TabsNavigation';
import { LocationsConfiguration } from '@/components/empresa/LocationsConfiguration';
import { useI18n } from '@/contexts/I18nContext';

export default function LocationsPage() {
  const { t } = useI18n();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        setPrimaryColor(parsed.primaryColor || '#22c55e');
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }
  }, []);

  return (
    <div className="w-full max-w-xs sm:max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-6">
      {/* Breadcrumbs - Desktop */}
      <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('navigation.dashboard')}
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {t('navigation.locations')}
          </li>
        </ol>
      </nav>
      
      {/* Mobile Title */}
      <div className="sm:hidden mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('navigation.locations')}
        </h1>
      </div>

      {/* Desktop Title */}
      <div className="hidden sm:block mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {t('empresa.title')}
        </h1>
      </div>

      {/* Tabs Navigation */}
      <TabsNavigation />

      {/* Locations Configuration Component */}
      <LocationsConfiguration primaryColor={primaryColor} />
    </div>
  );
}