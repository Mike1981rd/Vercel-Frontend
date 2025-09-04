'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { API_URL } from '@/lib/constants';

interface NewsletterSubscriber {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
}

interface ConvertFormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  birthDate: string;
  gender: string;
  password: string;
  confirmPassword: string;
}

interface ConvertToCustomerModalProps {
  subscriber: NewsletterSubscriber | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  primaryColor: string;
}

export default function ConvertToCustomerModal({ 
  subscriber, 
  isOpen, 
  onClose, 
  onSuccess, 
  primaryColor 
}: ConvertToCustomerModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ConvertFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'DO',
    birthDate: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });

  // Initialize form with subscriber data when modal opens
  useState(() => {
    if (subscriber && isOpen) {
      setFormData(prev => ({
        ...prev,
        firstName: subscriber.firstName || '',
        lastName: subscriber.lastName || '',
        phone: subscriber.phone || ''
      }));
    }
  });

  // Form validation
  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError(t('validation.firstNameRequired', 'El nombre es requerido'));
      return false;
    }
    if (!formData.lastName.trim()) {
      setError(t('validation.lastNameRequired', 'El apellido es requerido'));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t('validation.passwordMinLength', 'La contraseña debe tener al menos 6 caracteres'));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('validation.passwordMismatch', 'Las contraseñas no coinciden'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscriber) return;
    
    setError(null);
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const convertData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        postalCode: formData.postalCode || null,
        country: formData.country,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        gender: formData.gender || null,
        password: formData.password
      };

      const response = await fetch(`${API_URL}/newslettersubscribers/${subscriber.id}/convert-to-customer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(convertData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error converting subscriber');
      }

      // Success
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'DO',
        birthDate: '',
        gender: '',
        password: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Error converting subscriber:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError(t('errors.networkError', 'Error de conexión. Verifique su conexión a internet y que el servidor esté funcionando.'));
      } else if (error instanceof Error) {
        // Parse error message for more specific feedback
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
          setError(t('errors.unauthorized', 'No autorizado para convertir a cliente. Por favor, inicie sesión nuevamente.'));
        } else if (errorMsg.includes('forbidden') || errorMsg.includes('403')) {
          setError(t('errors.forbidden', 'No tiene permisos para convertir subscriptores a clientes. Contacte al administrador.'));
        } else if (errorMsg.includes('not found') || errorMsg.includes('404')) {
          setError(t('errors.notFound', 'El subscriptor no existe o fue eliminado previamente.'));
        } else if (errorMsg.includes('conflict') || errorMsg.includes('409')) {
          setError(t('errors.conflict', 'El subscriptor ya fue convertido a cliente anteriormente.'));
        } else if (errorMsg.includes('validation') || errorMsg.includes('422')) {
          setError(t('errors.validationError', 'Datos inválidos para crear cliente. Verifique la información ingresada.'));
        } else {
          setError(t('errors.unexpectedError', `Error inesperado al convertir subscriptor: ${error.message}`));
        }
      } else {
        setError(t('errors.unexpectedError', 'Error inesperado al convertir subscriptor. Intente nuevamente.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ConvertFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
    }
  };

  // Input styles with primary color focus
  const getInputClassName = (hasError: boolean = false) => {
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

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#d1d5db';
    e.target.style.boxShadow = '';
  };

  if (!isOpen || !subscriber) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('subscribers.convertToCustomer', 'Convertir a Cliente')}
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Subscriber Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            {t('subscribers.convertingSubscriber', 'Convirtiendo suscriptor:')}
          </p>
          <p className="font-medium text-gray-900 dark:text-white">{subscriber.email}</p>
          {subscriber.fullName && (
            <p className="text-sm text-gray-500">{subscriber.fullName}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              {t('customers.personalInfo', 'Información Personal')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customers.firstName', 'Nombre')} *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className={getInputClassName()}
                  style={getInputStyle()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={t('customers.enterFirstName', 'Ingrese el nombre')}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customers.lastName', 'Apellido')} *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className={getInputClassName()}
                  style={getInputStyle()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={t('customers.enterLastName', 'Ingrese el apellido')}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customers.phone', 'Teléfono')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={getInputClassName()}
                  style={getInputStyle()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={t('customers.enterPhone', 'Ingrese el teléfono')}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customers.country', 'País')}
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className={getInputClassName()}
                  style={getInputStyle()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  disabled={loading}
                >
                  <option value="DO">República Dominicana</option>
                  <option value="US">Estados Unidos</option>
                  <option value="ES">España</option>
                  <option value="MX">México</option>
                  <option value="CO">Colombia</option>
                  <option value="AR">Argentina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customers.birthDate', 'Fecha de Nacimiento')}
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  className={getInputClassName()}
                  style={getInputStyle()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customers.gender', 'Género')}
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className={getInputClassName()}
                  style={getInputStyle()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  disabled={loading}
                >
                  <option value="">{t('customers.selectGender', 'Seleccionar género')}</option>
                  <option value="male">{t('customers.male', 'Masculino')}</option>
                  <option value="female">{t('customers.female', 'Femenino')}</option>
                  <option value="other">{t('customers.other', 'Otro')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              {t('customers.addressInfo', 'Información de Dirección')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customers.address', 'Dirección')}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={getInputClassName()}
                  style={getInputStyle()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={t('customers.enterAddress', 'Ingrese la dirección')}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customers.city', 'Ciudad')}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={getInputClassName()}
                  style={getInputStyle()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={t('customers.enterCity', 'Ingrese la ciudad')}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customers.postalCode', 'Código Postal')}
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className={getInputClassName()}
                  style={getInputStyle()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={t('customers.enterPostalCode', 'Ingrese el código postal')}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              {t('customers.accountInfo', 'Información de Cuenta')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customers.password', 'Contraseña')} *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={getInputClassName()}
                  style={getInputStyle()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={t('customers.enterPassword', 'Ingrese la contraseña')}
                  disabled={loading}
                  minLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('customers.passwordMinLength', 'Mínimo 6 caracteres')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('customers.confirmPassword', 'Confirmar Contraseña')} *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={getInputClassName()}
                  style={getInputStyle()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={t('customers.confirmPassword', 'Confirmar contraseña')}
                  disabled={loading}
                  minLength={6}
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.firstName || !formData.lastName || !formData.password}
              className="px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {t('subscribers.converting', 'Convirtiendo...')}
                </span>
              ) : (
                t('subscribers.convertToCustomer', 'Convertir a Cliente')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
