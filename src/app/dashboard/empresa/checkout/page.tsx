'use client';

import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import { TabsNavigation } from '@/components/empresa/TabsNavigation';
import { CheckoutConfiguration } from '@/components/empresa/CheckoutConfiguration';

export default function EmpresaCheckoutPage() {
  const { t } = useI18n();

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto pl-2 pr-3 sm:px-6 lg:px-8">
        {/* Breadcrumbs - Mobile responsive */}
        <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                {t('navigation.dashboard')}
              </Link>
            </li>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li className="text-gray-700 font-medium dark:text-gray-300">
              {t('navigation.checkout')}
            </li>
          </ol>
        </nav>
        
        {/* Mobile Title - Only shows on mobile */}
        <div className="sm:hidden mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('navigation.checkout')}
          </h1>
        </div>
        
        {/* Tabs Navigation */}
        <div className="overflow-x-auto">
          <TabsNavigation />
        </div>
        
        {/* Checkout Configuration */}
        <div className="mt-4 sm:mt-6">
          <CheckoutConfiguration />
        </div>
      </div>
    </div>
  );
}