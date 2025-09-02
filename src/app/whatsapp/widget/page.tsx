'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import WhatsAppNav from '../components/WhatsAppNav';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { getApiEndpoint } from '@/lib/api-url';
import WhatsAppWidgetConfig from '@/components/whatsapp/WhatsAppWidgetConfig';
import WhatsAppWidgetPreview from '@/components/whatsapp/WhatsAppWidgetPreview';
import { WidgetConfig, defaultWidgetConfig } from '@/components/whatsapp/WhatsAppWidgetHelpers';

export default function WhatsAppWidgetPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<WidgetConfig>(defaultWidgetConfig);

  useEffect(() => {
    loadWidgetConfig();
    // Cargar color primario del sistema si existe
    const uiSettings = localStorage.getItem('ui-settings');
    if (uiSettings) {
      try {
        const settings = JSON.parse(uiSettings);
        if (settings.primaryColor) {
          setConfig(prev => ({ ...prev, primaryColor: settings.primaryColor }));
        }
      } catch (e) {
        console.error('Error loading UI settings:', e);
      }
    }
  }, []);

  const loadWidgetConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiEndpoint('/whatsapp/widget/config'), {
        headers: { 'Authorization': `Bearer ${token || ''}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data?.data) {
          setConfig(prev => ({ ...prev, ...data.data }));
        }
      }
    } catch (error) {
      console.error('Error loading widget config:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiEndpoint('/whatsapp/widget/config'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      
      if (res.ok) {
        // Actualizar color primario del sistema
        const uiSettings = JSON.parse(localStorage.getItem('ui-settings') || '{}');
        uiSettings.primaryColor = config.primaryColor;
        localStorage.setItem('ui-settings', JSON.stringify(uiSettings));
        
        // Aplicar color al documento
        document.documentElement.style.setProperty('--primary-color', config.primaryColor);
        document.documentElement.style.setProperty('--sidebar-active', config.primaryColor);
        
        alert('Configuración del widget guardada exitosamente');
      }
    } catch (error) {
      console.error('Error saving widget config:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Elegant minimal header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/whatsapp/chat')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
              aria-label="Volver al chat"
            >
              <ArrowLeft className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
            </button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuración del Widget
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Personaliza la apariencia y comportamiento del widget de WhatsApp
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center space-x-2">
            {config.isEnabled ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Widget activo</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Widget desactivado</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 pt-4">
        <WhatsAppNav />
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Settings */}
          <div>
            <WhatsAppWidgetConfig 
              config={config} 
              onConfigChange={setConfig}
              showTitle={true}
            />
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>

          {/* Right Column - Preview */}
          <WhatsAppWidgetPreview config={config} />
        </div>
      </div>
    </div>
  );
}