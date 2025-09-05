'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Globe,
  Search,
  FileText,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { paginasApi, type CreatePaginaDto } from '@/lib/api/paginas';
import { useI18n } from '@/contexts/I18nContext';
import RichTextEditor from '@/components/paginas/RichTextEditor';

export default function CreatePaginaPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState('');
  
  // Secciones expandibles
  const [showMetacampos, setShowMetacampos] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  // Form data
  const [formData, setFormData] = useState<CreatePaginaDto>({
    title: '',
    slug: '',
    content: '',
    isVisible: true,
    publishStatus: 'draft',
    template: 'default',
    allowSearchEngines: true,
  });

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  // Auto-generar slug desde el título
  const generateSlugFromTitle = async () => {
    if (!formData.title) return;
    
    try {
      const response = await paginasApi.generateSlug(formData.title);
      if (response.success && response.data) {
        setFormData({ ...formData, slug: response.data });
        // Verificar si el slug ya existe
        checkSlugAvailability(response.data);
      }
    } catch (error) {
      console.error('Error generating slug:', error);
    }
  };

  // Verificar disponibilidad del slug
  const checkSlugAvailability = async (slug: string) => {
    if (!slug) return;
    
    try {
      const response = await paginasApi.checkSlugExists(slug);
      if (response.success && response.data) {
        setErrors({ ...errors, slug: ['Esta URL ya está en uso'] });
      } else {
        const newErrors = { ...errors };
        delete newErrors.slug;
        setErrors(newErrors);
      }
    } catch (error) {
      console.error('Error checking slug:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setShowErrorMessage('');

    try {
      // Preparar datos para enviar
      const dataToSend: CreatePaginaDto = {
        ...formData,
        publishedAt: formData.publishStatus === 'published' && !formData.publishedAt 
          ? new Date().toISOString() 
          : formData.publishedAt,
      };

      const response = await paginasApi.createPagina(dataToSend);
      
      if (response.success) {
        setShowSuccessMessage(response.message);
        setTimeout(() => {
          router.push('/dashboard/paginas');
        }, 1500);
      }
    } catch (error: any) {
      if (error.errors) {
        setErrors(error.errors);
      }
      setShowErrorMessage(error.message || 'Error al crear la página');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.content) {
      if (confirm('¿Estás seguro de que deseas cancelar? Se perderán los cambios no guardados.')) {
        router.push('/dashboard/paginas');
      }
    } else {
      router.push('/dashboard/paginas');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/dashboard/paginas" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('pages.title', 'Páginas')}
            </a>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {t('pages.addPage', 'Agregar página')}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('pages.addPage', 'Agregar página')}
        </h1>
      </div>

      {/* Messages */}
      {showSuccessMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {showSuccessMessage}
        </div>
      )}
      
      {showErrorMessage && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>{showErrorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('pages.titleLabel', 'Título')} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  onBlur={generateSlugFromTitle}
                  placeholder="ej., sobre nosotros, tabla de tallas, preguntas frecuentes"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                    errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ '--tw-ring-color': primaryColor } as any}
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title[0]}</p>
                )}
              </div>

              {/* Slug */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('pages.slugLabel', 'URL de la página')} *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-600 dark:text-gray-400">
                    {window.location.origin}/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    onBlur={(e) => checkSlugAvailability(e.target.value)}
                    placeholder="sobre-nosotros"
                    className={`flex-1 px-4 py-2 border rounded-r-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                      errors.slug ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ '--tw-ring-color': primaryColor } as any}
                    required
                  />
                </div>
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug[0]}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('pages.slugHelp', 'Solo letras minúsculas, números y guiones. Ejemplo: sobre-nosotros')}
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('pages.contentLabel', 'Contenido')}
                </label>
                <RichTextEditor
                  value={formData.content || ''}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Escribe el contenido de tu página aquí..."
                  primaryColor={primaryColor}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content[0]}</p>
                )}
              </div>
            </div>

            {/* Metacampos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <button
                type="button"
                onClick={() => setShowMetacampos(!showMetacampos)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('pages.metaFields', 'Metacampos')}
                </span>
                {showMetacampos ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {showMetacampos && (
                <div className="px-6 pb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('pages.metaTitleLabel', 'Título SEO')}
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle || ''}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="Título para motores de búsqueda (máx. 60 caracteres)"
                      maxLength={255}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                      style={{ '--tw-ring-color': primaryColor } as any}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formData.metaTitle?.length || 0}/255 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('pages.metaDescriptionLabel', 'Descripción SEO')}
                    </label>
                    <textarea
                      value={formData.metaDescription || ''}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Descripción breve de la página (máx. 160 caracteres)"
                      maxLength={500}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                      style={{ '--tw-ring-color': primaryColor } as any}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formData.metaDescription?.length || 0}/500 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('pages.metaKeywordsLabel', 'Palabras clave')}
                    </label>
                    <input
                      type="text"
                      value={formData.metaKeywords || ''}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      placeholder="Palabras clave separadas por comas"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                      style={{ '--tw-ring-color': primaryColor } as any}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Publicación en motores de búsqueda */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <button
                type="button"
                onClick={() => setShowSeo(!showSeo)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('pages.searchEngines', 'Publicación en motores de búsqueda')}
                </span>
                {showSeo ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {showSeo && (
                <div className="px-6 pb-6 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowSearchEngines"
                      checked={formData.allowSearchEngines}
                      onChange={(e) => setFormData({ ...formData, allowSearchEngines: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                      style={{ accentColor: primaryColor }}
                    />
                    <label htmlFor="allowSearchEngines" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t('pages.allowSearchEnginesLabel', 'Permitir que los motores de búsqueda indexen esta página')}
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('pages.canonicalUrlLabel', 'URL canónica')}
                    </label>
                    <input
                      type="url"
                      value={formData.canonicalUrl || ''}
                      onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                      placeholder="https://ejemplo.com/pagina-original"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                      style={{ '--tw-ring-color': primaryColor } as any}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('pages.canonicalUrlHelp', 'Especifica la URL original si esta página es una copia o versión alternativa')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('pages.robotsLabel', 'Directivas para robots')}
                    </label>
                    <select
                      value={formData.robots || ''}
                      onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                      style={{ '--tw-ring-color': primaryColor } as any}
                    >
                      <option value="">Por defecto</option>
                      <option value="index,follow">index, follow</option>
                      <option value="index,nofollow">index, nofollow</option>
                      <option value="noindex,follow">noindex, follow</option>
                      <option value="noindex,nofollow">noindex, nofollow</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Visibilidad */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('pages.visibility', 'Visibilidad')}
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.isVisible === true}
                    onChange={() => setFormData({ ...formData, isVisible: true })}
                    className="h-4 w-4"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {t('pages.visible', 'Visible')}
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.isVisible === false}
                    onChange={() => setFormData({ ...formData, isVisible: false })}
                    className="h-4 w-4"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    {t('pages.hidden', 'Oculto')}
                  </span>
                </label>
              </div>
            </div>

            {/* Estado de publicación */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('pages.publishStatus', 'Estado de publicación')}
              </h3>
              <select
                value={formData.publishStatus}
                onChange={(e) => setFormData({ ...formData, publishStatus: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                style={{ '--tw-ring-color': primaryColor } as any}
              >
                <option value="draft">{t('pages.draft', 'Borrador')}</option>
                <option value="published">{t('pages.published', 'Publicado')}</option>
                <option value="scheduled">{t('pages.scheduled', 'Programado')}</option>
              </select>

              {formData.publishStatus === 'scheduled' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('pages.scheduledDateLabel', 'Fecha de publicación')}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledPublishAt || ''}
                    onChange={(e) => setFormData({ ...formData, scheduledPublishAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    required={formData.publishStatus === 'scheduled'}
                  />
                  {errors.scheduledPublishAt && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduledPublishAt[0]}</p>
                  )}
                </div>
              )}
            </div>

            {/* Plantilla */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('pages.template', 'Plantilla')}
              </h3>
              <select
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                style={{ '--tw-ring-color': primaryColor } as any}
              >
                <option value="default">{t('pages.templateDefault', 'Página predeterminada')}</option>
                <option value="fullwidth">{t('pages.templateFullwidth', 'Ancho completo')}</option>
                <option value="sidebar">{t('pages.templateSidebar', 'Con barra lateral')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions - Móvil apilado */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span className="flex items-center justify-center gap-2">
              <X className="w-4 h-4" />
              {t('common.cancel', 'Cancelar')}
            </span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                {t('common.saving', 'Guardando...')}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {t('common.save', 'Guardar')}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}