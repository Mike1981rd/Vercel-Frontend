/**
 * @file WhatsAppStatus.tsx
 * @max-lines 300
 * @current-lines 240
 * @architecture modular
 * @validates-rules ✅
 */

import React from 'react';
import { WhatsAppStatusProps } from './types/whatsapp.types';

const WhatsAppStatus: React.FC<WhatsAppStatusProps> = ({
  status,
  onRefresh,
  refreshing = false
}) => {
  const getStatusColor = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'disconnected':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'testing':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getStatusText = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Error';
      case 'testing':
        return 'Probando...';
      default:
        return 'Desconocido';
    }
  };

  const getProviderDisplayName = (provider: string) => {
    return provider === 'twilio' ? 'Twilio' : 'Green API';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Estado de WhatsApp
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Información del proveedor activo y estado de conexión
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`-ml-0.5 mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Provider Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Proveedor Activo
                </h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getProviderDisplayName(status.provider)}
                </p>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(status.connectionStatus)}`}>
                  {status.connectionStatus === 'connected' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : status.connectionStatus === 'testing' ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Estado de Conexión
                </h4>
                <p className={`text-lg font-semibold ${
                  status.connectionStatus === 'connected' ? 'text-green-600 dark:text-green-400' :
                  status.connectionStatus === 'testing' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {getStatusText(status.connectionStatus)}
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  status.isConfigured 
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                      status.isConfigured 
                        ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                    } />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Configuración
                </h4>
                <p className={`text-lg font-semibold ${
                  status.isConfigured 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {status.isConfigured ? 'Configurado' : 'Pendiente'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages This Month */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Mensajes Este Mes
                </h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {status.messagesThisMonth.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Last Test Result */}
        {status.lastTestResult && (
          <div className="mt-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Última Prueba de Conexión
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {status.lastTestResult}
                  </p>
                  {status.lastTestedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(status.lastTestedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Status Toggle */}
        <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Estado del Servicio
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              WhatsApp está {status.isActive ? 'activado' : 'desactivado'}
            </p>
          </div>
          <div className={`inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            status.isActive ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
          }`}>
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                status.isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppStatus;