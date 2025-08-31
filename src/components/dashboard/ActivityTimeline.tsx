'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useI18n } from '@/contexts/I18nContext';

interface ActivityItem {
  id: number;
  type: 'reservation' | 'order' | 'client' | 'cancellation';
  title: string;
  description: string;
  user?: string;
  time: string;
  status?: 'success' | 'warning' | 'error';
}

const getMockActivities = (t: (key: string, fallback?: string) => string): ActivityItem[] => [
  {
    id: 1,
    type: 'reservation',
    title: t('dashboard.newReservationConfirmed', 'Nueva reservación confirmada'),
    description: t('dashboard.deluxeRoomDescription', 'Habitación Deluxe para 3 noches'),
    user: 'Ana García',
    time: '5 ' + t('common.minutes', 'minutos'),
    status: 'success'
  },
  {
    id: 2,
    type: 'order',
    title: t('dashboard.orderCompleted', 'Pedido completado'),
    description: t('dashboard.productsOrderDescription', '2 productos vendidos - $150.00'),
    user: 'Carlos Martínez',
    time: '12 ' + t('common.minutes', 'minutos'),
    status: 'success'
  },
  {
    id: 3,
    type: 'client',
    title: t('dashboard.newClientRegistered', 'Nuevo cliente registrado'),
    description: t('dashboard.clientWebsiteDescription', 'Cliente se registró desde el sitio web'),
    user: 'María López',
    time: '25 ' + t('common.minutes', 'minutos'),
    status: 'success'
  },
  {
    id: 4,
    type: 'cancellation',
    title: t('dashboard.reservationCancelled', 'Reserva cancelada'),
    description: t('dashboard.standardRoomCancellation', 'Cliente canceló reserva de habitación estándar'),
    user: 'José Rodríguez',
    time: '1 ' + t('common.hour', 'hora'),
    status: 'error'
  },
  {
    id: 5,
    type: 'order',
    title: t('dashboard.productOutOfStock', 'Producto agotado'),
    description: t('dashboard.lowStockDescription', 'Stock bajo en producto #123'),
    time: '2 ' + t('common.hours', 'horas'),
    status: 'warning'
  }
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'reservation':
      return (
        <div className="w-8 h-8 bg-success-100 text-success-600 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'order':
      return (
        <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM13 13a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'client':
      return (
        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        </div>
      );
    case 'cancellation':
      return (
        <div className="w-8 h-8 bg-error-100 text-error-600 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

const getStatusDot = (status?: ActivityItem['status']) => {
  if (!status) return null;
  
  const colors = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500'
  };

  return (
    <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
  );
};

export function ActivityTimeline() {
  const { t } = useI18n();
  const mockActivities = getMockActivities(t);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('dashboard.recentActivity', 'Activity Timeline')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity, index) => (
            <div key={activity.id} className="flex items-start gap-4">
              {/* Icon */}
              {getActivityIcon(activity.type)}
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {activity.title}
                  </p>
                  {getStatusDot(activity.status)}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                  {activity.description}
                </p>
                
                <div className="flex items-center gap-2">
                  {activity.user && (
                    <>
                      <Avatar
                        name={activity.user}
                        size="sm"
                        className="w-5 h-5 text-xs"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{activity.user}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                    </>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('common.ago', 'hace')} {activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            {t('dashboard.viewAllActivity', 'Ver toda la actividad')}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}