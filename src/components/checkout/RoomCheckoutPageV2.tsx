'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ChevronDown, Lock, CreditCard, Info, User, MapPin, Calendar, Users, Star, Shield, CheckCircle, Eye, EyeOff, Mail, Phone, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import ErrorModal from '@/components/ui/ErrorModal';
import CountrySelect from './CountrySelect';
import PhoneCountryCodeSelect, { getDialCodeForCountry } from './PhoneCountryCodeSelect';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CompanyConfig {
  name?: string;
  logo?: string | null;
  logoSize?: number;
  primaryColor?: string;
  secondaryColor?: string;
  currency?: string;
}

interface CheckoutSettings {
  contactMethod?: 'phone' | 'email';
  fullNameOption?: 'firstAndLast' | 'lastOnly';
  companyNameField?: 'hidden' | 'optional' | 'required';
  addressLine2Field?: 'hidden' | 'optional' | 'required';
  phoneNumberField?: 'hidden' | 'optional' | 'required';
  allowGuestCheckout?: boolean;
  requireShippingAddress?: boolean;
  requireBillingAddress?: boolean;
  checkoutLogoUrl?: string | null;
  checkoutLogoAlignment?: 'left' | 'center' | 'right';
  checkoutLogoWidthPx?: number | null;
  checkoutPayButtonColor?: string | null;
  checkoutPayButtonTextColor?: string | null;
}

interface ReservationPayload {
  roomId: number;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  pricePerNight: number;
  fees?: { label: string; amount: number }[];
  currency?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  isSuperhost?: boolean;
  hostName?: string;
  location?: string;
}

type TaxDocumentType = 'consumidor_final' | 'credito_fiscal' | 'regimen_especial' | 'gubernamental';

export default function RoomCheckoutPageV2() {
  const router = useRouter();
  const { selectedCurrency, convertPrice, formatPrice: formatCurrencyPrice, baseCurrency } = useCurrency();
  const [company, setCompany] = useState<CompanyConfig | null>(null);
  const [reservation, setReservation] = useState<ReservationPayload | null>(null);
  const [checkoutSettings, setCheckoutSettings] = useState<CheckoutSettings | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Helper function to format currency with conversion
  const formatCurrency = (value: number, _currency?: string) => {
    // Prices are stored in store currency, convert to selected currency
    const convertedValue = convertPrice(value, undefined, selectedCurrency);
    return formatCurrencyPrice(convertedValue, selectedCurrency);
  };
  
  // Form States
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('SV'); // ISO country code
  const [companyName, setCompanyName] = useState('');
  
  // Address fields
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  // Contact address fields (separate from billing)
  const [contactAddress, setContactAddress] = useState('');
  const [contactApartment, setContactApartment] = useState('');
  const [contactCity, setContactCity] = useState('');
  const [contactState, setContactState] = useState('');
  const [contactPostalCode, setContactPostalCode] = useState('');
  
  // Account creation
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  
  // Payment form
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [cardName, setCardName] = useState('');
  
  // Tax document type
  const [taxDocumentType, setTaxDocumentType] = useState<TaxDocumentType>('consumidor_final');
  const [taxId, setTaxId] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [showDiscount, setShowDiscount] = useState(false);
  const [billingDifferent, setBillingDifferent] = useState(false);
  
  // Special requests
  const [specialRequests, setSpecialRequests] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [showSpecial, setShowSpecial] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessages, setModalMessages] = useState<string[]>([]);

  useEffect(() => {
    loadCompanyAndSettings();
    loadReservation();
  }, []);

  // Auto-set dial code from selected country
  useEffect(() => {
    if (country) {
      setPhoneCountryCode(getDialCodeForCountry(country));
    }
  }, [country]);

  const loadCompanyAndSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
      const companyId = parseInt(localStorage.getItem('companyId') || '1');
      
      // Load company config
      const companyRes = await fetch(`${apiUrl}/company/${companyId}/public`);
      if (companyRes.ok) {
        const data = await companyRes.json();
        // Build absolute logo URL for checkout header preview
        let logoUrl: string | undefined = data?.logo;
        if (logoUrl) {
          if (logoUrl.startsWith('http')) {
            // keep as-is
          } else if (logoUrl.startsWith('/')) {
            logoUrl = `${(apiUrl as string).replace('/api','')}${logoUrl}`;
          } else {
            logoUrl = `${(apiUrl as string).replace('/api','')}/uploads/${logoUrl}`;
          }
        }
        setCompany({
          name: data?.name,
          logo: logoUrl,
          logoSize: data?.logoSize,
          primaryColor: data?.primaryColor || '#22c55e',
          secondaryColor: data?.secondaryColor,
          currency: data?.currency || data?.storeCurrency || 'USD',
        });
      }

      // Load checkout settings
      const settingsRes = await fetch(`${apiUrl}/checkout/checkout-settings`);
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        // Normalize checkout logo URL to absolute so it renders correctly in Next.js
        let normalizedLogoUrl = settings.checkoutLogoUrl as string | null;
        if (normalizedLogoUrl) {
          if (normalizedLogoUrl.startsWith('http')) {
            // keep as-is
          } else if (normalizedLogoUrl.startsWith('/')) {
            normalizedLogoUrl = `${(apiUrl as string).replace('/api','')}${normalizedLogoUrl}`;
          } else {
            normalizedLogoUrl = `${(apiUrl as string).replace('/api','')}/uploads/${normalizedLogoUrl}`;
          }
        }
        setCheckoutSettings({ ...settings, checkoutLogoUrl: normalizedLogoUrl });
        
        // If guest checkout is not allowed, default to creating account
        if (!settings.allowGuestCheckout) {
          setCreateAccount(true);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadReservation = () => {
    try {
      const raw = localStorage.getItem('room_checkout_payload');
      if (raw) {
        const parsed = JSON.parse(raw);
        setReservation(parsed);
        return;
      }
      
      // Fallback to sessionStorage
      const legacy = sessionStorage.getItem('roomReservation');
      if (legacy) {
        const l = JSON.parse(legacy);
        setReservation({
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
          currency: l.currency || 'USD',
          imageUrl: l.imageUrl,
        });
      }
    } catch (error) {
      console.error('Error loading reservation:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Contact method validation
    if (checkoutSettings?.contactMethod === 'email' || !checkoutSettings) {
      if (!email) newErrors.email = 'Email es requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido';
    }
    
    if (checkoutSettings?.contactMethod === 'phone') {
      if (!phoneNumber) newErrors.phoneNumber = 'Teléfono es requerido';
    } else if (checkoutSettings?.phoneNumberField === 'required') {
      if (!phoneNumber) newErrors.phoneNumber = 'Teléfono es requerido';
    }
    
    // Name validation
    if (checkoutSettings?.fullNameOption === 'firstAndLast' || !checkoutSettings) {
      if (!firstName) newErrors.firstName = 'Nombre es requerido';
    }
    if (!lastName) newErrors.lastName = 'Apellido es requerido';
    
    // Country is always required
    if (!country) newErrors.country = 'País es requerido';
    
    // Company name validation
    if (checkoutSettings?.companyNameField === 'required' && !companyName) {
      newErrors.companyName = 'Nombre de empresa es requerido';
    }
    
    // Billing address validation: ONLY when user marked different billing address
    if (billingDifferent) {
      if (!address) newErrors.address = 'Dirección de facturación es requerida';
      if (!city) newErrors.city = 'Ciudad de facturación es requerida';
      if (!state) newErrors.state = 'Estado/Provincia de facturación es requerido';
      if (!postalCode) newErrors.postalCode = 'Código postal de facturación es requerido';
    }
    
    // Account creation validation
    if (createAccount) {
      if (!password) newErrors.password = 'Contraseña es requerida';
      else if (password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    // Payment validation
    if (!cardNumber) newErrors.cardNumber = 'Número de tarjeta es requerido';
    if (!expiryDate) newErrors.expiryDate = 'Fecha de vencimiento es requerida';
    if (!securityCode) newErrors.securityCode = 'CVV es requerido';
    if (!cardName) newErrors.cardName = 'Nombre del titular es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmAndPay = async () => {
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }
    
    if (!reservation) {
      toast.error('No se encontró información de la reservación');
      return;
    }
    
    setLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
      const companyId = parseInt(localStorage.getItem('companyId') || '1');
      
      // Log reservation data for debugging
      console.log('=== CHECKOUT DATA DEBUG ===');
      console.log('Reservation object:', reservation);
      console.log('CheckIn raw:', reservation.checkIn);
      console.log('CheckOut raw:', reservation.checkOut);
      console.log('CheckIn ISO:', new Date(reservation.checkIn).toISOString());
      console.log('CheckOut ISO:', new Date(reservation.checkOut).toISOString());
      console.log('RoomId:', reservation.roomId);
      console.log('Guests:', reservation.guests);
      console.log('Total Amount:', calculateTotal());
      console.log('===========================');

      const payload = {
        // Customer Information
        email,
        firstName,
        lastName: lastName || firstName, // Use firstName as fallback if lastOnly
        phone: `${phoneCountryCode} ${formatPhoneForPayload(phoneNumber)}`.trim(),
        // Map ISO to display country name for backend storage
        country: ((): string => {
          try {
            // lightweight mapping using the options from CountrySelect
            const map: Record<string, string> = {
              SV: 'El Salvador', US: 'Estados Unidos', DO: 'República Dominicana', PR: 'Puerto Rico',
              GT: 'Guatemala', HN: 'Honduras', NI: 'Nicaragua', CR: 'Costa Rica', PA: 'Panamá', MX: 'México',
              CO: 'Colombia', PE: 'Perú', CL: 'Chile', AR: 'Argentina', ES: 'España', CA: 'Canadá', BZ: 'Belice',
              CU: 'Cuba', JM: 'Jamaica', HT: 'Haití', TT: 'Trinidad y Tobago', BB: 'Barbados', EC: 'Ecuador',
              GY: 'Guyana', PY: 'Paraguay', SR: 'Surinam', UY: 'Uruguay', VE: 'Venezuela', PT: 'Portugal',
              FR: 'Francia', IT: 'Italia', DE: 'Alemania', GB: 'Reino Unido', NL: 'Países Bajos', BE: 'Bélgica',
              CH: 'Suiza', AT: 'Austria', PL: 'Polonia', GR: 'Grecia', SE: 'Suecia', NO: 'Noruega', DK: 'Dinamarca',
              FI: 'Finlandia', IE: 'Irlanda'
            };
            return map[country] || country;
          } catch { return country; }
        })(),
        companyName: companyName || undefined,
        
        // Account Creation
        createAccount,
        password: createAccount ? password : undefined,
        subscribeToNewsletter: subscribeNewsletter,
        
        // Address data
        // Billing section (used only when different billing is selected)
        address: billingDifferent ? (address || undefined) : undefined,
        city: billingDifferent ? (city || undefined) : undefined,
        state: billingDifferent ? (state || undefined) : undefined,
        postalCode: billingDifferent ? (postalCode || undefined) : undefined,
        apartment: billingDifferent ? (apartment || undefined) : undefined,
        // Contact address always sent via dedicated fields
        billingDifferent,
        contactAddress: contactAddress || undefined,
        contactApartment: contactApartment || undefined,
        contactCity: contactCity || undefined,
        contactState: contactState || undefined,
        contactPostalCode: contactPostalCode || undefined,
        
        // Tax Document
        taxDocumentType,
        taxId: taxId || undefined,
        
        // Reservation Details
        roomId: reservation.roomId,
        checkInDate: new Date(reservation.checkIn).toISOString(),  // Convert to ISO 8601 format for PostgreSQL
        checkOutDate: new Date(reservation.checkOut).toISOString(),  // Convert to ISO 8601 format for PostgreSQL
        numberOfGuests: reservation.guests,
        specialRequests: specialRequests || undefined,
        arrivalTime: arrivalTime || undefined,
        
        // Pricing
        roomRate: reservation.pricePerNight,
        totalAmount: calculateTotal(),
        cleaningFee: reservation.fees?.find(f => f.label.toLowerCase().includes('cleaning'))?.amount,
        serviceFee: reservation.fees?.find(f => f.label.toLowerCase().includes('service'))?.amount,
        currency: reservation.currency || company?.currency || 'USD',
        
        // Payment Information
        paymentMethod: 'credit_card',
        cardNumber: cardNumber.replace(/\s/g, ''),  // Remove spaces from card number
        expiryDate,
        cvv: securityCode,  // Backend expects camelCase due to JsonNamingPolicy
        cardholderName: cardName,
        
        // Additional
        acceptTermsAndConditions: true,  // Backend expects camelCase due to JsonNamingPolicy
        discountCode: discountCode || undefined,
      };
      
      // Log the complete payload
      console.log('=== COMPLETE PAYLOAD ===');
      console.log(JSON.stringify(payload, null, 2));
      console.log('========================');
      
      const response = await fetch(`${apiUrl}/checkout/process-room-reservation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-Id': companyId.toString(),
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Backend response:', result);

      // Handle automatic 400 responses from [ApiController] (ProblemDetails with errors)
      if (!response.ok) {
        const messages: string[] = [];
        if (result?.errors) {
          try {
            const map = result.errors as Record<string, string[]>;
            Object.values(map).forEach(arr => arr.forEach(m => m && messages.push(m)));
          } catch {
            // ignore
          }
        }
        const fallback = result?.error?.description || result?.message || 'Error al procesar la reservación';
        if (messages.length === 0 && fallback) messages.push(fallback);

        setModalMessages(messages);
        setModalOpen(true);
        return;
      }

      if (result.success) {
        toast.success('¡Reservación confirmada exitosamente!');
        
        // Clear checkout data
        localStorage.removeItem('room_checkout_payload');
        sessionStorage.removeItem('roomReservation');
        // Store confirmation data for receipt page
        try {
          const confirmation = {
            id: result.reservationId,
            confirmationNumber: result.confirmationNumber,
            customerName: `${firstName} ${lastName || ''}`.trim(),
            customerEmail: email,
            customerPhone: `${phoneCountryCode} ${formatPhoneForPayload(phoneNumber)}`.trim(),
            roomName: reservation.roomName,
            roomImage: reservation.imageUrl || undefined,
            checkInDate: new Date(reservation.checkIn).toISOString(),
            checkOutDate: new Date(reservation.checkOut).toISOString(),
            numberOfGuests: reservation.guests,
            totalAmount: calculateTotal(),
            currency: reservation.currency || company?.currency || 'USD',
            status: 'Confirmed',
          };
          localStorage.setItem('reservation_confirmation', JSON.stringify(confirmation));
        } catch {}
        
        // Redirect to confirmation page
        router.push(`/reservation-confirmed?id=${result.reservationId}&confirmation=${result.confirmationNumber}`);
      } else {
        // Log detailed error
        console.error('=== CHECKOUT ERROR DETAILS ===');
        console.error('Response:', result);
        console.error('Error Message:', result.message);
        console.error('Error Description:', result.error?.description);
        console.error('Error Code:', result.error?.code);
        console.error('==============================');
        
        const msg = result.error?.description || result.message || 'Error al procesar la reservación';
        setModalMessages([msg]);
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast.error('Error al procesar la reservación. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    if (!reservation) return 0;
    return reservation.nights * reservation.pricePerNight;
  };

  const calculateFeesTotal = () => {
    if (!reservation?.fees?.length) return 0;
    return reservation.fees.reduce((sum, f) => sum + f.amount, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateFeesTotal();
  };

  const currency = selectedCurrency; // Use selected currency from context
  const primaryColor = checkoutSettings?.checkoutPayButtonColor || company?.primaryColor || '#22c55e';
  const payTextColor = checkoutSettings?.checkoutPayButtonTextColor || '#ffffff';

  // Determine field visibility based on settings
  const showFirstNameField = checkoutSettings?.fullNameOption !== 'lastOnly';
  const showPhoneField = checkoutSettings?.phoneNumberField !== 'hidden';
  const phoneRequired = checkoutSettings?.contactMethod === 'phone' || checkoutSettings?.phoneNumberField === 'required';
  const showCompanyField = checkoutSettings?.companyNameField !== 'hidden';
  const companyRequired = checkoutSettings?.companyNameField === 'required';
  const showApartmentField = checkoutSettings?.addressLine2Field !== 'hidden';
  const allowGuestCheckout = checkoutSettings?.allowGuestCheckout !== false;

  // Phone helpers
  const formatPhoneLive = (val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 15);
    if (d.length <= 7) {
      // 3-4
      return [d.slice(0, 3), d.slice(3, 7)].filter(Boolean).join('-');
    }
    if (d.length === 8) {
      // 4-4 common in LATAM
      return [d.slice(0, 4), d.slice(4, 8)].join('-');
    }
    if (d.length === 9) {
      // 3-3-3
      return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].join('-');
    }
    if (d.length === 10) {
      // 3-3-4 (US style)
      return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].join('-');
    }
    if (d.length >= 11) {
      // 3-4-4
      return [d.slice(0, 3), d.slice(3, 7), d.slice(7, 11)].join('-');
    }
    return d;
  };

  const formatPhoneForPayload = (val: string) => val.replace(/\D/g, '');

  return (
    <div className="bg-gray-50" style={{ minHeight: '100vh' }}>
      <ErrorModal
        open={modalOpen}
        title="No pudimos procesar tu pago"
        messages={modalMessages}
        primaryColor={company?.primaryColor || '#ef4444'}
        onClose={() => setModalOpen(false)}
      />
      {/* Logo Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`flex items-center ${
          checkoutSettings?.checkoutLogoAlignment === 'left' ? 'justify-start' : 
          checkoutSettings?.checkoutLogoAlignment === 'right' ? 'justify-end' : 
          'justify-center'
        }`}>
          {checkoutSettings?.checkoutLogoUrl && (
            <a href="/home" aria-label="Go to home">
              <img
                src={checkoutSettings.checkoutLogoUrl}
                alt={company?.name || 'Company'}
                style={{ height: `${checkoutSettings.checkoutLogoWidthPx || 120}px`, objectFit: 'contain' }}
              />
            </a>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            
            {/* Trip Details */}
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
                        `${new Date(reservation.checkIn).toLocaleDateString('es-ES', { 
                          day: 'numeric', month: 'short' 
                        })} - ${new Date(reservation.checkOut).toLocaleDateString('es-ES', { 
                          day: 'numeric', month: 'short' 
                        })}`
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
              {/* Contact Address */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dirección (contacto)</label>
                  <input
                    type="text"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Calle y número"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Apartamento (opcional)</label>
                  <input
                    type="text"
                    value={contactApartment}
                    onChange={(e) => setContactApartment(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Apto 4B"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={contactCity}
                    onChange={(e) => setContactCity(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="San Salvador"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Estado/Departamento</label>
                  <input
                    type="text"
                    value={contactState}
                    onChange={(e) => setContactState(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="San Salvador"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Código postal</label>
                  <input
                    type="text"
                    value={contactPostalCode}
                    onChange={(e) => setContactPostalCode(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="01101"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Guest Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Información de contacto
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Email - Always show unless contact method is phone only */}
                {(checkoutSettings?.contactMethod !== 'phone' || !checkoutSettings) && (
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                      <Mail className="inline w-3 h-3 mr-1" />
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                        errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                )}
                
                {/* First Name */}
                {showFirstNameField && (
                  <div>
                    <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                        errors.firstName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Juan"
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                )}
                
                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                      errors.lastName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Pérez"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
                
                {/* Phone */}
                {showPhoneField && (
                  <div className="md:col-span-2">
                    <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700 mb-1">
                      <Phone className="inline w-3 h-3 mr-1" />
                      Teléfono {phoneRequired ? '*' : '(opcional)'}
                    </label>
                    <div className="flex gap-2">
                      <PhoneCountryCodeSelect
                        value={phoneCountryCode}
                        onChange={setPhoneCountryCode}
                        error={!!errors.phoneNumber}
                      />
                      <input
                        type="tel"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(formatPhoneLive(e.target.value))}
                        className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                          errors.phoneNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="7777-8888"
                      />
                    </div>
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                  </div>
                )}
                
                {/* Country - ALWAYS VISIBLE AND REQUIRED */}
                <div className="md:col-span-2">
                  <label htmlFor="country" className="block text-xs font-medium text-gray-700 mb-1">
                    <Globe className="inline w-3 h-3 mr-1" />
                    País *
                  </label>
                  <CountrySelect
                    value={country}
                    onChange={setCountry}
                    error={errors.country}
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
                
                {/* Company Name */}
                {showCompanyField && (
                  <div className="md:col-span-2">
                    <label htmlFor="companyName" className="block text-xs font-medium text-gray-700 mb-1">
                      Nombre de empresa {companyRequired ? '*' : '(opcional)'}
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                        errors.companyName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Mi Empresa S.A. de C.V."
                    />
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                  </div>
                )}
              </div>
              
              {/* Billing toggle and fields under Contact */}
              <div className="mt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billingDifferent}
                    onChange={(e) => setBillingDifferent(e.target.checked)}
                    className="mt-1"
                    style={{ accentColor: primaryColor }}
                  />
                  <div>
                    <span className="font-medium text-gray-900">Usar dirección de facturación diferente</span>
                    <p className="text-xs text-gray-600 mt-1">Si está desmarcado, usaremos la dirección de contacto.</p>
                  </div>
                </label>
                {billingDifferent && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">
                        Dirección de facturación *
                      </label>
                      <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                          errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Calle y número"
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                    {showApartmentField && (
                      <div>
                        <label htmlFor="apartment" className="block text-xs font-medium text-gray-700 mb-1">
                          Apartamento, suite, etc. (opcional)
                        </label>
                        <input
                          type="text"
                          id="apartment"
                          value={apartment}
                          onChange={(e) => setApartment(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Apto 4B"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="city" className="block text-xs font-medium text-gray-700 mb-1">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                            errors.city ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="San Salvador"
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1">
                          Estado/Departamento *
                        </label>
                        <input
                          type="text"
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                            errors.state ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="San Salvador"
                        />
                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-xs font-medium text-gray-700 mb-1">
                        Código postal *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                          errors.postalCode ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="01101"
                      />
                      {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Account Creation Option */}
              {allowGuestCheckout && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      className="mt-1"
                      style={{ accentColor: primaryColor }}
                    />
                    <div>
                      <span className="font-medium text-gray-900">Crear una cuenta</span>
                      <p className="text-xs text-gray-600 mt-1">
                        Guarda tu información para reservaciones futuras y accede a tu historial de viajes
                      </p>
                    </div>
                  </label>
                  
                  {createAccount && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                          Contraseña *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                              errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Mínimo 6 caracteres"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                          Confirmar contraseña *
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                            errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="Repite tu contraseña"
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                      </div>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={subscribeNewsletter}
                          onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                          style={{ accentColor: primaryColor }}
                        />
                        <span className="text-sm text-gray-700">
                          Quiero recibir ofertas y promociones por email
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}
              
              {!allowGuestCheckout && (
                <div className="mt-3 text-xs text-gray-500">
                  Se creará una cuenta automáticamente con tu email para que puedas gestionar tu reservación.
                </div>
              )}
            </div>

            {/* Tax Document */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Datos fiscales</h2>
              <div className="space-y-3">
                <div>
                  <label htmlFor="taxDocumentType" className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo de documento
                  </label>
                  <select
                    id="taxDocumentType"
                    value={taxDocumentType}
                    onChange={(e) => setTaxDocumentType(e.target.value as TaxDocumentType)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="consumidor_final">Consumidor Final</option>
                    <option value="credito_fiscal">Crédito Fiscal</option>
                    <option value="regimen_especial">Régimen Especial</option>
                    <option value="gubernamental">Gubernamental</option>
                  </select>
                  {taxDocumentType === 'consumidor_final' && (
                    <p className="text-[11px] text-gray-500 mt-2">
                      Si necesitas factura, selecciona un tipo distinto a Consumidor Final.
                    </p>
                  )}
                </div>
                {/* Tax ID shown only when not consumidor_final */}
                {taxDocumentType !== 'consumidor_final' && (
                  <div>
                        <label htmlFor="taxId" className="block text-xs font-medium text-gray-700 mb-1">
                      # Documento Fiscal
                    </label>
                    <input
                      type="text"
                      id="taxId"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0000-000000-000-0"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Special Requests */}
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
                    <label htmlFor="arrivalTime" className="block text-xs font-medium text-gray-700 mb-1">
                      Hora estimada de llegada
                    </label>
                    <select
                      id="arrivalTime"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona una hora</option>
                      <option value="morning">Mañana (8:00 - 12:00)</option>
                      <option value="afternoon">Tarde (12:00 - 18:00)</option>
                      <option value="evening">Noche (18:00 - 22:00)</option>
                      <option value="late">Muy tarde (después de 22:00)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="specialRequests" className="block text-xs font-medium text-gray-700 mb-1">
                      ¿Algo más que debamos saber?
                    </label>
                    <textarea
                      id="specialRequests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Alergias, preferencias de habitación, celebraciones especiales..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                Información de pago
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="cardNumber" className="block text-xs font-medium text-gray-700 mb-1">
                    Número de tarjeta *
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                      errors.cardNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="expiryDate" className="block text-xs font-medium text-gray-700 mb-1">
                      Vencimiento *
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      value={expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setExpiryDate(value);
                      }}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                        errors.expiryDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="securityCode" className="block text-xs font-medium text-gray-700 mb-1">
                      CVV *
                    </label>
                    <input
                      type="text"
                      id="securityCode"
                      value={securityCode}
                      onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, ''))}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                        errors.securityCode ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="123"
                      maxLength={4}
                    />
                    {errors.securityCode && <p className="text-red-500 text-xs mt-1">{errors.securityCode}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="cardName" className="block text-xs font-medium text-gray-700 mb-1">
                    Nombre en la tarjeta *
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 ${
                      errors.cardName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="JUAN PEREZ"
                  />
                  {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    Tu información de pago está encriptada y segura
                  </span>
                </div>
              </div>
            </div>

            {/* Discount Code */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <button
                onClick={() => setShowDiscount(!showDiscount)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="font-medium text-gray-900">¿Tienes un código de descuento?</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${showDiscount ? 'rotate-180' : ''}`} />
              </button>
              {showDiscount && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu código"
                  />
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    Aplicar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div style={{ position: 'sticky', top: 16 }}>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Room Info */}
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
                    {reservation?.rating && reservation.rating > 0 && (
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {reservation.rating.toFixed(2)}
                          {reservation.reviewCount && ` (${reservation.reviewCount} reseñas)`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trip Details */}
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

              {/* Price Breakdown */}
              <div className="p-6 border-b border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Desglose de precios</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {formatCurrency(reservation?.pricePerNight || 0)} x {reservation?.nights || 0} noches
                    </span>
                    <span className="text-gray-900">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  {reservation?.fees?.map((fee, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-600">{fee.label}</span>
                      <span className="text-gray-900">{formatCurrency(fee.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-medium">
                    <span className="text-gray-900">Total ({currency})</span>
                    <span className="text-gray-900">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
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

              {/* Confirm Button */}
              <div className="p-6">
                <button
                  onClick={handleConfirmAndPay}
                  disabled={loading}
                  className="w-full py-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: primaryColor, 
                    color: payTextColor,
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </span>
                  ) : (
                    'Confirmar y pagar'
                  )}
                </button>
                <div className="text-xs text-gray-600 text-center mt-3">
                  Al seleccionar el botón de arriba, acepto las Condiciones del servicio, 
                  la Política de cancelación y acepto que se me cobre el monto total mostrado.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}