'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ThemeCustomizer } from '@/components/ui/ThemeCustomizer';
import { DateRangeProvider } from '@/contexts/DateRangeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle hydration and detect mobile
  useEffect(() => {
    setMounted(true);
    
    // Check if mobile/tablet
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Load sidebar state from localStorage (only for desktop)
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed && window.innerWidth >= 1024) { // lg breakpoint
      setSidebarCollapsed(JSON.parse(savedCollapsed));
    }
    
    // On mobile, always start with menu closed
    if (window.innerWidth < 1024) {
      setMobileMenuOpen(false);
    }
    
    // Load and apply theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed));
    }
  }, [sidebarCollapsed, mounted]);

  const handleSidebarToggle = () => {
    // On mobile/tablet, toggle mobile menu
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      // On desktop, toggle sidebar collapse
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleThemeChange = () => {
    // Toggle between light and dark theme
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  // Remove handleLanguageChange since it's now handled by i18n context

  const handleCustomizerOpen = () => {
    setCustomizerOpen(true);
  };

  const handleCustomizerClose = () => {
    setCustomizerOpen(false);
  };

  const handleSettingsChange = (settings: any) => {
    // Handle settings changes
    console.log('Settings changed:', settings);
    
    // DISABLED: Don't let ThemeCustomizer override sidebar toggle
    // This was causing the flash issue where sidebar would collapse then immediately expand
    // Apply sidebar state if it changed
    // if (settings.sidebar.collapsed !== sidebarCollapsed) {
    //   setSidebarCollapsed(settings.sidebar.collapsed);
    // }
  };

  if (!mounted) {
    // Prevent hydration mismatch by not rendering until mounted
    return null;
  }

  return (
    <DateRangeProvider>
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Sidebar - Use mobile state for mobile, collapsed state for desktop */}
      <Sidebar
        collapsed={isMobile ? !mobileMenuOpen : sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      {/* Main Content Area */}
      <div 
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          // On desktop (lg+), account for sidebar width
          'lg:ml-[320px]',
          sidebarCollapsed && 'lg:ml-[80px]'
        )}
      >
        {/* Navbar */}
        <Navbar
          onSidebarToggle={handleSidebarToggle}
          onThemeChange={handleThemeChange}
          onCustomizeOpen={handleCustomizerOpen}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content - with top padding to account for fixed navbar */}
        <main 
          className={cn(
            'flex-1 pt-16 overflow-x-hidden overflow-y-auto',
            className
          )}
        >
          <div className="pl-1 pr-2 py-3 sm:p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Theme Customizer */}
      <ThemeCustomizer
        isOpen={customizerOpen}
        onClose={handleCustomizerClose}
        onSettingsChange={handleSettingsChange}
      />
    </div>
    </DateRangeProvider>
  );
}

// Hook to use layout context
export function useDashboardLayout() {
  return {
    // Add any layout-related functions here
  };
}
