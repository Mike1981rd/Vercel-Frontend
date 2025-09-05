/**
 * @file WhatsAppInbox.tsx
 * @max-lines 300
 * @current-lines 280
 * @architecture modular
 * @validates-rules ✅
 */

import React, { useEffect, useState, useCallback } from 'react';
import { WhatsAppInboxProps } from './types/whatsapp.types';
import ConversationList from './ConversationList';
import ChatView from './ChatView';
import { useWhatsAppStore } from './hooks/useWhatsAppStore';
import { useWhatsAppAPI } from './hooks/useWhatsAppAPI';

const WhatsAppInbox: React.FC<WhatsAppInboxProps> = ({
  companyId,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Store state
  const {
    conversations,
    selectedConversationId,
    selectedConversation,
    selectedConversationMessages,
    config,
    loading,
    sending,
    error,
    selectConversation,
    setConversations,
    addMessage,
    setMessages,
    setConfig,
    setLoading,
    setSending,
    setError,
  } = useWhatsAppStore();

  // API hooks
  const {
    getConversations,
    getMessages,
    sendMessage,
    markMessageAsRead,
    getConfig,
    loading: apiLoading,
    error: apiError,
  } = useWhatsAppAPI();

  // Initialize data
  useEffect(() => {
    if (companyId) {
      initializeData();
    }
  }, [companyId]);

  // Update store loading state
  useEffect(() => {
    setLoading(apiLoading);
  }, [apiLoading, setLoading]);

  // Update store error state
  useEffect(() => {
    setError(apiError);
  }, [apiError, setError]);

  const initializeData = useCallback(async () => {
    try {
      // Load configuration first
      const configData = await getConfig(companyId);
      setConfig(configData);

      // If no config or inactive, don't load conversations
      if (!configData || !configData.isActive) {
        return;
      }

      // Load conversations
      await loadConversations();
    } catch (error) {
      console.error('Failed to initialize WhatsApp data:', error);
    }
  }, [companyId, getConfig, setConfig]);

  const loadConversations = useCallback(async () => {
    try {
      const conversationsData = await getConversations(companyId, filter, searchQuery);
      if (conversationsData) {
        setConversations(conversationsData);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, [companyId, filter, searchQuery, getConversations, setConversations]);

  const handleSelectConversation = useCallback(async (conversationId: string) => {
    selectConversation(conversationId);
    
    // Load messages for selected conversation
    try {
      const messagesData = await getMessages(conversationId);
      if (messagesData) {
        setMessages(conversationId, messagesData);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [selectConversation, getMessages, setMessages]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!selectedConversation) return;

    setSending(true);
    try {
      const sentMessage = await sendMessage(
        selectedConversation.contact.phoneNumber,
        messageText,
        companyId
      );

      if (sentMessage) {
        // Add the sent message to store
        addMessage(sentMessage);
        
        // Update conversation's last message
        await loadConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  }, [selectedConversation, companyId, sendMessage, addMessage, loadConversations, setSending]);

  const handleMarkAsRead = useCallback(async (messageId: string) => {
    try {
      const success = await markMessageAsRead(messageId);
      if (success) {
        // Update the message status in store
        // The API call already handles the backend update
        await loadConversations(); // Refresh to update unread counts
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }, [markMessageAsRead, loadConversations]);

  const handleSearchConversations = useCallback((query: string) => {
    setSearchQuery(query);
    // Debounce search
    const timeoutId = setTimeout(() => {
      loadConversations();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [loadConversations]);

  const handleFilterChange = useCallback((newFilter: 'all' | 'unread' | 'archived') => {
    setFilter(newFilter);
    loadConversations();
  }, [loadConversations]);

  // Auto-refresh conversations every 30 seconds
  useEffect(() => {
    if (!config?.isActive) return;

    const interval = setInterval(() => {
      loadConversations();
    }, 30000);

    return () => clearInterval(interval);
  }, [config?.isActive, loadConversations]);

  // Error boundary
  if (error) {
    return (
      <div className={`h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error de conexión
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={initializeData}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Configuration required state
  if (!config) {
    return (
      <div className={`h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-center">
            <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Configuración requerida
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Configure WhatsApp primero para comenzar a recibir mensajes
            </p>
            <a
              href="/dashboard/whatsapp/config"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors inline-block"
            >
              Ir a configuración
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Inactive configuration state
  if (!config.isActive) {
    return (
      <div className={`h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              WhatsApp desactivado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              La integración de WhatsApp está desactivada
            </p>
            <a
              href="/dashboard/whatsapp/config"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors inline-block"
            >
              Activar WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="flex h-full">
        {/* Conversations Sidebar */}
        <div className="w-80 flex-shrink-0">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId ?? undefined}
            onSelectConversation={handleSelectConversation}
            onSearchConversations={handleSearchConversations}
            loading={loading}
            searchQuery={searchQuery}
            filter={filter}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1">
          <ChatView
            conversation={selectedConversation}
            messages={selectedConversationMessages}
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkAsRead}
            loading={loading && !selectedConversation}
            sending={sending}
          />
        </div>
      </div>
    </div>
  );
};

export default WhatsAppInbox;
