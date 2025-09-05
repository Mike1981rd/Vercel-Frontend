/**
 * @file useWhatsAppStore.ts
 * @max-lines 300
 * @current-lines 200
 * @architecture modular
 * @validates-rules ✅
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppConfig,
  MessageTemplate,
  QuickReply,
  WhatsAppStore,
} from '../types/whatsapp.types';

export const useWhatsAppStore = create<WhatsAppStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      conversations: [],
      selectedConversationId: null,
      messages: {},
      config: null,
      templates: [],
      quickReplies: [],
      loading: false,
      sending: false,
      error: null,

      // Actions
      setConversations: (conversations) =>
        set({ conversations }, false, 'setConversations'),

      selectConversation: (conversationId) =>
        set({ selectedConversationId: conversationId }, false, 'selectConversation'),

      addMessage: (message) =>
        set(
          (state) => {
            const conversationId = message.direction === 'inbound' 
              ? message.from 
              : message.to;
            
            const existingMessages = state.messages[conversationId] || [];
            const updatedMessages = {
              ...state.messages,
              [conversationId]: [...existingMessages, message].sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              ),
            };

            // Update conversation's last message and unread count
            const updatedConversations = state.conversations.map((conv) => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  lastMessage: message,
                  unreadCount: message.direction === 'inbound' 
                    ? conv.unreadCount + 1 
                    : conv.unreadCount,
                };
              }
              return conv;
            });

            return {
              messages: updatedMessages,
              conversations: updatedConversations,
            };
          },
          false,
          'addMessage'
        ),

      updateMessage: (messageId, updates) =>
        set(
          (state) => {
            const updatedMessages = { ...state.messages };
            
            // Find and update the message in all conversations
            Object.keys(updatedMessages).forEach((conversationId) => {
              const messageIndex = updatedMessages[conversationId].findIndex(
                (msg) => msg.id === messageId
              );
              
              if (messageIndex !== -1) {
                updatedMessages[conversationId] = updatedMessages[conversationId].map(
                  (msg, index) => 
                    index === messageIndex ? { ...msg, ...updates } : msg
                );
              }
            });

            return { messages: updatedMessages };
          },
          false,
          'updateMessage'
        ),

      setMessages: (conversationId, messages) =>
        set(
          (state) => ({
            messages: {
              ...state.messages,
              [conversationId]: messages.sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              ),
            },
          }),
          false,
          'setMessages'
        ),

      setConfig: (config) =>
        set({ config }, false, 'setConfig'),

      setTemplates: (templates) =>
        set({ templates }, false, 'setTemplates'),

      setQuickReplies: (quickReplies) =>
        set({ quickReplies }, false, 'setQuickReplies'),

      setLoading: (loading) =>
        set({ loading }, false, 'setLoading'),

      setSending: (sending) =>
        set({ sending }, false, 'setSending'),

      setError: (error) =>
        set({ error }, false, 'setError'),

      // Computed properties (getters)
      get selectedConversation() {
        const state = get();
        return state.conversations.find(
          (conv) => conv.id === state.selectedConversationId
        ) || null;
      },

      get selectedConversationMessages() {
        const state = get();
        if (!state.selectedConversationId) return [];
        return state.messages[state.selectedConversationId] || [];
      },

      get unreadCount() {
        const state = get();
        return state.conversations.reduce(
          (total, conv) => total + conv.unreadCount,
          0
        );
      },
    }),
    {
      name: 'whatsapp-store',
      partialize: (state: WhatsAppStore) => ({
        // Only persist certain parts of the state
        conversations: state.conversations,
        selectedConversationId: state.selectedConversationId,
        config: state.config,
        templates: state.templates,
        quickReplies: state.quickReplies,
      }),
    }
  )
);

// Helper hooks for specific store selectors
export const useWhatsAppConversations = () => 
  useWhatsAppStore((state) => state.conversations);

export const useSelectedConversation = () => 
  useWhatsAppStore((state) => state.selectedConversation);

export const useSelectedConversationMessages = () => 
  useWhatsAppStore((state) => state.selectedConversationMessages);

export const useWhatsAppConfig = () => 
  useWhatsAppStore((state) => state.config);

export const useWhatsAppTemplates = () => 
  useWhatsAppStore((state) => state.templates);

export const useWhatsAppQuickReplies = () => 
  useWhatsAppStore((state) => state.quickReplies);

export const useWhatsAppLoading = () => 
  useWhatsAppStore((state) => ({ loading: state.loading, sending: state.sending }));

export const useWhatsAppError = () => 
  useWhatsAppStore((state) => state.error);

export const useWhatsAppUnreadCount = () => 
  useWhatsAppStore((state) => state.unreadCount);
