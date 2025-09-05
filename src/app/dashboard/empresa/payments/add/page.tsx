'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Search } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { paymentService } from '@/lib/api/payment.service';
import Image from 'next/image';

interface AvailableProvider {
  provider: string;
  name: string;
  logo: string;
  description: string;
  transactionFee: number;
  accentColor: string;
}

const providerDetails: Record<string, { logo: string; accentColor: string }> = {
  azul: {
    logo: '/payment-providers/azul.png',
    accentColor: '#0066CC'
  },
  cardnet: {
    logo: '/payment-providers/cardnet.png',
    accentColor: '#E84855'
  },
  portal: {
    logo: '/payment-providers/portal.png',
    accentColor: '#7C3AED'
  },
  stripe: {
    logo: '/payment-providers/stripe.png',
    accentColor: '#635BFF'
  },
  paypal: {
    logo: '/payment-providers/paypal.png',
    accentColor: '#003087'
  }
};

export default function AddPaymentProviderPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [providers, setProviders] = useState<AvailableProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableProviders();
  }, []);

  const loadAvailableProviders = async () => {
    try {
      const response = await paymentService.getAvailableProviders();
      const providersWithDetails = response.map(p => ({
        ...p,
        description: p.description || '',
        ...providerDetails[p.provider] || {
          logo: '/payment-providers/default.png',
          accentColor: '#6B7280'
        }
      }));
      setProviders(providersWithDetails);
    } catch (error) {
      console.error('Error loading available providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Spacer for navbar */}
      <div className="h-16" />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/empresa/payments')}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Agregar Proveedor de Pago
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Seleccione un proveedor para configurar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar proveedores..."
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-12 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Providers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'No se encontraron proveedores' : 'No hay proveedores disponibles'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.provider}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative cursor-pointer"
                onClick={() => router.push(`/empresa/payments/configure/${provider.provider}`)}
              >
                {/* Card Glow Effect */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-30"
                  style={{
                    background: `linear-gradient(135deg, ${provider.accentColor}40, transparent)`
                  }}
                />

                {/* Card Content */}
                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-6 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600">
                  {/* Provider Logo */}
                  <div className="mb-4">
                    <div className="relative h-16 w-32">
                      <Image
                        src={provider.logo}
                        alt={provider.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 128px, (max-width: 768px) 128px, 128px"
                      />
                    </div>
                  </div>

                  {/* Provider Info */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {provider.name}
                  </h3>
                  
                  {provider.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {provider.description}
                    </p>
                  )}

                  {/* Transaction Fee */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Comisión</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {provider.transactionFee}%
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>

                  {/* Hover Accent Line */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                    style={{ backgroundColor: provider.accentColor }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}