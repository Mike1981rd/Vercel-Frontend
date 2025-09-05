'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Star, Share, Heart, Medal, Shield, Calendar, ChevronDown, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import ReservationCalendar from './ReservationCalendar';
import { format, addDays, differenceInDays } from 'date-fns';
import { useCurrency } from '@/contexts/CurrencyContext';
import { fetchRoomData } from '@/lib/api/rooms';

interface Highlight {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface RoomTitleHostConfig {
  enabled: boolean;
  colorScheme?: 1 | 2 | 3 | 4 | 5;
  fontSize?: {
    title: number;
    subtitle: number;
    details: number;
  };
  alignment?: 'left' | 'center' | 'right';
  showRating?: boolean;
  showSuperhost?: boolean;
  showHostImage?: boolean;
  showHostVerification?: boolean;
  showReservationWidget?: boolean;
  reserveButtonText?: string; // Custom button text
  showHighlights?: boolean; // Show highlights section
  highlights?: Highlight[]; // Highlights configuration
  spacing?: 'compact' | 'comfortable' | 'spacious';
  hostImageSize?: number; // Size in pixels
  paddingTop?: number; // Internal top padding in pixels
  paddingBottom?: number; // Internal bottom padding in pixels
  containerPaddingTop?: number; // External container top margin
  containerPaddingBottom?: number; // External container bottom margin
  mobileTopSpacing?: number; // Mobile-specific top spacing
  mobileCardOffset?: number; // Mobile card vertical position offset
}

interface PreviewRoomTitleHostProps {
  config: RoomTitleHostConfig;
  deviceView?: 'desktop' | 'mobile';
  isEditor?: boolean;
  theme?: any;
}

export default function PreviewRoomTitleHost({ 
  config, 
  deviceView, 
  isEditor = false,
  theme 
}: PreviewRoomTitleHostProps) {
  const router = useRouter();
  
  // Get theme config from store or prop
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;
  
  // Get the selected color scheme
  const colorScheme = useMemo(() => {
    if (!themeConfig?.colorSchemes?.schemes) return null;
    
    const schemeIndex = (config.colorScheme || 1) - 1;
    return themeConfig.colorSchemes.schemes[schemeIndex] || themeConfig.colorSchemes.schemes[0];
  }, [themeConfig, config.colorScheme]);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  const [roomData, setRoomData] = useState<any>(null);
  const [hostData, setHostData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [companyCurrency, setCompanyCurrency] = useState<string>('USD');
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  // Currency: use global CurrencyContext so selector affects this page
  const { selectedCurrency, baseCurrency, convertPrice, formatPrice: formatCurrency } = useCurrency();
  const formatPriceDisplay = (amount: number) => {
    try {
      const converted = convertPrice(amount, baseCurrency, selectedCurrency);
      return formatCurrency(converted, selectedCurrency);
    } catch {
      return `${selectedCurrency} ${amount.toFixed(2)}`;
    }
  };

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

  // Close guests dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.guests-dropdown-container')) {
        setShowGuestsDropdown(false);
      }
    };

    if (showGuestsDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showGuestsDropdown]);

  // Auto-fetch room data for both editor and preview
  useEffect(() => {
    const loadRoomData = async () => {
      const companyId = localStorage.getItem('companyId') || '1';
      
      setLoading(true);
      try {
        // First fetch company data to get currency
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
        const companyId = localStorage.getItem('companyId') || '1';
        const companyResponse = await fetch(`${apiUrl}/company/${companyId}/public`);
        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          setCompanyCurrency((companyData.currency || 'USD').toUpperCase());
        }
        
        // Then fetch room data using the helper function
        const data = await fetchRoomData(companyId);
        if (data) {
          console.log('Room data fetched:', data); // Debug log
          console.log('Base Price:', data.basePrice); // Debug log for price
          setRoomData(data);
          
          // If room has hostId, fetch complete host data
          if (data.hostId) {
            try {
              const hostResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/hosts/by-room/${data.id}`
              );
              if (hostResponse.ok) {
                const fullHostData = await hostResponse.json();
                console.log('Full host data fetched:', fullHostData); // Debug log
                setHostData(fullHostData);
              }
            } catch (hostError) {
              console.error('Error fetching host data:', hostError);
              // Use basic host data from room if available
              setHostData(data.host);
            }
          } else if (data.host) {
            // Use host data from room if no hostId
            setHostData(data.host);
          }
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch in both editor and preview modes when enabled
    if (config.enabled) {
      loadRoomData();
    }
  }, [config.enabled]);

  if (!config.enabled) {
    return null;
  }

  // Parse SleepingArrangements if available
  let sleepingArrangements = null;
  if (roomData?.sleepingArrangements) {
    try {
      sleepingArrangements = typeof roomData.sleepingArrangements === 'string' 
        ? JSON.parse(roomData.sleepingArrangements) 
        : roomData.sleepingArrangements;
      console.log('Parsed sleepingArrangements:', sleepingArrangements); // Debug log
    } catch (e) {
      console.error('Error parsing sleepingArrangements:', e);
    }
  }

  // Use host data from fetch or fallback to room data
  const currentHost = hostData || roomData?.host;
  
  // Calculate years hosting from yearStartedHosting or joinedDate
  const getHostingYears = () => {
    const currentYear = new Date().getFullYear();
    
    // First priority: Use yearStartedHosting if available
    if (currentHost?.yearStartedHosting) {
      return currentYear - currentHost.yearStartedHosting;
    }
    
    // Fallback: Calculate from joinedDate
    if (currentHost?.joinedDate) {
      return currentYear - new Date(currentHost.joinedDate).getFullYear();
    }
    
    // Default
    return 0;
  };
  
  // Use room data if available, with default fallbacks
  const displayData = roomData ? {
    title: roomData.name || 'Beautiful Room in City Center',
    location: roomData.city ? 
      `${roomData.neighborhood ? roomData.neighborhood + ', ' : ''}${roomData.city}${roomData.state ? ', ' + roomData.state : ''}`.trim() : 
      'San Francisco, California',
    guests: roomData.maxOccupancy || 4,
    bedrooms: sleepingArrangements?.totalRooms || sleepingArrangements?.totalBedrooms || 2,
    beds: sleepingArrangements?.totalBeds || 2,
    baths: sleepingArrangements?.totalBathrooms || 1,
    rating: roomData.averageRating || 4.92,
    reviewCount: roomData.totalReviews || 124,
    hostName: currentHost?.fullName || currentHost?.firstName || 'John',
    hostImage: currentHost?.profilePicture || 'https://a0.muscache.com/defaults/user_pic-225x225.png?v=3',
    hostVerified: currentHost?.isVerified !== undefined ? currentHost.isVerified : true,
    hostSuperhost: currentHost?.isSuperhost !== undefined ? currentHost.isSuperhost : true,
    hostYears: getHostingYears(),
    hostLocation: currentHost?.location || '',
    hostWork: currentHost?.work || '',
    hostLanguages: currentHost?.languages || [],
    hostAttributes: currentHost?.attributes || [],
    hostHobbies: currentHost?.hobbies || [],
    hostAboutMe: currentHost?.aboutMe || currentHost?.bio || '',
    hostResponseTime: currentHost?.responseTimeMinutes || 60,
    hostAcceptanceRate: currentHost?.acceptanceRate || 95
  } : {
    title: 'Beautiful Room in City Center',
    location: 'San Francisco, California',
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    rating: 4.92,
    reviewCount: 124,
    hostName: 'John',
    hostImage: 'https://a0.muscache.com/defaults/user_pic-225x225.png?v=3',
    hostVerified: true,
    hostSuperhost: true,
    hostYears: 0,
    hostLocation: '',
    hostWork: '',
    hostLanguages: [],
    hostAttributes: [],
    hostHobbies: [],
    hostAboutMe: '',
    hostResponseTime: 60,
    hostAcceptanceRate: 95
  };
  
  // Get spacing classes
  const getSpacing = () => {
    switch(config.spacing) {
      case 'compact': return 'py-3 px-4';
      case 'spacious': return 'py-8 px-8';
      default: return 'py-6 px-6';
    }
  };
  
  // Get alignment styles
  const getAlignment = () => {
    switch(config.alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };
  
  // Get font sizes
  const getFontSizes = () => ({
    title: config.fontSize?.title ? `${config.fontSize.title}%` : '100%',
    subtitle: config.fontSize?.subtitle ? `${config.fontSize.subtitle}%` : '90%',
    details: config.fontSize?.details ? `${config.fontSize.details}%` : '85%'
  });

  const fontSizes = getFontSizes();
  
  // Get host image size - default to 48px if not specified
  const hostImageSize = config.hostImageSize || 48;
  
  // Get container spacing - asegurarse de que 0 se respete
  const containerTopPadding = config.containerPaddingTop !== undefined ? config.containerPaddingTop : 0;
  const containerBottomPadding = config.containerPaddingBottom !== undefined ? config.containerPaddingBottom : 0;
  
  // Calculate price per night and total
  const pricePerNight = roomData?.basePrice || 137;
  const totalNights = checkInDate && checkOutDate 
    ? differenceInDays(checkOutDate, checkInDate)
    : 0;
  const cleaningFee = 0; // TEMP: set to 0 until real values are implemented
  const serviceFee = 0; // TEMP: set to 0 until real values are implemented
  const totalBeforeTaxes = totalNights > 0 
    ? (pricePerNight * totalNights) + cleaningFee + serviceFee
    : 0;
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  // Handle date selection from calendar
  const handleDatesSelect = (checkIn: Date, checkOut: Date) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
    setShowCalendar(false);
  };

  // Handle reservation
  const handleReserve = () => {
    if (checkInDate && checkOutDate) {
      const nights = differenceInDays(checkOutDate, checkInDate);

      // Try to pick a cover image from room data
      const imageUrl = roomData?.coverImage 
        || (Array.isArray(roomData?.images) && roomData.images.length > 0 ? roomData.images[0] : undefined)
        || (Array.isArray(roomData?.gallery) && roomData.gallery.length > 0 ? (roomData.gallery[0]?.url || roomData.gallery[0]) : undefined);

      // Store reservation data in sessionStorage (existing behavior)
      const reservationData = {
        roomId: roomData?.id,
        roomName: roomData?.name,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        guests: guests,
        pricePerNight: pricePerNight,
        totalNights: nights,
        totalPrice: pricePerNight * nights + cleaningFee + serviceFee,
        cleaningFee: cleaningFee,
        serviceFee: serviceFee,
        currency: companyCurrency,
        imageUrl: imageUrl
      };
      sessionStorage.setItem('roomReservation', JSON.stringify(reservationData));

      // Also store a checkout payload compatible with the checkout page (localStorage)
      const checkoutPayload = {
        roomId: roomData?.id,
        roomName: roomData?.name || displayData.title,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        nights,
        guests,
        pricePerNight,
        fees: [
          { label: 'Cleaning fee', amount: cleaningFee },
          { label: 'Service fee', amount: serviceFee }
        ],
        currency: companyCurrency,
        imageUrl: imageUrl,
        // Optional enrichments for checkout UI (Airbnb-like)
        rating: displayData.rating,
        reviewCount: displayData.reviewCount,
        isSuperhost: displayData.hostSuperhost,
        hostName: displayData.hostName,
        location: displayData.location,
        images: Array.isArray(roomData?.images) && roomData.images.length > 0
          ? roomData.images
          : (Array.isArray(roomData?.gallery) ? roomData.gallery.map((g: any) => g?.url || g).filter(Boolean) : [])
      };
      localStorage.setItem('room_checkout_payload', JSON.stringify(checkoutPayload));

      router.push('/checkout-room');
    }
  };

  // Handle guest selection
  const handleGuestChange = (newGuestCount: number) => {
    const maxGuests = roomData?.maxOccupancy || 4;
    if (newGuestCount >= 1 && newGuestCount <= maxGuests) {
      setGuests(newGuestCount);
    }
  };

  return (
    <div style={{ 
      marginTop: isMobile && config.mobileTopSpacing !== undefined 
        ? `${config.mobileTopSpacing}px` 
        : `${containerTopPadding}px`,
      marginBottom: `${containerBottomPadding}px`
    }}>
      <div 
        style={{ 
          backgroundColor: colorScheme?.background || '#ffffff',
          color: colorScheme?.text || '#000000',
          paddingTop: `${config.paddingTop || 24}px`,
          paddingBottom: `${config.paddingBottom || 24}px`
        }}
      >
        <div className={`container mx-auto ${getSpacing()}`}>
          {/* Two column layout for desktop with reservation widget */}
          <div className={`${config.showReservationWidget !== false && !isMobile ? 'flex gap-8 items-start' : ''}`}>
            {/* Left column - Main content */}
            <div className={`${config.showReservationWidget !== false && !isMobile ? 'flex-1' : 'w-full'}`}>
              {/* Mobile: Modern Compact Card Layout */}
              {isMobile ? (
                <>
                <div 
                  className="rounded-xl shadow-lg p-4 mb-4"
                  style={{
                    backgroundColor: colorScheme?.cardBackground || '#ffffff',
                    border: `1px solid ${colorScheme?.border || '#e5e7eb'}`,
                    marginTop: config.mobileCardOffset ? `${config.mobileCardOffset}px` : '0',
                    transition: 'margin-top 0.3s ease'
                  }}
                >
                  {/* Title, Property Details, and Location */}
                  <div className="text-center mb-4">
                    <h1 
                      className="text-lg font-semibold mb-1"
                      style={{ 
                        color: colorScheme?.text || '#000000'
                      }}
                    >
                      {displayData.title}
                    </h1>
                    
                    {/* Property Details - Right below title */}
                    <div className="flex items-center justify-center gap-2 text-xs mb-2" style={{ color: colorScheme?.text || '#000000' }}>
                      <span>{displayData.guests} guests</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{displayData.bedrooms} bedrooms</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{displayData.beds} beds</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{displayData.baths} bath{displayData.baths > 1 ? 's' : ''}</span>
                    </div>
                    
                    {/* Location - After property details */}
                    <p 
                      className="text-xs"
                      style={{ 
                        color: colorScheme?.link || colorScheme?.text || '#000000',
                        textDecoration: 'underline'
                      }}
                    >
                      {displayData.location}
                    </p>
                  </div>

                  {/* Host Section with Reviews Below */}
                  <div className="text-center">
                    {/* Horizontal Layout: Host Info */}
                    <div className="flex items-center justify-center gap-4 mb-2">
                      {/* Host Image */}
                      {config.showHostImage !== false && (
                        <div className="relative">
                          <img
                            src={displayData.hostImage}
                            alt={displayData.hostName}
                            className="rounded-full object-cover"
                            style={{
                              width: '48px',
                              height: '48px',
                              imageRendering: '-webkit-optimize-contrast',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'translateZ(0)',
                              filter: 'none'
                            }}
                            loading="eager"
                            decoding="sync"
                          />
                          {config.showHostVerification !== false && displayData.hostVerified && (
                            <div 
                              className="absolute bg-white rounded-full p-0.5"
                              style={{
                                bottom: '-2px',
                                right: '-2px'
                              }}
                            >
                              <Shield className="w-4 h-4 text-blue-500 fill-current" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Host Info */}
                      <div>
                        <div className="text-sm font-semibold" style={{ color: colorScheme?.text || '#000000' }}>
                          Hosted by {displayData.hostName}
                        </div>
                        <div className="text-xs" style={{ color: colorScheme?.text || '#000000', opacity: 0.7 }}>
                          {displayData.hostYears} years hosting
                        </div>
                      </div>
                    </div>

                    {/* Rating and Reviews - Below Host Info */}
                    {config.showRating !== false && displayData.rating > 0 && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" style={{ color: '#FFB400' }} />
                          <span className="font-semibold text-xs" style={{ color: colorScheme?.text || '#000000' }}>
                            {displayData.rating}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: colorScheme?.text || '#000000', opacity: 0.7 }}>
                          ({displayData.reviewCount} reviews)
                        </span>
                        {config.showSuperhost !== false && displayData.hostSuperhost && (
                          <>
                            <span style={{ color: colorScheme?.text || '#000000', opacity: 0.4 }}>·</span>
                            <div className="flex items-center gap-1">
                              <Medal className="w-3 h-3" style={{ color: '#FF385C' }} />
                              <span className="text-xs" style={{ color: colorScheme?.text || '#000000' }}>Superhost</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Reservation Calendar Widget - Below Card */}
                {config.showReservationWidget !== false && (
                  <div 
                    className="rounded-xl shadow-lg p-4 mb-4"
                    style={{
                      backgroundColor: colorScheme?.cardBackground || '#ffffff',
                      border: `1px solid ${colorScheme?.border || '#e5e7eb'}`,
                      marginTop: '16px'
                    }}
                  >
                    {/* Calendar Header with selected dates */}
                    {checkInDate && checkOutDate ? (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold mb-1" style={{ color: colorScheme?.text || '#000000' }}>
                          {differenceInDays(checkOutDate, checkInDate)} night{differenceInDays(checkOutDate, checkInDate) > 1 ? 's' : ''} in {displayData.location.split(',')[0]}
                        </h3>
                        <p className="text-xs" style={{ color: colorScheme?.text || '#000000', opacity: 0.7 }}>
                          {format(checkInDate, 'MMM d, yyyy')} - {format(checkOutDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold" style={{ color: colorScheme?.text || '#000000' }}>
                          Select dates
                        </h3>
                        <p className="text-xs" style={{ color: colorScheme?.text || '#000000', opacity: 0.7 }}>
                          Add your travel dates for exact pricing
                        </p>
                      </div>
                    )}

                    {/* Calendar View */}
                    <div className="mb-4">
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-3">
                        <button 
                          onClick={() => {
                            const newMonth = new Date(currentCalendarMonth);
                            newMonth.setMonth(newMonth.getMonth() - 1);
                            setCurrentCalendarMonth(newMonth);
                          }}
                          className="p-1"
                        >
                          <ChevronLeft className="w-5 h-5" style={{ color: colorScheme?.text || '#000000' }} />
                        </button>
                        <h4 className="text-sm font-semibold" style={{ color: colorScheme?.text || '#000000' }}>
                          {format(currentCalendarMonth, 'MMMM yyyy')}
                        </h4>
                        <button 
                          onClick={() => {
                            const newMonth = new Date(currentCalendarMonth);
                            newMonth.setMonth(newMonth.getMonth() + 1);
                            setCurrentCalendarMonth(newMonth);
                          }}
                          className="p-1"
                        >
                          <ChevronRight className="w-5 h-5" style={{ color: colorScheme?.text || '#000000' }} />
                        </button>
                      </div>

                      {/* Days of Week */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                          <div key={idx} className="text-center text-xs font-medium py-1" style={{ color: colorScheme?.text || '#000000', opacity: 0.5 }}>
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-1">
                        {(() => {
                          const firstDay = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), 1);
                          const lastDay = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 0);
                          const startPadding = firstDay.getDay();
                          const totalDays = lastDay.getDate();
                          const days = [];

                          // Empty cells for padding
                          for (let i = 0; i < startPadding; i++) {
                            days.push(<div key={`empty-${i}`} />);
                          }

                          // Calendar days
                          for (let day = 1; day <= totalDays; day++) {
                            const date = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), day);
                            const isToday = new Date().toDateString() === date.toDateString();
                            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                            const isCheckIn = checkInDate?.toDateString() === date.toDateString();
                            const isCheckOut = checkOutDate?.toDateString() === date.toDateString();
                            const isInRange = checkInDate && checkOutDate && date > checkInDate && date < checkOutDate;
                            const isSelected = isCheckIn || isCheckOut;

                            days.push(
                              <button
                                key={day}
                                onClick={() => {
                                  if (isPast) return;
                                  
                                  if (!checkInDate || (checkInDate && checkOutDate)) {
                                    // Start new selection
                                    setCheckInDate(date);
                                    setCheckOutDate(null);
                                  } else if (date > checkInDate) {
                                    // Complete selection
                                    setCheckOutDate(date);
                                  } else {
                                    // Reset if selecting before check-in
                                    setCheckInDate(date);
                                    setCheckOutDate(null);
                                  }
                                }}
                                disabled={isPast}
                                className={`
                                  h-9 rounded-full text-sm font-medium transition-all
                                  ${isPast ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}
                                  ${isSelected ? 'bg-black text-white' : ''}
                                  ${isInRange ? 'bg-gray-200' : ''}
                                  ${isToday && !isSelected ? 'font-bold' : ''}
                                `}
                                style={{
                                  color: isSelected ? '#ffffff' : (isPast ? colorScheme?.text : colorScheme?.text || '#000000'),
                                  backgroundColor: isSelected ? '#000000' : (isInRange ? '#f3f4f6' : 'transparent')
                                }}
                              >
                                {day}
                              </button>
                            );
                          }

                          return days;
                        })()}
                      </div>
                    </div>

                    {/* Clear Dates Button */}
                    {(checkInDate || checkOutDate) && (
                      <button
                        onClick={() => {
                          setCheckInDate(null);
                          setCheckOutDate(null);
                        }}
                        className="text-sm font-medium underline mb-4"
                        style={{ color: colorScheme?.text || '#000000' }}
                      >
                        Clear dates
                      </button>
                    )}

                    {/* Price Display and Reserve Button */}
                    {checkInDate && checkOutDate && (
                      <div className="border-t pt-4" style={{ borderColor: colorScheme?.border || '#e5e7eb' }}>
                        {/* Price Breakdown */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                          <span style={{ color: colorScheme?.text || '#000000' }}>
                            {formatPriceDisplay(pricePerNight)} x {totalNights} nights
                          </span>
                            <span style={{ color: colorScheme?.text || '#000000' }}>
                              {formatPriceDisplay(pricePerNight * totalNights)}
                            </span>
                          </div>
                          {cleaningFee > 0 && (
                            <div className="flex justify-between text-sm">
                              <span style={{ color: colorScheme?.text || '#000000' }}>Cleaning fee</span>
                              <span style={{ color: colorScheme?.text || '#000000' }}>
                                {formatPriceDisplay(cleaningFee)}
                              </span>
                            </div>
                          )}
                          {serviceFee > 0 && (
                            <div className="flex justify-between text-sm">
                              <span style={{ color: colorScheme?.text || '#000000' }}>Service fee</span>
                              <span style={{ color: colorScheme?.text || '#000000' }}>
                                {formatPriceDisplay(serviceFee)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold pt-2 border-t" style={{ borderColor: colorScheme?.border || '#e5e7eb' }}>
                            <span style={{ color: colorScheme?.text || '#000000' }}>Total</span>
                            <span style={{ color: colorScheme?.text || '#000000' }}>
                              {formatPriceDisplay(totalBeforeTaxes)}
                            </span>
                          </div>
                        </div>

                        {/* Reserve Button */}
                        <button
                          onClick={handleReserve}
                          className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                          style={{
                            backgroundColor: colorScheme?.solidButton || '#FF385C',
                            color: colorScheme?.solidButtonText || '#ffffff'
                          }}
                        >
                          {config.reserveButtonText || 'Reserve'}
                        </button>
                        
                        <p className="text-center text-xs mt-2" style={{ color: colorScheme?.text || '#000000', opacity: 0.6 }}>
                          You won't be charged yet
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>) : (
                /* Desktop: Original Layout */
                <>
                  {/* Title and actions row */}
                  <div className={`flex ${config.alignment === 'center' ? 'flex-col items-center' : config.alignment === 'right' ? 'flex-row-reverse' : ''} justify-between items-start mb-4`}>
                    <div className={getAlignment()}>
                      <h1 
                        className="text-2xl md:text-3xl font-semibold mb-2"
                        style={{ 
                          fontSize: fontSizes.title,
                          color: colorScheme?.text || '#000000'
                        }}
                      >
                        {displayData.title}
                      </h1>
                      
                      <div 
                        className={`flex ${config.alignment === 'center' ? 'justify-center' : ''} items-center gap-2 text-sm`}
                        style={{ fontSize: fontSizes.subtitle }}
                      >
                        {config.showRating !== false && displayData.rating > 0 && (
                          <>
                            <Star className="w-4 h-4 fill-current" style={{ color: colorScheme?.text || '#000000' }} />
                            <span className="font-semibold" style={{ color: colorScheme?.text || '#000000' }}>{displayData.rating}</span>
                            <span style={{ color: colorScheme?.text || '#000000', opacity: 0.7 }}>
                              ({displayData.reviewCount} reviews)
                            </span>
                            <span style={{ color: colorScheme?.text || '#000000', opacity: 0.4 }}>·</span>
                          </>
                        )}
                        {config.showSuperhost !== false && displayData.hostSuperhost && (
                          <>
                            <Medal className="w-4 h-4" style={{ color: colorScheme?.text || '#000000' }} />
                            <span style={{ color: colorScheme?.text || '#000000', opacity: 0.7 }}>Superhost</span>
                            <span style={{ color: colorScheme?.text || '#000000', opacity: 0.4 }}>·</span>
                          </>
                        )}
                        <span style={{ color: colorScheme?.link || colorScheme?.text || '#000000', textDecoration: 'underline' }}>
                          {displayData.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Property info */}
                  <div 
                    className={`flex ${config.alignment === 'center' ? 'justify-center' : ''} items-center gap-2 text-base mb-6`}
                    style={{ fontSize: fontSizes.details }}
                  >
                    <span style={{ color: colorScheme?.text || '#000000' }}>{displayData.guests} guests</span>
                    <span style={{ color: colorScheme?.text || '#000000', opacity: 0.4 }}>·</span>
                    <span style={{ color: colorScheme?.text || '#000000' }}>{displayData.bedrooms} bedrooms</span>
                    <span style={{ color: colorScheme?.text || '#000000', opacity: 0.4 }}>·</span>
                    <span style={{ color: colorScheme?.text || '#000000' }}>{displayData.beds} beds</span>
                    <span style={{ color: colorScheme?.text || '#000000', opacity: 0.4 }}>·</span>
                    <span style={{ color: colorScheme?.text || '#000000' }}>{displayData.baths} bath{displayData.baths > 1 ? 's' : ''}</span>
                  </div>

                  {/* Host info */}
                  <div 
                    className={`flex ${config.alignment === 'center' ? 'justify-center' : ''} items-center gap-4 py-6 border-t border-b`}
                    style={{ borderColor: colorScheme?.border || '#e5e7eb' }}
                  >
                    {config.showHostImage !== false && (
                      <div className="relative">
                        <img
                          src={displayData.hostImage}
                          alt={displayData.hostName}
                          className="rounded-full object-cover"
                          style={{
                            width: `${hostImageSize}px`,
                            height: `${hostImageSize}px`,
                            imageRendering: '-webkit-optimize-contrast',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'translateZ(0)',
                            filter: 'none'
                          }}
                          loading="eager"
                          decoding="sync"
                        />
                        {config.showHostVerification !== false && displayData.hostVerified && (
                          <div 
                            className="absolute bg-white rounded-full p-0.5"
                            style={{
                              bottom: '-4px',
                              right: '-4px'
                            }}
                          >
                            <Shield className="w-4 h-4 text-blue-500 fill-current" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className={getAlignment()}>
                      <div className="font-semibold text-base" style={{ color: colorScheme?.text || '#000000' }}>
                        Hosted by {displayData.hostName}
                      </div>
                      <div className="text-sm" style={{ color: colorScheme?.text || '#000000', opacity: 0.7 }}>
                        {displayData.hostYears} years hosting
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Room Highlights - Below host info */}
              {config.showHighlights !== false && (
                <div className="py-6 border-b" style={{ borderColor: colorScheme?.border || '#e5e7eb' }}>
                  {(() => {
                    const getIcon = (iconName: string) => {
                      // Map icon names to Lucide icon components
                      const iconMap: { [key: string]: any } = {
                        'map-pin': Icons.MapPin,
                        'MapPin': Icons.MapPin,
                        'key': Icons.Key,
                        'Key': Icons.Key,
                        'wifi': Icons.Wifi,
                        'Wifi': Icons.Wifi,
                        'sparkles': Icons.Sparkles,
                        'Sparkles': Icons.Sparkles,
                        'shield': Icons.Shield,
                        'Shield': Icons.Shield,
                        'home': Icons.Home,
                        'Home': Icons.Home,
                        'clock': Icons.Clock,
                        'Clock': Icons.Clock,
                        'user': Icons.User,
                        'User': Icons.User,
                        'star': Icons.Star,
                        'Star': Icons.Star,
                        'building': Icons.Building,
                        'Building': Icons.Building,
                        'truck': Icons.Truck,
                        'Truck': Icons.Truck,
                        'car': Icons.Car,
                        'Car': Icons.Car,
                        'DoorOpen': Icons.DoorOpen,
                        'Award': Icons.Award
                      };
                      
                      const IconComponent = iconMap[iconName] || Icons[iconName as keyof typeof Icons];
                      return IconComponent ? <IconComponent className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />;
                    };

                    // Try to get highlights from room data first
                    let roomHighlights = [];
                    if (roomData?.highlights) {
                      try {
                        const parsedHighlights = typeof roomData.highlights === 'string' 
                          ? JSON.parse(roomData.highlights) 
                          : roomData.highlights;
                        
                        // Filter only active highlights and sort by displayOrder
                        roomHighlights = Array.isArray(parsedHighlights) 
                          ? parsedHighlights
                              .filter((h: any) => h.isActive !== false)
                              .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))
                          : [];
                      } catch (e) {
                        console.error('Error parsing room highlights:', e);
                      }
                    }

                    // Default highlights if none provided from room or config
                    const defaultHighlights = [
                      {
                        id: 'great-location',
                        icon: 'MapPin',
                        title: 'Great location',
                        description: '90% of recent guests gave the location a 5-star rating.'
                      },
                      {
                        id: 'self-checkin',
                        icon: 'Key',
                        title: 'Self check-in',
                        description: 'Check yourself in with the keypad.'
                      },
                      {
                        id: 'superhost',
                        icon: 'Award',
                        title: `${displayData.hostName} is a Superhost`,
                        description: 'Superhosts are experienced, highly rated hosts.'
                      }
                    ];

                    // Priority: Room highlights > Config highlights > Default highlights
                    const displayHighlights = roomHighlights.length > 0 
                      ? roomHighlights
                      : (config.highlights && config.highlights.length > 0 
                        ? config.highlights 
                        : defaultHighlights);

                    return (
                      <div className="space-y-4">
                        {displayHighlights.slice(0, 3).map((highlight) => (
                          <div key={highlight.id} className="flex gap-4">
                            <div className="flex-shrink-0" style={{ color: colorScheme?.text || '#000000' }}>
                              {getIcon(highlight.icon)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-base mb-1" style={{ color: colorScheme?.text || '#000000' }}>
                                {highlight.title}
                              </h3>
                              <p className="text-sm" style={{ color: colorScheme?.text || '#000000', opacity: 0.7 }}>
                                {highlight.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Right column - Reservation Widget */}
            {config.showReservationWidget !== false && !isMobile && (
              <div className="w-[370px] flex-shrink-0 h-fit">
                <div 
                  className="sticky top-20 rounded-xl shadow-xl p-6"
                  style={{
                    backgroundColor: colorScheme?.cardBackground || '#ffffff',
                    border: `1px solid ${colorScheme?.border || '#e5e7eb'}`,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)'
                  }}
                >
                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-semibold" style={{ color: colorScheme?.text || '#000000' }}>
                        {formatPriceDisplay(totalNights > 0 ? totalBeforeTaxes : pricePerNight)}
                      </span>
                      <span className="text-sm" style={{ color: colorScheme?.text || '#000000', opacity: 0.7 }}>
                        {totalNights > 0 ? `for ${totalNights} night${totalNights > 1 ? 's' : ''}` : 'per night'}
                      </span>
                    </div>
                  </div>

                  {/* Date inputs */}
                  <div className="grid grid-cols-2 gap-0">
                    <div 
                      className="p-3 border rounded-tl-lg cursor-pointer hover:bg-gray-50 transition"
                      style={{ borderColor: colorScheme?.border || '#b0b0b0' }}
                      onClick={() => {
                        if (roomData?.id) {
                          setShowCalendar(true);
                        } else {
                          console.warn('Cannot open calendar: Room data not loaded yet');
                        }
                      }}
                    >
                      <label className="text-[10px] font-semibold uppercase block" style={{ color: colorScheme?.text || '#000000' }}>
                        CHECK-IN
                      </label>
                      <div className="text-sm mt-1" style={{ color: colorScheme?.text || '#000000' }}>
                        {checkInDate ? format(checkInDate, 'M/d/yyyy') : 'Add date'}
                      </div>
                    </div>
                    <div 
                      className="p-3 border border-l-0 rounded-tr-lg cursor-pointer hover:bg-gray-50 transition"
                      style={{ borderColor: colorScheme?.border || '#b0b0b0' }}
                      onClick={() => {
                        if (roomData?.id) {
                          setShowCalendar(true);
                        } else {
                          console.warn('Cannot open calendar: Room data not loaded yet');
                        }
                      }}
                    >
                      <label className="text-[10px] font-semibold uppercase block" style={{ color: colorScheme?.text || '#000000' }}>
                        CHECKOUT
                      </label>
                      <div className="text-sm mt-1" style={{ color: colorScheme?.text || '#000000' }}>
                        {checkOutDate ? format(checkOutDate, 'M/d/yyyy') : 'Add date'}
                      </div>
                    </div>
                  </div>

                  {/* Guests selector */}
                  <div className="relative guests-dropdown-container">
                    <div 
                      className="p-3 border border-t-0 rounded-b-lg mb-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                      style={{ borderColor: colorScheme?.border || '#b0b0b0' }}
                      onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                    >
                      <div>
                        <label className="text-[10px] font-semibold uppercase block" style={{ color: colorScheme?.text || '#000000' }}>
                          GUESTS
                        </label>
                        <span className="text-sm mt-1 block" style={{ color: colorScheme?.text || '#000000' }}>
                          {guests} guest{guests > 1 ? 's' : ''}
                        </span>
                      </div>
                      <ChevronDown className="w-5 h-5" style={{ color: colorScheme?.text || '#000000' }} />
                    </div>

                    {/* Guests dropdown */}
                    {showGuestsDropdown && (
                      <div 
                        className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border p-4 z-10"
                        style={{ borderColor: colorScheme?.border || '#e5e7eb' }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Guests</span>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGuestChange(guests - 1);
                              }}
                              disabled={guests <= 1}
                              className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ borderColor: colorScheme?.border || '#e5e7eb' }}
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{guests}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGuestChange(guests + 1);
                              }}
                              disabled={guests >= (roomData?.maxOccupancy || 4)}
                              className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ borderColor: colorScheme?.border || '#e5e7eb' }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          Maximum {roomData?.maxOccupancy || 4} guests
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reserve button */}
                  <button 
                    onClick={handleReserve}
                    disabled={!checkInDate || !checkOutDate}
                    className="w-full py-3 px-6 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: colorScheme?.solidButton || '#FF385C',
                      color: colorScheme?.solidButtonText || '#ffffff',
                      fontSize: '16px'
                    }}
                  >
                    {config.reserveButtonText || 'Reserve'}
                  </button>

                  {/* Won't be charged message */}
                  <p className="text-center text-sm mt-2 mb-4" style={{ color: colorScheme?.text || '#000000', opacity: 0.7 }}>
                    You won't be charged yet
                  </p>

                  {/* Price breakdown */}
                  <div className="space-y-3 pt-4 border-t" style={{ borderColor: colorScheme?.border || '#e5e7eb' }}>
                    <button 
                      onClick={() => setShowPriceDetails(!showPriceDetails)}
                      className="w-full flex items-center justify-between text-sm hover:underline"
                      style={{ color: colorScheme?.text || '#000000' }}
                    >
                      <span>{formatPriceDisplay(pricePerNight)} x {totalNights} nights</span>
                      <span>{formatPriceDisplay(pricePerNight * totalNights)}</span>
                    </button>
                    
                    {showPriceDetails && (
                      <>
                        <div className="flex items-center justify-between text-sm" style={{ color: colorScheme?.text || '#000000' }}>
                          <span className="underline cursor-pointer">Cleaning fee</span>
                          <span>{formatPriceDisplay(cleaningFee)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm" style={{ color: colorScheme?.text || '#000000' }}>
                          <span className="underline cursor-pointer">Service fee</span>
                          <span>{formatPriceDisplay(serviceFee)}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="pt-3 border-t flex items-center justify-between font-semibold" style={{ borderColor: colorScheme?.border || '#e5e7eb' }}>
                      <span style={{ color: colorScheme?.text || '#000000' }}>Total before taxes</span>
                      <span style={{ color: colorScheme?.text || '#000000' }}>{formatPriceDisplay(totalBeforeTaxes)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Reservation Calendar Modal */}
      <ReservationCalendar
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onDatesSelect={handleDatesSelect}
        roomId={roomData?.id}
        pricePerNight={pricePerNight}
        minStay={roomData?.minStay || 1}  // Changed default from 2 to 1
        maxStay={roomData?.maxStay || 30}
        colorScheme={colorScheme}
        currency={companyCurrency}
      />
    </div>
  );
}