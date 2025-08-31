'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, addDays, differenceInDays, isWithinInterval, parseISO } from 'date-fns';
import { formatPrice } from '@/utils/formatPrice';

interface ReservationCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  onDatesSelect: (checkIn: Date, checkOut: Date) => void;
  roomId?: number;
  pricePerNight?: number;
  minStay?: number;
  maxStay?: number;
  colorScheme?: any;
  currency?: string;
}

interface AvailabilityData {
  [date: string]: {
    available: boolean;
    price?: number;
    minStay?: number;
  };
}

export default function ReservationCalendar({
  isOpen,
  onClose,
  checkInDate,
  checkOutDate,
  onDatesSelect,
  roomId,
  pricePerNight = 137,
  minStay = 1,  // Changed default from 2 to 1 to allow single night stays
  maxStay = 30,
  colorScheme,
  currency = 'USD'
}: ReservationCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [nextMonth, setNextMonth] = useState(addMonths(new Date(), 1));
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(checkInDate);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(checkOutDate);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize dates when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCheckIn(checkInDate);
      setSelectedCheckOut(checkOutDate);
      
      // If we have dates, set the calendar to show them
      if (checkInDate) {
        setCurrentMonth(new Date(checkInDate.getFullYear(), checkInDate.getMonth(), 1));
        setNextMonth(addMonths(new Date(checkInDate.getFullYear(), checkInDate.getMonth(), 1), 1));
      }
    }
  }, [isOpen, checkInDate, checkOutDate]);

  // Fetch availability data using public endpoint
  useEffect(() => {
    if (roomId && isOpen) {
      console.log('Fetching availability for room:', roomId);
      fetchAvailability();
    } else {
      console.log('Not fetching availability - roomId:', roomId, 'isOpen:', isOpen);
    }
  }, [roomId, currentMonth, isOpen]);

  const fetchAvailability = async () => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    // Don't show loading overlay after initial load
    if (availability && Object.keys(availability).length > 0) {
      // We already have some data, fetch in background
    } else {
      setLoading(true);
    }
    
    const startDate = startOfMonth(currentMonth);
    const endDate = endOfMonth(addMonths(currentMonth, 2));
    const companyId = localStorage.getItem('companyId') || '1';
    
    try {
      // Use public endpoint that doesn't require authentication
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/availability/public/room/${roomId}?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}&companyId=${companyId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Availability data for room', roomId, ':', data);
        
        // Transform data to our format
        const availabilityMap: AvailabilityData = {};
        
        // The API returns an array directly (List<RoomAvailabilityDto>)
        if (Array.isArray(data)) {
          console.log('Processing array of availability data:', data.length, 'dates');
          
          // Log first few items to see the structure
          if (data.length > 0) {
            console.log('Sample availability item:', JSON.stringify(data[0], null, 2));
            console.log('First 5 dates with details:', data.slice(0, 5).map((d: any) => ({
              date: d.date,
              isAvailable: d.isAvailable,
              hasReservation: d.hasReservation,
              isBlocked: d.isBlocked,
              reservationId: d.reservationId
            })));
          }
          
          data.forEach((dateInfo: any) => {
            const dateKey = dateInfo.date.split('T')[0]; // Extract just the date part
            
            // Determine if date is available
            const isAvailable = dateInfo.isAvailable && !dateInfo.hasReservation && !dateInfo.isBlocked;
            
            availabilityMap[dateKey] = {
              available: isAvailable,
              price: dateInfo.customPrice || dateInfo.price || pricePerNight,
              minStay: dateInfo.minNights || dateInfo.minStay || minStay
            };
            
            // Log blocked/reserved dates
            if (!isAvailable) {
              console.log(`Date ${dateKey} is NOT available:`, {
                isAvailable: dateInfo.isAvailable,
                hasReservation: dateInfo.hasReservation,
                isBlocked: dateInfo.isBlocked
              });
            }
          });
          
          console.log('Processed availability map:', availabilityMap);
          console.log('Total dates processed:', Object.keys(availabilityMap).length);
          console.log('Unavailable dates:', Object.entries(availabilityMap).filter(([_, v]) => !v.available).map(([k]) => k));
        } else if (data.availabilityData && Array.isArray(data.availabilityData)) {
          // Alternative format if wrapped in object
          data.availabilityData.forEach((dateInfo: any) => {
            const dateKey = dateInfo.date.split('T')[0];
            availabilityMap[dateKey] = {
              available: dateInfo.isAvailable && !dateInfo.hasReservation && !dateInfo.isBlocked,
              price: dateInfo.customPrice || pricePerNight,
              minStay: dateInfo.minNights || minStay
            };
          });
        }
        
        setAvailability(availabilityMap);
      } else {
        console.error('Failed to fetch availability:', response.status);
        // Try to get error details
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        // Set all dates as available if error (fallback)
        setAvailability({});
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      // Set all dates as available if error (fallback)
      setAvailability({});
    } finally {
      setLoading(false);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setNextMonth(subMonths(nextMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setNextMonth(addMonths(nextMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dateAvailability = availability[dateKey];
    
    // Check if date is available (if we have availability data)
    if (dateAvailability && !dateAvailability.available) {
      return; // Date is not available
    }

    // If no check-in selected, set it
    if (!selectedCheckIn) {
      setSelectedCheckIn(date);
      setSelectedCheckOut(null);
    } 
    // If check-in is selected but no check-out
    else if (!selectedCheckOut) {
      // If clicked date is before check-in, reset to new check-in
      if (isBefore(date, selectedCheckIn)) {
        setSelectedCheckIn(date);
        setSelectedCheckOut(null);
      } 
      // If clicked date is after check-in, set as check-out
      else if (isAfter(date, selectedCheckIn)) {
        // Check minimum stay
        const nights = differenceInDays(date, selectedCheckIn);
        if (nights >= minStay) {
          setSelectedCheckOut(date);
        } else {
          // Show a message if trying to select less than minimum stay
          console.log(`Minimum stay is ${minStay} night${minStay > 1 ? 's' : ''}. You selected ${nights} night${nights > 1 ? 's' : ''}.`);
        }
      }
      // If same date clicked, reset
      else {
        setSelectedCheckIn(date);
        setSelectedCheckOut(null);
      }
    }
    // Both dates selected, start new selection
    else {
      setSelectedCheckIn(date);
      setSelectedCheckOut(null);
    }
  };

  const handleApply = () => {
    if (selectedCheckIn && selectedCheckOut) {
      onDatesSelect(selectedCheckIn, selectedCheckOut);
      onClose();
    }
  };

  const handleClearDates = () => {
    setSelectedCheckIn(null);
    setSelectedCheckOut(null);
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Past dates are disabled
    if (isBefore(date, today)) return true;
    
    // Check availability data
    const dateKey = format(date, 'yyyy-MM-dd');
    const dateAvailability = availability[dateKey];
    
    if (dateAvailability && !dateAvailability.available) {
      return true;
    }
    
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    
    // Don't include the check-in and check-out dates themselves in the range
    const dayAfterCheckIn = addDays(selectedCheckIn, 1);
    const dayBeforeCheckOut = addDays(selectedCheckOut, -1);
    
    if (isSameDay(dayAfterCheckIn, dayBeforeCheckOut)) {
      return false; // Only one night stay, no dates in between
    }
    
    return isAfter(date, selectedCheckIn) && isBefore(date, selectedCheckOut);
  };

  const isDateHovered = (date: Date) => {
    if (!selectedCheckIn || selectedCheckOut || !hoverDate) return false;
    
    if (isAfter(hoverDate, selectedCheckIn)) {
      return isAfter(date, selectedCheckIn) && isBefore(date, hoverDate);
    }
    return false;
  };

  const renderMonth = (month: Date, isSecondMonth: boolean = false) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Log availability for this month (only once for debugging)
    if (!isSecondMonth && Object.keys(availability).length > 0) {
      const monthKey = format(month, 'yyyy-MM');
      const monthAvailability = Object.entries(availability).filter(([k]) => k.startsWith(monthKey));
      if (monthAvailability.length > 0) {
        console.log(`Availability for ${monthKey}:`, monthAvailability.slice(0, 5));
      }
    }
    
    // Get day of week for first day (0 = Sunday)
    const startDay = monthStart.getDay();
    
    // Add empty cells for days before month starts
    const emptyCells = Array.from({ length: startDay }, (_, i) => (
      <div key={`empty-${i}`} className="h-9"></div>
    ));

    return (
      <div className={`${isSecondMonth ? 'hidden md:block' : ''}`}>
        <h3 className="text-center font-semibold text-sm mb-3">
          {format(month, 'MMMM yyyy')}
        </h3>
        
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={`weekday-${index}`} className="text-center text-[11px] font-medium text-gray-500 h-6 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0">
          {emptyCells}
          {days.map(day => {
            const isDisabled = isDateDisabled(day);
            const isCheckIn = selectedCheckIn && isSameDay(day, selectedCheckIn);
            const isCheckOut = selectedCheckOut && isSameDay(day, selectedCheckOut);
            const isInRange = isDateInRange(day);
            const isHovered = isDateHovered(day);
            const dateKey = format(day, 'yyyy-MM-dd');
            const dateAvailability = availability[dateKey];
            
            return (
              <div
                key={day.toISOString()}
                onMouseEnter={() => !isDisabled && setHoverDate(day)}
                onMouseLeave={() => setHoverDate(null)}
                onClick={() => !isDisabled && handleDateClick(day)}
                className={`
                  h-9 flex items-center justify-center relative
                  ${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed'}
                  ${isInRange ? 'bg-gray-100' : ''}
                  ${isHovered ? 'bg-gray-50' : ''}
                  transition-colors duration-150
                `}
              >
                {/* Circle background for selected dates */}
                {(isCheckIn || isCheckOut) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-9 h-9 bg-black rounded-full transition-all duration-200 transform scale-100"></div>
                  </div>
                )}
                
                {/* Date number */}
                <span className={`
                  text-[13px] relative z-10
                  ${isDisabled ? 'text-gray-300 line-through' : ''}
                  ${isCheckIn || isCheckOut ? 'text-white font-semibold' : ''}
                  ${!isDisabled && !isCheckIn && !isCheckOut ? 'text-gray-700 hover:font-semibold' : ''}
                `}>
                  {format(day, 'd')}
                </span>
                
                {/* Show unavailable indicator */}
                {dateAvailability && !dateAvailability.available && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-[2px] bg-gray-400 transform rotate-45"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const nights = selectedCheckIn && selectedCheckOut 
    ? differenceInDays(selectedCheckOut, selectedCheckIn)
    : 0;

  const totalPrice = nights * pricePerNight;

  return (
    <>
      {/* Backdrop without animation - simple fade */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal without scale animation - just appear */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          ref={modalRef}
          className="bg-white rounded-xl max-w-3xl w-full shadow-2xl pointer-events-auto"
          style={{ backgroundColor: colorScheme?.background || '#ffffff' }}
        >
          {/* Show skeleton loader while loading initial data */}
          {loading ? (
            <div className="p-6">
              {/* Header skeleton */}
              <div className="mb-4">
                <div className="h-8 bg-gray-200 rounded w-48 mb-3 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
              
              {/* Calendar skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-3 animate-pulse"></div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }, (_, i) => (
                      <div key={i} className="h-9 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-3 animate-pulse"></div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }, (_, i) => (
                      <div key={i} className="h-9 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Footer skeleton */}
              <div className="flex justify-between mt-6">
                <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Header with dates and nights */}
              <div className="px-6 pt-5 pb-4">
                {/* Nights display */}
                {nights > 0 && (
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-semibold">{nights} night{nights > 1 ? 's' : ''}</span>
                      <span className="text-gray-500 text-sm">
                        {selectedCheckIn && format(selectedCheckIn, 'MMM d, yyyy')} - {selectedCheckOut && format(selectedCheckOut, 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Date inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <div className="border border-gray-300 rounded-lg px-3 py-2.5 flex items-center justify-between bg-white hover:border-gray-400 transition-colors">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase text-gray-600 tracking-wide">CHECK-IN</label>
                        <div className="text-sm font-medium mt-0.5 text-gray-900">
                          {selectedCheckIn ? format(selectedCheckIn, 'M/d/yyyy') : 'Add date'}
                        </div>
                      </div>
                      {selectedCheckIn && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCheckIn(null);
                            setSelectedCheckOut(null);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full ml-2 transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="border border-gray-300 rounded-lg px-3 py-2.5 flex items-center justify-between bg-white hover:border-gray-400 transition-colors">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase text-gray-600 tracking-wide">CHECKOUT</label>
                        <div className="text-sm font-medium mt-0.5 text-gray-900">
                          {selectedCheckOut ? format(selectedCheckOut, 'M/d/yyyy') : 'Add date'}
                        </div>
                      </div>
                      {selectedCheckOut && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCheckOut(null);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full ml-2 transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar section with navigation */}
              <div className="px-6 pb-5 relative">
                <div className="flex items-start justify-between">
                  {/* Previous month button */}
                  <button 
                    onClick={handlePrevMonth}
                    className="absolute left-2 top-8 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {/* Calendar grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 px-8">
                    {renderMonth(currentMonth)}
                    {renderMonth(nextMonth, true)}
                  </div>

                  {/* Next month button */}
                  <button 
                    onClick={handleNextMonth}
                    className="absolute right-2 top-8 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price display for selected dates */}
              {nights > 0 && (
                <div className="px-6 py-3 border-t border-gray-200">
                  <div className="text-center">
                    <span className="text-base font-semibold">{formatPrice(totalPrice, currency)}</span>
                    <span className="text-gray-500 text-sm ml-1">for {nights} night{nights > 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}

              {/* Footer with actions */}
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={handleClearDates}
                  className="text-sm font-medium underline text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Clear dates
                </button>
                
                <button
                  onClick={handleApply}
                  disabled={!selectedCheckIn || !selectedCheckOut}
                  className={`
                    px-5 py-2 rounded-lg text-sm font-semibold transition-all
                    ${selectedCheckIn && selectedCheckOut 
                      ? 'bg-gray-900 text-white hover:bg-gray-800' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}