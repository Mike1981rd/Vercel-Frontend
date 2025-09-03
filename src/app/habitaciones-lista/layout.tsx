'use client';

import { CompanyProvider } from '@/contexts/CompanyContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { I18nProvider } from '@/contexts/I18nContext';

export default function HabitacionesListaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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