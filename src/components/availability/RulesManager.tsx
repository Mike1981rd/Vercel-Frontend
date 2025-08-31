'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Settings, Calendar, Clock, DollarSign, Trash2, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface RulesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  rooms: any[];
  isDark: boolean;
  primaryColor?: string;
}

interface Rule {
  id?: number;
  roomId?: number;
  roomName?: string;
  ruleType: string;
  ruleTypeLabel?: string;
  ruleConfig: any;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
}

export default function RulesManager({ isOpen, onClose, onSave, rooms, isDark }: RulesManagerProps) {
  const { t } = useI18n();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [showForm, setShowForm] = useState(false);

  const ruleTypes = [
    { value: 'min_nights', label: t('availability.rules.types.minNights', 'Minimum Nights'), icon: Clock },
    { value: 'max_nights', label: t('availability.rules.types.maxNights', 'Maximum Nights'), icon: Clock },
    { value: 'no_checkin_days', label: t('availability.rules.types.noCheckinDays', 'Check-in Restrictions'), icon: Calendar },
    { value: 'no_checkout_days', label: t('availability.rules.types.noCheckoutDays', 'Check-out Restrictions'), icon: Calendar },
    { value: 'advance_booking', label: t('availability.rules.types.advanceBooking', 'Advance Booking'), icon: Calendar },
    { value: 'seasonal_pricing', label: t('availability.rules.types.seasonalPricing', 'Seasonal Pricing'), icon: DollarSign },
  ];

  const daysOfWeek = [
    { value: 0, label: t('days.sunday', 'Sunday') },
    { value: 1, label: t('days.monday', 'Monday') },
    { value: 2, label: t('days.tuesday', 'Tuesday') },
    { value: 3, label: t('days.wednesday', 'Wednesday') },
    { value: 4, label: t('days.thursday', 'Thursday') },
    { value: 5, label: t('days.friday', 'Friday') },
    { value: 6, label: t('days.saturday', 'Saturday') },
  ];

  useEffect(() => {
    if (isOpen) {
      loadRules();
    }
  }, [isOpen]);

  const loadRules = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/availability/rules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Error loading rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (rule: Rule) => {
    try {
      await fetch(`/api/availability/rules/${rule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...rule,
          isActive: !rule.isActive
        })
      });
      await loadRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (confirm(t('availability.rules.confirmDelete', 'Are you sure you want to delete this rule?'))) {
      try {
        await fetch(`/api/availability/rules/${ruleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        await loadRules();
      } catch (error) {
        console.error('Error deleting rule:', error);
      }
    }
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setShowForm(true);
  };

  const handleCreateRule = () => {
    setEditingRule({
      ruleType: 'min_nights',
      ruleConfig: {},
      isActive: true,
      priority: rules.length + 1
    });
    setShowForm(true);
  };

  const handleSaveRule = async (rule: Rule) => {
    try {
      if (rule.id) {
        await fetch(`/api/availability/rules/${rule.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(rule)
        });
      } else {
        await fetch('/api/availability/rules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(rule)
        });
      }
      await loadRules();
      setShowForm(false);
      setEditingRule(null);
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const renderRuleConfig = (rule: Rule) => {
    switch (rule.ruleType) {
      case 'min_nights':
      case 'max_nights':
        return `${rule.ruleConfig.nights || 0} ${t('common.nights', 'nights')}`;
      case 'no_checkin_days':
      case 'no_checkout_days':
        const days = rule.ruleConfig.days || [];
        return days.map((d: number) => daysOfWeek.find(dw => dw.value === d)?.label).join(', ');
      case 'advance_booking':
        return `${rule.ruleConfig.maxDays || 0} ${t('common.days', 'days')}`;
      case 'seasonal_pricing':
        return `${rule.ruleConfig.adjustment || 0}%`;
      default:
        return JSON.stringify(rule.ruleConfig);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        
        <div className={`relative w-full max-w-4xl rounded-lg shadow-xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('availability.rules.title', 'Availability Rules')}
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

          <div className="p-6">
            {!showForm ? (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('availability.rules.description', 'Manage business rules for room availability and pricing')}
                  </p>
                  <button
                    onClick={handleCreateRule}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('availability.rules.addRule', 'Add Rule')}
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : rules.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('availability.rules.noRules', 'No rules configured')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rules.map((rule) => {
                      const ruleType = ruleTypes.find(rt => rt.value === rule.ruleType);
                      const Icon = ruleType?.icon || Settings;
                      
                      return (
                        <div
                          key={rule.id}
                          className={`p-4 rounded-lg border ${
                            rule.isActive
                              ? isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-white'
                              : isDark ? 'border-gray-700 bg-gray-800/50 opacity-60' : 'border-gray-200 bg-gray-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${
                                isDark ? 'bg-gray-600' : 'bg-gray-100'
                              }`}>
                                <Icon className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {rule.ruleTypeLabel || ruleType?.label}
                                  </h3>
                                  {rule.roomName && (
                                    <span className={`text-sm px-2 py-1 rounded-full ${
                                      isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                      {rule.roomName}
                                    </span>
                                  )}
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {t('availability.rules.priority', 'Priority')}: {rule.priority}
                                  </span>
                                </div>
                                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {renderRuleConfig(rule)}
                                </p>
                                {(rule.startDate || rule.endDate) && (
                                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {rule.startDate && `${t('common.from', 'From')} ${new Date(rule.startDate).toLocaleDateString()}`}
                                    {rule.startDate && rule.endDate && ' - '}
                                    {rule.endDate && `${t('common.to', 'To')} ${new Date(rule.endDate).toLocaleDateString()}`}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleRule(rule)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                }`}
                              >
                                {rule.isActive ? (
                                  <ToggleRight className="w-5 h-5 text-green-500" />
                                ) : (
                                  <ToggleLeft className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                )}
                              </button>
                              <button
                                onClick={() => handleEditRule(rule)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                }`}
                              >
                                <Edit2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                              </button>
                              <button
                                onClick={() => rule.id && handleDeleteRule(rule.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'
                                }`}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <RuleForm
                rule={editingRule!}
                rooms={rooms}
                isDark={isDark}
                onSave={handleSaveRule}
                onCancel={() => {
                  setShowForm(false);
                  setEditingRule(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RuleForm({ rule, rooms, isDark, onSave, onCancel }: any) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<Rule>({
    ...rule,
    ruleConfig: rule.ruleConfig || {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderConfigFields = () => {
    switch (formData.ruleType) {
      case 'min_nights':
      case 'max_nights':
        return (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('availability.rules.config.nights', 'Number of Nights')}
            </label>
            <input
              type="number"
              value={formData.ruleConfig.nights || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                ruleConfig: { ...prev.ruleConfig, nights: parseInt(e.target.value) }
              }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="1"
              required
            />
          </div>
        );

      case 'no_checkin_days':
      case 'no_checkout_days':
        return (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('availability.rules.config.days', 'Select Days')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map(day => (
                <label
                  key={day}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                    (formData.ruleConfig.days || []).includes(day)
                      ? isDark ? 'bg-blue-900/30' : 'bg-blue-50'
                      : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(formData.ruleConfig.days || []).includes(day)}
                    onChange={(e) => {
                      const days = formData.ruleConfig.days || [];
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          ruleConfig: { ...prev.ruleConfig, days: [...days, day] }
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          ruleConfig: { ...prev.ruleConfig, days: days.filter((d: number) => d !== day) }
                        }));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'advance_booking':
        return (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('availability.rules.config.maxDays', 'Maximum Days in Advance')}
            </label>
            <input
              type="number"
              value={formData.ruleConfig.maxDays || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                ruleConfig: { ...prev.ruleConfig, maxDays: parseInt(e.target.value) }
              }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="1"
              required
            />
          </div>
        );

      case 'seasonal_pricing':
        return (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('availability.rules.config.adjustment', 'Price Adjustment (%)')}
            </label>
            <input
              type="number"
              value={formData.ruleConfig.adjustment || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                ruleConfig: { ...prev.ruleConfig, adjustment: parseFloat(e.target.value) }
              }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              step="0.1"
              required
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {t('availability.rules.form.type', 'Rule Type')}
          </label>
          <select
            value={formData.ruleType}
            onChange={(e) => setFormData(prev => ({ ...prev, ruleType: e.target.value, ruleConfig: {} }))}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          >
            <option value="min_nights">{t('availability.rules.types.minNights', 'Minimum Nights')}</option>
            <option value="max_nights">{t('availability.rules.types.maxNights', 'Maximum Nights')}</option>
            <option value="no_checkin_days">{t('availability.rules.types.noCheckinDays', 'Check-in Restrictions')}</option>
            <option value="no_checkout_days">{t('availability.rules.types.noCheckoutDays', 'Check-out Restrictions')}</option>
            <option value="advance_booking">{t('availability.rules.types.advanceBooking', 'Advance Booking')}</option>
            <option value="seasonal_pricing">{t('availability.rules.types.seasonalPricing', 'Seasonal Pricing')}</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {t('availability.rules.form.room', 'Apply to Room')}
          </label>
          <select
            value={formData.roomId || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value ? parseInt(e.target.value) : undefined }))}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">{t('availability.rules.form.allRooms', 'All Rooms')}</option>
            {rooms.map((room: any) => (
              <option key={room.id} value={room.id}>
                {room.name} ({room.roomCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {renderConfigFields()}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {t('availability.rules.form.priority', 'Priority')}
          </label>
          <input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            min="1"
            required
          />
        </div>

        <div>
          <label className={`flex items-center gap-2 mt-8 cursor-pointer ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium">
              {t('availability.rules.form.active', 'Active')}
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {t('availability.rules.form.startDate', 'Start Date')} ({t('common.optional', 'Optional')})
          </label>
          <input
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {t('availability.rules.form.endDate', 'End Date')} ({t('common.optional', 'Optional')})
          </label>
          <input
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            min={formData.startDate || undefined}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
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
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          {formData.id ? t('common.update', 'Update') : t('common.create', 'Create')} {t('availability.rules.rule', 'Rule')}
        </button>
      </div>
    </form>
  );
}