'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/Avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  Edit,
  Mail,
  Phone,
  MapPin,
  Package,
  Calendar,
  Hash,
  Globe,
  DollarSign,
  ShoppingCart,
  FileText,
  Printer,
  Download
} from 'lucide-react';
import { OrderTimeline } from '../components/OrderTimeline';
// Removed non-existent UI component imports - using native HTML elements instead

interface OrderDetails {
  id: number;
  orderNumber: string;
  formattedOrderNumber: string;
  orderDate: string;
  orderStatus: string;
  paymentStatus: string;
  deliveryStatus: string;
  paymentMethod?: string;
  paymentMethodLast4?: string;
  countryCode?: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAvatar?: string;
  customerId: number;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  orderSource?: string;
  itemCount: number;
  canCancel: boolean;
  canRefund: boolean;
  canEdit: boolean;
  canDelete: boolean;
  items: OrderItem[];
  statusHistory: TimelineEvent[];
  payments: OrderPayment[];
  shippingAddress?: Address;
  billingAddress?: Address;
}

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number;
  notes?: string;
}

interface TimelineEvent {
  id: number;
  status: string;
  statusType: string;
  description?: string;
  location?: string;
  timestamp: string;
  estimatedDate?: string;
  isCompleted: boolean;
  userName?: string;
}

interface OrderPayment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  paymentDate?: string;
  refundDate?: string;
  refundAmount?: number;
  refundReason?: string;
}

interface Address {
  id: number;
  street: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export default function OrderDetailsPage() {
  const { t, locale } = useI18n();
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  
  // Form states
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5266/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch order details');
      
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert(t('orders.fetchError'));
    } finally {
      setIsLoading(false);
    }
  };

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', options);
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment' | 'delivery') => {
    const statusConfig: Record<string, { variant: any; className: string }> = {
      'Pending': { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
      'Processing': { variant: 'secondary', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
      'Completed': { variant: 'secondary', className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      'Cancelled': { variant: 'secondary', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
      'Paid': { variant: 'secondary', className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      'Failed': { variant: 'destructive', className: '' },
      'Refunded': { variant: 'secondary', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
      'Delivered': { variant: 'secondary', className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    };

    const config = statusConfig[status] || { variant: 'outline', className: '' };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {t(`orders.status.${type}.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5266/api/orders/${id}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentStatus,
          paymentMethod,
          notes
        }),
      });

      if (!response.ok) throw new Error('Failed to update payment status');
      
      alert(t('orders.paymentUpdateSuccess'));
      fetchOrderDetails();
      setPaymentModalOpen(false);
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert(t('orders.paymentUpdateError'));
    }
  };

  const handleUpdateShippingStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5266/api/orders/${id}/shipping-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          deliveryStatus,
          trackingNumber,
          notes
        }),
      });

      if (!response.ok) throw new Error('Failed to update shipping status');
      
      alert(t('orders.shippingUpdateSuccess'));
      fetchOrderDetails();
      setShippingModalOpen(false);
    } catch (error) {
      console.error('Error updating shipping status:', error);
      alert(t('orders.shippingUpdateError'));
    }
  };

  const handleProcessRefund = async () => {
    try {
      const response = await fetch(`http://localhost:5266/api/orders/${id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          refundAmount: parseFloat(refundAmount),
          refundReason,
          notes
        }),
      });

      if (!response.ok) throw new Error('Failed to process refund');
      
      alert(t('orders.refundSuccess'));
      fetchOrderDetails();
      setRefundModalOpen(false);
    } catch (error) {
      console.error('Error processing refund:', error);
      alert(t('orders.refundError'));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      // Create the API endpoint URL for PDF generation
      const response = await fetch(`http://localhost:5266/api/orders/${id}/export-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${order?.formattedOrderNumber || 'download'}.pdf`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to browser print as PDF
      if (window.confirm(t('orders.exportError') + '\n\n' + t('orders.printInstead'))) {
        window.print();
      }
    }
  };

  if (isLoading || !order) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {t('orders.orderDetails')}: {order.formattedOrderNumber}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('orders.placed')} {formatDate(order.orderDate)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            {t('common.print')}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        {getStatusBadge(order.orderStatus, 'order')}
        {getStatusBadge(order.paymentStatus, 'payment')}
        {getStatusBadge(order.deliveryStatus, 'delivery')}
      </div>

      {/* Main Content - Reorganized Layout */}
      <div className="space-y-6">
        {/* First Row - Timeline and Customer Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-1">
            <OrderTimeline 
              events={order.statusHistory} 
              currentStatus={order.orderStatus}
            />
          </div>
          
          {/* Customer Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{t('orders.items.title')}</span>
                <Badge variant="secondary">{order.itemCount} {t('orders.items.count')}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  {item.productImage && (
                    <img 
                      src={item.productImage} 
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    {item.productSku && (
                      <p className="text-xs text-muted-foreground">SKU: {item.productSku}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Customer & Payment Details */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('orders.customer.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar 
                  src={order.customerAvatar} 
                  name={order.customerName}
                  size="lg"
                  className="h-12 w-12"
                />
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('orders.customer.id')}: #{order.customerId}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customerEmail}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => router.push(`/dashboard/clientes/${order.customerId}`)}
              >
                {t('orders.customer.viewProfile')}
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('orders.shipping.address')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic text-sm space-y-1">
                  <p>{order.shippingAddress.street}</p>
                  {order.shippingAddress.street2 && <p>{order.shippingAddress.street2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </address>
                
                {order.trackingNumber && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-1">{t('orders.shipping.tracking')}</p>
                    <p className="text-sm text-muted-foreground">{order.trackingNumber}</p>
                    {order.trackingUrl && (
                      <a 
                        href={order.trackingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {t('orders.shipping.trackPackage')}
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Billing Address */}
          {order.billingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('orders.billing.address')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic text-sm space-y-1">
                  <p>{order.billingAddress.street}</p>
                  {order.billingAddress.street2 && <p>{order.billingAddress.street2}</p>}
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                  </p>
                  <p>{order.billingAddress.country}</p>
                </address>
              </CardContent>
            </Card>
          )}
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('orders.summary.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('orders.summary.subtotal')}</span>
                <span>{formatCurrency(order.subTotal, order.currency)}</span>
              </div>
              
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>{t('orders.summary.discount')}</span>
                  <span>-{formatCurrency(order.discountAmount, order.currency)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span>{t('orders.summary.tax')}</span>
                <span>{formatCurrency(order.taxAmount, order.currency)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>{t('orders.summary.shipping')}</span>
                <span>{formatCurrency(order.shippingAmount, order.currency)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>{t('orders.summary.total')}</span>
                <span className="text-lg">{formatCurrency(order.totalAmount, order.currency)}</span>
              </div>
              
              {order.paymentMethod && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    {t('orders.summary.paidWith')}: {order.paymentMethod}
                    {order.paymentMethodLast4 && ` ****${order.paymentMethodLast4}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('orders.actions.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.paymentStatus === 'Pending' && (
                <Button 
                  className="w-full justify-start" 
                  variant="ghost"
                  onClick={() => setPaymentModalOpen(true)}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t('orders.actions.updatePayment')}
                </Button>
              )}
              
              {order.deliveryStatus !== 'Delivered' && (
                <Button 
                  className="w-full justify-start" 
                  variant="ghost"
                  onClick={() => setShippingModalOpen(true)}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  {t('orders.actions.updateShipping')}
                </Button>
              )}
              
              {order.canRefund && (
                <Button 
                  className="w-full justify-start" 
                  variant="ghost"
                  onClick={() => setRefundModalOpen(true)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t('orders.actions.processRefund')}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('orders.notes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Update Payment Status Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{t('orders.modals.updatePayment.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('orders.modals.updatePayment.description')}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('orders.modals.updatePayment.status')}</label>
                <select 
                  value={paymentStatus} 
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Paid">{t('orders.status.payment.paid')}</option>
                  <option value="Failed">{t('orders.status.payment.failed')}</option>
                  <option value="Cancelled">{t('orders.status.payment.cancelled')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('orders.modals.updatePayment.method')}</label>
                <input 
                  type="text"
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="Card, Cash, Transfer..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('orders.modals.updatePayment.notes')}</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('orders.modals.updatePayment.notesPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setPaymentModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleUpdatePaymentStatus}>
                {t('common.update')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Shipping Status Modal */}
      {shippingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{t('orders.modals.updateShipping.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('orders.modals.updateShipping.description')}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('orders.modals.updateShipping.status')}</label>
                <select 
                  value={deliveryStatus} 
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{t('common.select')}</option>
                  <option value="ReadyToPickup">{t('orders.status.delivery.readytopickup')}</option>
                  <option value="Dispatched">{t('orders.status.delivery.dispatched')}</option>
                  <option value="OutForDelivery">{t('orders.status.delivery.outfordelivery')}</option>
                  <option value="Delivered">{t('orders.status.delivery.delivered')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('orders.modals.updateShipping.tracking')}</label>
                <input 
                  type="text"
                  value={trackingNumber} 
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder={t('orders.modals.updateShipping.trackingPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('orders.modals.updateShipping.notes')}</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('orders.modals.updateShipping.notesPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShippingModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleUpdateShippingStatus}>
                {t('common.update')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{t('orders.modals.refund.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('orders.modals.refund.description')}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('orders.modals.refund.amount')}</label>
                <input 
                  type="number"
                  value={refundAmount} 
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={order?.totalAmount.toString()}
                  max={order?.totalAmount}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('orders.modals.refund.maxAmount')}: {formatCurrency(order?.totalAmount || 0, order?.currency)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('orders.modals.refund.reason')}</label>
                <select 
                  value={refundReason} 
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Customer Request">{t('orders.modals.refund.reasons.customerRequest')}</option>
                  <option value="Product Issue">{t('orders.modals.refund.reasons.productIssue')}</option>
                  <option value="Shipping Issue">{t('orders.modals.refund.reasons.shippingIssue')}</option>
                  <option value="Other">{t('orders.modals.refund.reasons.other')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('orders.modals.refund.notes')}</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('orders.modals.refund.notesPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setRefundModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleProcessRefund}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {t('orders.modals.refund.process')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}