'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { policiesApi, Policy, UpdatePolicyDto } from '@/lib/api/policies';
import { useI18n } from '@/contexts/I18nContext';
import { ArrowLeft, Save } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import of RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import('@/components/paginas/RichTextEditor'),
  { ssr: false }
);

export default function EditPolicyPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const policyType = params.type as string;
  
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [formData, setFormData] = useState<UpdatePolicyDto>({
    title: '',
    content: '',
    isRequired: false,
    isActive: true
  });

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  useEffect(() => {
    if (policyType) {
      fetchPolicy();
    }
  }, [policyType]);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const data = await policiesApi.getByType(policyType);
      setPolicy(data);
      setFormData({
        title: data.title,
        content: data.content,
        isRequired: data.isRequired,
        isActive: data.isActive
      });
    } catch (error) {
      console.error('Error fetching policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await policiesApi.update(policyType, formData);
      router.push('/dashboard/politicas');
    } catch (error) {
      console.error('Error saving policy:', error);
      alert(t('policies.saveError', 'Error al guardar la política'));
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">
          {t('policies.notFound', 'Política no encontrada')}
        </p>
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
          <li>
            <Link href="/dashboard/politicas" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('policies.title', 'Políticas')}
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {formData.title}
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {formData.title}
          </h1>
        </div>

        {/* Info Box */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('policies.templateInfo', 'Las plantillas no son asesoramiento legal. Al usar las plantillas de políticas, aceptas que has leído y estás de acuerdo con el')}
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

        {/* Title Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('policies.titleLabel', 'Título de la política')}
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all"
            style={{ '--tw-ring-color': primaryColor } as any}
          />
        </div>

        {/* Rich Text Editor */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <RichTextEditor
            value={formData.content}
            onChange={handleContentChange}
          />
        </div>

        {/* Options */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('policies.options', 'Opciones')}
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                style={{ accentColor: primaryColor }}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('policies.isRequired', 'Esta política es obligatoria')}
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                style={{ accentColor: primaryColor }}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('policies.isActive', 'Esta política está activa')}
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard/politicas')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back', 'Volver')}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            style={{ backgroundColor: primaryColor }}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                {t('common.saving', 'Guardando...')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('common.save', 'Guardar')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}