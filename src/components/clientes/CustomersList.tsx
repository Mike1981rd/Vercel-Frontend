'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Customer, CustomerFilter, customerAPI } from '@/lib/api/customers';
import { getImageUrl } from '@/lib/api-url';
import { getInitials } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';
import { 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserX,
  UserCheck
} from 'lucide-react';

export function CustomersList() {
  const { t } = useI18n();
  const router = useRouter();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  
  const [filters, setFilters] = useState<CustomerFilter>({
    page: 1,
    size: 10,
    search: '',
    status: 'Active',
    country: '',
    sortBy: 'createdAt',
    sortDescending: true
  });

  // Get primary color from settings
  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const result = await customerAPI.getCustomers(filters);
      setCustomers(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  // Handlers
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('customers.confirmDelete'))) {
      try {
        await customerAPI.deleteCustomer(id);
        await fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleToggleStatus = async (customer: Customer) => {
    const newStatus = customer.status === 'Active' ? 'Inactive' : 'Active';
    const confirmMessage = customer.status === 'Active' 
      ? t('customers.confirmDeactivate')
      : t('customers.confirmActivate');
    
    if (confirm(confirmMessage)) {
      try {
        await customerAPI.updateCustomer(customer.id, { status: newStatus });
        await fetchCustomers();
      } catch (error) {
        console.error('Error updating customer status:', error);
      }
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (format === 'csv') {
      customerAPI.exportToCSV(customers);
    }
    // Implement other formats as needed
    setShowExportMenu(false);
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedCustomers(prev => 
      prev.includes(id) 
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

  // Get country flag emoji
  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'USA': '🇺🇸',
      'Ukraine': '🇺🇦',
      'Libya': '🇱🇾',
      'Portugal': '🇵🇹',
      'Turkmenistan': '🇹🇲',
      'Argentina': '🇦🇷',
      'Mexico': '🇲🇽',
      'Bhutan': '🇧🇹',
      'Jordan': '🇯🇴',
      'China': '🇨🇳'
    };
    return flags[country] || '🏳️';
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatMoney = (amount: number, currency?: string) => {
    try {
      if (!currency) return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formatted = new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
      // Convert to "CUR 1,234.56" format
      return `${currency} ${formatted.replace(/[^0-9.,\s]/g, '').trim()}`;
    } catch {
      return `${currency || ''} ${amount.toFixed(2)}`.trim();
    }
  };

  return (
    <div className="w-full">
      {/* Header - Centered on Mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 mb-6">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('customers.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('customers.subtitle')}
          </p>
        </div>
        
        <button
          onClick={() => router.push('/dashboard/clientes/new')}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors w-full sm:w-auto justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus className="w-4 h-4" />
          {t('customers.addCustomer')}
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('customers.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor } as any}
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['Active', 'Inactive', 'Pending'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.status === status
                    ? 'text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                style={filters.status === status ? { backgroundColor: primaryColor } : {}}
              >
                {t(`customers.status.${status.toLowerCase()}`, status)}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t('common.export')}
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === customers.length && customers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                    style={{ accentColor: primaryColor }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('customers.table.customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('customers.table.customerId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('customers.table.country')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('customers.table.orders')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('customers.table.totalSpent')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('customers.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {t('customers.noResults')}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => toggleSelect(customer.id)}
                        className="rounded"
                        style={{ accentColor: primaryColor }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {customer.avatar ? (
                            <img
                              src={getImageUrl(customer.avatar)}
                              alt={customer.fullName}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = document.createElement('div');
                                fallback.className = 'w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold';
                                (fallback as any).style = `background-color: ${primaryColor}`;
                                fallback.innerText = getInitials(customer.fullName);
                                e.currentTarget.parentElement?.appendChild(fallback);
                              }}
                            />
                          ) : (
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {getInitials(customer.fullName)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{customer.fullName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {customer.customerId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCountryFlag(customer.country)}</span>
                        <span className="text-gray-900 dark:text-white">{customer.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {formatMoney(customer.totalSpent, (customer as any).preferredCurrency || 'DOP')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/clientes/${customer.id}`)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(customer)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          title={customer.status === 'Active' ? t('customers.deactivate') : t('customers.activate')}
                        >
                          {customer.status === 'Active' ? (
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

        {/* Mobile Cards */}
        <div className="sm:hidden">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              {t('common.loading')}
            </div>
          ) : customers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {t('customers.noResults')}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map((customer) => (
                <div key={customer.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {customer.avatar ? (
                        <img
                          src={getImageUrl(customer.avatar)}
                          alt={customer.fullName}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold';
                            (fallback as any).style = `background-color: ${primaryColor}`;
                            fallback.innerText = getInitials(customer.fullName);
                            e.currentTarget.parentElement?.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {getInitials(customer.fullName)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{customer.fullName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{customer.customerId}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => router.push(`/dashboard/clientes/${customer.id}`)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(customer)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        {customer.status === 'Active' ? (
                          <UserX className="w-4 h-4 text-orange-500" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('customers.email')}: </span>
                      <span className="text-gray-900 dark:text-white">{customer.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('customers.country')}: </span>
                      <span className="text-gray-900 dark:text-white">
                        {getCountryFlag(customer.country)} {customer.country}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('customers.totalOrders')}: </span>
                      <span className="text-gray-900 dark:text-white">{customer.totalOrders}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('customers.spent')}: </span>
                      <span className="text-gray-900 dark:text-white">{formatMoney(customer.totalSpent, (customer as any).preferredCurrency || 'DOP')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('common.showing')} {((filters.page! - 1) * filters.size!) + 1} {t('common.to')} {Math.min(filters.page! * filters.size!, totalCount)} {t('common.of')} {totalCount} {t('common.entries')}
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={filters.page === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      filters.page === page
                        ? 'text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    style={filters.page === page ? { backgroundColor: primaryColor } : {}}
                  >
                    {page}
                  </button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <span className="px-2">...</span>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      filters.page === totalPages
                        ? 'text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    style={filters.page === totalPages ? { backgroundColor: primaryColor } : {}}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={filters.page === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
