'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { useStructuralComponents } from '@/contexts/StructuralComponentsContext';
import { useEditorTranslations } from '@/hooks/useEditorTranslations';
import WhatsAppWidgetConfig from '@/components/whatsapp/WhatsAppWidgetConfig';
import toast from 'react-hot-toast';

export function WhatsAppWidgetPanel() {
  const { toggleWhatsAppWidget } = useEditorStore();
  const { t } = useEditorTranslations();
  const { 
    config,
    updateWhatsAppWidgetConfigLocal,
    publish,
    hasChanges 
  } = useStructuralComponents();
  
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with default config if not set
  const widgetConfig = config.whatsAppWidget || {
    primaryColor: '#22c55e',
    position: 'bottom-right',
    welcomeMessage: '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
    placeholderText: 'Escribe un mensaje...',
    buttonSize: 'medium',
    borderRadius: 50,
    showOnMobile: true,
    showOnDesktop: true,
    delaySeconds: 3,
    autoOpenSeconds: 0,
    isEnabled: true
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await publish();
      toast.success(t('editor.messages.changesSaved', 'Cambios guardados correctamente'));
    } catch (error) {
      console.error('Error saving WhatsApp widget:', error);
      toast.error(t('editor.messages.saveFailed', 'Error al guardar los cambios'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Panel */}
      <div className="w-96 bg-white border-l border-gray-200 shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('editor.panels.whatsappWidget', 'WhatsApp Widget')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWhatsAppWidget()}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <WhatsAppWidgetConfig
            config={widgetConfig}
            onConfigChange={updateWhatsAppWidgetConfigLocal}
            showTitle={false}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`
              w-full px-4 py-2 rounded-lg font-medium transition-all
              ${hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isSaving 
              ? t('common.saving', 'Guardando...')
              : t('common.saveChanges', 'Guardar cambios')
            }
          </button>
        </div>
      </div>
    </div>
  );
}