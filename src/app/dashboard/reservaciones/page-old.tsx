'use client';

import { useState, useEffect } from 'react';
import { Calendar, Search, Download, ChevronRight, User, Bed, Clock, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Reservation {
  id: number;
  guestName: string;
  guestEmail: string;
  roomName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  numberOfNights: number;
}

export default function ReservacionesPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
    fetchReservations();
  }, []);

  const fetchReservations = async (status?: string, startDate?: string, endDate?: string) => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5266/api/reservations';
      const params = new URLSearchParams();
      
      if (status && status !== 'all') params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error:', response.status, error);
        setMessage({ type: 'error', text: 'Error al cargar las reservaciones' });
        return;
      }

      const result = await response.json();
      setReservations(result.data || []);
      
      if (result.message) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setMessage({ type: 'error', text: 'Error de conexión al servidor' });
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (filterType: string) => {
    setDateFilter(filterType);
    const today = new Date();
    let startDate, endDate;

    switch (filterType) {
      case 'today':
        startDate = today.toISOString().split('T')[0];
        endDate = startDate;
        break;
      case 'week':
        const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        startDate = today.toISOString().split('T')[0];
        endDate = weekEnd.toISOString().split('T')[0];
        break;
      case 'month':
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        startDate = today.toISOString().split('T')[0];
        endDate = monthEnd.toISOString().split('T')[0];
        break;
      default:
        fetchReservations(filter === 'all' ? undefined : filter);
        return;
    }

    fetchReservations(filter === 'all' ? undefined : filter, startDate, endDate);
  };

  const handleStatusFilterChange = (status: string) => {
    setFilter(status);
    if (dateFilter === 'all') {
      fetchReservations(status === 'all' ? undefined : status);
    } else {
      handleDateFilterChange(dateFilter);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      'Confirmed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmada' },
      'CheckedIn': { bg: 'bg-green-100', text: 'text-green-800', label: 'Check-In' },
      'CheckedOut': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Check-Out' },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  const filteredReservations = reservations.filter(reservation => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return reservation.guestName.toLowerCase().includes(query) ||
             reservation.guestEmail.toLowerCase().includes(query) ||
             reservation.roomName.toLowerCase().includes(query);
    }
    return true;
  });

  const exportData = () => {
    const csvContent = [
      ['ID', 'Cliente', 'Email', 'Habitación', 'Check-In', 'Check-Out', 'Noches', 'Total', 'Estado'],
      ...filteredReservations.map(r => [
        r.id,
        r.guestName,
        r.guestEmail,
        `${r.roomName} (${r.roomType})`,
        formatDate(r.checkInDate),
        formatDate(r.checkOutDate),
        r.numberOfNights,
        r.totalAmount,
        getStatusBadge(r.status).props.children
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservaciones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    setMessage({ type: 'success', text: 'Datos exportados exitosamente' });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
             style={{ borderTopColor: primaryColor, borderBottomColor: primaryColor }}></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reservaciones</h1>
        <p className="text-gray-500 dark:text-gray-400">Gestiona las reservaciones de habitaciones</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Date Filter Tabs */}
          <div className="flex gap-2">
            {['today', 'week', 'month', 'all'].map((option) => (
              <button
                key={option}
                onClick={() => handleDateFilterChange(option)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateFilter === option
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
                style={{
                  backgroundColor: dateFilter === option ? primaryColor : undefined
                }}
              >
                {option === 'today' && 'Hoy'}
                {option === 'week' && 'Esta Semana'}
                {option === 'month' && 'Este Mes'}
                {option === 'all' && 'Todas'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente o habitación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                style={{ '--tw-ring-color': primaryColor } as any}
              />
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={exportData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 py-2">Estado:</span>
          {['all', 'Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
              style={{
                backgroundColor: filter === status ? primaryColor : undefined
              }}
            >
              {status === 'all' && 'Todas'}
              {status === 'Pending' && 'Pendientes'}
              {status === 'Confirmed' && 'Confirmadas'}
              {status === 'CheckedIn' && 'Check-In'}
              {status === 'CheckedOut' && 'Check-Out'}
              {status === 'Cancelled' && 'Canceladas'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredReservations.length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Confirmadas</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredReservations.filter(r => r.status === 'Confirmed').length}
              </p>
            </div>
            <Bed className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Check-In Hoy</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredReservations.filter(r => {
                  const today = new Date().toISOString().split('T')[0];
                  return r.checkInDate.split('T')[0] === today;
                }).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos</p>
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {formatCurrency(
                  filteredReservations
                    .filter(r => r.status !== 'Cancelled')
                    .reduce((sum, r) => sum + r.totalAmount, 0)
                )}
              </p>
            </div>
            <DollarSign className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Habitación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Check-In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Check-Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron reservaciones
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{reservation.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {reservation.guestName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {reservation.guestEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {reservation.roomName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {reservation.roomType}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(reservation.checkInDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(reservation.checkOutDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(reservation.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reservation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => router.push(`/dashboard/reservaciones/${reservation.id}`)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Mostrando 1-{filteredReservations.length} de {filteredReservations.length} reservaciones
      </div>
    </div>
  );
}