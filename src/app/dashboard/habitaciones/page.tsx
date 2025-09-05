'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import RoomsList from '@/components/habitaciones/RoomsList';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface Room {
  id: number;
  name: string;
  roomCode?: string;
  roomType?: string;
  basePrice: number;
  comparePrice?: number;
  maxOccupancy: number;
  floorNumber?: number;
  viewType?: string;
  squareMeters?: number;
  
  // NUEVOS - Ubicación
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  
  // NUEVO - Host
  hostId?: number;
  host?: any;
  
  // NUEVOS - Configuraciones JSON
  sleepingArrangements?: any;
  houseRules?: any;
  cancellationPolicy?: any;
  checkInInstructions?: any;
  safetyFeatures?: any;
  highlightFeatures?: any;
  additionalFees?: any;
  
  // NUEVOS - SEO
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  
  // NUEVOS - Estadísticas
  averageRating?: number;
  totalReviews?: number;
  responseRate?: number;
  responseTime?: string;
  
  isActive: boolean;
  images?: string[];
  tags?: string[];
  amenities?: string[];
  createdAt: string;
  updatedAt?: string;
}

export default function HabitacionesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5266/api/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las habitaciones');
      }

      const data = await response.json();
      setRooms(data);
      setError(null); // Limpiar error si todo salió bien
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'No se pudo conectar con el servidor. Por favor verifique su conexión.';
      setError(errorMessage);
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room: Room) => {
    router.push(`/dashboard/habitaciones/${room.id}/editar`);
  };

  const handleDelete = async (room: Room) => {
    const confirmMessage = `${t('rooms.confirmDelete', 'Are you sure you want to delete')} "${room.name}"?\n\n${t('rooms.deleteWarning', 'This action cannot be undone.')}`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5266/api/rooms/${room.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || 'Error al eliminar la habitación');
        return;
      }

      // Mostrar mensaje de éxito
      if (responseData.message) {
        // Crear un mensaje temporal de éxito
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg animate-slide-in';
        successDiv.textContent = responseData.message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
          successDiv.classList.add('animate-slide-out');
          setTimeout(() => document.body.removeChild(successDiv), 300);
        }, 3000);
      }

      await fetchRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la habitación');
    }
  };

  const handleToggleActive = async (room: Room) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = !room.isActive;
      
      const response = await fetch(`http://localhost:5266/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: newStatus
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || 'Error al actualizar el estado de la habitación');
        return;
      }

      // Mostrar mensaje de éxito
      const statusMessage = newStatus 
        ? `${t('rooms.activatedSuccess', 'Room activated successfully')} "${room.name}"`
        : `${t('rooms.deactivatedSuccess', 'Room deactivated successfully')} "${room.name}"`;
      
      // Crear un mensaje temporal
      const successDiv = document.createElement('div');
      successDiv.className = `fixed top-4 right-4 z-50 px-6 py-3 ${newStatus ? 'bg-green-500' : 'bg-yellow-500'} text-white rounded-lg shadow-lg animate-slide-in`;
      successDiv.textContent = statusMessage;
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        successDiv.classList.add('animate-slide-out');
        setTimeout(() => document.body.removeChild(successDiv), 300);
      }, 3000);

      await fetchRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado');
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.roomCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.roomType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterActive === 'all' ||
                          (filterActive === 'active' && room.isActive) ||
                          (filterActive === 'inactive' && !room.isActive);
    
    return matchesSearch && matchesFilter;
  });

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
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {t('navigation.habitaciones')}
          </li>
        </ol>
      </nav>

      {/* Mobile Title */}
      <div className="sm:hidden mb-4 px-4 pt-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('rooms.title')}
        </h1>
      </div>

      {/* Header con acciones */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('rooms.manage')}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('rooms.description')}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/habitaciones/nueva')}
              className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>{t('rooms.new')}</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('rooms.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterActive === 'all'
                    ? 'text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                style={filterActive === 'all' ? { backgroundColor: primaryColor } : {}}
              >
                {t('common.all')}
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterActive === 'active'
                    ? 'text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                style={filterActive === 'active' ? { backgroundColor: primaryColor } : {}}
              >
                {t('common.active')}
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterActive === 'inactive'
                    ? 'text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                style={filterActive === 'inactive' ? { backgroundColor: primaryColor } : {}}
              >
                {t('common.inactive')}
              </button>
            </div>
          </div>

          {/* Resumen */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">{t('rooms.total')}:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{rooms.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">{t('rooms.active')}:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {rooms.filter(r => r.isActive).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">{t('rooms.inactive')}:</span>
              <span className="font-semibold text-gray-600 dark:text-gray-400">
                {rooms.filter(r => !r.isActive).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de habitaciones */}
      <div className="px-4 sm:px-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }}></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t('common.errorOccurred')}
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    fetchRooms();
                  }}
                  className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                >
                  {t('common.tryAgain')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <RoomsList
            rooms={filteredRooms}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            primaryColor={primaryColor}
          />
        )}
      </div>
    </div>
  );
}