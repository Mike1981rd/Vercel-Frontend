'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, CalendarDays, Info } from 'lucide-react';

interface RoomCalendarConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  minimumNights: number;
  blockedDates: string[];
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  showPricing: boolean;
}

interface PreviewRoomCalendarProps {
  config: RoomCalendarConfig;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
  theme?: any;
}

export default function PreviewRoomCalendar({ 
  config, 
  deviceView, 
  isEditor = false,
  theme 
}: PreviewRoomCalendarProps) {
  
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (deviceView !== undefined) {
      setIsMobile(deviceView === 'mobile');
      return;
    }
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [deviceView]);

  if (!config.enabled) {
    return null;
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nights = selectedCheckIn && selectedCheckOut 
    ? Math.ceil((selectedCheckOut.getTime() - selectedCheckIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = nights * config.pricePerNight;
  const totalWithFees = totalPrice + config.cleaningFee + config.serviceFee;

  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (selectedCheckIn && selectedCheckOut) {
      return date >= selectedCheckIn && date <= selectedCheckOut;
    }
    return selectedCheckIn?.getDate() === day && 
           selectedCheckIn?.getMonth() === currentMonth.getMonth();
  };

  const isStartDate = (day: number) => {
    return selectedCheckIn?.getDate() === day && 
           selectedCheckIn?.getMonth() === currentMonth.getMonth();
  };

  const isEndDate = (day: number) => {
    return selectedCheckOut?.getDate() === day && 
           selectedCheckOut?.getMonth() === currentMonth.getMonth();
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      setSelectedCheckIn(clickedDate);
      setSelectedCheckOut(null);
    } else {
      if (clickedDate > selectedCheckIn) {
        setSelectedCheckOut(clickedDate);
      } else {
        setSelectedCheckIn(clickedDate);
        setSelectedCheckOut(null);
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-4 border-t">
      <div className="max-w-xl mx-auto">
        {/* Ultra-compact header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-medium flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-gray-600" />
              {config.title || 'Availability'}
            </h2>
            {config.subtitle && (
              <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                <Info className="w-2.5 h-2.5" />
                {config.subtitle || `Minimum ${config.minimumNights} nights`}
              </p>
            )}
          </div>
          
          {/* Selected dates display */}
          {(selectedCheckIn || selectedCheckOut) && (
            <button 
              onClick={() => {
                setSelectedCheckIn(null);
                setSelectedCheckOut(null);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 transition"
            >
              Clear
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Ultra-compact calendar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Minimalist month navigation */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-3 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <button 
                onClick={prevMonth} 
                className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
              </button>
              
              <div className="text-xs font-medium text-gray-800">
                {monthNames[currentMonth.getMonth()].substring(0, 3)} {currentMonth.getFullYear()}
              </div>
              
              <button 
                onClick={nextMonth} 
                className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Ultra-compact calendar grid */}
          <div className="p-2">
            <div className="grid grid-cols-7 gap-0">
              {/* Ultra-minimalist weekday headers */}
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-center text-[9px] font-medium text-gray-400 h-4">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for alignment */}
              {[...Array(getFirstDayOfMonth(currentMonth))].map((_, i) => (
                <div key={`empty-${i}`} className="h-7"></div>
              ))}
              
              {/* Ultra-compact day cells */}
              {[...Array(getDaysInMonth(currentMonth))].map((_, i) => {
                const day = i + 1;
                const isToday = new Date().getDate() === day && 
                              new Date().getMonth() === currentMonth.getMonth() &&
                              new Date().getFullYear() === currentMonth.getFullYear();
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isPast = date < new Date(new Date().setHours(0,0,0,0));
                const isSelected = isDateSelected(day);
                const isStart = isStartDate(day);
                const isEnd = isEndDate(day);
                const isBlocked = config.blockedDates?.includes(date.toISOString().split('T')[0]);
                
                return (
                  <button
                    key={day}
                    onClick={() => !isPast && !isBlocked && handleDateClick(day)}
                    className={`
                      h-7 w-full flex items-center justify-center text-[11px] rounded-md
                      transition-all duration-200 relative
                      ${isToday && !isSelected ? 'ring-1 ring-gray-300' : ''}
                      ${isPast || isBlocked ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-100 cursor-pointer'}
                      ${isSelected && !isStart && !isEnd ? 'bg-blue-50 text-blue-900' : ''}
                      ${isStart || isEnd ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700' : ''}
                      ${!isPast && !isBlocked && !isSelected ? 'text-gray-700' : ''}
                    `}
                    disabled={isPast || isBlocked}
                  >
                    <span className="relative z-10">{day}</span>
                    {isBlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1px] bg-gray-400 rotate-45"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact pricing footer */}
          {config.showPricing && nights > 0 && (
            <div className="border-t border-gray-100 px-3 py-2 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">
                    ${config.pricePerNight} × {nights}n
                  </span>
                  <span className="font-medium text-gray-900">
                    Total: ${totalWithFees}
                  </span>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-[10px] font-medium rounded-md hover:bg-blue-700 transition">
                  Reserve
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected dates summary - ultra compact */}
        {selectedCheckIn && (
          <div className="mt-2 px-2.5 py-1.5 bg-blue-50 rounded-md">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">
                  In: <span className="font-medium text-gray-900">
                    {selectedCheckIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </span>
                {selectedCheckOut && (
                  <>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-600">
                      Out: <span className="font-medium text-gray-900">
                        {selectedCheckOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </span>
                  </>
                )}
              </div>
              {nights > 0 && (
                <span className="font-medium text-blue-600">
                  {nights}n
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}