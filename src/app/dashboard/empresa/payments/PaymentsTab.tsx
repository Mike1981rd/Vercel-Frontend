'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings, Check, X, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useI18n } from '@/contexts/I18nContext';
import { useCompany } from '@/contexts/CompanyContext';
import { companyCurrencyApi, type CompanyCurrencySettings, type CurrencyCode } from '@/lib/api/companyCurrency';
import { paymentService, PaymentProvider as PaymentProviderDto } from '@/lib/api/payment.service';
// Modal removed - now using full page configuration
import { toast } from 'react-hot-toast';

interface PaymentProviderUI {
  id: number;
  providerId: string;
  name: string;
  logo: string;
  status: 'active' | 'inactive' | 'configured';
  commission: string;
  accentColor: string;
  isTestMode?: boolean;
  hasCredentials?: boolean;
}

const providerMetadata: Record<string, { logo: string; accentColor: string; commission: string }> = {
  azul: {
    logo: '/payment-providers/azul.png',
    accentColor: '#0066CC',
    commission: '2.95%'
  },
  cardnet: {
    logo: '/payment-providers/cardnet.png',
    accentColor: '#E84855',
    commission: '3.25%'
  },
  portal: {
    logo: '/payment-providers/portal.png',
    accentColor: '#7C3AED',
    commission: '2.75%'
  },
  stripe: {
    logo: '/payment-providers/stripe.png',
    accentColor: '#635BFF',
    commission: '2.9% + $0.30'
  },
  paypal: {
    logo: '/payment-providers/paypal.png',
    accentColor: '#003087',
    commission: '3.49% + $0.49'
  }
};

export default function PaymentsTab() {
  const { t } = useI18n();
  const router = useRouter();
  const { company } = useCompany();
  const [providers, setProviders] = useState<PaymentProviderUI[]>([]);
  const [currencySettings, setCurrencySettings] = useState<CompanyCurrencySettings | null>(null);
  const [savingCurrency, setSavingCurrency] = useState(false);
  // Remove modal states - now using navigation
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchInitiatedRef = useRef(false);

  // Load providers from backend
  useEffect(() => {
    if (fetchInitiatedRef.current && refreshKey === 0) return;
    fetchInitiatedRef.current = true;
    loadProviders();
  }, [refreshKey]);

  // Get primary color from localStorage
  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        setPrimaryColor(parsed.primaryColor || '#22c55e');
      } catch (e) {
        console.error('Error parsing settings:', e);
        setPrimaryColor('#22c55e');
      }
    } else {
      setPrimaryColor('#22c55e');
    }
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getProviders();
      
      // Transform backend data to UI format
      const uiProviders: PaymentProviderUI[] = response.map(p => {
        const metadata = providerMetadata[p.provider] || {
          logo: '/payment-providers/default.png',
          accentColor: '#6B7280',
          commission: p.transactionFee + '%'
        };

        return {
          id: p.id,
          providerId: p.provider,
          name: p.name,
          logo: metadata.logo,
          status: p.isActive ? 'active' : (p.storeId || p.hasCertificate ? 'configured' : 'inactive'),
          commission: metadata.commission,
          accentColor: metadata.accentColor,
          isTestMode: p.isTestMode,
          hasCredentials: !!(p.storeId || p.hasCertificate)
        };
      });

      setProviders(uiProviders);
    } catch (error) {
      console.error('Error loading providers:', error);
      toast.error(t('payments.error.loading'));
    } finally {
      setLoading(false);
    }
  };

  // Load currency settings for company
  useEffect(() => {
    (async () => {
      try {
        if (!company?.id) return;
        const settings = await companyCurrencyApi.get(company.id);
        console.log('Currency settings received from backend:', settings);
        console.log('Manual rates:', settings.manualRates);
        
        // Ensure manualRates is properly initialized
        if (!settings.manualRates || Object.keys(settings.manualRates).length === 0) {
          console.warn('Manual rates are empty, initializing with defaults');
          settings.manualRates = {} as Record<CurrencyCode, number>;
        }
        
        // Ensure all currencies have a rate value
        const allCurrencies = ['DOP', 'USD', 'EUR'] as CurrencyCode[];
        for (const currency of allCurrencies) {
          if (settings.manualRates[currency] === undefined || settings.manualRates[currency] === null) {
            console.log(`Rate for ${currency} is undefined/null, keeping as is for user to set`);
          }
        }
        
        setCurrencySettings(settings);
      } catch (e) {
        console.error('Error loading currency settings:', e);
      }
    })();
  }, [company?.id]);

  const recalcRatesOnBaseChange = (prev: CompanyCurrencySettings, nextBase: CurrencyCode): CompanyCurrencySettings => {
    const prevBase = prev.currencyBase as CurrencyCode;
    if (prevBase === nextBase) return prev;
    const prevRates = { ...prev.manualRates } as Record<CurrencyCode, number>;
    // Ensure base keys exist
    if (!prevRates[prevBase]) prevRates[prevBase] = 1;
    const factorToNext = prevRates[nextBase] && prevRates[nextBase] > 0 ? prevRates[nextBase] : 1; // 1 prevBase = factorToNext nextBase
    const nextRates: Record<CurrencyCode, number> = {} as any;
    // New base must be 1
    nextRates[nextBase] = 1;
    (['DOP','USD','EUR'] as CurrencyCode[]).forEach(code => {
      if (code === nextBase) return;
      if (code === prevBase) {
        // 1 nextBase = X prevBase -> X = 1 / factorToNext
        nextRates[prevBase] = factorToNext > 0 ? Number((1 / factorToNext).toFixed(6)) : 0;
      } else {
        const prevVal = prevRates[code]; // 1 prevBase = prevVal code
        if (prevVal && factorToNext > 0) {
          // 1 nextBase = ? code -> (1 next = 1/factorToNext prev) => (1 next) = (prevVal / factorToNext) code
          nextRates[code] = Number((prevVal / factorToNext).toFixed(6));
        } else {
          // leave as existing if present
          nextRates[code] = prev.manualRates[code] ?? 0;
        }
      }
    });
    return {
      ...prev,
      currencyBase: nextBase,
      manualRates: nextRates
    };
  };

  const handleCurrencySettingChange = (updates: Partial<CompanyCurrencySettings>) => {
    setCurrencySettings(prev => {
      if (!prev) return prev;
      if (updates.currencyBase && updates.currencyBase !== prev.currencyBase) {
        return recalcRatesOnBaseChange(prev, updates.currencyBase as CurrencyCode);
      }
      return { ...prev, ...updates };
    });
  };

  const handleManualRateChange = (code: CurrencyCode, value: string) => {
    // Allow empty value for editing
    if (value === '') {
      setCurrencySettings(prev => prev ? {
        ...prev,
        manualRates: { ...prev.manualRates, [code]: undefined as any }
      } : prev);
      return;
    }
    
    // Allow minus sign for negative values temporarily
    if (value === '-' || value === '.') return;
    
    const num = Number(value.replace(',', '.'));
    if (isNaN(num) || num < 0) return;
    
    setCurrencySettings(prev => prev ? {
      ...prev,
      manualRates: { ...prev.manualRates, [code]: num }
    } : prev);
  };

  const handleSaveCurrency = async () => {
    if (!company?.id || !currencySettings) return;
    try {
      setSavingCurrency(true);
      // Basic validations
      if (!currencySettings.currencyBase) throw new Error('Missing base currency');
      const base = currencySettings.currencyBase;
      const rates = { ...currencySettings.manualRates } as Record<CurrencyCode, number>;
      
      // Ensure base currency is always 1
      rates[base] = 1;
      
      // Check that all currencies (except base) have valid rates
      const allCurrencies = ['DOP', 'USD', 'EUR'] as CurrencyCode[];
      for (const currency of allCurrencies) {
        if (currency !== base) {
          // If rate is undefined, null, or 0, throw error
          if (!rates[currency] || rates[currency] <= 0) {
            throw new Error(`La tasa para ${currency} debe ser mayor que 0`);
          }
        }
      }
      
      // Check enabled currencies specifically
      for (const c of currencySettings.enabledCurrencies) {
        if (c !== base && (!rates[c] || rates[c] <= 0)) {
          throw new Error(`La tasa para ${c} debe ser mayor que 0`);
        }
      }
      
      console.log('Sending rates to backend:', rates);
      await companyCurrencyApi.update(company.id, { ...currencySettings, manualRates: rates });
      // Refetch to reflect persisted values
      const fresh = await companyCurrencyApi.get(company.id);
      console.log('Fresh settings after save:', fresh);
      console.log('Fresh manual rates:', fresh.manualRates);
      setCurrencySettings(fresh);
      toast.success(t('payments.currency.saved', 'Currency settings saved'));
    } catch (e: any) {
      toast.error(e?.message || t('payments.currency.error', 'Failed to save currency settings'));
    } finally {
      setSavingCurrency(false);
    }
  };

  const toggleProviderStatus = async (providerId: number) => {
    try {
      const result = await paymentService.toggleProvider(providerId);
      toast.success(t('payments.success.toggled'));
      setRefreshKey(prev => prev + 1); // Refresh providers
    } catch (error) {
      console.error('Error toggling provider:', error);
      toast.error(t('payments.error.toggle'));
    }
  };

  const handleConfigureProvider = (providerId: string) => {
    // Navigate to configuration page using Next.js router
    router.push(`/dashboard/empresa/payments/configure/${providerId}`);
  };

  const handleDeleteProvider = async (providerId: number) => {
    if (!confirm('¿Está seguro de eliminar este proveedor?')) {
      return;
    }

    try {
      await paymentService.deleteProvider(providerId);
      toast.success(t('payments.success.deleted'));
      setRefreshKey(prev => prev + 1); // Refresh providers
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error(t('payments.error.delete'));
    }
  };

  // handleSaveAzulConfig removed - now handled in configuration page

  if (loading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-pink-500/5 p-4 sm:p-6 backdrop-blur-sm dark:from-violet-500/10 dark:via-purple-500/10 dark:to-pink-500/10">
        <div className="relative z-10">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t('payments.title')}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            {t('payments.subtitle')}
          </p>
        </div>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-violet-400/10 to-pink-400/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-2xl" />
      </div>

      {/* Payment Providers Grid */}
      <div className="flex flex-col items-start ml-[5vw] sm:ml-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {providers.map((provider) => (
            <motion.div
              key={provider.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group relative"
            >
              {/* Card Glow Effect */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-30"
                style={{
                  background: `linear-gradient(135deg, ${provider.accentColor}40, transparent)`
                }}
              />

              {/* Card Content */}
              <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-4 sm:p-5 backdrop-blur-sm transition-all duration-300 dark:border-gray-700 dark:bg-gray-800/80 w-[70vw] sm:w-full max-w-sm sm:max-w-none">
                {/* Status Badge */}
                <div className="absolute right-3 top-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      provider.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : provider.status === 'configured'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        provider.status === 'active' 
                          ? 'bg-green-500' 
                          : provider.status === 'configured'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      }`}
                    />
                    {provider.status === 'active' 
                      ? t('payments.active') 
                      : provider.status === 'configured'
                      ? t('payments.configured')
                      : t('payments.inactive')}
                  </span>
                </div>

                {/* Provider Logo */}
                <div className="mb-4 flex items-center justify-start">
                  <div className="relative h-12 w-24 sm:h-16 sm:w-32">
                    <Image
                      src={provider.logo}
                      alt={provider.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 128px, (max-width: 768px) 128px, 128px"
                    />
                  </div>
                </div>

                {/* Provider Name */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-left">
                  {provider.name}
                </h3>

                {/* Commission Rate */}
                {provider.commission && (
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-left">
                    {t('payments.commission')}: <span className="font-medium">{provider.commission}</span>
                  </p>
                )}

                {/* Test Mode Indicator */}
                {provider.isTestMode && provider.status !== 'inactive' && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-3 w-3" />
                    {t('payments.testMode')}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  {provider.status === 'inactive' && (
                    <button
                      onClick={() => handleConfigureProvider(provider.providerId)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <Settings className="mr-1.5 inline h-4 w-4" />
                      {t('payments.configure.title')}
                    </button>
                  )}
                  
                  {provider.status === 'configured' && (
                    <>
                      <button
                        onClick={() => toggleProviderStatus(provider.id)}
                        className="flex-1 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-white transition-all bg-primary-600 hover:bg-primary-700"
                      >
                        <Check className="mr-1.5 inline h-4 w-4" />
                        {t('payments.activate')}
                      </button>
                      <div className="flex flex-row justify-start gap-1">
                        <button
                          onClick={() => handleConfigureProvider(provider.providerId)}
                          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProvider(provider.id)}
                          className="rounded-lg border border-red-300 bg-white p-2 text-red-600 transition-all hover:bg-red-50 dark:border-red-800 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                  
                  {provider.status === 'active' && (
                    <>
                      <button
                        onClick={() => toggleProviderStatus(provider.id)}
                        className="flex-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs sm:text-sm font-medium text-red-700 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        <X className="mr-1.5 inline h-4 w-4" />
                        {t('payments.deactivate')}
                      </button>
                      <button
                        onClick={() => handleConfigureProvider(provider.providerId)}
                        className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add New Provider Card */}
        <motion.div
          layout
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="group relative w-[70vw] sm:w-full max-w-sm sm:max-w-none"
        >
          <button
            onClick={() => router.push('/dashboard/empresa/payments/add')}
            className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white/50 p-6 sm:p-8 transition-all hover:border-gray-400 hover:bg-white/80 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-gray-500 dark:hover:bg-gray-800/80"
          >
            <div className="text-center">
              <Plus className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('payments.addProvider')}
              </p>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Currency Settings - Manual rates */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('payments.currency.title', 'Moneda y Tasas (Manual)')}
        </h3>

        {currencySettings ? (
          <div className="space-y-4">
            {/* Base currency and enabled currencies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('payments.currency.base', 'Moneda base')}</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  value={currencySettings.currencyBase}
                  onChange={(e) => handleCurrencySettingChange({ currencyBase: e.target.value as CurrencyCode })}
                >
                  {(['DOP','USD','EUR'] as CurrencyCode[]).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('payments.currency.enabled', 'Monedas habilitadas')}</label>
                <div className="flex flex-col items-center gap-3">
                  {(['DOP','USD','EUR'] as CurrencyCode[]).map(c => {
                    const enabled = currencySettings.enabledCurrencies.includes(c);
                    return (
                      <div key={c} className="w-full max-w-sm flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-gray-800 dark:text-gray-200">{c}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const set = new Set(currencySettings.enabledCurrencies);
                            enabled ? set.delete(c) : set.add(c);
                            handleCurrencySettingChange({ enabledCurrencies: Array.from(set) as CurrencyCode[] });
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-500'}`}
                          aria-pressed={enabled}
                          aria-label={`Toggle ${c}`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Manual rates table */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">{t('payments.currency.rates', 'Tasas relativas a la base')}</label>
              <div className="flex flex-col items-center gap-3">
                {(['DOP','USD','EUR'] as CurrencyCode[])
                  .filter(code => code !== currencySettings.currencyBase)
                  .map(code => (
                  <div key={code} className="w-full max-w-md flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">1 {currencySettings.currencyBase} =</span>
                    <input
                      type="number"
                      step="0.0001"
                      min={0.0001}
                      value={currencySettings.manualRates && currencySettings.manualRates[code] !== undefined && currencySettings.manualRates[code] !== null ? currencySettings.manualRates[code] : ''}
                      onChange={(e) => handleManualRateChange(code, e.target.value)}
                      placeholder="0.00"
                      className="w-28 text-center px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{code}</span>
                  </div>
                ))}
                <div className="w-full max-w-md flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                  <span>1 {currencySettings.currencyBase} = 1 {currencySettings.currencyBase}</span>
                </div>
              </div>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 text-center">
                {t('payments.currency.help', 'Ejemplo: 1 USD = 61 DOP, 1 USD = 0.95 EUR. La base siempre es 1.')}
              </p>
            </div>

            {/* Lock and rounding */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t('payments.currency.lock', 'Bloquear hasta')}</label>
                <input
                  type="datetime-local"
                  value={currencySettings.lockedUntil ? currencySettings.lockedUntil.substring(0,16) : ''}
                  onChange={(e) => handleCurrencySettingChange({ lockedUntil: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="flex flex-col items-center">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">{t('payments.currency.rounding', 'Decimales por moneda')}</label>
                <div className="w-full max-w-sm space-y-2">
                  {(['DOP','USD','EUR'] as CurrencyCode[]).map(code => (
                    <div key={code} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600">
                      <span className="text-sm text-gray-800 dark:text-gray-200 w-16">{code}</span>
                      <input
                        type="number"
                        min={0}
                        max={4}
                        value={currencySettings.roundingRule?.[code] ?? 2}
                        onChange={(e) => handleCurrencySettingChange({ 
                          roundingRule: { 
                            ...(currencySettings.roundingRule || {}), 
                            [code]: Number(e.target.value) 
                          } as Record<CurrencyCode, number> 
                        })}
                        className="w-20 text-center px-2 py-1 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveCurrency}
                disabled={savingCurrency}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: primaryColor, opacity: savingCurrency ? 0.7 : 1 }}
              >
                {savingCurrency ? t('common.saving', 'Guardando...') : t('common.save', 'Guardar')}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('payments.currency.loading', 'Cargando configuración de moneda...')}</div>
        )}
      </div>

      {/* Modals removed - now using full page configuration */}
    </div>
  );
}