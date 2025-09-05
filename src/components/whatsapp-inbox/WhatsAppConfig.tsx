/**
 * @file WhatsAppConfig.tsx
 * @max-lines 300
 * @current-lines 280
 * @architecture modular
 * @validates-rules ✅
 */

import React, { useState, useEffect } from 'react';
import { WhatsAppConfigProps, WhatsAppConfig } from './types/whatsapp.types';
import { useWhatsAppAPI } from './hooks/useWhatsAppAPI';

const WhatsAppConfiguration: React.FC<WhatsAppConfigProps> = ({
  config,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Partial<WhatsAppConfig>>({
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    webhookUrl: '',
    isActive: false,
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showToken, setShowToken] = useState(false);
  
  const { testConnection } = useWhatsAppAPI();

  useEffect(() => {
    if (config) {
      setFormData({
        twilioAccountSid: config.twilioAccountSid || '',
        twilioAuthToken: config.twilioAuthToken || '',
        twilioPhoneNumber: config.twilioPhoneNumber || '',
        webhookUrl: config.webhookUrl || '',
        isActive: config.isActive || false,
      });
    }
  }, [config]);

  const handleInputChange = (field: keyof WhatsAppConfig, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setTestResult(null); // Clear test result when form changes
  };

  const handleTestConnection = async () => {
    if (!config?.companyId) {
      setTestResult({
        success: false,
        message: 'No se pudo obtener el ID de la empresa',
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      const isConnected = await testConnection(config.companyId);
      setTestResult({
        success: isConnected,
        message: isConnected 
          ? 'Conexión exitosa con Twilio WhatsApp' 
          : 'Error de conexión. Verifique sus credenciales.',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error al probar la conexión. Inténtelo de nuevo.',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isFormValid = () => {
    return (
      formData.twilioAccountSid &&
      formData.twilioAuthToken &&
      formData.twilioPhoneNumber
    );
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Configuración de WhatsApp
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure su integración con Twilio para habilitar WhatsApp Business.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Twilio Account SID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Twilio Account SID
            </label>
            <input
              type="text"
              value={formData.twilioAccountSid || ''}
              onChange={(e) => handleInputChange('twilioAccountSid', e.target.value)}
              placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Obtenga esto desde su panel de Twilio Console
            </p>
          </div>

          {/* Twilio Auth Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Twilio Auth Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={formData.twilioAuthToken || ''}
                onChange={(e) => handleInputChange('twilioAuthToken', e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showToken ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Token de autenticación desde Twilio Console
            </p>
          </div>

          {/* Twilio Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de WhatsApp Business
            </label>
            <input
              type="tel"
              value={formData.twilioPhoneNumber || ''}
              onChange={(e) => handleInputChange('twilioPhoneNumber', e.target.value)}
              placeholder="whatsapp:+1234567890"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Número de WhatsApp configurado en Twilio (incluir whatsapp: prefix)
            </p>
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={formData.webhookUrl || ''}
              onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
              placeholder="https://tudominio.com/api/whatsapp/webhook"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              URL donde Twilio enviará los mensajes entrantes
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Habilitar WhatsApp
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Activar o desactivar la integración de WhatsApp
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('isActive', !formData.isActive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                formData.isActive ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                  formData.isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Test Connection */}
          {isFormValid() && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Probar Conexión
                </h3>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTestingConnection ? 'Probando...' : 'Probar'}
                </button>
              </div>
              
              {testResult && (
                <div className={`p-3 rounded-md text-sm ${
                  testResult.success 
                    ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800' 
                    : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'
                }`}>
                  <div className="flex">
                    {testResult.success ? (
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {testResult.message}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppConfiguration;