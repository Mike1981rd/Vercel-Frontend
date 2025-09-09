'use client';

import { getApiUrl } from '@/lib/api-url';

export type CurrencyCode = 'DOP' | 'USD' | 'EUR';

export interface CompanyCurrencySettings {
  currencyBase: CurrencyCode;
  enabledCurrencies: CurrencyCode[];
  manualRates: Record<CurrencyCode, number>; // Relative to base; base must be 1
  lockedUntil?: string | null; // ISO string
  roundingRule?: Record<CurrencyCode, number>; // decimals per currency
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  } as Record<string, string>;
}

export const companyCurrencyApi = {
  async get(companyId: number): Promise<CompanyCurrencySettings> {
    const resp = await fetch(`${getApiUrl()}/currency/company/${companyId}/effective-settings`, {
      headers: getAuthHeaders()
    });
    if (!resp.ok) {
      throw new Error('Failed to fetch currency settings');
    }
    return resp.json();
  },

  async update(companyId: number, settings: CompanyCurrencySettings): Promise<void> {
    const resp = await fetch(`${getApiUrl()}/company/${companyId}/currency-settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || 'Failed to update currency settings');
    }
  }
};
