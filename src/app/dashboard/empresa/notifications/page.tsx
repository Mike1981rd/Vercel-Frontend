'use client'

import { TabsNavigation } from '@/components/empresa/TabsNavigation'
import { NotificationsTab } from '@/components/empresa/NotificationsTab'
import { useI18n } from '@/contexts/I18nContext'

export default function NotificationsPage() {
  const { t } = useI18n()

  return (
    <div className="w-full">
      {/* Breadcrumbs - Desktop */}
      <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('navigation.dashboard')}
            </a>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {t('navigation.notifications')}
          </li>
        </ol>
      </nav>

      {/* Mobile Title */}
      <div className="sm:hidden mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('navigation.notifications')}
        </h1>
      </div>

      {/* Tabs Navigation */}
      <TabsNavigation />

      {/* Main Content */}
      <div className="mt-6">
        <NotificationsTab />
      </div>
    </div>
  )
}