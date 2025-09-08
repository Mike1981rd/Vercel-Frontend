'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MetricCard } from '@/components/ui/MetricCard';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';
import { customersApi } from '@/lib/api/customers';
import { useDateRange } from '@/contexts/DateRangeContext';

interface ReservationDto {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  customerEmail?: string;
}

export function StatsGrid() {
  const { t } = useI18n();
  const { range } = useDateRange();

  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch reservations (current month) and total customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token && token !== 'null' && token !== 'undefined') headers['Authorization'] = `Bearer ${token}`;

        const params = new URLSearchParams({
          startDate: range.startDate.toISOString().split('T')[0],
          endDate: range.endDate.toISOString().split('T')[0],
        });
        const url = getApiEndpoint(`/reservations?${params.toString()}`);

        let resp = await fetch(url, { headers });
        if (!resp.ok) {
          // Fallback without auth
          resp = await fetch(getApiEndpoint('/reservations'));
        }
        const resData = await resp.json();
        setReservations(Array.isArray(resData) ? resData : []);

        // Customers total (paged endpoint returns totalCount)
        try {
          const customers = await customersApi.getCustomers({ page: 1, size: 1 });
          setTotalCustomers(customers.totalCount);
        } catch {
          setTotalCustomers(0);
        }
      } catch (e) {
        console.error('StatsGrid fetch error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range.startDate, range.endDate]);

  const metrics = useMemo(() => {
    const inRange = (d: string) => {
      const dt = new Date(d);
      return dt >= new Date(range.startDate.getFullYear(), range.startDate.getMonth(), range.startDate.getDate()) &&
             dt <= new Date(range.endDate.getFullYear(), range.endDate.getMonth(), range.endDate.getDate(), 23, 59, 59, 999);
    };

    const rangeReservations = reservations.filter(r => r.checkInDate && inRange(r.checkInDate));
    const totalSales = rangeReservations.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
    const cancellations = rangeReservations.filter(r => (r.status || '').toLowerCase().includes('cancel')).length;
    const activeClients = new Set(rangeReservations.map(r => r.customerEmail || 'unknown')).size - (rangeReservations.some(r => !r.customerEmail) ? 1 : 0);

    return {
      totalSales,
      reservations: rangeReservations.length,
      cancellations,
      activeClients: Math.max(activeClients, 0),
    };
  }, [reservations, range.startDate, range.endDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Sales (month) */}
      <MetricCard
        title={t('dashboard.totalSales', 'Total Sales')}
        value={metrics.totalSales}
        change={0}
        format="currency"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        }
        description={t('dashboard.totalSalesMonth', 'Total ventas del mes')}
      />

      {/* Reservations (month) */}
      <MetricCard
        title={t('dashboard.reservations', 'Reservations')}
        value={metrics.reservations}
        change={0}
        format="number"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        }
        description={t('dashboard.roomReservations', 'Reservas de habitaciones')}
        color="success"
      />

      {/* Active Clients (total) */}
      <MetricCard
        title={t('dashboard.activeClients', 'Active Clients')}
        value={totalCustomers}
        change={0}
        format="number"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        }
        description={t('dashboard.activeClientsMonth', 'Clientes activos este mes')}
      />

      {/* Cancellations (month) */}
      <MetricCard
        title={t('dashboard.cancellations', 'Cancellations')}
        value={metrics.cancellations}
        change={0}
        format="number"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        }
        description={t('dashboard.cancellationsMonth', 'Cancelaciones este mes')}
        color="error"
      />

      {/* Website Visits (placeholder) */}
      <MetricCard
        title={t('dashboard.websiteVisits', 'Website Visits')}
        value={0}
        change={0}
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
