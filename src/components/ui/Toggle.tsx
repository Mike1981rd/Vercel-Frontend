'use client';

import { useState, useEffect } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  size = 'medium',
  className = ''
}: ToggleProps) {
  const [primaryColor, setPrimaryColor] = useState('#22c55e');

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          toggle: 'w-9 h-5',
          dot: 'w-4 h-4',
          translate: 'translate-x-4'
        };
      case 'large':
        return {
          toggle: 'w-14 h-8',
          dot: 'w-6 h-6',
          translate: 'translate-x-6'
        };
      case 'medium':
      default:
        return {
          toggle: 'w-11 h-6',
          dot: 'w-5 h-5',
          translate: 'translate-x-5'
        };
    }
  };

  const sizes = getSizeClasses();

  return (
    <label className={`flex items-start cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) {
            onChange(!checked);
          }
        }}
        className={`
          relative inline-flex shrink-0 ${sizes.toggle}
          items-center rounded-full transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{
          backgroundColor: checked ? primaryColor : '',
          '--tw-ring-color': primaryColor
        } as any}
      >
        <span
          className={`
            ${checked ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-600'}
            absolute inset-0 rounded-full transition-colors duration-300
          `}
          style={{
            backgroundColor: checked ? primaryColor : ''
          }}
        />
        <span
          className={`
            ${sizes.dot}
            ${checked ? sizes.translate : 'translate-x-0.5'}
            pointer-events-none relative inline-block rounded-full bg-white shadow-lg
            transform ring-0 transition-transform duration-300 ease-in-out
          `}
        />
      </button>
      
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </label>
  );
}