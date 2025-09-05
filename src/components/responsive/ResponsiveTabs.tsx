'use client';

import React from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: string | React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface ResponsiveTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  primaryColor: string;
  className?: string;
}

/**
 * ResponsiveTabs Component
 * 
 * Automatically renders:
 * - Mobile (<640px): Vertical stacked tabs with active tab highlighted
 * - Desktop (≥640px): Traditional horizontal tabs
 * 
 * Follows CLAUDE.md mobile patterns section 4.1
 */
export function ResponsiveTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  primaryColor,
  className = ''
}: ResponsiveTabsProps) {
  
  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const otherTabs = tabs.filter(tab => tab.id !== activeTab);

  return (
    <>
      {/* MOBILE VIEW - Vertical Stack Pattern */}
      <div className={`sm:hidden ${className}`}>
        {/* Active Tab Header - Highlighted */}
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div 
            className="flex items-center justify-between px-4 py-3 rounded-xl text-white font-medium shadow-sm transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              {activeTabData?.icon && (
                <span className="text-xl">
                  {typeof activeTabData.icon === 'string' ? activeTabData.icon : activeTabData.icon}
                </span>
              )}
              <span className="text-base">{activeTabData?.label}</span>
              {activeTabData?.badge && (
                <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full">
                  {activeTabData.badge}
                </span>
              )}
            </div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Other Tabs as Vertical List */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 space-y-2">
          {otherTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                w-full flex items-center justify-between px-4 py-3.5 
                bg-white dark:bg-gray-800 rounded-xl 
                border border-gray-200 dark:border-gray-700 
                transition-all group
                ${tab.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:border-gray-300 dark:hover:border-gray-600 active:scale-[0.98]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {tab.icon && (
                  <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">
                    {typeof tab.icon === 'string' ? tab.icon : tab.icon}
                  </span>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tab.label}
                </span>
                {tab.badge && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
              <svg 
                className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* DESKTOP VIEW - Horizontal Tabs */}
      <div className={`hidden sm:block ${className}`}>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap 
                  transition-colors inline-flex items-center gap-2
                  ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  ${activeTab === tab.id
                    ? 'border-current text-current'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
                style={activeTab === tab.id ? { 
                  color: primaryColor, 
                  borderColor: primaryColor 
                } : {}}
              >
                {tab.icon && (
                  <span className="text-lg">
                    {typeof tab.icon === 'string' ? tab.icon : tab.icon}
                  </span>
                )}
                {tab.label}
                {tab.badge && (
                  <span 
                    className="ml-2 px-2 py-0.5 text-xs rounded-full"
                    style={activeTab === tab.id 
                      ? { backgroundColor: `${primaryColor}20`, color: primaryColor }
                      : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                    }
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

// Export type for external use
export type { ResponsiveTabsProps };