'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { countries } from '@/components/ui/CountryFlag';
import { useI18n } from '@/contexts/I18nContext';
import { customerAPI } from '@/lib/api/customers';
import { CustomerDetailDto } from '@/types/customer';
import CustomerOverviewTab from './tabs/CustomerOverviewTab';
import CustomerSecurityTab from './tabs/CustomerSecurityTab';
import CustomerAddressBillingTab from './tabs/CustomerAddressBillingTab';
import CustomerNotificationsTab from './tabs/CustomerNotificationsTab';

interface CustomerDetailProps {
  customerId: string;
}

// Interfaces for form data structure - Exported for use in tab components
export interface OverviewFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
  status: string;
  loyaltyTier: string;
  preferredLanguage: string;
  preferredCurrency: string;
  companyName: string;
  taxId: string;
  country: string;
  avatarUrl: string;
}

export interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isTwoFactorEnabled: boolean;
  recoveryEmail: string;
  securityQuestions: Array<{ question: string; answer: string }>;
  trustedDevices: string[];
  sessionTimeout: number;
}

export interface AddressBillingFormData {
  addresses: Array<{
    id?: number;
    type: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
  paymentMethods: Array<{
    id?: number;
    type: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
  }>;
  billingPreferences: {
    invoiceEmail: string;
    autoCharge: boolean;
    paperlessBilling: boolean;
  };
  // Billing Address fields
  billingAddress?: string;
  billingApartment?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;
}

export interface NotificationsFormData {
  emailNotifications: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
    productReviews: boolean;
    priceAlerts: boolean;
  };
  smsNotifications: {
    orderUpdates: boolean;
    deliveryAlerts: boolean;
    promotions: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
  notificationSchedule: {
    doNotDisturbStart: string;
    doNotDisturbEnd: string;
    timezone: string;
  };
}

interface AllFormData {
  overview: OverviewFormData;
  security: SecurityFormData;
  addressBilling: AddressBillingFormData;
  notifications: NotificationsFormData;
}

export default function CustomerDetail({ customerId }: CustomerDetailProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const isNewCustomer = customerId === 'new';
  // Always in edit mode - no need for separate edit button
  const [isEditing, setIsEditing] = useState(true);
  
  // Centralized form state - persists across tab changes
  const [formData, setFormData] = useState<AllFormData>({
    overview: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phoneNumber: '',
      birthDate: '',
      gender: '',
      status: 'Active',
      loyaltyTier: 'Silver',
      preferredLanguage: 'English',
      preferredCurrency: 'USD',
      companyName: '',
      taxId: '',
      country: '',
      avatarUrl: ''
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      isTwoFactorEnabled: false,
      recoveryEmail: '',
      securityQuestions: [],
      trustedDevices: [],
      sessionTimeout: 30
    },
    addressBilling: {
      addresses: [],
      paymentMethods: [],
      billingPreferences: {
        invoiceEmail: '',
        autoCharge: false,
        paperlessBilling: true
      },
      billingAddress: '',
      billingApartment: '',
      billingCity: '',
      billingState: '',
      billingPostalCode: '',
      billingCountry: ''
    },
    notifications: {
      emailNotifications: {
        orderUpdates: true,
        promotions: false,
        newsletter: false,
        productReviews: true,
        priceAlerts: false
      },
      smsNotifications: {
        orderUpdates: false,
        deliveryAlerts: false,
        promotions: false
      },
      pushNotifications: {
        enabled: false,
        sound: true,
        vibration: true
      },
      notificationSchedule: {
        doNotDisturbStart: '22:00',
        doNotDisturbEnd: '08:00',
        timezone: 'America/Santo_Domingo'
      }
    }
  });

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  useEffect(() => {
    if (customerId === 'new') {
      // Initialize empty customer for creation
      setCustomer({
        id: 0,
        customerId: '',
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phoneNumber: '',
        status: 'Active',
        accountBalance: 0,
        loyaltyPoints: 0,
        loyaltyTier: 'Silver',
        totalOrders: 0,
        totalSpent: 0,
        isTwoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        addresses: [],
        paymentMethods: [],
        notificationPreferences: {},
        devices: [],
        wishlistItems: [],
        coupons: []
        // Note: Don't include 'orders' to avoid rendering issues
      } as CustomerDetailDto);
      setLoading(false);
    } else {
      fetchCustomerDetail();
    }
  }, [customerId]);

  const fetchCustomerDetail = async () => {
    if (customerId === 'new') return;
    
    try {
      setLoading(true);
      const data = await customerAPI.getCustomer(parseInt(customerId));
      setCustomer(data as unknown as CustomerDetailDto);
      
      // Initialize form data with customer data
      setFormData((prev: AllFormData) => ({
        ...prev,
        overview: {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          username: data.username || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || data.phone || '',
          birthDate: data.birthDate || '',
          gender: data.gender || '',
          status: data.status || 'Active',
          loyaltyTier: data.loyaltyTier || 'Silver',
          preferredLanguage: data.preferredLanguage || 'English',
          preferredCurrency: data.preferredCurrency || 'USD',
          companyName: data.companyName || '',
          taxId: data.taxId || '',
          country: data.country || '',
          avatarUrl: data.avatarUrl || data.avatar || ''
        },
        security: {
          ...prev.security,
          isTwoFactorEnabled: data.isTwoFactorEnabled || data.twoFactorEnabled || false,
          recoveryEmail: data.recoveryEmail || data.email || '',
          securityQuestions: data.securityQuestions || [],
          trustedDevices: data.devices?.map(d => d.deviceName) || [],
          sessionTimeout: data.sessionTimeoutMinutes || data.sessionTimeout || 30
        },
        addressBilling: {
          addresses: (() => {
            const all = (data.addresses || []) as any[];
            const isBilling = (a: any) => {
              const t = (a.type || '').toString().toLowerCase();
              const lbl = (a.label || '').toString().toLowerCase();
              // Heurística: considerar billing si type es billing/office o label contiene billing
              return t === 'billing' || t === 'office' || lbl.includes('billing');
            };
            const contact = all.filter(a => !isBilling(a));
            let mapped = contact.map((addr: any) => ({
              id: addr.id,
              type: (addr.type?.toLowerCase() || 'shipping'),
              addressLine1: addr.street || addr.addressLine1 || '',
              addressLine2: addr.apartment || addr.addressLine2 || '',
              city: addr.city || '',
              state: addr.state || '',
              postalCode: addr.postalCode || '',
              country: mapCountryNameToIso(addr.country || ''),
              isDefault: addr.isDefault || false
            }));
            // UX fallback: si no hay dirección de contacto, prellenar con la de facturación para edición
            if (mapped.length === 0) {
              const b = (data.addresses || []).find((a: any) => {
                const t = (a.type || '').toString().toLowerCase();
                const lbl = (a.label || '').toString().toLowerCase();
                return t === 'billing' || t === 'office' || lbl.includes('billing');
              });
              const fallbackStreet = (data as any).billingAddress || b?.street || (b as any)?.addressLine1 || '';
              const fallbackCity = (data as any).billingCity || b?.city || '';
              const fallbackCountry = mapCountryNameToIso((data as any).billingCountry || b?.country || '');
              if (fallbackStreet && fallbackCity && fallbackCountry) {
                mapped = [{
                  id: undefined,
                  type: 'shipping',
                  addressLine1: fallbackStreet,
                  addressLine2: (data as any).billingApartment || b?.apartment || (b as any)?.addressLine2 || '',
                  city: fallbackCity,
                  state: (data as any).billingState || b?.state || '',
                  postalCode: (data as any).billingPostalCode || b?.postalCode || '',
                  country: fallbackCountry,
                  isDefault: true
                }];
              }
            }
            return mapped;
          })(),
          paymentMethods: (data.paymentMethods || []).map((pm: any) => ({
            id: pm.id,
            type: pm.cardType || pm.type || 'Card',
            last4: pm.lastFourDigits || pm.last4Digits || pm.last4 || '',
            expiryMonth: typeof pm.expiryMonth === 'string' ? parseInt(pm.expiryMonth) : (pm.expiryMonth || 0),
            expiryYear: typeof pm.expiryYear === 'string' ? parseInt(pm.expiryYear) : (pm.expiryYear || 0),
            isDefault: pm.isDefault || pm.isPrimary || false
          })),
          billingPreferences: {
            invoiceEmail: data.billingEmail || data.email || '',
            autoCharge: data.autoCharge || false,
            paperlessBilling: data.paperlessBilling !== false
          },
          billingAddress: (() => {
            if ((data as any).billingAddress) return (data as any).billingAddress;
            const b = (data.addresses || []).find((a: any) => {
              const t = (a.type || '').toString().toLowerCase();
              const lbl = (a.label || '').toString().toLowerCase();
              return t === 'billing' || t === 'office' || lbl.includes('billing');
            });
            return b?.street || (b as any)?.addressLine1 || '';
          })(),
          billingApartment: (() => {
            if ((data as any).billingApartment) return (data as any).billingApartment;
            const b = (data.addresses || []).find((a: any) => {
              const t = (a.type || '').toString().toLowerCase();
              const lbl = (a.label || '').toString().toLowerCase();
              return t === 'billing' || t === 'office' || lbl.includes('billing');
            });
            return b?.apartment || (b as any)?.addressLine2 || '';
          })(),
          billingCity: (() => {
            if ((data as any).billingCity) return (data as any).billingCity;
            const b = (data.addresses || []).find((a: any) => {
              const t = (a.type || '').toString().toLowerCase();
              const lbl = (a.label || '').toString().toLowerCase();
              return t === 'billing' || t === 'office' || lbl.includes('billing');
            });
            return b?.city || '';
          })(),
          billingState: (() => {
            if ((data as any).billingState) return (data as any).billingState;
            const b = (data.addresses || []).find((a: any) => {
              const t = (a.type || '').toString().toLowerCase();
              const lbl = (a.label || '').toString().toLowerCase();
              return t === 'billing' || t === 'office' || lbl.includes('billing');
            });
            return b?.state || '';
          })(),
          billingPostalCode: (() => {
            if ((data as any).billingPostalCode) return (data as any).billingPostalCode;
            const b = (data.addresses || []).find((a: any) => {
              const t = (a.type || '').toString().toLowerCase();
              const lbl = (a.label || '').toString().toLowerCase();
              return t === 'billing' || t === 'office' || lbl.includes('billing');
            });
            return b?.postalCode || '';
          })(),
          billingCountry: (() => {
            const name = (data as any).billingCountry || (() => {
              const b = (data.addresses || []).find((a: any) => {
                const t = (a.type || '').toString().toLowerCase();
                const lbl = (a.label || '').toString().toLowerCase();
                return t === 'billing' || t === 'office' || lbl.includes('billing');
              });
              return b?.country || '';
            })();
            return mapCountryNameToIso(name);
          })()
        },
        notifications: {
          emailNotifications: {
            orderUpdates: data.notificationPreferences?.emailOrderUpdates !== false,
            promotions: data.notificationPreferences?.emailPromotions || false,
            newsletter: data.notificationPreferences?.emailNewsletter || false,
            productReviews: data.notificationPreferences?.emailProductReviews !== false,
            priceAlerts: data.notificationPreferences?.emailPriceAlerts || false
          },
          smsNotifications: {
            orderUpdates: data.notificationPreferences?.smsOrderUpdates || false,
            deliveryAlerts: data.notificationPreferences?.smsDeliveryAlerts || false,
            promotions: data.notificationPreferences?.smsPromotions || false
          },
          pushNotifications: {
            enabled: data.notificationPreferences?.pushEnabled || false,
            sound: data.notificationPreferences?.pushSound !== false,
            vibration: data.notificationPreferences?.pushVibration !== false
          },
          notificationSchedule: {
            doNotDisturbStart: data.notificationPreferences?.doNotDisturbStart || '22:00',
            doNotDisturbEnd: data.notificationPreferences?.doNotDisturbEnd || '08:00',
            timezone: data.notificationPreferences?.timezone || 'America/Santo_Domingo'
          }
        }
      }) as unknown as AllFormData);
    } catch (error) {
      console.error('Error fetching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Country mapping helpers
  const mapCountryNameToIso = (input: string): string => {
    if (!input) return '';
    const trimmed = input.trim();
    // 1) If it's already an ISO like 'US'
    const isoDirect = Object.keys(countries).find(
      iso => iso.toLowerCase() === trimmed.toLowerCase()
    );
    if (isoDirect) return isoDirect;

    // 2) Try English names (from countries map)
    const byEnglishName = Object.entries(countries).find(([, c]) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (byEnglishName) return byEnglishName[0];

    // 3) Try common Spanish names → ISO
    const spanishToIso: Record<string, string> = {
      'republica dominicana': 'DO', 'república dominicana': 'DO',
      'estados unidos': 'US', 'eeuu': 'US', 'ee.uu.': 'US',
      'puerto rico': 'PR',
      'el salvador': 'SV',
      'guatemala': 'GT',
      'honduras': 'HN',
      'nicaragua': 'NI',
      'costa rica': 'CR',
      'panama': 'PA', 'panamá': 'PA',
      'mexico': 'MX', 'méxico': 'MX',
      'colombia': 'CO',
      'peru': 'PE', 'perú': 'PE',
      'chile': 'CL',
      'argentina': 'AR',
      'espana': 'ES', 'españa': 'ES',
      'canada': 'CA', 'canadá': 'CA',
      'belice': 'BZ',
      'haiti': 'HT', 'haití': 'HT',
      'trinidad y tobago': 'TT',
      'barbados': 'BB',
      'ecuador': 'EC',
      'guyana': 'GY',
      'paraguay': 'PY',
      'surinam': 'SR', 'surinamés': 'SR',
      'uruguay': 'UY',
      'venezuela': 'VE',
      'portugal': 'PT',
      'francia': 'FR',
      'italia': 'IT',
      'alemania': 'DE',
      'reino unido': 'GB'
    };
    const lower = trimmed.toLowerCase();
    if (spanishToIso[lower]) return spanishToIso[lower];

    // 4) If it looks like a two-letter code, uppercase it
    if (/^[a-z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();

    // 5) Fallback: leave as-is (UI select will allow user to fix)
    return trimmed;
  };
  const mapIsoToCountryName = (iso: string): string => {
    if (!iso) return '';
    const entry = (countries as any)[iso];
    return entry?.name || iso;
  };
  
  // Handler functions for updating form data from child tabs
  const updateOverviewData = (data: Partial<OverviewFormData>) => {
    setFormData(prev => ({
      ...prev,
      overview: { ...prev.overview, ...data }
    }));
  };
  
  const updateSecurityData = (data: Partial<SecurityFormData>) => {
    setFormData(prev => ({
      ...prev,
      security: { ...prev.security, ...data }
    }));
  };
  
  const updateAddressBillingData = (data: Partial<AddressBillingFormData>) => {
    setFormData(prev => ({
      ...prev,
      addressBilling: { ...prev.addressBilling, ...data }
    }));
  };
  
  const updateNotificationsData = (data: Partial<NotificationsFormData>) => {
    setFormData(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...data }
    }));
  };
  
  // Centralized save handler that collects data from all tabs
  const handleSaveAll = async () => {
    try {
      if (isNewCustomer) {
        // For new customers, send all available fields
        const createData: any = {
          firstName: formData.overview.firstName,
          lastName: formData.overview.lastName,
          username: formData.overview.username,
          email: formData.overview.email,
          password: formData.security.newPassword || 'TempPassword123!',
          phone: formData.overview.phoneNumber || undefined,
          country: mapIsoToCountryName(formData.overview.country),
          status: formData.overview.status || 'Active',
          initialBalance: 0,
          initialLoyaltyPoints: 0,
          birthDate: formData.overview.birthDate || undefined,
          gender: formData.overview.gender || undefined,
          preferredLanguage: formData.overview.preferredLanguage || undefined,
          preferredCurrency: formData.overview.preferredCurrency || undefined,
          companyName: formData.overview.companyName || undefined,
          taxId: formData.overview.taxId || undefined,
          loyaltyTier: formData.overview.loyaltyTier || 'Bronze',
          avatar: formData.overview.avatarUrl || undefined
        };
        
        // Remove undefined values
        Object.keys(createData).forEach(key => 
          createData[key] === undefined && delete createData[key]
        );
        
        const newCustomer = await customerAPI.createCustomer(createData);
        console.log('New customer created:', newCustomer);
        
        // Now save the address for the new customer
        const firstAddress = formData.addressBilling.addresses[0];
        console.log('Checking address to save:', firstAddress);
        
        // Check if we have valid address data (at least street, city and country)
        if (firstAddress && 
            firstAddress.addressLine1 && 
            firstAddress.addressLine1.trim() !== '' &&
            firstAddress.city && 
            firstAddress.city.trim() !== '' &&
            firstAddress.country && 
            firstAddress.country.trim() !== '') {
          
          console.log('Valid address found, preparing to save:', firstAddress);
          
          // Map frontend address type to backend expected values
          const getAddressType = (type: string) => {
            switch(type) {
              case 'billing': return 'Office';
              case 'shipping': return 'Home';
              case 'both': return 'Other';
              default: return 'Home';
            }
          };
          
          const addressData = {
            type: getAddressType(firstAddress.type || 'billing'),
            label: firstAddress.type === 'billing' ? 'Billing Address' : 
                   firstAddress.type === 'shipping' ? 'Shipping Address' : 
                   'Main Address',
            street: firstAddress.addressLine1.trim(),
            apartment: firstAddress.addressLine2?.trim() || null,
            city: firstAddress.city.trim(),
            state: firstAddress.state?.trim() || null,
            postalCode: firstAddress.postalCode?.trim() || null,
            country: mapIsoToCountryName(firstAddress.country.trim()),
            isDefault: true
          };
          
          console.log('Address payload to send:', addressData);
          console.log('Customer ID for address:', newCustomer.id);
          
          try {
            const savedAddress = await customerAPI.addAddress(newCustomer.id, addressData);
            console.log('Address saved successfully:', savedAddress);
          } catch (addressError) {
            console.error('Error saving address:', addressError);
            alert('Customer created but address could not be saved. Please add it manually.');
          }
        } else {
          console.log('No valid address to save. Missing required fields:', {
            hasAddress: !!firstAddress,
            addressLine1: firstAddress?.addressLine1 || 'MISSING',
            city: firstAddress?.city || 'MISSING',
            country: firstAddress?.country || 'MISSING',
            fullAddress: firstAddress
          });
        }
        
        // Save billing preferences if email is provided
        if (formData.addressBilling.billingPreferences.invoiceEmail) {
          // Note: This might need a separate API endpoint
          // For now, we'll save it with the customer update
          try {
            await customerAPI.updateCustomer(newCustomer.id, {
              email: formData.overview.email // Using main email for now
            });
          } catch (billingError) {
            console.error('Error saving billing preferences:', billingError);
          }
        }
        
        // Save notification preferences for new customer
        try {
          const notificationData = {
            emailNotifications: formData.notifications.emailNotifications,
            smsNotifications: formData.notifications.smsNotifications,
            pushNotifications: formData.notifications.pushNotifications,
            notificationSchedule: formData.notifications.notificationSchedule
          };
          
          console.log('Saving notification preferences:', notificationData);
          await customerAPI.updateNotificationPreferences(newCustomer.id, notificationData);
          console.log('Notification preferences saved successfully');
        } catch (notifError) {
          console.error('Error saving notification preferences:', notifError);
          // Continue even if notifications fail
        }
        
        // Show success message
        alert(t('common.saveSuccess', 'Customer saved successfully'));
        // Redirect to customers list
        router.push('/dashboard/clientes');
      } else {
        // For updates, send all fields
        const updateData: any = {
          firstName: formData.overview.firstName,
          lastName: formData.overview.lastName,
          username: formData.overview.username,
          email: formData.overview.email,
          phone: formData.overview.phoneNumber || undefined,
          country: mapIsoToCountryName(formData.overview.country),
          status: formData.overview.status,
          avatar: formData.overview.avatarUrl || undefined,
          twoFactorEnabled: formData.security.isTwoFactorEnabled,
          // Don't send twoFactorPhone - it's causing varchar(20) constraint errors
          birthDate: formData.overview.birthDate || undefined,
          gender: formData.overview.gender || undefined,
          preferredLanguage: formData.overview.preferredLanguage || undefined,
          preferredCurrency: formData.overview.preferredCurrency || undefined,
          companyName: formData.overview.companyName || undefined,
          taxId: formData.overview.taxId || undefined,
          loyaltyTier: formData.overview.loyaltyTier || undefined,
          // Billing Address fields
          billingAddress: formData.addressBilling.billingAddress || undefined,
          billingApartment: formData.addressBilling.billingApartment || undefined,
          billingCity: formData.addressBilling.billingCity || undefined,
          billingState: formData.addressBilling.billingState || undefined,
          billingPostalCode: formData.addressBilling.billingPostalCode || undefined,
          billingCountry: formData.addressBilling.billingCountry ? mapIsoToCountryName(formData.addressBilling.billingCountry) : undefined
        };
        
        // Remove undefined values
        Object.keys(updateData).forEach(key => 
          updateData[key] === undefined && delete updateData[key]
        );
        
        console.log('Updating customer with data:', updateData);
        await customerAPI.updateCustomer(customer!.id, updateData);
        
        // Handle address updates
        if (formData.addressBilling.addresses.length > 0 && formData.addressBilling.addresses[0].addressLine1) {
          // Map frontend address type to backend expected values
          const getAddressType = (type: string) => {
            switch(type) {
              case 'billing': return 'Office';
              case 'shipping': return 'Home';
              case 'both': return 'Other';
              default: return 'Home';
            }
          };
          
          const addressData = {
            type: getAddressType(formData.addressBilling.addresses[0].type || 'billing'),
            label: formData.addressBilling.addresses[0].type === 'billing' ? 'Billing Address' : 
                   formData.addressBilling.addresses[0].type === 'shipping' ? 'Shipping Address' : 
                   'Main Address',
            street: formData.addressBilling.addresses[0].addressLine1,
            apartment: formData.addressBilling.addresses[0].addressLine2 || null,
            city: formData.addressBilling.addresses[0].city || '',
            state: formData.addressBilling.addresses[0].state || null,
            postalCode: formData.addressBilling.addresses[0].postalCode || null,
            country: mapIsoToCountryName(formData.addressBilling.addresses[0].country || ''),
            isDefault: formData.addressBilling.addresses[0].isDefault !== false
          };
          
          try {
            console.log('Address data to save:', addressData);
            console.log('Address has ID?', formData.addressBilling.addresses[0].id);
            if (formData.addressBilling.addresses[0].id) {
              // Update existing address
              console.log('Updating existing address');
              await customerAPI.updateAddress(customer!.id, formData.addressBilling.addresses[0].id, addressData);
            } else {
              // Add new address
              console.log('Adding new address');
              await customerAPI.addAddress(customer!.id, addressData);
            }
          } catch (addressError) {
            console.error('Error saving address:', addressError);
            // Continue even if address fails
          }
        }
        
        // Save notification preferences for existing customer
        try {
          const notificationData = {
            emailNotifications: formData.notifications.emailNotifications,
            smsNotifications: formData.notifications.smsNotifications,
            pushNotifications: formData.notifications.pushNotifications,
            notificationSchedule: formData.notifications.notificationSchedule
          };
          
          console.log('Updating notification preferences:', notificationData);
          await customerAPI.updateNotificationPreferences(customer!.id, notificationData);
          console.log('Notification preferences updated successfully');
        } catch (notifError) {
          console.error('Error updating notification preferences:', notifError);
          // Continue even if notifications fail
        }
        
        // Save security settings for existing customer - only if there are changes
        const hasSecurityChanges = 
          formData.security.newPassword || 
          formData.security.isTwoFactorEnabled !== customer?.isTwoFactorEnabled ||
          formData.security.recoveryEmail !== (customer?.recoveryEmail || customer?.email) ||
          formData.security.sessionTimeout !== (customer?.sessionTimeout || 30) ||
          formData.security.securityQuestions.some(q => q.question && q.answer);
        
        if (hasSecurityChanges) {
          console.log('=== STARTING SECURITY SAVE ===');
          console.log('Security form data:', formData.security);
          
          try {
            // Check if password needs to be changed
            if (formData.security.newPassword && formData.security.currentPassword) {
              const passwordData = {
                currentPassword: formData.security.currentPassword,
                newPassword: formData.security.newPassword,
                confirmPassword: formData.security.confirmPassword
              };
              console.log('Calling changePassword with:', passwordData);
              await customerAPI.changePassword(customer!.id, passwordData);
              console.log('Password changed successfully');
              
              // Clear password fields after successful change
              setFormData(prev => ({
                ...prev,
                security: {
                  ...prev.security,
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                }
              }));
            }
            
            // Only update security settings if there are non-password changes
            const hasNonPasswordChanges = 
              formData.security.isTwoFactorEnabled !== customer?.isTwoFactorEnabled ||
              formData.security.recoveryEmail !== (customer?.recoveryEmail || customer?.email) ||
              formData.security.sessionTimeout !== (customer?.sessionTimeout || 30) ||
              formData.security.securityQuestions.some(q => q.question && q.answer);
            
            if (hasNonPasswordChanges) {
              // Filter out empty security questions or questions without answers
              const validSecurityQuestions = formData.security.securityQuestions
                .filter(q => q.question && q.question.trim() !== '' && q.answer && q.answer.trim() !== '')
                .map(q => ({
                  question: q.question,
                  answer: q.answer
                }));
              
              const securityData = {
                twoFactorEnabled: formData.security.isTwoFactorEnabled,
                recoveryEmail: formData.security.recoveryEmail,
                sessionTimeoutMinutes: formData.security.sessionTimeout,
                securityQuestions: validSecurityQuestions
              };
              
              console.log('Calling updateSecuritySettings with:', securityData);
              await customerAPI.updateSecuritySettings(customer!.id, securityData);
              console.log('Security settings updated successfully');
            }
          } catch (secError) {
            console.error('Error updating security settings:', secError);
            // Don't show alert for security errors - they're often validation issues
            // The main save will still succeed
          }
          console.log('=== SECURITY SAVE COMPLETED ===');
        } else {
          console.log('No security changes detected, skipping security save');
        }
        
        // Show success message
        alert(t('common.saveSuccess', 'Customer saved successfully'));
        // Redirect to customers list
        router.push('/dashboard/clientes');
      }
    } catch (error: any) {
      console.error('Error saving customer:', error);
      // Show specific error message if available
      let errorMessage = t('common.error', 'An error occurred while saving');
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(errorMessage);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/clientes');
  };

  const tabs = [
    { id: 'overview', label: t('customers.tabs.overview', 'Overview'), icon: '📊' },
    { id: 'security', label: t('customers.tabs.security', 'Security'), icon: '🔒' },
    { id: 'address-billing', label: t('customers.tabs.addressBilling', 'Address & Billing'), icon: '📍' },
    { id: 'notifications', label: t('customers.tabs.notifications', 'Notifications'), icon: '🔔' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  if (!customer && !isNewCustomer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {t('customers.notFound', 'Customer not found')}
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {t('common.back', 'Back')}
        </button>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs - Desktop */}
          <nav className="hidden sm:flex px-4 sm:px-6 py-3 text-sm border-b border-gray-200 dark:border-gray-700" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  {t('navigation.dashboard', 'Dashboard')}
                </Link>
              </li>
              <li className="text-gray-400 dark:text-gray-500">/</li>
              <li>
                <Link href="/dashboard/clientes" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  {t('navigation.clientes', 'Customers')}
                </Link>
              </li>
              <li className="text-gray-400 dark:text-gray-500">/</li>
              <li className="text-gray-700 font-medium dark:text-gray-300">
                {isNewCustomer ? t('customers.newCustomer', 'New Customer') : `${customer.firstName} ${customer.lastName}`}
              </li>
            </ol>
          </nav>

          {/* Mobile Header */}
          <div className="sm:hidden px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 dark:text-gray-400"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('common.back', 'Back')}
            </button>
          </div>

          {/* Customer Header Info */}
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {(customer.avatarUrl || customer.avatar) ? (
                    <img src={customer.avatarUrl || customer.avatar} alt={customer.firstName || customer.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-500 dark:text-gray-400">
                      {customer.firstName && customer.lastName ? (
                        <>{customer.firstName[0]}{customer.lastName[0]}</>
                      ) : customer.fullName ? (
                        <>{customer.fullName.split(' ')[0]?.[0] || '?'}{customer.fullName.split(' ')[1]?.[0] || ''}</>
                      ) : (
                        <span>?</span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Basic Info */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {isNewCustomer ? t('customers.newCustomer', 'New Customer') : 
                      (customer.firstName && customer.lastName ? 
                        `${customer.firstName} ${customer.lastName}` : 
                        customer.fullName || customer.username || 'Customer')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {customer.email}
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : customer.status === 'Premium'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {customer.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {customer.customerId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions - Save and Cancel Buttons */}
              <div className="flex space-x-2 mt-4 sm:mt-0">
                <button 
                  onClick={() => {
                    if (isNewCustomer) {
                      router.push('/dashboard/clientes');
                    } else {
                      fetchCustomerDetail(); // Reset to original data
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button 
                  onClick={handleSaveAll}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg" 
                  style={{ backgroundColor: primaryColor }}
                >
                  {t('common.save', 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto sm:px-6 sm:py-6">
        {/* Mobile Tab Navigation - Vertical Stack Design */}
        <div className="sm:hidden">
          {/* Active Tab Header */}
          <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div 
              className="flex items-center justify-between px-4 py-3 rounded-xl text-white font-medium shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{tabs.find(t => t.id === activeTab)?.icon}</span>
                <span className="text-base">{tabs.find(t => t.id === activeTab)?.label}</span>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Other Tabs as Vertical List */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 space-y-2">
            {tabs.filter(tab => tab.id !== activeTab).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">{tab.icon}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tab.label}</span>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden sm:block border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-current text-current'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                style={activeTab === tab.id ? { 
                  color: primaryColor, 
                  borderColor: primaryColor 
                } : {}}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content - Always add padding bottom on mobile for save buttons */}
        <div className="sm:bg-white sm:dark:bg-gray-800 sm:rounded-lg sm:shadow pb-24 sm:pb-0">
          {/* Required fields notice */}
          {isNewCustomer && (
            <div className="px-4 sm:px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <span className="text-red-500">*</span> {t('common.requiredFields', 'Indicates required fields')}
              </p>
            </div>
          )}
          
          {/* Mobile Save Bar - Always visible */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  if (isNewCustomer) {
                    router.push('/dashboard/clientes');
                  } else {
                    fetchCustomerDetail(); // Reset to original data
                  }
                }}
                className="flex-1 py-3 px-4 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button 
                onClick={handleSaveAll}
                className="flex-1 py-3 px-4 text-sm font-medium text-white rounded-xl" 
                style={{ backgroundColor: primaryColor }}
              >
                {t('common.save', 'Save')}
              </button>
            </div>
          </div>
          
          {activeTab === 'overview' && (
            <CustomerOverviewTab 
              customer={customer} 
              formData={formData.overview}
              onFormChange={updateOverviewData}
              primaryColor={primaryColor}
              onRefresh={fetchCustomerDetail}
              isNewCustomer={isNewCustomer}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              onSave={handleSaveAll}
            />
          )}
          {activeTab === 'security' && (
            <CustomerSecurityTab 
              customer={customer} 
              formData={formData.security}
              onFormChange={updateSecurityData}
              primaryColor={primaryColor}
              onRefresh={fetchCustomerDetail}
              isNewCustomer={isNewCustomer}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          )}
          {activeTab === 'address-billing' && (
            <CustomerAddressBillingTab 
              customer={customer} 
              formData={formData.addressBilling}
              onFormChange={updateAddressBillingData}
              primaryColor={primaryColor}
              onRefresh={fetchCustomerDetail}
              isNewCustomer={isNewCustomer}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          )}
          {activeTab === 'notifications' && (
            <CustomerNotificationsTab 
              customer={customer} 
              formData={formData.notifications}
              onFormChange={updateNotificationsData}
              primaryColor={primaryColor}
              onRefresh={fetchCustomerDetail}
              isNewCustomer={isNewCustomer}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          )}
        </div>
      </div>
    </div>
  );
}
