'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Edit2, Trash2, Plus, MoreVertical, Globe, Home, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { ShippingZone, ShippingRate } from '../ShippingConfiguration';
import { EditRateInline } from './EditRateInline';

interface ShippingZoneCardProps {
  zone: ShippingZone;
  primaryColor: string;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateZone: (updates: Partial<ShippingZone>) => void;
  onAddRate: () => void;
  onUpdateRate: (rateId: string, updates: Partial<ShippingRate>) => void;
  onDeleteRate: (rateId: string) => void;
}

export function ShippingZoneCard({
  zone,
  primaryColor,
  isEditing,
  onEdit,
  onDelete,
  onUpdateZone,
  onAddRate,
  onUpdateRate,
  onDeleteRate
}: ShippingZoneCardProps) {
  const { t } = useI18n();
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editingZoneName, setEditingZoneName] = useState(zone.name);
  const [showRateActions, setShowRateActions] = useState<string | null>(null);

  const handleSaveZoneName = () => {
    onUpdateZone({ name: editingZoneName });
    onEdit(); // Toggle off editing mode
  };

  const handleCancelZoneEdit = () => {
    setEditingZoneName(zone.name);
    onEdit(); // Toggle off editing mode
  };

  const getZoneIcon = () => {
    return zone.zoneType === 'domestic' ? (
      <Home className="h-5 w-5 text-gray-500 dark:text-gray-400" />
    ) : (
      <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
    );
  };

  const getRateTypeName = (type: string) => {
    switch (type) {
      case 'weight':
        return t('empresa.shipping.rateType.weight', 'Weight');
      case 'vat':
        return t('empresa.shipping.rateType.vat', 'VAT');
      case 'duty':
        return t('empresa.shipping.rateType.duty', 'Duty');
      default:
        return type;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Zone Header */}
      <div className="p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="mt-0.5 sm:mt-0">
              {zone.zoneType === 'domestic' ? (
                <Home className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Globe className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            {isEditing ? (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
                <input
                  type="text"
                  value={editingZoneName}
                  onChange={(e) => setEditingZoneName(e.target.value)}
                  className="flex-1 px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={handleSaveZoneName}
                  className="p-0.5 sm:p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  style={{ color: primaryColor }}
                >
                  <Check className="h-3 sm:h-4 w-3 sm:w-4" />
                </button>
                <button
                  onClick={handleCancelZoneEdit}
                  className="p-0.5 sm:p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                >
                  <X className="h-3 sm:h-4 w-3 sm:w-4" />
                </button>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-lg font-medium text-gray-900 dark:text-white">
                  {zone.name}
                </h3>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <CountryFlag countryCode={zone.countries[0] || 'US'} className="w-3.5 sm:w-4 h-3 sm:h-3" />
                  <span className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {zone.countries[0] === 'US' ? 'United States of America' : zone.countries[0]}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={onEdit}
                  className="p-1 sm:p-2 rounded sm:rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  style={{ color: primaryColor }}
                >
                  <Edit2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1 sm:p-2 rounded sm:rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-500"
                >
                  <Trash2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rates Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('empresa.shipping.rateName', 'Rate')}
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('empresa.shipping.condition', 'Condition')}
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('empresa.shipping.price', 'Price')}
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <span className="sr-only sm:not-sr-only">{t('empresa.shipping.actions', 'Actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {zone.rates.map((rate) => (
              <tr key={rate.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {editingRateId === rate.id ? (
                  <EditRateInline
                    rate={rate}
                    primaryColor={primaryColor}
                    onSave={(updates) => {
                      onUpdateRate(rate.id, updates);
                      setEditingRateId(null);
                    }}
                    onCancel={() => setEditingRateId(null)}
                  />
                ) : (
                  <>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[11px] sm:text-sm font-medium text-gray-900 dark:text-white">
                      {getRateTypeName(rate.rateType)}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[11px] sm:text-sm text-gray-600 dark:text-gray-400">
                      {rate.condition || '-'}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[11px] sm:text-sm text-gray-900 dark:text-white">
                      {rate.price > 0 ? `$${rate.price}` : '-'}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-[11px] sm:text-sm font-medium">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setShowRateActions(showRateActions === rate.id ? null : rate.id)}
                          className="p-1 sm:p-2 rounded sm:rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MoreVertical className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-gray-500" />
                        </button>
                        
                        {showRateActions === rate.id && (
                          <div className="absolute right-0 mt-1 sm:mt-2 w-32 sm:w-48 rounded shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setEditingRateId(rate.id);
                                  setShowRateActions(null);
                                }}
                                className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {t('common.edit', 'Edit')}
                              </button>
                              <button
                                onClick={() => {
                                  onDeleteRate(rate.id);
                                  setShowRateActions(null);
                                }}
                                className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {t('common.delete', 'Delete')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Rate Button */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onAddRate}
          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded sm:rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          <Plus className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          <span>{t('empresa.shipping.addRate', 'Add Rate')}</span>
        </button>
      </div>
    </div>
  );
}