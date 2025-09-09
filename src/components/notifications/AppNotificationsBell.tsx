'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type RawNotification = any;

type AppNotification = {
  id: number;
  type: string;
  title: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
};

interface AppNotificationsBellProps {
  className?: string;
  pollIntervalMs?: number;
}

export default function AppNotificationsBell({ className = '', pollIntervalMs = 30000 }: AppNotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.get<{ count: number }>('/notifications/unread-count');
      setCount((res as any).data?.count ?? (res as any).count ?? 0);
    } catch {
      // silent
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<RawNotification[]>('/notifications?limit=20');
      const list: RawNotification[] = ((res as any).data ?? (res as any)) as any[];
      const normalized: AppNotification[] = Array.isArray(list)
        ? list.map((n: any) => ({
            id: n.id ?? n.Id ?? 0,
            type: n.type ?? n.Type ?? 'unknown',
            title: (n.title ?? n.Title ?? '').toString() || deriveTitle(n),
            message: (n.message ?? n.Message ?? '').toString() || deriveMessage(n),
            isRead: Boolean(n.isRead ?? n.IsRead ?? false),
            createdAt: (n.createdAt ?? n.CreatedAt ?? '').toString(),
            relatedEntityType: n.relatedEntityType ?? n.RelatedEntityType,
            relatedEntityId: n.relatedEntityId ?? n.RelatedEntityId,
          }))
        : [];
      setItems(normalized);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setCount((c) => Math.max(0, c - 1));
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, IsRead: true })));
      setCount(0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnread();
    const t = setInterval(fetchUnread, pollIntervalMs);
    return () => clearInterval(t);
  }, [fetchUnread, pollIntervalMs]);

  useEffect(() => {
    if (open) {
      fetchRecent();
    }
  }, [open, fetchRecent]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const iconForType = (type: string) => {
    switch (type) {
      case 'reservation_paid':
        return '💳';
      case 'contact_message':
        return '✉️';
      case 'subscription_new':
        return '📰';
      default:
        return '🔔';
    }
  };

  function deriveTitle(n: any): string {
    const type = n.type ?? n.Type;
    if (type === 'contact_message') return 'New contact message';
    if (type === 'reservation_paid') return 'Reservation paid';
    if (type === 'subscription_new') return 'New subscriber';
    return 'Notification';
  }

  function deriveMessage(n: any): string {
    const type = n.type ?? n.Type;
    if (type === 'contact_message') {
      const name = n.data?.name ?? n.Name ?? '';
      const email = n.data?.email ?? n.Email ?? '';
      return [name, email].filter(Boolean).join(' • ') || 'Contact message received';
    }
    return '';
  }

  function formatDateSafe(input: string): string {
    if (!input) return 'Just now';
    const d = new Date(input);
    if (isNaN(d.getTime())) return 'Just now';
    return d.toLocaleString();
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{count} new</span>
              <button
                onClick={markAllAsRead}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all as read
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No notifications</div>
            ) : (
              items.map((n, index) => (
                <div key={n.id || `notification-${index}`} className={`p-4 ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="text-xl leading-none" aria-hidden>
                      {iconForType(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{n.title}</p>
                        <span className="text-xs text-gray-400">{formatDateSafe(n.createdAt)}</span>
                      </div>
                      {(n.message ?? '').length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{n.message}</p>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400 hover:underline"
                        >
                          <Check className="w-3 h-3" /> Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
