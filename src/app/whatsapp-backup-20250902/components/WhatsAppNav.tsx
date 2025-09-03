'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, Settings, FileText, BarChart3, Palette } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

const tabs = [
  { 
    id: 'chat', 
    label: 'Chats', 
    href: '/whatsapp/chat', 
    icon: MessageSquare,
    description: 'Conversaciones activas'
  },
  { 
    id: 'config', 
    label: 'Configuración', 
    href: '/whatsapp/config', 
    icon: Settings,
    description: 'Configurar Green API' 
  },
  { 
    id: 'widget', 
    label: 'Widget', 
    href: '/whatsapp/widget', 
    icon: Palette,
    description: 'Personalizar widget web'
  },
  { 
    id: 'templates', 
    label: 'Plantillas', 
    href: '/whatsapp/templates', 
    icon: FileText,
    description: 'Mensajes predefinidos'
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    href: '/whatsapp/analytics', 
    icon: BarChart3,
    description: 'Estadísticas de mensajes'
  }
];

export default function WhatsAppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const handleTabClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="w-full">
      {/* Desktop Tabs */}
      <div className="hidden sm:block border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || 
                           (tab.id === 'chat' && pathname === '/whatsapp');
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.href)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${isActive 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }
                `} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Tabs */}
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Seleccionar pestaña
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={pathname}
          onChange={(e) => router.push(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.href}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}