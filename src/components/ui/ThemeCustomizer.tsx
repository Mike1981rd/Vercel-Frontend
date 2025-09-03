'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { useI18n } from '@/contexts/I18nContext';

interface UISettings {
  language: 'es' | 'en';
  theme: 'light' | 'dark';
  notifications: boolean;
  sidebar: {
    color: string;
    textColor: string;
    collapsed: boolean;
  };
  primaryColor: string;
}

const defaultSettings: UISettings = {
  language: 'es',
  theme: 'light',
  notifications: true,
  sidebar: {
    color: '#1a1b2e',
    textColor: '#ffffff',
    collapsed: false,
  },
  primaryColor: '#22c55e', // Hotel Green según blueprint
};

const predefinedColors = [
  { name: 'Materialize Blue', value: '#6366f1' },
  { name: 'Hotel Green', value: '#22c55e' },
  { name: 'Ocean Blue', value: '#0ea5e9' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Indigo', value: '#4f46e5' }, // Changed from #6366f1 to fix duplicate key
];

const sidebarPresets = [
  { name: 'Dark Navy', bg: '#1a1b2e', text: '#ffffff' },
  { name: 'Midnight Blue', bg: '#1e293b', text: '#ffffff' },
  { name: 'Deep Purple', bg: '#4c1d95', text: '#ffffff' },
  { name: 'Forest Green', bg: '#064e3b', text: '#ffffff' },
  { name: 'Charcoal', bg: '#374151', text: '#ffffff' },
  { name: 'Light Gray', bg: '#f8fafc', text: '#1e293b' },
];

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: UISettings) => void;
}

export function ThemeCustomizer({ isOpen, onClose, onSettingsChange }: ThemeCustomizerProps) {
  const [settings, setSettings] = useState<UISettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);
  const { t, language, setLanguage } = useI18n();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('ui-settings');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed, language });
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    } else if (savedTheme) {
      // Fallback: apply saved theme even if no full settings
      setSettings(prev => ({ ...prev, theme: savedTheme as 'light' | 'dark', language }));
    }
  }, [language]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('ui-settings', JSON.stringify(settings));
      onSettingsChange?.(settings);
      
      // Apply CSS custom properties for real-time preview
      const root = document.documentElement;
      root.style.setProperty('--sidebar-bg', settings.sidebar.color);
      root.style.setProperty('--sidebar-text', settings.sidebar.textColor);
      root.style.setProperty('--sidebar-text-secondary', settings.sidebar.textColor === '#ffffff' 
        ? 'rgba(255, 255, 255, 0.7)' 
        : 'rgba(0, 0, 0, 0.7)');
      root.style.setProperty('--sidebar-bg-hover', settings.sidebar.textColor === '#ffffff' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--primary-color', settings.primaryColor);
      root.style.setProperty('--sidebar-active', settings.primaryColor);
      
      // Apply dark mode class
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Save theme to localStorage for persistence
      localStorage.setItem('theme', settings.theme);
    }
  }, [settings, mounted, onSettingsChange]);

  const updateSettings = (updates: Partial<UISettings>) => {
    if (updates.language) {
      setLanguage(updates.language);
    }
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateSidebarSettings = (updates: Partial<UISettings['sidebar']>) => {
    setSettings(prev => ({
      ...prev,
      sidebar: { ...prev.sidebar, ...updates }
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  if (!mounted) return null;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Customizer Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              🔧 {t('theme.customization', 'Personalización')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle>🌍 {t('theme.language', 'Idioma')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ language: 'es' })}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border-2 transition-colors',
                    settings.language === 'es'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="text-lg">🇩🇴</span>
                  <span className="font-medium">{t('theme.spanish', 'Español')}</span>
                </button>
                <button
                  onClick={() => updateSettings({ language: 'en' })}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border-2 transition-colors',
                    settings.language === 'en'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="text-lg">🇺🇸</span>
                  <span className="font-medium">{t('theme.english', 'English')}</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>🎨 {t('theme.theme', 'Tema')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border-2 transition-colors',
                    settings.theme === 'light'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="text-lg">🌞</span>
                  <span className="font-medium">{t('theme.light', 'Light')}</span>
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border-2 transition-colors',
                    settings.theme === 'dark'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="text-lg">🌙</span>
                  <span className="font-medium">{t('theme.dark', 'Dark')}</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Primary Color */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 {t('theme.primaryColor', 'Color Principal')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {predefinedColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateSettings({ primaryColor: color.value })}
                    className={cn(
                      'w-12 h-12 rounded-lg border-2 transition-all',
                      settings.primaryColor === color.value
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-200 hover:scale-105'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="custom-color" className="text-sm font-medium text-gray-700">
                  {t('theme.customColor', 'Color personalizado')}:
                </label>
                <input
                  id="custom-color"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Customization */}
          <Card>
            <CardHeader>
              <CardTitle>📱 {t('theme.sidebar', 'Panel Lateral')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sidebar Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('theme.colorPresets', 'Presets de colores')}:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sidebarPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateSidebarSettings({ 
                        color: preset.bg, 
                        textColor: preset.text 
                      })}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border text-left transition-colors',
                        settings.sidebar.color === preset.bg
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: preset.bg }}
                      />
                      <span className="text-xs font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('theme.backgroundColor', 'Color de fondo')}:
                  </label>
                  <input
                    type="color"
                    value={settings.sidebar.color}
                    onChange={(e) => updateSidebarSettings({ color: e.target.value })}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('theme.textColor', 'Color de texto')}:
                  </label>
                  <input
                    type="color"
                    value={settings.sidebar.textColor}
                    onChange={(e) => updateSidebarSettings({ textColor: e.target.value })}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
              </div>

              {/* Sidebar State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('theme.defaultState', 'Estado por defecto')}:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSidebarSettings({ collapsed: false })}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border transition-colors',
                      !settings.sidebar.collapsed
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-sm">🔓 {t('theme.expanded', 'Expandido')}</span>
                  </button>
                  <button
                    onClick={() => updateSidebarSettings({ collapsed: true })}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border transition-colors',
                      settings.sidebar.collapsed
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-sm">🔒 {t('theme.collapsed', 'Colapsado')}</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>🔔 {t('theme.notifications', 'Notificaciones')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {t('theme.enableNotifications', 'Habilitar notificaciones')}
                </span>
                <button
                  onClick={() => updateSettings({ notifications: !settings.notifications })}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    settings.notifications ? 'bg-primary-500' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={resetToDefaults}
              className="flex-1"
            >
              {t('theme.resetDefaults', 'Restaurar por defecto')}
            </Button>
            <Button
              variant="primary"
              onClick={onClose}
              className="flex-1"
            >
              {t('common.save', 'Guardar cambios')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}