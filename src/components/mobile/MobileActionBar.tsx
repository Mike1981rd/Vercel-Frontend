'use client';

import React from 'react';

export interface ActionButton {
  id: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

interface MobileActionBarProps {
  actions: ActionButton[];
  primaryColor?: string;
  position?: 'fixed' | 'sticky' | 'relative';
  showOnDesktop?: boolean;
  className?: string;
  addBodyPadding?: boolean; // Automatically add padding to body when fixed
}

/**
 * MobileActionBar Component
 * 
 * Renders action buttons with mobile-optimized layout:
 * - Single button: Full width
 * - Two buttons: Side by side with flex-1
 * - Three+ buttons: Stacked vertically
 * 
 * Follows CLAUDE.md mobile patterns section 4.3
 * 
 * IMPORTANT: When using position="fixed", ensure the parent container has 
 * padding-bottom to prevent content from being hidden behind the action bar.
 * Use: pb-24 (96px) on mobile, md:pb-0 on desktop if showOnDesktop is false.
 */
export function MobileActionBar({ 
  actions,
  primaryColor = '#22c55e',
  position = 'fixed',
  showOnDesktop = false,
  className = '',
  addBodyPadding = false
}: MobileActionBarProps) {

  if (actions.length === 0) return null;

  const getButtonStyles = (variant: ActionButton['variant']) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: primaryColor,
          color: 'white',
          className: 'text-white shadow-lg hover:shadow-xl'
        };
      case 'secondary':
        return {
          backgroundColor: '',
          color: '',
          className: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        };
      case 'danger':
        return {
          backgroundColor: '',
          color: '',
          className: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
        };
      case 'success':
        return {
          backgroundColor: '',
          color: '',
          className: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
        };
      default:
        return {
          backgroundColor: primaryColor,
          color: 'white',
          className: 'text-white shadow-lg hover:shadow-xl'
        };
    }
  };

  const positionClasses = {
    fixed: 'fixed bottom-0 left-0 right-0 z-20',
    sticky: 'sticky bottom-0',
    relative: 'relative'
  };

  const renderButton = (action: ActionButton, index: number, isFullWidth: boolean = false) => {
    const styles = getButtonStyles(action.variant);
    const hasCustomStyle = action.variant === 'primary' || !action.variant;

    return (
      <button
        key={action.id}
        onClick={action.onClick}
        disabled={action.disabled || action.loading}
        className={`
          ${isFullWidth ? 'w-full' : 'flex-1'}
          px-4 py-3.5 rounded-xl font-medium
          transition-all active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
          ${styles.className}
        `}
        style={hasCustomStyle ? { backgroundColor: styles.backgroundColor, color: styles.color } : {}}
      >
        {action.loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {action.icon}
            <span>{action.label}</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div 
      className={`
        ${showOnDesktop ? '' : 'md:hidden'}
        ${positionClasses[position]}
        p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700
        ${className}
      `}
    >
      {/* Single Button - Full Width */}
      {actions.length === 1 && (
        <div className="w-full">
          {renderButton(actions[0], 0, true)}
        </div>
      )}

      {/* Two Buttons - Side by Side */}
      {actions.length === 2 && (
        <div className="flex gap-3">
          {actions.map((action, index) => renderButton(action, index))}
        </div>
      )}

      {/* Three or More Buttons - Stacked */}
      {actions.length >= 3 && (
        <div className="flex flex-col gap-2">
          {/* Primary action first, full width */}
          {renderButton(actions[0], 0, true)}
          
          {/* Secondary actions in row if only 2 remaining, otherwise stacked */}
          {actions.length === 3 ? (
            <div className="flex gap-3">
              {actions.slice(1).map((action, index) => renderButton(action, index + 1))}
            </div>
          ) : (
            actions.slice(1).map((action, index) => renderButton(action, index + 1, true))
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to manage action bar state
 */
export function useMobileActions(initialActions: ActionButton[]): {
  actions: ActionButton[];
  updateAction: (id: string, updates: Partial<ActionButton>) => void;
  setLoading: (id: string, loading: boolean) => void;
  setDisabled: (id: string, disabled: boolean) => void;
} {
  const [actions, setActions] = React.useState(initialActions);

  const updateAction = React.useCallback((id: string, updates: Partial<ActionButton>) => {
    setActions(prev => prev.map(action => 
      action.id === id ? { ...action, ...updates } : action
    ));
  }, []);

  const setLoading = React.useCallback((id: string, loading: boolean) => {
    updateAction(id, { loading });
  }, [updateAction]);

  const setDisabled = React.useCallback((id: string, disabled: boolean) => {
    updateAction(id, { disabled });
  }, [updateAction]);

  return { actions, updateAction, setLoading, setDisabled };
}

// Export types for external use
export type { MobileActionBarProps };