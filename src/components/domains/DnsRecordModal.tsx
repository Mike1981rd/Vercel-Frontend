import React, { useState, useEffect } from 'react';
import { X, Info, AlertCircle } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export interface DnsRecord {
  id?: number;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SOA' | 'PTR' | 'SRV' | 'CAA';
  host: string;
  value: string;
  ttl: number;
  priority?: number;
  port?: number;
  weight?: number;
  isActive: boolean;
}

interface DnsRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: DnsRecord) => void;
  record?: DnsRecord | null;
  primaryColor: string;
}

const dnsTypes = [
  { value: 'A', label: 'A Record', description: 'Points to IPv4 address' },
  { value: 'AAAA', label: 'AAAA Record', description: 'Points to IPv6 address' },
  { value: 'CNAME', label: 'CNAME Record', description: 'Alias to another domain' },
  { value: 'MX', label: 'MX Record', description: 'Mail exchange server' },
  { value: 'TXT', label: 'TXT Record', description: 'Text information' },
  { value: 'NS', label: 'NS Record', description: 'Name server' },
  { value: 'CAA', label: 'CAA Record', description: 'Certificate authority' },
  { value: 'SRV', label: 'SRV Record', description: 'Service record' },
];

const ttlOptions = [
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 900, label: '15 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
  { value: 7200, label: '2 hours' },
  { value: 14400, label: '4 hours' },
  { value: 28800, label: '8 hours' },
  { value: 43200, label: '12 hours' },
  { value: 86400, label: '24 hours' },
];

export default function DnsRecordModal({ isOpen, onClose, onSave, record, primaryColor }: DnsRecordModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<DnsRecord>({
    type: 'A',
    host: '@',
    value: '',
    ttl: 3600,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        type: 'A',
        host: '@',
        value: '',
        ttl: 3600,
        isActive: true,
      });
    }
    setErrors({});
  }, [record, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.host.trim()) {
      newErrors.host = t('domains.dns.hostRequired', 'El host es requerido');
    }

    if (!formData.value.trim()) {
      newErrors.value = t('domains.dns.valueRequired', 'El valor es requerido');
    } else {
      // Validate based on record type
      if (formData.type === 'A') {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipv4Regex.test(formData.value)) {
          newErrors.value = t('domains.dns.invalidIPv4', 'Ingrese una dirección IPv4 válida');
        }
      } else if (formData.type === 'CNAME' || formData.type === 'MX' || formData.type === 'NS') {
        const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/;
        if (!domainRegex.test(formData.value) && formData.value !== '@') {
          newErrors.value = t('domains.dns.invalidDomain', 'Ingrese un dominio válido');
        }
      }
    }

    if (formData.type === 'MX' && !formData.priority) {
      newErrors.priority = t('domains.dns.priorityRequired', 'La prioridad es requerida para registros MX');
    }

    if (formData.type === 'SRV') {
      if (!formData.priority) newErrors.priority = t('domains.dns.priorityRequired', 'Requerido');
      if (!formData.weight) newErrors.weight = t('domains.dns.weightRequired', 'Requerido');
      if (!formData.port) newErrors.port = t('domains.dns.portRequired', 'Requerido');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = primaryColor;
    e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fieldName = e.target.name;
    e.target.style.borderColor = errors[fieldName] ? '#fca5a5' : '#d1d5db';
    e.target.style.boxShadow = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {record 
              ? t('domains.dns.editRecord', 'Editar Registro DNS')
              : t('domains.dns.addRecord', 'Agregar Registro DNS')
            }
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* DNS Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('domains.dns.type', 'Tipo de Registro')}
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              onFocus={handleInputFocus}
              onBlur={(e) => handleInputBlur(e)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none transition-all"
            >
              {dnsTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Host */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('domains.dns.host', 'Host')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="host"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur(e)}
                placeholder="@ for root, www, mail, etc."
                className={`w-full px-4 py-2 border rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none transition-all
                         ${errors.host ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.host && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.host}
                </p>
              )}
            </div>

            {/* TTL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('domains.dns.ttl', 'TTL')}
              </label>
              <select
                name="ttl"
                value={formData.ttl}
                onChange={(e) => setFormData({ ...formData, ttl: parseInt(e.target.value) })}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur(e)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none transition-all"
              >
                {ttlOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('domains.dns.value', 'Valor')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              onFocus={handleInputFocus}
              onBlur={(e) => handleInputBlur(e)}
              placeholder={
                formData.type === 'A' ? '192.168.1.1' :
                formData.type === 'CNAME' ? 'example.com' :
                formData.type === 'MX' ? 'mail.example.com' :
                formData.type === 'TXT' ? 'v=spf1 include:_spf.example.com ~all' :
                'Value'
              }
              className={`w-full px-4 py-2 border rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none transition-all
                       ${errors.value ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.value && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.value}
              </p>
            )}
          </div>

          {/* MX Priority */}
          {formData.type === 'MX' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('domains.dns.priority', 'Prioridad')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                name="priority"
                value={formData.priority || ''}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || undefined })}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur(e)}
                placeholder="10"
                min="0"
                max="65535"
                className={`w-full px-4 py-2 border rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none transition-all
                         ${errors.priority ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.priority && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.priority}
                </p>
              )}
            </div>
          )}

          {/* SRV Fields */}
          {formData.type === 'SRV' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('domains.dns.priority', 'Prioridad')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  name="priority"
                  value={formData.priority || ''}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || undefined })}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur(e)}
                  min="0"
                  max="65535"
                  className={`w-full px-4 py-2 border rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none transition-all
                           ${errors.priority ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('domains.dns.weight', 'Peso')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || undefined })}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur(e)}
                  min="0"
                  max="65535"
                  className={`w-full px-4 py-2 border rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none transition-all
                           ${errors.weight ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('domains.dns.port', 'Puerto')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  name="port"
                  value={formData.port || ''}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || undefined })}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur(e)}
                  min="0"
                  max="65535"
                  className={`w-full px-4 py-2 border rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none transition-all
                           ${errors.port ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
                />
              </div>
            </div>
          )}

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
              style={{ accentColor: primaryColor }}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('domains.dns.activeRecord', 'Registro activo')}
            </label>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">
                  {t('domains.dns.propagationNote', 'Nota sobre propagación DNS')}
                </p>
                <p className="text-xs">
                  {t('domains.dns.propagationTime', 
                    'Los cambios en los registros DNS pueden tardar hasta 24-48 horas en propagarse completamente a nivel mundial.')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 
                       dark:hover:text-gray-200 transition-colors"
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {record 
                ? t('common.update', 'Actualizar')
                : t('common.add', 'Agregar')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}