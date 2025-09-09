'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface QuickOption {
  id: string;
  label: string;
  getValue: () => DateRange;
}

interface DateRangeSelectorProps {
  value?: DateRange;
  onChange?: (range: DateRange, quickOption?: string) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export function DateRangeSelector({ value, onChange, onClose, isOpen }: DateRangeSelectorProps) {
  const { t } = useI18n();
  const [selectedRange, setSelectedRange] = useState<DateRange>(
    value || {
      startDate: new Date(2025, 6, 6), // 6 de julio 2025
      endDate: new Date(2025, 7, 4),   // 4 de agosto 2025
    }
  );
  const [selectedQuickOption, setSelectedQuickOption] = useState<string>('last30days');
  const [leftMonth, setLeftMonth] = useState(new Date(2025, 6, 1)); // julio 2025
  const [rightMonth, setRightMonth] = useState(new Date(2025, 7, 1)); // agosto 2025
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Quick options configuration
  const quickOptions: QuickOption[] = [
    {
      id: 'today',
      label: t('dateRange.today', 'Hoy'),
      getValue: () => {
        const today = new Date();
        return { startDate: today, endDate: today };
      }
    },
    {
      id: 'yesterday',
      label: t('dateRange.yesterday', 'Ayer'),
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return { startDate: yesterday, endDate: yesterday };
      }
    },
    {
      id: 'last7days',
      label: t('dateRange.last7days', 'Últimos 7 días'),
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return { startDate: start, endDate: end };
      }
    },
    {
      id: 'last30days',
      label: t('dateRange.last30days', 'Últimos 30 días'),
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return { startDate: start, endDate: end };
      }
    },
    {
      id: 'last90days',
      label: t('dateRange.last90days', 'Últimos 90 días'),
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 89);
        return { startDate: start, endDate: end };
      }
    },
    {
      id: 'last365days',
      label: t('dateRange.last365days', 'Últimos 365 días'),
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 364);
        return { startDate: start, endDate: end };
      }
    },
    {
      id: 'lastMonth',
      label: t('dateRange.lastMonth', 'Mes pasado'),
      getValue: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        return { startDate: start, endDate: end };
      }
    },
    {
      id: 'last12months',
      label: t('dateRange.last12months', 'Últimos 12 meses'),
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 11);
        start.setDate(1);
        return { startDate: start, endDate: end };
      }
    },
    {
      id: 'lastYear',
      label: t('dateRange.lastYear', 'Año pasado'),
      getValue: () => {
        const today = new Date();
        const start = new Date(today.getFullYear() - 1, 0, 1);
        const end = new Date(today.getFullYear() - 1, 11, 31);
        return { startDate: start, endDate: end };
      }
    }
  ];

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format date for input
  const formatInputDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get month name
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() - 1, 1));
      setRightMonth(new Date(rightMonth.getFullYear(), rightMonth.getMonth() - 1, 1));
    } else {
      setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1));
      setRightMonth(new Date(rightMonth.getFullYear(), rightMonth.getMonth() + 1, 1));
    }
  };

  // Handle quick option selection
  const handleQuickOptionSelect = (optionId: string) => {
    const option = quickOptions.find(opt => opt.id === optionId);
    if (option) {
      const range = option.getValue();
      setSelectedRange(range);
      setSelectedQuickOption(optionId);
      
      // Clear selection state
      setIsSelectingRange(false);
      setTempStartDate(null);
      setHoveredDate(null);
      
      // Update calendar months to show the selected range
      setLeftMonth(new Date(range.startDate.getFullYear(), range.startDate.getMonth(), 1));
      setRightMonth(new Date(range.endDate.getFullYear(), range.endDate.getMonth(), 1));
    }
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (!isSelectingRange || !tempStartDate) {
      // Start new range selection
      setTempStartDate(date);
      setSelectedRange({ startDate: date, endDate: date });
      setIsSelectingRange(true);
      setSelectedQuickOption(''); // Clear quick option selection
      setHoveredDate(null);
    } else {
      // Complete range selection
      if (date.getTime() === tempStartDate.getTime()) {
        // Clicking same date, keep as single day selection
        setIsSelectingRange(false);
        setTempStartDate(null);
        return;
      }
      
      const newRange = {
        startDate: date < tempStartDate ? date : tempStartDate,
        endDate: date < tempStartDate ? tempStartDate : date
      };
      setSelectedRange(newRange);
      setIsSelectingRange(false);
      setTempStartDate(null);
      setHoveredDate(null);
    }
  };

  // Handle apply
  const handleApply = () => {
    onChange?.(selectedRange, selectedQuickOption);
    onClose?.();
  };

  // Handle cancel
  const handleCancel = () => {
    onClose?.();
  };

  // Generate calendar days
  const generateCalendarDays = (month: Date) => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    
    // Adjust to start on Monday (ISO week)
    const dayOfWeek = (firstDay.getDay() + 6) % 7;
    startDate.setDate(firstDay.getDate() - dayOfWeek);

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // Handle date hover during selection
  const handleDateHover = (date: Date) => {
    if (isSelectingRange && tempStartDate) {
      setHoveredDate(date);
    }
  };

  // Get preview range during selection
  const getPreviewRange = () => {
    if (isSelectingRange && tempStartDate && hoveredDate) {
      return {
        startDate: hoveredDate < tempStartDate ? hoveredDate : tempStartDate,
        endDate: hoveredDate < tempStartDate ? tempStartDate : hoveredDate
      };
    }
    return selectedRange;
  };

  // Check if date is in range (including preview)
  const isDateInRange = (date: Date, calendarMonth: Date) => {
    const previewRange = getPreviewRange();
    const dateTime = date.getTime();
    const startTime = previewRange.startDate.getTime();
    const endTime = previewRange.endDate.getTime();
    const isInRange = dateTime >= startTime && dateTime <= endTime;
    
    // Only show range highlighting for dates that belong to the current calendar month
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();
    const calendarMonthNumber = calendarMonth.getMonth();
    const calendarYear = calendarMonth.getFullYear();
    
    const isInCurrentCalendarMonth = dateMonth === calendarMonthNumber && dateYear === calendarYear;
    
    return isInRange && isInCurrentCalendarMonth;
  };

  // Check if date is start or end of range - only for current calendar month
  const isRangeStart = (date: Date, calendarMonth: Date) => {
    const previewRange = getPreviewRange();
    const isExactStart = date.getTime() === previewRange.startDate.getTime();
    
    // Only show start highlighting if the date belongs to the current calendar month
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();
    const calendarMonthNumber = calendarMonth.getMonth();
    const calendarYear = calendarMonth.getFullYear();
    
    const isInCurrentCalendarMonth = dateMonth === calendarMonthNumber && dateYear === calendarYear;
    
    return isExactStart && isInCurrentCalendarMonth;
  };
  
  const isRangeEnd = (date: Date, calendarMonth: Date) => {
    const previewRange = getPreviewRange();
    const isExactEnd = date.getTime() === previewRange.endDate.getTime();
    
    // Only show end highlighting if the date belongs to the current calendar month
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();
    const calendarMonthNumber = calendarMonth.getMonth();
    const calendarYear = calendarMonth.getFullYear();
    
    const isInCurrentCalendarMonth = dateMonth === calendarMonthNumber && dateYear === calendarYear;
    
    return isExactEnd && isInCurrentCalendarMonth;
  };

  // Check if date is being previewed (temporary selection) - only for current calendar month
  const isPreviewRange = (date: Date, calendarMonth: Date) => {
    if (!isSelectingRange || !tempStartDate || !hoveredDate) return false;
    const dateTime = date.getTime();
    const startTime = Math.min(tempStartDate.getTime(), hoveredDate.getTime());
    const endTime = Math.max(tempStartDate.getTime(), hoveredDate.getTime());
    const isInRange = dateTime >= startTime && dateTime <= endTime;
    
    // Only show preview highlighting for dates that belong to the current calendar month
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();
    const calendarMonthNumber = calendarMonth.getMonth();
    const calendarYear = calendarMonth.getFullYear();
    
    const isInCurrentCalendarMonth = dateMonth === calendarMonthNumber && dateYear === calendarYear;
    
    return isInRange && isInCurrentCalendarMonth;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20">
      <div className="flex items-center justify-end min-h-screen p-4 pr-8">
        <div 
          ref={containerRef}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
          style={{ 
            width: '800px', 
            maxWidth: 'calc(100vw - 400px)', // Account for sidebar width
            height: '500px',
            maxHeight: 'calc(100vh - 2rem)',
            marginRight: '2rem',
            position: 'relative'
          }}
        >
        {/* Header with date inputs */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex-shrink-0">
          <div className="flex items-center justify-center gap-4">
            <input
              type="text"
              value={formatInputDate(selectedRange.startDate)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              readOnly
            />
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <input
              type="text"
              value={formatInputDate(selectedRange.endDate)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              readOnly
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Quick options */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 overflow-y-auto">
            <div className="p-3">
              <div className="space-y-1">
                {quickOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleQuickOptionSelect(option.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                      selectedQuickOption === option.id
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right content - Calendar grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Calendar navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeftIcon size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex items-center gap-8">
                <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                  {getMonthName(leftMonth)}
                </h3>
                <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                  {getMonthName(rightMonth)}
                </h3>
              </div>

              <button
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRightIcon size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Calendar grids */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left calendar */}
              <div>
                {/* Week headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays(leftMonth).map((date, index) => {
                    const isCurrentMonth = date.getMonth() === leftMonth.getMonth();
                    const isInRange = isDateInRange(date, leftMonth);
                    const isStart = isRangeStart(date, leftMonth);
                    const isEnd = isRangeEnd(date, leftMonth);
                    const isPreview = isPreviewRange(date, leftMonth);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        onMouseEnter={() => handleDateHover(date)}
                        onMouseLeave={() => setHoveredDate(null)}
                        className={cn(
                          'h-8 w-8 text-sm rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700',
                          !isCurrentMonth && 'text-gray-300 dark:text-gray-600',
                          isCurrentMonth && 'text-gray-900 dark:text-white',
                          isInRange && !isSelectingRange && 'bg-primary-50 dark:bg-primary-900/20',
                          isPreview && isSelectingRange && 'bg-primary-100 dark:bg-primary-800/40',
                          (isStart || isEnd) && 'bg-primary-600 text-white hover:bg-primary-700',
                          isStart && !isEnd && 'rounded-r-none',
                          isEnd && !isStart && 'rounded-l-none',
                          isStart && isEnd && 'rounded-lg' // Single day selection
                        )}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right calendar */}
              <div>
                {/* Week headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays(rightMonth).map((date, index) => {
                    const isCurrentMonth = date.getMonth() === rightMonth.getMonth();
                    const isInRange = isDateInRange(date, rightMonth);
                    const isStart = isRangeStart(date, rightMonth);
                    const isEnd = isRangeEnd(date, rightMonth);
                    const isPreview = isPreviewRange(date, rightMonth);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        onMouseEnter={() => handleDateHover(date)}
                        onMouseLeave={() => setHoveredDate(null)}
                        className={cn(
                          'h-8 w-8 text-sm rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700',
                          !isCurrentMonth && 'text-gray-300 dark:text-gray-600',
                          isCurrentMonth && 'text-gray-900 dark:text-white',
                          isInRange && !isSelectingRange && 'bg-primary-50 dark:bg-primary-900/20',
                          isPreview && isSelectingRange && 'bg-primary-100 dark:bg-primary-800/40',
                          (isStart || isEnd) && 'bg-primary-600 text-white hover:bg-primary-700',
                          isStart && !isEnd && 'rounded-r-none',
                          isEnd && !isStart && 'rounded-l-none',
                          isStart && isEnd && 'rounded-lg' // Single day selection
                        )}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex-shrink-0">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            {t('common.cancel', 'Cancelar')}
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            {t('common.apply', 'Aplicar')}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}