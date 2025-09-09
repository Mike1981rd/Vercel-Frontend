/**
 * @file page.tsx (WhatsApp Config Dashboard)
 * @max-lines 300
 * @current-lines 150
 * @architecture modular
 * @validates-rules ✅
 */

'use client';

import React, { useEffect, useState } from 'react';
import { WhatsAppConfig } from '@/components/whatsapp-inbox';
import { useWhatsAppAPI } from '@/components/whatsapp-inbox';
import { WhatsAppConfig as WhatsAppConfigType } from '@/components/whatsapp-inbox/types/whatsapp.types';

export default function WhatsAppConfigPage() {
  const [companyId, setCompanyId] = useState<string>('');
  const [config, setConfig] = useState<WhatsAppConfigType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { getConfig, updateConfig } = useWhatsAppAPI();

  // Get company ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCompanyId = localStorage.getItem('companyId');
      if (storedCompanyId) {
        setCompanyId(storedCompanyId);
      }
    }
  }, []);

  // Load configuration
  useEffect(() => {
    if (companyId) {
      loadConfiguration();
    }
  }, [companyId]);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      const configData = await getConfig(companyId);
      setConfig(configData || undefined);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al cargar la configuración'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (configData: Partial<WhatsAppConfigType>) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const updatedConfig = await updateConfig(companyId, configData);
      if (updatedConfig) {
        setConfig(updatedConfig);
        setMessage({
          type: 'success',
          text: 'Configuración guardada exitosamente'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al guardar la configuración'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!companyId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard/whatsapp"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Configuración de WhatsApp
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure la integración con Twilio WhatsApp Business API
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <a
                href="/dashboard/whatsapp"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Volver al Inbox
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'
          }`}>
            <div className="flex">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Configuration Form */}
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <WhatsAppConfig
            config={config}
            onSave={handleSaveConfig}
            loading={isSaving}
          />
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-4">
            ¿Necesitas ayuda?
          </h3>
          <div className="space-y-4 text-sm text-blue-800 dark:text-blue-300">
            <div>
              <h4 className="font-medium mb-2">1. Crear cuenta en Twilio</h4>
              <p>Visita <a href="https://twilio.com" target="_blank" rel="noopener noreferrer" className="underline">twilio.com</a> y crea una cuenta si aún no tienes una.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Configurar WhatsApp Business</h4>
              <p>En el panel de Twilio, ve a Messaging → WhatsApp → Sandbox y configura tu número de WhatsApp Business.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Obtener credenciales</h4>
              <p>Encuentra tu Account SID y Auth Token en el panel principal de Twilio Console.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">4. Configurar Webhook</h4>
              <p>El webhook debe apuntar a: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">https://tudominio.com/api/whatsapp/webhook</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}