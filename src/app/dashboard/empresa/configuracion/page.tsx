'use client';

import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import { StoreDetailsForm } from '@/components/empresa/StoreDetailsForm';
import { TabsNavigation } from '@/components/empresa/TabsNavigation';

export default function EmpresaConfiguracionPage() {
  const { t, language } = useI18n();

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto py-4 px-4">
        {/* Breadcrumbs */}
        <nav className="flex mb-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                {t('navigation.dashboard')}
              </Link>
            </li>
            <li className="text-gray-400 dark:text-gray-600">/</li>
            <li className="text-gray-700 dark:text-gray-300 font-medium">
              {t('navigation.empresa')}
            </li>
          </ol>
        </nav>
        
        {/* Tabs Navigation */}
        <TabsNavigation />
        
        {/* Store Details Form */}
        <div className="mt-6">
          <StoreDetailsForm />
        </div>
      </div>
    </div>
  );
}