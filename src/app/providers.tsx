'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ThemeLoader } from '@/components/ui/ThemeLoader';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suprimir warnings de atributos extras del servidor (extensiones del navegador)
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Extra attributes from the server')
      ) {
        return;
      }
      originalError.call(console, ...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <I18nProvider>
      <AuthProvider>
        <CompanyProvider>
          <CurrencyProvider>
            <ThemeLoader />
            <Toaster 
              position="top-right"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  fontSize: '14px',
                },
                success: {
                  style: {
                    background: '#22c55e',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
            {children}
          </CurrencyProvider>
        </CompanyProvider>
      </AuthProvider>
    </I18nProvider>
  );
}