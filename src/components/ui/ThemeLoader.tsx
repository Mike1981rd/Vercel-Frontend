'use client';

import { useEffect } from 'react';

export function ThemeLoader() {
  useEffect(() => {
    // Load saved UI settings and apply colors globally
    const savedSettings = localStorage.getItem('ui-settings');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        const root = document.documentElement;
        
        // Apply colors from saved settings
        if (settings.primaryColor) {
          root.style.setProperty('--primary-color', settings.primaryColor);
          root.style.setProperty('--sidebar-active', settings.primaryColor);
        }
        
        if (settings.sidebar?.color) {
          root.style.setProperty('--sidebar-bg', settings.sidebar.color);
        }
        
        if (settings.sidebar?.textColor) {
          root.style.setProperty('--sidebar-text', settings.sidebar.textColor);
          // Calculate secondary colors based on text color
          const isLightText = settings.sidebar.textColor === '#ffffff';
          root.style.setProperty('--sidebar-text-secondary', 
            isLightText ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)');
          root.style.setProperty('--sidebar-bg-hover', 
            isLightText ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
        }
        
        // Apply theme
        if (settings.theme) {
          if (settings.theme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      } catch (error) {
        console.error('Error loading UI settings:', error);
      }
    } else if (savedTheme) {
      // Fallback: apply saved theme even if no full settings
      const root = document.documentElement;
      if (savedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, []);

  return null; // This component doesn't render anything
}