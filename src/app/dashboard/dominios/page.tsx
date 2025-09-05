'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, Shield, Calendar, Server, Save, AlertCircle, CheckCircle,
  Plus, Edit2, Trash2, ChevronDown, ChevronRight
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import DomainStatusBadge from '@/components/domains/DomainStatusBadge';
import DnsRecordsList from '@/components/domains/DnsRecordsList';
import DnsRecordModal, { DnsRecord } from '@/components/domains/DnsRecordModal';
import { API_URL } from '@/lib/constants';

interface DomainFormData {
  id?: number;
  domainName: string;
  subDomain: string;
  status: 'pending' | 'active' | 'inactive' | 'suspended' | 'expired' | 'transferring' | 'failed';
  isActive: boolean;
  isPrimary: boolean;
  hasSSL: boolean;
  sslExpiryDate: string;
  sslProvider: string;
  provider: string;
  expiryDate: string;
  notes: string;
  dnsRecords: DnsRecord[];
}

export default function DomainsPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDnsModal, setShowDnsModal] = useState(false);
  const [editingDnsRecord, setEditingDnsRecord] = useState<DnsRecord | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    ssl: false,
    dns: false
  });

  const [formData, setFormData] = useState<DomainFormData>({
    domainName: '',
    subDomain: '',
    status: 'pending',
    isActive: true,
    isPrimary: true,
    hasSSL: false,
    sslExpiryDate: '',
    sslProvider: '',
    provider: '',
    expiryDate: '',
    notes: '',
    dnsRecords: []
  });

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
    fetchDomain();
  }, []);

  const fetchDomain = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/domains`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const domain = result.data[0];
          setIsEditMode(true);
          
          // Mapear el dominio existente al formulario
          setFormData({
            id: domain.id,
            domainName: domain.domainName || '',
            subDomain: domain.subDomain || '',
            status: mapStatusFromNumber(domain.status),
            isActive: domain.isActive,
            isPrimary: domain.isPrimary,
            hasSSL: domain.hasSsl,
            sslExpiryDate: domain.sslExpiryDate ? domain.sslExpiryDate.split('T')[0] : '',
            sslProvider: domain.sslProvider || '',
            provider: domain.provider || '',
            expiryDate: domain.expiryDate ? domain.expiryDate.split('T')[0] : '',
            notes: domain.notes || '',
            dnsRecords: domain.dnsRecords?.map((r: any) => ({
              type: mapDnsTypeFromNumber(r.type),
              host: r.host,
              value: r.value,
              ttl: r.ttl,
              priority: r.priority,
              port: r.port,
              weight: r.weight,
              isActive: r.isActive
            })) || []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching domain:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapStatusFromNumber = (status: number): DomainFormData['status'] => {
    const statusMap: { [key: number]: DomainFormData['status'] } = {
      0: 'pending',
      1: 'active',
      2: 'inactive',
      3: 'suspended',
      4: 'expired',
      5: 'transferring',
      6: 'failed'
    };
    return statusMap[status] || 'pending';
  };

  const mapDnsTypeFromNumber = (type: number): string => {
    const typeMap: { [key: number]: string } = {
      0: 'A',
      1: 'AAAA',
      2: 'CNAME',
      3: 'MX',
      4: 'TXT',
      5: 'NS',
      6: 'SOA',
      7: 'PTR',
      8: 'SRV',
      9: 'CAA'
    };
    return typeMap[type] || 'A';
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = primaryColor;
    e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#d1d5db';
    e.target.style.boxShadow = '';
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAddDnsRecord = (record: DnsRecord) => {
    if (editingDnsRecord) {
      setFormData({
        ...formData,
        dnsRecords: formData.dnsRecords.map(r => 
          r === editingDnsRecord ? record : r
        )
      });
    } else {
      setFormData({
        ...formData,
        dnsRecords: [...formData.dnsRecords, record]
      });
    }
    setEditingDnsRecord(null);
  };

  const handleEditDnsRecord = (record: DnsRecord) => {
    setEditingDnsRecord(record);
    setShowDnsModal(true);
  };

  const handleDeleteDnsRecord = (record: DnsRecord) => {
    if (confirm(t('domains.dns.confirmDelete'))) {
      setFormData({
        ...formData,
        dnsRecords: formData.dnsRecords.filter(r => r !== record)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const url = isEditMode 
        ? `${API_URL}/domains/${formData.id}`
        : `${API_URL}/domains`;
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const payload = {
        domainName: formData.domainName,
        subDomain: formData.subDomain || null,
        status: formData.status === 'pending' ? 0 : 
                formData.status === 'active' ? 1 :
                formData.status === 'inactive' ? 2 :
                formData.status === 'suspended' ? 3 :
                formData.status === 'expired' ? 4 :
                formData.status === 'transferring' ? 5 : 6,
        isActive: formData.isActive,
        isPrimary: formData.isPrimary,
        hasSsl: formData.hasSSL,
        sslExpiryDate: formData.sslExpiryDate || null,
        sslProvider: formData.sslProvider || null,
        provider: formData.provider || null,
        expiryDate: formData.expiryDate || null,
        notes: formData.notes || null,
        dnsRecords: formData.dnsRecords.map(r => ({
          type: r.type === 'A' ? 0 :
                r.type === 'AAAA' ? 1 :
                r.type === 'CNAME' ? 2 :
                r.type === 'MX' ? 3 :
                r.type === 'TXT' ? 4 :
                r.type === 'NS' ? 5 :
                r.type === 'SOA' ? 6 :
                r.type === 'PTR' ? 7 :
                r.type === 'SRV' ? 8 : 9,
          host: r.host,
          value: r.value,
          ttl: r.ttl,
          priority: r.priority,
          port: r.port,
          weight: r.weight,
          isActive: r.isActive
        }))
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(isEditMode 
          ? t('domains.updated')
          : t('domains.created')
        );
        
        if (!isEditMode && data.data?.id) {
          setFormData({ ...formData, id: data.data.id });
          setIsEditMode(true);
        }
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.message || t('domains.error'));
      }
    } catch (error) {
      console.error('Error saving domain:', error);
      setErrorMessage(t('domains.unexpectedError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-green-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isEditMode ? t('domains.edit') : t('domains.create')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {isEditMode 
              ? t('domains.editDescription')
              : t('domains.createDescription')
            }
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-300">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('basic')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('domains.basicInfo')}
                </h2>
              </div>
              {expandedSections.basic ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.basic && (
              <div className="px-6 pb-6 space-y-6 border-t border-gray-100 dark:border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('domains.domainName')}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.domainName}
                      onChange={(e) => setFormData({ ...formData, domainName: e.target.value })}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="ejemplo.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('domains.status')}
                    </label>
                    <div className="flex items-center gap-4">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:outline-none transition-all"
                      >
                        <option value="pending">{t('domains.status.pending')}</option>
                        <option value="active">{t('domains.status.active')}</option>
                        <option value="inactive">{t('domains.status.inactive')}</option>
                        <option value="suspended">{t('domains.status.suspended')}</option>
                        <option value="expired">{t('domains.status.expired')}</option>
                      </select>
                      <DomainStatusBadge status={formData.status} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('domains.provider')}
                    </label>
                    <input
                      type="text"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="GoDaddy, Namecheap, etc."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('domains.expiryDate')}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:outline-none transition-all"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                      style={{ accentColor: primaryColor }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('domains.activeDomain')}
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                      style={{ accentColor: primaryColor }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('domains.primaryDomain')}
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SSL Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('ssl')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('domains.sslConfig')}
                </h2>
              </div>
              {expandedSections.ssl ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.ssl && (
              <div className="px-6 pb-6 space-y-6 border-t border-gray-100 dark:border-gray-700/50">
                <div className="mt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasSSL}
                      onChange={(e) => setFormData({ ...formData, hasSSL: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                      style={{ accentColor: primaryColor }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('domains.hasSSL')}
                    </span>
                  </label>
                </div>

                {formData.hasSSL && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-7">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('domains.sslProvider')}
                      </label>
                      <input
                        type="text"
                        value={formData.sslProvider}
                        onChange={(e) => setFormData({ ...formData, sslProvider: e.target.value })}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="Let's Encrypt, Cloudflare"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('domains.sslExpiryDate')}
                      </label>
                      <input
                        type="date"
                        value={formData.sslExpiryDate}
                        onChange={(e) => setFormData({ ...formData, sslExpiryDate: e.target.value })}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DNS Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('dns')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('domains.dnsConfig')}
                </h2>
                {formData.dnsRecords.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                    {formData.dnsRecords.length}
                  </span>
                )}
              </div>
              {expandedSections.dns ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.dns && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex justify-between items-center mt-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('domains.dnsDescription')}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDnsRecord(null);
                      setShowDnsModal(true);
                    }}
                    className="px-3 py-1.5 text-sm text-white rounded-lg transition-colors flex items-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus className="w-4 h-4" />
                    {t('domains.dns.addRecord')}
                  </button>
                </div>

                <DnsRecordsList
                  records={formData.dnsRecords}
                  onEdit={handleEditDnsRecord}
                  onDelete={handleDeleteDnsRecord}
                  primaryColor={primaryColor}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !formData.domainName}
              className="px-6 py-2.5 text-white rounded-lg transition-all 
                       flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: formData.domainName && !saving ? primaryColor : '#9ca3af' 
              }}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('common.save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* DNS Modal */}
      <DnsRecordModal
        isOpen={showDnsModal}
        onClose={() => {
          setShowDnsModal(false);
          setEditingDnsRecord(null);
        }}
        onSave={handleAddDnsRecord}
        record={editingDnsRecord}
        primaryColor={primaryColor}
      />
    </div>
  );
}
