/**
 * @file WhatsAppProviderComparison.tsx
 * @max-lines 300
 * @current-lines 260
 * @architecture modular
 * @validates-rules ✅
 */

import React from 'react';
import { WhatsAppProviderComparisonProps } from './types/whatsapp.types';

const WhatsAppProviderComparison: React.FC<WhatsAppProviderComparisonProps> = ({
  providers,
  selectedProvider,
  onSelectProvider
}) => {
  const comparisonFeatures = [
    { 
      feature: 'Confiabilidad', 
      twilio: 'Excelente (99.95% uptime)', 
      greenapi: 'Buena (99.5% uptime)',
      icon: 'shield-check'
    },
    { 
      feature: 'Soporte Técnico', 
      twilio: '24/7 Premium Support', 
      greenapi: 'Email support',
      icon: 'support'
    },
    { 
      feature: 'Costo por Mensaje', 
      twilio: '$0.05 - $0.10', 
      greenapi: '$0.02 - $0.05',
      icon: 'currency-dollar'
    },
    { 
      feature: 'Límites de Envío', 
      twilio: 'Sin límite (con aprobación)', 
      greenapi: '100-1000 msgs/día',
      icon: 'clock'
    },
    { 
      feature: 'Configuración', 
      twilio: 'Compleja (requiere verificación)', 
      greenapi: 'Simple (5 minutos)',
      icon: 'cog'
    },
    { 
      feature: 'Documentación', 
      twilio: 'Excelente + SDKs', 
      greenapi: 'Básica',
      icon: 'document-text'
    },
    { 
      feature: 'Multimedia', 
      twilio: 'Soporte completo', 
      greenapi: 'Soporte básico',
      icon: 'photograph'
    },
    { 
      feature: 'Webhooks', 
      twilio: 'Avanzados + validación', 
      greenapi: 'Básicos',
      icon: 'link'
    }
  ];

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, string> = {
      'shield-check': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      'support': 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.944a11.955 11.955 0 00-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622a12.02 12.02 0 00-.382-2.016A11.955 11.955 0 0012 2.944z',
      'currency-dollar': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'clock': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'cog': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'document-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'photograph': 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      'link': 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
    };
    return iconMap[iconName] || iconMap['cog'];
  };

  const getBadgeColor = (provider: string, feature: string) => {
    const isSelected = selectedProvider === provider;
    
    // Color coding based on advantages
    if ((provider === 'twilio' && ['Confiabilidad', 'Soporte Técnico', 'Documentación', 'Multimedia', 'Webhooks'].includes(feature)) ||
        (provider === 'greenapi' && ['Costo por Mensaje', 'Configuración'].includes(feature))) {
      return isSelected 
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
        : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-700';
    }
    
    return isSelected
      ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
      : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
  };

  const twilioProvider = providers.find(p => p.name === 'twilio');
  const greenApiProvider = providers.find(p => p.name === 'greenapi');

  if (!twilioProvider || !greenApiProvider) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No se pudieron cargar los proveedores para comparación.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Comparación de Proveedores
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Compare las características de cada proveedor para tomar la mejor decisión para su negocio.
        </p>
      </div>

      {/* Provider Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Twilio Summary */}
        <div className={`rounded-lg border-2 p-6 transition-colors ${
          selectedProvider === 'twilio'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        } ${!!onSelectProvider ? 'cursor-pointer' : ''}`}
        onClick={() => onSelectProvider && onSelectProvider('twilio')}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              Twilio
            </h4>
            {/* Configuration status badge would go here if provider status was available */}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {twilioProvider.description}
          </p>
          <div className="space-y-2">
            <div className="text-xs font-medium text-green-700 dark:text-green-300">Mejor para:</div>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Empresas que priorizan la confiabilidad</li>
              <li>• Negocios con alto volumen de mensajes</li>
              <li>• Integraciones complejas y empresariales</li>
            </ul>
          </div>
        </div>

        {/* Green API Summary */}
        <div className={`rounded-lg border-2 p-6 transition-colors ${
          selectedProvider === 'greenapi'
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        } ${!!onSelectProvider ? 'cursor-pointer' : ''}`}
        onClick={() => onSelectProvider && onSelectProvider('greenapi')}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              Green API
            </h4>
            {/* Configuration status badge would go here if provider status was available */}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {greenApiProvider.description}
          </p>
          <div className="space-y-2">
            <div className="text-xs font-medium text-green-700 dark:text-green-300">Mejor para:</div>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Pequeñas y medianas empresas</li>
              <li>• Presupuestos limitados</li>
              <li>• Implementación rápida y simple</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Comparación Detallada
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Característica
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Twilio
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Green API
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {comparisonFeatures.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-gray-400 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={getIcon(item.icon)}
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.feature}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      getBadgeColor('twilio', item.feature)
                    }`}>
                      {item.twilio}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      getBadgeColor('greenapi', item.feature)
                    }`}>
                      {item.greenapi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h5 className="text-sm font-medium text-blue-900 dark:text-blue-200">
              Nuestra Recomendación
            </h5>
            <div className="mt-2 text-sm text-blue-800 dark:text-blue-300">
              <p className="mb-2">
                <strong>Elige Twilio si:</strong> Tu empresa maneja más de 1,000 mensajes al mes, necesitas máxima confiabilidad, 
                o requieres funciones avanzadas como templates aprobados por WhatsApp.
              </p>
              <p>
                <strong>Elige Green API si:</strong> Eres una pequeña empresa, buscas una solución económica, 
                o quieres empezar rápidamente sin procesos complejos de verificación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppProviderComparison;