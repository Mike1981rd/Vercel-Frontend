'use client';

import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { WidgetConfig, buttonSizes, WhatsAppIcon } from './WhatsAppWidgetHelpers';

interface WhatsAppWidgetPreviewProps {
  config: WidgetConfig;
}

export default function WhatsAppWidgetPreview({ config }: WhatsAppWidgetPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        <Eye className="inline h-5 w-5 mr-2" />
        Vista Previa
      </h2>

      {/* Preview Container */}
      <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg h-[600px] overflow-hidden">
        {/* Mock Website */}
        <div className="p-4">
          <div className="bg-white dark:bg-gray-800 rounded p-4 mb-4">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded p-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>

        {/* WhatsApp Widget Button */}
        {config.isEnabled ? (
          <div
            className={`absolute ${
              config.position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'
            }`}
          >
            <button
              className="flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
              style={{
                backgroundColor: config.primaryColor,
                width: `${buttonSizes[config.buttonSize].width}px`,
                height: `${buttonSizes[config.buttonSize].height}px`,
                borderRadius: `${config.borderRadius}%`
              }}
              onClick={() => setShowPreview(!showPreview)}
            >
              <WhatsAppIcon size={buttonSizes[config.buttonSize].icon} />
            </button>

            {/* Chat Preview */}
            {showPreview && (
              <div
                className={`absolute bottom-20 ${
                  config.position === 'bottom-right' ? 'right-0' : 'left-0'
                } w-80 bg-white rounded-lg shadow-xl`}
                style={{ borderTop: `4px solid ${config.primaryColor}` }}
              >
                <div
                  className="p-4 text-white"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <h3 className="font-semibold">WhatsApp Chat</h3>
                </div>
                <div className="p-4">
                  <div className="bg-gray-100 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">{config.welcomeMessage}</p>
                  </div>
                  <input
                    type="text"
                    placeholder={config.placeholderText}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    readOnly
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Widget deshabilitado - Mostrar mensaje */
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg text-sm">
              Widget deshabilitado
            </div>
          </div>
        )}
      </div>

      {/* Code Snippet */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Código para insertar en tu sitio web:
        </h3>
        <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
{`<!-- WhatsApp Widget -->
<script>
  window.whatsappWidget = ${JSON.stringify(config, null, 2)};
</script>
<script src="https://tu-dominio.com/whatsapp-widget.js"></script>`}
        </pre>
      </div>
    </div>
  );
}