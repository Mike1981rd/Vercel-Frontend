'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { CountryFlag, countries } from '@/components/ui/CountryFlag';
import { 
  MapPinIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  BuildingStorefrontIcon,
  GlobeAmericasIcon,
  PhoneIcon,
  HomeIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { API_URL } from '@/lib/constants';

interface Location {
  id: number;
  companyId: number;
  name: string;
  isDefault: boolean;
  fulfillOnlineOrders: boolean;
  address: string;
  apartment: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  createdAt: string;
  updatedAt: string;
}

interface LocationFormData {
  name: string;
  fulfillOnlineOrders: boolean;
  address: string;
  apartment: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

interface LocationsConfigurationProps {
  primaryColor: string;
}

const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export function LocationsConfiguration({ primaryColor }: LocationsConfigurationProps) {
  const { t } = useI18n();
  const fetchInitiatedRef = useRef(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    fulfillOnlineOrders: true,
    address: '',
    apartment: '',
    phone: '',
    city: '',
    state: '',
    country: 'US',
    pinCode: ''
  });
  const [errors, setErrors] = useState<Partial<LocationFormData>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Helper function to get input styles with primary color focus
  const getInputClassName = (hasError: boolean) => {
    return `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all ${
      hasError 
        ? 'border-red-300 dark:border-red-600' 
        : 'border-gray-300 dark:border-gray-600'
    }`;
  };

  const getInputStyle = () => ({
    '--tw-ring-color': primaryColor,
  } as React.CSSProperties);

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = primaryColor;
    e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError: boolean) => {
    e.target.style.borderColor = hasError ? '#fca5a5' : '#d1d5db';
    e.target.style.boxShadow = '';
  };

  useEffect(() => {
    if (fetchInitiatedRef.current) return;
    fetchInitiatedRef.current = true;
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Decodificar el token para ver su contenido
      if (token) {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('Token payload:', payload);
            console.log('CompanyId en token:', payload.companyId || 'NO ENCONTRADO');
          }
        } catch (e) {
          console.error('Error decodificando token:', e);
        }
      }
      
      const response = await fetch(`${API_URL}/locations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      } else {
        const errorData = await response.text();
        console.error('Error response:', response.status, errorData);
        
        // Si es 400, podría ser que no hay CompanyId en el token
        if (response.status === 400) {
          console.error('Bad Request - Verificar que el usuario tenga CompanyId asignado');
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LocationFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('locations.errors.nameRequired', 'Location name is required');
    }
    if (!formData.address.trim()) {
      newErrors.address = t('locations.errors.addressRequired', 'Address is required');
    }
    if (!formData.city.trim()) {
      newErrors.city = t('locations.errors.cityRequired', 'City is required');
    }
    if (!formData.state.trim()) {
      newErrors.state = t('locations.errors.stateRequired', 'State is required');
    }
    if (!formData.country) {
      newErrors.country = t('locations.errors.countryRequired', 'Country is required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingLocation 
        ? `${API_URL}/locations/${editingLocation.id}`
        : `${API_URL}/locations`;
      
      const method = editingLocation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchLocations();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      fulfillOnlineOrders: location.fulfillOnlineOrders,
      address: location.address || '',
      apartment: location.apartment || '',
      phone: location.phone || '',
      city: location.city || '',
      state: location.state || '',
      country: location.country || 'US',
      pinCode: location.pinCode || ''
    });
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchLocations();
      }
    } catch (error) {
      console.error('Error deleting location:', error);
    } finally {
      setDeleting(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/locations/${id}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchLocations();
      }
    } catch (error) {
      console.error('Error setting default location:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingLocation(null);
    setFormData({
      name: '',
      fulfillOnlineOrders: true,
      address: '',
      apartment: '',
      phone: '',
      city: '',
      state: '',
      country: 'US',
      pinCode: ''
    });
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" 
             style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-6">
      {/* Header with Add Button */}
      {!showForm && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex-1">
            <h2 className="text-xs sm:text-xl font-medium sm:font-semibold text-gray-900 dark:text-white">
              {t('locations.title', 'Store Locations')}
            </h2>
            <p className="hidden sm:block mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('locations.description', 'Manage your physical store locations and fulfillment centers')}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm font-medium text-white rounded sm:rounded-lg hover:opacity-90 transition-all duration-200"
            style={{ backgroundColor: primaryColor }}
          >
            <PlusIcon className="h-3.5 sm:h-5 w-3.5 sm:w-5 mr-1 sm:mr-2" />
            <span>{t('locations.addLocation', 'Add Location')}</span>
          </button>
        </div>
      )}

      {/* Location Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingLocation 
                ? t('locations.editLocation', 'Edit Location')
                : t('locations.newLocation', 'New Location')}
            </h3>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Location Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('locations.locationName', 'Location Name')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={getInputClassName(!!errors.name)}
                style={getInputStyle()}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur(e, !!errors.name)}
                placeholder={t('locations.namePlaceholder', 'e.g., Main Store, Warehouse #1')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Fulfill Online Orders Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={formData.fulfillOnlineOrders}
                  onChange={(e) => setFormData({ ...formData, fulfillOnlineOrders: e.target.checked })}
                  disabled={editingLocation?.isDefault}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-opacity-30 focus:outline-none transition-all"
                  style={{ 
                    accentColor: primaryColor,
                    '--tw-ring-color': primaryColor 
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = '';
                  }}
                />
              </div>
              <div className="ml-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('locations.fulfillOrders', 'Fulfill online orders from this location')}
                </label>
                {editingLocation?.isDefault && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {t('locations.defaultNote', 'This is your default location. To change fulfillment, select another default location first.')}
                  </p>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                <HomeIcon className="h-5 w-5 mr-2" />
                {t('locations.addressSection', 'Address')}
              </h4>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('locations.country', 'Country/Region')}
                </label>
                <div className="relative">
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 appearance-none transition-all"
                    style={getInputStyle()}
                    onFocus={handleInputFocus}
                    onBlur={(e) => handleInputBlur(e, false)}
                  >
                    <option value="">Select a country</option>
                    {Object.entries(countries).map(([code, country]) => (
                      <option key={code} value={code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {/* Flag display */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <CountryFlag countryCode={formData.country || 'US'} className="w-5 h-4" />
                  </div>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Address and Apartment in grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('locations.address', 'Address')}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={getInputClassName(!!errors.address)}
                    style={getInputStyle()}
                    onFocus={handleInputFocus}
                    onBlur={(e) => handleInputBlur(e, !!errors.address)}
                    placeholder={t('locations.addressPlaceholder', '123 Main Street')}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('locations.apartment', 'Apartment, suite, etc.')}
                  </label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    className={getInputClassName(false)}
                    style={getInputStyle()}
                    onFocus={handleInputFocus}
                    onBlur={(e) => handleInputBlur(e, false)}
                    placeholder={t('locations.apartmentPlaceholder', 'Suite 100')}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('locations.phone', 'Phone')}
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 transition-all"
                    style={getInputStyle()}
                    onFocus={handleInputFocus}
                    onBlur={(e) => handleInputBlur(e, false)}
                    placeholder={t('locations.phonePlaceholder', '+1 (555) 123-4567')}
                  />
                </div>
              </div>

              {/* City, State, PIN in grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('locations.city', 'City')}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={getInputClassName(!!errors.city)}
                    style={getInputStyle()}
                    onFocus={handleInputFocus}
                    onBlur={(e) => handleInputBlur(e, !!errors.city)}
                    placeholder={t('locations.cityPlaceholder', 'New York')}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('locations.state', 'State')}
                  </label>
                  {formData.country === 'US' ? (
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className={getInputClassName(!!errors.state)}
                      style={getInputStyle()}
                      onFocus={handleInputFocus}
                      onBlur={(e) => handleInputBlur(e, !!errors.state)}
                    >
                      <option value="">{t('locations.selectState', 'Select state')}</option>
                      {usStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className={getInputClassName(!!errors.state)}
                      style={getInputStyle()}
                      onFocus={handleInputFocus}
                      onBlur={(e) => handleInputBlur(e, !!errors.state)}
                      placeholder={t('locations.statePlaceholder', 'State/Province')}
                    />
                  )}
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('locations.pinCode', 'PIN Code')}
                  </label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className={getInputClassName(false)}
                    style={getInputStyle()}
                    onFocus={handleInputFocus}
                    onBlur={(e) => handleInputBlur(e, false)}
                    placeholder={t('locations.pinCodePlaceholder', '10001')}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                {saving ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('common.saving', 'Saving...')}
                  </span>
                ) : (
                  editingLocation 
                    ? t('common.update', 'Update')
                    : t('common.create', 'Create')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locations List */}
      {!showForm && locations.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center">
          <BuildingStorefrontIcon className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-gray-300" />
          <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
            {t('locations.noLocations', 'No locations')}
          </h3>
          <p className="mt-1 text-[11px] sm:text-sm text-gray-500 dark:text-gray-400">
            {t('locations.getStarted', 'Get started by creating a new location.')}
          </p>
          <div className="mt-4 sm:mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-4 py-2 sm:py-2 text-xs sm:text-sm font-medium text-white rounded sm:rounded-lg hover:opacity-90 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              <PlusIcon className="h-4 sm:h-5 w-4 sm:w-5 mr-1.5 sm:mr-2" />
              <span>{t('locations.addLocation', 'Add Location')}</span>
            </button>
          </div>
        </div>
      )}

      {!showForm && locations.length > 0 && (
        <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
          {locations.map((location) => (
            <div 
              key={location.id} 
              className={`relative bg-white dark:bg-gray-800 rounded sm:rounded-xl shadow-sm border transition-all sm:hover:shadow-md ${
                location.isDefault 
                  ? 'border-green-500 dark:border-green-400' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Default Badge */}
              {location.isDefault && (
                <div className="absolute -top-2 sm:-top-2.5 left-2 sm:left-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500 text-white text-[10px] sm:text-xs font-medium sm:font-semibold rounded-full flex items-center">
                  <CheckCircleIconSolid className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-0.5 sm:mr-1" />
                  <span>{t('locations.default', 'Default')}</span>
                </div>
              )}

              <div className="p-3 sm:p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-2 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] sm:text-lg font-medium sm:font-semibold text-gray-900 dark:text-white flex items-start">
                      <MapPinIcon className="h-3.5 sm:h-5 w-3.5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                      <span className="line-clamp-2">{location.name}</span>
                    </h3>
                    {location.fulfillOnlineOrders && (
                      <span className="inline-flex items-center mt-1 sm:mt-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs font-medium rounded">
                        <GlobeAmericasIcon className="h-3 sm:h-3 w-3 sm:w-3 mr-0.5 sm:mr-1" />
                        <span>{t('locations.fulfillsOrders', 'Fulfills Online Orders')}</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">
                    {!location.isDefault && (
                      <button
                        onClick={() => handleSetDefault(location.id)}
                        className="p-1 sm:p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title={t('locations.setAsDefault', 'Set as default')}
                      >
                        <CheckCircleIcon className="h-3.5 sm:h-5 w-3.5 sm:w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(location)}
                      className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title={t('locations.edit', 'Edit')}
                    >
                      <PencilIcon className="h-3.5 sm:h-5 w-3.5 sm:w-5" />
                    </button>
                    {!location.isDefault && (
                      <button
                        onClick={() => setShowDeleteConfirm(location.id)}
                        disabled={deleting === location.id}
                        className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title={t('locations.delete', 'Delete')}
                      >
                        <TrashIcon className="h-3.5 sm:h-5 w-3.5 sm:w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Address Info */}
                <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                  {location.address && (
                    <div className="flex items-start">
                      <HomeIcon className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                      <div className="text-[10px] sm:text-sm min-w-0 flex-1">
                        <div className="leading-tight">
                          {location.address}
                          {location.apartment && `, ${location.apartment}`}
                        </div>
                        <div className="leading-tight">
                          {location.city && location.city}
                          {location.state && `, ${location.state}`}
                          {location.pinCode && ` ${location.pinCode}`}
                        </div>
                        {location.country && (
                          <div className="flex items-center mt-1 gap-1 sm:gap-1.5">
                            <CountryFlag countryCode={location.country} className="w-3.5 sm:w-4 h-3 sm:h-3" />
                            <span>{countries[location.country as keyof typeof countries]?.name || location.country}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {location.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2 text-gray-400" />
                      <span className="text-[10px] sm:text-sm">{location.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete Confirmation Modal */}
              {showDeleteConfirm === location.id && (
                <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 rounded-lg sm:rounded-xl flex items-center justify-center p-3 sm:p-4">
                  <div className="text-center">
                    <ExclamationTriangleIcon className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-red-500 mb-2 sm:mb-3" />
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                      {t('locations.confirmDelete', 'Delete location?')}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                      {t('locations.deleteWarning', 'This action cannot be undone.')}
                    </p>
                    <div className="flex justify-center space-x-2 sm:space-x-3">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md sm:rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        {t('common.cancel', 'Cancel')}
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        disabled={deleting === location.id}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-white bg-red-600 rounded-md sm:rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {deleting === location.id 
                          ? t('common.deleting', 'Deleting...')
                          : t('common.delete', 'Delete')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
