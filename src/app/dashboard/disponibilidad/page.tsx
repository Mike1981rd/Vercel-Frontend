'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, Settings, TrendingUp, Users, DollarSign, 
  Home, Clock, Download, Check, Search, ChevronDown
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';
import ProfessionalCalendarMinimal from '@/components/availability/ProfessionalCalendarMinimal';
import BlockPeriodModal from '@/components/availability/BlockPeriodModal';
import RulesManager from '@/components/availability/RulesManager';

interface Room {
  id: number;
  name: string;
  roomCode: string;
  roomType: string;
  basePrice: number;
  maxOccupancy: number;
  floorNumber: number;
}

interface Stats {
  totalRooms: number;
  availableToday: number;
  occupancyRate: number;
  projectedRevenue: number;
  checkInsToday: number;
  checkOutsToday: number;
}

export default function AvailabilityDashboard() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [availabilityData, setAvailabilityData] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  // Inicializar con agosto 2025 para que coincida con los datos de prueba
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)); // Agosto 2025
  const [viewType, setViewType] = useState<'grid' | 'list' | 'calendar'>('calendar');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchRoom, setSearchRoom] = useState('');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [activeSettingView, setActiveSettingView] = useState<string | null>(null);
  const [blockPeriodModalOpen, setBlockPeriodModalOpen] = useState(false);
  const [rulesManagerOpen, setRulesManagerOpen] = useState(false);
  const [viewBlockPeriodsOpen, setViewBlockPeriodsOpen] = useState(false);
  const [blockPeriods, setBlockPeriods] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [currentDate, selectedRoom]); // Recargar cuando cambie la habitación seleccionada

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getStartOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getEndOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const startDate = getStartOfMonth(currentDate);
      const endDate = getEndOfMonth(currentDate);

      // Cargar habitaciones primero
      const roomsResponse = await fetch(getApiEndpoint('/rooms'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const roomsData = await roomsResponse.json();
      console.log('Habitaciones cargadas:', roomsData); // Debug
      console.log('Estructura de una habitación:', roomsData[0]); // Ver estructura completa
      setRooms(roomsData);
      
      // Si no hay habitación seleccionada y hay habitaciones disponibles, seleccionar la primera
      if (!selectedRoom && roomsData.length > 0) {
        setSelectedRoom(roomsData[0]);
      }

      // Cargar disponibilidad (con roomId si hay una habitación seleccionada)
      let availabilityUrl = getApiEndpoint(`/availability/grid?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`);
      if (selectedRoom) {
        availabilityUrl += `&roomId=${selectedRoom.id}`;
      }
      
      const availabilityResponse = await fetch(availabilityUrl, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const availabilityData = await availabilityResponse.json();
      console.log('Disponibilidad cargada:', availabilityData); // Debug
      
      // Debug más detallado
      if (availabilityData.availability) {
        const keys = Object.keys(availabilityData.availability);
        const firstKey = keys[0];
        if (firstKey) {
          console.log('Estructura de datos ejemplo:');
          console.log('Key:', firstKey);
          console.log('Data:', availabilityData.availability[firstKey]);
        }
      }
      
      setAvailabilityData(availabilityData);

      // Cargar estadísticas
      const statsResponse = await fetch(
        getApiEndpoint(`/availability/stats?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`),
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const statsData = await statsResponse.json();
      setStats(statsData);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeSelect = async (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate && selectedRoom) {
      console.log('Date range selected:', { startDate, endDate, room: selectedRoom });
      // Aquí puedes implementar la lógica para crear una reservación o bloqueo
    }
  };

  const handlePriceUpdate = async (date: Date, price: number) => {
    if (!selectedRoom) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        getApiEndpoint(`/availability/room/${selectedRoom.id}/date/${formatDate(date)}`),
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isAvailable: true,
            customPrice: price
          })
        }
      );

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const loadBlockPeriods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint('/availability/block-periods'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlockPeriods(data);
      }
    } catch (error) {
      console.error('Error loading block periods:', error);
    }
  };

  // Filtrar habitaciones para el dropdown basado en la búsqueda
  const filteredRoomsForDropdown = useMemo(() => {
    if (!searchRoom) return rooms;
    
    const searchLower = searchRoom.toLowerCase();
    return rooms.filter(room => 
      room.name?.toLowerCase().includes(searchLower) ||
      room.roomCode?.toLowerCase().includes(searchLower) ||
      room.roomType?.toLowerCase().includes(searchLower) ||
      room.basePrice?.toString().includes(searchLower)
    );
  }, [rooms, searchRoom]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Stats */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Disponibilidad de Habitaciones
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gestiona la disponibilidad, precios y reservaciones
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Botón de Nueva Reservación oculto
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />
                Nueva Reservación
              </button>
              */}
              <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button 
                type="button"
                onClick={() => setSettingsModalOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Configuración de disponibilidad"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Habitaciones Totales
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {stats?.totalRooms || 0}
                  </p>
                </div>
                <Home className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Disponibles Hoy
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                    {stats?.availableToday || 0}
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    Tasa de Ocupación
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                    {stats?.occupancyRate?.toFixed(1) || 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                    Check-ins Hoy
                  </p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">
                    {stats?.checkInsToday || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    Check-outs Hoy
                  </p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                    {stats?.checkOutsToday || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Ingresos Proyectados
                  </p>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mt-1">
                    ${stats?.projectedRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-indigo-500 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar with Room List - Hidden on mobile, shown on desktop */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              {/* Header con contador de habitaciones */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Habitaciones ({rooms.length})
                </h3>
                
                {/* SELECT2 CON BÚSQUEDA DINÁMICA */}
                <div className="relative" ref={dropdownRef}>
                  <div 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium cursor-pointer flex items-center justify-between hover:border-blue-500 transition-colors"
                  >
                    <span>
                      {selectedRoom 
                        ? `${selectedRoom.name} - ${selectedRoom.roomCode} - $${selectedRoom.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/noche`
                        : 'Selecciona una habitación'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {/* Dropdown con búsqueda */}
                  {dropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                      {/* Campo de búsqueda dentro del dropdown */}
                      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={searchRoom}
                            onChange={(e) => setSearchRoom(e.target.value)}
                            placeholder="Buscar habitación..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      
                      {/* Lista de opciones filtradas */}
                      <div className="max-h-60 overflow-y-auto">
                        {filteredRoomsForDropdown.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            No se encontraron habitaciones
                          </div>
                        ) : (
                          <>
                            {/* Opción para deseleccionar */}
                              <div
                                onClick={() => {
                                  setSelectedRoom(null);
                                  setDropdownOpen(false);
                                  setSearchRoom('');
                                }}
                                className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-600 dark:text-gray-400"
                              >
                                Ninguna habitación seleccionada
                              </div>
                            
                            {/* Lista de habitaciones */}
                            {filteredRoomsForDropdown.map(room => (
                              <div
                                key={room.id}
                                onClick={() => {
                                  setSelectedRoom(room);
                                  setDropdownOpen(false);
                                  setSearchRoom('');
                                }}
                                className={`px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between ${
                                  selectedRoom?.id === room.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                                }`}
                              >
                                <div>
                                  <span className="font-medium">{room.name}</span>
                                  <span className="mx-2 text-gray-500">•</span>
                                  <span className="text-gray-600 dark:text-gray-400">{room.roomCode}</span>
                                  <span className="mx-2 text-gray-500">•</span>
                                  <span className="text-gray-600 dark:text-gray-400">{room.roomType}</span>
                                </div>
                                <span className="font-semibold">${room.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {rooms.map(room => (
                      <button
                        type="button"
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedRoom?.id === room.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{room.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {room.roomCode} • Piso {room.floorNumber}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">${room.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">/noche</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                            {room.roomType}
                          </span>
                          <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                            <Users className="inline w-3 h-3 mr-1" />
                            {room.maxOccupancy}
                          </span>
                        </div>
                      </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Calendar View */}
          <div className="flex-1">
            {selectedRoom ? (
              <ProfessionalCalendarMinimal
                roomId={selectedRoom.id}
                roomName={selectedRoom.name}
                basePrice={selectedRoom.basePrice}
                onDateRangeSelect={handleDateRangeSelect}
                onPriceUpdate={handlePriceUpdate}
                availabilityData={availabilityData}
                viewMode="availability"
                initialMonth={currentDate}
                onMonthChange={(month) => {
                  // If parent month differs, update and reload
                  if (
                    month.getFullYear() !== currentDate.getFullYear() ||
                    month.getMonth() !== currentDate.getMonth()
                  ) {
                    setCurrentDate(month);
                  }
                }}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No hay habitación seleccionada
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Usa el selector arriba o haz clic en una habitación de la lista para ver su calendario de disponibilidad
                  </p>
                  {rooms.length > 0 && (
                    <button
                      onClick={() => setSelectedRoom(rooms[0])}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Seleccionar primera habitación
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Configuración */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Configuración de Disponibilidad
                </h2>
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Actualización Masiva de Precios */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Actualización Masiva de Precios
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Actualiza los precios de múltiples habitaciones y fechas a la vez
                </p>
                <button type="button" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                  Configurar Precios
                </button>
              </div>

              {/* Períodos de Bloqueo */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Períodos de Bloqueo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Bloquea habitaciones por mantenimiento, renovación o temporadas cerradas
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSettingsModalOpen(false);
                      setBlockPeriodModalOpen(true);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                  >
                    Crear Bloqueo
                  </button>
                  <button 
                    onClick={async () => {
                      await loadBlockPeriods();
                      setSettingsModalOpen(false);
                      setViewBlockPeriodsOpen(true);
                    }}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm"
                  >
                    Ver Bloqueos
                  </button>
                </div>
              </div>

              {/* Reglas de Disponibilidad */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Reglas de Disponibilidad
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Configura mínimo de noches, días de check-in/out permitidos
                </p>
                <button 
                  onClick={() => {
                    setSettingsModalOpen(false);
                    setRulesManagerOpen(true);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                >
                  Configurar Reglas
                </button>
              </div>

              {/* Precios por Temporada */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Precios por Temporada
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Define precios especiales para temporadas altas, bajas y eventos especiales
                </p>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm">
                  Gestionar Temporadas
                </button>
              </div>

              {/* Estadísticas de Ocupación */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Estadísticas de Ocupación
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Visualiza reportes detallados de ocupación, ingresos y tendencias
                </p>
                <button type="button" className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm">
                  Ver Estadísticas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Períodos de Bloqueo */}
      <BlockPeriodModal
        isOpen={blockPeriodModalOpen}
        onClose={() => setBlockPeriodModalOpen(false)}
        onSave={() => {
          setBlockPeriodModalOpen(false);
          loadData(); // Recargar datos después de guardar
        }}
        rooms={rooms}
        isDark={false}
      />

      {/* Modal de Reglas de Disponibilidad */}
      <RulesManager
        isOpen={rulesManagerOpen}
        onClose={() => setRulesManagerOpen(false)}
        onSave={() => {
          setRulesManagerOpen(false);
          loadData(); // Recargar datos después de guardar
        }}
        rooms={rooms}
        isDark={false}
      />

      {/* Modal para Ver Bloqueos Existentes */}
      {viewBlockPeriodsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Períodos de Bloqueo Activos
                </h2>
                <button
                  type="button"
                  onClick={() => setViewBlockPeriodsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {blockPeriods.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No hay períodos de bloqueo activos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blockPeriods.map((period, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {period.reason || 'Sin razón especificada'}
                            </span>
                            {period.isActive && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                Activo
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>
                              <strong>Fechas:</strong> {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                            </p>
                            {period.roomId && (
                              <p>
                                <strong>Habitación:</strong> {rooms.find(r => r.id === period.roomId)?.name || `ID: ${period.roomId}`}
                              </p>
                            )}
                            {!period.roomId && (
                              <p className="text-yellow-600">
                                <strong>Aplica a:</strong> Todas las habitaciones
                              </p>
                            )}
                            {period.notes && (
                              <p>
                                <strong>Notas:</strong> {period.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            type="button"
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-600"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setViewBlockPeriodsOpen(false);
                    setBlockPeriodModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                >
                  Crear Nuevo Bloqueo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
