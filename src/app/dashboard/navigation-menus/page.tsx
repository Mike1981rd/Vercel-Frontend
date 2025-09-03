'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { Search } from 'lucide-react';

interface NavigationMenu {
  id: number;
  name: string;
  identifier: string;
  menuType: string;
  items: any[];
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

export default function NavigationMenusPage() {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');

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
        pageSize: '20',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`http://localhost:5266/api/NavigationMenu?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: PagedResult = await response.json();
        setMenus(data.items);
        setTotalPages(data.totalPages);
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

  const formatMenuItems = (items: any[]) => {
    if (!items || items.length === 0) return '';
    
    // Formatear como en la imagen: "email, phone"
    return items.map(item => {
      if (item.label.includes('@')) {
        return item.label;
      }
      if (item.label.includes('+')) {
        return item.label;
      }
      return item.label;
    }).join(', ');
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header estilo Shopify */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Logo/Título */}
              <h1 className="text-xl font-medium text-gray-900 dark:text-white">
                Menús
              </h1>
              
              {/* Barra de búsqueda */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Buscar"
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:text-white"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <kbd className="px-2 py-0.5 text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded">⌘K</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Redireccionamientos de URL
              </button>
              <Link
                href="/dashboard/navigation-menus/create"
                className="px-4 py-2 text-white text-sm rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                {t('menus.createMenu')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          </div>
        ) : menus.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay menús creados
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Los menús te ayudan a organizar la navegación de tu sitio web
            </p>
            <Link
              href="/dashboard/navigation-menus/create"
              className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              Crear tu primer menú
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left">
                    <button className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300">
                      Menú ↓
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Elementos del menú
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {menus.map((menu) => (
                  <tr 
                    key={menu.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/navigation-menus/${menu.id}/edit`)}
                  >
                    <td className="px-6 py-4">
                      <Link 
                        href={`/dashboard/navigation-menus/${menu.id}/edit`}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {menu.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatMenuItems(menu.items) || 'Sin elementos'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}