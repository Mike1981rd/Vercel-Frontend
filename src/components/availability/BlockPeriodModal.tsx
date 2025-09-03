'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Repeat } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface BlockPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  rooms: any[];
  isDark: boolean;
  primaryColor?: string;
  editingPeriod?: any;
}

export default function BlockPeriodModal({ 
  isOpen, 
  onClose, 
  onSave, 
  rooms, 
  isDark,
  editingPeriod 
}: BlockPeriodModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    roomIds: [] as number[],
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date()),
    reason: '',
    notes: '',
    isRecurring: false,
    recurrencePattern: 'weekly'
  });

  useEffect(() => {
    if (editingPeriod) {
      setFormData({
        roomIds: editingPeriod.roomIds || [],
        startDate: formatDate(new Date(editingPeriod.startDate)),
        endDate: formatDate(new Date(editingPeriod.endDate)),
        reason: editingPeriod.reason,
        notes: editingPeriod.notes || '',
        isRecurring: editingPeriod.isRecurring,
        recurrencePattern: editingPeriod.recurrencePattern || 'weekly'
      });
    }
  }, [editingPeriod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = 'http://localhost:5266/api';
      
      if (editingPeriod) {
        const response = await fetch(`${apiUrl}/availability/block-periods/${editingPeriod.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Error updating block period:', error);
          throw new Error('Failed to update block period');
        }
      } else {
        const response = await fetch(`${apiUrl}/availability/block-periods`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Error creating block period:', error);
          throw new Error('Failed to create block period');
        }
      }
      onSave();
    } catch (error) {
      console.error('Error saving block period:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRoom = (roomId: number) => {
    setFormData(prev => ({
      ...prev,
      roomIds: prev.roomIds.includes(roomId)
        ? prev.roomIds.filter(id => id !== roomId)
        : [...prev.roomIds, roomId]
    }));
  };

  const selectAllRooms = () => {
    setFormData(prev => ({
      ...prev,
      roomIds: rooms.map(r => r.id)
    }));
  };

  const clearAllRooms = () => {
    setFormData(prev => ({
      ...prev,
      roomIds: []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        
        <div className={`relative w-full max-w-2xl rounded-lg shadow-xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingPeriod 
                  ? t('availability.blockPeriod.edit', 'Edit Block Period')
                  : t('availability.blockPeriod.create', 'Create Block Period')
                }
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('availability.blockPeriod.rooms', 'Select Rooms')}
              </label>
              <div className="space-y-2">
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={selectAllRooms}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('common.selectAll', 'Select All')}
                  </button>
                  <button
                    type="button"
                    onClick={clearAllRooms}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('common.clearAll', 'Clear All')}
                  </button>
                </div>
                <div className={`grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-lg border ${
                  isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  {rooms.map(room => (
                    <label
                      key={room.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        formData.roomIds.includes(room.id)
                          ? isDark ? 'bg-blue-900/30' : 'bg-blue-50'
                          : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.roomIds.includes(room.id)}
                        onChange={() => toggleRoom(room.id)}
                        className="rounded border-gray-300"
                      />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {room.name} ({room.roomCode})
                      </span>
                    </label>
                  ))}
                </div>
                {formData.roomIds.length === 0 && (
                  <p className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {t('availability.blockPeriod.allRoomsWarning', 'No rooms selected - will apply to all rooms')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t('availability.blockPeriod.startDate', 'Start Date')}
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t('availability.blockPeriod.endDate', 'End Date')}
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  min={formData.startDate}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('availability.blockPeriod.reason', 'Reason')}
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              >
                <option value="">{t('common.select', 'Select...')}</option>
                <option value="maintenance">{t('availability.blockPeriod.reasons.maintenance', 'Maintenance')}</option>
                <option value="renovation">{t('availability.blockPeriod.reasons.renovation', 'Renovation')}</option>
                <option value="private_use">{t('availability.blockPeriod.reasons.privateUse', 'Private Use')}</option>
                <option value="seasonal">{t('availability.blockPeriod.reasons.seasonal', 'Seasonal Closure')}</option>
                <option value="other">{t('availability.blockPeriod.reasons.other', 'Other')}</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('availability.blockPeriod.notes', 'Notes')} ({t('common.optional', 'Optional')})
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder={t('availability.blockPeriod.notesPlaceholder', 'Additional details...')}
              />
            </div>

            <div>
              <label className={`flex items-center gap-2 cursor-pointer ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Repeat className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t('availability.blockPeriod.recurring', 'Recurring Block')}
                </span>
              </label>

              {formData.isRecurring && (
                <div className="mt-3">
                  <select
                    value={formData.recurrencePattern}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrencePattern: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="weekly">{t('availability.blockPeriod.recurrence.weekly', 'Weekly')}</option>
                    <option value="monthly">{t('availability.blockPeriod.recurrence.monthly', 'Monthly')}</option>
                    <option value="yearly">{t('availability.blockPeriod.recurrence.yearly', 'Yearly')}</option>
                  </select>
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'
            }`}>
              <AlertCircle className={`w-5 h-5 mt-0.5 ${
                isDark ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
              <div className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                <p className="font-medium mb-1">
                  {t('availability.blockPeriod.warning.title', 'Important')}
                </p>
                <p>
                  {t('availability.blockPeriod.warning.message', 
                    'Blocking periods will prevent new reservations. Existing reservations will not be affected.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  loading
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                } ${
                  isDark
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {loading 
                  ? t('common.saving', 'Saving...') 
                  : editingPeriod
                  ? t('common.update', 'Update')
                  : t('availability.blockPeriod.create', 'Create Block Period')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}