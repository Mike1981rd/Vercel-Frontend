'use client';

import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import { TabsNavigation } from '@/components/empresa/TabsNavigation';
import { ShippingConfiguration } from '@/components/empresa/ShippingConfiguration';

export default function EmpresaShippingPage() {
  const { t } = useI18n();

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <div className="max-w-xs sm:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs - Desktop only */}
        <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                {t('navigation.dashboard')}
              </Link>
            </li>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li className="text-gray-700 font-medium dark:text-gray-300">
              {t('navigation.shipping')}
            </li>
          </ol>
        </nav>
        
        {/* Mobile Title - Only shows on mobile */}
        <div className="sm:hidden mb-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('navigation.shipping')}
          </h1>
        </div>
        
        {/* Tabs Navigation */}
        <div className="overflow-x-auto">
          <TabsNavigation />
        </div>
        
        {/* Shipping Configuration Component */}
        <div className="mt-4 sm:mt-6">
          <ShippingConfiguration />
        </div>
      </div>
    </div>
  );
}