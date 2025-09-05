'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MoreVertical, Plus, Download, Upload, Filter, ChevronDown } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';

interface Product {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  images?: string[];
  isActive: boolean;
  productType?: string;
  vendor?: string;
  collections?: string[];
  createdAt: string;
  updatedAt?: string;
}

interface PagedResult {
  items: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface Stats {
  averageConversionRate: number;
  lowStockProducts: number;
  avgABCValue: number;
}

export default function ProductsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats>({
    averageConversionRate: 0,
    lowStockProducts: 0,
    avgABCValue: 0
  });
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
    fetchProducts();
  }, [page, activeTab, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMoreActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = getApiEndpoint(`/products?page=${page}&pageSize=${pageSize}`);
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (activeTab === 'active') {
        url += '&isActive=true';
      } else if (activeTab === 'draft') {
        url += '&isActive=false';
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: PagedResult = await response.json();
        setProducts(data.items);
        setTotalPages(data.totalPages);
        
        // Calculate stats
        const lowStock = data.items.filter(p => p.stock === 0).length;
        setStats({
          averageConversionRate: 0,
          lowStockProducts: lowStock,
          avgABCValue: 0
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('products.confirmDelete', '¿Estás seguro de eliminar este producto?'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint(`/products/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (!confirm(t('products.confirmBulkDelete', `¿Estás seguro de eliminar ${selectedProducts.length} productos?`))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint('/products/bulk-delete'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedProducts)
      });

      if (response.ok) {
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting products:', error);
    }
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        {t('products.active', 'ACTIVO')}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
        {t('products.draft', 'BORRADOR')}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nombre', 'SKU', 'Precio', 'Stock', 'Estado', 'Tipo', 'Proveedor', 'Fecha Creación'];
    const csvData = products.map(product => [
      product.id,
      product.name,
      product.sku || '',
      product.basePrice,
      product.stock,
      product.isActive ? 'Activo' : 'Borrador',
      product.productType || '',
      product.vendor || '',
      new Date(product.createdAt).toLocaleDateString()
    ]);
    
    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `productos_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const exportToExcel = () => {
    let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
    html += '<head><meta charset="utf-8"><title>Productos Export</title></head>';
    html += '<body><table border="1">';
    
    // Headers
    html += '<tr style="background-color:#f0f0f0;font-weight:bold;">';
    html += '<th>ID</th><th>Nombre</th><th>SKU</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Tipo</th><th>Proveedor</th><th>Fecha Creación</th></tr>';
    
    // Data rows
    products.forEach(product => {
      html += '<tr>';
      html += `<td>${product.id}</td>`;
      html += `<td>${product.name}</td>`;
      html += `<td>${product.sku || ''}</td>`;
      html += `<td>${formatPrice(product.basePrice)}</td>`;
      html += `<td>${product.stock}</td>`;
      html += `<td style="color:${product.isActive ? 'green' : 'gray'}">${product.isActive ? 'Activo' : 'Borrador'}</td>`;
      html += `<td>${product.productType || ''}</td>`;
      html += `<td>${product.vendor || ''}</td>`;
      html += `<td>${new Date(product.createdAt).toLocaleDateString()}</td>`;
      html += '</tr>';
    });
    
    html += '</table></body></html>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `productos_${new Date().toISOString().split('T')[0]}.xls`);
    link.click();
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(t('products.popupBlocked', 'Por favor permite las ventanas emergentes para exportar a PDF'));
      return;
    }
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Productos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f0f0f0; padding: 10px; text-align: left; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          .active { color: green; }
          .inactive { color: gray; }
          @media print {
            body { margin: 0; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>Reporte de Productos - ${new Date().toLocaleDateString()}</h1>
        <p>Total de productos: ${products.length}</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>SKU</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Tipo</th>
              <th>Proveedor</th>
            </tr>
          </thead>
          <tbody>`;
    
    products.forEach(product => {
      html += `
        <tr>
          <td>${product.id}</td>
          <td>${product.name}</td>
          <td>${product.sku || ''}</td>
          <td>${formatPrice(product.basePrice)}</td>
          <td>${product.stock}</td>
          <td class="${product.isActive ? 'active' : 'inactive'}">${product.isActive ? 'Activo' : 'Borrador'}</td>
          <td>${product.productType || ''}</td>
          <td>${product.vendor || ''}</td>
        </tr>`;
    });
    
    html += `
          </tbody>
        </table>
      </body>
      </html>`;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleExportFormat = (format: 'excel' | 'pdf' | 'csv') => {
    setShowExportModal(false);
    switch(format) {
      case 'excel': exportToExcel(); break;
      case 'pdf': exportToPDF(); break;
      case 'csv': exportToCSV(); break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('products.avgConversionRate', 'Tasa de venta promedio')}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.averageConversionRate}%
            </p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${stats.averageConversionRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('products.lowStockDays', 'Productos por días de inventario restantes')}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.lowStockProducts > 0 ? stats.lowStockProducts : t('products.noData', 'Sin datos')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('products.abcAnalysis', 'Análisis ABC de productos')}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              US${stats.avgABCValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('products.title', 'Productos')}
              </h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {t('products.all', 'Todos')}
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {t('products.active', 'Activo')}
              </button>
              <button
                onClick={() => setActiveTab('draft')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'draft'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {t('products.draft', 'Borradores')}
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'archived'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {t('products.archived', 'Archivado')}
              </button>
            </nav>
          </div>

          {/* Search and Actions Bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('products.search', 'Buscar productos...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              {selectedProducts.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  {t('products.delete', 'Eliminar')} ({selectedProducts.length})
                </button>
              )}
              
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  {t('products.moreActions', 'Más acciones')}
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showMoreActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <button 
                      onClick={() => {
                        setShowExportModal(true);
                        setShowMoreActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                      <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      {t('products.export', 'Exportar')}
                    </button>
                    <button className="w-full px-4 py-2 text-left text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      {t('products.import', 'Importar')}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push('/dashboard/productos/crear')}
                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {t('products.add', 'Agregar producto')}
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={toggleAllProducts}
                      className="rounded border-gray-300 dark:border-gray-600"
                      style={{ accentColor: primaryColor }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('products.product', 'PRODUCTO')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('products.status', 'ESTADO')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('products.inventory', 'INVENTARIO')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('products.category', 'CATEGORÍA')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('products.channels', 'CANALES')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('products.actions', '')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {t('common.loading', 'Cargando...')}
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {t('products.noProducts', 'No hay productos')}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="rounded border-gray-300 dark:border-gray-600"
                          style={{ accentColor: primaryColor }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                          )}
                          <div>
                            <button
                              onClick={() => router.push(`/dashboard/productos/${product.id}/editar`)}
                              className="text-gray-900 dark:text-white font-medium hover:underline"
                            >
                              {product.name}
                            </button>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              {product.sku && <span>SKU: {product.sku}</span>}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {formatPrice(product.basePrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(product.isActive)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-white">
                          {product.stock} {t('products.inStock', 'en existencias')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-500 dark:text-gray-400">
                          {product.collections?.join(', ') || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-white">1</span>
                      </td>
                      <td className="px-6 py-4">
                        {/* Actions column left empty - edit is on product name click */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center">
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {t('products.moreInfo', 'Más información sobre productos')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('products.exportData', 'Exportar Datos')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('products.selectFormat', 'Selecciona el formato que deseas exportar')}
            </p>
            
            <div className="space-y-3">
              {/* Excel Option */}
              <button 
                onClick={() => handleExportFormat('excel')}
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 group transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Excel</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Formato .xls</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* PDF Option */}
              <button 
                onClick={() => handleExportFormat('pdf')}
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 group transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">PDF</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Documento imprimible</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* CSV Option */}
              <button 
                onClick={() => handleExportFormat('csv')}
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 group transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">CSV</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valores separados por comas</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {t('common.cancel', 'Cancelar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
