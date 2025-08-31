'use client';

import React from 'react';
import { MetricCard } from '@/components/ui/MetricCard';
import { Avatar } from '@/components/ui/Avatar';
import { useI18n } from '@/contexts/I18nContext';

// Mock data for dashboard metrics
const mockMetrics = {
  sales: 42500,
  salesChange: 18.4,
  orders: 8458,
  ordersChange: 15.8,
  reservations: 2450,
  reservationsChange: -25.6,
  activeClients: 1422,
  activeClientsChange: 12.2,
  cancellations: 145,
  cancellationsChange: -8.1,
  visits: 76500,
  visitsChange: 22.3,
};

// Mock user avatars (like in Materialize design)
const avatarUsers = [
  { name: 'Ana García', image: null },
  { name: 'Carlos Martínez', image: null },
  { name: 'María López', image: null },
];

export function StatsGrid() {
  const { t } = useI18n();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Sales Overview */}
      <MetricCard
        title={t('dashboard.totalSales', 'Total Sales')}
        value={mockMetrics.sales}
        change={mockMetrics.salesChange}
        format="currency"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        }
        description={t('dashboard.totalSalesMonth', 'Total ventas del mes')}
      />

      {/* Orders */}
      <MetricCard
        title={t('dashboard.newOrders', 'New Orders')}
        value={mockMetrics.orders}
        change={mockMetrics.ordersChange}
        format="number"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM13 13a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        }
        description={t('dashboard.productOrders', 'Órdenes de productos')}
        avatar={
          <div className="flex -space-x-2">
            {avatarUsers.slice(0, 2).map((user, index) => (
              <Avatar
                key={index}
                name={user.name}
                src={user.image || undefined}
                size="sm"
                className="border-2 border-white"
              />
            ))}
          </div>
        }
      />

      {/* Reservations */}
      <MetricCard
        title={t('dashboard.reservations', 'Reservations')}
        value={mockMetrics.reservations}
        change={mockMetrics.reservationsChange}
        format="number"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        }
        description={t('dashboard.roomReservations', 'Reservas de habitaciones')}
        color="success"
      />

      {/* Active Clients */}
      <MetricCard
        title={t('dashboard.activeClients', 'Active Clients')}
        value={mockMetrics.activeClients}
        change={mockMetrics.activeClientsChange}
        format="number"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        }
        description={t('dashboard.activeClientsMonth', 'Clientes activos este mes')}
        avatar={
          <Avatar
            name="Cliente Premium"
            src={undefined}
            size="md"
          />
        }
      />

      {/* Cancellations */}
      <MetricCard
        title={t('dashboard.cancellations', 'Cancellations')}
        value={mockMetrics.cancellations}
        change={mockMetrics.cancellationsChange}
        format="number"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        }
        description={t('dashboard.cancellationsMonth', 'Cancelaciones este mes')}
        color="error"
      />

      {/* Visits */}
      <MetricCard
        title={t('dashboard.websiteVisits', 'Website Visits')}
        value={mockMetrics.visits}
        change={mockMetrics.visitsChange}
        format="number"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        }
        description={t('dashboard.websiteVisitsDesc', 'Visitas al sitio web')}
        color="primary"
      />
    </div>
  );
}