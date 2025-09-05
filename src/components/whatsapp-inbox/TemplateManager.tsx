/**
 * @file TemplateManager.tsx
 * @max-lines 300
 * @current-lines 290
 * @architecture modular
 * @validates-rules ✅
 */

import React, { useState } from 'react';
import { TemplateManagerProps, MessageTemplate } from './types/whatsapp.types';

const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  loading = false,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'greeting', label: 'Saludo' },
    { value: 'support', label: 'Soporte' },
    { value: 'sales', label: 'Ventas' },
    { value: 'followup', label: 'Seguimiento' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingTemplate(null);
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setIsCreating(true);
  };

  const handleSave = (templateData: Omit<MessageTemplate, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (editingTemplate) {
      onUpdateTemplate(editingTemplate.id, templateData);
    } else {
      onCreateTemplate(templateData);
    }
    setIsCreating(false);
    setEditingTemplate(null);
  };

  const handleDelete = async (templateId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta plantilla?')) {
      onDeleteTemplate(templateId);
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/{{\s*(\w+)\s*}}/g);
    return matches ? matches.map(match => match.replace(/[{}]/g, '').trim()) : [];
  };

  const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
    const colors = {
      greeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      support: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      sales: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      followup: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      custom: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[category as keyof typeof colors] || colors.custom
      }`}>
        {categories.find(cat => cat.value === category)?.label || category}
      </span>
    );
  };

  if (isCreating) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleSave}
        onCancel={() => {
          setIsCreating(false);
          setEditingTemplate(null);
        }}
        loading={loading}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Plantillas de Mensajes
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona plantillas reutilizables para respuestas rápidas
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Nueva Plantilla
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar plantillas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Templates List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No se encontraron plantillas con los filtros actuales'
                : 'No tienes plantillas aún'
              }
            </p>
            {(!searchQuery && selectedCategory === 'all') && (
              <button
                onClick={handleCreateNew}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Crear primera plantilla
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTemplates.map(template => (
              <div 
                key={template.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <CategoryBadge category={template.category} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {template.content.length > 150 
                        ? template.content.slice(0, 150) + '...' 
                        : template.content
                      }
                    </p>
                    {template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Variables:</span>
                        {template.variables.map(variable => (
                          <span 
                            key={variable}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                          >
                            {variable}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Template Editor Component
interface TemplateEditorProps {
  template: MessageTemplate | null;
  onSave: (template: Omit<MessageTemplate, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  loading: boolean;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onCancel,
  loading,
}) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    content: template?.content || '',
    category: template?.category || 'custom',
    variables: template?.variables || [],
  });

  const categories = [
    { value: 'greeting', label: 'Saludo' },
    { value: 'support', label: 'Soporte' },
    { value: 'sales', label: 'Ventas' },
    { value: 'followup', label: 'Seguimiento' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/{{\s*(\w+)\s*}}/g);
    return matches ? matches.map(match => match.replace(/[{}]/g, '').trim()) : [];
  };

  const handleContentChange = (content: string) => {
    const variables = extractVariables(content);
    setFormData(prev => ({
      ...prev,
      content,
      variables,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as any);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {template ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la plantilla
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenido del mensaje
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Escribe tu mensaje aquí. Usa {{variable}} para variables dinámicas."
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Usa dobles llaves para variables: {`{{nombre}}, {{producto}}, etc.`}
            </p>
          </div>

          {formData.variables.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                Variables detectadas:
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.variables.map(variable => (
                  <span 
                    key={variable}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-sm rounded"
                  >
                    {variable}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              {loading ? 'Guardando...' : 'Guardar Plantilla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateManager;