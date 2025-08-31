'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, ChevronDown, Lock, CreditCard, Info, User, MapPin, Calendar, Users, Star, Shield, CheckCircle } from 'lucide-react';

interface CompanyConfig {
  name?: string;
  logo?: string | null;
  logoSize?: number;
  primaryColor?: string;
  secondaryColor?: string;
  currency?: string;
}

interface CheckoutBranding {
  logoUrl?: string | null;
  logoAlignment?: 'left' | 'center' | 'right';
  logoWidthPx?: number | null;
  payButtonColor?: string | null;
  payButtonTextColor?: string | null;
}

interface ReservationPayload {
  roomId: number;
  roomName: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  nights: number;
  guests: number;
  pricePerNight: number;
  fees?: { label: string; amount: number }[];
  currency?: string; // e.g., USD
  imageUrl?: string;
  // Enrichments for UI
  rating?: number;
  reviewCount?: number;
  isSuperhost?: boolean;
  hostName?: string;
  location?: string;
  images?: string[];
}

type TaxDocumentType = 'consumidor_final' | 'credito_fiscal' | 'regimen_especial' | 'gubernamental';

function formatCurrency(value: number, currency: string | undefined) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(value);
  } catch {
    return `${currency || 'USD'} ${value.toFixed(2)}`;
  }
}

export default function RoomCheckoutPage() {
  const [company, setCompany] = useState<CompanyConfig | null>(null);
  const [reservation, setReservation] = useState<ReservationPayload | null>(null);
  const [branding, setBranding] = useState<CheckoutBranding | null>(null);
  
  // Form States
  const [email, setEmail] = useState('');
  const [sendOffers, setSendOffers] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Estados Unidos');
  
  // Payment form
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [cardName, setCardName] = useState('');
  const [useAsBilling, setUseAsBilling] = useState(true);
  
  // Billing address (if different)
  const [billingFirstName, setBillingFirstName] = useState('');
  const [billingLastName, setBillingLastName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingApartment, setBillingApartment] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingPostalCode, setBillingPostalCode] = useState('');
  const [billingCountry, setBillingCountry] = useState('Estados Unidos');
  
  // Tax document type
  const [taxDocumentType, setTaxDocumentType] = useState<TaxDocumentType>('consumidor_final');
  const [discountCode, setDiscountCode] = useState('');
  const [showDiscount, setShowDiscount] = useState(false);
  
  // Special requests
  const [specialRequests, setSpecialRequests] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [showSpecial, setShowSpecial] = useState(false);

  useEffect(() => {
    // Load company config (anonymous endpoint)
    const loadCompany = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
        const companyId = parseInt(localStorage.getItem('companyId') || '1');
        const res = await fetch(`${apiUrl}/company/${companyId}/public`);
        if (res.ok) {
          const data = await res.json();
          setCompany({
            name: data?.name,
            logo: data?.logo,
            logoSize: data?.logoSize,
            primaryColor: data?.primaryColor,
            secondaryColor: data?.secondaryColor,
            currency: data?.currency || data?.storeCurrency || undefined,
          });
        }

        // Checkout settings for branding
        const settingsRes = await fetch(`${apiUrl}/company/checkout-settings`, {
          headers: { 'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '' }
        });
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setBranding({
            logoUrl: s.checkoutLogoUrl,
            logoAlignment: (s.checkoutLogoAlignment || 'center'),
            logoWidthPx: s.checkoutLogoWidthPx,
            payButtonColor: s.checkoutPayButtonColor,
            payButtonTextColor: s.checkoutPayButtonTextColor,
          });
        }
      } catch {}
    };

    // Load reservation payload from localStorage (set by Rooms page on Reserve click)
    const loadReservation = () => {
      try {
        // Primary: localStorage payload created by Reserve button
        const raw = localStorage.getItem('room_checkout_payload');
        if (raw) {
          const parsed = JSON.parse(raw);
          setReservation(parsed);
          return;
        }
        // Secondary: sessionStorage payload (legacy)
        const legacy = sessionStorage.getItem('roomReservation');
        if (legacy) {
          const l = JSON.parse(legacy);
          const mapped: ReservationPayload = {
            roomId: l.roomId || 0,
            roomName: l.roomName || 'Room',
            checkIn: l.checkInDate,
            checkOut: l.checkOutDate,
            nights: l.totalNights || 0,
            guests: l.guests || 1,
            pricePerNight: l.pricePerNight || 0,
            fees: [
              ...(l.cleaningFee ? [{ label: 'Cleaning fee', amount: l.cleaningFee }] : []),
              ...(l.serviceFee ? [{ label: 'Service fee', amount: l.serviceFee }] : []),
            ],
            currency: l.currency,
            imageUrl: l.imageUrl,
          };
          setReservation(mapped);
          return;
        }
        // Fallback: parse from querystring
        const params = new URLSearchParams(window.location.search);
        const roomName = params.get('roomName');
        const checkIn = params.get('checkIn');
        const checkOut = params.get('checkOut');
        const nights = Number(params.get('nights') || '0');
        const guests = Number(params.get('guests') || '1');
        const pricePerNight = Number(params.get('pricePerNight') || '0');
        if (roomName && checkIn && checkOut) {
          setReservation({
            roomId: Number(params.get('roomId') || '0'),
            roomName,
            checkIn,
            checkOut,
            nights,
            guests,
            pricePerNight,
            currency: params.get('currency') || undefined,
            imageUrl: params.get('imageUrl') || undefined,
          });
        }
      } catch {}
    };

    loadCompany();
    loadReservation();
  }, []);

  const currency = reservation?.currency || company?.currency || 'USD';
  const subtotal = useMemo(() => {
    if (!reservation) return 0;
    return reservation.nights * reservation.pricePerNight;
  }, [reservation]);

  const feesTotal = useMemo(() => {
    if (!reservation?.fees?.length) return 0;
    return reservation.fees.reduce((sum, f) => sum + f.amount, 0);
  }, [reservation]);

  const total = subtotal + feesTotal;

  const primaryColor = (branding?.payButtonColor || company?.primaryColor || '#FF385C') as string;
  const payTextColor = (branding?.payButtonTextColor || '#ffffff') as string;

  // Use only checkout branding logo to avoid flicker with company logo
  const headerLogoUrl = branding?.logoUrl || null;
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api').replace(/\/?api\/?$/, '');
  const resolvedHeaderLogoUrl = headerLogoUrl && headerLogoUrl.startsWith('/') ? `${apiBase}${headerLogoUrl}` : headerLogoUrl || undefined;
  const headerLogoWidth = branding?.logoWidthPx || company?.logoSize || 120;
  const headerJustify = branding?.logoAlignment === 'left' ? 'justify-start' : branding?.logoAlignment === 'right' ? 'justify-end' : 'justify-center';

  const taxDocumentOptions = [
    { value: 'consumidor_final', label: 'Consumidor Final' },
    { value: 'credito_fiscal', label: 'Crédito Fiscal' },
    { value: 'regimen_especial', label: 'Régimen Especial' },
    { value: 'gubernamental', label: 'Gubernamental' }
  ];

  return (
    <div className="bg-gray-50" style={{ minHeight: '100vh', height: 'auto' }}>
      {/* Logo only (no site header) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className={`flex items-center ${headerJustify}`}>
          {resolvedHeaderLogoUrl ? (
            <img
              src={resolvedHeaderLogoUrl}
              alt={company?.name || 'Company'}
              style={{ height: (headerLogoWidth) + 'px', objectFit: 'contain' }}
            />
          ) : null}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Your trip section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                Tu viaje
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">Fechas</div>
                    <div className="text-gray-600">
                      {reservation ? (
                        `${new Date(reservation.checkIn).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${new Date(reservation.checkOut).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
                      ) : 'No seleccionado'}
                    </div>
                  </div>

                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">Huéspedes</div>
                    <div className="text-gray-600">{reservation?.guests || 1} huésped{(reservation?.guests || 1) > 1 ? 's' : ''}</div>
                  </div>

                </div>
              </div>
            </div>

            {/* Contact + Guest details compact */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Datos de contacto y huésped
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Correo electrónico"
                  />
                </div>
                <div>
                  <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Apellido"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700 mb-1">Número de teléfono</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className="text-[11px] text-gray-500 mt-2">Usaremos este correo y teléfono para confirmar tu reserva.</div>
            </div>

            {/* Tax Document Type Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Datos fiscales</h2>
              <div className="space-y-3">
                <div>
                  <label htmlFor="taxDocumentType" className="block text-xs font-medium text-gray-700 mb-1">Tipo de documento</label>
                  <select
                    id="taxDocumentType"
                    value={taxDocumentType}
                    onChange={(e) => setTaxDocumentType(e.target.value as TaxDocumentType)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {taxDocumentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {taxDocumentType === 'consumidor_final' ? (
                    <div className="text-[11px] text-gray-500 mt-2">Si necesitas factura, selecciona un tipo distinto a Consumidor Final.</div>
                  ) : null}
                </div>

                {/* Address section only when needed */}
                {taxDocumentType !== 'consumidor_final' && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
                      <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Calle y número"
                      />
                    </div>
                    <div>
                      <label htmlFor="apartment" className="block text-xs font-medium text-gray-700 mb-1">Apartamento, suite, etc. (opcional)</label>
                      <input
                        type="text"
                        id="apartment"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Apartamento, suite, etc."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="city" className="block text-xs font-medium text-gray-700 mb-1">Ciudad</label>
                        <input
                          type="text"
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Ciudad"
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1">Estado/Provincia</label>
                        <input
                          type="text"
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Estado/Provincia"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="postalCode" className="block text-xs font-medium text-gray-700 mb-1">Código postal</label>
                        <input
                          type="text"
                          id="postalCode"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="12345"
                        />
                      </div>
                      <div>
                        <label htmlFor="country" className="block text-xs font-medium text-gray-700 mb-1">País/Región</label>
                        <select
                          id="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                          <option value="Estados Unidos">Estados Unidos</option>
                          <option value="México">México</option>
                          <option value="España">España</option>
                          <option value="Argentina">Argentina</option>
                          <option value="Colombia">Colombia</option>
                          <option value="Chile">Chile</option>
                          <option value="Perú">Perú</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Special requests section (collapsed by default) */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <button
                onClick={() => setShowSpecial(!showSpecial)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-gray-900">Solicitudes especiales</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${showSpecial ? 'rotate-180' : ''}`} />
              </button>
              {showSpecial && (
                <div className="space-y-3 mt-3">
                  <div>
                    <label htmlFor="arrivalTime" className="block text-xs font-medium text-gray-700 mb-1">Hora estimada de llegada</label>
                    <select
                      id="arrivalTime"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">Selecciona una hora</option>
                      <option value="morning">Mañana (8:00 - 12:00)</option>
                      <option value="afternoon">Tarde (12:00 - 18:00)</option>
                      <option value="evening">Noche (18:00 - 22:00)</option>
                      <option value="late">Muy tarde (después de 22:00)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="specialRequests" className="block text-xs font-medium text-gray-700 mb-1">¿Algo más que el anfitrión deba saber?</label>
                    <textarea
                      id="specialRequests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                      placeholder="Escribe aquí cualquier solicitud especial..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment method section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                Pagar con
              </h2>
              <div className="text-xs text-gray-500 mb-2">Todos los montos en {currency}</div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg">
                  <input
                    type="radio"
                    id="creditCard"
                    name="paymentMethod"
                    defaultChecked
                    className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="creditCard" className="flex-1 flex items-center justify-between">
                    <span className="font-medium">Tarjeta de crédito o débito</span>
                    <div className="flex items-center gap-2">
                      {/* Use text badges to avoid 404s when image assets are missing */}
                      <span className="px-2 py-0.5 rounded border text-[10px] font-semibold text-gray-700 bg-gray-50">VISA</span>
                      <span className="px-2 py-0.5 rounded border text-[10px] font-semibold text-gray-700 bg-gray-50">MC</span>
                      <span className="px-2 py-0.5 rounded border text-[10px] font-semibold text-gray-700 bg-gray-50">AMEX</span>
                    </div>
                  </label>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="cardNumber" className="block text-xs font-medium text-gray-700 mb-1">Número de tarjeta</label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="expiryDate" className="block text-xs font-medium text-gray-700 mb-1">Vencimiento</label>
                      <input
                        type="text"
                        id="expiryDate"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="MM/AA"
                      />
                    </div>
                    <div>
                      <label htmlFor="securityCode" className="block text-xs font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        id="securityCode"
                        value={securityCode}
                        onChange={(e) => setSecurityCode(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="123"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cardName" className="block text-xs font-medium text-gray-700 mb-1">Nombre en la tarjeta</label>
                    <input
                      type="text"
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Nombre completo"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Discount code section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <button
                onClick={() => setShowDiscount(!showDiscount)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="font-medium text-gray-900">¿Tienes un código de descuento?</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${showDiscount ? 'rotate-180' : ''}`} />
              </button>
              {showDiscount && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Ingresa tu código"
                  />
                  <button className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    Aplicar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div style={{ position: 'sticky', top: 16 }}>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Room image and basic info */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex space-x-4">
                  {reservation?.imageUrl && (
                    <img 
                      src={reservation.imageUrl} 
                      alt={reservation.roomName} 
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Habitación privada</div>
                    <h3 className="font-medium text-gray-900 truncate">{reservation?.roomName || 'Room'}</h3>
                    <div className="flex items-center mt-1 gap-2">
                      {typeof reservation?.rating === 'number' && reservation.rating > 0 && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {reservation.rating.toFixed(2)}{reservation.reviewCount ? ` (${reservation.reviewCount} reseñas)` : ''}
                          </span>
                        </div>
                      )}
                      {reservation?.isSuperhost && (
                        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">Superhost</span>
                      )}
                    </div>
                    {reservation?.location && (
                      <div className="text-xs text-gray-500 mt-1 truncate">{reservation.location}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trip details */}
              <div className="p-6 border-b border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Detalles del viaje</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fechas</span>
                    <span className="text-gray-900">
                      {reservation ? (
                        `${new Date(reservation.checkIn).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'short' 
                        })} - ${new Date(reservation.checkOut).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}`
                      ) : 'No seleccionado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Huéspedes</span>
                    <span className="text-gray-900">{reservation?.guests || 1} huésped{(reservation?.guests || 1) > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="p-6 border-b border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Desglose de precios</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {formatCurrency(reservation?.pricePerNight || 0, currency)} x {reservation?.nights || 0} noches
                    </span>
                    <span className="text-gray-900">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  {reservation?.fees?.map((fee, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-600">{fee.label}</span>
                      <span className="text-gray-900">{formatCurrency(fee.amount, currency)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-medium">
                    <span className="text-gray-900">Total ({currency})</span>
                    <span className="text-gray-900">{formatCurrency(total, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Security info */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Tu pago está protegido</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Nunca transfieras dinero ni te comuniques fuera de la plataforma.
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm button */}
              <div className="p-6">
                <button
                  className="w-full py-4 rounded-lg font-medium text-white transition-colors"
                  style={{ backgroundColor: primaryColor, color: payTextColor }}
                  onClick={() => alert('Confirmar reserva (demo)')}
                >
                  Confirmar y pagar
                </button>
                <div className="text-xs text-gray-600 text-center mt-3">
                  Al seleccionar el botón de arriba, acepto las Condiciones del servicio del anfitrión, 
                  las Condiciones del servicio de la plataforma, la Política de cancelación y acepto 
                  que se me cobre el monto total mostrado.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}