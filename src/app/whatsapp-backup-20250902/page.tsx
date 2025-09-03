'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';
import WhatsAppNav from './components/WhatsAppNav';
import { MessageSquare, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConfigStatus {
  isConfigured: boolean;
  providerName?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export default function WhatsAppPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({ isConfigured: false });

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiEndpoint('/whatsapp/config'), {
        headers: { 'Authorization': `Bearer ${token || ''}` },
        cache: 'no-store',
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data?.data) {
          setConfigStatus({
            isConfigured: true,
            providerName: data.data.providerName || 'Green API',
            phoneNumber: data.data.phoneNumber,
            isActive: data.data.isActive
          });
        }
      }
    } catch (error) {
      console.error('Error checking configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'chat') {
      router.push('/whatsapp/chat');
    } else if (action === 'config') {
      router.push('/whatsapp/config');
    }
  };

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('navigation.dashboard', 'Dashboard')}
            </button>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">WhatsApp</li>
        </ol>
      </nav>

      {/* Mobile Header */}
      <div className="sm:hidden mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">WhatsApp Business</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WhatsApp Business</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gestiona conversaciones con clientes a través de WhatsApp
        </p>
      </div>

      {/* Navigation Tabs */}
      <WhatsAppNav />

      {/* Main Content */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Configuration Status */}
            <div className="mb-6">
              {configStatus.isConfigured ? (
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Configuración activa
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {configStatus.providerName} • {configStatus.phoneNumber}
                      {configStatus.isActive && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Activo
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Configuración requerida
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Configura Green API para empezar a usar WhatsApp
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleQuickAction('chat')}
                disabled={!configStatus.isConfigured}
                className={`
                  flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed
                  transition-all duration-200
                  ${configStatus.isConfigured
                    ? 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Ir a Conversaciones
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ver y responder mensajes
                </span>
              </button>

              <button
                onClick={() => handleQuickAction('config')}
                className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
              >
                <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {configStatus.isConfigured ? 'Editar Configuración' : 'Configurar Green API'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Credenciales y ajustes
                </span>
              </button>
            </div>

            {/* Stats Preview (if configured) */}
            {configStatus.isConfigured && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">--</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Conversaciones activas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">--</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mensajes hoy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">--</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sin leer</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">--</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tiempo respuesta</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}