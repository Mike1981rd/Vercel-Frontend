'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import { 
  ArrowLeft, User, MapPin, CreditCard, Calendar, Clock, 
  DollarSign, MessageSquare, Printer, Check, X, Ban,
  LogIn, LogOut, Edit2, Plus, Mail, Phone, Globe,
  Bed, Users, FileText, AlertCircle, CheckCircle,
  ChevronRight, Download, Send, Star, Home, Shield,
  Hash, Clock3, Building, CreditCard as CardIcon,
  CalendarDays, Moon, Wifi, Coffee, Car, Info,
  XCircle, MoreVertical
} from 'lucide-react';

interface ReservationDetails {
  id: number;
  status: string;
  createdAt: string;
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    avatar?: string;
  };
  billingInfo: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isDefaultAddress: boolean;
  };
  reservationInfo: {
    roomName: string;
    roomType: string;
    numberOfGuests: number;
    checkInDate: string;
    checkOutDate: string;
    checkInTime: string;
    checkOutTime: string;
    numberOfNights: number;
    specialRequests?: string;
    internalNotes?: string;
  };
  paymentSummary: {
    roomRate: number;
    numberOfNights: number;
    totalAmount: number;
    totalPaid: number;
    balance: number;
  };
  payments: Array<{
    id: number;
    amount: number;
    paymentMethod: string;
    status: string;
    paymentDate: string;
    transactionId?: string;
    notes?: string;
  }>;
}

export default function ReservationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [companyCurrency, setCompanyCurrency] = useState('RD$');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
    
    fetchCompanyInfo();
    fetchReservation();
  }, [params.id]);

  const fetchCompanyInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5266/api/company/current', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.currency) {
          setCompanyCurrency(result.currency);
        }
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  };

  const fetchReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5266/api/reservations/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservation');
      }

      const result = await response.json();
      setReservation(result.data);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      setMessage({ type: 'error', text: t('reservations.messages.loadError', 'Error al cargar la reservación') });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5266/api/reservations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: t('reservations.messages.statusUpdated', 'Estado actualizado') });
        fetchReservation();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ type: 'error', text: t('reservations.messages.updateError', 'Error al actualizar') });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = localStorage.getItem('language') === 'es' ? 'es-DO' : 'en-US';
    return date.toLocaleDateString(locale, { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return `${companyCurrency}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, any> = {
      'Pending': {
        icon: <Clock3 className="w-3 h-3" />,
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        label: t('reservations.statusLabels.pending', 'Pendiente')
      },
      'Confirmed': {
        icon: <CheckCircle className="w-3 h-3" />,
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        label: t('reservations.statusLabels.confirmed', 'Confirmada')
      },
      'CheckedIn': {
        icon: <LogIn className="w-3 h-3" />,
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        label: t('reservations.statusLabels.checkedIn', 'Check-In')
      },
      'CheckedOut': {
        icon: <LogOut className="w-3 h-3" />,
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-700 dark:text-gray-400',
        label: t('reservations.statusLabels.checkedOut', 'Check-Out')
      },
      'Cancelled': {
        icon: <X className="w-3 h-3" />,
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        label: t('reservations.statusLabels.cancelled', 'Cancelada')
      }
    };

    const config = configs[status] || configs['Pending'];
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'G';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
             style={{ borderTopColor: primaryColor, borderBottomColor: primaryColor }}></div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('reservations.notFound', 'Reservación no encontrada')}
        </p>
        <button
          onClick={() => router.push('/dashboard/reservaciones')}
          className="mt-4 px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {t('common.back', 'Volver')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Professional Header Card */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 py-3 border-b border-gray-200 dark:border-gray-700">
            <Link href="/dashboard" className="hover:text-gray-700 dark:hover:text-gray-300">
              {t('navigation.dashboard', 'Panel')}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/dashboard/reservaciones" className="hover:text-gray-700 dark:hover:text-gray-300">
              {t('navigation.reservations', 'Reservaciones')}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 dark:text-white font-medium">#{reservation.id}</span>
          </nav>

          <div className="py-6">
            {/* Main Header Content */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              {/* Left Side - Guest Info & Title */}
              <div className="flex items-start gap-4">
                {/* Guest Avatar */}
                <div className="flex-shrink-0">
                  {reservation.guestInfo.avatar ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
                      <img 
                        src={reservation.guestInfo.avatar.startsWith('http') 
                          ? reservation.guestInfo.avatar 
                          : `http://localhost:5266${reservation.guestInfo.avatar}`}
                        alt={reservation.guestInfo.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center text-white font-bold text-xl" style="background-color: ${primaryColor}">
                                ${getInitials(reservation.guestInfo?.fullName, reservation.guestInfo?.email)}
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md" 
                         style={{ backgroundColor: primaryColor }}>
                      {getInitials(reservation.guestInfo?.fullName, reservation.guestInfo?.email)}
                    </div>
                  )}
                </div>
                
                {/* Title and Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t('reservations.details.title', 'Reservación')} #{reservation.id}
                    </h1>
                    {getStatusBadge(reservation.status)}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{t('reservations.details.created', 'Creada')} {formatDate(reservation.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{reservation.guestInfo.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{reservation.reservationInfo.numberOfNights} {reservation.reservationInfo.numberOfNights === 1 ? t('reservations.form.night', 'noche') : t('reservations.form.nights', 'noches')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Primary Actions */}
              <div className="flex sm:hidden flex-col w-full gap-2 mt-4">
                <button
                  onClick={() => router.push(`/dashboard/reservaciones/${params.id}/editar`)}
                  className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                  title="Editar reservación"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('reservations.details.editReservation', 'Editar Reservación')}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all flex items-center justify-center gap-2"
                    title="Imprimir"
                  >
                    <Printer className="w-4 h-4" />
                    {t('common.print', 'Imprimir')}
                  </button>
                  
                  <button
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all flex items-center justify-center gap-2"
                    title="Más opciones"
                  >
                    <MoreVertical className="w-4 h-4" />
                    {t('common.more', 'Más')}
                  </button>
                </div>
              </div>
              
              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => router.push(`/dashboard/reservaciones/${params.id}/editar`)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center gap-2 transition-all"
                  title="Editar reservación"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('common.edit', 'Editar')}
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all"
                  title="Imprimir"
                >
                  <Printer className="w-4 h-4" />
                </button>
                
                <button
                  className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all"
                  title="Más opciones"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status Actions Bar - Stack on Mobile */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Status Actions */}
                {reservation.status === 'Pending' && (
                  <button
                    onClick={() => handleStatusChange('Confirmed')}
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('reservations.actions.confirmReservation', 'Confirmar Reservación')}
                  </button>
                )}
                
                {reservation.status === 'Confirmed' && (
                  <button
                    onClick={() => handleStatusChange('CheckedIn')}
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-2.5 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    {t('reservations.actions.registerCheckIn', 'Registrar Check-In')}
                  </button>
                )}
                
                {reservation.status === 'CheckedIn' && (
                  <button
                    onClick={() => handleStatusChange('CheckedOut')}
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('reservations.actions.registerCheckOut', 'Registrar Check-Out')}
                  </button>
                )}
                
                {/* Payment Action - Prominent if balance due */}
                {reservation.paymentSummary.balance > 0 && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full sm:w-auto px-4 py-2.5 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <CreditCard className="w-4 h-4" />
                    {t('reservations.actions.addPayment', 'Agregar Pago')}
                  </button>
                )}
                
                {/* Cancel Action - Always visible for pending/confirmed */}
                {(reservation.status === 'Pending' || reservation.status === 'Confirmed') && (
                  <button
                    onClick={() => handleStatusChange('Cancelled')}
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('reservations.actions.cancelReservation', 'Cancelar Reservación')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Clean Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Primary Information */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Reservation Overview - Compact Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Check-in/out Info */}
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {t('reservations.details.stayDates', 'Fechas de Estadía')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('reservations.form.checkIn', 'Check-in')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(reservation.reservationInfo.checkInDate)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {reservation.reservationInfo.checkInTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('reservations.form.checkOut', 'Check-out')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(reservation.reservationInfo.checkOutDate)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {reservation.reservationInfo.checkOutTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Info */}
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {t('reservations.details.room', 'Habitación')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Bed className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {reservation.reservationInfo.roomName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {reservation.reservationInfo.roomType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {reservation.reservationInfo.numberOfGuests} {t('reservations.details.guests', 'huéspedes')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {reservation.reservationInfo.numberOfNights} {reservation.reservationInfo.numberOfNights === 1 ? t('reservations.form.night', 'noche') : t('reservations.form.nights', 'noches')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration Badge */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {reservation.reservationInfo.numberOfNights} {reservation.reservationInfo.numberOfNights === 1 ? t('reservations.form.night', 'noche') : t('reservations.form.nights', 'noches')}
                  </span>
                </div>
              </div>
            </div>

            {/* Guest Information - Clean without Avatar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                {t('reservations.details.guestInfo', 'Información del Huésped')}
              </h3>
              
              <div>
                {/* Guest Details - Full Width */}
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {reservation.guestInfo.fullName}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('forms.email', 'Email')}</p>
                        <p className="text-sm text-gray-900 dark:text-white break-all">
                          {reservation.guestInfo.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('forms.phone', 'Teléfono')}</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {reservation.guestInfo.phone || t('common.notProvided', 'No proporcionado')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('forms.country', 'País')}</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {reservation.guestInfo.country || t('common.notSpecified', 'No especificado')}
                        </p>
                      </div>
                    </div>
                    
                    {reservation.guestInfo.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('forms.address', 'Dirección')}</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {reservation.guestInfo.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Guest Stats/Badges */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Star className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">{t('reservations.details.vipClient', 'Cliente VIP')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">{t('reservations.details.verified', 'Verificado')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-400">{t('reservations.details.secureData', 'Datos Seguros')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests / Notes - If exists */}
            {(reservation.reservationInfo.specialRequests || reservation.reservationInfo.internalNotes) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Notas y Solicitudes
                </h3>
                
                <div className="space-y-4">
                  {reservation.reservationInfo.specialRequests && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Solicitudes del huésped</p>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {reservation.reservationInfo.specialRequests}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {reservation.reservationInfo.internalNotes && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Notas internas</p>
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {reservation.reservationInfo.internalNotes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Billing Address - If different */}
            {reservation.billingInfo.address && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  {t('reservations.details.billingAddress', 'Dirección de Facturación')}
                </h3>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {reservation.billingInfo.address}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {[
                        reservation.billingInfo.city,
                        reservation.billingInfo.state,
                        reservation.billingInfo.postalCode,
                        reservation.billingInfo.country
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Payment Summary */}
          <div className="space-y-4">
            
            {/* Payment Summary - Clean Design */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                {t('reservations.details.paymentSummary', 'Resumen de Pago')}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('reservations.details.pricePerNight', 'Precio por noche')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(reservation.paymentSummary.roomRate)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">× {reservation.paymentSummary.numberOfNights} {reservation.paymentSummary.numberOfNights === 1 ? t('reservations.form.night', 'noche') : t('reservations.form.nights', 'noches')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(reservation.paymentSummary.roomRate * reservation.paymentSummary.numberOfNights)}
                  </span>
                </div>
                
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t('reservations.details.total', 'Total')}</span>
                    <span className="text-lg font-bold" style={{ color: primaryColor }}>
                      {formatCurrency(reservation.paymentSummary.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('reservations.details.paid', 'Pagado')}</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(reservation.paymentSummary.totalPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('reservations.details.balance', 'Balance')}</span>
                    <span className={`font-bold ${
                      reservation.paymentSummary.balance > 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {formatCurrency(reservation.paymentSummary.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History - Minimal */}
            {reservation.payments.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Historial de Pagos
                </h3>
                
                <div className="space-y-3">
                  {reservation.payments.map((payment) => (
                    <div key={payment.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                          payment.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {payment.paymentMethod}
                          </p>
                          {payment.transactionId && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              ID: {payment.transactionId}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(payment.paymentDate)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {t('reservations.details.quickInfo', 'Información Rápida')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">ID:</span>
                  <span className="font-medium text-gray-900 dark:text-white">#{reservation.id}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{t('reservations.details.createdLabel', 'Creada:')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(reservation.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg z-50 ${
          message.type === 'success' 
            ? 'bg-emerald-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2 text-sm">
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            {message.text}
          </div>
        </div>
      )}
    </div>
  );
}