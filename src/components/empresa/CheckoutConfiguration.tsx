'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';
import { getImageUrl } from '@/lib/api-url';
import { AlertCircle, Phone, Mail, Building2, MapPin, Home, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface CheckoutField {
  id: string;
  label: string;
  icon?: React.ReactNode;
  value: 'hidden' | 'optional' | 'required';
  description?: string;
  helpText?: string;
}

export function CheckoutConfiguration() {
  const { t } = useI18n();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const fetchInitiatedRef = useRef(false);
  
  // Estado para los campos de configuración
  const [contactMethod, setContactMethod] = useState<'phone' | 'email'>('email');
  const [fullNameOption, setFullNameOption] = useState<'lastOnly' | 'firstAndLast'>('firstAndLast');
  const [companyNameField, setCompanyNameField] = useState<'hidden' | 'optional' | 'required'>('optional');
  const [addressLine2Field, setAddressLine2Field] = useState<'hidden' | 'optional' | 'required'>('optional');
  const [phoneNumberField, setPhoneNumberField] = useState<'hidden' | 'optional' | 'required'>('optional');
  const [initialSettings, setInitialSettings] = useState<any>(null);

  // Branding state
  const [checkoutLogoUrl, setCheckoutLogoUrl] = useState<string | null>(null);
  const [logoAlignment, setLogoAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [logoWidthPx, setLogoWidthPx] = useState<number>(120);
  const [payButtonColor, setPayButtonColor] = useState<string>('#22c55e');
  const [payButtonTextColor, setPayButtonTextColor] = useState<string>('#ffffff');
  
  // Get primary color from localStorage
  useEffect(() => {
    if (fetchInitiatedRef.current) return;
    fetchInitiatedRef.current = true;
    
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        setPrimaryColor(parsed.primaryColor || '#22c55e');
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }
    loadCheckoutSettings();
  }, []);

  const loadCheckoutSettings = async () => {
    try {
    const response = await api.get('/company/checkout-settings');
    const settings = response.data as any;
      
      // Apply loaded settings
      setContactMethod(settings.contactMethod || 'email');
      setFullNameOption(settings.fullNameOption || 'firstAndLast');
      setCompanyNameField(settings.companyNameField || 'optional');
      setAddressLine2Field(settings.addressLine2Field || 'optional');
      setPhoneNumberField(settings.phoneNumberField || 'optional');

      // Branding (normalize logo URL to absolute so preview works from admin frontend)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
      let normalizedLogoUrl: string | null = settings.checkoutLogoUrl || null;
      if (normalizedLogoUrl) {
        if (normalizedLogoUrl.startsWith('http')) {
          // keep as-is
        } else if (normalizedLogoUrl.startsWith('/')) {
          normalizedLogoUrl = `${(apiUrl as string).replace('/api','')}${normalizedLogoUrl}`;
        } else {
          normalizedLogoUrl = `${(apiUrl as string).replace('/api','')}/uploads/${normalizedLogoUrl}`;
        }
      }
      setCheckoutLogoUrl(normalizedLogoUrl);
      setLogoAlignment((settings.checkoutLogoAlignment as any) || 'center');
      setLogoWidthPx(settings.checkoutLogoWidthPx || 120);
      if (settings.checkoutPayButtonColor) setPayButtonColor(settings.checkoutPayButtonColor);
      if (settings.checkoutPayButtonTextColor) setPayButtonTextColor(settings.checkoutPayButtonTextColor);
      
      // Save initial settings for reset
      setInitialSettings(settings);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading checkout settings:', error);
      toast.error(t('empresa.checkout.loadFailed', 'Failed to load checkout settings'));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const settings = {
        contactMethod,
        fullNameOption,
        companyNameField,
        addressLine2Field,
        phoneNumberField,
        requireShippingAddress: true,
        requireBillingAddress: true,
        allowGuestCheckout: true,
        collectMarketingConsent: false,
        showTermsAndConditions: true,
        termsAndConditionsUrl: null,
        // Branding
        checkoutLogoUrl: checkoutLogoUrl,
        checkoutLogoAlignment: logoAlignment,
        checkoutLogoWidthPx: logoWidthPx,
        checkoutPayButtonColor: payButtonColor,
        checkoutPayButtonTextColor: payButtonTextColor
      };
      
      await api.put('/company/checkout-settings', settings);
      
      // Update initial settings after successful save
      setInitialSettings(settings);
      setHasChanges(false);
      
      toast.success(t('empresa.checkout.settingsSaved', 'Checkout settings saved successfully'));
    } catch (error: any) {
      toast.error(t('empresa.checkout.saveFailed', 'Failed to save checkout settings'));
      console.error('Error saving checkout settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    loadCheckoutSettings();
    setHasChanges(false);
  };

  const RadioGroup = ({ 
    options, 
    value, 
    onChange, 
    name 
  }: { 
    options: { value: string; label: string; description?: string }[];
    value: string;
    onChange: (value: any) => void;
    name: string;
  }) => (
    <div className="space-y-2 sm:space-y-3 mr-1">
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-md sm:rounded-lg cursor-pointer transition-all relative",
            "hover:bg-gray-50 dark:hover:bg-gray-800/50",
            value === option.value && "bg-gray-50 dark:bg-gray-800/50",
          )}
          style={{
            ...(value === option.value && {
              borderLeft: `2px solid ${primaryColor}`,
              backgroundColor: 'rgba(34, 197, 94, 0.05)'
            })
          }}
        >
          <div className="mt-0.5">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => {
                onChange(option.value);
                setHasChanges(true);
              }}
              className="sr-only"
            />
            <div 
              className={cn(
                "w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
                value === option.value 
                  ? "border-current" 
                  : "border-gray-300 dark:border-gray-600"
              )}
              style={{
                borderColor: value === option.value ? primaryColor : undefined
              }}
            >
              {value === option.value && (
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-words">
              {option.label}
            </div>
            {option.description && (
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 break-words pr-1">
                {option.description}
              </div>
            )}
          </div>
        </label>
      ))}
    </div>
  );

  return (
    <div className="space-y-3 sm:space-y-6 pb-32 sm:pb-20 w-full overflow-x-hidden">
      {/* Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 pl-3 pr-3 py-4 sm:p-6">
        <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
          {t('empresa.checkout.title', 'Checkout Configuration')}
        </h2>
        <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          {t('empresa.checkout.description', 'Customize your checkout form fields and requirements')}
        </p>
      </motion.div>

      {/* Customer Contact Method */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 pl-3 pr-2 py-4 sm:p-6 overflow-hidden">
        <div className="mb-4 sm:mb-6 max-w-full">
          <h3 className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white mb-1 sm:mb-2 leading-tight">
            {t('empresa.checkout.contactMethod.title', 'Customer contact method')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-normal whitespace-normal">
            {t('empresa.checkout.contactMethod.description', 'Select what contact method customers use to check out.')}
          </p>
        </div>

        <RadioGroup
          name="contactMethod"
          value={contactMethod}
          onChange={setContactMethod}
          options={[
            {
              value: 'phone',
              label: t('empresa.checkout.contactMethod.phone', 'Phone number'),
              description: t('empresa.checkout.contactMethod.phoneDesc', 'Customers will use their phone number to checkout')
            },
            {
              value: 'email',
              label: t('empresa.checkout.contactMethod.email', 'Email'),
              description: t('empresa.checkout.contactMethod.emailDesc', 'Customers will use their email address to checkout')
            }
          ]}
        />

        {/* SMS Alert */}
        {contactMethod === 'phone' && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                {t('empresa.checkout.smsAlert', 'To send SMS updates, you need to install an SMS App.')}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Customer Information */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 pl-3 pr-2 py-4 sm:p-6 overflow-hidden">
        <div className="mb-4 sm:mb-6 max-w-full">
          <h3 className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white mb-1 sm:mb-2 leading-tight">
            {t('empresa.checkout.customerInfo.title', 'Customer information')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-normal whitespace-normal">
            {t('empresa.checkout.customerInfo.description', 'Choose which fields are required during checkout')}
          </p>
        </div>

        <div className="space-y-5 sm:space-y-8">
          {/* Full Name Field */}
          <div>
            <div className="flex items-start gap-2 mb-3 sm:mb-4">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-words">
                {t('empresa.checkout.fullName.title', 'Full name')}
              </h4>
            </div>
            <RadioGroup
              name="fullName"
              value={fullNameOption}
              onChange={setFullNameOption}
              options={[
                {
                  value: 'lastOnly',
                  label: t('empresa.checkout.fullName.lastOnly', 'Only require last name')
                },
                {
                  value: 'firstAndLast',
                  label: t('empresa.checkout.fullName.firstAndLast', 'Require first and last name')
                }
              ]}
            />
          </div>

          {/* Company Name Field */}
          <div>
            <div className="flex items-start gap-2 mb-3 sm:mb-4">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-words">
                {t('empresa.checkout.companyName.title', 'Company name')}
              </h4>
            </div>
            <RadioGroup
              name="companyName"
              value={companyNameField}
              onChange={setCompanyNameField}
              options={[
                {
                  value: 'hidden',
                  label: t('empresa.checkout.field.dontInclude', "Don't include field")
                },
                {
                  value: 'optional',
                  label: t('empresa.checkout.field.optional', 'Optional')
                },
                {
                  value: 'required',
                  label: t('empresa.checkout.field.required', 'Required')
                }
              ]}
            />
          </div>

          {/* Address Line 2 Field */}
          <div>
            <div className="flex items-start gap-2 mb-3 sm:mb-4">
              <Home className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-words">
                {t('empresa.checkout.addressLine2.title', 'Address line 2 (apartment, unit, etc.)')}
              </h4>
            </div>
            <RadioGroup
              name="addressLine2"
              value={addressLine2Field}
              onChange={setAddressLine2Field}
              options={[
                {
                  value: 'hidden',
                  label: t('empresa.checkout.field.dontInclude', "Don't include field")
                },
                {
                  value: 'optional',
                  label: t('empresa.checkout.field.optional', 'Optional')
                },
                {
                  value: 'required',
                  label: t('empresa.checkout.field.required', 'Required')
                }
              ]}
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <div className="flex items-start gap-2 mb-3 sm:mb-4">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-words">
                {t('empresa.checkout.phoneNumber.title', 'Shipping address phone number')}
              </h4>
            </div>
            <RadioGroup
              name="phoneNumber"
              value={phoneNumberField}
              onChange={setPhoneNumberField}
              options={[
                {
                  value: 'hidden',
                  label: t('empresa.checkout.field.dontInclude', "Don't include field")
                },
                {
                  value: 'optional',
                  label: t('empresa.checkout.field.optional', 'Optional')
                },
                {
                  value: 'required',
                  label: t('empresa.checkout.field.required', 'Required')
                }
              ]}
            />
          </div>
        </div>
      </motion.div>

      {/* Branding - Checkout Header & Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 pl-3 pr-3 py-4 sm:p-6"
      >
        <h3 className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white mb-3">
          {t('empresa.checkout.branding.title', 'Checkout branding')}
        </h3>

        {/* Logo upload and preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3">
            <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('empresa.checkout.branding.logo', 'Checkout logo')}
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="file" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setLoading(true);
                    const form = new FormData();
                    form.append('file', file);
                    const res = await api.post('/company/checkout-settings/logo', form, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    // Normalize returned URL for immediate preview
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
                    let url = (res.data as any)?.logoUrl as string;
                    if (url) {
                      if (url.startsWith('http')) {
                        // keep as-is
                      } else if (url.startsWith('/')) {
                        url = `${(apiUrl as string).replace('/api','')}${url}`;
                      } else {
                        url = `${(apiUrl as string).replace('/api','')}/uploads/${url}`;
                      }
                    }
                    setCheckoutLogoUrl(url);
                    setHasChanges(true);
                    toast.success(t('common.upload', 'Upload'));
                  } catch (err) {
                    toast.error(t('empresa.checkout.branding.logoUploadError', 'Logo upload failed'));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-sm"
              />
              {checkoutLogoUrl && (
                <img 
                  src={getImageUrl(checkoutLogoUrl)} 
                  alt="logo" 
                  className="h-10 object-contain border rounded p-1 bg-white"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('empresa.checkout.branding.alignment', 'Logo alignment')}
                </label>
                <div className="flex gap-2">
                  {(['left','center','right'] as const).map(val => (
                    <button
                      key={val}
                      onClick={() => { setLogoAlignment(val); setHasChanges(true); }}
                      className={cn('px-3 py-1.5 text-xs rounded border', logoAlignment === val ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300')}
                    >
                      {t(`empresa.checkout.branding.${val}`, val.charAt(0).toUpperCase()+val.slice(1))}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('empresa.checkout.branding.logoWidth', 'Logo width (px)')}
                </label>
                <input 
                  type="range" min={40} max={400} value={logoWidthPx}
                  onChange={(e) => { setLogoWidthPx(parseInt(e.target.value)); setHasChanges(true); }}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">{logoWidthPx}px</div>
              </div>
            </div>
          </div>

          {/* Button colors and preview */}
          <div className="space-y-3">
            <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('empresa.checkout.branding.payButton', 'Pay button')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('empresa.checkout.branding.buttonBg', 'Button color')}</div>
                <input type="color" value={payButtonColor} onChange={(e)=>{ setPayButtonColor(e.target.value); setHasChanges(true); }} />
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('empresa.checkout.branding.buttonText', 'Button text color')}</div>
                <input type="color" value={payButtonTextColor} onChange={(e)=>{ setPayButtonTextColor(e.target.value); setHasChanges(true); }} />
              </div>
            </div>
            <div className="mt-2">
              <button className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: payButtonColor, color: payButtonTextColor }}>
                {t('empresa.checkout.branding.previewPay', 'Confirm and pay')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons - Mobile responsive */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 lg:sticky lg:bottom-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-lg lg:shadow-none border-t border-gray-200 dark:border-gray-700 z-20">
        <button
          onClick={handleDiscard}
          disabled={!hasChanges || loading}
          className={cn(
            "px-5 py-2 sm:px-6 sm:py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base",
            "border border-gray-300 dark:border-gray-600",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "text-gray-700 dark:text-gray-300"
          )}
        >
          {t('common.discard', 'Discard')}
        </button>
        
        <button
          onClick={handleSave}
          disabled={!hasChanges || loading}
          className={cn(
            "px-5 py-2 sm:px-6 sm:py-2.5 rounded-lg font-medium text-white transition-all text-sm sm:text-base",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          )}
          style={{
            backgroundColor: hasChanges ? primaryColor : '#9ca3af',
            boxShadow: hasChanges ? `0 10px 25px -5px ${primaryColor}40` : undefined
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('common.saving', 'Saving...')}
            </span>
          ) : (
            t('common.saveChanges', 'Save Changes')
          )}
        </button>
      </motion.div>
    </div>
  );
}
