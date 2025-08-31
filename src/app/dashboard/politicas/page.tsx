'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { policiesApi, Policy } from '@/lib/api/policies';
import { useI18n } from '@/contexts/I18nContext';
import { ChevronRight } from 'lucide-react';

export default function PoliticasPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const data = await policiesApi.getAll();
      setPolicies(data);
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePolicyClick = (type: string) => {
    router.push(`/dashboard/politicas/${type}/edit`);
  };

  const getPolicyIcon = (type: string) => {
    switch (type) {
      case 'returns': return '📦';
      case 'privacy': return '🔒';
      case 'terms': return '📄';
      case 'shipping': return '🚚';
      case 'contact': return '📧';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <nav className="bg-white dark:bg-gray-800 px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('navigation.dashboard', 'Inicio')}
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {t('policies.title', 'Políticas')}
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('policies.written', 'Políticas escritas')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('policies.description', 'Las políticas están enlazadas en el pie de página del proceso de pago y puedes agregarlas a tu')}
          </p>
        </div>

        {/* Policies List */}
        <div className="space-y-4">
          {policies.map((policy) => (
            <div
              key={policy.id}
              onClick={() => handlePolicyClick(policy.type)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{getPolicyIcon(policy.type)}</span>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {policy.title}
                    </h3>
                    {policy.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {policy.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {policy.isRequired && (
                    <span className="px-3 py-1 text-xs font-semibold text-white rounded-full" 
                          style={{ backgroundColor: primaryColor }}>
                      {t('policies.required', 'OBLIGATORIA')}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('policies.info', 'Las plantillas no son asesoramiento legal. Al usar las plantillas de políticas, aceptas que has leído y estás de acuerdo con el')}
                <button 
                  onClick={(e) => e.preventDefault()} 
                  className="underline ml-1 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  {t('policies.disclaimer', 'descargo de responsabilidad')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}