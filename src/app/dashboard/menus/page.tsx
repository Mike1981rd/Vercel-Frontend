'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { Plus, Search, Edit, Trash2, Copy, Eye, EyeOff, MoreVertical } from 'lucide-react';

interface NavigationMenu {
  id: number;
  name: string;
  identifier: string;
  menuType: string;
  itemCount: number;
  itemsSummary: string;
  isActive: boolean;
  updatedAt: string;
}

interface PagedResult {
  items: NavigationMenu[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export default function MenusPage() {
  const { t } = useI18n();
  const toast = useToast();
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [currentPage, searchTerm]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/NavigationMenu?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: PagedResult = await response.json();
        setMenus(data.items);
        setTotalPages(data.totalPages);
      } else if (response.status === 401) {
        toast.error(
          t('common.sessionExpired', 'Sesión expirada'),
          t('common.pleaseLogin', 'Por favor, inicia sesión nuevamente')
        );
      } else {
        toast.error(
          t('menus.error.loadFailed', 'Error al cargar los menús'),
          t('menus.error.tryAgain', 'Por favor, intenta nuevamente')
        );
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
      toast.error(
        t('menus.error.networkError', 'Error de conexión'),
        t('menus.error.checkConnection', 'Verifica tu conexión a internet')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const menu = menus.find(m => m.id === id);
      const newStatus = !menu?.isActive;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/NavigationMenu/${id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(
          newStatus ? t('menus.activated', 'Menú activado') : t('menus.deactivated', 'Menú desactivado'),
          newStatus 
            ? t('menus.activatedMessage', 'El menú ahora está visible en el sitio')
            : t('menus.deactivatedMessage', 'El menú ha sido ocultado del sitio')
        );
        fetchMenus();
      } else {
        toast.error(
          t('menus.error.toggleFailed', 'Error al cambiar estado'),
          t('menus.error.tryAgain', 'Por favor, intenta nuevamente')
        );
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error(
        t('menus.error.networkError', 'Error de conexión'),
        t('menus.error.checkConnection', 'Verifica tu conexión a internet')
      );
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const menu = menus.find(m => m.id === id);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/NavigationMenu/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(
          t('menus.duplicated', 'Menú duplicado'),
          t('menus.duplicatedMessage', `Se ha creado una copia de "${menu?.name}"`)
        );
        fetchMenus();
      } else {
        const errorData = await response.text();
        console.error('Error response:', response.status, errorData);
        toast.error(
          t('menus.error.duplicateFailed', 'Error al duplicar'),
          t('menus.error.tryAgain', 'Por favor, intenta nuevamente')
        );
      }
    } catch (error) {
      console.error('Error duplicating menu:', error);
      toast.error(
        t('menus.error.networkError', 'Error de conexión'),
        t('menus.error.checkConnection', 'Verifica tu conexión a internet')
      );
    }
  };

  const handleDelete = async (id: number) => {
    const menu = menus.find(m => m.id === id);
    
    if (!confirm(t('menus.confirmDelete', `¿Estás seguro de que deseas eliminar el menú "${menu?.name}"?`))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/NavigationMenu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(
          t('menus.deleted', 'Menú eliminado'),
          t('menus.deletedMessage', `El menú "${menu?.name}" ha sido eliminado correctamente`)
        );
        fetchMenus();
      } else if (response.status === 404) {
        toast.error(
          t('menus.error.notFound', 'Menú no encontrado'),
          t('menus.error.alreadyDeleted', 'El menú ya ha sido eliminado')
        );
        fetchMenus();
      } else {
        toast.error(
          t('menus.error.deleteFailed', 'Error al eliminar'),
          t('menus.error.tryAgain', 'Por favor, intenta nuevamente')
        );
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error(
        t('menus.error.networkError', 'Error de conexión'),
        t('menus.error.checkConnection', 'Verifica tu conexión a internet')
      );
    }
  };

  const getMenuTypeLabel = (type: string | null) => {
    switch (type) {
      case 'header':
        return t('menus.types.header', 'Encabezado');
      case 'footer':
        return t('menus.types.footer', 'Pie de página');
      case 'sidebar':
        return t('menus.types.sidebar', 'Barra lateral');
      default:
        return t('menus.types.custom', 'Personalizado');
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('menus.title', 'Menús de Navegación')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('menus.description', 'Gestiona los menús de navegación de tu sitio web')}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('menus.searchPlaceholder', 'Buscar menús...')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-opacity-30"
              style={{ '--tw-ring-color': primaryColor } as any}
            />
          </div>

          {/* Create Button */}
          <Link
            href="/dashboard/menus/create"
            className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg
                     hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('menus.createNew', 'Crear Menú')}
          </Link>
        </div>
      </div>

      {/* Table/List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <circle className="opacity-75" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"
                  strokeDasharray="60" strokeDashoffset="60" />
              </svg>
              {t('common.loading', 'Cargando...')}
            </div>
          </div>
        ) : menus.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('menus.noMenus', 'No hay menús creados')}
            </p>
            <Link
              href="/dashboard/menus/create"
              className="inline-flex items-center px-4 py-2 text-white rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('menus.createFirst', 'Crear tu primer menú')}
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('menus.table.name', 'Nombre')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('menus.table.type', 'Tipo')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('menus.table.items', 'Elementos')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('menus.table.status', 'Estado')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('menus.table.actions', 'Acciones')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {menus.map((menu) => (
                    <tr key={menu.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {menu.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('menus.identifier', 'ID')}: {menu.identifier}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getMenuTypeLabel(menu.menuType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {menu.itemCount} {t('menus.itemsCount', 'elementos')}
                          </p>
                          {menu.itemsSummary && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {menu.itemsSummary}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(menu.id)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                            ${menu.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                        >
                          {menu.isActive ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              {t('common.active', 'Activo')}
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              {t('common.inactive', 'Inactivo')}
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === menu.id ? null : menu.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </button>
                          
                          {openDropdown === menu.id && (
                            <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                              <div className="py-1">
                                <Link
                                  href={`/dashboard/menus/${menu.id}/edit`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  {t('common.edit', 'Editar')}
                                </Link>
                                <button
                                  onClick={() => {
                                    handleDuplicate(menu.id);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  {t('common.duplicate', 'Duplicar')}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDelete(menu.id);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {t('common.delete', 'Eliminar')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {menus.map((menu) => (
                <div key={menu.id} className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {menu.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {menu.identifier}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(menu.id)}
                      className={`px-2 py-1 rounded-full text-xs
                        ${menu.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      {menu.isActive ? t('common.active', 'Activo') : t('common.inactive', 'Inactivo')}
                    </button>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <p>{getMenuTypeLabel(menu.menuType)} • {menu.itemCount} {t('menus.itemsCount', 'elementos')}</p>
                    {menu.itemsSummary && (
                      <p className="text-xs mt-1">{menu.itemsSummary}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/menus/${menu.id}/edit`}
                      className="flex-1 text-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                               hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {t('common.edit', 'Editar')}
                    </Link>
                    <button
                      onClick={() => handleDuplicate(menu.id)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                               hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {t('common.duplicate', 'Duplicar')}
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg
                               hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('common.previous', 'Anterior')}
                  </button>
                  
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('common.page', 'Página')} {currentPage} {t('common.of', 'de')} {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('common.next', 'Siguiente')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
