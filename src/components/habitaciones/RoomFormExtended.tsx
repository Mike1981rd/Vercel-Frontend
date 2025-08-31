'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import Toggle from '@/components/ui/Toggle';
import RoomHighlightsTab from './RoomHighlightsTab';
import LocationMap from './LocationMap';
import { geocodeAddress } from '@/lib/geocoding';
import { useCompany } from '@/contexts/CompanyContext';
import { useConfigOptions } from '@/hooks/useConfigOptions';
import { 
  MapPinIcon,
  HomeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ExtendedFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  primaryColor: string;
}

export default function RoomFormExtended({ formData, setFormData, primaryColor }: ExtendedFieldsProps) {
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<'location' | 'policies' | 'sleeping' | 'fees' | 'seo' | 'highlights'>('location');
  const { company } = useCompany() as any;
  
  // Load common spaces from catalog
  const { options: commonSpacesOptions, loading: loadingCommonSpaces } = useConfigOptions('common_spaces');
  
  // Load policy-related options from catalog
  const { options: houseRulesOptions, loading: loadingHouseRules } = useConfigOptions('house_rules');
  const { options: safetyPropertyOptions, loading: loadingSafetyProperty } = useConfigOptions('safety_property');
  const { options: cancellationOptions, loading: loadingCancellation } = useConfigOptions('cancellation_policies');
  
  // Debug log
  useEffect(() => {
    console.log('🏠 Common Spaces Options:', commonSpacesOptions);
    console.log('⏳ Loading Common Spaces:', loadingCommonSpaces);
    console.log('📋 House Rules Options:', houseRulesOptions);
    console.log('⏳ Loading House Rules:', loadingHouseRules);
    console.log('🛡️ Safety Property Options:', safetyPropertyOptions);
    console.log('⏳ Loading Safety Property:', loadingSafetyProperty);
    console.log('❌ Cancellation Options:', cancellationOptions);
    console.log('⏳ Loading Cancellation:', loadingCancellation);
  }, [commonSpacesOptions, loadingCommonSpaces, houseRulesOptions, loadingHouseRules, safetyPropertyOptions, loadingSafetyProperty, cancellationOptions, loadingCancellation]);

  // Initialize complex JSON fields if they don't exist
  useEffect(() => {
    if (!formData.houseRules) {
      setFormData({
        ...formData,
        houseRules: {
          checkInTime: '15:00',
          checkOutTime: '11:00',
          smokingAllowed: false,
          petsAllowed: false,
          eventsAllowed: false,
          quietHours: '22:00 - 08:00',
          additionalRules: []
        }
      });
    }
    if (!formData.cancellationPolicy) {
      setFormData({
        ...formData,
        cancellationPolicy: {
          type: 'flexible',
          description: '',
          fullRefundDays: 1,
          partialRefundPercent: 50
        }
      });
    }
    if (!formData.additionalFees) {
      setFormData({
        ...formData,
        additionalFees: {
          cleaningFee: 0,
          serviceFee: 0,
          securityDeposit: 0,
          petFee: 0,
          extraGuestFee: 0,
          extraGuestAfter: 2,
          weeklyDiscount: 0,
          monthlyDiscount: 0
        }
      });
    }
  }, []);

  // Track address changes to avoid overwriting saved coordinates on initial load
  const initialLoadDoneRef = useRef(false);
  const lastAddressSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    // Mark initial signature after first formData hydration
    const sig = [
      formData.streetAddress,
      formData.neighborhood,
      formData.city,
      formData.state,
      formData.postalCode,
      formData.country,
    ]
      .filter(Boolean)
      .join(', ');
    lastAddressSignatureRef.current = sig;
    initialLoadDoneRef.current = true;
    // Run only once on mount after initial form state is set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-geocode when address fields change (debounced) - ONLY set coords, never override address text
  useEffect(() => {
    const addressParts = [
      formData.streetAddress,
      formData.neighborhood,
      formData.city,
      formData.state,
      formData.postalCode,
      formData.country,
    ].filter(Boolean).join(', ');

    if (!addressParts) return;

    // If we already have saved coordinates, avoid auto-overwriting them on initial load
    // Only auto-geocode when the user has actually changed the address after initial hydration
    if (!initialLoadDoneRef.current) return;

    const currentSig = addressParts;
    if (lastAddressSignatureRef.current === currentSig) {
      // No effective change in address; do not geocode
      return;
    }

    // If coords already present, skip auto-geocoding and let the user press "Buscar en mapa" explicitly
    if (
      typeof formData.latitude === 'number' && !Number.isNaN(formData.latitude) &&
      typeof formData.longitude === 'number' && !Number.isNaN(formData.longitude)
    ) {
      // Update signature to current to prevent repeated checks
      lastAddressSignatureRef.current = currentSig;
      return;
    }

    const handle = setTimeout(async () => {
      const provider = company?.geolocationProvider || 'mapbox';
      const token = company?.geolocationToken || undefined;
      const countryCode = (company?.country || '').toString().toLowerCase() || undefined;
      const geo = await geocodeAddress(addressParts, countryCode, provider === 'mapbox' ? token : undefined);
      if (geo) {
        // IMPORTANT: only update coordinates so the display always reflects the user's typed address
        setFormData((prev: any) => ({ ...prev, latitude: geo.latitude, longitude: geo.longitude }));
      }
      // Update signature after processing
      lastAddressSignatureRef.current = currentSig;
    }, 700);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.streetAddress,
    formData.neighborhood,
    formData.city,
    formData.state,
    formData.postalCode,
    formData.country,
    company?.geolocationProvider,
    company?.geolocationToken,
    company?.country,
  ]);

  const updateNestedField = (field: string, key: string, value: any) => {
    setFormData({
      ...formData,
      [field]: {
        ...(formData[field] || {}),
        [key]: value
      }
    });
  };

  // Rehydrate local order overrides on mount if backend has none
  useEffect(() => {
    const applyOrderFromLocalStorage = (storageKey: string, fieldKey: 'houseRulesOrder' | 'safetyAndPropertyOrder' | 'cancellationPolicyOrder') => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && (!Array.isArray((formData as any)[fieldKey]) || ((formData as any)[fieldKey] as any[]).length === 0)) {
          setFormData({ ...formData, [fieldKey]: arr } as any);
        }
      } catch {}
    };
    applyOrderFromLocalStorage('room_houseRulesOrder', 'houseRulesOrder');
    applyOrderFromLocalStorage('room_safetyAndPropertyOrder', 'safetyAndPropertyOrder');
    applyOrderFromLocalStorage('room_cancellationPolicyOrder', 'cancellationPolicyOrder');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Maintain order arrays when toggles change
  const ensureInOrder = (current: string[] | undefined, key: string, enabled: boolean) => {
    const list = Array.isArray(current) ? [...current] : [];
    const idx = list.indexOf(key);
    if (enabled && idx === -1) list.push(key);
    if (!enabled && idx !== -1) list.splice(idx, 1);
    return list;
  };

  // dnd-kit sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Sortable item component
  function SortableItem({ id, label }: { id: string; label: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.7 : 1,
      boxShadow: isDragging ? '0 4px 10px rgba(0,0,0,0.1)' : undefined,
    } as React.CSSProperties;
    return (
      <li ref={setNodeRef} style={style} {...attributes} {...listeners}
          className="px-3 py-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 cursor-grab">
        {label}
      </li>
    );
  }

  return (
    <div className="mt-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              setActiveTab('location');
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'location'
                ? `border-[${primaryColor}] text-[${primaryColor}]`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MapPinIcon className="w-5 h-5 inline mr-2" />
            {t('rooms.location', 'Ubicación')}
          </button>
          <button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              setActiveTab('policies');
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'policies'
                ? `border-[${primaryColor}] text-[${primaryColor}]`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <DocumentTextIcon className="w-5 h-5 inline mr-2" />
            {t('rooms.policies', 'Políticas')}
          </button>
          <button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              setActiveTab('sleeping');
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sleeping'
                ? `border-[${primaryColor}] text-[${primaryColor}]`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <HomeIcon className="w-5 h-5 inline mr-2" />
            {t('rooms.sleeping', 'Habitaciones')}
          </button>
          <button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              setActiveTab('fees');
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'fees'
                ? `border-[${primaryColor}] text-[${primaryColor}]`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CurrencyDollarIcon className="w-5 h-5 inline mr-2" />
            {t('rooms.fees', 'Tarifas')}
          </button>
          <button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              setActiveTab('seo');
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'seo'
                ? `border-[${primaryColor}] text-[${primaryColor}]`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
            SEO
          </button>
          <button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              setActiveTab('highlights');
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'highlights'
                ? `border-[${primaryColor}] text-[${primaryColor}]`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <SparklesIcon className="w-5 h-5 inline mr-2" />
            {t('rooms.highlights', 'Highlights')}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Location Tab */}
        {activeTab === 'location' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.streetAddress', 'Dirección')}
              </label>
              <input
                type="text"
                value={formData.streetAddress || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, streetAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                placeholder="Calle Principal 123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.city', 'Ciudad')}
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.state', 'Estado/Provincia')}
              </label>
              <input
                type="text"
                value={formData.state || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.country', 'País')}
              </label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.postalCode', 'Código Postal')}
              </label>
              <input
                type="text"
                value={formData.postalCode || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.neighborhood', 'Barrio/Vecindario')}
              </label>
              <input
                type="text"
                value={formData.neighborhood || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, neighborhood: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.latitude', 'Latitud')}
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.latitude || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.longitude', 'Longitud')}
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.longitude || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Acciones de geocoding */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={async () => {
                  const parts = [
                    formData.streetAddress,
                    formData.neighborhood,
                    formData.city,
                    formData.state,
                    formData.postalCode,
                    formData.country,
                  ].filter(Boolean).join(', ');
                  if (!parts) return;
                  const provider = company?.geolocationProvider || 'mapbox';
                  const token = company?.geolocationToken || undefined;
                  const geo = await geocodeAddress(parts, undefined, provider === 'mapbox' ? token : undefined);
                  if (geo) {
                    setFormData({ ...formData, latitude: geo.latitude, longitude: geo.longitude });
                  }
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('rooms.searchOnMap', 'Buscar en mapa')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setFormData({ ...formData, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                    });
                  }
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t('rooms.useMyLocation', 'Usar mi ubicación')}
              </button>
            </div>

            {/* Mapa */}
            <div className="md:col-span-2">
              <LocationMap
                latitude={typeof formData.latitude === 'number' ? formData.latitude : undefined}
                longitude={typeof formData.longitude === 'number' ? formData.longitude : undefined}
                onChange={({ latitude, longitude }) => setFormData({ ...formData, latitude, longitude })}
                accessTokenOverride={company?.geolocationProvider === 'mapbox' ? (company?.geolocationToken || undefined) : undefined}
                height="360px"
              />
            </div>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-4">{t('rooms.houseRules', 'Reglas de la Casa')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dynamic house rules toggles from catalog */}
                {loadingHouseRules ? (
                  <div className="col-span-2 text-center py-4">
                    <span className="text-gray-500">{t('common.loading', 'Cargando...')}</span>
                  </div>
                ) : (
                  <>
                    {houseRulesOptions.length > 0 ? (
                      (() => {
                        const order = Array.isArray(formData.houseRulesOrder) ? formData.houseRulesOrder : [];
                        const values = houseRulesOptions.map(o => o.value);
                        const ordered = [...order.filter((v: string) => values.includes(v)), ...values.filter((v: string) => !order.includes(v))];
                        return ordered.map((valueKey: string) => {
                          const opt = houseRulesOptions.find(o => o.value === valueKey);
                          if (!opt) return null;
                          return (
                            <div key={opt.value} className="col-span-2">
                              <Toggle
                                checked={formData.houseRules?.[opt.value] || false}
                                onChange={(checked) => {
                                  const newOrder = ensureInOrder(formData.houseRulesOrder, opt.value, checked);
                                  setFormData({
                                    ...formData,
                                    houseRules: {
                                      ...(formData.houseRules || {}),
                                      [opt.value]: checked
                                    },
                                    houseRulesOrder: newOrder
                                  });
                                  try { localStorage.setItem('room_houseRulesOrder', JSON.stringify(newOrder)); } catch {}
                                }}
                                label={opt.labelEs || opt.value}
                                size="medium"
                              />
                            </div>
                          );
                        });
                      })()
                    ) : (
                      // Fallback to hardcoded toggles if no options from catalog
                      <>
                        <div className="col-span-2">
                          <Toggle
                            checked={formData.houseRules?.smokingAllowed || false}
                            onChange={(checked) => updateNestedField('houseRules', 'smokingAllowed', checked)}
                            label={t('rooms.smokingAllowed', 'Se permite fumar')}
                            size="medium"
                          />
                        </div>
                        <div className="col-span-2">
                          <Toggle
                            checked={formData.houseRules?.petsAllowed || false}
                            onChange={(checked) => updateNestedField('houseRules', 'petsAllowed', checked)}
                            label={t('rooms.petsAllowed', 'Se permiten mascotas')}
                            size="medium"
                          />
                        </div>
                        <div className="col-span-2">
                          <Toggle
                            checked={formData.houseRules?.eventsAllowed || false}
                            onChange={(checked) => updateNestedField('houseRules', 'eventsAllowed', checked)}
                            label={t('rooms.eventsAllowed', 'Se permiten eventos')}
                            size="medium"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

          {/* Order: House Rules (drag to sort) */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-4">{t('rooms.orderHouseRules', 'Orden de Reglas de la Casa')}</h3>
            {(() => {
              const enabled = (houseRulesOptions || []).map(o => o.value).filter((v: string) => formData.houseRules?.[v]);
              const order = Array.isArray(formData.houseRulesOrder) ? formData.houseRulesOrder : [];
              const items = [...order.filter((v: string) => enabled.includes(v)), ...enabled.filter((v: string) => !order.includes(v))];
              const labelOf = (key: string) => (houseRulesOptions.find(o => o.value === key)?.labelEs || key);
              const onDragEnd = (event: any) => {
                const { active, over } = event;
                if (!over || active.id === over.id) return;
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                if (oldIndex === -1 || newIndex === -1) return;
                const newList = arrayMove(items, oldIndex, newIndex);
                setFormData({ ...formData, houseRulesOrder: newList });
              };
              if (items.length <= 1) {
                return <p className="text-sm text-gray-500">{t('rooms.enableMoreRulesToSort', 'Activa 2 o más reglas para ordenar')}</p>;
              }
              return (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => {
                    const { active, over } = e as any;
                    if (!over || active.id === over.id) return;
                    const oldIndex = items.indexOf(active.id);
                    const newIndex = items.indexOf(over.id);
                    if (oldIndex === -1 || newIndex === -1) return;
                    const newList = arrayMove(items, oldIndex, newIndex);
                    setFormData({ ...formData, houseRulesOrder: newList });
                    try { localStorage.setItem('room_houseRulesOrder', JSON.stringify(newList)); } catch {}
                  }}
                >
                  <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2">
                      {items.map((id: string) => (
                        <SortableItem key={id} id={id} label={labelOf(id)} />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              );
            })()}
          </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-4">{t('rooms.cancellationPolicy', 'Política de Cancelación')}</h3>
              <div className="space-y-4">
                {/* Deprecated: select for policy type (we now use catalog toggles only) */}
                {false && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('rooms.policyType', 'Tipo de Política')}
                    </label>
                    <select
                      value={formData.cancellationPolicy?.type || 'flexible'}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateNestedField('cancellationPolicy', 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="flexible">Flexible</option>
                      <option value="moderate">Moderada</option>
                      <option value="strict">Estricta</option>
                      <option value="super_strict">Súper Estricta</option>
                    </select>
                  </div>
                )}


                {/* Dynamic cancellation policy toggles from catalog */}
                {loadingCancellation ? (
                  <div className="text-center py-4">
                    <span className="text-gray-500">{t('common.loading', 'Cargando...')}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cancellationOptions.length > 0 ? (
                      (() => {
                        const order = Array.isArray(formData.cancellationPolicyOrder) ? formData.cancellationPolicyOrder : [];
                        const values = cancellationOptions.map(o => o.value);
                        const ordered = [...order.filter((v: string) => values.includes(v)), ...values.filter((v: string) => !order.includes(v))];
                        return ordered.map((valueKey: string) => {
                          const opt = cancellationOptions.find(o => o.value === valueKey);
                          if (!opt) return null;
                          return (
                            <div key={opt.value}>
                              <Toggle
                                checked={formData.cancellationPolicy?.[opt.value] || false}
                                onChange={(checked) => {
                                  const newOrder = ensureInOrder(formData.cancellationPolicyOrder, opt.value, checked);
                                  setFormData({
                                    ...formData,
                                    cancellationPolicy: {
                                      ...(formData.cancellationPolicy || {}),
                                      [opt.value]: checked
                                    },
                                    cancellationPolicyOrder: newOrder
                                  });
                                  try { localStorage.setItem('room_cancellationPolicyOrder', JSON.stringify(newOrder)); } catch {}
                                }}
                                label={opt.labelEs || opt.value}
                                size="medium"
                              />
                            </div>
                          );
                        });
                      })()
                    ) : (
                      // Fallback toggles if no options from catalog
                      <>
                        <div>
                          <Toggle
                            checked={formData.cancellationPolicy?.freeCancel24h || false}
                            onChange={(checked) => updateNestedField('cancellationPolicy', 'freeCancel24h', checked)}
                            label={t('rooms.freeCancel24h', 'Cancelación gratuita 24h antes')}
                            size="medium"
                          />
                        </div>
                        <div>
                          <Toggle
                            checked={formData.cancellationPolicy?.partialRefund || false}
                            onChange={(checked) => updateNestedField('cancellationPolicy', 'partialRefund', checked)}
                            label={t('rooms.partialRefund', 'Reembolso parcial disponible')}
                            size="medium"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              {/* Order: Cancellation Policy (drag to sort) */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('rooms.orderCancellation', 'Orden de Políticas de Cancelación')}
                </label>
                {(() => {
                  const enabled = (cancellationOptions || []).map(o => o.value).filter((v: string) => formData.cancellationPolicy?.[v]);
                  const order = Array.isArray(formData.cancellationPolicyOrder) ? formData.cancellationPolicyOrder : [];
                  const items = [...order.filter((v: string) => enabled.includes(v)), ...enabled.filter((v: string) => !order.includes(v))];
                  const labelOf = (key: string) => (cancellationOptions.find(o => o.value === key)?.labelEs || key);
                  const onDragEnd = (event: any) => {
                    const { active, over } = event;
                    if (!over || active.id === over.id) return;
                    const oldIndex = items.indexOf(active.id);
                    const newIndex = items.indexOf(over.id);
                    if (oldIndex === -1 || newIndex === -1) return;
                    const newList = arrayMove(items, oldIndex, newIndex);
                    setFormData({ ...formData, cancellationPolicyOrder: newList });
                    try { localStorage.setItem('room_cancellationPolicyOrder', JSON.stringify(newList)); } catch {}
                  };
                  return (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                      <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        <ul className="space-y-2">
                          {items.map((id: string) => (
                            <SortableItem key={id} id={id} label={labelOf(id)} />
                          ))}
                        </ul>
                      </SortableContext>
                    </DndContext>
                  );
                })()}
              </div>
            </div>

            {/* Safety and Property Section */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-4">{t('rooms.safetyAndProperty', 'Seguridad y Propiedad')}</h3>
              
              <div className="space-y-4">
                {/* Dynamic safety property toggles from catalog */}
                {loadingSafetyProperty ? (
                  <div className="text-center py-4">
                    <span className="text-gray-500">{t('common.loading', 'Cargando...')}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {safetyPropertyOptions.length > 0 ? (
                      (() => {
                        const order = Array.isArray(formData.safetyAndPropertyOrder) ? formData.safetyAndPropertyOrder : [];
                        const values = safetyPropertyOptions.map(o => o.value);
                        const ordered = [...order.filter((v: string) => values.includes(v)), ...values.filter((v: string) => !order.includes(v))];
                        return ordered.map((valueKey: string) => {
                          const opt = safetyPropertyOptions.find(o => o.value === valueKey);
                          if (!opt) return null;
                          return (
                            <div key={opt.value}>
                              <Toggle
                                checked={formData.safetyAndProperty?.[opt.value] || false}
                                onChange={(checked) => {
                                  const newOrder = ensureInOrder(formData.safetyAndPropertyOrder, opt.value, checked);
                                  setFormData({
                                    ...formData,
                                    safetyAndProperty: {
                                      ...(formData.safetyAndProperty || {}),
                                      [opt.value]: checked
                                    },
                                    safetyAndPropertyOrder: newOrder
                                  });
                                  try { localStorage.setItem('room_safetyAndPropertyOrder', JSON.stringify(newOrder)); } catch {}
                                }}
                                label={opt.labelEs || opt.value}
                                size="medium"
                              />
                            </div>
                          );
                        });
                      })()
                    ) : (
                      // Fallback toggles if no options from catalog
                      <>
                        <div>
                          <Toggle
                            checked={formData.safetyAndProperty?.smokeDetector || false}
                            onChange={(checked) => {
                              setFormData({
                                ...formData,
                                safetyAndProperty: {
                                  ...formData.safetyAndProperty,
                                  smokeDetector: checked
                                }
                              });
                            }}
                            label={t('rooms.smokeDetector', 'Detector de humo')}
                            size="medium"
                          />
                        </div>
                        <div>
                          <Toggle
                            checked={formData.safetyAndProperty?.carbonMonoxideDetector || false}
                            onChange={(checked) => {
                              setFormData({
                                ...formData,
                                safetyAndProperty: {
                                  ...formData.safetyAndProperty,
                                  carbonMonoxideDetector: checked
                                }
                              });
                            }}
                            label={t('rooms.carbonMonoxideDetector', 'Detector de monóxido')}
                            size="medium"
                          />
                        </div>
                        <div>
                          <Toggle
                            checked={formData.safetyAndProperty?.fireExtinguisher || false}
                            onChange={(checked) => {
                              setFormData({
                                ...formData,
                                safetyAndProperty: {
                                  ...formData.safetyAndProperty,
                                  fireExtinguisher: checked
                                }
                              });
                            }}
                            label={t('rooms.fireExtinguisher', 'Extintor')}
                            size="medium"
                          />
                        </div>
                        <div>
                          <Toggle
                            checked={formData.safetyAndProperty?.firstAidKit || false}
                            onChange={(checked) => {
                              setFormData({
                                ...formData,
                                safetyAndProperty: {
                                  ...formData.safetyAndProperty,
                                  firstAidKit: checked
                                }
                              });
                            }}
                            label={t('rooms.firstAidKit', 'Botiquín')}
                            size="medium"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Order: Safety & Property (drag to sort) */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('rooms.orderSafety', 'Orden de Seguridad y Propiedad')}
                </label>
                {(() => {
                  const enabled = (safetyPropertyOptions || []).map(o => o.value).filter((v: string) => formData.safetyAndProperty?.[v]);
                  const order = Array.isArray(formData.safetyAndPropertyOrder) ? formData.safetyAndPropertyOrder : [];
                  const items = [...order.filter((v: string) => enabled.includes(v)), ...enabled.filter((v: string) => !order.includes(v))];
                  const labelOf = (key: string) => (safetyPropertyOptions.find(o => o.value === key)?.labelEs || key);
                  const onDragEnd = (event: any) => {
                    const { active, over } = event;
                    if (!over || active.id === over.id) return;
                    const oldIndex = items.indexOf(active.id);
                    const newIndex = items.indexOf(over.id);
                    if (oldIndex === -1 || newIndex === -1) return;
                    const newList = arrayMove(items, oldIndex, newIndex);
                    setFormData({ ...formData, safetyAndPropertyOrder: newList });
                  };
              return (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => {
                    const { active, over } = event as any;
                    if (!over || active.id === over.id) return;
                    const oldIndex = items.indexOf(active.id);
                    const newIndex = items.indexOf(over.id);
                    if (oldIndex === -1 || newIndex === -1) return;
                    const newList = arrayMove(items, oldIndex, newIndex);
                    setFormData({ ...formData, safetyAndPropertyOrder: newList });
                    try { localStorage.setItem('room_safetyAndPropertyOrder', JSON.stringify(newList)); } catch {}
                  }}
                >
                  <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2">
                      {items.map((id: string) => (
                        <SortableItem key={id} id={id} label={labelOf(id)} />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              );
                })()}
              </div>
            </div>

            {/* Guest Maximum Section */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-4">{t('rooms.guestMaximum', 'Límites de Huéspedes')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rooms.maxAdults', 'Máximo de adultos')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.guestMaximum?.maxAdults || formData.maxOccupancy || 2}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFormData({
                        ...formData,
                        guestMaximum: {
                          ...formData.guestMaximum,
                          maxAdults: parseInt(e.target.value)
                        }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rooms.maxChildren', 'Máximo de niños')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.guestMaximum?.maxChildren || 0}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        guestMaximum: {
                          ...formData.guestMaximum,
                          maxChildren: parseInt(e.target.value)
                        }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rooms.maxInfants', 'Máximo de infantes')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.guestMaximum?.maxInfants || 0}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        guestMaximum: {
                          ...formData.guestMaximum,
                          maxInfants: parseInt(e.target.value)
                        }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rooms.maxPets', 'Máximo de mascotas')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.guestMaximum?.maxPets || 0}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        guestMaximum: {
                          ...formData.guestMaximum,
                          maxPets: parseInt(e.target.value)
                        }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('rooms.additionalGuestInfo', 'Información adicional sobre huéspedes')}
                </label>
                <textarea
                  value={formData.guestMaximum?.additionalInfo || ''}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      guestMaximum: {
                        ...formData.guestMaximum,
                        additionalInfo: e.target.value
                      }
                    });
                  }}
                  rows={3}
                  placeholder={t('rooms.guestInfoPlaceholder', 'Ej: Los niños menores de 2 años se hospedan gratis en cunas.')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sleeping Arrangements Tab */}
        {activeTab === 'sleeping' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-4">{t('rooms.sleepingArrangements', 'Distribución de Habitaciones')}</h3>
              
              {/* Resumen General */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rooms.totalBedrooms', 'Total de Habitaciones')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sleepingArrangements?.totalBedrooms || 1}
                    onChange={(e) => updateNestedField('sleepingArrangements', 'totalBedrooms', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rooms.totalBeds', 'Total de Camas')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sleepingArrangements?.totalBeds || 1}
                    onChange={(e) => updateNestedField('sleepingArrangements', 'totalBeds', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rooms.totalBathrooms', 'Total de Baños')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.sleepingArrangements?.totalBathrooms || 1}
                    onChange={(e) => updateNestedField('sleepingArrangements', 'totalBathrooms', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Detalle de Habitaciones */}
              <div className="space-y-4">
                <h4 className="font-medium text-md">{t('rooms.bedroomDetails', 'Detalle de Habitaciones')}</h4>
                
                {/* Habitación Principal */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h5 className="font-medium mb-3">{t('rooms.masterBedroom', 'Habitación Principal')}</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Toggle
                      checked={formData.sleepingArrangements?.masterBedroom?.kingBed || false}
                      onChange={(checked) => {
                        const current = formData.sleepingArrangements?.masterBedroom || {};
                        setFormData({
                          ...formData,
                          sleepingArrangements: {
                            ...formData.sleepingArrangements,
                            masterBedroom: {
                              ...current,
                              kingBed: checked
                            }
                          }
                        });
                      }}
                      label={t('rooms.kingBed', 'Cama King')}
                      size="small"
                    />

                    <Toggle
                      checked={formData.sleepingArrangements?.masterBedroom?.queenBed || false}
                      onChange={(checked) => {
                        const current = formData.sleepingArrangements?.masterBedroom || {};
                        setFormData({
                          ...formData,
                          sleepingArrangements: {
                            ...formData.sleepingArrangements,
                            masterBedroom: {
                              ...current,
                              queenBed: checked
                            }
                          }
                        });
                      }}
                      label={t('rooms.queenBed', 'Cama Queen')}
                      size="small"
                    />

                    <Toggle
                      checked={formData.sleepingArrangements?.masterBedroom?.doubleBed || false}
                      onChange={(checked) => {
                        const current = formData.sleepingArrangements?.masterBedroom || {};
                        setFormData({
                          ...formData,
                          sleepingArrangements: {
                            ...formData.sleepingArrangements,
                            masterBedroom: {
                              ...current,
                              doubleBed: checked
                            }
                          }
                        });
                      }}
                      label={t('rooms.doubleBed', 'Cama Doble')}
                      size="small"
                    />

                    <Toggle
                      checked={formData.sleepingArrangements?.masterBedroom?.privateBathroom || false}
                      onChange={(checked) => {
                        const current = formData.sleepingArrangements?.masterBedroom || {};
                        setFormData({
                          ...formData,
                          sleepingArrangements: {
                            ...formData.sleepingArrangements,
                            masterBedroom: {
                              ...current,
                              privateBathroom: checked
                            }
                          }
                        });
                      }}
                      label={t('rooms.privateBathroom', 'Baño Privado')}
                      size="small"
                    />
                  </div>
                </div>

                {/* Habitaciones Adicionales */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h5 className="font-medium mb-3">{t('rooms.additionalRooms', 'Habitaciones Adicionales')}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('rooms.singleBeds', 'Camas Individuales')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sleepingArrangements?.singleBeds || 0}
                        onChange={(e) => updateNestedField('sleepingArrangements', 'singleBeds', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('rooms.bunkBeds', 'Literas')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sleepingArrangements?.bunkBeds || 0}
                        onChange={(e) => updateNestedField('sleepingArrangements', 'bunkBeds', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('rooms.sofaBeds', 'Sofá Cama')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sleepingArrangements?.sofaBeds || 0}
                        onChange={(e) => updateNestedField('sleepingArrangements', 'sofaBeds', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('rooms.cribs', 'Cunas')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sleepingArrangements?.cribs || 0}
                        onChange={(e) => updateNestedField('sleepingArrangements', 'cribs', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Espacios Comunes - Dynamic from Catalog */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h5 className="font-medium mb-3">{t('rooms.commonSpaces', 'Espacios Comunes')}</h5>
                  {loadingCommonSpaces ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : commonSpacesOptions && commonSpacesOptions.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {commonSpacesOptions
                        .filter((space: any) => space.isActive)
                        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        .map((space: any) => (
                          <Toggle
                            key={space.value}
                            checked={formData.sleepingArrangements?.commonSpaces?.[space.value] || false}
                            onChange={(checked) => {
                              const current = formData.sleepingArrangements?.commonSpaces || {};
                              setFormData({
                                ...formData,
                                sleepingArrangements: {
                                  ...formData.sleepingArrangements,
                                  commonSpaces: {
                                    ...current,
                                    [space.value]: checked
                                  }
                                }
                              });
                            }}
                            label={language === 'es' ? space.labelEs : space.labelEn}
                            size="small"
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                      {t('rooms.noCommonSpaces', 'No hay espacios comunes configurados. Ve a Gestión de Catálogos para agregar opciones.')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Fees Tab */}
        {activeTab === 'fees' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.cleaningFee', 'Tarifa de Limpieza')}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.additionalFees?.cleaningFee || 0}
                onChange={(e) => updateNestedField('additionalFees', 'cleaningFee', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.serviceFee', 'Tarifa de Servicio')}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.additionalFees?.serviceFee || 0}
                onChange={(e) => updateNestedField('additionalFees', 'serviceFee', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.securityDeposit', 'Depósito de Seguridad')}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.additionalFees?.securityDeposit || 0}
                onChange={(e) => updateNestedField('additionalFees', 'securityDeposit', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.petFee', 'Tarifa por Mascota')}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.additionalFees?.petFee || 0}
                onChange={(e) => updateNestedField('additionalFees', 'petFee', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.weeklyDiscount', 'Descuento Semanal (%)')}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.additionalFees?.weeklyDiscount || 0}
                onChange={(e) => updateNestedField('additionalFees', 'weeklyDiscount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.monthlyDiscount', 'Descuento Mensual (%)')}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.additionalFees?.monthlyDiscount || 0}
                onChange={(e) => updateNestedField('additionalFees', 'monthlyDiscount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.slug', 'URL Amigable (Slug)')}
              </label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                placeholder="habitacion-deluxe-vista-mar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.metaTitle', 'Título Meta (SEO)')}
              </label>
              <input
                type="text"
                value={formData.metaTitle || ''}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                maxLength={70}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.metaTitle?.length || 0}/70 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('rooms.metaDescription', 'Descripción Meta (SEO)')}
              </label>
              <textarea
                value={formData.metaDescription || ''}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                maxLength={160}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.metaDescription?.length || 0}/160 caracteres
              </p>
            </div>
          </div>
        )}

        {/* Highlights Tab */}
        {activeTab === 'highlights' && (
          <RoomHighlightsTab 
            formData={formData}
            setFormData={setFormData}
            primaryColor={primaryColor}
          />
        )}
      </div>
    </div>
  );
}