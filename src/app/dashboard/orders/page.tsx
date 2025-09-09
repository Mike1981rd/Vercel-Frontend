'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OrderMetrics } from './components/OrderMetrics';
import { OrdersTable } from './components/OrdersTable';
import { OrderExport } from './components/OrderExport';

interface OrderMetricsData {
  pendingPayment: number;
  completed: number;
  refunded: number;
  failed: number;
  todayOrders: number;
  thisMonthOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function OrdersPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState<OrderMetricsData>({
    pendingPayment: 0,
    completed: 0,
    refunded: 0,
    failed: 0,
    todayOrders: 0,
    thisMonthOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: itemsPerPage.toString(),
        search: searchTerm,
        ...(selectedStatus !== 'all' && { orderStatus: selectedStatus }),
        ...(selectedPaymentStatus !== 'all' && { paymentStatus: selectedPaymentStatus }),
        ...(selectedDeliveryStatus !== 'all' && { deliveryStatus: selectedDeliveryStatus }),
      });

      const response = await fetch(getApiEndpoint(`/orders?${params}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data.items || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error(t('orders.fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, selectedStatus, selectedPaymentStatus, selectedDeliveryStatus, t]);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(getApiEndpoint('/orders/metrics'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchMetrics();
  }, [fetchOrders, fetchMetrics]);

  const handleDelete = async (id: number) => {
    setOrderToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      const response = await fetch(getApiEndpoint(`/orders/${orderToDelete}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete order');

      alert(t('orders.deleteSuccess'));
      fetchOrders();
      fetchMetrics();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(t('orders.deleteError'));
    } finally {
      setDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleStatusUpdate = (id: number, type: string) => {
    router.push(`/dashboard/orders/${id}?action=${type}`);
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) {
      alert(t('orders.selectOrdersFirst'));
      return;
    }

    if (!confirm(`${t('orders.confirmBulkDelete', 'Are you sure you want to delete')} ${selectedOrders.length} ${t('orders.items', 'items')}?`)) {
      return;
    }

    try {
      const promises = selectedOrders.map(id => 
        fetch(getApiEndpoint(`/orders/${id}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
      );

      await Promise.all(promises);
      alert(t('orders.bulkDeleteSuccess'));
      setSelectedOrders([]);
      fetchOrders();
      fetchMetrics();
    } catch (error) {
      console.error('Error deleting orders:', error);
      alert(t('orders.bulkDeleteError'));
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('orders.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('orders.subtitle')}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <OrderExport orders={orders} selectedOrders={selectedOrders} />
          <Button 
            onClick={() => router.push('/dashboard/orders/new')}
            className="flex-1 sm:flex-initial"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('orders.addOrder')}
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <OrderMetrics metrics={metrics} isLoading={isLoading} />

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder={t('orders.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Order Status Filter */}
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">{t('common.all')}</option>
            <option value="Pending">{t('orders.status.order.pending')}</option>
            <option value="Processing">{t('orders.status.order.processing')}</option>
            <option value="Completed">{t('orders.status.order.completed')}</option>
            <option value="Cancelled">{t('orders.status.order.cancelled')}</option>
          </select>

          {/* Payment Status Filter */}
          <select 
            value={selectedPaymentStatus} 
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">{t('common.all')}</option>
            <option value="Pending">{t('orders.status.payment.pending')}</option>
            <option value="Paid">{t('orders.status.payment.paid')}</option>
            <option value="Failed">{t('orders.status.payment.failed')}</option>
            <option value="Refunded">{t('orders.status.payment.refunded')}</option>
          </select>

          {/* Delivery Status Filter */}
          <select 
            value={selectedDeliveryStatus} 
            onChange={(e) => setSelectedDeliveryStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">{t('common.all')}</option>
            <option value="Pending">{t('orders.status.delivery.pending')}</option>
            <option value="ReadyToPickup">{t('orders.status.delivery.readytopickup')}</option>
            <option value="Dispatched">{t('orders.status.delivery.dispatched')}</option>
            <option value="OutForDelivery">{t('orders.status.delivery.outfordelivery')}</option>
            <option value="Delivered">{t('orders.status.delivery.delivered')}</option>
          </select>
        </div>

        {/* Selected Actions */}
        {selectedOrders.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
            <p className="text-sm">
              {selectedOrders.length} {t('orders.selectedCount', 'selected')}
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrders([])}
              >
                {t('common.clearSelection')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
              >
                {t('common.deleteSelected')}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Orders Table */}
      <OrdersTable
        orders={orders}
        isLoading={isLoading}
        onDelete={handleDelete}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            {t('common.previous')}
          </Button>
          <span className="flex items-center px-4">
            {t('common.page', 'Page')} {currentPage} {t('common.of', 'of')} {totalPages}
          </span>
          <Button
            variant="ghost"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            {t('common.next')}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('orders.deleteConfirmTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('orders.deleteConfirmMessage')}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setDeleteModalOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
