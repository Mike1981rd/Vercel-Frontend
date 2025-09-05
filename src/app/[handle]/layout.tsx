'use client';

import { useEffect } from 'react';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { I18nProvider } from '@/contexts/I18nContext';

export default function HandleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Expose Mapbox token globally for public pages that don't load company config
  useEffect(() => {
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && !window.__MAPBOX_TOKEN) {
        // process.env is inlined at build time (NEXT_PUBLIC_* only)
        // @ts-ignore
        window.__MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
      }
    } catch {}
  }, []);

  return (
    <I18nProvider>
      <CompanyProvider>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </CompanyProvider>
    </I18nProvider>
  );
}
