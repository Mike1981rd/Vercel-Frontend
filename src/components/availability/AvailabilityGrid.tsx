'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';

interface AvailabilityGridProps {
  data: any;
  onDateClick: (roomId: number, date: Date) => void;
  onRefresh: () => void;
}

export default function AvailabilityGrid({ data, onDateClick, onRefresh }: AvailabilityGridProps) {
  const { t } = useI18n();
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ roomId: number; date: Date } | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (gridRef.current && !gridRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
        setEditingCell(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCellKey = (roomId: number, date: string) => `${roomId}_${date}`;

  const getCellData = (roomId: number, date: Date) => {
    const key = getCellKey(roomId, formatDate(date));
    return data.availability[key];
  };

  const getCellColor = (cellData: any) => {
    if (!cellData) return 'bg-white dark:bg-gray-700';
    
    if (cellData.hasReservation) {
      if (cellData.isCheckIn) return 'bg-green-50 border-l-4 border-l-green-500 dark:bg-green-900/30';
      if (cellData.isCheckOut) return 'bg-orange-50 border-r-4 border-r-orange-500 dark:bg-orange-900/30';
      return 'bg-blue-50 dark:bg-blue-900/30';
    }
    
    if (cellData.isBlocked) return 'bg-red-50 dark:bg-red-900/30';
    if (!cellData.isAvailable) return 'bg-gray-100 dark:bg-gray-800';
    if (cellData.customPrice) return 'bg-purple-50 dark:bg-purple-900/30';
    
    return 'bg-white hover:bg-green-50 dark:bg-gray-700 dark:hover:bg-gray-600';
  };

  const handleCellClick = (roomId: number, date: Date, event: React.MouseEvent) => {
    const cellKey = getCellKey(roomId, formatDate(date));
    
    if (event.shiftKey && selectionStart) {
      selectRange(selectionStart.roomId, selectionStart.date, roomId, date);
    } else if (event.ctrlKey || event.metaKey) {
      const newSelection = new Set(selectedCells);
      if (newSelection.has(cellKey)) {
        newSelection.delete(cellKey);
      } else {
        newSelection.add(cellKey);
      }
      setSelectedCells(newSelection);
      setSelectionStart({ roomId, date });
    } else {
      setSelectedCells(new Set([cellKey]));
      setSelectionStart({ roomId, date });
      onDateClick(roomId, date);
    }
  };

  const handleCellRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (selectedCells.size > 0) {
      setContextMenuPosition({ x: event.clientX, y: event.clientY });
      setShowContextMenu(true);
    }
  };

  const handleCellDoubleClick = (roomId: number, date: Date) => {
    const cellKey = getCellKey(roomId, formatDate(date));
    const cellData = getCellData(roomId, date);
    
    if (!cellData?.hasReservation && !cellData?.isBlocked) {
      setEditingCell(cellKey);
      setEditValue(cellData?.customPrice?.toString() || '');
    }
  };

  const selectRange = (startRoomId: number, startDate: Date, endRoomId: number, endDate: Date) => {
    const newSelection = new Set<string>();
    const roomIds = data.rooms.map((r: any) => r.id);
    const startRoomIndex = roomIds.indexOf(startRoomId);
    const endRoomIndex = roomIds.indexOf(endRoomId);
    const minRoomIndex = Math.min(startRoomIndex, endRoomIndex);
    const maxRoomIndex = Math.max(startRoomIndex, endRoomIndex);
    
    const startDateIndex = data.dates.findIndex((d: Date) => 
      formatDate(d) === formatDate(startDate)
    );
    const endDateIndex = data.dates.findIndex((d: Date) => 
      formatDate(d) === formatDate(endDate)
    );
    const minDateIndex = Math.min(startDateIndex, endDateIndex);
    const maxDateIndex = Math.max(startDateIndex, endDateIndex);
    
    for (let roomIdx = minRoomIndex; roomIdx <= maxRoomIndex; roomIdx++) {
      for (let dateIdx = minDateIndex; dateIdx <= maxDateIndex; dateIdx++) {
        const roomId = roomIds[roomIdx];
        const date = data.dates[dateIdx];
        newSelection.add(getCellKey(roomId, formatDate(date)));
      }
    }
    
    setSelectedCells(newSelection);
  };

  const handleBulkUpdate = async (action: string) => {
    setShowContextMenu(false);
    
    const selectedData = Array.from(selectedCells).map(key => {
      const [roomId, date] = key.split('_');
      return { roomId: Number(roomId), date };
    });
    
    const roomIds = [...new Set(selectedData.map(d => d.roomId))];
    const dates = [...new Set(selectedData.map(d => d.date))].sort();
    
    try {
      switch (action) {
        case 'block':
          await fetch('/api/availability/bulk-update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              roomIds,
              startDate: dates[0],
              endDate: dates[dates.length - 1],
              isAvailable: false
            })
          });
          break;
        case 'unblock':
          await fetch('/api/availability/bulk-update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              roomIds,
              startDate: dates[0],
              endDate: dates[dates.length - 1],
              isAvailable: true
            })
          });
          break;
        case 'setPrice':
          const price = prompt(t('availability.enterPrice', 'Enter custom price:'));
          if (price) {
            await fetch('/api/availability/bulk-update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                roomIds,
                startDate: dates[0],
                endDate: dates[dates.length - 1],
                customPrice: parseFloat(price)
              })
            });
          }
          break;
        case 'setMinNights':
          const minNights = prompt(t('availability.enterMinNights', 'Enter minimum nights:'));
          if (minNights) {
            await fetch('/api/availability/bulk-update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                roomIds,
                startDate: dates[0],
                endDate: dates[dates.length - 1],
                minNights: parseInt(minNights)
              })
            });
          }
          break;
      }
      
      setSelectedCells(new Set());
      onRefresh();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (editingCell && editValue) {
      const [roomId, date] = editingCell.split('_');
      
      try {
        await fetch(`/api/availability/room/${roomId}/date/${date}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            isAvailable: true,
            customPrice: parseFloat(editValue)
          })
        });
        
        setEditingCell(null);
        setEditValue('');
        onRefresh();
      } catch (error) {
        console.error('Error updating price:', error);
      }
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(0)}`;
  };

  if (!data || !data.dates || !data.rooms) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        No availability data available
      </div>
    );
  }

  // Dividir las fechas en semanas para mostrar un calendario más compacto
  const getWeeks = () => {
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];
    
    data.dates.forEach((date: Date | string, index: number) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      currentWeek.push(dateObj);
      
      if (dateObj.getDay() === 0 || index === data.dates.length - 1) {
        // Completar la semana con días vacíos si es necesario
        while (currentWeek.length < 7 && index === data.dates.length - 1) {
          currentWeek.push(null);
        }
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    return weeks;
  };

  const weeks = getWeeks();
  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Filtrar habitaciones basado en búsqueda y selección
  const filteredRooms = data.rooms.filter((room: any) => {
    if (selectedRoomId) {
      return room.id === selectedRoomId;
    }
    if (searchTerm) {
      return room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             room.roomCode.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div ref={gridRef} className="relative">
      {/* Selector de habitación y búsqueda */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seleccionar Habitación
            </label>
            <select
              value={selectedRoomId || ''}
              onChange={(e) => setSelectedRoomId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las habitaciones ({data.rooms.length})</option>
              {data.rooms.map((room: any) => (
                <option key={room.id} value={room.id}>
                  {room.name} - {room.roomCode} (${room.basePrice}/noche)
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar Habitación
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedRoomId(null); // Limpiar selección al buscar
              }}
              placeholder="Buscar por nombre o código..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {(selectedRoomId || searchTerm) && (
            <button
              onClick={() => {
                setSelectedRoomId(null);
                setSearchTerm('');
              }}
              className="mt-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
        
        {filteredRooms.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              No se encontraron habitaciones con los criterios de búsqueda.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {filteredRooms.map((room: any) => (
          <div key={room.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{room.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {room.roomCode} • ${room.basePrice}/noche • Capacidad: {room.maxOccupancy} personas
              </p>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {/* Encabezados de días */}
                {daysOfWeek.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 pb-2">
                    {day}
                  </div>
                ))}
                
                {/* Días del calendario */}
                {weeks.map((week, weekIndex) => (
                  week.map((date: Date | null, dayIndex: number) => {
                    if (!date) {
                      return <div key={`empty-${weekIndex}-${dayIndex}`} className="aspect-square" />;
                    }
                    
                    const cellData = getCellData(room.id, date);
                    const cellKey = getCellKey(room.id, formatDate(date));
                    const isSelected = selectedCells.has(cellKey);
                    const isEditing = editingCell === cellKey;
                    const isToday = formatDate(date) === formatDate(new Date());
                    const dayOfMonth = date.getDate();
                    
                    return (
                      <div
                        key={cellKey}
                        className={`
                          aspect-square border border-gray-200 dark:border-gray-700 rounded-lg p-1
                          cursor-pointer transition-all relative overflow-hidden
                          ${getCellColor(cellData)}
                          ${isSelected ? 'ring-2 ring-blue-500' : ''}
                          ${isToday ? 'ring-2 ring-yellow-500' : ''}
                        `}
                        onClick={(e) => handleCellClick(room.id, date, e)}
                        onContextMenu={handleCellRightClick}
                        onDoubleClick={() => handleCellDoubleClick(room.id, date)}
                      >
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {dayOfMonth}
                        </div>
                        
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') {
                                setEditingCell(null);
                                setEditValue('');
                              }
                            }}
                            className="w-full text-xs bg-white text-gray-900 dark:bg-gray-700 dark:text-white rounded px-1"
                            autoFocus
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[calc(100%-20px)]">
                            {cellData?.hasReservation && (
                              <div className="bg-blue-600 text-white rounded px-1 py-0.5">
                                <div className="text-[9px] font-semibold text-center truncate max-w-[55px]" title={cellData.guestName}>
                                  {cellData.guestName}
                                </div>
                              </div>
                            )}
                            {cellData?.customPrice && !cellData?.hasReservation && (
                              <div className="text-xs font-bold text-purple-700 dark:text-purple-400">
                                ${cellData.customPrice}
                              </div>
                            )}
                            {cellData?.isBlocked && !cellData?.hasReservation && (
                              <div className="text-red-600 dark:text-red-400">
                                🚫
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {showContextMenu && (
        <div
          className="fixed z-50 rounded-lg shadow-xl border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <div className="py-1">
            <button
              onClick={() => handleBulkUpdate('block')}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              {t('availability.actions.block', 'Block Selected')}
            </button>
            <button
              onClick={() => handleBulkUpdate('unblock')}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              {t('availability.actions.unblock', 'Unblock Selected')}
            </button>
            <button
              onClick={() => handleBulkUpdate('setPrice')}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              {t('availability.actions.setPrice', 'Set Custom Price')}
            </button>
            <button
              onClick={() => handleBulkUpdate('setMinNights')}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              {t('availability.actions.setMinNights', 'Set Min Nights')}
            </button>
          </div>
        </div>
      )}
      
      {/* Leyenda mejorada */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Leyenda de Estados</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white border-2 border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded"></div>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Disponible</p>
              <p className="text-xs text-gray-500">Para reservar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-12 h-8 bg-blue-50 dark:bg-blue-900/30 rounded flex items-center justify-center">
              <div className="bg-blue-600 text-white rounded px-1 py-0.5">
                <span className="text-[9px] font-semibold">Juan Pérez</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Reservado</p>
              <p className="text-xs text-gray-500">Con huésped</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-50 dark:bg-red-900/30 rounded flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400">🚫</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Bloqueado</p>
              <p className="text-xs text-gray-500">No disponible</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400">$$$</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Precio Especial</p>
              <p className="text-xs text-gray-500">Tarifa custom</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-50 border-l-4 border-l-green-500 dark:bg-green-900/30 rounded"></div>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Check-in</p>
              <p className="text-xs text-gray-500">Entrada hoy</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-50 border-r-4 border-r-orange-500 dark:bg-orange-900/30 rounded"></div>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Check-out</p>
              <p className="text-xs text-gray-500">Salida hoy</p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Nota:</strong> El nombre completo del huésped se muestra en cada reservación. 
            Si el nombre es muy largo, se trunca para mantener el diseño limpio.
          </p>
        </div>
      </div>
    </div>
  );
}