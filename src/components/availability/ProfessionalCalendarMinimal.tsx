'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Info, User, Calendar, DollarSign } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';

interface ReservationInfo {
  id: number;
  guestName: string;
  status: string;
  isCheckIn: boolean;
  isCheckOut: boolean;
}

interface CalendarDayMinimal {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isAvailable: boolean;
  isBlocked: boolean;
  hasReservation: boolean;
  price: number;
  reservationInfo?: ReservationInfo;
}

interface ProfessionalCalendarProps {
  roomId: number;
  roomName: string;
  basePrice: number;
  onDateRangeSelect?: (startDate: Date | null, endDate: Date | null) => void;
  onPriceUpdate?: (date: Date, price: number) => void;
  availabilityData: any;
  viewMode?: 'availability' | 'pricing' | 'selection';
  initialMonth?: Date; // Align calendar with loaded data window
  onMonthChange?: (month: Date) => void; // Notify parent when user navigates months
}

export default function ProfessionalCalendarMinimal({
  roomId,
  roomName,
  basePrice,
  onDateRangeSelect,
  onPriceUpdate,
  availabilityData,
  viewMode: initialViewMode = 'availability',
  initialMonth,
  onMonthChange
}: ProfessionalCalendarProps) {
  const { company } = useCompany();
  const currency = (company as any)?.storeCurrency || company?.currency || '$';
  
  const [currentMonth, setCurrentMonth] = useState(() => initialMonth ? new Date(initialMonth) : new Date());

  // Keep calendar month in sync when parent changes the requested month window
  useEffect(() => {
    if (initialMonth) {
      const d = new Date(initialMonth);
      if (isFinite(d.getTime())) setCurrentMonth(d);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMonth?.getFullYear(), initialMonth?.getMonth()]);

  // Inform parent when the visible month changes so it can reload data
  useEffect(() => {
    if (onMonthChange) {
      const normalized = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      onMonthChange(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth.getFullYear(), currentMonth.getMonth()]);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<CalendarDayMinimal | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load Montserrat font if not already loaded
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    if (!document.querySelector('link[href*="Montserrat"]')) {
      document.head.appendChild(link);
    }
  }, []);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDayMinimal[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      const dateKey = `${roomId}_${formatDate(currentDate)}`;
      const dayData = availabilityData?.availability?.[dateKey];
      
      const isInDateRange = selectedStartDate && selectedEndDate && 
        currentDate >= selectedStartDate && currentDate <= selectedEndDate;
      
      days.push({
        date: currentDate,
        dayOfMonth: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.getTime() === today.getTime(),
        isSelected: selectedStartDate?.getTime() === currentDate.getTime() || 
                   selectedEndDate?.getTime() === currentDate.getTime(),
        isInRange: isInDateRange || false,
        isRangeStart: selectedStartDate?.getTime() === currentDate.getTime(),
        isRangeEnd: selectedEndDate?.getTime() === currentDate.getTime(),
        isAvailable: dayData?.isAvailable ?? true,
        isBlocked: dayData?.isBlocked ?? false,
        hasReservation: dayData?.hasReservation ?? false,
        price: dayData?.customPrice ?? basePrice,
        reservationInfo: dayData?.hasReservation ? {
          id: Number(dayData.reservationId) || 0,
          guestName: String(dayData.guestName || ''),
          status: String(dayData.status || 'confirmed'),
          isCheckIn: Boolean(dayData.isCheckIn || false),
          isCheckOut: Boolean(dayData.isCheckOut || false)
        } as ReservationInfo : undefined
      });
    }
    
    return days;
  }, [currentMonth, selectedStartDate, selectedEndDate, availabilityData, roomId, basePrice]);

  const handleDateClick = (day: CalendarDayMinimal) => {
    if (!day.isCurrentMonth || day.isBlocked) return;
    
    // Show modal for reserved dates
    if (day.hasReservation) {
      setSelectedReservation(day);
      return;
    }
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(day.date);
      setSelectedEndDate(null);
    } else {
      if (day.date > selectedStartDate) {
        setSelectedEndDate(day.date);
        if (onDateRangeSelect) {
          onDateRangeSelect(selectedStartDate, day.date);
        }
      } else {
        setSelectedStartDate(day.date);
        setSelectedEndDate(null);
      }
    }
  };

  const getDayClasses = (day: CalendarDayMinimal) => {
    const base = 'h-8 flex items-center justify-center text-xs rounded-md transition-all cursor-pointer relative';
    
    if (!day.isCurrentMonth) {
      return `${base} text-gray-300 dark:text-gray-600 cursor-default`;
    }
    
    if (day.hasReservation) {
      return `${base} bg-blue-500 dark:bg-blue-600 text-white font-medium cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-700`;
    }
    
    if (day.isBlocked) {
      return `${base} bg-red-100 dark:bg-red-900/30 text-red-400 dark:text-red-400 cursor-not-allowed`;
    }
    
    if (day.isRangeStart || day.isRangeEnd) {
      return `${base} bg-indigo-600 dark:bg-indigo-500 text-white font-bold`;
    }
    
    if (day.isInRange) {
      return `${base} bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-300`;
    }
    
    if (day.isToday) {
      return `${base} ring-2 ring-indigo-400 dark:ring-indigo-500 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100`;
    }
    
    return `${base} hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`;
  };

  const calculateNights = () => {
    if (!selectedStartDate || !selectedEndDate) return 0;
    return Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    if (!selectedStartDate || !selectedEndDate) return 0;
    let total = 0;
    let currentDate = new Date(selectedStartDate);
    while (currentDate < selectedEndDate) {
      const dateKey = `${roomId}_${formatDate(currentDate)}`;
      const dayData = availabilityData?.availability?.[dateKey];
      total += dayData?.customPrice ?? basePrice;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return total;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
      {/* Full-Screen Modal for Reservation Info */}
      {selectedReservation && selectedReservation.hasReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedReservation(null)}
          />
          
          {/* Modal Content - Smaller content for better fit */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[90%] max-w-5xl h-auto max-h-[85vh] overflow-hidden p-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedReservation(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:rotate-90 duration-300 z-10"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Content */}
            <div className="space-y-4">
              {/* Header Section */}
              <div className="text-center">
                <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Detalles de Reservación
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Información completa de la reservación
                </p>
              </div>

              {/* Guest Information Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Nombre del Huésped
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedReservation.reservationInfo?.guestName || 'Nombre no disponible'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      ID de Reservación: #{selectedReservation.reservationInfo?.id || '---'}
                    </p>
                  </div>
                </div>
              </div>
            
              {/* Reservation Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Date Information */}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                        {(selectedReservation.reservationInfo as ReservationInfo)?.isCheckIn ? 'Fecha de Entrada' : 
                         (selectedReservation.reservationInfo as ReservationInfo)?.isCheckOut ? 'Fecha de Salida' : 'Fecha de Reservación'}
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {selectedReservation.date.toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedReservation.date.getFullYear()}
                      </p>
                      {(selectedReservation.reservationInfo as ReservationInfo)?.isCheckIn && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                          ✓ DÍA DE ENTRADA
                        </span>
                      )}
                      {(selectedReservation.reservationInfo as ReservationInfo)?.isCheckOut && (
                        <span className="inline-block mt-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full">
                          ✓ DÍA DE SALIDA
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Information */}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                        Tarifa de Habitación
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {currency}{formatPrice(selectedReservation.price)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        por noche
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            
              {/* Status Section */}
              {selectedReservation.reservationInfo?.status && (
                <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                        Estado Actual
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Esta reservación está marcada como
                      </p>
                    </div>
                    <span className={`
                      inline-block px-4 py-2 text-sm font-bold rounded-xl
                      ${selectedReservation.reservationInfo?.status === 'confirmed' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-1 ring-green-500' 
                        : selectedReservation.reservationInfo?.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 ring-1 ring-yellow-500'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500'}
                    `}>
                      {selectedReservation.reservationInfo?.status === 'confirmed' ? 'Confirmada' :
                       selectedReservation.reservationInfo?.status === 'pending' ? 'Pendiente' :
                       selectedReservation.reservationInfo?.status === 'cancelled' ? 'Cancelada' :
                       selectedReservation.reservationInfo?.status ? 
                         selectedReservation.reservationInfo.status.charAt(0).toUpperCase() + 
                         selectedReservation.reservationInfo.status.slice(1) : 'Desconocido'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Ultra-compact header */}
      <div className="px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <h3 className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">{roomName}</h3>
            <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
              {currency}{formatPrice(basePrice)}/night
            </span>
          </div>
          
          {/* Month navigation */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => {
                const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
                setCurrentMonth(prev);
              }}
              className="p-0.5 md:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronLeft className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <span className="text-[10px] md:text-xs font-medium text-gray-800 dark:text-gray-200 min-w-[50px] md:min-w-[60px] text-center">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            
            <button
              onClick={() => {
                const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                setCurrentMonth(next);
              }}
              className="p-0.5 md:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Ultra-compact calendar grid */}
      <div className="p-2 md:p-3">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1">
          {weekDays.map((day, index) => (
            <div key={`weekday-${index}`} className="text-center text-[9px] md:text-[10px] font-medium text-gray-400 dark:text-gray-500 h-4 md:h-5">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0.5 md:gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={getDayClasses(day)}
              onClick={() => handleDateClick(day)}
              title={
                day.hasReservation 
                  ? `Click to view reservation details` 
                  : day.isBlocked 
                  ? 'Blocked' 
                  : day.isCurrentMonth ? `${currency}${formatPrice(day.price)}/night` : ''
              }
            >
              <span className="relative z-10 text-[11px] md:text-xs">{day.dayOfMonth}</span>
              {day.isBlocked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-[1px] bg-red-400 dark:bg-red-500 rotate-45"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ultra-compact footer */}
      {(selectedStartDate || selectedEndDate) && (
        <div className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-[10px] md:text-xs">
            <div className="flex items-center gap-2 md:gap-3">
              {selectedStartDate && (
                <span className="text-gray-600 dark:text-gray-400">
                  <span className="hidden md:inline">Check-in: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </span>
              )}
              {selectedEndDate && (
                <>
                  <span className="text-gray-400 dark:text-gray-500">→</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="hidden md:inline">Check-out: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </span>
                </>
              )}
            </div>
            {selectedStartDate && selectedEndDate && (
              <div className="flex items-center gap-2 md:gap-3">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {calculateNights()}n
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {currency}{formatPrice(calculateTotalPrice())}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Minimal legend */}
      <div className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center gap-2 md:gap-4 text-[9px] md:text-[10px]">
          <div className="flex items-center gap-0.5 md:gap-1">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-0.5 md:gap-1">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 dark:bg-blue-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Reserved</span>
          </div>
          <div className="flex items-center gap-0.5 md:gap-1">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-100 dark:bg-red-900/30 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Blocked</span>
          </div>
          <div className="flex items-center gap-0.5 md:gap-1">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-indigo-600 dark:bg-indigo-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
