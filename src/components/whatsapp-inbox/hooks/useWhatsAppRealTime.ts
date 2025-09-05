/**
 * @file useWhatsAppRealTime.ts
 * @max-lines 300
 * @current-lines 200
 * @architecture modular
 * @validates-rules ✅
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { WhatsAppMessage, WhatsAppConversation } from '../types/whatsapp.types';
import { useWhatsAppStore } from './useWhatsAppStore';

const POLLING_INTERVAL = 10000; // 10 seconds
const NOTIFICATION_SOUND = '/sounds/notification.mp3';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';

interface UseWhatsAppRealTimeOptions {
  companyId: string;
  enabled?: boolean;
  playNotificationSound?: boolean;
  showDesktopNotifications?: boolean;
}

export const useWhatsAppRealTime = ({
  companyId,
  enabled = true,
  playNotificationSound = true,
  showDesktopNotifications = true,
}: UseWhatsAppRealTimeOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<Date>(new Date());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { addMessage, conversations, setConversations } = useWhatsAppStore();

  // Initialize audio for notifications
  useEffect(() => {
    if (playNotificationSound && typeof window !== 'undefined') {
      audioRef.current = new Audio(NOTIFICATION_SOUND);
      audioRef.current.volume = 0.5;
      
      // Preload the audio
      audioRef.current.load();
    }
  }, [playNotificationSound]);

  // Request desktop notification permission
  useEffect(() => {
    if (showDesktopNotifications && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [showDesktopNotifications]);

  const playNotificationSoundEffect = useCallback(() => {
    if (playNotificationSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.warn('Could not play notification sound:', error);
      });
    }
  }, [playNotificationSound]);

  const showDesktopNotification = useCallback((message: WhatsAppMessage, contactName: string) => {
    if (!showDesktopNotifications || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(`Nuevo mensaje de ${contactName}`, {
        body: message.body.length > 50 ? message.body.slice(0, 50) + '...' : message.body,
        icon: '/icons/whatsapp.png',
        badge: '/icons/whatsapp-badge.png',
        tag: `whatsapp-${message.from}`,
        requireInteraction: false,
        silent: false,
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Optional: Handle click to focus window/tab
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, [showDesktopNotifications]);

  const pollNewMessages = useCallback(async () => {
    if (!enabled || !companyId) return;

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        setIsConnected(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/whatsapp/messages/new/${companyId}?since=${lastPollTime.toISOString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to poll messages: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        const newMessages: WhatsAppMessage[] = data.data;
        
        newMessages.forEach((message: WhatsAppMessage) => {
          addMessage(message);
          
          // Only notify for inbound messages
          if (message.direction === 'inbound') {
            // Find contact name for notification
            const conversation = conversations.find((conv: WhatsAppConversation) => 
              conv.contact.phoneNumber === message.from
            );
            const contactName = conversation?.contact.name || message.from;
            
            // Play sound
            playNotificationSoundEffect();
            
            // Show desktop notification
            showDesktopNotification(message, contactName);
          }
        });

        setLastPollTime(new Date());
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Polling error:', error);
      setIsConnected(false);
    }
  }, [
    enabled,
    companyId,
    lastPollTime,
    addMessage,
    conversations,
    playNotificationSoundEffect,
    showDesktopNotification,
  ]);

  const pollConversationUpdates = useCallback(async () => {
    if (!enabled || !companyId) return;

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/whatsapp/conversations/${companyId}/updates?since=${lastPollTime.toISOString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to poll conversation updates: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        const updatedConversations: WhatsAppConversation[] = data.data;
        
        // Update conversations in store
        const updatedList = [...conversations];
        
        updatedConversations.forEach((updatedConv: WhatsAppConversation) => {
          const index = updatedList.findIndex((conv: WhatsAppConversation) => conv.id === updatedConv.id);
          if (index !== -1) {
            updatedList[index] = updatedConv;
          } else {
            // New conversation
            updatedList.unshift(updatedConv);
          }
        });
        
        const sortedList = updatedList.sort((a, b) => 
          new Date(b.lastMessage?.timestamp || b.updatedAt).getTime() - 
          new Date(a.lastMessage?.timestamp || a.updatedAt).getTime()
        );
        
        setConversations(sortedList);
      }
    } catch (error) {
      console.error('Conversation polling error:', error);
    }
  }, [enabled, companyId, lastPollTime, setConversations]);

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      await Promise.all([
        pollNewMessages(),
        pollConversationUpdates(),
      ]);
    }, POLLING_INTERVAL);
  }, [pollNewMessages, pollConversationUpdates]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Start/stop polling based on enabled state
  useEffect(() => {
    if (enabled && companyId) {
      startPolling();
      setIsConnected(true);
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [enabled, companyId, startPolling, stopPolling]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        // When page becomes visible, do an immediate poll
        pollNewMessages();
        pollConversationUpdates();
        startPolling();
      } else if (document.visibilityState === 'hidden') {
        // Optionally reduce polling frequency when tab is not visible
        // For now, we keep the same interval
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, pollNewMessages, pollConversationUpdates, startPolling]);

  return {
    isConnected,
    startPolling,
    stopPolling,
    lastPollTime,
  };
};