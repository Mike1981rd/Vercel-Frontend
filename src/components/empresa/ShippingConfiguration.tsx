'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';
import { Plus, Trash2, Edit2, MoreVertical, Package, Globe, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { ShippingZoneCard } from './shipping/ShippingZoneCard';
import { CreateZoneModal } from './shipping/CreateZoneModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export interface ShippingRate {
  id: string;
  rateType: 'weight' | 'vat' | 'duty';
  condition: string;
  price: number;
  displayOrder: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  zoneType: 'domestic' | 'international' | 'custom';
  countries: string[];
  rates: ShippingRate[];
  isActive: boolean;
  displayOrder: number;
}

export function ShippingConfiguration() {
  const { t } = useI18n();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const fetchInitiatedRef = useRef(false);
  
  // State for shipping zones
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [originalZones, setOriginalZones] = useState<ShippingZone[]>([]);
  
  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [deletingZoneId, setDeletingZoneId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Get primary color from localStorage
  useEffect(() => {
    if (fetchInitiatedRef.current) return;
    fetchInitiatedRef.current = true;
    
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        setPrimaryColor(parsed.primaryColor || '#22c55e');
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }
    loadShippingZones();
  }, []);

  const loadShippingZones = async () => {
    try {
      const response = await api.get('/shipping/zones');
      const zones: ShippingZone[] = (response.data as any[]).map((zone: any) => ({
        ...zone,
        id: zone.id.toString(),
        rates: zone.rates.map((rate: any) => ({
          ...rate,
          id: rate.id.toString()
        }))
      }));
      
      setShippingZones(zones);
      setOriginalZones(JSON.parse(JSON.stringify(zones)));
      setHasChanges(false);
    } catch (error: any) {
      console.error('Error loading shipping zones:', error);
      
      // If API fails, use mock data for development
      const mockZones: ShippingZone[] = [
        {
          id: '1',
          name: 'Domestic',
          zoneType: 'domestic',
          countries: ['US'],
          isActive: true,
          displayOrder: 1,
          rates: [
            { id: '1-1', rateType: 'weight', condition: '5kg-10kg', price: 9, displayOrder: 1 },
            { id: '1-2', rateType: 'vat', condition: '12%', price: 25, displayOrder: 2 },
            { id: '1-3', rateType: 'duty', condition: '-', price: 0, displayOrder: 3 }
          ]
        },
        {
          id: '2',
          name: 'International',
          zoneType: 'international',
          countries: ['US'],
          isActive: true,
          displayOrder: 2,
          rates: [
            { id: '2-1', rateType: 'weight', condition: '5kg-10kg', price: 19, displayOrder: 1 },
            { id: '2-2', rateType: 'vat', condition: '12%', price: 25, displayOrder: 2 },
            { id: '2-3', rateType: 'duty', condition: 'Japan', price: 49, displayOrder: 3 }
          ]
        }
      ];
      
      setShippingZones(mockZones);
      setOriginalZones(JSON.parse(JSON.stringify(mockZones)));
      setHasChanges(false);
    }
  };

  const handleCreateZone = (newZone: Omit<ShippingZone, 'id'>) => {
    const zone: ShippingZone = {
      ...newZone,
      id: `temp-${Date.now()}`,
      displayOrder: shippingZones.length + 1,
      rates: [
        { id: `${Date.now()}-1`, rateType: 'weight', condition: '', price: 0, displayOrder: 1 },
        { id: `${Date.now()}-2`, rateType: 'vat', condition: '', price: 0, displayOrder: 2 },
        { id: `${Date.now()}-3`, rateType: 'duty', condition: '', price: 0, displayOrder: 3 }
      ]
    };
    
    setShippingZones([...shippingZones, zone]);
    setHasChanges(true);
    setShowCreateModal(false);
    toast.success(t('empresa.shipping.zoneCreated', 'Shipping zone created'));
  };

  const handleUpdateZone = (zoneId: string, updates: Partial<ShippingZone>) => {
    setShippingZones(zones =>
      zones.map(zone => zone.id === zoneId ? { ...zone, ...updates } : zone)
    );
    setHasChanges(true);
  };

  const handleDeleteZone = (zoneId: string) => {
    setDeletingZoneId(zoneId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteZone = () => {
    if (deletingZoneId) {
      const zoneName = shippingZones.find(z => z.id === deletingZoneId)?.name;
      setShippingZones(zones => zones.filter(z => z.id !== deletingZoneId));
      setHasChanges(true);
      toast.success(t('empresa.shipping.zoneDeleted', `Zone "${zoneName}" deleted`));
    }
    setShowDeleteConfirm(false);
    setDeletingZoneId(null);
  };

  const handleAddRate = (zoneId: string) => {
    const zone = shippingZones.find(z => z.id === zoneId);
    const newRate: ShippingRate = {
      id: `temp-rate-${Date.now()}`,
      rateType: 'weight',
      condition: '',
      price: 0,
      displayOrder: (zone?.rates.length || 0) + 1
    };
    
    setShippingZones(zones =>
      zones.map(zone =>
        zone.id === zoneId
          ? { ...zone, rates: [...zone.rates, newRate] }
          : zone
      )
    );
    setHasChanges(true);
  };

  const handleUpdateRate = (zoneId: string, rateId: string, updates: Partial<ShippingRate>) => {
    setShippingZones(zones =>
      zones.map(zone =>
        zone.id === zoneId
          ? {
              ...zone,
              rates: zone.rates.map(rate =>
                rate.id === rateId ? { ...rate, ...updates } : rate
              )
            }
          : zone
      )
    );
    setHasChanges(true);
  };

  const handleDeleteRate = (zoneId: string, rateId: string) => {
    setShippingZones(zones =>
      zones.map(zone =>
        zone.id === zoneId
          ? { ...zone, rates: zone.rates.filter(r => r.id !== rateId) }
          : zone
      )
    );
    setHasChanges(true);
    toast.success(t('empresa.shipping.rateDeleted', 'Rate deleted'));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Separate new zones from existing ones
      const newZones = shippingZones.filter(z => z.id.startsWith('temp-'));
      const existingZones = shippingZones.filter(z => !z.id.startsWith('temp-'));
      
      // Create new zones first
      for (const zone of newZones) {
        const createDto = {
          name: zone.name,
          zoneType: zone.zoneType,
          countries: zone.countries,
          isActive: zone.isActive,
          displayOrder: zone.displayOrder
        };
        
        try {
          const response = await api.post('/shipping/zones', createDto);
          // Update the zone ID with the real one from backend
          zone.id = (response.data as any).id.toString();
        } catch (error) {
          console.error('Error creating zone:', error);
          toast.error(t('empresa.shipping.createFailed', `Failed to create zone ${zone.name}`));
          return;
        }
      }
      
      // Now bulk update all zones (including the newly created ones with real IDs)
      const zonesForBackend = shippingZones.map(zone => ({
        id: parseInt(zone.id) || 0,
        name: zone.name,
        zoneType: zone.zoneType,
        countries: zone.countries,
        isActive: zone.isActive,
        displayOrder: zone.displayOrder,
        rates: zone.rates.map(rate => ({
          id: rate.id.startsWith('temp-') ? 0 : (parseInt(rate.id) || 0),
          rateType: rate.rateType,
          condition: rate.condition || '',
          price: rate.price,
          isActive: true,
          displayOrder: rate.displayOrder
        }))
      }));

      await api.put('/shipping/zones/bulk-update', { zones: zonesForBackend });
      
      setOriginalZones(JSON.parse(JSON.stringify(shippingZones)));
      setHasChanges(false);
      toast.success(t('empresa.shipping.settingsSaved', 'Shipping settings saved successfully'));
    } catch (error) {
      toast.error(t('empresa.shipping.saveFailed', 'Failed to save shipping settings'));
      console.error('Error saving shipping settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setShippingZones(JSON.parse(JSON.stringify(originalZones)));
    setHasChanges(false);
    setEditingZoneId(null);
  };

  return (
    <>
      <div className="space-y-3 sm:space-y-6 pb-32 sm:pb-20 w-full">
        {/* Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h2 className="text-xs sm:text-xl font-medium sm:font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                {t('empresa.shipping.title', 'Shipping zones')}
              </h2>
              <p className="text-[10px] sm:text-base text-gray-600 dark:text-gray-400 leading-tight sm:leading-relaxed">
                {t('empresa.shipping.description', 'Choose where you ship and how much you charge for shipping at check out.')}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 text-white rounded sm:rounded-lg text-[11px] sm:text-base font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              <span>{t('empresa.shipping.createZone', 'Create zone')}</span>
            </button>
          </div>
        </motion.div>

        {/* Shipping Zones */}
        <AnimatePresence>
          {shippingZones.map((zone, index) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ShippingZoneCard
                zone={zone}
                primaryColor={primaryColor}
                isEditing={editingZoneId === zone.id}
                onEdit={() => setEditingZoneId(zone.id)}
                onDelete={() => handleDeleteZone(zone.id)}
                onUpdateZone={(updates) => handleUpdateZone(zone.id, updates)}
                onAddRate={() => handleAddRate(zone.id)}
                onUpdateRate={(rateId, updates) => handleUpdateRate(zone.id, rateId, updates)}
                onDeleteRate={(rateId) => handleDeleteRate(zone.id, rateId)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {shippingZones.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded sm:rounded-lg border border-dashed border-gray-300 dark:border-gray-600"
          >
            <Package className="h-10 sm:h-12 w-10 sm:w-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
            <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              {t('empresa.shipping.noZones', 'No shipping zones configured')}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto px-4 py-2 text-white rounded sm:rounded-lg text-xs sm:text-base font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              {t('empresa.shipping.createFirstZone', 'Create your first zone')}
            </button>
          </motion.div>
        )}

        {/* Action Buttons - Mobile responsive */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="fixed bottom-0 left-0 right-0 lg:sticky lg:bottom-auto flex items-center justify-center sm:justify-end gap-2 sm:gap-3 bg-white dark:bg-gray-900 px-4 py-3 sm:p-4 shadow-lg lg:shadow-none border-t border-gray-200 dark:border-gray-700 z-20"
        >
          <div className="flex gap-2 w-full max-w-xs sm:max-w-none sm:w-auto">
            <button
              onClick={handleDiscard}
              disabled={!hasChanges || loading}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 sm:px-6 sm:py-2.5 rounded sm:rounded-lg font-medium transition-all text-xs sm:text-base",
                "border border-gray-300 dark:border-gray-600",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "text-gray-700 dark:text-gray-300"
              )}
            >
              {t('common.discard', 'Discard')}
            </button>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || loading}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 sm:px-6 sm:py-2.5 rounded sm:rounded-lg font-medium text-white transition-all text-xs sm:text-base",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "sm:shadow-lg sm:hover:shadow-xl sm:transform sm:hover:-translate-y-0.5"
              )}
              style={{
                backgroundColor: hasChanges ? primaryColor : '#9ca3af',
                boxShadow: hasChanges && window.innerWidth > 640 ? `0 10px 25px -5px ${primaryColor}40` : undefined
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t('common.saving', 'Saving...')}</span>
                </span>
              ) : (
                t('common.saveChanges', 'Save Changes')
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <CreateZoneModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateZone={handleCreateZone}
        primaryColor={primaryColor}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteZone}
        title={t('empresa.shipping.deleteZoneTitle', 'Delete Shipping Zone')}
        message={t('empresa.shipping.deleteZoneMessage', 'Are you sure you want to delete this zone? This will remove all associated rates.')}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        confirmColor="red"
      />
    </>
  );
}