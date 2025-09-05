/**
 * @file page.tsx (WhatsApp Templates Dashboard)
 * @max-lines 300
 * @current-lines 200
 * @architecture modular
 * @validates-rules ✅
 */

'use client';

import React, { useEffect, useState } from 'react';
import { TemplateManager } from '@/components/whatsapp-inbox';
import { useWhatsAppAPI } from '@/components/whatsapp-inbox';
import { MessageTemplate } from '@/components/whatsapp-inbox/types/whatsapp.types';

export default function WhatsAppTemplatesPage() {
  const [companyId, setCompanyId] = useState<string>('');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { 
    getTemplates, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate 
  } = useWhatsAppAPI();

  // Get company ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCompanyId = localStorage.getItem('companyId');
      if (storedCompanyId) {
        setCompanyId(storedCompanyId);
      }
    }
  }, []);

  // Load templates
  useEffect(() => {
    if (companyId) {
      loadTemplates();
    }
  }, [companyId]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const templatesData = await getTemplates(companyId);
      if (templatesData) {
        setTemplates(templatesData);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al cargar las plantillas'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: Omit<MessageTemplate, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const newTemplate = await createTemplate(templateData);
      if (newTemplate) {
        setTemplates(prev => [newTemplate, ...prev]);
        setMessage({
          type: 'success',
          text: 'Plantilla creada exitosamente'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al crear la plantilla'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTemplate = async (templateId: string, updates: Partial<MessageTemplate>) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const updatedTemplate = await updateTemplate(templateId, updates);
      if (updatedTemplate) {
        setTemplates(prev => prev.map(template => 
          template.id === templateId ? updatedTemplate : template
        ));
        setMessage({
          type: 'success',
          text: 'Plantilla actualizada exitosamente'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al actualizar la plantilla'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const success = await deleteTemplate(templateId);
      if (success) {
        setTemplates(prev => prev.filter(template => template.id !== templateId));
        setMessage({
          type: 'success',
          text: 'Plantilla eliminada exitosamente'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al eliminar la plantilla'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!companyId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard/whatsapp"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Plantillas de WhatsApp
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Crea y gestiona plantillas de mensajes reutilizables
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {templates.length} {templates.length === 1 ? 'plantilla' : 'plantillas'}
              </span>
              
              <a
                href="/dashboard/whatsapp/config"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Configuración
              </a>
              
              <a
                href="/dashboard/whatsapp"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Volver al Inbox
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'
          }`}>
            <div className="flex">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto pl-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Template Manager */}
        <TemplateManager
          templates={templates}
          onCreateTemplate={handleCreateTemplate}
          onUpdateTemplate={handleUpdateTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          loading={isLoading || isSaving}
        />

        {/* Tips Section */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-200 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Consejos para plantillas efectivas
          </h3>
          <div className="space-y-3 text-sm text-yellow-800 dark:text-yellow-300">
            <div>
              <strong>Variables dinámicas:</strong> Usa <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded">{`{{nombre}}`}</code> para personalizar mensajes automáticamente.
            </div>
            <div>
              <strong>Categorías:</strong> Organiza tus plantillas por propósito (saludo, soporte, ventas, etc.) para encontrarlas fácilmente.
            </div>
            <div>
              <strong>Longitud:</strong> Mantén los mensajes concisos. WhatsApp tiene límites de caracteres.
            </div>
            <div>
              <strong>Tono profesional:</strong> Aunque sea un chat, mantén un tono apropiado para tu negocio.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}