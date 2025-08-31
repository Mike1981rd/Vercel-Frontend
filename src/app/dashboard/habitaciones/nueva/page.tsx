'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import RoomForm from '@/components/habitaciones/RoomForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NuevaHabitacionPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  const handleSave = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5266/api/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Lanzar el error con el objeto completo para mejor manejo
        throw new Error(JSON.stringify(responseData));
      }

      // Mostrar mensaje de éxito
      if (responseData.message) {
        // Usar el contexto de toast si está disponible
        const event = new CustomEvent('showToast', {
          detail: { message: responseData.message, type: 'success' }
        });
        window.dispatchEvent(event);
      }

      // Pequeño delay para que el usuario vea el mensaje
      setTimeout(() => {
        router.push('/dashboard/habitaciones');
      }, 500);
      
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs - Desktop */}
      <nav className="hidden sm:flex mb-4 text-sm px-6 pt-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('navigation.dashboard')}
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li>
            <Link href="/dashboard/habitaciones" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('navigation.habitaciones')}
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {t('rooms.new')}
          </li>
        </ol>
      </nav>

      {/* Mobile Header */}
      <div className="sm:hidden mb-4 px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>{t('common.back')}</span>
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('rooms.new')}
        </h1>
      </div>

      {/* Contenido */}
      <div className="px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-4 sm:p-6 border-b dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('rooms.createNew')}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('rooms.createDescription')}
            </p>
          </div>
          
          <RoomForm
            onSave={handleSave}
            onCancel={() => router.push('/dashboard/habitaciones')}
            primaryColor={primaryColor}
          />
        </div>
      </div>
    </div>
  );
}