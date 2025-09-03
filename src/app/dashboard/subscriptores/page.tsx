'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import ConvertToCustomerModal from '@/components/subscriptores/ConvertToCustomerModal';

interface NewsletterSubscriber {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  sourcePage: string;
  sourceCampaign: string;
  language: string;
  acceptedMarketing: boolean;
  acceptedTerms: boolean;
  optInDate: string;
  optOutDate?: string;
  convertedToCustomer: boolean;
  customerId?: number;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
  daysSinceSubscription: number;
  isConverted: boolean;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface Statistics {
  totalActive: number;
  totalInactive: number;
  totalConverted: number;
  thisMonth: number;
  conversionRate: number;
}

export default function SubscriptoresPage() {
  const { t } = useI18n();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  
  // State management
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  
  // UI states
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([]);

  // Load primary color from settings
  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Helper function to get descriptive error messages
  const getErrorMessage = (status: number, errorText: string, action: string): string => {
    const actionTranslations = {
      'fetch': t('subscribers.actions.loading', 'cargar subscriptores'),
      'toggle': t('subscribers.actions.toggleStatus', 'cambiar estado'),
      'delete': t('subscribers.actions.delete', 'eliminar subscriptor'),
      'convert': t('subscribers.actions.convert', 'convertir a cliente'),
      'export': t('subscribers.actions.export', 'exportar datos')
    };

    const actionName = actionTranslations[action as keyof typeof actionTranslations] || action;

    switch (status) {
      case 401:
        return t('errors.unauthorized', `No autorizado para ${actionName}. Por favor, inicie sesión nuevamente.`);
      case 403:
        return t('errors.forbidden', `No tiene permisos para ${actionName}. Contacte al administrador.`);
      case 404:
        return t('errors.notFound', `El subscriptor no existe o fue eliminado previamente.`);
      case 409:
        return t('errors.conflict', `Conflicto al ${actionName}. El subscriptor puede haber sido modificado por otro usuario.`);
      case 422:
        return t('errors.validationError', `Datos inválidos para ${actionName}. Verifique la información ingresada.`);
      case 500:
        return t('errors.serverError', `Error interno del servidor al ${actionName}. Intente nuevamente en unos momentos.`);
      case 503:
        return t('errors.serviceUnavailable', `Servicio temporalmente no disponible. Intente ${actionName} más tarde.`);
      default:
        return t('errors.genericError', `Error ${status} al ${actionName}: ${errorText || 'Motivo desconocido'}`);
    }
  };

  // Fetch subscribers
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError(t('errors.noToken', 'Sesión expirada. Por favor, inicie sesión nuevamente.'));
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        status: statusFilter,
        search: searchTerm
      });

      const response = await fetch(`http://localhost:5266/api/newslettersubscribers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(getErrorMessage(response.status, errorText, 'fetch'));
        return;
      }

      const data: PagedResult<NewsletterSubscriber> = await response.json();
      setSubscribers(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError(t('errors.networkError', 'Error de conexión. Verifique su conexión a internet y que el servidor esté funcionando.'));
      } else {
        setError(t('errors.unexpectedError', `Error inesperado al cargar subscriptores: ${error instanceof Error ? error.message : 'Motivo desconocido'}`));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5266/api/newslettersubscribers/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Initial load and refetch on filter changes
  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Toggle subscriber active status
  const toggleSubscriberStatus = async (id: number, currentStatus: boolean) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setError(t('errors.noToken', 'Sesión expirada. Por favor, inicie sesión nuevamente.'));
        return;
      }

      const response = await fetch(`http://localhost:5266/api/newslettersubscribers/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(!currentStatus)
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(getErrorMessage(response.status, errorText, 'toggle'));
        return;
      }

      // Success message
      const newStatus = !currentStatus;
      const statusText = newStatus ? 
        t('subscribers.statusActive', 'activo') : 
        t('subscribers.statusInactive', 'inactivo');
      setSuccessMessage(t('subscribers.statusUpdated', `Estado del subscriptor cambiado a ${statusText} exitosamente.`));

      // Refresh data
      await fetchSubscribers();
      await fetchStatistics();
    } catch (error) {
      console.error('Error toggling status:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError(t('errors.networkError', 'Error de conexión al cambiar estado. Verifique su conexión a internet.'));
      } else {
        setError(t('errors.unexpectedError', `Error inesperado al cambiar estado: ${error instanceof Error ? error.message : 'Motivo desconocido'}`));
      }
    }
  };

  // Delete subscriber
  const deleteSubscriber = async (id: number) => {
    if (!confirm(t('common.confirmDelete', '¿Está seguro de que desea eliminar este suscriptor? Esta acción no se puede deshacer.'))) {
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setError(t('errors.noToken', 'Sesión expirada. Por favor, inicie sesión nuevamente.'));
        return;
      }

      const response = await fetch(`http://localhost:5266/api/newslettersubscribers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(getErrorMessage(response.status, errorText, 'delete'));
        return;
      }

      // Success message
      setSuccessMessage(t('subscribers.deleteSuccess', 'Subscriptor eliminado exitosamente.'));

      // Refresh data
      await fetchSubscribers();
      await fetchStatistics();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError(t('errors.networkError', 'Error de conexión al eliminar subscriptor. Verifique su conexión a internet.'));
      } else {
        setError(t('errors.unexpectedError', `Error inesperado al eliminar subscriptor: ${error instanceof Error ? error.message : 'Motivo desconocido'}`));
      }
    }
  };

  // Search handler with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Status filter change
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge color
  const getStatusColor = (subscriber: NewsletterSubscriber) => {
    if (subscriber.convertedToCustomer) return 'bg-purple-100 text-purple-800';
    if (subscriber.isActive) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Get status text
  const getStatusText = (subscriber: NewsletterSubscriber) => {
    if (subscriber.convertedToCustomer) return t('subscribers.converted', 'Convertido');
    if (subscriber.isActive) return t('subscribers.active', 'Activo');
    return t('subscribers.inactive', 'Inactivo');
  };

  // Export functions (following the pattern from export-system.md)
  const exportToCSV = () => {
    try {
      setError(null);
      
      if (!subscribers || subscribers.length === 0) {
        setError(t('export.noData', 'No hay datos para exportar. Primero cargue los subscriptores.'));
        return;
      }

      const headers = ['ID', 'Email', 'Nombre Completo', 'Teléfono', 'Estado', 'Origen', 'Idioma', 'Suscrito', 'Días'];
      const csvData = subscribers.map(subscriber => [
        subscriber.id,
        subscriber.email,
        subscriber.fullName || `${subscriber.firstName} ${subscriber.lastName}`.trim(),
        subscriber.phone || '',
        getStatusText(subscriber),
        subscriber.sourcePage || subscriber.sourceCampaign || '',
        subscriber.language,
        new Date(subscriber.createdAt).toLocaleDateString(),
        subscriber.daysSinceSubscription
      ]);
      
      let csvContent = headers.join(',') + '\n';
      csvData.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `newsletter-subscribers_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      
      // Success message
      setSuccessMessage(t('export.csvSuccess', `${subscribers.length} subscriptores exportados a CSV exitosamente.`));
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError(t('export.csvError', `Error al exportar CSV: ${error instanceof Error ? error.message : 'Error desconocido'}`));
    }
  };

  const exportToExcel = () => {
    try {
      setError(null);
      
      if (!subscribers || subscribers.length === 0) {
        setError(t('export.noData', 'No hay datos para exportar. Primero cargue los subscriptores.'));
        return;
      }

      let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
      html += '<head><meta charset="utf-8"><title>Newsletter Subscribers Export</title></head>';
      html += '<body><table border="1">';
      
      // Headers with styling
      html += '<tr style="background-color:#f0f0f0;font-weight:bold;">';
      html += '<th>ID</th><th>Email</th><th>Nombre Completo</th><th>Teléfono</th><th>Estado</th><th>Origen</th><th>Idioma</th><th>Suscrito</th><th>Días</th></tr>';
      
      // Data rows with conditional styling
      subscribers.forEach(subscriber => {
        const statusColor = subscriber.convertedToCustomer ? 'purple' : subscriber.isActive ? 'green' : 'red';
        html += '<tr>';
        html += `<td>${subscriber.id}</td>`;
        html += `<td>${subscriber.email}</td>`;
        html += `<td>${subscriber.fullName || `${subscriber.firstName} ${subscriber.lastName}`.trim()}</td>`;
        html += `<td>${subscriber.phone || ''}</td>`;
        html += `<td style="color:${statusColor}">${getStatusText(subscriber)}</td>`;
        html += `<td>${subscriber.sourcePage || subscriber.sourceCampaign || ''}</td>`;
        html += `<td>${subscriber.language}</td>`;
        html += `<td>${new Date(subscriber.createdAt).toLocaleDateString()}</td>`;
        html += `<td>${subscriber.daysSinceSubscription}</td>`;
        html += '</tr>';
      });
      
      html += '</table></body></html>';
      
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `newsletter-subscribers_${new Date().toISOString().split('T')[0]}.xls`);
      link.click();
      
      // Success message
      setSuccessMessage(t('export.excelSuccess', `${subscribers.length} subscriptores exportados a Excel exitosamente.`));
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setError(t('export.excelError', `Error al exportar Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`));
    }
  };

  const exportToPDF = () => {
    try {
      setError(null);
      
      if (!subscribers || subscribers.length === 0) {
        setError(t('export.noData', 'No hay datos para exportar. Primero cargue los subscriptores.'));
        return;
      }

      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        setError(t('export.popupBlocked', 'El navegador bloqueó la ventana emergente. Por favor, permita ventanas emergentes e intente nuevamente.'));
        return;
      }
      
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Newsletter Subscribers Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f0f0f0; padding: 10px; border: 1px solid #ddd; text-align: left; }
            td { padding: 8px; border: 1px solid #ddd; }
            .header { margin-bottom: 20px; }
            .stats { display: flex; gap: 20px; margin-bottom: 20px; }
            .stat-card { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .active { color: green; }
            .inactive { color: red; }
            .converted { color: purple; }
            @media print {
              body { margin: 0; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Newsletter Subscribers Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Total subscribers: ${totalCount}</p>
          </div>`;

      if (statistics) {
        html += `
          <div class="stats">
            <div class="stat-card">
              <strong>Activos:</strong> ${statistics.totalActive}
            </div>
            <div class="stat-card">
              <strong>Inactivos:</strong> ${statistics.totalInactive}
            </div>
            <div class="stat-card">
              <strong>Convertidos:</strong> ${statistics.totalConverted}
            </div>
            <div class="stat-card">
              <strong>Tasa Conversión:</strong> ${statistics.conversionRate}%
            </div>
          </div>`;
      }

    html += `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Origen</th>
              <th>Fecha Suscripción</th>
              <th>Días</th>
            </tr>
          </thead>
          <tbody>`;

    subscribers.forEach(subscriber => {
      const statusClass = subscriber.convertedToCustomer ? 'converted' : subscriber.isActive ? 'active' : 'inactive';
      html += `
        <tr>
          <td>${subscriber.id}</td>
          <td>${subscriber.email}</td>
          <td>${subscriber.fullName || `${subscriber.firstName} ${subscriber.lastName}`.trim()}</td>
          <td class="${statusClass}">${getStatusText(subscriber)}</td>
          <td>${subscriber.sourcePage || subscriber.sourceCampaign || '-'}</td>
          <td>${new Date(subscriber.createdAt).toLocaleDateString()}</td>
          <td>${subscriber.daysSinceSubscription}</td>
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
        // Success message
        setSuccessMessage(t('export.pdfSuccess', `Reporte PDF generado exitosamente con ${subscribers.length} subscriptores.`));
      };
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError(t('export.pdfError', `Error al generar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`));
    }
  };

  // Handle export format selection
  const handleExportFormat = (format: 'excel' | 'pdf' | 'csv') => {
    setShowExportModal(false);
    switch(format) {
      case 'excel': exportToExcel(); break;
      case 'pdf': exportToPDF(); break;
      case 'csv': exportToCSV(); break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {/* Breadcrumbs - Desktop */}
      <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('navigation.dashboard')}
            </a>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {t('navigation.subscribers', 'Subscriptores')}
          </li>
        </ol>
      </nav>
      
      {/* Mobile Title */}
      <div className="sm:hidden mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('navigation.subscribers', 'Subscriptores')}
        </h1>
      </div>

      {/* Statistics Cards - Vertical Stack for Mobile */}
      {statistics && (
        <div className="sm:hidden space-y-3 mb-6">
          {/* Active Subscribers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mx-auto max-w-sm w-full">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 inline-block mb-2">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{statistics.totalActive}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subscribers.totalActive', 'Subscriptores Activos')}</p>
              </div>
            </div>
          </div>

          {/* Inactive */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mx-auto max-w-sm w-full">
            <div className="text-center">
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 inline-block mb-2">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{statistics.totalInactive}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subscribers.totalInactive', 'Subscriptores Inactivos')}</p>
            </div>
          </div>

          {/* Converted */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mx-auto max-w-sm w-full">
            <div className="text-center">
              <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 inline-block mb-2">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{statistics.totalConverted}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subscribers.converted', 'Convertidos a Clientes')}</p>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mx-auto max-w-sm w-full">
            <div className="text-center">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 inline-block mb-2">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{statistics.thisMonth}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subscribers.thisMonth', 'Nuevos Este Mes')}</p>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 shadow-sm mx-auto max-w-sm w-full">
            <div className="text-center">
              <div className="p-2.5 rounded-lg bg-white dark:bg-gray-800 inline-block mb-2">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{statistics.conversionRate}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">{t('subscribers.conversionRate', 'Tasa de Conversión')}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop Statistics - Keep original */}
      {statistics && (
        <div className="hidden sm:grid grid-cols-2 gap-3 md:grid-cols-5 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 inline-block">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{statistics.totalActive}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('subscribers.totalActive', 'Activos')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 inline-block">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{statistics.totalInactive}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('subscribers.totalInactive', 'Inactivos')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 inline-block">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{statistics.totalConverted}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('subscribers.converted', 'Convertidos')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 inline-block">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{statistics.thisMonth}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('subscribers.thisMonth', 'Este mes')}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 shadow-sm">
            <div className="p-2.5 rounded-lg bg-white dark:bg-gray-800 inline-block">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{statistics.conversionRate}%</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('subscribers.conversionRate', 'Conversión')}</p>
          </div>
        </div>
      )}

      {/* Filters and Actions - Mobile Vertical Stack */}
      <div className="sm:hidden bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm mx-auto max-w-sm w-full">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('subscribers.search', 'Buscar por email o nombre...')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all text-sm"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              onFocus={(e) => {
                e.target.style.borderColor = primaryColor;
                e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = '';
              }}
            />
          </div>
        </div>

        {/* Status Filter - Vertical Stack */}
        <div className="space-y-2 mb-4">
          {[
              { key: '', label: t('common.all', 'Todos'), icon: '📋' },
              { key: 'active', label: t('subscribers.active', 'Activos'), icon: '✅' },
              { key: 'inactive', label: t('subscribers.inactive', 'Inactivos'), icon: '⏸️' },
              { key: 'converted', label: t('subscribers.converted', 'Convertidos'), icon: '👤' },
              { key: 'pending', label: t('subscribers.pending', 'Pendientes'), icon: '⏳' }
            ].map((status) => (
              <button
                key={status.key}
                onClick={() => handleStatusChange(status.key)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-all ${
                  statusFilter === status.key
                    ? 'text-white shadow-lg'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                style={statusFilter === status.key ? { backgroundColor: primaryColor } : {}}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{status.icon}</span>
                  <span className="font-medium">{status.label}</span>
                </div>
                {statusFilter === status.key && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {subscribers.length}
                  </span>
                )}
              </button>
            ))}
        </div>

        {/* Action Buttons - Vertical Stack */}
        <div className="space-y-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full px-4 py-3 text-white rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{t('common.create', 'Crear Nuevo Subscriptor')}</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full px-4 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{t('common.export', 'Exportar Datos')}</span>
          </button>
        </div>
      </div>
      
      {/* Desktop Filters - Keep original */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('subscribers.search', 'Buscar por email o nombre...')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { key: '', label: t('common.all', 'Todos') },
              { key: 'active', label: t('subscribers.active', 'Activos') },
              { key: 'inactive', label: t('subscribers.inactive', 'Inactivos') },
              { key: 'converted', label: t('subscribers.converted', 'Convertidos') },
              { key: 'pending', label: t('subscribers.pending', 'Pendientes') }
            ].map((status) => (
              <button
                key={status.key}
                onClick={() => handleStatusChange(status.key)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === status.key
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={statusFilter === status.key ? { backgroundColor: primaryColor } : {}}
              >
                {status.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {t('common.create', 'Crear')}
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:opacity-90"
            >
              {t('common.export', 'Exportar')}
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="font-medium mb-1">
                {t('error.title', 'Se produjo un error')}
              </div>
              <div className="text-sm">{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Subscribers List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('subscribers.subscriber', 'Suscriptor')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('subscribers.source', 'Origen')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('subscribers.subscribed', 'Suscrito')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('subscribers.status', 'Estado')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('common.actions', 'Acciones')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {subscriber.fullName || subscriber.email}
                      </div>
                      <div className="text-sm text-gray-500">{subscriber.email}</div>
                      {subscriber.phone && (
                        <div className="text-xs text-gray-400">{subscriber.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {subscriber.sourcePage && (
                        <div className="truncate max-w-32">{subscriber.sourcePage}</div>
                      )}
                      {subscriber.sourceCampaign && (
                        <div className="text-xs text-gray-500">{subscriber.sourceCampaign}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(subscriber.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {subscriber.daysSinceSubscription} días
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(subscriber)}`}>
                      {getStatusText(subscriber)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {!subscriber.convertedToCustomer && (
                        <button
                          onClick={() => {
                            setSelectedSubscriber(subscriber);
                            setShowConvertModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title={t('subscribers.convertToCustomer', 'Convertir a cliente')}
                        >
                          👤
                        </button>
                      )}
                      <button
                        onClick={() => toggleSubscriberStatus(subscriber.id, subscriber.isActive)}
                        className={subscriber.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        title={subscriber.isActive ? t('subscribers.deactivate', 'Desactivar') : t('subscribers.activate', 'Activar')}
                      >
                        {subscriber.isActive ? '❌' : '✅'}
                      </button>
                      <button
                        onClick={() => deleteSubscriber(subscriber.id)}
                        className="text-red-600 hover:text-red-900"
                        title={t('common.delete', 'Eliminar')}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - Professional Design */}
        <div className="md:hidden space-y-3 p-3">
          {subscribers.map((subscriber) => (
            <div key={subscriber.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              {/* Header with Status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar Circle */}
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"
                    style={{ backgroundColor: subscriber.convertedToCustomer ? '#9333ea' : subscriber.isActive ? primaryColor : '#9ca3af' }}
                  >
                    {(subscriber.firstName?.[0] || subscriber.email[0]).toUpperCase()}
                  </div>
                  
                  {/* Name and Email */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {subscriber.fullName || subscriber.firstName || subscriber.lastName || 'Sin nombre'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {subscriber.email}
                    </p>
                  </div>
                </div>
                
                {/* Status Badge */}
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(subscriber)}`}>
                  {getStatusText(subscriber)}
                </span>
              </div>
              
              {/* Info Section */}
              <div className="space-y-2 mb-3">
                {/* Phone if exists */}
                {subscriber.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{subscriber.phone}</span>
                  </div>
                )}
                
                {/* Subscription Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(subscriber.createdAt)}</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {subscriber.daysSinceSubscription} días
                  </span>
                </div>
                
                {/* Source */}
                {(subscriber.sourcePage || subscriber.sourceCampaign) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="truncate">
                      {subscriber.sourcePage === 'admin' ? 'Admin' : 
                       subscriber.sourcePage === 'website' ? 'Sitio Web' : 
                       subscriber.sourcePage || subscriber.sourceCampaign}
                    </span>
                  </div>
                )}
                
                {/* Language & Marketing */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg">
                    {subscriber.language === 'es' ? '🇪🇸 Español' : '🇺🇸 English'}
                  </span>
                  {subscriber.acceptedMarketing && (
                    <span className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg">
                      📧 Marketing
                    </span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-1">
                  {!subscriber.convertedToCustomer && (
                    <button
                      onClick={() => {
                        setSelectedSubscriber(subscriber);
                        setShowConvertModal(true);
                      }}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title={t('subscribers.convertToCustomer', 'Convertir a cliente')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => toggleSubscriberStatus(subscriber.id, subscriber.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      subscriber.isActive 
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                        : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    title={subscriber.isActive ? t('subscribers.deactivate', 'Desactivar') : t('subscribers.activate', 'Activar')}
                  >
                    {subscriber.isActive ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <button
                  onClick={() => deleteSubscriber(subscriber.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title={t('common.delete', 'Eliminar')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {subscribers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('subscribers.noResults', 'No se encontraron subscriptores')}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
            >
              {t('common.previous', 'Anterior')}
            </button>
            
            <span className="px-3 py-1 text-sm">
              {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
            >
              {t('common.next', 'Siguiente')}
            </button>
          </div>
        </div>
      )}

      {/* Total count */}
      <div className="text-center mt-4 text-sm text-gray-500">
        {t('subscribers.totalSubscribers', `Total: ${totalCount} subscriptores`)}
      </div>

      {/* Convert to Customer Modal */}
      <ConvertToCustomerModal
        subscriber={selectedSubscriber}
        isOpen={showConvertModal}
        onClose={() => {
          setShowConvertModal(false);
          setSelectedSubscriber(null);
        }}
        onSuccess={async () => {
          setSuccessMessage(t('subscribers.convertSuccess', 'Subscriptor convertido a cliente exitosamente.'));
          await fetchSubscribers();
          await fetchStatistics();
        }}
        primaryColor={primaryColor}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('subscribers.createNew', 'Crear Subscriptor')}
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5266/api/newslettersubscribers', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    email: formData.get('email'),
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    phone: formData.get('phone'),
                    language: formData.get('language') || 'es',
                    acceptedMarketing: formData.get('acceptedMarketing') === 'on',
                    acceptedTerms: true
                  })
                });
                if (response.ok) {
                  setSuccessMessage('Subscriptor creado exitosamente');
                  setShowCreateModal(false);
                  fetchSubscribers();
                  fetchStatistics();
                } else {
                  setError('Error al crear subscriptor');
                }
              } catch (error) {
                setError('Error al crear subscriptor');
              }
            }} className="space-y-4">
              <input name="email" type="email" placeholder="Email" required className="w-full px-3 py-2 border rounded-lg" />
              <input name="firstName" placeholder="Nombre" className="w-full px-3 py-2 border rounded-lg" />
              <input name="lastName" placeholder="Apellido" className="w-full px-3 py-2 border rounded-lg" />
              <input name="phone" placeholder="Teléfono" className="w-full px-3 py-2 border rounded-lg" />
              <select name="language" className="w-full px-3 py-2 border rounded-lg">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
              <label className="flex items-center gap-2">
                <input name="acceptedMarketing" type="checkbox" />
                <span>Acepta marketing</span>
              </label>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 text-white rounded-lg" style={{ backgroundColor: primaryColor }}>Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal (following exact pattern from export-system.md) */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('subscribers.exportData', 'Exportar Subscriptores')}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('subscribers.selectFormat', 'Selecciona el formato que deseas exportar')}
            </p>
            
            <div className="space-y-3">
              {/* Excel Option */}
              <button 
                onClick={() => handleExportFormat('excel')} 
                className="w-full p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 group transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 2h8v2H6V6zm0 4h8v2H6v-2zm0 4h4v2H6v-2z"/>
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Excel</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">.xls format with colors</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
              
              {/* PDF Option */}
              <button 
                onClick={() => handleExportFormat('pdf')} 
                className="w-full p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 group transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">PDF</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Print-ready report with statistics</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
              
              {/* CSV Option */}
              <button 
                onClick={() => handleExportFormat('csv')} 
                className="w-full p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 group transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">CSV</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Comma-separated values</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
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