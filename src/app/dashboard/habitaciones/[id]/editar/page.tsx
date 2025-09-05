'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';
import RoomForm from '@/components/habitaciones/RoomForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function EditarHabitacionPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint(`/rooms/${roomId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar la habitación');
      }

      const data = await response.json();
      console.log('🏨 LOADED ROOM DATA:', data);
      console.log('📋 Room amenities:', data.amenities);
      setRoom(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint(`/rooms/${roomId}`), {
        method: 'PUT',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => router.push('/dashboard/habitaciones')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

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
            {t('rooms.edit')}
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
          {t('rooms.edit')}
        </h1>
      </div>

      {/* Contenido */}
      <div className="px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-4 sm:p-6 border-b dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('rooms.editTitle')}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('rooms.editDescription')}
            </p>
          </div>
          
          <RoomForm
            initialData={room}
            onSave={handleSave}
            onCancel={() => router.push('/dashboard/habitaciones')}
            primaryColor={primaryColor}
          />
        </div>
      </div>
    </div>
  );
}
