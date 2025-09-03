import { CurrencyCode } from '@/lib/api/companyCurrency';

// Currency display names
export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  USD: 'US Dollar',
  DOP: 'Peso Dominicano',
  EUR: 'Euro'
};

// Currency flags/icons (can be emojis or image paths)
export const CURRENCY_FLAGS: Record<CurrencyCode, string> = {
  USD: '🇺🇸',
  DOP: '🇩🇴',
  EUR: '🇪🇺'
};

// Get display name for currency selector
export function getCurrencyDisplay(currency: CurrencyCode): string {
  return `${currency} - ${CURRENCY_NAMES[currency]}`;
}

// Get short display (with flag)
export function getCurrencyShortDisplay(currency: CurrencyCode): string {
  return `${CURRENCY_FLAGS[currency]} ${currency}`;
}

// Convert amount between currencies using rates
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  
  return amount * (toRate / fromRate);
}

// Format price with proper locale and currency
export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  options?: Intl.NumberFormatOptions
): string {
  const localeMap: Record<CurrencyCode, string> = {
    USD: 'en-US',
    DOP: 'es-DO',
    EUR: 'de-DE'
  };

  const locale = localeMap[currency] || 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(amount);
}

// Get currency symbol only
export function getCurrencySymbol(currency: CurrencyCode): string {
  const symbols: Record<CurrencyCode, string> = {
    USD: '$',
    DOP: 'RD$',
    EUR: '€'
  };
  
  return symbols[currency] || currency;
}

// Parse currency string to number (removes symbols and formatting)
export function parseCurrencyString(value: string): number {
  // Remove all non-numeric characters except decimal point and minus
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

// Round price according to currency rules
export function roundPrice(
  amount: number,
  currency: CurrencyCode,
  roundingRules?: Record<CurrencyCode, number>
): number {
  const decimals = roundingRules?.[currency] ?? 2;
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Check if currency is valid
export function isValidCurrency(currency: string): currency is CurrencyCode {
  return ['USD', 'DOP', 'EUR'].includes(currency);
}

// Get default currency based on user locale
export function getDefaultCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'USD';
  
  const locale = navigator.language;
  
  if (locale.includes('DO')) return 'DOP';
  if (locale.includes('EU') || locale.includes('DE') || locale.includes('FR')) return 'EUR';
  
  return 'USD';
}