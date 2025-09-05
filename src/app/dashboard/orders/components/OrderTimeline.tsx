'use client';

import { useI18n } from '@/contexts/I18nContext';
import { Card } from '@/components/ui/Card';
import { 
  Package, 
  CreditCard, 
  Truck, 
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface OrderTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
}

export function OrderTimeline({ events, currentStatus }: OrderTimelineProps) {
  const { t, locale } = useI18n();

  const getIcon = (statusType: string) => {
    const icons: Record<string, any> = {
      'OrderPlaced': Package,
      'PaymentUpdate': CreditCard,
      'PaymentProcessed': CreditCard,
      'PickupScheduled': MapPin,
      'Dispatched': Truck,
      'DispatchedForDelivery': Truck,
      'OutForDelivery': Truck,
      'Delivered': CheckCircle,
      'RefundProcessed': CreditCard,
      'OrderCancelled': AlertCircle,
    };
    return icons[statusType] || Clock;
  };

  const getIconColor = (statusType: string, isCompleted: boolean) => {
    if (!isCompleted) return 'text-gray-400 dark:text-gray-600';
    
    const colors: Record<string, string> = {
      'OrderPlaced': 'text-blue-600 dark:text-blue-400',
      'PaymentUpdate': 'text-green-600 dark:text-green-400',
      'PaymentProcessed': 'text-green-600 dark:text-green-400',
      'PickupScheduled': 'text-cyan-600 dark:text-cyan-400',
      'Dispatched': 'text-indigo-600 dark:text-indigo-400',
      'DispatchedForDelivery': 'text-purple-600 dark:text-purple-400',
      'OutForDelivery': 'text-orange-600 dark:text-orange-400',
      'Delivered': 'text-green-600 dark:text-green-400',
      'RefundProcessed': 'text-red-600 dark:text-red-400',
      'OrderCancelled': 'text-gray-600 dark:text-gray-400',
    };
    return colors[statusType] || 'text-primary';
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const dateOptions: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', dateOptions);
  };

  const formatDateShort = (date: string) => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short'
    };
    return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', options);
  };

  // Ordenar eventos por timestamp descendente (más reciente primero)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">{t('orders.timeline.title')}</h3>
      
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        
        {/* Eventos */}
        <div className="space-y-6">
          {sortedEvents.map((event, index) => {
            const Icon = getIcon(event.statusType);
            const isLast = index === sortedEvents.length - 1;
            
            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Icono con círculo */}
                <div className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full",
                  event.isCompleted 
                    ? "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700" 
                    : "bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                )}>
                  <Icon className={cn("h-5 w-5", getIconColor(event.statusType, event.isCompleted))} />
                </div>
                
                {/* Contenido del evento */}
                <div className={cn(
                  "flex-1 pb-6",
                  !event.isCompleted && "opacity-60"
                )}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">
                        {event.status}
                      </p>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end gap-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.timestamp)}
                      </p>
                      {event.estimatedDate && !event.isCompleted && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{t('orders.timeline.estimated')}: {formatDateShort(event.estimatedDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Información adicional */}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.userName && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{event.userName}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Línea que conecta al siguiente evento (ocultar en el último) */}
                {!isLast && (
                  <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Si no hay eventos */}
        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {t('orders.timeline.noEvents')}
          </div>
        )}
      </div>
    </Card>
  );
}