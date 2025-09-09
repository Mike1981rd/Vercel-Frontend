'use client';

import React, { useState, useEffect } from 'react';
import { useContactNotifications } from '@/hooks/useContactNotifications';

interface ContactNotificationBadgeProps {
  companyId?: number;
  className?: string;
  showZero?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function ContactNotificationBadge({
  companyId,
  className = '',
  showZero = false,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: ContactNotificationBadgeProps) {
  const { unreadCount, fetchUnreadCount, settings } = useContactNotifications();
  const [currentCompanyId, setCurrentCompanyId] = useState<number | null>(null);

  // Función para obtener companyId desde localStorage si no se proporciona
  useEffect(() => {
    const getCompanyId = () => {
      if (companyId) {
        setCurrentCompanyId(companyId);
        return;
      }

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('companyId');
        if (stored) {
          setCurrentCompanyId(parseInt(stored));
        }
      }
    };

    getCompanyId();
  }, [companyId]);

  // Cargar contador inicial
  useEffect(() => {
    if (currentCompanyId && settings?.dashboardNotificationsEnabled !== false) {
      fetchUnreadCount(currentCompanyId);
    }
  }, [currentCompanyId, fetchUnreadCount, settings?.dashboardNotificationsEnabled]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !currentCompanyId || settings?.dashboardNotificationsEnabled === false) {
      return;
    }

    const interval = setInterval(() => {
      fetchUnreadCount(currentCompanyId);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, currentCompanyId, fetchUnreadCount, refreshInterval, settings?.dashboardNotificationsEnabled]);

  // No mostrar si las notificaciones dashboard están deshabilitadas
  if (settings?.dashboardNotificationsEnabled === false) {
    return null;
  }

  // No mostrar si no hay mensajes sin leer y showZero es false
  if (unreadCount === 0 && !showZero) {
    return null;
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center 
        min-w-[20px] h-5 px-1.5 
        text-xs font-medium text-white 
        bg-red-500 rounded-full 
        ring-2 ring-white dark:ring-gray-900
        transition-all duration-200 ease-in-out
        ${unreadCount > 0 ? 'animate-pulse' : ''}
        ${className}
      `}
      title={`${unreadCount} unread contact message${unreadCount !== 1 ? 's' : ''}`}
      data-testid="contact-notification-badge"
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}