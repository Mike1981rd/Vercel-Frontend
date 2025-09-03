'use client';

import React from 'react';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string; // Label for mobile view
  hideOnMobile?: boolean; // Hide this field on mobile
  priority?: 'high' | 'medium' | 'low'; // Display priority on mobile
}

interface ResponsiveTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  primaryColor?: string;
  className?: string;
  // Mobile card customization
  mobileCardRender?: (item: T) => React.ReactNode;
  showMobileActions?: boolean;
  mobileActions?: (item: T) => React.ReactNode;
}

/**
 * ResponsiveTable Component
 * 
 * Automatically renders:
 * - Mobile (<640px): Stacked cards with key information
 * - Desktop (≥640px): Traditional table layout
 * 
 * Follows CLAUDE.md mobile patterns section 4.4
 */
export function ResponsiveTable<T extends { id?: string | number }>({ 
  data, 
  columns,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false,
  primaryColor = '#22c55e',
  className = '',
  mobileCardRender,
  showMobileActions = true,
  mobileActions
}: ResponsiveTableProps<T>) {

  // Sort columns by priority for mobile display
  const mobileColumns = columns
    .filter(col => !col.hideOnMobile)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];
      return aPriority - bPriority;
    });

  // Get primary columns for mobile card header (high priority)
  const primaryColumns = mobileColumns.filter(col => col.priority === 'high').slice(0, 2);
  const secondaryColumns = mobileColumns.filter(col => col.priority !== 'high');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24" style={{ color: primaryColor }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  const getValue = (item: T, key: string) => {
    const keys = key.split('.');
    let value: any = item;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  };

  return (
    <>
      {/* MOBILE VIEW - Stacked Cards */}
      <div className={`sm:hidden px-4 space-y-3 ${className}`}>
        {data.map((item, index) => (
          <div key={item.id || index}>
            {mobileCardRender ? (
              mobileCardRender(item)
            ) : (
              <div 
                onClick={() => onRowClick?.(item)}
                className={`
                  bg-white dark:bg-gray-800 rounded-xl p-4 
                  border border-gray-200 dark:border-gray-700
                  ${onRowClick ? 'active:scale-[0.98] transition-transform cursor-pointer' : ''}
                `}
              >
                {/* Card Header - Primary Info */}
                {primaryColumns.length > 0 && (
                  <div className="flex justify-between items-start mb-3">
                    {primaryColumns.map((col, idx) => {
                      const value = getValue(item, col.key);
                      const rendered = col.render ? col.render(value, item) : value;
                      
                      return (
                        <div key={col.key} className={idx === 0 ? 'flex-1' : ''}>
                          {idx === 0 ? (
                            <span className="font-medium text-gray-900 dark:text-white text-base">
                              {rendered}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {rendered}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Card Body - Secondary Info */}
                <div className="space-y-2">
                  {secondaryColumns.slice(0, 3).map(col => {
                    const value = getValue(item, col.key);
                    const rendered = col.render ? col.render(value, item) : value;
                    
                    return (
                      <div key={col.key} className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          {col.mobileLabel || col.label}:
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {rendered}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Card Actions */}
                {showMobileActions && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {mobileActions ? (
                      mobileActions(item)
                    ) : (
                      <button 
                        className="text-sm font-medium transition-colors"
                        style={{ color: primaryColor }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick?.(item);
                        }}
                      >
                        View Details →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW - Traditional Table */}
      <div className={`hidden sm:block ${className}`}>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`
                      px-6 py-3 text-left text-xs font-medium 
                      text-gray-500 dark:text-gray-400 uppercase tracking-wider
                      ${column.className || ''}
                    `}
                  >
                    {column.sortable ? (
                      <button className="group inline-flex items-center">
                        {column.label}
                        <svg className="ml-2 h-4 w-4 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((item, index) => (
                <tr 
                  key={item.id || index}
                  onClick={() => onRowClick?.(item)}
                  className={`
                    ${onRowClick ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : ''}
                    transition-colors
                  `}
                >
                  {columns.map(column => {
                    const value = getValue(item, column.key);
                    const rendered = column.render ? column.render(value, item) : value;
                    
                    return (
                      <td 
                        key={column.key}
                        className={`
                          px-6 py-4 whitespace-nowrap text-sm 
                          text-gray-900 dark:text-white
                          ${column.className || ''}
                        `}
                      >
                        {rendered}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// Export types for external use
export type { ResponsiveTableProps };