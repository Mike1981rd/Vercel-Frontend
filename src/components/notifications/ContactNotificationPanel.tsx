'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Mail, Phone, Clock, Check, Archive, MoreVertical, Settings, RefreshCw } from 'lucide-react';
import { useContactNotifications } from '@/hooks/useContactNotifications';
import { format } from 'date-fns';

interface ContactNotificationPanelProps {
  companyId?: number;
  className?: string;
}

export default function ContactNotificationPanel({
  companyId,
  className = ''
}: ContactNotificationPanelProps) {
  const contactNotifications = useContactNotifications();
  const {
    unreadCount,
    notifications
  } = contactNotifications;
  
  // TODO: Add these to useContactNotifications hook
  const settings = (contactNotifications as any).settings || { emailEnabled: true, soundEnabled: false };
  const markAsRead = (contactNotifications as any).markAsRead || (() => {});
  const markAsArchived = (contactNotifications as any).markAsArchived || (() => {});
  const fetchNotifications = (contactNotifications as any).fetchNotifications || (() => {});
  const fetchUnreadCount = (contactNotifications as any).fetchUnreadCount || (() => {});

  const [isOpen, setIsOpen] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'unread' | 'all' | 'archived'>('unread');

  // Obtener companyId
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

  // Cargar notificaciones cuando se abre el panel
  useEffect(() => {
    if (isOpen && currentCompanyId) {
      loadNotifications();
    }
  }, [isOpen, currentCompanyId, selectedTab]);

  const loadNotifications = async () => {
    if (!currentCompanyId) return;
    
    setIsLoading(true);
    try {
      const statusFilter = selectedTab === 'all' ? undefined : selectedTab;
      await fetchNotifications(currentCompanyId, statusFilter);
      await fetchUnreadCount(currentCompanyId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    if (!currentCompanyId) return;
    await markAsRead(currentCompanyId, messageId);
  };

  const handleMarkAsArchived = async (messageId: number) => {
    if (!currentCompanyId) return;
    await markAsArchived(currentCompanyId, messageId);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (error) {
      return 'Unknown date';
    }
  };

  const truncateMessage = (message: string, maxLength: number = 100) => {
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  // No mostrar si las notificaciones están deshabilitadas
  if (settings?.dashboardNotificationsEnabled === false) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        title="Contact notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Contact Messages
                </h3>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={loadNotifications}
                  disabled={isLoading}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {['unread', 'all', 'archived'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab as any)}
                  className={`flex-1 px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    selectedTab === tab
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                  {tab === 'unread' && unreadCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-xs font-medium text-white bg-red-500 rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500 dark:text-gray-400">Loading...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                    No messages yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Contact messages will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(notifications as any[]).map((notification: any) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                        notification.status === 'unread' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.name}
                            </span>
                            {notification.status === 'unread' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                New
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <Mail className="w-3 h-3" />
                            <span>{notification.email}</span>
                            {notification.phone && (
                              <>
                                <span>•</span>
                                <Phone className="w-3 h-3" />
                                <span>{notification.phone}</span>
                              </>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {truncateMessage(notification.message)}
                          </p>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(notification.createdAt)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {notification.status === 'unread' && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {notification.status !== 'archived' && (
                            <button
                              onClick={() => handleMarkAsArchived(notification.id)}
                              className="p-1.5 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors rounded"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <div className="text-center">
                  <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    View all messages
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}