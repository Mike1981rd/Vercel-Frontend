'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { companyCurrencyApi, type CurrencyCode, type CompanyCurrencySettings } from '@/lib/api/companyCurrency';
import { useCompany } from './CompanyContext';

interface CurrencyContextType {
  // Current selected currency
  selectedCurrency: CurrencyCode;
  
  // Base currency from company settings
  baseCurrency: CurrencyCode;
  
  // Available currencies
  availableCurrencies: CurrencyCode[];
  
  // Exchange rates (relative to base)
  exchangeRates: Record<CurrencyCode, number>;
  
  // Currency settings
  currencySettings: CompanyCurrencySettings | null;
  
  // Loading state
  isLoading: boolean;
  
  // Actions
  changeCurrency: (currency: CurrencyCode) => void;
  convertPrice: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => number;
  formatPrice: (amount: number, currency?: CurrencyCode, options?: Intl.NumberFormatOptions) => string;
  getCurrencySymbol: (currency?: CurrencyCode) => string;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  DOP: 'RD$',
  EUR: '€'
};

// Locale mapping for number formatting
const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  USD: 'en-US',
  DOP: 'es-DO',
  EUR: 'de-DE'
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { company } = useCompany();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('DOP'); // Default to DOP
  const [currencySettings, setCurrencySettings] = useState<CompanyCurrencySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storeCurrency, setStoreCurrency] = useState<CurrencyCode>('DOP'); // Track store currency

  // Load currency settings from company
  useEffect(() => {
    const loadCurrencySettings = async () => {
      if (!company?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const settings = await companyCurrencyApi.get(company.id);
        console.log('Currency settings loaded:', settings);
        console.log('Company currency:', company.currency);
        setCurrencySettings(settings);

        // IMPORTANT: The store currency is where all prices are stored
        const companyStoreCurrency = (company.currency as CurrencyCode) || 'DOP';
        setStoreCurrency(companyStoreCurrency);
        console.log('Store currency (base for all prices):', companyStoreCurrency);

        // Set initial selected currency from localStorage or use store currency
        const storedCurrency = localStorage.getItem('selectedCurrency') as CurrencyCode;
        console.log('Stored currency from localStorage:', storedCurrency);
        
        if (storedCurrency && settings.enabledCurrencies.includes(storedCurrency)) {
          console.log('Using stored currency:', storedCurrency);
          setSelectedCurrency(storedCurrency);
        } else {
          // Default to store currency
          console.log('Using store currency as default:', companyStoreCurrency);
          setSelectedCurrency(companyStoreCurrency);
        }
      } catch (error) {
        console.error('Error loading currency settings:', error);
        // Fallback to default settings
        setCurrencySettings({
          currencyBase: 'USD',
          enabledCurrencies: ['USD', 'DOP', 'EUR'],
          manualRates: { USD: 1, DOP: 56.5, EUR: 0.92 },
          roundingRule: { USD: 2, DOP: 2, EUR: 2 }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrencySettings();
  }, [company?.id]);

  // Save selected currency to localStorage
  useEffect(() => {
    if (selectedCurrency) {
      localStorage.setItem('selectedCurrency', selectedCurrency);
      
      // Dispatch custom event for cross-tab synchronization
      window.dispatchEvent(new CustomEvent('currencyChanged', { 
        detail: { currency: selectedCurrency } 
      }));
    }
  }, [selectedCurrency]);

  // Listen for currency changes from other tabs
  useEffect(() => {
    const handleCurrencyChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newCurrency = customEvent.detail?.currency as CurrencyCode;
      if (newCurrency && currencySettings?.enabledCurrencies.includes(newCurrency)) {
        setSelectedCurrency(newCurrency);
      }
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedCurrency' && e.newValue) {
        const newCurrency = e.newValue as CurrencyCode;
        if (currencySettings?.enabledCurrencies.includes(newCurrency)) {
          setSelectedCurrency(newCurrency);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currencySettings]);

  // Change currency
  const changeCurrency = useCallback((currency: CurrencyCode) => {
    if (currencySettings?.enabledCurrencies.includes(currency)) {
      setSelectedCurrency(currency);
    }
  }, [currencySettings]);

  // Convert price between currencies
  const convertPrice = useCallback((
    amount: number, 
    from: CurrencyCode = storeCurrency, // DEFAULT TO STORE CURRENCY, NOT USD!
    to: CurrencyCode = selectedCurrency
  ): number => {
    if (!currencySettings?.manualRates) {
      return amount;
    }
    if (from === to) {
      return amount;
    }

    const rates = currencySettings.manualRates;
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;

    // Convert: amount * (toRate / fromRate)
    const converted = amount * (toRate / fromRate);

    // Apply rounding rules
    const decimals = currencySettings.roundingRule?.[to] ?? 2;
    const rounded = Math.round(converted * Math.pow(10, decimals)) / Math.pow(10, decimals);
    return rounded;
  }, [currencySettings, selectedCurrency, storeCurrency]);

  // Format price with currency symbol
  const formatPrice = useCallback((
    amount: number,
    currency: CurrencyCode = selectedCurrency,
    options?: Intl.NumberFormatOptions
  ): string => {
    const locale = CURRENCY_LOCALES[currency] || 'en-US';
    const decimals = currencySettings?.roundingRule?.[currency] ?? 2;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      ...options
    }).format(amount);
  }, [selectedCurrency, currencySettings]);

  // Get currency symbol
  const getCurrencySymbol = useCallback((currency: CurrencyCode = selectedCurrency): string => {
    return CURRENCY_SYMBOLS[currency] || currency;
  }, [selectedCurrency]);

  // Refresh rates from server
  const refreshRates = useCallback(async () => {
    if (!company?.id) return;

    try {
      const settings = await companyCurrencyApi.get(company.id);
      setCurrencySettings(settings);
    } catch (error) {
      console.error('Error refreshing currency rates:', error);
    }
  }, [company?.id]);

  const value: CurrencyContextType = {
    selectedCurrency,
    baseCurrency: storeCurrency, // USE STORE CURRENCY AS BASE!
    availableCurrencies: currencySettings?.enabledCurrencies || ['DOP', 'USD', 'EUR'],
    exchangeRates: currencySettings?.manualRates || { DOP: 1, USD: 0.018, EUR: 0.016 },
    currencySettings,
    isLoading,
    changeCurrency,
    convertPrice,
    formatPrice,
    getCurrencySymbol,
    refreshRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Hook to use currency context
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    // Return a default implementation when not in provider
    // This happens in preview pages that may not have the full provider stack
    return {
      selectedCurrency: 'DOP' as CurrencyCode, // Default to DOP
      baseCurrency: 'DOP' as CurrencyCode, // Base is DOP
      availableCurrencies: ['DOP', 'USD', 'EUR'] as CurrencyCode[],
      exchangeRates: { DOP: 1, USD: 0.018, EUR: 0.016 } as Record<CurrencyCode, number>,
      currencySettings: null,
      isLoading: false,
      changeCurrency: () => {},
      convertPrice: (amount: number, from: CurrencyCode = 'DOP', to: CurrencyCode = 'DOP') => {
        // Basic conversion for fallback mode (DOP as base)
        const rates = { DOP: 1, USD: 0.018, EUR: 0.016 };
        if (from === to) return amount;
        const fromRate = rates[from] || 1;
        const toRate = rates[to] || 1;
        return amount * (toRate / fromRate);
      },
      formatPrice: (amount: number, currency: CurrencyCode = 'USD') => {
        return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(amount);
      },
      getCurrencySymbol: (currency: CurrencyCode = 'USD') => CURRENCY_SYMBOLS[currency],
      refreshRates: async () => {}
    };
  }
  return context;
}

// Utility hook for price conversion and formatting
export function usePrice(amount: number, fromCurrency?: CurrencyCode) {
  const { convertPrice, formatPrice, selectedCurrency, baseCurrency } = useCurrency();
  
  const from = fromCurrency || baseCurrency;
  const convertedAmount = convertPrice(amount, from, selectedCurrency);
  const formatted = formatPrice(convertedAmount, selectedCurrency);
  
  return {
    amount: convertedAmount,
    formatted,
    currency: selectedCurrency
  };
}