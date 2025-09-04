'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, Save, Calendar, User, Bed, DollarSign, 
  Users, FileText, Home, MapPin, CreditCard, Check,
  ChevronRight, Clock, Info, AlertCircle
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';
import { useToast } from '@/contexts/ToastContext';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
}

interface Room {
  id: number;
  name: string;
  roomType: string;
  basePrice?: number;
  pricePerNight?: number;
  capacity: number;
}

interface Reservation {
  id: number;
  customerId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  numberOfAdults: number;
  numberOfChildren: number;
  specialRequests: string;
  status: string;
}

export default function EditReservationPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    totalAmount: 0,
    numberOfAdults: 1,
    numberOfChildren: 0,
    specialRequests: '',
    status: 'Pending'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [companyCurrency, setCompanyCurrency] = useState('RD$');

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
    // Load initial data
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    // First load company info, customers and rooms in parallel
    await Promise.all([
      fetchCompanyInfo(),
      fetchCustomers(),
      fetchRooms()
    ]);
    
    // Then load reservation data after customers and rooms are loaded
    await fetchReservation();
  };

  const fetchCompanyInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint('/company/current'), {
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
      
      // Fetch all reservations to get the basic data including customerId and roomId
      const listResponse = await fetch(getApiEndpoint('/reservations'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!listResponse.ok) {
        throw new Error('Failed to fetch reservations list');
      }

      const reservations = await listResponse.json();
      const basicReservation = reservations.find((r: any) => r.id === parseInt(params.id as string));
      
      if (!basicReservation) {
        showError(t('reservations.messages.notFound', 'Reservación no encontrada'));
        setLoading(false);
        return;
      }

      console.log('Basic reservation:', basicReservation);

      // Now fetch detailed data
      const detailResponse = await fetch(getApiEndpoint(`/reservations/${params.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (detailResponse.ok) {
        const result = await detailResponse.json();
        const detailedData = result.data || result;
        console.log('Detailed reservation:', detailedData);
        
        // Format dates for input fields
        const checkInDate = new Date(detailedData.reservationInfo?.checkInDate || basicReservation.checkInDate).toISOString().split('T')[0];
        const checkOutDate = new Date(detailedData.reservationInfo?.checkOutDate || basicReservation.checkOutDate).toISOString().split('T')[0];
        
        // Set form data with the reservation values
        setFormData({
          customerId: String(basicReservation.customerId),
          roomId: String(basicReservation.roomId),
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          totalAmount: detailedData.paymentSummary?.totalAmount || basicReservation.totalAmount || 0,
          numberOfAdults: detailedData.reservationInfo?.numberOfGuests || basicReservation.numberOfGuests || 1,
          numberOfChildren: 0,
          specialRequests: detailedData.reservationInfo?.specialRequests || '',
          status: detailedData.status || basicReservation.status || 'Pending'
        });

        console.log('Form data set with:', {
          customerId: String(basicReservation.customerId),
          roomId: String(basicReservation.roomId),
        });
      }
    } catch (error) {
      console.error('Error fetching reservation:', error);
      showError(t('reservations.messages.loadError', 'Error al cargar la reservación'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint('/customers?size=100'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Customers response:', result);
        // Customers endpoint returns paginated data with items array
        const customersData = result.items || result.data || result || [];
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } else {
        console.error('Failed to fetch customers:', response.status);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint('/rooms'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Rooms response:', result);
        // Rooms endpoint returns array directly
        const roomsData = Array.isArray(result) ? result : result.data || result.items || [];
        setRooms(roomsData);
      } else {
        console.error('Failed to fetch rooms:', response.status);
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerId) {
      newErrors.customerId = t('reservations.form.errors.customerRequired', 'El cliente es requerido');
    }
    
    if (!formData.roomId) {
      newErrors.roomId = t('reservations.form.errors.roomRequired', 'La habitación es requerida');
    }
    
    if (!formData.checkInDate) {
      newErrors.checkInDate = t('reservations.form.errors.checkInRequired', 'La fecha de check-in es requerida');
    }
    
    if (!formData.checkOutDate) {
      newErrors.checkOutDate = t('reservations.form.errors.checkOutRequired', 'La fecha de check-out es requerida');
    }
    
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = t('reservations.form.errors.checkOutAfterCheckIn', 'El check-out debe ser después del check-in');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError(t('reservations.form.errors.validation', 'Por favor corrija los errores en el formulario'));
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const checkInDate = new Date(formData.checkInDate + 'T12:00:00Z');
      const checkOutDate = new Date(formData.checkOutDate + 'T12:00:00Z');
      
      const dataToSend = {
        customerId: parseInt(formData.customerId),
        roomId: parseInt(formData.roomId),
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        numberOfGuests: formData.numberOfAdults + formData.numberOfChildren,
        specialRequests: formData.specialRequests || '',
        status: formData.status
      };
      
      const response = await fetch(getApiEndpoint(`/reservations/${params.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        showSuccess(t('reservations.messages.updateSuccess', 'Reservación actualizada exitosamente'));
        router.push(`/dashboard/reservaciones/${params.id}`);
      } else {
        let errorMessage = t('reservations.messages.updateError', 'Error al actualizar la reservación');
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage += ': ' + errorData.message;
          }
        } catch {
          // Ignore JSON parse error
        }
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      showError(t('reservations.messages.connectionError', 'Error de conexión al servidor'));
    } finally {
      setSaving(false);
    }
  };

  const calculateTotal = () => {
    if (!formData.roomId || !formData.checkInDate || !formData.checkOutDate) return 0;
    
    const room = rooms.find(r => r.id === parseInt(formData.roomId));
    if (!room) return 0;
    
    const nights = Math.ceil(
      (new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    const pricePerNight = room.basePrice || room.pricePerNight || 0;
    return pricePerNight * nights;
  };

  const formatCurrency = (amount: number) => {
    return `${companyCurrency}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Professional Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link href="/dashboard" className="hover:text-gray-700 dark:hover:text-gray-300">
                {t('navigation.dashboard', 'Panel')}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/dashboard/reservaciones" className="hover:text-gray-700 dark:hover:text-gray-300">
                {t('navigation.reservations', 'Reservaciones')}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/dashboard/reservaciones/${params.id}`} className="hover:text-gray-700 dark:hover:text-gray-300">
                #{params.id}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-900 dark:text-white font-medium">{t('common.edit', 'Editar')}</span>
            </nav>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('reservations.editTitle', 'Editar Reservación')} #{params.id}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('reservations.editSubtitle', 'Modifica los detalles de la reservación')}
                </p>
              </div>

              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('common.cancel', 'Cancelar')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Status Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5" style={{ color: primaryColor }} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('reservations.form.reservationStatus', 'Estado de la Reservación')}
              </h2>
            </div>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white transition-all"
              style={{ '--tw-ring-color': primaryColor } as any}
              disabled={saving}
            >
              <option value="Pending">{t('reservations.status.pending', 'Pendiente')}</option>
              <option value="Confirmed">{t('reservations.status.confirmed', 'Confirmada')}</option>
              <option value="CheckedIn">{t('reservations.status.checkedIn', 'Check-In')}</option>
              <option value="CheckedOut">{t('reservations.status.checkedOut', 'Check-Out')}</option>
              <option value="Cancelled">{t('reservations.status.cancelled', 'Cancelada')}</option>
            </select>
          </div>

          {/* Guest and Room Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5" style={{ color: primaryColor }} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('reservations.form.guestAndRoom', 'Información del Huésped y Habitación')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reservations.form.customer', 'Cliente')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  disabled={saving}
                >
                  <option value="">{t('reservations.form.selectCustomer', 'Seleccionar cliente...')}</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email}
                    </option>
                  ))}
                </select>
                {errors.customerId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customerId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reservations.form.room', 'Habitación')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  disabled={saving}
                >
                  <option value="">{t('reservations.form.selectRoom', 'Seleccionar habitación...')}</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {room.roomType} ({formatCurrency(room.basePrice || room.pricePerNight || 0)}/noche)
                    </option>
                  ))}
                </select>
                {errors.roomId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roomId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('reservations.form.dates', 'Fechas de Estadía')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reservations.form.checkIn', 'Check-In')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkInDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  disabled={saving}
                />
                {errors.checkInDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.checkInDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reservations.form.checkOut', 'Check-Out')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  disabled={saving}
                  min={formData.checkInDate}
                />
                {errors.checkOutDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.checkOutDate}</p>
                )}
              </div>
            </div>
            
            {formData.checkInDate && formData.checkOutDate && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {(() => {
                    const nights = Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
                    return `${nights} ${nights === 1 ? t('reservations.form.night', 'noche') : t('reservations.form.nights', 'noches')}`;
                  })()}
                </p>
              </div>
            )}
          </div>

          {/* Number of Guests */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5" style={{ color: primaryColor }} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('reservations.form.numberOfGuests', 'Número de Huéspedes')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reservations.form.adults', 'Adultos')}
                </label>
                <input
                  type="number"
                  value={formData.numberOfAdults}
                  onChange={(e) => setFormData(prev => ({ ...prev, numberOfAdults: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  disabled={saving}
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('reservations.form.children', 'Niños')}
                </label>
                <input
                  type="number"
                  value={formData.numberOfChildren}
                  onChange={(e) => setFormData(prev => ({ ...prev, numberOfChildren: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  disabled={saving}
                  min="0"
                  max="10"
                />
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {t('reservations.form.totalGuests', 'Total de huéspedes')}: <span className="font-semibold text-gray-900 dark:text-white">
                {formData.numberOfAdults + formData.numberOfChildren}
              </span>
            </div>
          </div>

          {/* Special Requests */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5" style={{ color: primaryColor }} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('reservations.form.specialRequests', 'Solicitudes Especiales')}
              </h2>
            </div>
            
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white transition-all resize-none"
              style={{ '--tw-ring-color': primaryColor } as any}
              disabled={saving}
              rows={4}
              placeholder={t('reservations.form.specialRequestsPlaceholder', 'Ingrese cualquier solicitud especial del huésped...')}
            />
          </div>

          {/* Payment Summary */}
          {calculateTotal() > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5" style={{ color: primaryColor }} />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('reservations.form.paymentSummary', 'Resumen de Pago')}
                </h2>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('reservations.form.pricePerNight', 'Precio por noche')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(rooms.find(r => r.id === parseInt(formData.roomId))?.basePrice || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('reservations.form.numberOfNights', 'Número de noches')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">{t('reservations.form.total', 'Total')}</span>
                    <span className="text-lg font-bold" style={{ color: primaryColor }}>
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Stack and center on mobile */}
          <div className="flex flex-col-reverse sm:flex-row justify-center sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              disabled={saving}
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  {t('common.saving', 'Guardando...')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('common.saveChanges', 'Guardar Cambios')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
