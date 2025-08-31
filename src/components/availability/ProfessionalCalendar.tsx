'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, DollarSign, Users, Clock, Info, X } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface CalendarDay {
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
  minNights?: number;
  reservationInfo?: {
    id: number;
    guestName: string;
    status: string;
    isCheckIn: boolean;
    isCheckOut: boolean;
  };
}

interface ProfessionalCalendarProps {
  roomId: number;
  roomName: string;
  basePrice: number;
  onDateRangeSelect?: (startDate: Date | null, endDate: Date | null) => void;
  onPriceUpdate?: (date: Date, price: number) => void;
  availabilityData: any;
  viewMode?: 'availability' | 'pricing' | 'selection';
}

export default function ProfessionalCalendar({
  roomId,
  roomName,
  basePrice,
  onDateRangeSelect,
  onPriceUpdate,
  availabilityData,
  viewMode: initialViewMode = 'availability'
}: ProfessionalCalendarProps) {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<'availability' | 'pricing' | 'selection'>(initialViewMode);
  // Inicializar con agosto 2025 para que coincida con los datos
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date();
    // Si estamos en 2025, mantener el mes actual, sino poner agosto 2025
    if (date.getFullYear() === 2025) {
      return date;
    }
    return new Date(2025, 7, 1); // Agosto 2025 (mes 7 porque es 0-indexado)
  });
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [selectedDateForPricing, setSelectedDateForPricing] = useState<Date | null>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  // Función auxiliar para formatear fechas - MOVIDA AL PRINCIPIO
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Días de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Meses en español
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Debug general
    if (availabilityData?.availability) {
      const keys = Object.keys(availabilityData.availability);
      console.log(`Total keys en availability: ${keys.length}`);
      console.log('Mes actual del calendario:', `${year}-${String(month + 1).padStart(2, '0')}`);
      if (keys.length > 0) {
        console.log('Primeras 3 keys:', keys.slice(0, 3));
        console.log('Buscando para roomId:', roomId);
        // Buscar si hay keys para este room y mes
        const roomKeys = keys.filter(k => k.startsWith(`${roomId}_${year}-${String(month + 1).padStart(2, '0')}`));
        console.log(`Keys encontradas para room ${roomId} en mes ${month + 1}:`, roomKeys.length);
        if (roomKeys.length > 0) {
          console.log('Ejemplo de data:', availabilityData.availability[roomKeys[0]]);
        }
      }
    }
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const dateKey = `${roomId}_${formatDate(date)}`;
      const dayData = availabilityData?.availability?.[dateKey];
      
      const isInRange = selectedStartDate && selectedEndDate && 
                       date >= selectedStartDate && date <= selectedEndDate;
      const isRangeStart = selectedStartDate && date.getTime() === selectedStartDate.getTime();
      const isRangeEnd = selectedEndDate && date.getTime() === selectedEndDate.getTime();
      
      // Determinar si hay hover range
      let isInHoverRange = false;
      if (selectedStartDate && !selectedEndDate && hoveredDate) {
        const hoverStart = selectedStartDate < hoveredDate ? selectedStartDate : hoveredDate;
        const hoverEnd = selectedStartDate < hoveredDate ? hoveredDate : selectedStartDate;
        isInHoverRange = date >= hoverStart && date <= hoverEnd;
      }
      
      days.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        isSelected: Boolean((selectedStartDate && date.getTime() === selectedStartDate.getTime()) ||
                   (selectedEndDate && date.getTime() === selectedEndDate.getTime())),
        isInRange: isInRange || isInHoverRange,
        isRangeStart: Boolean(isRangeStart),
        isRangeEnd: Boolean(isRangeEnd),
        isAvailable: dayData?.isAvailable ?? true,
        isBlocked: dayData?.isBlocked ?? false,
        hasReservation: dayData?.hasReservation ?? false,
        price: dayData?.customPrice ?? basePrice,
        minNights: dayData?.minNights,
        reservationInfo: dayData?.hasReservation ? {
          id: dayData.reservationId,
          guestName: dayData.guestName,
          status: 'confirmed',
          isCheckIn: dayData.isCheckIn,
          isCheckOut: dayData.isCheckOut
        } : undefined
      });
    }
    
    return days;
  }, [currentMonth, selectedStartDate, selectedEndDate, hoveredDate, availabilityData, roomId, basePrice]);

  const handleDateClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    if (day.hasReservation) {
      setSelectedReservation(day.reservationInfo);
      setShowReservationDetails(true);
      return;
    }
    
    if (viewMode === 'pricing') {
      setSelectedDateForPricing(day.date);
      setCustomPrice(day.price.toString());
      setShowPriceEditor(true);
      return;
    }
    
    if (viewMode === 'selection') {
      if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        setSelectedStartDate(day.date);
        setSelectedEndDate(null);
      } else {
        if (day.date < selectedStartDate) {
          setSelectedStartDate(day.date);
          setSelectedEndDate(selectedStartDate);
        } else {
          setSelectedEndDate(day.date);
        }
        
        if (onDateRangeSelect) {
          const start = day.date < selectedStartDate ? day.date : selectedStartDate;
          const end = day.date < selectedStartDate ? selectedStartDate : day.date;
          onDateRangeSelect(start, end);
        }
      }
    }
  };

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const getDayClasses = (day: CalendarDay) => {
    const classes = ['relative aspect-square p-1 transition-all cursor-pointer'];
    
    if (!day.isCurrentMonth) {
      classes.push('text-gray-400 bg-gray-50 dark:bg-gray-900');
    } else if (day.hasReservation) {
      // Resaltar más las reservaciones
      if (day.reservationInfo?.isCheckIn) {
        classes.push('bg-green-200 dark:bg-green-800 border-l-4 border-green-500');
      } else if (day.reservationInfo?.isCheckOut) {
        classes.push('bg-orange-200 dark:bg-orange-800 border-r-4 border-orange-500');
      } else {
        classes.push('bg-blue-200 dark:bg-blue-800 border border-blue-400');
      }
    } else if (day.isBlocked) {
      classes.push('bg-red-100 dark:bg-red-900/30 cursor-not-allowed');
    } else if (day.isInRange) {
      if (day.isRangeStart) {
        classes.push('bg-blue-500 text-white rounded-l-lg');
      } else if (day.isRangeEnd) {
        classes.push('bg-blue-500 text-white rounded-r-lg');
      } else {
        classes.push('bg-blue-100 dark:bg-blue-900/30');
      }
    } else if (day.isAvailable) {
      classes.push('bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600');
    } else {
      classes.push('bg-gray-100 dark:bg-gray-800');
    }
    
    if (day.isToday) {
      classes.push('ring-2 ring-yellow-400');
    }
    
    if (day.isSelected) {
      classes.push('ring-2 ring-blue-500');
    }
    
    return classes.join(' ');
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

  const calculateNights = () => {
    if (!selectedStartDate || !selectedEndDate) return 0;
    return Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden w-full">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">{roomName}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Precio base: ${basePrice}/noche
            </p>
          </div>
          
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="px-4 py-2 min-w-[180px] text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </p>
            </div>
            
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('availability')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              viewMode === 'availability' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Calendar className="inline-block w-4 h-4 mr-2" />
            Disponibilidad
          </button>
          <button
            onClick={() => setViewMode('pricing')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              viewMode === 'pricing' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <DollarSign className="inline-block w-4 h-4 mr-2" />
            Precios
          </button>
          <button
            onClick={() => setViewMode('selection')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              viewMode === 'selection' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Clock className="inline-block w-4 h-4 mr-2" />
            Selección
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2 md:p-6">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] md:text-xs font-semibold text-gray-600 dark:text-gray-400 py-1 md:py-2">
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
              onMouseEnter={() => viewMode === 'selection' && setHoveredDate(day.date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <div className="text-[11px] md:text-sm font-medium">{day.dayOfMonth}</div>
              
              {day.isCurrentMonth && (
                <>
                  {/* Price display */}
                  {viewMode === 'pricing' && !day.hasReservation && !day.isBlocked && (
                    <div className="text-[9px] md:text-xs font-bold text-green-600 dark:text-green-400">
                      ${day.price}
                    </div>
                  )}
                  
                  {/* Reservation info */}
                  {day.hasReservation && (
                    <div className="absolute inset-0 flex items-center justify-center p-0.5">
                      <div className="bg-blue-600 text-white text-[8px] md:text-[10px] px-0.5 md:px-1 py-0.5 rounded truncate max-w-full" 
                           title={day.reservationInfo?.guestName}>
                        {day.reservationInfo?.guestName || 'Reservado'}
                      </div>
                    </div>
                  )}
                  
                  {/* Blocked indicator */}
                  {day.isBlocked && !day.hasReservation && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-red-500">✕</span>
                    </div>
                  )}
                  
                  {/* Min nights indicator */}
                  {day.minNights && day.minNights > 1 && (
                    <div className="absolute bottom-1 right-1">
                      <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1 rounded">
                        {day.minNights}N
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      {viewMode === 'selection' && (selectedStartDate || selectedEndDate) && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Selección actual</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedStartDate && selectedStartDate.toLocaleDateString('es-ES')}
                {selectedEndDate && ` - ${selectedEndDate.toLocaleDateString('es-ES')}`}
              </p>
              {selectedStartDate && selectedEndDate && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {calculateNights()} noches • Total: ${calculateTotalPrice()}
                </p>
              )}
            </div>
            
            {selectedStartDate && (
              <button
                onClick={() => {
                  setSelectedStartDate(null);
                  setSelectedEndDate(null);
                  if (onDateRangeSelect) {
                    onDateRangeSelect(null, null);
                  }
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Limpiar selección
              </button>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white border border-gray-300 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Reservado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Bloqueado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Hoy</span>
          </div>
        </div>
      </div>

      {/* Price Editor Modal */}
      {showPriceEditor && selectedDateForPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Editar precio para {selectedDateForPricing.toLocaleDateString('es-ES')}
            </h3>
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Precio por noche"
            />
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => {
                  if (onPriceUpdate && selectedDateForPricing) {
                    onPriceUpdate(selectedDateForPricing, parseFloat(customPrice));
                  }
                  setShowPriceEditor(false);
                  setSelectedDateForPricing(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowPriceEditor(false);
                  setSelectedDateForPricing(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Details Modal */}
      {showReservationDetails && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalles de Reservación
              </h3>
              <button
                onClick={() => {
                  setShowReservationDetails(false);
                  setSelectedReservation(null);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Huésped</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedReservation.guestName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-semibold">
                  Confirmada
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ID de Reservación</p>
                <p className="font-medium text-gray-900 dark:text-white">#{selectedReservation.id}</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowReservationDetails(false);
                setSelectedReservation(null);
              }}
              className="w-full mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}