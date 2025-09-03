'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';
import { 
  Save, 
  TestTube2, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  HelpCircle,
  Loader2,
  Copy,
  RefreshCw
} from 'lucide-react';

interface GreenApiConfigData {
  instanceId: string;
  apiToken: string;
  phoneNumber: string;
  webhookUrl?: string;
  webhookSecret?: string;
  headerName: string;
  headerValueTemplate: string;
  enableWebhook: boolean;
  autoAcknowledgeMessages: boolean;
  pollingIntervalSeconds: number;
  isActive: boolean;
}

interface ValidationErrors {
  instanceId?: string;
  apiToken?: string;
  phoneNumber?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  headerName?: string;
  headerValueTemplate?: string;
  pollingIntervalSeconds?: string;
}

export default function GreenApiConfig() {
  const { t } = useI18n();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [configExists, setConfigExists] = useState(false);
  
  const [config, setConfig] = useState<GreenApiConfigData>({
    instanceId: '',
    apiToken: '',
    phoneNumber: '',
    webhookUrl: '',
    webhookSecret: '',
    headerName: 'Authorization',
    headerValueTemplate: 'Bearer {secret}',
    enableWebhook: true,
    autoAcknowledgeMessages: true,
    pollingIntervalSeconds: 10,
    isActive: false
  });

  useEffect(() => {
    loadConfiguration();
    generateWebhookUrl();
    // Don't generate a new secret on load - only when creating new config
    // generateWebhookSecret();
  }, []);

  const generateWebhookUrl = () => {
    // Get company ID from localStorage or token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const companyId = payload.companyId || payload.CompanyId || '1';
        const webhookUrl = `https://api.test1hotelwebsite.online/api/whatsapp/webhook/greenapi/${companyId}`;
        setConfig(prev => ({ ...prev, webhookUrl }));
      } catch (error) {
        console.error('Error parsing token:', error);
        // Fallback URL
        setConfig(prev => ({ ...prev, webhookUrl: 'https://api.test1hotelwebsite.online/api/whatsapp/webhook/greenapi/1' }));
      }
    }
  };

  const generateWebhookSecret = () => {
    // Generate a random webhook secret if not already set
    if (!config.webhookSecret) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let secret = '';
      for (let i = 0; i < 32; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setConfig(prev => ({ ...prev, webhookSecret: secret }));
    }
  };

  const loadConfiguration = async () => {
    try {
      // ALWAYS load from backend first, localStorage is just a fallback
      // Comment out localStorage loading to ensure fresh data from backend
      const token = localStorage.getItem('token');
      const res = await fetch(getApiEndpoint('/whatsapp/config'), {
        headers: { 'Authorization': `Bearer ${token || ''}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data?.data) {
          // Mark that config exists for update instead of create
          setConfigExists(true);
          // Transform backend response to frontend model
          console.log('Backend response:', data.data);
          const configData = {
            instanceId: data.data.greenApiInstanceId || data.data.GreenApiInstanceId || '',
            apiToken: data.data.greenApiToken || data.data.GreenApiToken || '',
            phoneNumber: data.data.whatsAppPhoneNumber || data.data.WhatsAppPhoneNumber || '',
            webhookUrl: data.data.webhookUrl || data.data.WebhookUrl || '',
            webhookSecret: data.data.webhookSecret || data.data.WebhookSecret || '',
            headerName: data.data.headerName || data.data.HeaderName || 'Authorization',
            headerValueTemplate: data.data.headerValueTemplate || data.data.HeaderValueTemplate || 'Bearer {secret}',
            enableWebhook: true,
            autoAcknowledgeMessages: true,
            pollingIntervalSeconds: 10,
            isActive: data.data.isActive ?? false
          };
          setConfig(configData);
          // Generate webhook secret ONLY if backend doesn't provide one
          if (!configData.webhookSecret) {
            generateWebhookSecret();
          }
          // Save to localStorage as backup
          localStorage.setItem('greenapi_config', JSON.stringify(configData));
        }
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      // If backend fails, try localStorage
      const savedConfig = localStorage.getItem('greenapi_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    console.log('Validating form with config:', config);
    
    if (!config.instanceId.trim()) {
      newErrors.instanceId = 'Instance ID es requerido';
    } else if (config.instanceId.length > 50) {
      newErrors.instanceId = 'Instance ID no puede exceder 50 caracteres';
    }
    
    if (!config.apiToken.trim()) {
      newErrors.apiToken = 'API Token es requerido';
    } else if (config.apiToken.length > 100) {
      newErrors.apiToken = 'API Token no puede exceder 100 caracteres';
    }
    
    if (!config.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Número de teléfono es requerido';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(config.phoneNumber.replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = 'Formato de teléfono inválido (use formato internacional)';
    }
    
    // Check webhook URL only if it's not the auto-generated one
    if (config.webhookUrl && !config.webhookUrl.startsWith('/webhooks/') && !isValidUrl(config.webhookUrl)) {
      newErrors.webhookUrl = 'URL inválida';
    }
    
    // Removed minimum length requirement - user can use any token they want
    // GreenAPI doesn't enforce a specific length for the authorization header
    
    // Comentado - No necesario para Green API
    // if (!config.headerName || !config.headerName.trim()) {
    //   newErrors.headerName = 'El nombre del header es requerido';
    // }
    
    // if (!config.headerValueTemplate || !config.headerValueTemplate.includes('{secret}')) {
    //   newErrors.headerValueTemplate = 'El template debe contener {secret}';
    // }
    
    if (config.pollingIntervalSeconds < 1 || config.pollingIntervalSeconds > 300) {
      newErrors.pollingIntervalSeconds = 'El intervalo debe estar entre 1 y 300 segundos';
    }
    
    console.log('Validation errors found:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    setTestResult(null);
    
    // Log what we're sending
    console.log('Current config state:', config);
    console.log('WebhookSecret being sent:', config.webhookSecret);
    
    // Transform the config to match backend DTO structure
    const backendConfig = {
      Provider: 'GreenApi',
      GreenApiInstanceId: config.instanceId,
      GreenApiToken: config.apiToken,
      WhatsAppPhoneNumber: config.phoneNumber,
      WebhookUrl: config.webhookUrl || '',
      WebhookSecret: config.webhookSecret || '',
      HeaderName: config.headerName,
      HeaderValueTemplate: config.headerValueTemplate,
      IsActive: config.isActive,
      UseSandbox: false,
      RateLimitPerMinute: 60,
      RateLimitPerHour: 1000,
      MaxRetryAttempts: 3,
      RetryDelayMinutes: 5
    };
    
    // Also save to localStorage with original field names
    localStorage.setItem('greenapi_config', JSON.stringify(config));
    
    try {
      const token = localStorage.getItem('token');
      // Use PUT if we have any existing data (instanceId means config exists)
      const hasExistingConfig = config.instanceId && config.instanceId.length > 0;
      const method = hasExistingConfig || configExists ? 'PUT' : 'POST';
      console.log('Saving config - hasExistingConfig:', hasExistingConfig, 'configExists:', configExists, 'method:', method);
      const res = await fetch(getApiEndpoint('/whatsapp/config'), {
        method: method,
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendConfig)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setTestResult({ success: true, message: 'Configuración guardada exitosamente' });
        // Redirect to chat after successful save
        setTimeout(() => {
          router.push('/whatsapp/chat');
        }, 1500);
      } else {
        setTestResult({ 
          success: false, 
          message: data.message || 'Error al guardar la configuración' 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'Error de conexión al guardar' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    console.log('Test button clicked - Current config:', config);
    if (!validateForm()) {
      console.log('Validation failed, current errors:', errors);
      return;
    }
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiEndpoint('/whatsapp/config/test'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Provider: 'GreenApi',
          GreenApiInstanceId: config.instanceId,
          GreenApiToken: config.apiToken,
          TestPhoneNumber: config.phoneNumber
        })
      });
      
      const data = await res.json();
      console.log('Test response - status:', res.ok, 'data:', data);
      
      const result = {
        success: res.ok,
        message: data.message || (res.ok ? 'Conexión exitosa' : 'Error de conexión')
      };
      console.log('Setting test result:', result);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error al probar la conexión'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field: keyof GreenApiConfigData, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const regenerateWebhookSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setConfig(prev => ({ ...prev, webhookSecret: secret }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="space-y-6">
        {/* Provider Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Green API - WhatsApp Business
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Conecta tu cuenta de WhatsApp Business usando Green API. Necesitarás una instancia activa
            y las credenciales de API correspondientes.
          </p>
          <a
            href="https://green-api.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
          >
            Obtener credenciales en Green API →
          </a>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instance ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Instance ID *
              <button
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600"
                title="Identificador único de tu instancia en Green API"
              >
                <HelpCircle className="h-3 w-3 inline" />
              </button>
            </label>
            <input
              type="text"
              value={config.instanceId}
              onChange={(e) => handleInputChange('instanceId', e.target.value)}
              placeholder="Ej: 1101234567"
              maxLength={50}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${
                errors.instanceId 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
            />
            {errors.instanceId && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.instanceId}</p>
            )}
          </div>

          {/* API Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Token *
              <button
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600"
                title="Token de autenticación para la API de Green API"
              >
                <HelpCircle className="h-3 w-3 inline" />
              </button>
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={config.apiToken}
                onChange={(e) => handleInputChange('apiToken', e.target.value)}
                placeholder="Tu token de API"
                maxLength={100}
                className={`w-full px-3 py-2 pr-10 border rounded-lg dark:bg-gray-700 dark:text-white ${
                  errors.apiToken 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } focus:outline-none focus:ring-2`}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.apiToken && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.apiToken}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número de WhatsApp *
              <button
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600"
                title="Número de teléfono asociado a tu WhatsApp Business (formato internacional)"
              >
                <HelpCircle className="h-3 w-3 inline" />
              </button>
            </label>
            <input
              type="tel"
              value={config.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="+1234567890"
              maxLength={20}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${
                errors.phoneNumber 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phoneNumber}</p>
            )}
          </div>

        </div>

        {/* Webhook Configuration Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Configuración de Webhook
          </h3>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Configura estos valores en tu panel de Green API para recibir mensajes entrantes:
              <br />• <strong>Webhook URL:</strong> Copia la URL de abajo y pégala en Green API
              <br />• <strong>Webhook Secret:</strong> Usa este token como el "Webhook authorization header" en Green API
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Webhook URL (Read-only) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Webhook URL *
                <button
                  type="button"
                  className="ml-1 text-gray-400 hover:text-gray-600"
                  title="Esta es la URL que debes configurar en Green API para recibir mensajes"
                >
                  <HelpCircle className="h-3 w-3 inline" />
                </button>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.webhookUrl || ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(config.webhookUrl || '', 'webhookUrl')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Copiar URL"
                >
                  {copiedField === 'webhookUrl' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Copia esta URL y pégala en la configuración de webhook de tu instancia de Green API
              </p>
            </div>

            {/* Webhook Secret */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Webhook Authorization Header *
                <button
                  type="button"
                  className="ml-1 text-gray-400 hover:text-gray-600"
                  title="Este es el token que debes configurar como 'Webhook authorization header' en Green API"
                >
                  <HelpCircle className="h-3 w-3 inline" />
                </button>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={config.webhookSecret || ''}
                    onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
                    placeholder="Token secreto generado"
                    className={`w-full px-3 py-2 pr-10 border rounded-lg dark:bg-gray-700 dark:text-white ${
                      errors.webhookSecret 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={regenerateWebhookSecret}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Regenerar secret"
                >
                  <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              {errors.webhookSecret && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.webhookSecret}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Copia este token y pégalo como "Webhook authorization header" en la configuración de tu instancia de Green API
              </p>
            </div>

            {/* Hidden fields - set defaults but don't show in UI */}
            {/* These fields are kept for backward compatibility but hidden from UI */}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Configuración Avanzada
          </h3>
          
          {/* Polling Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Intervalo de actualización: {config.pollingIntervalSeconds} segundos
            </label>
            <input
              type="range"
              min="1"
              max="300"
              value={config.pollingIntervalSeconds}
              onChange={(e) => handleInputChange('pollingIntervalSeconds', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>1s (rápido)</span>
              <span>300s (lento)</span>
            </div>
            {errors.pollingIntervalSeconds && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.pollingIntervalSeconds}
              </p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enableWebhook}
                onChange={(e) => handleInputChange('enableWebhook', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Habilitar Webhook para mensajes entrantes
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.autoAcknowledgeMessages}
                onChange={(e) => handleInputChange('autoAcknowledgeMessages', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Marcar mensajes como leídos automáticamente
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Activar servicio de WhatsApp
              </span>
            </label>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`rounded-lg p-4 ${
            testResult.success 
              ? 'bg-green-50 dark:bg-green-900/20' 
              : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <div className="flex items-start">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <p className={`ml-2 text-sm ${
                testResult.success 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {testResult.message}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleTest}
            disabled={testing || saving}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube2 className="h-4 w-4 mr-2" />
            )}
            {testing ? 'Probando...' : 'Probar Conexión'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving || testing}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}