'use client';

import { useEffect } from 'react';
import { getApiUrl } from '@/lib/api-url';
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

  // Initialize global Mapbox token for public pages
  useEffect(() => {
    try {
      const w: any = typeof window !== 'undefined' ? window : undefined;
      if (!w) return;

      // Respect existing token if already set by a layout
      if (!w.__MAPBOX_TOKEN) {
        // In development, do not attempt backend fallback to avoid noisy console/network
        if (process.env.NODE_ENV === 'development') return;
        const envToken = (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '').trim();
        if (envToken) {
          w.__MAPBOX_TOKEN = envToken;
          return;
        }

        // Avoid calling backend from protected routes (e.g., login/dashboard)
        const path = (w.location?.pathname || '').toLowerCase();
        const protectedPrefixes = [
          '/login', '/dashboard', '/editor', '/empresa', '/roles-usuarios', '/clientes',
          '/reservaciones', '/metodos-pago', '/colecciones', '/productos', '/paginas', '/politicas', '/dominios'
        ];
        if (protectedPrefixes.some(p => path.startsWith(p))) return;

        // Fallback: fetch safe public token (Mapbox pk.*) from backend (public site only)
        const apiUrl = getApiUrl();
        fetch(`${apiUrl}/company/1/public`)
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            const token = data?.geolocationPublicToken as string | undefined;
            if (token && token.startsWith('pk.')) {
              w.__MAPBOX_TOKEN = token;
            }
          })
          .catch(() => {/* silent: do not log on dev */});
      }
    } catch {/* ignore */}
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
