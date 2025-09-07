'use client';

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { CustomerDetailDto } from '@/types/customer';
import { AddressBillingFormData } from '../CustomerDetail';
import { customerAPI } from '@/lib/api/customers';
import { CountryFlag, countries } from '@/components/ui/CountryFlag';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CustomerAddressBillingTabProps {
  customer: CustomerDetailDto | null;
  formData: AddressBillingFormData;
  onFormChange: (data: Partial<AddressBillingFormData>) => void;
  primaryColor: string;
  onRefresh: () => void;
  isNewCustomer?: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

export default function CustomerAddressBillingTab({ 
  customer, 
  formData,
  onFormChange,
  primaryColor, 
  onRefresh, 
  isNewCustomer = false,
  isEditing,
  setIsEditing
}: CustomerAddressBillingTabProps) {
  const { t } = useI18n();
  const { baseCurrency } = useCurrency();
  const [useSameAddress, setUseSameAddress] = useState(false);
  const [payments, setPayments] = useState<Array<{ reservationId: number; amount: number; method: string; status: string; date: string; transactionId?: string }>>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const formatMoney = (amount?: number, currency?: string) => {
    if (amount === undefined || amount === null) return '-';
    try {
      const cur = currency || baseCurrency || 'DOP';
      if (!cur) return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formatted = new Intl.NumberFormat(undefined, { style: 'currency', currency: cur as any }).format(amount);
      return `${cur} ${formatted.replace(/[^0-9.,\s]/g, '').trim()}`;
    } catch {
      return `${currency || baseCurrency || ''} ${amount.toFixed(2)}`.trim();
    }
  };

  // Export helpers for payments history
  const exportPaymentsToCSV = () => {
    try {
      const headers = ['Fecha', 'Monto', 'Moneda', 'Método', 'Estado', 'Reserva', 'Transacción'];
      const rows = payments.map(p => [
        new Date(p.date).toLocaleString(),
        (p.amount ?? 0).toFixed(2),
        baseCurrency || 'DOP',
        p.method || '',
        p.status || '',
        `#${p.reservationId}`,
        p.transactionId || ''
      ]);

      let csv = '\uFEFF' + headers.join(',') + '\n';
      rows.forEach(r => { csv += r.map(cell => `"${(cell ?? '').toString().replace(/"/g, '""')}"`).join(',') + '\n'; });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (e) { /* no-op */ }
  };

  const exportPaymentsToExcel = () => {
      try {
        let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
        html += '<head><meta charset="utf-8"><title>Payments Export</title></head>';
        html += '<body><table border="1">';
        html += '<tr style="background-color:#f0f0f0;font-weight:bold;">';
        html += '<th>Fecha</th><th>Monto</th><th>Moneda</th><th>Método</th><th>Estado</th><th>Reserva</th><th>Transacción</th></tr>';
        payments.forEach(p => {
          html += '<tr>';
          html += `<td>${new Date(p.date).toLocaleString()}</td>`;
          html += `<td>${(p.amount ?? 0).toFixed(2)}</td>`;
          html += `<td>${baseCurrency || 'DOP'}</td>`;
          html += `<td>${p.method || ''}</td>`;
          html += `<td>${p.status || ''}</td>`;
          html += `<td>#${p.reservationId}</td>`;
          html += `<td>${p.transactionId || ''}</td>`;
          html += '</tr>';
        });
        html += '</table></body></html>';

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `payments_${new Date().toISOString().split('T')[0]}.xls`;
        link.click();
      } catch (e) { /* no-op */ }
  };

  const exportPaymentsToPDF = () => {
    try {
      const w = window.open('', '_blank');
      if (!w) { alert(t('rolesUsers.popupBlocked', 'Please allow popups to export PDF')); return; }
      const rows = payments.map(p => `
        <tr>
          <td>${new Date(p.date).toLocaleString()}</td>
          <td>${(p.amount ?? 0).toFixed(2)}</td>
          <td>${baseCurrency || 'DOP'}</td>
          <td>${p.method || ''}</td>
          <td>${p.status || ''}</td>
          <td>#${p.reservationId}</td>
          <td>${p.transactionId || ''}</td>
        </tr>`).join('');
      const html = `<!DOCTYPE html>
      <html><head><meta charset="utf-8"/>
        <title>Payments Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          h1 { font-size: 18px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h1>${t('customers.payments.history','Historial de Pagos')} - ${new Date().toLocaleDateString()}</h1>
        <table>
          <thead>
            <tr>
              <th>Fecha</th><th>Monto</th><th>Moneda</th><th>Método</th><th>Estado</th><th>Reserva</th><th>Transacción</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>`;
      w.document.write(html);
      w.document.close();
      w.onload = () => w.print();
    } catch (e) { /* no-op */ }
  };
  
  const handleAddressChange = (field: string, value: any) => {
    // Always update the first address (primary address)
    if (formData.addresses.length === 0) {
      // Create new address with the field being changed
      onFormChange({ 
        addresses: [{
          type: 'shipping',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
          isDefault: true,
          [field]: value  // Include the field being changed
        }]
      });
    } else {
      const updatedAddresses = [...formData.addresses];
      updatedAddresses[0] = {
        ...updatedAddresses[0],
        [field]: value
      };
      onFormChange({ addresses: updatedAddresses });
    }
  };

  const handleBillingPreferenceChange = (field: string, value: any) => {
    onFormChange({
      billingPreferences: {
        ...formData.billingPreferences,
        [field]: value
      }
    });
  };

  const handleDeletePaymentMethod = (index: number) => {
    if (confirm(t('customers.payments.confirmDelete', 'Are you sure you want to delete this payment method?'))) {
      const updatedPayments = formData.paymentMethods.filter((_, i) => i !== index);
      onFormChange({ paymentMethods: updatedPayments });
    }
  };

  const handleSetDefaultPayment = (index: number) => {
    const updatedPayments = formData.paymentMethods.map((payment, i) => ({
      ...payment,
      isDefault: i === index
    }));
    onFormChange({ paymentMethods: updatedPayments });
  };

  // Initialize first address for new customer - use useEffect to avoid setState during render
  React.useEffect(() => {
    if (formData.addresses.length === 0) {
      onFormChange({ 
        addresses: [{
          type: 'shipping',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
          isDefault: true
        }]
      });
    }
  }, []); // Empty dependency array - only run once on mount

  // Load payments history for this customer (by customerId)
  useEffect(() => {
    (async () => {
      try {
        if (customer?.id) {
          const list = await customerAPI.getCustomerPayments(customer.id);
          setPayments(list);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [customer?.id]);

  return (
    <div className="relative min-h-screen pb-20 md:pb-6">
      <div className="p-4 md:p-6">
        {/* Summary: Default Payment Method and Total Spent */}
        {!isNewCustomer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('customers.payments.defaultMethod', 'Método de pago predeterminado')}</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {formData.paymentMethods?.find(p => p.isDefault)
                  ? `•••• ${formData.paymentMethods.find(p => p.isDefault)!.last4} · ${t('customers.payments.expires', 'Vence')} ${formData.paymentMethods.find(p => p.isDefault)!.expiryMonth}/${formData.paymentMethods.find(p => p.isDefault)!.expiryYear}`
                  : t('customers.payments.noDefault', 'Sin método predeterminado')}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('customers.overview.totalSpent', 'Monto total gastado')}</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {formatMoney(customer?.totalSpent, baseCurrency)}
              </p>
            </div>
          </div>
        )}
        {/* Payments History */}
        {!isNewCustomer && (
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {t('customers.payments.history', 'Historial de Pagos')}
              </h3>
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                style={{ '--tw-ring-color': primaryColor } as any}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7 7-7Z"/>
                </svg>
                {t('customers.payments.export', 'Exportar')}
              </button>
            </div>
            {payments.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-sm text-gray-600 dark:text-gray-300">
                {t('customers.payments.noHistory', 'No se encontraron pagos para este cliente')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="text-left px-4 py-2">{t('customers.payments.date', 'Fecha')}</th>
                      <th className="text-left px-4 py-2">{t('customers.payments.amount', 'Monto')}</th>
                      <th className="text-left px-4 py-2">{t('customers.payments.method', 'Método')}</th>
                      <th className="text-left px-4 py-2">{t('customers.payments.status', 'Estado')}</th>
                      <th className="text-left px-4 py-2">{t('customers.payments.reservation', 'Reserva')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {payments.map((p, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{new Date(p.date).toLocaleString()}</td>
                        <td className="px-4 py-2">{formatMoney(p.amount, baseCurrency)}</td>
                        <td className="px-4 py-2">{p.method}</td>
                        <td className="px-4 py-2">{p.status}</td>
                        <td className="px-4 py-2">#{p.reservationId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('rolesUsers.exportData', 'Export Data')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('rolesUsers.selectFormat', 'Select the format you want to export')}
              </p>
              <div className="space-y-3">
                <button onClick={() => { exportPaymentsToExcel(); setShowExportModal(false); }}
                        className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center text-green-600">XLS</div>
                  <div className="text-left">
                    <p className="font-medium">Excel</p>
                    <p className="text-xs text-gray-500">.xls</p>
                  </div>
                </button>
                <button onClick={() => { exportPaymentsToCSV(); setShowExportModal(false); }}
                        className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">CSV</div>
                  <div className="text-left">
                    <p className="font-medium">CSV</p>
                    <p className="text-xs text-gray-500">.csv</p>
                  </div>
                </button>
                <button onClick={() => { exportPaymentsToPDF(); setShowExportModal(false); }}
                        className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-red-100 flex items-center justify-center text-red-600">PDF</div>
                  <div className="text-left">
                    <p className="font-medium">PDF</p>
                    <p className="text-xs text-gray-500">Print/Save as PDF</p>
                  </div>
                </button>
              </div>
              <div className="mt-4 text-right">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  {t('common.cancel', 'Cancelar')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Addresses Section - Always show form like in CreateCliente */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('customers.addresses.title', 'Direcciones')}
          </h3>
          
          {/* Main form container */}
          <div className="space-y-4">
            {/* Dirección Principal section */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('customers.addresses.mainAddress', 'Dirección Principal')}
              </h4>
              
              <div className="space-y-4">
                {/* Street Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('customers.addresses.streetLabel', 'Dirección de Calle')}
                  </label>
                  <input
                    type="text"
                    maxLength={255}
                    value={formData.addresses[0]?.addressLine1 || ''}
                    onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    placeholder={t('customers.addresses.streetPlaceholder', 'Calle Principal 123')}
                  />
                </div>
                
                {/* Two column grid for Apartment/Suite and City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customers.addresses.apartment', 'Apartamento/Suite')}
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formData.addresses[0]?.addressLine2 || ''}
                      onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder={t('customers.addresses.apartmentPlaceholder', 'Depto 4B')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customers.addresses.city', 'Ciudad')}
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formData.addresses[0]?.city || ''}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder={t('customers.addresses.cityPlaceholder', 'Ciudad de México')}
                    />
                  </div>
                </div>
                
                {/* Two column grid for State and Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customers.addresses.state', 'Estado/Provincia')}
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formData.addresses[0]?.state || ''}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder={t('customers.addresses.statePlaceholder', 'CDMX')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customers.addresses.postalCode', 'Código Postal')}
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={formData.addresses[0]?.postalCode || ''}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder={t('customers.addresses.postalCodePlaceholder', '01000')}
                    />
                  </div>
                </div>
                
                {/* Two column grid for Country and Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customers.addresses.country', 'País')}
                    </label>
                    <div className="relative">
                      <select
                        value={formData.addresses[0]?.country || ''}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all appearance-none"
                        style={{ '--tw-ring-color': primaryColor } as any}
                      >
                        <option value="">{t('customers.addresses.countryPlaceholder', 'Seleccionar País')}</option>
                        {Object.entries(countries).map(([code, country]) => (
                          <option key={code} value={code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      {formData.addresses[0]?.country && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <CountryFlag countryCode={formData.addresses[0].country} className="w-5 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customers.addresses.type', 'Tipo')}
                    </label>
                    <select
                      value={formData.addresses[0]?.type || 'shipping'}
                      onChange={(e) => handleAddressChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                    >
                      <option value="billing">{t('customers.addresses.billing', 'Facturación')}</option>
                      <option value="shipping">{t('customers.addresses.shipping', 'Envío')}</option>
                      <option value="both">{t('customers.addresses.both', 'Ambos')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Address Section */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('customers.billingAddress.title', 'Dirección de Facturación')}
          </h3>
          
          <div className="space-y-4">
            {/* Checkbox to use same address */}
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="useSameAddress"
                checked={useSameAddress}
                onChange={(e) => {
                  setUseSameAddress(e.target.checked);
                  if (e.target.checked && formData.addresses[0]) {
                    // Copy shipping address to billing
                    onFormChange({
                      billingAddress: formData.addresses[0].addressLine1,
                      billingApartment: formData.addresses[0].addressLine2,
                      billingCity: formData.addresses[0].city,
                      billingState: formData.addresses[0].state,
                      billingPostalCode: formData.addresses[0].postalCode,
                      billingCountry: formData.addresses[0].country
                    });
                  }
                }}
                className="h-4 w-4 rounded"
                style={{ accentColor: primaryColor }}
              />
              <label htmlFor="useSameAddress" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('customers.billingAddress.sameAsShipping', 'Usar la misma dirección de envío')}
              </label>
            </div>

            {!useSameAddress && (
              <div className="space-y-4">
                {/* Billing Street Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('customers.billingAddress.street', 'Dirección de Calle')}
                  </label>
                  <input
                    type="text"
                    maxLength={255}
                    value={formData.billingAddress || ''}
                    onChange={(e) => onFormChange({ billingAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    placeholder={t('customers.billingAddress.streetPlaceholder', 'Calle Principal 123')}
                  />
                </div>
                
                {/* Two column grid for Apartment/Suite and City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customers.billingAddress.apartment', 'Apartamento/Suite')}
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formData.billingApartment || ''}
                      onChange={(e) => onFormChange({ billingApartment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder={t('customers.billingAddress.apartmentPlaceholder', 'Depto 4B')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customers.billingAddress.city', 'Ciudad')}
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formData.billingCity || ''}
                      onChange={(e) => onFormChange({ billingCity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder={t('customers.billingAddress.cityPlaceholder', 'Ciudad de México')}
                    />
                  </div>
                </div>
                
                {/* Two column grid for State and Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customers.billingAddress.state', 'Estado/Provincia')}
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formData.billingState || ''}
                      onChange={(e) => onFormChange({ billingState: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder={t('customers.billingAddress.statePlaceholder', 'CDMX')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customers.billingAddress.postalCode', 'Código Postal')}
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={formData.billingPostalCode || ''}
                      onChange={(e) => onFormChange({ billingPostalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder={t('customers.billingAddress.postalCodePlaceholder', '01000')}
                    />
                  </div>
                </div>
                
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('customers.billingAddress.country', 'País')}
                  </label>
                  <div className="relative">
                    <select
                      value={formData.billingCountry || ''}
                      onChange={(e) => onFormChange({ billingCountry: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all appearance-none"
                      style={{ '--tw-ring-color': primaryColor } as any}
                    >
                      <option value="">{t('customers.billingAddress.countryPlaceholder', 'Seleccionar País')}</option>
                      {Object.entries(countries).map(([code, country]) => (
                        <option key={code} value={code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {formData.billingCountry && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <CountryFlag countryCode={formData.billingCountry} className="w-5 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Section - Only for existing customers */}
        {!isNewCustomer && (
          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('customers.payments.title', 'Métodos de Pago')}
            </h3>

            {/* Mobile: Payment Cards */}
            <div className="md:hidden space-y-3">
              {formData.paymentMethods && formData.paymentMethods.length > 0 ? (
                formData.paymentMethods.map((payment, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">💳</div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            •••• {payment.last4}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t('customers.payments.expires', 'Expires')} {payment.expiryMonth}/{payment.expiryYear}
                          </p>
                        </div>
                      </div>
                      {payment.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                          {t('customers.payments.default', 'Default')}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {!payment.isDefault && (
                        <button
                          onClick={() => handleSetDefaultPayment(index)}
                          className="flex-1 px-3 py-1.5 text-xs font-medium border rounded-lg"
                          style={{ borderColor: primaryColor, color: primaryColor }}
                        >
                          {t('customers.payments.setDefault', 'Set Default')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePaymentMethod(index)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg"
                      >
                        {t('common.delete', 'Delete')}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('customers.payments.noPayments', 'No se encontraron métodos de pago')}
                  </p>
                </div>
              )}
            </div>

            {/* Desktop: Payment Grid */}
            <div className="hidden md:grid md:grid-cols-2 gap-4">
              {formData.paymentMethods && formData.paymentMethods.length > 0 ? (
                formData.paymentMethods.map((payment, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative">
                    {payment.isDefault && (
                      <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                        {t('customers.payments.default', 'Default')}
                      </span>
                    )}
                    
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">💳</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ending in {payment.last4}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('customers.payments.expires', 'Expires')} {payment.expiryMonth}/{payment.expiryYear}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {!payment.isDefault && (
                        <button
                          onClick={() => handleSetDefaultPayment(index)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          {t('customers.payments.setDefault', 'Set as Default')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePaymentMethod(index)}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        {t('common.delete', 'Delete')}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('customers.payments.noPayments', 'No se encontraron métodos de pago')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Billing Preferences */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('customers.billing.preferences', 'Preferencias de Facturación')}
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('customers.billing.invoiceEmail', 'Correo de Facturación')}
                </label>
                <input
                  type="email"
                  value={formData.billingPreferences.invoiceEmail}
                  onChange={(e) => handleBillingPreferenceChange('invoiceEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  placeholder={t('customers.billing.invoiceEmailPlaceholder', 'facturacion@ejemplo.com')}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.billingPreferences.autoCharge}
                  onChange={(e) => handleBillingPreferenceChange('autoCharge', e.target.checked)}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: primaryColor }}
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('customers.billing.autoCharge', 'Cargo Automático')}
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {t('customers.billing.autoChargeDescription', 'Cargar automáticamente el método de pago para suscripciones')}
                  </span>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.billingPreferences.paperlessBilling}
                  onChange={(e) => handleBillingPreferenceChange('paperlessBilling', e.target.checked)}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: primaryColor }}
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('customers.billing.paperlessBilling', 'Facturación sin Papel')}
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {t('customers.billing.paperlessDescription', 'Recibir facturas solo por correo electrónico')}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
