'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/Button';
import { Download, FileText, FileSpreadsheet, File, X } from 'lucide-react';

interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  orderStatus: string;
  paymentStatus: string;
  deliveryStatus: string;
  totalAmount: number;
  currency: string;
}

interface OrderExportProps {
  orders: Order[];
  selectedOrders?: number[];
}

export function OrderExport({ orders, selectedOrders = [] }: OrderExportProps) {
  const { t } = useI18n();
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const getExportData = () => {
    const dataToExport = selectedOrders.length > 0
      ? orders.filter(order => selectedOrders.includes(order.id))
      : orders;

    return dataToExport.map(order => ({
      orderNumber: order.orderNumber,
      date: new Date(order.orderDate).toLocaleDateString(),
      customer: order.customerName,
      email: order.customerEmail,
      orderStatus: t(`orders.status.order.${order.orderStatus.toLowerCase()}`),
      paymentStatus: t(`orders.status.payment.${order.paymentStatus.toLowerCase()}`),
      deliveryStatus: t(`orders.status.delivery.${order.deliveryStatus.toLowerCase()}`),
      amount: `${order.currency} ${order.totalAmount.toFixed(2)}`,
    }));
  };

  const exportToCSV = () => {
    try {
      setIsExporting(true);
      const data = getExportData();
      
      if (data.length === 0) {
        alert(t('orders.export.noData'));
        return;
      }

      const headers = [
        t('orders.export.orderNumber'),
        t('orders.export.date'),
        t('orders.export.customer'),
        t('orders.export.email'),
        t('orders.export.orderStatus'),
        t('orders.export.paymentStatus'),
        t('orders.export.deliveryStatus'),
        t('orders.export.amount')
      ];

      let csvContent = headers.join(',') + '\n';
      
      data.forEach(row => {
        const values = [
          row.orderNumber,
          row.date,
          row.customer,
          row.email,
          row.orderStatus,
          row.paymentStatus,
          row.deliveryStatus,
          row.amount
        ];
        csvContent += values.map(val => `"${val}"`).join(',') + '\n';
      });

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      
      // Success - CSV file downloaded
    } catch (error) {
      alert(t('orders.export.error'));
      console.error('Export CSV error:', error);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const exportToExcel = () => {
    try {
      setIsExporting(true);
      const data = getExportData();
      
      if (data.length === 0) {
        alert(t('orders.export.noData'));
        return;
      }

      let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
      html += '<head><meta charset="utf-8"><title>Orders Export</title></head>';
      html += '<body><table border="1">';
      
      // Headers
      html += '<tr style="background-color:#f0f0f0;font-weight:bold;">';
      html += `<th>${t('orders.export.orderNumber')}</th>`;
      html += `<th>${t('orders.export.date')}</th>`;
      html += `<th>${t('orders.export.customer')}</th>`;
      html += `<th>${t('orders.export.email')}</th>`;
      html += `<th>${t('orders.export.orderStatus')}</th>`;
      html += `<th>${t('orders.export.paymentStatus')}</th>`;
      html += `<th>${t('orders.export.deliveryStatus')}</th>`;
      html += `<th>${t('orders.export.amount')}</th>`;
      html += '</tr>';
      
      // Data rows
      data.forEach(row => {
        html += '<tr>';
        html += `<td>${row.orderNumber}</td>`;
        html += `<td>${row.date}</td>`;
        html += `<td>${row.customer}</td>`;
        html += `<td>${row.email}</td>`;
        html += `<td>${row.orderStatus}</td>`;
        html += `<td>${row.paymentStatus}</td>`;
        html += `<td>${row.deliveryStatus}</td>`;
        html += `<td>${row.amount}</td>`;
        html += '</tr>';
      });
      
      html += '</table></body></html>';
      
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.xls`);
      link.click();

      // Success - Excel file downloaded
    } catch (error) {
      alert(t('orders.export.error'));
      console.error('Export Excel error:', error);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const exportToPDF = () => {
    try {
      setIsExporting(true);
      const data = getExportData();
      
      if (data.length === 0) {
        alert(t('orders.export.noData'));
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert(t('orders.export.popupBlocked', 'Please allow popups to export PDF'));
        return;
      }

      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${t('orders.export.title')}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
            }
            h1 { 
              color: #333; 
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 10px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th { 
              background-color: #3b82f6; 
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            td { 
              padding: 10px; 
              border: 1px solid #ddd; 
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .header-info {
              margin-bottom: 20px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>${t('orders.export.title')}</h1>
          <div class="header-info">
            <p>${t('orders.export.exportDate')}: ${new Date().toLocaleDateString()}</p>
            <p>${t('orders.export.totalRecords', 'Total Records')}: ${data.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>${t('orders.export.orderNumber')}</th>
                <th>${t('orders.export.date')}</th>
                <th>${t('orders.export.customer')}</th>
                <th>${t('orders.export.email')}</th>
                <th>${t('orders.export.orderStatus')}</th>
                <th>${t('orders.export.paymentStatus')}</th>
                <th>${t('orders.export.deliveryStatus')}</th>
                <th>${t('orders.export.amount')}</th>
              </tr>
            </thead>
            <tbody>`;

      data.forEach(row => {
        html += `
          <tr>
            <td>${row.orderNumber}</td>
            <td>${row.date}</td>
            <td>${row.customer}</td>
            <td>${row.email}</td>
            <td>${row.orderStatus}</td>
            <td>${row.paymentStatus}</td>
            <td>${row.deliveryStatus}</td>
            <td>${row.amount}</td>
          </tr>`;
      });

      html += `
            </tbody>
          </table>
        </body>
        </html>`;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        setIsExporting(false);
        setShowExportModal(false);
      };

      // Success - PDF print dialog opened
    } catch (error) {
      alert(t('orders.export.error'));
      console.error('Export PDF error:', error);
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const handleExportFormat = (format: 'excel' | 'pdf' | 'csv') => {
    switch(format) {
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'csv':
        exportToCSV();
        break;
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        disabled={isExporting || orders.length === 0}
        className="gap-2"
        onClick={() => setShowExportModal(true)}
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">{t('common.export')}</span>
      </Button>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('orders.export.title')}
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('orders.export.selectFormat', 'Select the format you want to export')}
            </p>
            
            <div className="space-y-3">
              {/* Excel Option */}
              <button 
                onClick={() => handleExportFormat('excel')} 
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 group transition-all hover:scale-[1.02]"
                disabled={isExporting}
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Excel</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">.xls format</p>
                </div>
              </button>
              
              {/* PDF Option */}
              <button 
                onClick={() => handleExportFormat('pdf')} 
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 group transition-all hover:scale-[1.02]"
                disabled={isExporting}
              >
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <File className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">PDF</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('export.pdfViaprint', 'Via print dialog')}</p>
                </div>
              </button>
              
              {/* CSV Option */}
              <button 
                onClick={() => handleExportFormat('csv')} 
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4 group transition-all hover:scale-[1.02]"
                disabled={isExporting}
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">CSV</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('export.csvComma', 'Comma separated')}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}