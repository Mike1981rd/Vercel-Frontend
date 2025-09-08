'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { DateRangeSelector } from '@/components/ui/DateRangeSelector';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import {
  MenuToggleIcon,
  TranslationIcon,
  ThemeIcon,
  SettingsIcon
} from '@/components/ui/Icons';
import AppNotificationsBell from '@/components/notifications/AppNotificationsBell';

interface NavbarProps {
  onSidebarToggle?: () => void;
  onThemeChange?: () => void;
  onCustomizeOpen?: () => void;
  sidebarCollapsed?: boolean;
  className?: string;
}

export function Navbar({ 
  onSidebarToggle, 
  onThemeChange, 
  onCustomizeOpen,
  sidebarCollapsed = false,
  className 
}: NavbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const { range, setRange, quickOption, setQuickOption } = useDateRange();
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Get contexts and pathname
  const pathname = usePathname();
  const { user: authUser, logout } = useAuth();
  const { t, language, setLanguage } = useI18n();
  
  // Check if we're on dashboard page
  const isDashboard = pathname === '/dashboard';
  
  // Get user role from token
  const getUserRole = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Handle role as array or string
        if (Array.isArray(payload.role)) {
          return payload.role[0] || 'User';
        }
        return payload.role || 'User';
      }
    } catch (error) {
      console.error('Error getting user role:', error);
    }
    return 'User';
  };

  // Use real user data or fallback to mock data
  const user = authUser ? {
    name: authUser.fullName || `${authUser.firstName} ${authUser.lastName}`,
    email: authUser.email,
    avatar: authUser.avatarUrl || null, // Use real avatar URL from user
    role: getUserRole() // Get actual role from token
  } : {
    name: 'Admin User',
    email: 'admin@websitebuilder.com',
    avatar: null,
    role: 'Administrator'
  };

  // Notifications UI is now handled by AppNotificationsBell component (fetches from backend)

  // Quick options for display names
  const quickOptionsLabels = {
    'today': t('dateRange.today', 'Hoy'),
    'yesterday': t('dateRange.yesterday', 'Ayer'),
    'last7days': t('dateRange.last7days', 'Últimos 7 días'),
    'last30days': t('dateRange.last30days', 'Últimos 30 días'),
    'last90days': t('dateRange.last90days', 'Últimos 90 días'),
    'last365days': t('dateRange.last365days', 'Últimos 365 días'),
    'lastMonth': t('dateRange.lastMonth', 'Mes pasado'),
    'last12months': t('dateRange.last12months', 'Últimos 12 meses'),
    'lastYear': t('dateRange.lastYear', 'Año pasado')
  };

  // Format date range for display
  const formatDateRange = () => {
    // If a quick option is selected, show the friendly name
    if (quickOption && quickOptionsLabels[quickOption as keyof typeof quickOptionsLabels]) {
      return quickOptionsLabels[quickOption as keyof typeof quickOptionsLabels];
    }
    
    // Otherwise show the date range
    const start = range.startDate.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
    const end = range.endDate.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  };

  // Handle date range change
  const handleDateRangeChange = (newRange: { startDate: Date; endDate: Date }, newQuickOption?: string) => {
    setRange(newRange);
    setQuickOption(newQuickOption || null);
    console.log('Date range changed:', newRange, 'Quick option:', newQuickOption);
  };

  // Handle logout with loading state
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoggingOut(false);
      setUserMenuOpen(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header 
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300',
        'left-0', // Always full width on mobile and tablets
        sidebarCollapsed ? 'lg:left-[80px]' : 'lg:left-[320px]', // Only adjust on desktop (lg+)
        className
      )}
    >
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Left Section - Mobile menu toggle + Search */}
        <div className="flex items-center gap-4">
          {/* Mobile/Tablet Sidebar Toggle - Always visible on mobile and tablets */}
          <button
            onClick={onSidebarToggle}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
            title="Toggle sidebar"
          >
            <MenuToggleIcon size={20} />
          </button>

          {/* Search Bar */}
          <div className="hidden sm:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder={t('common.search', 'Search [Ctrl + K]')}
                className="w-64 h-10 px-4 pl-10 pr-4 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Dashboard Controls - Only show on dashboard */}
          {isDashboard && (
            <>
              <div className="hidden lg:flex items-center gap-2">
                {/* Date Range Selector */}
                <button
                  onClick={() => setDateRangeOpen(true)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDateRange()}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Export Button */}
                <button className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  {t('common.export', 'Exportar')}
                </button>
              </div>
              
              {/* Separator */}
              <div className="hidden lg:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            </>
          )}
          {/* Language Toggle */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={t('theme.language', 'Change language')}
            >
              <TranslationIcon size={20} />
            </button>

            {/* Language Dropdown */}
            {languageMenuOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    setLanguage('es');
                    setLanguageMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg">🇩🇴</span>
                  <span>{t('theme.spanish', 'Español')}</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage('en');
                    setLanguageMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg">🇺🇸</span>
                  <span>{t('theme.english', 'English')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onThemeChange}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title={t('theme.theme', 'Toggle theme')}
          >
            <ThemeIcon size={20} />
          </button>

          {/* Notifications (real-time from backend) */}
          <AppNotificationsBell />

          {/* Customize Sidebar */}
          <button
            onClick={onCustomizeOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title={t('theme.customization', 'Customize sidebar')}
          >
            <SettingsIcon size={20} />
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={t('common.profile', 'User menu')}
            >
              <Avatar
                name={user.name}
                src={user.avatar || undefined}
                size="sm"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                
                <div className="py-2">
                  <button 
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loggingOut ? (
                      <div className="animate-spin h-4 w-4 border-2 border-error-600 border-t-transparent rounded-full" />
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    )}
                    {loggingOut ? t('auth.loggingOut', 'Logging out...') : t('common.logout', 'Logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Range Selector Modal */}
      <DateRangeSelector
        isOpen={dateRangeOpen}
        value={range}
        onChange={(r, q) => handleDateRangeChange(r, q)}
        onClose={() => setDateRangeOpen(false)}
      />
    </header>
  );
}
