'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type AppNotification = {
  Id: number;
  Type: string;
  Title: string;
  Message?: string;
  IsRead: boolean;
  CreatedAt: string;
  RelatedEntityType?: string;
  RelatedEntityId?: string;
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
      const res = await api.get<AppNotification[]>('/notifications?limit=20');
      const list = (res as any).data ?? (res as any);
      setItems(Array.isArray(list) ? list : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.Id === id ? { ...n, IsRead: true } : n)));
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
              items.map((n) => (
                <div key={n.Id} className={`p-4 ${!n.IsRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="text-xl leading-none" aria-hidden>
                      {iconForType(n.Type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{n.Title}</p>
                        <span className="text-xs text-gray-400">{new Date(n.CreatedAt).toLocaleString()}</span>
                      </div>
                      {n.Message && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{n.Message}</p>
                      )}
                      {!n.IsRead && (
                        <button
                          onClick={() => markAsRead(n.Id)}
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

