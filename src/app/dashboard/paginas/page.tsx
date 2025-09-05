'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  EyeOff,
  Globe,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { paginasApi, type Pagina, type PagedResult, type ApiResponse } from '@/lib/api/paginas';
import { useI18n } from '@/contexts/I18nContext';

export default function PaginasPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  
  // Estados
  const [paginas, setPaginas] = useState<Pagina[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [publishStatusFilter, setPublishStatusFilter] = useState<string>('');
  const [visibilityFilter, setVisibilityFilter] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPagina, setSelectedPagina] = useState<Pagina | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState('');

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
    fetchPaginas();
  }, [currentPage, searchTerm, publishStatusFilter, visibilityFilter]);

  const fetchPaginas = async () => {
    try {
      setLoading(true);
      const response = await paginasApi.getPaginas(
        currentPage,
        10,
        searchTerm || undefined,
        publishStatusFilter || undefined,
        visibilityFilter
      );
      
      if (response.success && response.data) {
        setPaginas(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error('Error fetching páginas:', error);
      showError('Error al cargar las páginas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pagina: Pagina) => {
    setSelectedPagina(pagina);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPagina) return;

    try {
      const response = await paginasApi.deletePagina(selectedPagina.id);
      if (response.success) {
        showSuccess(response.message);
        fetchPaginas();
      }
    } catch (error: any) {
      showError(error.message || 'Error al eliminar la página');
    } finally {
      setShowDeleteModal(false);
      setSelectedPagina(null);
    }
  };

  const handlePublishToggle = async (pagina: Pagina) => {
    try {
      const response = pagina.publishStatus === 'published' 
        ? await paginasApi.unpublishPagina(pagina.id)
        : await paginasApi.publishPagina(pagina.id);
      
      if (response.success) {
        showSuccess(response.message);
        fetchPaginas();
      }
    } catch (error: any) {
      showError(error.message || 'Error al cambiar el estado de publicación');
    }
  };

  const showSuccess = (message: string) => {
    setShowSuccessMessage(message);
    setTimeout(() => setShowSuccessMessage(''), 5000);
  };

  const showError = (message: string) => {
    setShowErrorMessage(message);
    setTimeout(() => setShowErrorMessage(''), 5000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string, display: string) => {
    const colors = {
      published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.draft}`}>
        {getStatusIcon(status)}
        {display}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Mensajes de éxito/error */}
      {showSuccessMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {showSuccessMessage}
        </div>
      )}
      
      {showErrorMessage && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {showErrorMessage}
        </div>
      )}

      {/* Header - Móvil centrado */}
      <div className="flex flex-col items-center text-center sm:flex-row sm:justify-between sm:items-start sm:text-left mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('pages.title', 'Páginas')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('pages.subtitle', 'Gestiona las páginas de contenido de tu sitio web')}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/paginas/create')}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors w-full sm:w-auto justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus className="w-5 h-5" />
          {t('pages.addPage', 'Agregar página')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('pages.searchPlaceholder', 'Buscar por título o slug...')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                style={{ '--tw-ring-color': primaryColor } as any}
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={publishStatusFilter}
            onChange={(e) => {
              setPublishStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
            style={{ '--tw-ring-color': primaryColor } as any}
          >
            <option value="">{t('pages.allStatuses', 'Todos los estados')}</option>
            <option value="published">{t('pages.published', 'Publicado')}</option>
            <option value="draft">{t('pages.draft', 'Borrador')}</option>
            <option value="scheduled">{t('pages.scheduled', 'Programado')}</option>
          </select>

          {/* Visibility Filter */}
          <select
            value={visibilityFilter === undefined ? '' : visibilityFilter.toString()}
            onChange={(e) => {
              setVisibilityFilter(e.target.value === '' ? undefined : e.target.value === 'true');
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
            style={{ '--tw-ring-color': primaryColor } as any}
          >
            <option value="">{t('pages.allVisibility', 'Toda visibilidad')}</option>
            <option value="true">{t('pages.visible', 'Visible')}</option>
            <option value="false">{t('pages.hidden', 'Oculto')}</option>
          </select>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {t('pages.showingResults', `Mostrando ${paginas.length} de ${totalCount} páginas`)}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('common.loading', 'Cargando...')}</p>
          </div>
        ) : paginas.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('pages.noPages', 'No se encontraron páginas')}
            </p>
            <button
              onClick={() => router.push('/dashboard/paginas/create')}
              className="mt-4 px-4 py-2 text-white rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {t('pages.createFirst', 'Crear primera página')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('pages.tableTitle', 'Título')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('pages.tableSlug', 'URL')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('pages.tableStatus', 'Estado')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('pages.tableVisibility', 'Visibilidad')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('pages.tableTemplate', 'Plantilla')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('pages.tableUpdated', 'Actualizado')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginas.map((pagina) => (
                  <tr key={pagina.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <button
                          onClick={() => router.push(`/dashboard/paginas/${pagina.id}/edit`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
                        >
                          {pagina.title}
                        </button>
                        {pagina.metaDescription && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {pagina.metaDescription}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/${pagina.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        /{pagina.slug}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(pagina.publishStatus, pagina.publishStatusDisplay)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handlePublishToggle(pagina)}
                        className="flex items-center gap-1 text-sm"
                      >
                        {pagina.isVisible ? (
                          <>
                            <Eye className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 dark:text-green-400">Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-500 dark:text-gray-400">Oculto</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {pagina.templateDisplay}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(pagina.updatedAt).toLocaleDateString()}
                      </div>
                      {pagina.updatedByName && (
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          por {pagina.updatedByName}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {t('common.page', 'Página')} {currentPage} {t('common.of', 'de')} {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedPagina && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              {t('pages.confirmDelete', 'Confirmar eliminación')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('pages.deleteMessage', `¿Estás seguro de que deseas eliminar la página "${selectedPagina.title}"? Esta acción no se puede deshacer.`)}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPagina(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
              >
                {t('common.delete', 'Eliminar')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}