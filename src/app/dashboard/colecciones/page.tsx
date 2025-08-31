'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { 
  getCollections, 
  deleteCollection, 
  bulkDeleteCollections,
  CollectionListItem 
} from '@/lib/api/collections';
import { PagedResult } from '@/types/common';
import { 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';

export default function CollectionsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');

  // Get primary color from localStorage
  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  // Load collections
  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      const result: PagedResult<CollectionListItem> = await getCollections(
        currentPage, 
        20, 
        searchTerm || undefined
      );
      
      setCollections(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalCount);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle checkbox selection
  const handleSelectCollection = (id: number) => {
    setSelectedCollections(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedCollections.length === collections.length) {
      setSelectedCollections([]);
    } else {
      setSelectedCollections(collections.map(c => c.id));
    }
  };

  // Handle delete single collection
  const handleDeleteCollection = async (id: number) => {
    if (!confirm(t('collections.confirmDelete'))) {
      return;
    }

    try {
      await deleteCollection(id);
      await loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert(t('collections.deleteError'));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCollections.length === 0) return;
    
    if (!confirm(t('collections.confirmBulkDelete'))) {
      return;
    }

    try {
      await bulkDeleteCollections(selectedCollections);
      setSelectedCollections([]);
      await loadCollections();
    } catch (error) {
      console.error('Error deleting collections:', error);
      alert(t('collections.bulkDeleteError'));
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                {t('navigation.dashboard')}
              </a>
            </li>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li className="text-gray-700 font-medium dark:text-gray-300">
              {t('navigation.colecciones')}
            </li>
          </ol>
        </nav>

        <div className="sm:hidden mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('navigation.colecciones')}
          </h1>
        </div>

        <h1 className="hidden sm:block text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('collections.title')}
        </h1>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('collections.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            />
          </div>

          {/* Create Button */}
          <button
            onClick={() => router.push('/dashboard/colecciones/crear')}
            className="px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="h-5 w-5" />
            {t('collections.create')}
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedCollections.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {`${selectedCollections.length} ${t('collections.selected')}`}
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collections Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" 
              style={{ borderColor: primaryColor }}></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {t('common.loading')}
            </p>
          </div>
        ) : collections.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('collections.empty')}
            </p>
            <button
              onClick={() => router.push('/dashboard/colecciones/crear')}
              className="px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              {t('collections.createFirst')}
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCollections.length === collections.length}
                        onChange={handleSelectAll}
                        className="rounded"
                        style={{ accentColor: primaryColor }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('collections.fields.title')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('collections.fields.products')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('collections.fields.conditions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {collections.map((collection) => (
                    <tr 
                      key={collection.id} 
                      onClick={() => router.push(`/dashboard/colecciones/${collection.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedCollections.includes(collection.id)}
                          onChange={() => handleSelectCollection(collection.id)}
                          className="rounded"
                          style={{ accentColor: primaryColor }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {collection.image ? (
                            <img
                              src={collection.image}
                              alt={collection.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {collection.title}
                            </div>
                            {!collection.isActive && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {t('common.inactive')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {collection.productCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {collection.conditionsSummary}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden">
              {collections.map((collection) => (
                <div 
                  key={collection.id} 
                  onClick={() => router.push(`/dashboard/colecciones/${collection.id}`)}
                  className="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(collection.id)}
                      onChange={() => handleSelectCollection(collection.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 rounded"
                      style={{ accentColor: primaryColor }}
                    />
                    
                    {collection.image ? (
                      <img
                        src={collection.image}
                        alt={collection.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {collection.title}
                      </h3>
                      {!collection.isActive && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t('common.inactive')}
                        </span>
                      )}
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {collection.productCount} {t('collections.products')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {collection.conditionsSummary}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t('common.showing')} {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalItems)} {t('common.of')} {totalItems}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <span className="px-3 py-1 flex items-center">
                      {currentPage} / {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* More information link */}
      <div className="mt-6 text-center">
        <a
          href="#"
          className="text-sm hover:underline transition-colors"
          style={{ color: primaryColor }}
        >
          {t('collections.moreInfo')}
        </a>
      </div>
    </div>
  );
}