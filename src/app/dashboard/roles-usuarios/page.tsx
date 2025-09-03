'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import { RolesTab } from '@/components/roles-usuarios/RolesTab';
import { UsersTab } from '@/components/roles-usuarios/UsersTab';
import { UsersIcon, ShieldIcon } from 'lucide-react';

export default function RolesUsuariosPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [primaryColor, setPrimaryColor] = useState('#22c55e');

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  return (
    <div className="w-full min-h-screen">
      {/* Breadcrumbs - Desktop */}
      <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('navigation.dashboard', 'Dashboard')}
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {t('navigation.rolesUsuarios', 'Roles & Users')}
          </li>
        </ol>
      </nav>

      {/* Mobile Title - Centered */}
      <div className="sm:hidden mb-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('navigation.rolesUsuarios', 'Roles & Users')}
        </h1>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        {/* Header - Hidden on mobile since we have the centered title */}
        <div className="hidden sm:block p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                {t('rolesUsers.title', 'Roles & Users Management')}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('rolesUsers.description', 'Manage system roles and user permissions')}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs - Centered on mobile */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-center sm:justify-start overflow-x-auto">
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'roles'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'
              }`}
              style={{
                borderBottomColor: activeTab === 'roles' ? primaryColor : 'transparent'
              }}
            >
              <ShieldIcon className="w-4 h-4" />
              {t('rolesUsers.tabs.roles', 'Roles')}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'
              }`}
              style={{
                borderBottomColor: activeTab === 'users' ? primaryColor : 'transparent'
              }}
            >
              <UsersIcon className="w-4 h-4" />
              {t('rolesUsers.tabs.users', 'Users')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'roles' && <RolesTab primaryColor={primaryColor} />}
          {activeTab === 'users' && <UsersTab primaryColor={primaryColor} />}
        </div>
      </div>
    </div>
  );
}