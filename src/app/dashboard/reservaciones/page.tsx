'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Calendar, Users, CheckCircle, XCircle, 
  Clock, Download, Plus, Edit2, Eye, Filter,
  Bed, TrendingUp, CreditCard, ChevronRight,
  Mail, Phone, MapPin, Building, User
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getApiEndpoint, getBaseUrl } from '@/lib/api-url';
import { ExportModal } from '@/components/ExportModal';

// Types
interface Reservation {
  id: number;
  guestName?: string;
  guestEmail?: string;
  guestAvatar?: string;
  customerName?: string;
  customerEmail?: string;
  customerAvatar?: string;
  roomName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  numberOfNights: number;
}

interface Company {
  currency?: string;
  primaryColor?: string;
}

// Avatar Component
const Avatar = ({ name, email, image }: { name?: string | null; email?: string | null; image?: string | null }) => {
  const getImageUrl = (imagePath?: string | null) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const base = getBaseUrl();
    return `${base}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };
  
  const imageUrl = getImageUrl(image);
  const initials = (name || email || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (imageUrl) {
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
        <img 
          src={imageUrl} 
          alt={name || email || 'User'}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-400">${initials}</div>`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
      {initials}
    </div>
  );
};

export default function ReservacionesPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { /*selectedCurrency,*/ baseCurrency } = useCurrency();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [company, setCompany] = useState<Company | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState<string>('');
  const [exportEndDate, setExportEndDate] = useState<string>('');
  const [message, setMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');

  // Get primary color from localStorage or company data
  useEffect(() => {
    // First, try to get from localStorage
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        if (parsed.primaryColor) {
          setPrimaryColor(parsed.primaryColor);
        }
      } catch (e) {
        console.error('Error parsing UI settings:', e);
      }
    }
  }, []);

  // Fetch company data
  useEffect(() => {
    fetch(getApiEndpoint('/company/current'), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setCompany(data);
        // Update primary color if company has one and localStorage doesn't
        if (data.primaryColor && !localStorage.getItem('ui-settings')) {
          setPrimaryColor(data.primaryColor);
        }
      })
      .catch(err => console.error('Error fetching company:', err));
  }, []);

  // Fetch reservations
  useEffect(() => {
    fetchReservations();
  }, [filter, dateFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const today = new Date();
      if (dateFilter === 'today') {
        params.append('startDate', today.toISOString().split('T')[0]);
        params.append('endDate', today.toISOString().split('T')[0]);
      } else if (dateFilter === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        params.append('startDate', weekStart.toISOString().split('T')[0]);
        params.append('endDate', weekEnd.toISOString().split('T')[0]);
      } else if (dateFilter === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        params.append('startDate', monthStart.toISOString().split('T')[0]);
        params.append('endDate', monthEnd.toISOString().split('T')[0]);
      }
      // Si no hay filtro de fecha, no enviar parámetros de fecha

      const headers: Record<string, string> = {};
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const query = params.toString();
      const url = getApiEndpoint(query ? `/reservations?${query}` : '/reservations');
      let response = await fetch(url, { headers });

      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        setReservations(Array.isArray(data) ? data : []);
      } else {
        // Fallback retry: try without Authorization header and without querystring
        try {
          const fallbackUrl = getApiEndpoint('/reservations');
          const fallbackResp = await fetch(fallbackUrl);
          if (fallbackResp.ok) {
            const data = await fallbackResp.json();
            setReservations(Array.isArray(data) ? data : []);
          } else {
            // Only log as error for server errors; 4xx will be common if unauthorized
            const status = response.status;
            if (status >= 500) {
              console.error('Failed to fetch reservations:', status);
            }
            setReservations([]);
          }
        } catch (e) {
          // Network or other error
          setReservations([]);
        }
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (newFilter: string) => {
    if (newFilter !== filter) {
      setFilter(newFilter);
    }
  };

  const handleDateFilterChange = (newDateFilter: string) => {
    if (newDateFilter !== dateFilter) {
      setDateFilter(newDateFilter);
    }
  };

  const handleExport = (format: string) => {
    try {
      // Parse date range
      const start = exportStartDate ? new Date(exportStartDate) : null;
      const end = exportEndDate ? new Date(exportEndDate) : null;
      if (start) start.setHours(0,0,0,0);
      if (end) end.setHours(23,59,59,999);

      const inRange = (r: Reservation) => {
        if (!start && !end) return true;
        const d = new Date(r.checkInDate);
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
      };

      const rows = (reservations || []).filter(inRange);

      if (rows.length === 0) {
        setMessage({ type: 'error', text: 'No hay reservaciones en ese rango' });
        setTimeout(() => setMessage(null), 2500);
        return;
      }

      if (format === 'csv') {
        const headers = ['ID','Cliente','Email','Habitación','Tipo','Check-In','Check-Out','Noches','Estado','Total'];
        const data = rows.map(r => [
          r.id,
          r.guestName || r.customerName || '',
          r.guestEmail || r.customerEmail || '',
          r.roomName,
          r.roomType,
          new Date(r.checkInDate).toLocaleString(),
          new Date(r.checkOutDate).toLocaleString(),
          r.numberOfNights,
          r.status,
          (r.totalAmount || 0).toFixed(2)
        ]);
        let csv = '\uFEFF' + headers.join(',') + '\n';
        data.forEach(row => { csv += row.map(c => `"${(c ?? '').toString().replace(/"/g,'""')}"`).join(',') + '\n'; });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `reservations_${exportStartDate || 'all'}_${exportEndDate || 'all'}.csv`;
        a.click();
      } else if (format === 'excel') {
        let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
        html += '<head><meta charset="utf-8"><title>Reservations Export</title></head><body><table border="1">';
        html += '<tr style="background:#f0f0f0;font-weight:bold;"><th>ID</th><th>Cliente</th><th>Email</th><th>Habitación</th><th>Tipo</th><th>Check-In</th><th>Check-Out</th><th>Noches</th><th>Estado</th><th>Total</th></tr>';
        rows.forEach(r => {
          html += `<tr><td>${r.id}</td><td>${(r.guestName||r.customerName)||''}</td><td>${(r.guestEmail||r.customerEmail)||''}</td>`
               + `<td>${r.roomName}</td><td>${r.roomType}</td><td>${new Date(r.checkInDate).toLocaleString()}</td><td>${new Date(r.checkOutDate).toLocaleString()}</td>`
               + `<td>${r.numberOfNights}</td><td>${r.status}</td><td>${(r.totalAmount||0).toFixed(2)}</td></tr>`;
        });
        html += '</table></body></html>';
        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `reservations_${exportStartDate || 'all'}_${exportEndDate || 'all'}.xls`;
        a.click();
      } else if (format === 'pdf') {
        const w = window.open('', '_blank');
        if (!w) { alert('Permite ventanas emergentes para exportar PDF'); return; }
        const body = rows.map(r => `<tr>
          <td>${r.id}</td><td>${(r.guestName||r.customerName)||''}</td><td>${(r.guestEmail||r.customerEmail)||''}</td>
          <td>${r.roomName}</td><td>${r.roomType}</td><td>${new Date(r.checkInDate).toLocaleString()}</td><td>${new Date(r.checkOutDate).toLocaleString()}</td>
          <td>${r.numberOfNights}</td><td>${r.status}</td><td>${(r.totalAmount||0).toFixed(2)}</td>
        </tr>`).join('');
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Reservations</title>
          <style>body{font-family:Arial;padding:16px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:6px;font-size:12px;} th{background:#f0f0f0;}</style>
        </head><body>
          <h1>Reservaciones ${exportStartDate||''} ${exportEndDate?('→ '+exportEndDate):''}</h1>
          <table><thead><tr><th>ID</th><th>Cliente</th><th>Email</th><th>Hab.</th><th>Tipo</th><th>Check-In</th><th>Check-Out</th><th>Noches</th><th>Estado</th><th>Total</th></tr></thead>
          <tbody>${body}</tbody></table>
        </body></html>`;
        w.document.write(html);
        w.document.close();
        w.onload = () => w.print();
      }

      setShowExportModal(false);
      setMessage({ type: 'success', text: 'Exportación completada' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ type: 'error', text: 'Error al exportar' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    if (!Array.isArray(reservations)) return [];
    
    return reservations.filter(reservation => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        reservation.guestName?.toLowerCase().includes(searchLower) ||
        reservation.guestEmail?.toLowerCase().includes(searchLower) ||
        reservation.roomName?.toLowerCase().includes(searchLower);
      
      return matchesSearch;
    });
  }, [reservations, searchQuery]);

  // Calculate stats
  const confirmedCount = Array.isArray(reservations) ? reservations.filter(r => r.status === 'Confirmed').length : 0;
  const todayCheckIns = Array.isArray(reservations) ? reservations.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.checkInDate?.startsWith(today);
  }).length : 0;
  const totalRevenue = Array.isArray(reservations) 
    ? reservations
        .filter(r => r.status !== 'Cancelled')
        .reduce((sum, r) => sum + (r.totalAmount || 0), 0)
    : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    try {
      const currency = (company?.currency as any) || baseCurrency || 'DOP';
      // Use code display and en-US for separators like 1,500.00
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'code',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0);
    } catch {
      return `${(company?.currency || baseCurrency || 'DOP')} ${(amount || 0).toFixed(2)}`;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: { [key: string]: string } = {
      'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'Confirmed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'CheckedIn': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'CheckedOut': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };

    const getStatusLabel = (status: string) => {
      switch(status) {
        case 'Pending': return t('reservations.statusLabels.pending', 'Pendiente');
        case 'Confirmed': return t('reservations.statusLabels.confirmed', 'Confirmada');
        case 'CheckedIn': return t('reservations.statusLabels.checkedIn', 'Check-In');
        case 'CheckedOut': return t('reservations.statusLabels.checkedOut', 'Check-Out');
        case 'Cancelled': return t('reservations.statusLabels.cancelled', 'Cancelada');
        default: return status;
      }
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-400 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">{t('common.loading', 'Cargando...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('reservations.title', 'Reservaciones')}
            </h1>
            <button
              onClick={() => router.push('/dashboard/reservaciones/nuevo')}
              className="px-4 py-2.5 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
              style={{ 
                backgroundColor: primaryColor,
                filter: 'brightness(1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
            >
              <Plus className="w-4 h-4" />
              <span>{t('reservations.new', 'Nueva')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('reservations.title', 'Reservaciones')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('reservations.subtitle', 'Gestiona las reservaciones de habitaciones')}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/reservaciones/nuevo')}
              className="px-5 py-2.5 text-white rounded-xl flex items-center gap-2 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              style={{ 
                backgroundColor: primaryColor,
                filter: 'brightness(1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
            >
              <Plus className="w-5 h-5" />
              <span>{t('reservations.new', 'Nueva Reservación')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Stats Cards - Stacked Vertically and Centered */}
      <div className="sm:hidden px-4 py-4">
        <div className="flex flex-col items-center space-y-3 max-w-sm mx-auto">
          {/* Total Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">{t('common.total', 'Total')}</span>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredReservations.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmed Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">{t('status.confirmed', 'Confirmadas')}</span>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {confirmedCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Today Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">{t('common.today', 'Hoy')}</span>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todayCheckIns}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
                  <TrendingUp className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">{t('common.revenue', 'Ingresos')}</span>
                  <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters and Search */}
      <div className="sm:hidden">
        {/* Date Filter Pills - Vertical Stack */}
        <div className="px-4 pb-3">
          <div className="flex flex-col items-center space-y-2 max-w-sm mx-auto">
            {['today', 'week', 'month', 'all'].map((option) => (
              <button
                key={option}
                onClick={() => setDateFilter(option)}
                disabled={saving}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  dateFilter === option
                    ? 'text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: dateFilter === option ? primaryColor : undefined
                }}
              >
                {option === 'today' && t('reservations.filters.today', 'Hoy')}
                {option === 'week' && t('reservations.filters.week', 'Esta Semana')}
                {option === 'month' && t('reservations.filters.month', 'Este Mes')}
                {option === 'all' && t('reservations.filters.all', 'Todas')}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="max-w-sm mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('reservations.searchPlaceholder', 'Buscar cliente o habitación...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:text-white transition-all shadow-sm"
                style={{ '--tw-ring-color': primaryColor } as any}
              />
            </div>
          </div>
        </div>

        {/* Status Filters - Vertical Stack */}
        <div className="px-4 pb-4">
          <div className="flex flex-col items-center space-y-2 max-w-sm mx-auto">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t('reservations.filterByStatus', 'Filtrar por estado')}
            </p>
            {['all', 'Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                disabled={saving}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  filter === status
                    ? 'text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: filter === status ? primaryColor : undefined
                }}
              >
                {status === 'all' && t('reservations.filters.all', 'Todas las Reservaciones')}
                {status === 'Pending' && t('reservations.filters.pending', '⏳ Pendientes')}
                {status === 'Confirmed' && t('reservations.filters.confirmed', '✅ Confirmadas')}
                {status === 'CheckedIn' && t('reservations.filters.checkedIn', '🔑 Check-In')}
                {status === 'CheckedOut' && t('reservations.filters.checkedOut', '✈️ Check-Out')}
                {status === 'Cancelled' && t('reservations.filters.cancelled', '❌ Canceladas')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile List View - Vertical Stack */}
      <div className="sm:hidden">
        {filteredReservations.length === 0 ? (
          <div className="px-4 py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {t('reservations.noReservations', 'No se encontraron reservaciones')}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {t('reservations.noReservationsDesc', 'Intenta ajustar los filtros')}
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4 space-y-3 pb-6">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                onClick={() => router.push(`/dashboard/reservaciones/${reservation.id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 active:scale-[0.98] transition-transform"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      name={reservation.guestName || reservation.customerName || null} 
                      email={reservation.guestEmail || reservation.customerEmail || null}
                      image={reservation.guestAvatar || reservation.customerAvatar || null}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {reservation.guestName || 'Sin nombre'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {reservation.guestEmail || 'Sin email'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>

                {/* Room Info */}
                <div className="flex items-center gap-2 mb-2">
                  <Bed className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {reservation.roomName} - {reservation.roomType}
                  </span>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDate(reservation.checkInDate)} - {formatDate(reservation.checkOutDate)}
                  </span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">
                    {reservation.numberOfNights} {t('common.nights', 'noches')}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-lg font-semibold" style={{ color: primaryColor }}>
                    {formatCurrency(reservation.totalAmount)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/reservaciones/${reservation.id}/editar`);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Content Container */}
      <div className="hidden sm:block p-6">
        {/* Desktop Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reservations.stats.total', 'TOTAL')}</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {filteredReservations.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('reservations.stats.totalDesc', 'Reservaciones totales')}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reservations.stats.confirmed', 'CONFIRMADAS')}</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {confirmedCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('reservations.stats.confirmedDesc', 'Listas para check-in')}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.today', 'HOY')}</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {todayCheckIns}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('reservations.stats.todayDesc', 'Check-ins programados')}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${primaryColor}20` }}>
                <TrendingUp className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reservations.stats.revenue', 'INGRESOS')}</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('reservations.stats.revenueDesc', 'Total generado')}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Date Range Filters */}
            <div className="flex gap-2">
              {['today', 'week', 'month', 'all'].map((option) => (
                <button
                  key={option}
                  onClick={() => setDateFilter(option)}
                  disabled={saving}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    dateFilter === option
                      ? 'text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: dateFilter === option ? primaryColor : undefined
                  }}
                >
                  {option === 'today' && t('reservations.filters.today', 'Hoy')}
                  {option === 'week' && t('reservations.filters.week', 'Esta Semana')}
                  {option === 'month' && t('reservations.filters.month', 'Este Mes')}
                  {option === 'all' && t('reservations.filters.all', 'Todas')}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('reservations.searchPlaceholder', 'Buscar por cliente o habitación...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:text-white transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={() => setShowDateRangeModal(true)}
              disabled={saving || filteredReservations.length === 0}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>{t('common.export', 'Exportar')}</span>
            </button>
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {['all', 'Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                disabled={saving}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === status
                    ? 'text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: filter === status ? primaryColor : undefined
                }}
              >
                {status === 'all' && t('reservations.filters.all', 'Todas')}
                {status === 'Pending' && t('reservations.filters.pending', 'Pendientes')}
                {status === 'Confirmed' && t('reservations.filters.confirmed', 'Confirmadas')}
                {status === 'CheckedIn' && t('reservations.filters.checkedIn', 'Check-In')}
                {status === 'CheckedOut' && t('reservations.filters.checkedOut', 'Check-Out')}
                {status === 'Cancelled' && t('reservations.filters.cancelled', 'Canceladas')}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('reservations.table.guest', 'Cliente')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('reservations.table.room', 'Habitación')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('reservations.table.dates', 'Fechas')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('reservations.table.amount', 'Monto')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('reservations.table.status', 'Estado')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('reservations.table.actions', 'Acciones')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          {t('reservations.noReservations', 'No se encontraron reservaciones')}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          {t('reservations.noReservationsDesc', 'Intenta ajustar los filtros o crear una nueva reservación')}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => (
                    <tr 
                      key={reservation.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/reservaciones/${reservation.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            name={reservation.guestName || reservation.customerName || null} 
                            email={reservation.guestEmail || reservation.customerEmail || null}
                            image={reservation.guestAvatar || reservation.customerAvatar || null}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {reservation.guestName || reservation.customerName || 'Sin nombre'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {reservation.guestEmail || reservation.customerEmail || 'Sin email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {reservation.roomName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {reservation.roomType}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {reservation.numberOfNights} {t('reservations.table.nights', 'noches')}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(reservation.totalAmount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(reservation.status)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/reservaciones/${reservation.id}`);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredReservations.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('reservations.messages.showing', 'Mostrando')} {filteredReservations.length} {t('common.of', 'de')} {filteredReservations.length} {t('navigation.reservaciones', 'reservaciones')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        primaryColor={primaryColor}
      />

      {/* Date Range Modal for Export */}
      {showDateRangeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reservations.export.selectRange', 'Selecciona el rango de fechas')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t('reservations.export.from', 'Desde')}</label>
                <input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t('reservations.export.to', 'Hasta')}</label>
                <input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowDateRangeModal(false)} className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">{t('common.cancel','Cancelar')}</button>
              <button onClick={() => { setShowDateRangeModal(false); setShowExportModal(true); }} className="px-3 py-1.5 text-sm rounded-md text-white" style={{ backgroundColor: primaryColor }}>{t('common.continue','Continuar')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Message Toast */}
      {message && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg z-50 ${
          message.type === 'success' 
            ? 'bg-emerald-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
