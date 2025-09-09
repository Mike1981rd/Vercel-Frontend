'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Save, KeyRound, Mail, Info } from 'lucide-react';
import { getApiUrl } from '@/lib/api-url';

type Provider = 'Postmark' | 'SendGrid' | 'Brevo';

interface EmailSettings {
  Provider: Provider;
  FromEmail?: string | null;
  FromName?: string | null;
  hasApiKey?: boolean;
  apiKeyMask?: string;
}

export default function EmailProviderSettings({ className = '' }: { className?: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<EmailSettings>({ Provider: 'Postmark' });
  const [apiKeyInput, setApiKeyInput] = useState('');

  const API = useMemo(() => `${getApiUrl()}/email/settings`, []);

  // Normalize API payload (camelCase vs PascalCase)
  const normalizeSettings = (data: any): EmailSettings => {
    return {
      Provider: (data?.provider ?? data?.Provider ?? 'Postmark') as Provider,
      FromEmail: (data?.fromEmail ?? data?.FromEmail) ?? null,
      FromName: (data?.fromName ?? data?.FromName) ?? null,
      hasApiKey: !!(data?.hasApiKey ?? data?.HasApiKey),
      apiKeyMask: (data?.apiKeyMask ?? data?.ApiKeyMask) ?? undefined,
    };
  };

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(normalizeSettings(data));
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [API]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const payload: any = {
        Provider: settings.Provider,
        // Enviar strings trimmeadas; si quedan vacías, el backend las convierte a null
        FromEmail: (settings.FromEmail ?? '').trim(),
        FromName: (settings.FromName ?? '').trim(),
      };
      if (apiKeyInput.trim()) payload.ApiKey = apiKeyInput.trim();
      const res = await fetch(API, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save email settings');
      // Refetch settings para reflejar inmediatamente en UI
      try {
        const refresh = await fetch(API, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
        if (refresh.ok) {
          const data = await refresh.json();
          setSettings(normalizeSettings(data));
        }
      } catch {}
      // Limpiar input de token si se envió
      if (apiKeyInput.trim()) setApiKeyInput('');
    } catch (e) {
      console.error(e);
      alert('Error al guardar configuración de correo.');
    } finally {
      setSaving(false);
    }
  };

  const mask = (token: string) => {
    const visible = Math.min(4, token.length);
    return `${'*'.repeat(Math.max(0, token.length - visible))}${token.slice(-visible)}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Provider</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configura el proveedor de correos para el sistema</p>
          </div>
        </div>

        {/* Provider selection */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Postmark', 'SendGrid', 'Brevo'] as Provider[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, Provider: p }))}
              className={`px-4 py-2 rounded-lg border text-sm ${settings.Provider === p ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* API Key input */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-gray-900 dark:text-white">Server API Token</label>
          <input
            type="password"
            placeholder={settings.hasApiKey ? `Token configurado (${settings.apiKeyMask})` : `Pega aquí tu API Token de ${settings.Provider}`}
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Info className="w-4 h-4 mt-0.5" />
            <p>
              Este campo es para tu API Key de {settings.Provider}. Es la clave que permite enviar correos desde tu sistema. {settings.Provider === 'Postmark' ? 'Para obtenerla, entra a tu cuenta de Postmark, crea o usa un servidor existente, ve a la pestaña API Tokens, copia el Server API Token y pégalo aquí.' : settings.Provider === 'Brevo' ? 'Para obtenerla, entra a tu cuenta de Brevo, ve a SMTP & API, crea o copia tu API Key y pégala aquí.' : 'Ingresa tu API Key de SendGrid aquí.'} Una vez pegado, todos los correos se enviarán automáticamente con tu configuración de {settings.Provider}.
            </p>
          </div>
        </div>

        {/* From fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2"><Mail className="w-4 h-4" /> From Email</label>
            <input
              type="email"
              placeholder="noreply@tudominio.com"
              value={settings.FromEmail || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, FromEmail: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">From Name</label>
            <input
              type="text"
              placeholder="Nombre de la empresa"
              value={settings.FromName || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, FromName: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
