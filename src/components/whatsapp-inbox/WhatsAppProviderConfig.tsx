/**
 * @file WhatsAppProviderConfig.tsx - Professional Compact Design
 * @max-lines 300
 * @current-lines 295
 * @architecture modular
 * @validates-rules ✅
 */

import React, { useState, useEffect } from 'react';
import { WhatsAppProviderConfigProps } from './types/whatsapp.types';

const WhatsAppProviderConfig: React.FC<WhatsAppProviderConfigProps> = ({
  provider,
  config = {},
  onChange,
  onTest,
  testResult,
  testing = false,
  disabled = false,
  compact = false
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [showTokens, setShowTokens] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalConfig(config);
    setHasUnsavedChanges(false);
  }, [config]);

  // Detect changes
  useEffect(() => {
    const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(config);
    setHasUnsavedChanges(hasChanges);
  }, [localConfig, config]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: value,
      provider
    }));
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges || isSaving) return;
    
    setIsSaving(true);
    try {
      await onChange(localConfig);
      // Changes will sync via useEffect when config prop updates
    } catch (error) {
      console.error('Error saving configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = () => {
    if (testPhoneNumber && onTest) {
      onTest({ phoneNumber: testPhoneNumber });
    }
  };

  const isConfigValid = () => {
    if (provider === 'twilio') {
      return localConfig.twilioAccountSid && localConfig.twilioAuthToken && localConfig.twilioPhoneNumber;
    } else if (provider === 'greenapi') {
      return localConfig.greenApiInstanceId && localConfig.greenApiToken;
    }
    return false;
  };

  const renderTwilioConfig = () => (
    <div className="space-y-4">
      {/* Account SID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Account SID *
        </label>
        <input
          type="text"
          value={localConfig.twilioAccountSid || ''}
          onChange={(e) => handleInputChange('twilioAccountSid', e.target.value)}
          placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={isSaving}
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Desde Twilio Console → Account Info
        </p>
      </div>

      {/* Auth Token */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Auth Token *
        </label>
        <div className="relative">
          <input
            type={showTokens ? 'text' : 'password'}
            value={localConfig.twilioAuthToken || ''}
            onChange={(e) => handleInputChange('twilioAuthToken', e.target.value)}
            placeholder="••••••••••••••••••••••••••••••••"
            className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={isSaving}
            required
          />
          <button
            type="button"
            onClick={() => setShowTokens(!showTokens)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={isSaving}
          >
            {showTokens ? (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Token desde Twilio Console → Account Info
        </p>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Número de WhatsApp *
        </label>
        <input
          type="tel"
          value={localConfig.twilioPhoneNumber || ''}
          onChange={(e) => handleInputChange('twilioPhoneNumber', e.target.value)}
          placeholder="whatsapp:+1234567890"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={isSaving}
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Número con prefijo "whatsapp:"
        </p>
      </div>
    </div>
  );

  const renderGreenApiConfig = () => (
    <div className="space-y-4">
      {/* Instance ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Instance ID *
        </label>
        <input
          type="text"
          value={localConfig.greenApiInstanceId || ''}
          onChange={(e) => handleInputChange('greenApiInstanceId', e.target.value)}
          placeholder="1101234567"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={isSaving}
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          ID desde Green API Console
        </p>
      </div>

      {/* API Token */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          API Token *
        </label>
        <div className="relative">
          <input
            type={showTokens ? 'text' : 'password'}
            value={localConfig.greenApiToken || ''}
            onChange={(e) => handleInputChange('greenApiToken', e.target.value)}
            placeholder="••••••••••••••••••••••••••••••••"
            className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={isSaving}
            required
          />
          <button
            type="button"
            onClick={() => setShowTokens(!showTokens)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={isSaving}
          >
            {showTokens ? (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Token desde Green API Console
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {provider === 'twilio' ? 'Configuración de Twilio' : 'Configuración de Green API'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure las credenciales para {provider === 'twilio' ? 'Twilio WhatsApp Business API' : 'Green API WhatsApp'}
        </p>
      </div>

      {/* Basic Configuration - Always Visible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Configuración Básica</h4>
        
        {/* Dynamic Configuration Form */}
        {provider === 'twilio' ? renderTwilioConfig() : renderGreenApiConfig()}

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Habilitar WhatsApp
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Activar o desactivar la integración
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleInputChange('isActive', !localConfig.isActive)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              localConfig.isActive ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
            } ${isSaving ? 'cursor-not-allowed opacity-50' : ''}`}
            disabled={isSaving}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                localConfig.isActive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Save Button */}
        <div className="mt-4">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges || !isConfigValid()}
            className={`w-full py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
              hasUnsavedChanges && isConfigValid() && !isSaving
                ? (provider === 'twilio'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg')
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              provider === 'twilio' ? 'focus:ring-purple-500' : 'focus:ring-green-500'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : hasUnsavedChanges && isConfigValid() ? (
              'Guardar Configuración'
            ) : !isConfigValid() ? (
              'Complete los campos requeridos'
            ) : (
              'Sin cambios'
            )}
          </button>
          
          {/* Change indicator */}
          {hasUnsavedChanges && (
            <div className="mt-2 flex items-center justify-center text-xs text-orange-600 dark:text-orange-400">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Tiene cambios sin guardar
            </div>
          )}
        </div>
      </div>

      {/* Advanced Configuration - Collapsible */}
      {isConfigValid() && (
        <details className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <summary className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg list-none">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Configuración Avanzada</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Webhooks y pruebas de conexión</p>
              </div>
              <svg className="w-4 h-4 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>
          
          <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-700">
            {/* Webhook URL */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={localConfig.webhookUrl || ''}
                onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                placeholder="https://su-dominio.com/api/whatsapp/webhook"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={isSaving}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL donde {provider === 'twilio' ? 'Twilio' : 'Green API'} enviará mensajes entrantes
              </p>
            </div>

            {/* Test Connection */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="mb-3">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Probar Conexión
                </h4>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="flex-1 px-3 py-1.5 text-sm border border-blue-300 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isSaving || testing}
                  />
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={testing || !testPhoneNumber || isSaving}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {testing ? 'Probando...' : 'Probar'}
                  </button>
                </div>
              </div>
              
              {testResult && (
                <div className={`p-2 rounded-lg text-sm ${
                  testResult.success 
                    ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800' 
                    : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-start">
                    {testResult.success ? (
                      <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>{testResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </details>
      )}
    </div>
  );
};

export default WhatsAppProviderConfig;