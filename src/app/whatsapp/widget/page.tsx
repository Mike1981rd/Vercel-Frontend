'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import WhatsAppNav from '../components/WhatsAppNav';
import { 
  ArrowLeft, 
  Palette, 
  MessageCircle,
  Eye,
  Save,
  Loader2,
  Globe
} from 'lucide-react';
import { getApiEndpoint } from '@/lib/api-url';
import { Switch } from '@/components/ui/switch';

interface WidgetConfig {
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  welcomeMessage: string;
  placeholderText: string;
  buttonSize: 'small' | 'medium' | 'large';
  borderRadius: number;
  showOnMobile: boolean;
  showOnDesktop: boolean;
  delaySeconds: number;
  autoOpenSeconds: number;
  isEnabled: boolean; // New field to show/hide on website
}

export default function WhatsAppWidgetPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [config, setConfig] = useState<WidgetConfig>({
    primaryColor: '#22c55e', // Hotel Green por defecto
    position: 'bottom-right',
    welcomeMessage: '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
    placeholderText: 'Escribe un mensaje...',
    buttonSize: 'medium',
    borderRadius: 50,
    showOnMobile: true,
    showOnDesktop: true,
    delaySeconds: 3,
    autoOpenSeconds: 0,
    isEnabled: true // Widget habilitado por defecto
  });

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

  const predefinedColors = [
    { name: 'Hotel Green', value: '#22c55e' },
    { name: 'WhatsApp Green', value: '#25D366' },
    { name: 'Materialize Blue', value: '#2196F3' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#4f46e5' }
  ];

  const buttonSizes = {
    small: { width: 48, height: 48, icon: 20 },
    medium: { width: 60, height: 60, icon: 24 },
    large: { width: 72, height: 72, icon: 28 }
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            <Palette className="inline h-5 w-5 mr-2" />
            Apariencia del Widget
          </h2>

          {/* Color Primario */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color Primario (siguiendo regla del sistema)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setConfig(prev => ({ ...prev, primaryColor: color.value }))}
                  className={`h-10 rounded-lg border-2 transition-all ${
                    config.primaryColor === color.value
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="h-10 w-20"
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="#22c55e"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Este color se aplicará también al sistema completo como color primario
            </p>
          </div>

          {/* Posición */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Posición del Widget
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfig(prev => ({ ...prev, position: 'bottom-right' }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  config.position === 'bottom-right'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-sm">Abajo Derecha</span>
              </button>
              <button
                onClick={() => setConfig(prev => ({ ...prev, position: 'bottom-left' }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  config.position === 'bottom-left'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-sm">Abajo Izquierda</span>
              </button>
            </div>
          </div>

          {/* Tamaño del Botón */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tamaño del Botón
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setConfig(prev => ({ ...prev, buttonSize: size }))}
                  className={`p-3 rounded-lg border-2 transition-all capitalize ${
                    config.buttonSize === size
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-sm">{size === 'small' ? 'Pequeño' : size === 'medium' ? 'Mediano' : 'Grande'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Redondez del Botón: {config.borderRadius}%
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={config.borderRadius}
              onChange={(e) => setConfig(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>

          {/* Mensajes */}
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 mt-8">
            <MessageCircle className="inline h-4 w-4 mr-2" />
            Mensajes de Bienvenida
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensaje de Bienvenida
            </label>
            <textarea
              value={config.welcomeMessage}
              onChange={(e) => setConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="¡Hola! ¿En qué puedo ayudarte?"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Texto del Placeholder
            </label>
            <input
              type="text"
              value={config.placeholderText}
              onChange={(e) => setConfig(prev => ({ ...prev, placeholderText: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Escribe un mensaje..."
            />
          </div>

          {/* Comportamiento */}
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Comportamiento
          </h3>

          {/* Toggle para mostrar/ocultar en página web */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <label htmlFor="widget-enabled" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    Mostrar en página web
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Activa o desactiva el widget de WhatsApp en tu sitio web
                  </p>
                </div>
              </div>
              <Switch
                id="widget-enabled"
                checked={config.isEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isEnabled: checked }))}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.showOnMobile}
                onChange={(e) => setConfig(prev => ({ ...prev, showOnMobile: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Mostrar en móviles</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.showOnDesktop}
                onChange={(e) => setConfig(prev => ({ ...prev, showOnDesktop: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Mostrar en escritorio</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Retraso antes de mostrar (segundos)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={config.delaySeconds}
              onChange={(e) => setConfig(prev => ({ ...prev, delaySeconds: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Auto-abrir chat después de (segundos, 0 = desactivado)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={config.autoOpenSeconds}
              onChange={(e) => setConfig(prev => ({ ...prev, autoOpenSeconds: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            <Eye className="inline h-5 w-5 mr-2" />
            Vista Previa
          </h2>

          {/* Preview Container */}
          <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg h-[600px] overflow-hidden">
            {/* Mock Website */}
            <div className="p-4">
              <div className="bg-white dark:bg-gray-800 rounded p-4 mb-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded p-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>

            {/* WhatsApp Widget Button */}
            {config.isEnabled ? (
              <div
                className={`absolute ${
                  config.position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'
                }`}
              >
                <button
                className="flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
                style={{
                  backgroundColor: config.primaryColor,
                  width: `${buttonSizes[config.buttonSize].width}px`,
                  height: `${buttonSizes[config.buttonSize].height}px`,
                  borderRadius: `${config.borderRadius}%`
                }}
                onClick={() => setShowPreview(!showPreview)}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={buttonSizes[config.buttonSize].icon}
                  height={buttonSizes[config.buttonSize].icon}
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>

              {/* Chat Preview */}
              {showPreview && (
                <div
                  className={`absolute bottom-20 ${
                    config.position === 'bottom-right' ? 'right-0' : 'left-0'
                  } w-80 bg-white rounded-lg shadow-xl`}
                  style={{ borderTop: `4px solid ${config.primaryColor}` }}
                >
                  <div
                    className="p-4 text-white"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    <h3 className="font-semibold">WhatsApp Chat</h3>
                  </div>
                  <div className="p-4">
                    <div className="bg-gray-100 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700">{config.welcomeMessage}</p>
                    </div>
                    <input
                      type="text"
                      placeholder={config.placeholderText}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      readOnly
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Widget deshabilitado - Mostrar mensaje */
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg text-sm">
                Widget deshabilitado
              </div>
            </div>
          )}
          </div>

          {/* Code Snippet */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código para insertar en tu sitio web:
            </h3>
            <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
{`<!-- WhatsApp Widget -->
<script>
  window.whatsappWidget = ${JSON.stringify(config, null, 2)};
</script>
<script src="https://tu-dominio.com/whatsapp-widget.js"></script>`}
            </pre>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}