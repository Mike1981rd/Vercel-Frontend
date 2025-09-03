'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  UserCheck, 
  Shield,
  Download,
  Filter,
  MoreVertical,
  UserX,
  ChevronLeft,
  ChevronRight,
  FileText,
  Table,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Host {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  overallRating: number;
  totalReviews: number;
  responseTimeMinutes: number;
  isSuperhost: boolean;
  isActive: boolean;
  isVerified: boolean;
  joinedDate: string;
  roomCount: number;
}

export default function HostsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedHosts, setSelectedHosts] = useState<number[]>([]);

  // Get primary color from settings
  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  useEffect(() => {
    loadHosts();
  }, []);

  const loadHosts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/hosts');
      setHosts(response.data);
    } catch (error) {
      console.error('Error loading hosts:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleToggleActive = async (host: Host) => {
    const newStatus = !host.isActive;
    const confirmMessage = newStatus 
      ? t('hosts.confirmActivate', 'Are you sure you want to activate this host?')
      : t('hosts.confirmDeactivate', 'Are you sure you want to deactivate this host?');
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      // Use PATCH for partial update or PUT with explicit Content-Type
      const response = await apiClient.patch(`/hosts/${host.id}`, {
        isActive: newStatus
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200 || response.status === 204) {
        await loadHosts();
      }
    } catch (error: any) {
      console.error('Error updating host status:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      alert(t('hosts.errorUpdatingStatus', 'Error updating host status. Please try again.'));
    }
  };

  const filteredHosts = hosts.filter(host => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      host.fullName.toLowerCase().includes(searchLower) ||
      host.email.toLowerCase().includes(searchLower)
    );
    const matchesStatus = selectedStatus === '' || 
                         (selectedStatus === 'active' && host.isActive) ||
                         (selectedStatus === 'inactive' && !host.isActive) ||
                         (selectedStatus === 'verified' && host.isVerified) ||
                         (selectedStatus === 'unverified' && !host.isVerified);
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHosts = filteredHosts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleSelectAll = () => {
    if (selectedHosts.length === paginatedHosts.length) {
      setSelectedHosts([]);
    } else {
      setSelectedHosts(paginatedHosts.map(h => h.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedHosts(prev => 
      prev.includes(id) 
        ? prev.filter(hId => hId !== id)
        : [...prev, id]
    );
  };

  const renderRating = (rating: number) => {
    const stars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={cn(
              'w-3 h-3',
              i < stars ? 'text-yellow-400 fill-current' : 
              i === stars && hasHalf ? 'text-yellow-400 fill-current' : 
              'text-gray-300 dark:text-gray-600'
            )}
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Rating', 'Reviews', 'Rooms', 'Status', 'Joined Date'];
    const csvData = filteredHosts.map(host => [
      host.id,
      host.fullName,
      host.email,
      host.phoneNumber || '',
      host.overallRating,
      host.totalReviews,
      host.roomCount,
      host.isActive ? 'Active' : 'Inactive',
      new Date(host.joinedDate).toLocaleDateString()
    ]);
    
    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `hosts_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    setShowExportModal(false);
  };

  const exportToExcel = () => {
    let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
    html += '<head><meta charset="utf-8"><title>Hosts Export</title></head>';
    html += '<body><table border="1">';
    html += '<tr style="background-color:#f0f0f0;font-weight:bold;">';
    html += '<th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Rating</th><th>Reviews</th><th>Rooms</th><th>Status</th><th>Joined Date</th></tr>';
    
    filteredHosts.forEach(host => {
      html += '<tr>';
      html += `<td>${host.id}</td>`;
      html += `<td>${host.fullName}</td>`;
      html += `<td>${host.email}</td>`;
      html += `<td>${host.phoneNumber || ''}</td>`;
      html += `<td>${host.overallRating}</td>`;
      html += `<td>${host.totalReviews}</td>`;
      html += `<td>${host.roomCount}</td>`;
      html += `<td style="color:${host.isActive ? 'green' : 'red'}">${host.isActive ? 'Active' : 'Inactive'}</td>`;
      html += `<td>${new Date(host.joinedDate).toLocaleDateString()}</td>`;
      html += '</tr>';
    });
    
    html += '</table></body></html>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `hosts_${new Date().toISOString().split('T')[0]}.xls`);
    link.click();
    setShowExportModal(false);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hosts Report</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f0f0f0; padding: 10px; text-align: left; }
          td { padding: 8px; border: 1px solid #ddd; }
          h1 { color: #333; }
          @media print {
            body { margin: 0; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <h1>Hosts Report - ${new Date().toLocaleDateString()}</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Rating</th>
              <th>Reviews</th>
              <th>Rooms</th>
              <th>Status</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>`;
    
    filteredHosts.forEach(host => {
      html += `
        <tr>
          <td>${host.id}</td>
          <td>${host.fullName}</td>
          <td>${host.email}</td>
          <td>${host.phoneNumber || '-'}</td>
          <td>${host.overallRating.toFixed(1)}</td>
          <td>${host.totalReviews}</td>
          <td>${host.roomCount}</td>
          <td>${host.isActive ? 'Active' : 'Inactive'}</td>
          <td>${new Date(host.joinedDate).toLocaleDateString()}</td>
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
    setShowExportModal(false);
  };

  return (
    <div className="w-full min-h-screen">
      {/* Breadcrumbs - Desktop */}
      <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('navigation.dashboard', 'Dashboard')}
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {t('navigation.hosts', 'Hosts')}
          </li>
        </ol>
      </nav>

      {/* Mobile Title - Centered */}
      <div className="sm:hidden mb-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('navigation.hosts', 'Hosts')}
        </h1>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        {/* Header - Hidden on mobile since we have the centered title */}
        <div className="hidden sm:block p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {t('hosts.title', 'Hosts')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('hosts.subtitle', 'Manage your platform hosts')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-5">
          {/* Actions Bar - Optimized for sidebar visibility */}
          <div className="flex flex-wrap gap-3">
            {/* Search - 50% width reduction */}
            <div className="w-full sm:w-80 lg:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('hosts.searchPlaceholder', 'Search hosts...')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': primaryColor } as any}
            >
              <option value="">{t('common.allStatus', 'All Status')}</option>
              <option value="active">{t('common.active', 'Active')}</option>
              <option value="inactive">{t('common.inactive', 'Inactive')}</option>
              <option value="verified">{t('hosts.status.verified', 'Verified')}</option>
              <option value="unverified">{t('hosts.status.unverified', 'Unverified')}</option>
            </select>

            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.export', 'Export')}</span>
            </button>

            {/* Add Host Button */}
            <Link
              href="/dashboard/hosts/create"
              className="flex items-center gap-2 px-3 py-2 text-sm text-white rounded-lg transition-colors whitespace-nowrap ml-auto"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4" />
              <span>{t('hosts.addHost', 'Add Host')}</span>
            </Link>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-10 mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <>
              {/* Hosts Table - Desktop */}
              <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={selectedHosts.length === paginatedHosts.length && paginatedHosts.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300 dark:border-gray-600 w-3.5 h-3.5"
                          />
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('hosts.table.name')}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('hosts.table.email')}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('hosts.table.rating')}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('hosts.table.rooms')}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('hosts.table.status')}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('hosts.table.joined')}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('hosts.table.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedHosts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                            {t('hosts.noResults')}
                          </td>
                        </tr>
                      ) : (
                        paginatedHosts.map((host) => (
                          <tr key={host.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={selectedHosts.includes(host.id)}
                                onChange={() => toggleSelect(host.id)}
                                className="rounded border-gray-300 dark:border-gray-600 w-3.5 h-3.5"
                              />
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                {host.profilePicture ? (
                                  <Image
                                    src={host.profilePicture}
                                    alt={host.fullName}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                    <span className="text-gray-600 dark:text-gray-300 font-semibold text-xs">
                                      {host.firstName[0]}{host.lastName[0]}
                                    </span>
                                  </div>
                                )}
                                <div className="ml-2">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                    {host.fullName}
                                    {host.isSuperhost && (
                                      <Shield className="w-3 h-3 text-yellow-500" />
                                    )}
                                    {host.isVerified && (
                                      <UserCheck className="w-3 h-3 text-green-500" />
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {host.responseTimeMinutes} {t('hosts.metrics.responseTimeMinutes')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {host.email}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {renderRating(host.overallRating)}
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {host.totalReviews} {t('hosts.table.reviews').toLowerCase()}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {host.roomCount}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <button
                                onClick={() => handleToggleActive(host)}
                                className={cn(
                                  'px-2 py-0.5 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity',
                                  host.isActive
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                )}
                              >
                                {host.isActive ? t('hosts.status.active') : t('hosts.status.inactive')}
                              </button>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(host.joinedDate).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => router.push(`/dashboard/hosts/${host.id}/edit`)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                  title={t('common.edit')}
                                >
                                  <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                                <button
                                  onClick={() => handleToggleActive(host)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                  title={host.isActive ? t('hosts.deactivate') : t('hosts.activate')}
                                >
                                  {host.isActive ? (
                                    <UserX className="w-4 h-4 text-orange-500" />
                                  ) : (
                                    <UserCheck className="w-4 h-4 text-green-500" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination for Desktop - Inside table card */}
                <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {t('common.showing', 'Showing')}{' '}
                        <span className="font-medium">{startIndex + 1}</span> {t('common.to', 'to')}{' '}
                        <span className="font-medium">{Math.min(endIndex, filteredHosts.length)}</span> {t('common.of', 'of')}{' '}
                        <span className="font-medium">{filteredHosts.length}</span> {t('common.results', 'results')}
                      </p>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-1.5 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          const pageNumber = i + 1;
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={cn(
                                'relative inline-flex items-center px-3 py-1.5 border text-xs font-medium transition-colors',
                                currentPage === pageNumber
                                  ? 'z-10 text-white border-transparent'
                                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              )}
                              style={currentPage === pageNumber ? {
                                backgroundColor: primaryColor,
                                borderColor: primaryColor
                              } : {}}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                        {totalPages > 5 && (
                          <>
                            <span className="relative inline-flex items-center px-2 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                              ...
                            </span>
                            <button
                              onClick={() => handlePageChange(totalPages)}
                              className={cn(
                                'relative inline-flex items-center px-3 py-1.5 border text-xs font-medium transition-colors',
                                currentPage === totalPages
                                  ? 'z-10 text-white border-transparent'
                                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              )}
                              style={currentPage === totalPages ? {
                                backgroundColor: primaryColor,
                                borderColor: primaryColor
                              } : {}}
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-1.5 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </nav>
                    </div>
                  </div>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden mt-4">
                {filteredHosts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    {t('hosts.noResults')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedHosts.map((host) => (
                      <div key={host.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {host.profilePicture ? (
                              <Image
                                src={host.profilePicture}
                                alt={host.fullName}
                                width={48}
                                height={48}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <div 
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                                style={{ backgroundColor: primaryColor }}
                              >
                                {host.firstName[0]}{host.lastName[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {host.fullName}
                                {host.isSuperhost && (
                                  <Shield className="w-4 h-4 text-yellow-500" />
                                )}
                                {host.isVerified && (
                                  <UserCheck className="w-4 h-4 text-green-500" />
                                )}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {host.responseTimeMinutes} {t('hosts.metrics.responseTimeMinutes')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => router.push(`/dashboard/hosts/${host.id}/edit`)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(host)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              {host.isActive ? (
                                <UserX className="w-4 h-4 text-orange-500" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-green-500" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('hosts.table.email')}: </span>
                            <span className="text-gray-900 dark:text-white">{host.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('hosts.table.rooms')}: </span>
                            <span className="text-gray-900 dark:text-white">{host.roomCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('hosts.table.rating')}: </span>
                            <span className="text-gray-900 dark:text-white">
                              {host.overallRating.toFixed(1)} ({host.totalReviews} {t('hosts.table.reviews').toLowerCase()})
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('hosts.table.status')}: </span>
                            <button
                              onClick={() => handleToggleActive(host)}
                              className={cn(
                                'px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity',
                                host.isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              )}
                            >
                              {host.isActive ? t('hosts.status.active') : t('hosts.status.inactive')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Mobile Pagination */}
                <div className="mt-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 transition-colors"
                        style={currentPage > 1 ? {
                          color: primaryColor,
                          borderColor: primaryColor
                        } : {
                          color: '#9CA3AF'
                        }}
                      >
                        {t('common.previous', 'Previous')}
                      </button>
                      <span className="text-xs font-medium" style={{ color: primaryColor }}>
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 transition-colors"
                        style={currentPage < totalPages ? {
                          color: primaryColor,
                          borderColor: primaryColor
                        } : {
                          color: '#9CA3AF'
                        }}
                      >
                        {t('common.next', 'Next')}
                      </button>
                    </div>
                  </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('common.exportData', 'Export Data')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('common.exportDescription', 'Choose a format to export the data')}
            </p>
            
            <div className="space-y-3">
              {/* Excel Option */}
              <button
                onClick={exportToExcel}
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 group transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Excel</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">.xls format</p>
                </div>
              </button>

              {/* PDF Option */}
              <button
                onClick={exportToPDF}
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 group transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">PDF</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Print or save as PDF</p>
                </div>
              </button>

              {/* CSV Option */}
              <button
                onClick={exportToCSV}
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 group transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Table className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">CSV</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Comma-separated values</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="mt-6 w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}