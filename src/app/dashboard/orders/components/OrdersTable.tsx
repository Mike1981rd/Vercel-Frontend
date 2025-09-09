'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Eye, 
  Edit, 
  Trash2
} from 'lucide-react';

interface Order {
  id: number;
  orderNumber: string;
  formattedOrderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  orderStatus: string;
  paymentStatus: string;
  deliveryStatus: string;
  paymentMethod?: string;
  paymentMethodLast4?: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
  canEdit: boolean;
  canDelete: boolean;
  canCancel: boolean;
  canRefund: boolean;
}

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onDelete?: (id: number) => void;
  onStatusUpdate?: (id: number, type: string) => void;
}

export function OrdersTable({ 
  orders, 
  isLoading = false,
  onDelete,
  onStatusUpdate
}: OrdersTableProps) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', options);
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment' | 'delivery') => {
    const statusConfig: Record<string, { className: string }> = {
      // Order Status
      'Pending': { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
      'Processing': { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
      'Completed': { className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      'Cancelled': { className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
      
      // Payment Status
      'Paid': { className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      'Failed': { className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
      'Refunded': { className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
      'PartialRefund': { className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' },
      
      // Delivery Status
      'ReadyToPickup': { className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400' },
      'Dispatched': { className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400' },
      'OutForDelivery': { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
      'Delivered': { className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    };

    const config = statusConfig[status] || { className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {t(`orders.status.${type}.${status.toLowerCase()}`)}
      </span>
    );
  };

  const getPaymentMethodIcon = (method?: string) => {
    const icons: Record<string, string> = {
      'card': '💳',
      'cash': '💵',
      'transfer': '🏦',
      'paypal': '🅿️',
      'stripe': '💳',
    };
    return icons[method?.toLowerCase() || ''] || '💰';
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const handleSelectOrder = (id: number) => {
    setSelectedOrders(prev =>
      prev.includes(id) 
        ? prev.filter(orderId => orderId !== id)
        : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-12 text-center">
          <p className="text-muted-foreground">{t('orders.noOrders')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="w-12 px-4 py-3">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 dark:border-gray-600"
                checked={selectedOrders.length === orders.length}
                onChange={handleSelectAll}
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('orders.table.order')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('orders.table.date')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('orders.table.customer')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('orders.table.payment')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('orders.table.status')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('orders.table.delivery')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('orders.table.method')}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('orders.table.amount')}
            </th>
            <th className="w-12 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order) => (
            <tr 
              key={order.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => router.push(`/dashboard/orders/${order.id}`)}
            >
              <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600"
                  checked={selectedOrders.includes(order.id)}
                  onChange={() => handleSelectOrder(order.id)}
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.formattedOrderNumber}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {order.itemCount} {t('orders.items')}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {formatDate(order.orderDate)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={order.customerAvatar} 
                    name={order.customerName}
                    size="sm"
                    className="h-8 w-8"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.customerName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {order.customerEmail}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {getStatusBadge(order.paymentStatus, 'payment')}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {getStatusBadge(order.orderStatus, 'order')}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {getStatusBadge(order.deliveryStatus, 'delivery')}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                  <span>{getPaymentMethodIcon(order.paymentMethod)}</span>
                  {order.paymentMethodLast4 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ****{order.paymentMethodLast4}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(order.totalAmount, order.currency)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={t('common.view')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}