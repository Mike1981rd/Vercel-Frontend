'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TagIcon,
  Squares2X2Icon,
  MapPinIcon
} from '@heroicons/react/24/outline';

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
  isActive: boolean;
  images?: string[];
  tags?: string[];
  amenities?: string[];
  createdAt: string;
  updatedAt?: string;
}

interface RoomsListProps {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onToggleActive: (room: Room) => void;
  primaryColor: string;
}

export default function RoomsList({
  rooms,
  onEdit,
  onDelete,
  onToggleActive,
  primaryColor
}: RoomsListProps) {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(price);
  };

  if (rooms.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
        <HomeIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('rooms.empty', 'No hay habitaciones')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {t('rooms.emptyDescription', 'Comienza agregando tu primera habitación')}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Toggle Vista */}
      <div className="flex justify-end mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
            style={viewMode === 'grid' ? { backgroundColor: primaryColor } : {}}
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
            style={viewMode === 'list' ? { backgroundColor: primaryColor } : {}}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        /* Vista Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div
              key={room.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Imagen */}
              <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                {room.images && room.images[0] ? (
                  <img
                    src={room.images[0]}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <HomeIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                {/* Badge de estado */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    room.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {room.isActive ? t('common.active', 'Activa') : t('common.inactive', 'Inactiva')}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {room.name}
                    </h3>
                    {room.roomCode && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {room.roomCode}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {room.comparePrice && (
                      <p className="text-sm text-gray-500 line-through dark:text-gray-400">
                        {formatPrice(room.comparePrice)}
                      </p>
                    )}
                    <p className="text-lg font-bold" style={{ color: primaryColor }}>
                      {formatPrice(room.basePrice)}
                    </p>
                  </div>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <UsersIcon className="h-4 w-4" />
                    <span>{room.maxOccupancy} {t('rooms.guests', 'personas')}</span>
                  </div>
                  {room.roomType && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <TagIcon className="h-4 w-4" />
                      <span>{room.roomType}</span>
                    </div>
                  )}
                  {room.floorNumber && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{t('rooms.floor', 'Piso')} {room.floorNumber}</span>
                    </div>
                  )}
                  {room.squareMeters && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Squares2X2Icon className="h-4 w-4" />
                      <span>{room.squareMeters} m²</span>
                    </div>
                  )}
                </div>

                {/* Amenidades */}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          +{room.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-3 border-t dark:border-gray-700">
                  <button
                    onClick={() => onEdit(room)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>{t('common.edit', 'Editar')}</span>
                  </button>
                  <button
                    onClick={() => onToggleActive(room)}
                    className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {room.isActive ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(room)}
                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vista Lista (Tabla) */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('rooms.room', 'Habitación')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('rooms.type', 'Tipo')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('rooms.capacity', 'Capacidad')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('rooms.price', 'Precio')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('common.status', 'Estado')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('common.actions', 'Acciones')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {rooms.map(room => (
                  <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {room.name}
                        </div>
                        {room.roomCode && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {room.roomCode}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {room.roomType || '-'}
                      </div>
                      {room.viewType && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {room.viewType}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {room.maxOccupancy} {t('rooms.guests', 'personas')}
                      </div>
                      {room.squareMeters && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {room.squareMeters} m²
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {room.comparePrice && (
                          <div className="text-xs text-gray-500 line-through dark:text-gray-400">
                            {formatPrice(room.comparePrice)}
                          </div>
                        )}
                        <div className="text-sm font-medium" style={{ color: primaryColor }}>
                          {formatPrice(room.basePrice)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        room.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {room.isActive ? t('common.active', 'Activa') : t('common.inactive', 'Inactiva')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(room)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onToggleActive(room)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          {room.isActive ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => onDelete(room)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}