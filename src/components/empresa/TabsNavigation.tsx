'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  href: string;
}

export function TabsNavigation() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');

  // Get primary color from localStorage
  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        setPrimaryColor(parsed.primaryColor || '#22c55e');
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }
  }, []);

  const tabs: Tab[] = [
    {
      id: 'store-details',
      label: t('empresa.tabs.storeDetails', 'Store Details'),
      href: '/dashboard/empresa/configuracion'
    },
    {
      id: 'payments',
      label: t('empresa.tabs.payments', 'Payments'),
      href: '/dashboard/empresa/payments'
    },
    {
      id: 'checkout',
      label: t('empresa.tabs.checkout', 'Checkout'),
      href: '/dashboard/empresa/checkout'
    },
    {
      id: 'shipping-delivery',
      label: t('empresa.tabs.shippingDelivery', 'Shipping & Delivery'),
      href: '/dashboard/empresa/shipping'
    },
    {
      id: 'locations',
      label: t('empresa.tabs.locations', 'Locations'),
      href: '/dashboard/empresa/locations'
    },
    {
      id: 'notifications',
      label: t('empresa.tabs.notifications', 'Notifications'),
      href: '/dashboard/empresa/notifications'
    }
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
      <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max" aria-label="Tabs">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-all',
                active
                  ? 'text-gray-900 dark:text-white border-current'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              style={{
                borderBottomColor: active ? primaryColor : undefined,
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}