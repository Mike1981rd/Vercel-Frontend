/**
 * @file page.tsx (WhatsApp Settings) - Professional Redesign
 * @max-lines 300
 * @current-lines 250
 * @architecture modular
 * @validates-rules ✅
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useWhatsAppConfig } from '../../../components/whatsapp-inbox/hooks/useWhatsAppConfig';
import WhatsAppProviderSelector from '../../../components/whatsapp-inbox/WhatsAppProviderSelector';
import WhatsAppProviderConfig from '../../../components/whatsapp-inbox/WhatsAppProviderConfig';
import WhatsAppStatus from '../../../components/whatsapp-inbox/WhatsAppStatus';
import WhatsAppProviderComparison from '../../../components/whatsapp-inbox/WhatsAppProviderComparison';
import { WhatsAppProvider } from '../../../components/whatsapp-inbox/types/whatsapp.types';

type TabType = 'overview' | 'configuration' | 'comparison';

const WhatsAppSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedProvider, setSelectedProvider] = useState<WhatsAppProvider>('twilio');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const {
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
  } = useWhatsAppConfig();

  // Set initial provider selection
  useEffect(() => {
    if (currentProvider) {
      setSelectedProvider(currentProvider);
    }
  }, [currentProvider]);

  const handleProviderChange = async (provider: WhatsAppProvider) => {
    if (provider !== currentProvider) {
      try {
        await switchProvider(provider);
        setSelectedProvider(provider);
        clearTestResult();
        clearError();
      } catch (error) {
        console.error('Error switching provider:', error);
      }
    } else {
      setSelectedProvider(provider);
    }
  };

  const handleConfigSave = async (configData: any) => {
    try {
      await saveConfig(configData);
      setShowSaveConfirmation(true);
      setTimeout(() => setShowSaveConfirmation(false), 3000);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleTest = async (testData: { phoneNumber: string }) => {
    await testConfig(selectedProvider, testData);
  };

  const getTabClassName = (tabName: TabType) => {
    const baseClass = "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors";
    if (activeTab === tabName) {
      return `${baseClass} bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200`;
    }
    return `${baseClass} text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    providerStatus?.connectionStatus === 'connected' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      providerStatus?.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado</p>
                    <p className={`text-lg font-semibold ${
                      providerStatus?.connectionStatus === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {providerStatus?.connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proveedor</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentProvider === 'twilio' ? 'Twilio' : currentProvider === 'greenapi' ? 'Green API' : 'No configurado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mensajes</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Próximamente</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Details */}
            {providerStatus && (
              <WhatsAppStatus
                status={providerStatus}
                onRefresh={getProviderStatus}
                refreshing={loading}
              />
            )}
            
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                Acciones Rápidas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('configuration')}
                  className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Configurar Proveedor</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Cambiar o configurar WhatsApp</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('comparison')}
                  className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Comparar Proveedores</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Ver diferencias y precios</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'configuration':
        return (
          <div className="flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-300px)]">
            {/* Left Column - Provider Selector */}
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <div className="sticky top-4">
                <WhatsAppProviderSelector
                  selectedProvider={selectedProvider}
                  onProviderChange={handleProviderChange}
                  providers={providers}
                  disabled={saving}
                  compact={true}
                />
              </div>
            </div>
            
            {/* Right Column - Configuration Form */}
            <div className="flex-1 min-w-0">
              <div className="max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
                {selectedProvider ? (
                  <WhatsAppProviderConfig
                    provider={selectedProvider}
                    config={config || {}}
                    onChange={handleConfigSave}
                    onTest={handleTest}
                    testResult={testResult || undefined}
                    testing={testing}
                    disabled={saving}
                    compact={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Selecciona un proveedor para configurar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'comparison':
        return (
          <WhatsAppProviderComparison
            providers={providers}
            selectedProvider={selectedProvider}
            onSelectProvider={handleProviderChange}
          />
        );


      default:
        return null;
    }
  };

  if (loading && !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configuración de WhatsApp
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Configure y administre su integración de WhatsApp Business
            </p>
          </div>
          
          {showSaveConfirmation && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm" role="alert">
              <span className="block sm:inline">¡Configuración guardada exitosamente!</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm" role="alert">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="flex-1">{error}</span>
            <button
              onClick={clearError}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-2" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={getTabClassName('overview')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Resumen
          </button>
          
          <button
            onClick={() => setActiveTab('configuration')}
            className={getTabClassName('configuration')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuración
          </button>
          
          <button
            onClick={() => setActiveTab('comparison')}
            className={getTabClassName('comparison')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Comparación
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px] max-h-[calc(100vh-200px)] overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default WhatsAppSettingsPage;