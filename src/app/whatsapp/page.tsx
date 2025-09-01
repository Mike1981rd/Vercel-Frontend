'use client';

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export default function WhatsAppPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [testPhone, setTestPhone] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(getApiEndpoint('/whatsapp/config'), {
          headers: { 'Authorization': `Bearer ${token || ''}` },
          cache: 'no-store',
        });
        if (!res.ok) { setError(`${t('whatsapp.loadError', 'No se pudo cargar la configuración')} (${res.status})`); return; }
        const body = (await res.json()) as ApiResponse<any>;
        setConfig(body?.data || null);
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Error de red');
      } finally { setLoading(false); }
    };
    load();
  }, [t]);

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiEndpoint('/whatsapp/config/test'), {
        method: 'POST', headers: { 'Authorization': `Bearer ${token || ''}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ testPhoneNumber: testPhone }),
      });
      const body = (await res.json()) as ApiResponse<any>;
      setTestResult(body?.message || (body?.success ? 'OK' : 'Failed'));
    } catch (e: any) { setTestResult(e?.message || 'Error'); } finally { setTesting(false); }
  };

  return (
    <div className="w-full">
      <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li><a href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">{t('navigation.dashboard')}</a></li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">WhatsApp</li>
        </ol>
      </nav>

      <div className="sm:hidden mb-4"><h1 className="text-xl font-semibold text-gray-900 dark:text-white">WhatsApp</h1></div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        {loading ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">{t('common.loading', 'Cargando...')}</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('whatsapp.config', 'Configuración')}</h2>
              {config ? (
                <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto">{JSON.stringify(config, null, 2)}</pre>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('whatsapp.noConfig', 'No hay configuración guardada')}</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('whatsapp.test', 'Probar envío')}</h3>
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <input type="tel" placeholder="Ej: +18095551234" value={testPhone} onChange={e => setTestPhone(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                <button onClick={handleTest} disabled={!testPhone || testing}
                  className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                  {testing ? t('common.testing', 'Probando...') : t('whatsapp.sendTest', 'Enviar mensaje de prueba')}
                </button>
                {testResult && (<span className="text-sm text-gray-700 dark:text-gray-300">{testResult}</span>)}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('whatsapp.testNote', 'Requiere configuración válida del proveedor y webhook funcionando')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

