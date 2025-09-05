import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';

// Types for contact notifications module
export type ContactMessageStatus = 'unread' | 'read' | 'archived';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ContactMessage {
  id: number;
  companyId: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
}

export interface ContactNotificationSettings {
  emailNotificationsEnabled: boolean;
  toastNotificationsEnabled: boolean;
  dashboardNotificationsEnabled: boolean;
  playSoundOnNewMessage: boolean;
  notificationEmailAddress: string;
  emailSubjectTemplate: string;
  toastSuccessMessage: string;
  toastErrorMessage: string;
}

export interface UseContactNotificationsReturn {
  // state
  isSubmitting: boolean;
  unreadCount: number;
  notifications: ContactMessage[];
  settings: ContactNotificationSettings | null;

  // actions - fetch
  fetchUnreadCount: (companyId: number) => Promise<void>;
  fetchNotifications: (
    companyId: number,
    status?: ContactMessageStatus,
    page?: number,
    pageSize?: number
  ) => Promise<void>;
  loadSettings: (companyId: number) => Promise<void>;

  // actions - update
  markAsRead: (companyId: number, messageId: number) => Promise<void>;
  markAsArchived: (companyId: number, messageId: number) => Promise<void>;
  updateSettings: (
    companyId: number,
    data: Partial<ContactNotificationSettings>
  ) => Promise<void>;
  submitContactForm: (companyId: number, data: ContactFormData) => Promise<boolean>;

  // helpers
  showSuccessToast: (msg?: string) => void;
  showErrorToast: (msg?: string) => void;
}

// Lightweight internal toast helpers to avoid hard-coding a dependency here.
// The ContactNotificationProvider injects react-hot-toast Toaster globally.
let toastImpl: { success: (m: string) => void; error: (m: string) => void } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: rht } = require('react-hot-toast');
  toastImpl = rht as any;
} catch {}

export function useContactNotifications(): UseContactNotificationsReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<ContactNotificationSettings | null>(null);
  const lastCompanyId = useRef<number | null>(null);

  const showSuccessToast = useCallback((msg?: string) => {
    if (toastImpl && typeof toastImpl.success === 'function') {
      toastImpl.success(msg || 'Done');
    }
  }, []);

  const showErrorToast = useCallback((msg?: string) => {
    if (toastImpl && typeof toastImpl.error === 'function') {
      toastImpl.error(msg || 'Error');
    }
  }, []);

  const fetchUnreadCount = useCallback(async (companyId: number) => {
    try {
      const { data } = await api.get<{ data: number }>(`/contact/company/${companyId}/unread-count`);
      setUnreadCount(typeof data === 'number' ? data : (data as any));
    } catch {
      // Silent; UI can still render without badge
    }
  }, []);

  const fetchNotifications = useCallback(
    async (
      companyId: number,
      status?: ContactMessageStatus,
      page = 1,
      pageSize = 20
    ) => {
      try {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        const url = `/contact/company/${companyId}/messages?${params.toString()}`;
        const res = await api.get<{ data: ContactMessage[] } | ContactMessage[]>(url);
        const list = Array.isArray((res as any).data)
          ? ((res as any).data as ContactMessage[])
          : ((res as any) as ContactMessage[]);
        setNotifications(list || []);
      } catch {
        setNotifications([]);
      }
    },
    []
  );

  const loadSettings = useCallback(async (companyId: number) => {
    try {
      const res = await api.get<{ data: ContactNotificationSettings } | ContactNotificationSettings>(
        `/contact/company/${companyId}/notification-settings`
      );
      const value = (res as any).data ?? res;
      setSettings(value as ContactNotificationSettings);
    } catch {
      // Provide safe defaults to avoid undefined checks everywhere
      setSettings({
        emailNotificationsEnabled: false,
        toastNotificationsEnabled: true,
        dashboardNotificationsEnabled: true,
        playSoundOnNewMessage: false,
        notificationEmailAddress: '',
        emailSubjectTemplate: 'New Contact Message from {name}',
        toastSuccessMessage: 'Message sent successfully!',
        toastErrorMessage: 'Error sending message. Please try again.'
      });
    }
  }, []);

  const markAsRead = useCallback(async (companyId: number, messageId: number) => {
    try {
      await api.put(`/contact/company/${companyId}/messages/${messageId}/status`, { status: 'read' });
      // Optimistic update
      setNotifications((prev) => prev.map((m) => (m.id === messageId ? { ...m, status: 'read' } : m)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      // no-op
    }
  }, []);

  const markAsArchived = useCallback(async (companyId: number, messageId: number) => {
    try {
      await api.put(`/contact/company/${companyId}/messages/${messageId}/status`, { status: 'archived' });
      setNotifications((prev) => prev.map((m) => (m.id === messageId ? { ...m, status: 'archived' } : m)));
    } catch (e) {
      // no-op
    }
  }, []);

  const updateSettings = useCallback(
    async (companyId: number, data: Partial<ContactNotificationSettings>) => {
      await api.put(`/contact/company/${companyId}/notification-settings`, data);
      setSettings((prev) => ({ ...(prev || ({} as ContactNotificationSettings)), ...data }));
      if ((settings?.toastNotificationsEnabled ?? true) !== false) {
        showSuccessToast('Settings saved');
      }
    },
    [settings?.toastNotificationsEnabled, showSuccessToast]
  );

  const submitContactForm = useCallback(
    async (companyId: number, data: ContactFormData): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        await api.post(`/contact/company/${companyId}/submit`, data);
        if ((settings?.toastNotificationsEnabled ?? true) !== false) {
          showSuccessToast(settings?.toastSuccessMessage || 'Message sent successfully!');
        }
        // Optionally refresh unread count
        await fetchUnreadCount(companyId);
        return true;
      } catch (e) {
        if ((settings?.toastNotificationsEnabled ?? true) !== false) {
          showErrorToast(settings?.toastErrorMessage || 'Error sending message');
        }
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchUnreadCount, settings?.toastNotificationsEnabled, settings?.toastErrorMessage, settings?.toastSuccessMessage, showErrorToast, showSuccessToast]
  );

  // Auto-load settings once per company
  useEffect(() => {
    const cidStr = typeof window !== 'undefined' ? window.localStorage.getItem('companyId') : null;
    const cid = cidStr ? parseInt(cidStr) : null;
    if (cid && lastCompanyId.current !== cid) {
      lastCompanyId.current = cid;
      loadSettings(cid);
    }
  }, [loadSettings]);

  return {
    isSubmitting,
    unreadCount,
    notifications,
    settings,
    fetchUnreadCount,
    fetchNotifications,
    loadSettings,
    markAsRead,
    markAsArchived,
    updateSettings,
    submitContactForm,
    showSuccessToast,
    showErrorToast,
  };
}

