'use client';

import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import PaymentsTab from './PaymentsTab';
import { TabsNavigation } from '@/components/empresa/TabsNavigation';

export default function PaymentsPage() {
  const { t } = useI18n();

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Breadcrumbs */}
        <nav className="flex mb-4 text-xs sm:text-sm overflow-x-auto" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 whitespace-nowrap">
            <li>
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                {t('navigation.dashboard')}
              </Link>
            </li>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li className="text-gray-700 font-medium dark:text-gray-300">
              {t('navigation.payments')}
            </li>
          </ol>
        </nav>
        
        {/* Tabs Navigation */}
        <TabsNavigation />
        
        {/* Payments Content */}
        <div className="mt-4 sm:mt-6">
          <PaymentsTab />
        </div>
      </div>
    </div>
  );
}