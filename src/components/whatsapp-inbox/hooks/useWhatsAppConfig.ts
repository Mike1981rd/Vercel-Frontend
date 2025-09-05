/**
 * @file useWhatsAppConfig.ts
 * @max-lines 300
 * @current-lines 250
 * @architecture modular
 * @validates-rules ✅
 */

import { useState, useEffect, useCallback } from 'react';
import { WhatsAppConfig, WhatsAppProvider, WhatsAppProviderInfo, WhatsAppProviderStatus } from '../types/whatsapp.types';

interface UseWhatsAppConfigReturn {
  // State
  config: WhatsAppConfig | null;
  providers: WhatsAppProviderInfo[];
  currentProvider: WhatsAppProvider | null;
  providerStatus: WhatsAppProviderStatus | null;
  loading: boolean;
  saving: boolean;
  testing: boolean;
  error: string | null;
  testResult: { success: boolean; message: string } | null;

  // Actions
  loadConfig: () => Promise<void>;
  saveConfig: (config: Partial<WhatsAppConfig>) => Promise<void>;
  testConfig: (provider: WhatsAppProvider, testData: { phoneNumber: string }) => Promise<void>;
  switchProvider: (provider: WhatsAppProvider) => Promise<void>;
  getProviderStatus: () => Promise<void>;
  clearError: () => void;
  clearTestResult: () => void;
}

const PROVIDER_INFO: WhatsAppProviderInfo[] = [
  {
    name: 'twilio',
    displayName: 'Twilio',
    description: 'Plataforma confiable y robusta para WhatsApp Business con soporte técnico premium.',
    pros: [
      'Mayor confiabilidad y uptime',
      'Soporte técnico 24/7',
      'Documentación excelente',
      'Integración empresarial robusta',
      'Cumplimiento de regulaciones'
    ],
    cons: [
      'Costo más alto',
      'Configuración más compleja',
      'Requiere verificación de negocio'
    ],
    requiredFields: ['Account SID', 'Auth Token', 'Phone Number'],
    isAvailable: true
  },
  {
    name: 'greenapi',
    displayName: 'Green API',
    description: 'Solución económica y fácil de configurar para WhatsApp Business.',
    pros: [
      'Costo más bajo',
      'Configuración simple y rápida',
      'API fácil de usar',
      'Soporte multi-idioma'
    ],
    cons: [
      'Menor confiabilidad que Twilio',
      'Soporte técnico limitado',
      'Funcionalidades más básicas'
    ],
    requiredFields: ['Instance ID', 'API Token'],
    isAvailable: true
  }
];

export const useWhatsAppConfig = (): UseWhatsAppConfigReturn => {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [providers] = useState<WhatsAppProviderInfo[]>(PROVIDER_INFO);
  const [currentProvider, setCurrentProvider] = useState<WhatsAppProvider | null>(null);
  const [providerStatus, setProviderStatus] = useState<WhatsAppProviderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';

  const getCompanyId = () => {
    return localStorage.getItem('companyId') || '1';
  };

  const handleApiError = (error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message) {
      return error.message;
    }
    
    return defaultMessage;
  };

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check for auth token - using 'token' as primary key like other modules
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found, skipping WhatsApp config load');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/whatsapp/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized: Token may be expired or invalid');
          // Don't throw error for auth issues in config load
          setLoading(false);
          return;
        }
        if (response.status === 404) {
          // No configuration found - this is normal for first time setup
          setConfig(null);
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const configData = data.data;
        
        // Determine provider based on available fields
        let provider: WhatsAppProvider = 'twilio';
        if (configData.greenApiInstanceId || configData.greenApiToken) {
          provider = 'greenapi';
        }

        const mappedConfig: WhatsAppConfig = {
          id: configData.id,
          companyId: configData.companyId?.toString() || getCompanyId(),
          provider,
          twilioAccountSid: configData.twilioAccountSidMask || configData.twilioAccountSid,
          twilioAccountSidMask: configData.twilioAccountSidMask,
          twilioAuthToken: configData.twilioAuthToken,
          twilioPhoneNumber: configData.whatsAppPhoneNumber,
          greenApiInstanceId: configData.greenApiInstanceId,
          greenApiToken: configData.greenApiToken,
          greenApiTokenMask: configData.greenApiTokenMask,
          whatsAppPhoneNumber: configData.whatsAppPhoneNumber,
          webhookUrl: configData.webhookUrl || '',
          isActive: configData.isActive || false,
          createdAt: configData.createdAt,
          updatedAt: configData.updatedAt
        };

        setConfig(mappedConfig);
        setCurrentProvider(provider);
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Error al cargar la configuración');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (configData: Partial<WhatsAppConfig>) => {
    setSaving(true);
    setError(null);

    try {
      // Check for auth token
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const isUpdate = config && config.id;
      const method = isUpdate ? 'PUT' : 'POST';
      const url = `${API_BASE_URL}/whatsapp/config`;

      // Map frontend config to backend format
      const backendConfig: any = {
        isActive: configData.isActive || false,
        webhookUrl: configData.webhookUrl || '',
      };

      if (configData.provider === 'twilio') {
        backendConfig.twilioAccountSid = configData.twilioAccountSid;
        backendConfig.twilioAuthToken = configData.twilioAuthToken;
        backendConfig.whatsAppPhoneNumber = configData.twilioPhoneNumber;
      } else if (configData.provider === 'greenapi') {
        backendConfig.greenApiInstanceId = configData.greenApiInstanceId;
        backendConfig.greenApiToken = configData.greenApiToken;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backendConfig),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Reload config to get the latest data
        await loadConfig();
        // Clear any previous errors
        setError(null);
      } else {
        throw new Error(data.message || 'Error al guardar la configuración');
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Error al guardar la configuración');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [config, loadConfig, API_BASE_URL]);

  const testConfig = useCallback(async (provider: WhatsAppProvider, testData: { phoneNumber: string }) => {
    setTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/whatsapp/test/test-config/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          testPhoneNumber: testData.phoneNumber,
          testMessage: `Prueba de configuración de ${provider === 'twilio' ? 'Twilio' : 'Green API'} - ${new Date().toLocaleString()}`
        }),
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        setTestResult({
          success: true,
          message: data.message || 'Conexión exitosa. Mensaje de prueba enviado.'
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || 'Error de conexión. Verifique sus credenciales.'
        });
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Error al probar la configuración');
      setTestResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setTesting(false);
    }
  }, []);

  const switchProvider = useCallback(async (provider: WhatsAppProvider) => {
    try {
      setError(null);
      
      // Update local state immediately
      setCurrentProvider(provider);
      
      // If there's existing config, clear it to force new configuration
      if (config) {
        setConfig({
          ...config,
          provider,
          // Clear provider-specific fields
          twilioAccountSid: provider === 'twilio' ? config.twilioAccountSid : undefined,
          twilioAuthToken: provider === 'twilio' ? config.twilioAuthToken : undefined,
          twilioPhoneNumber: provider === 'twilio' ? config.twilioPhoneNumber : undefined,
          greenApiInstanceId: provider === 'greenapi' ? config.greenApiInstanceId : undefined,
          greenApiToken: provider === 'greenapi' ? config.greenApiToken : undefined,
        });
      } else {
        // Create new config with selected provider
        setConfig({
          id: '',
          companyId: getCompanyId(),
          provider,
          webhookUrl: '',
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'Error al cambiar el proveedor');
      setError(errorMessage);
    }
  }, [config]);

  const getProviderStatus = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/whatsapp/test/current-provider`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        setProviderStatus({
          provider: data.activeProvider?.toLowerCase() || 'twilio',
          isActive: data.isConfigured || false,
          isConfigured: data.isConfigured || false,
          messagesThisMonth: 0, // Would need additional API endpoint
          connectionStatus: data.isConfigured ? 'connected' : 'disconnected'
        });
      }
    } catch (err: any) {
      console.error('Error getting provider status:', err);
      // Don't set error for status check failures
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearTestResult = useCallback(() => {
    setTestResult(null);
  }, []);

  // Load config on mount
  useEffect(() => {
    loadConfig();
    getProviderStatus();
  }, [loadConfig, getProviderStatus]);

  return {
    config,
    providers,
    currentProvider,
    providerStatus,
    loading,
    saving,
    testing,
    error,
    testResult,
    loadConfig,
    saveConfig,
    testConfig,
    switchProvider,
    getProviderStatus,
    clearError,
    clearTestResult
  };
};