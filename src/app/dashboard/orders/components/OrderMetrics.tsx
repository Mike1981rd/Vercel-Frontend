'use client';

import { useI18n } from '@/contexts/I18nContext';
import { Card } from '@/components/ui/Card';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign
} from 'lucide-react';

interface OrderMetrics {
  pendingPayment: number;
  completed: number;
  refunded: number;
  failed: number;
  todayOrders: number;
  thisMonthOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface OrderMetricsProps {
  metrics: OrderMetrics;
  isLoading?: boolean;
}

export function OrderMetrics({ metrics, isLoading = false }: OrderMetricsProps) {
  const { t } = useI18n();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const cards = [
    {
      title: t('orders.metrics.pendingPayment'),
      value: metrics.pendingPayment,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      format: formatNumber
    },
    {
      title: t('orders.metrics.completed'),
      value: metrics.completed,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      format: formatNumber
    },
    {
      title: t('orders.metrics.refunded'),
      value: metrics.refunded,
      icon: RotateCcw,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      format: formatNumber
    },
    {
      title: t('orders.metrics.failed'),
      value: metrics.failed,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      format: formatNumber
    }
  ];

  const additionalMetrics = [
    {
      title: t('orders.metrics.todayOrders'),
      value: metrics.todayOrders,
      icon: Package,
      trend: metrics.todayOrders > 0 ? 'up' : 'neutral'
    },
    {
      title: t('orders.metrics.thisMonth'),
      value: metrics.thisMonthOrders,
      icon: TrendingUp,
      trend: 'up'
    },
    {
      title: t('orders.metrics.totalRevenue'),
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      trend: 'up'
    },
    {
      title: t('orders.metrics.avgOrderValue'),
      value: formatCurrency(metrics.averageOrderValue),
      icon: TrendingUp,
      trend: 'neutral'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {card.format(card.value)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Additional Metrics - Mobile Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {additionalMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : 
                           metric.trend === 'down' ? TrendingDown : null;
          
          return (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {TrendIcon && (
                  <TrendIcon className={`h-4 w-4 ${
                    metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`} />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{metric.title}</p>
              <p className="text-lg font-semibold mt-1">
                {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}