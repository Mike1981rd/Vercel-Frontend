'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';
import type { Conversation } from './ChatRoom';
import { Avatar } from '@/components/ui/Avatar';
import type { ChatTheme } from './ThemeSelector';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversation: Conversation | null;
  theme?: ChatTheme;
}

export default function ConversationList({ 
  onSelectConversation, 
  selectedConversation,
  theme 
}: ConversationListProps) {
  const { t } = useI18n();
  const DEBUG = false;
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const lastNonEmptyRef = useRef<Conversation[] | null>(null);
  const intervalRef = useRef<number | null>(null);
  const syncIntervalRef = useRef<number | null>(null);
  const inFlightRef = useRef<boolean>(false);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef<boolean>(false);
  const firstSyncAttemptedRef = useRef<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'widget' | 'unread'>('all');
  const autoSelectedRef = useRef<boolean>(false);

  useEffect(() => {
    mountedRef.current = true;
    // Initial load
    loadConversations();
    // Guard against double effect in React StrictMode; poll every 10s for recency
    if (!intervalRef.current) {
      intervalRef.current = window.setInterval(loadConversations, 10000);
    }
    // Refresh on window focus (user returns to tab)
    const onFocus = () => loadConversations();
    window.addEventListener('focus', onFocus);
    // Periodic deep sync with backend to surface new threads from external sources
    const startSync = async () => {
      try {
        const token = localStorage.getItem('token');
        await fetch(getApiEndpoint('/whatsapp/conversations/sync'), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token || ''}` },
        });
      } catch {}
    };
    if (!syncIntervalRef.current) {
      // Every 60s, request a backend sync in background
      syncIntervalRef.current = window.setInterval(startSync, 60000);
    }
    // Listen for conversation closed events to update the list immediately
    const onClosed = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as { id?: string } | undefined;
        const closedId = detail?.id;
        if (!closedId) return;
        setConversations(prev => prev.filter(c => c.id !== closedId));
        if (lastNonEmptyRef.current) {
          lastNonEmptyRef.current = lastNonEmptyRef.current.filter(c => c.id !== closedId);
        }
        // Trigger a background refresh to reflect backend state
        setTimeout(() => { if (mountedRef.current) loadConversations(); }, 300);
      } catch {}
    };
    window.addEventListener('whatsapp:conversationClosed', onClosed as EventListener);
    // When a conversation is opened, clear its unreadCount immediately
    const onOpened = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as { id?: string } | undefined;
        const openedId = detail?.id;
        if (!openedId) return;
        setConversations(prev => prev.map(c => c.id === openedId ? { ...c, unreadCount: 0 } : c));
        if (lastNonEmptyRef.current) {
          lastNonEmptyRef.current = lastNonEmptyRef.current.map(c => c.id === openedId ? { ...c, unreadCount: 0 } as Conversation : c);
        }
      } catch {}
    };
    window.addEventListener('whatsapp:conversationOpened', onOpened as EventListener);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // no abort on cleanup to avoid AbortError in dev strict mode
      mountedRef.current = false;
      window.removeEventListener('whatsapp:conversationClosed', onClosed as EventListener);
      window.removeEventListener('whatsapp:conversationOpened', onOpened as EventListener);
      window.removeEventListener('focus', onFocus);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, []);

  const loadConversations = async () => {
    if (inFlightRef.current) return; // prevent overlap
    inFlightRef.current = true;
    try {
      const token = localStorage.getItem('token');
      const endpoint = getApiEndpoint('/whatsapp/conversations?page=1&pageSize=100');
      if (DEBUG) console.log('Loading conversations from:', endpoint);
      
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token || ''}` },
        cache: 'no-store',
      });
      
      if (DEBUG) console.log('Conversations response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        if (DEBUG) console.log('Conversations response data:', data);
        
        // The API returns data.data which is a WhatsAppConversationListDto with a Conversations property
        if (data?.data?.Conversations || data?.data?.conversations) {
          const conversationsList = data.data.Conversations || data.data.conversations;
          if (DEBUG) console.log('Found conversations list:', conversationsList);
          if (DEBUG && Array.isArray(conversationsList) && conversationsList.length > 0) {
            console.log('[ConversationList] Raw first conversation:', conversationsList[0]);
          }
          
          // Transform API data to Conversation format
          const formattedConversations: Conversation[] = conversationsList.map((conv: any) => {
            const rawAvatar =
              conv.customerProfile?.profilePictureUrl ||
              conv.customerProfile?.ProfilePictureUrl ||
              conv.customerProfile?.profileImageUrl ||
              conv.customerProfile?.avatarUrl ||
              conv.profilePictureUrl ||
              conv.profileImageUrl ||
              conv.avatarUrl ||
              conv.avatar ||
              conv.contactAvatar ||
              '';

            const name = conv.customerName || conv.contactName || conv.customerProfile?.name || conv.customerProfile?.Name || 'Unknown';
            const source = conv.source || 'whatsapp';
            const isWidget = source === 'widget';
            
            return {
              // Use backend internal GUID for routing
              id: conv.id,
              // Do not append email in parentheses; show clean name only
              contactName: name,
              contactPhone: conv.customerPhone || conv.phoneNumber || '',
              lastMessage: conv.lastMessagePreview || conv.lastMessage || '',
              lastMessageTime: new Date(conv.lastMessageAt || conv.updatedAt || conv.createdAt),
              source: source,
              sessionId: conv.sessionId,
              customerEmail: conv.customerEmail,
              // keep status if backend provides it so we can filter client-side
              // @ts-expect-error extend shape
              status: conv.status || conv.Status || undefined,
              unreadCount: conv.unreadCount || 0,
              isOnline: conv.isOnline || false,
              avatar: (rawAvatar && String(rawAvatar).trim().length > 0) ? String(rawAvatar) : null,
            } as Conversation;
          });
          if (DEBUG) console.log('Formatted conversations:', formattedConversations);
          // Hide closed/archived conversations from the list
          const activeConversations = formattedConversations.filter((c: any) => c.status !== 'closed' && c.status !== 'archived');
          if (activeConversations.length > 0) {
            if (mountedRef.current) setConversations(activeConversations);
            lastNonEmptyRef.current = activeConversations;
          } else if (lastNonEmptyRef.current && lastNonEmptyRef.current.length > 0) {
            if (DEBUG) console.log('[ConversationList] Empty response ignored to prevent flicker');
            if (mountedRef.current) setConversations(lastNonEmptyRef.current);
          } else {
            // Primera carga y vacío: forzar sync backend y reintentar
            if (!firstSyncAttemptedRef.current) {
              firstSyncAttemptedRef.current = true;
              try {
                await fetch(getApiEndpoint('/whatsapp/conversations/sync'), {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token || ''}` },
                });
              } catch {}
              await new Promise(r => setTimeout(r, 1500));
              inFlightRef.current = false;
              return await loadConversations();
            } else {
              if (mountedRef.current) setConversations([]);
            }
          }
        } else {
          if (DEBUG) console.log('No conversations found in response; keeping current state');
        }
      } else {
        console.error('Failed to load conversations, status:', res.status);
        const errorText = await res.text();
        console.error('Error response:', errorText);
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error loading conversations:', error);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
      inFlightRef.current = false;
    }
  };

  const handleManualRefresh = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiEndpoint('/whatsapp/conversations/sync'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || ''}` },
      });
      if (!res.ok) {
        console.warn('Manual sync failed with status', res.status);
      }
      // Also attempt rebuild from messages to surface older conversations
      await fetch(getApiEndpoint('/whatsapp/conversations/rebuild-from-messages'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || ''}` },
      }).catch(() => {});
    } catch (e) {
      console.warn('Manual sync error', e);
    } finally {
      loadConversations();
    }
  };

  const filteredConversations = conversations
    .filter(conv => {
      const matchesSearch = conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           conv.contactPhone.includes(searchQuery) ||
                           conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'widget' && (conv.source === 'widget')) ||
        (filter === 'unread' && conv.unreadCount > 0);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

  // Auto-select the first conversation once after initial load
  useEffect(() => {
    if (!loading && !autoSelectedRef.current && filteredConversations.length > 0 && !selectedConversation) {
      autoSelectedRef.current = true;
      try {
        onSelectConversation(filteredConversations[0]);
      } catch {}
    }
  }, [loading, filteredConversations, selectedConversation, onSelectConversation]);

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString('es', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNewConversation = () => {
    // TODO: Implement new conversation modal
    alert('Nueva conversación - Por implementar');
  };

  // Get theme colors or use defaults
  const themeColors = theme?.colors || {
    inputBg: 'bg-white',
    inputText: 'text-gray-900',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-50',
    messageText: 'text-gray-900'
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Search and Filters */}
      <div className={`flex-shrink-0 p-4 border-b ${themeColors.border}`}>
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${themeColors.inputText} opacity-50`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar conversaciones..."
            className={`w-full pl-10 pr-4 py-2 border ${themeColors.border} rounded-lg bg-black/10 ${themeColors.inputText} placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : `${themeColors.inputText} opacity-70 ${themeColors.hover}`
            }`}
          >
            Todas ({conversations.length})
          </button>
          <button
            onClick={() => setFilter('widget')}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'widget'
                ? 'bg-purple-600 text-white'
                : `${themeColors.inputText} opacity-70 ${themeColors.hover}`
            }`}
          >
            Widget ({conversations.filter(c => c.source === 'widget').length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : `${themeColors.inputText} opacity-70 ${themeColors.hover}`
            }`}
          >
            No leídas ({conversations.filter(c => c.unreadCount > 0).length})
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <p className="text-sm">No hay conversaciones</p>
          </div>
        ) : (
          <>
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full p-4 flex items-start transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-blue-600/20 border-l-4 border-blue-500'
                    : themeColors.hover
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 relative">
                  <Avatar name={conversation.contactName} src={conversation.avatar || undefined} size="lg" />
                  {conversation.isOnline && (
                    <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 ${theme?.id === 'dark' ? 'border-gray-800' : 'border-white'}`}></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 ml-3 text-left">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-medium ${themeColors.inputText}`}>
                        {conversation.contactName}
                      </h3>
                      {conversation.source === 'widget' && (
                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                          Widget
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${themeColors.inputText} opacity-60`}>
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  <p className={`text-xs ${themeColors.inputText} opacity-50 mt-0.5`}>
                    {conversation.source === 'widget' 
                      ? (conversation.customerEmail || 'Chat del sitio web')
                      : conversation.contactPhone}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm ${themeColors.inputText} opacity-70 truncate pr-2`}>
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
