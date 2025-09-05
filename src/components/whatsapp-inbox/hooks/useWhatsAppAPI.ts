/**
 * @file useWhatsAppAPI.ts
 * @max-lines 300
 * @current-lines 250
 * @architecture modular
 * @validates-rules ✅
 */

import { useState, useCallback } from 'react';
import {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppConfig,
  MessageTemplate,
  QuickReply,
  ApiResponse,
  PaginatedResponse,
} from '../types/whatsapp.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';

export const useWhatsAppAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<Response>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('WhatsApp API Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Conversations API
  const getConversations = useCallback(async (
    companyId: string,
    filter?: 'all' | 'unread' | 'archived',
    search?: string
  ): Promise<WhatsAppConversation[] | null> => {
    const params = new URLSearchParams();
    if (filter && filter !== 'all') params.append('filter', filter);
    if (search) params.append('search', search);
    
    return handleApiCall<ApiResponse<WhatsAppConversation[]>>(
      () => fetch(`${API_BASE_URL}/whatsapp/conversations/${companyId}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).then(response => response?.data || null);
  }, [handleApiCall]);

  const getConversationById = useCallback(async (
    conversationId: string
  ): Promise<WhatsAppConversation | null> => {
    return handleApiCall<ApiResponse<WhatsAppConversation>>(
      () => fetch(`${API_BASE_URL}/whatsapp/conversations/single/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).then(response => response?.data || null);
  }, [handleApiCall]);

  // Messages API
  const getMessages = useCallback(async (
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<WhatsAppMessage[] | null> => {
    return handleApiCall<ApiResponse<PaginatedResponse<WhatsAppMessage>>>(
      () => fetch(`${API_BASE_URL}/whatsapp/messages/${conversationId}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).then(response => response?.data?.data || null);
  }, [handleApiCall]);

  const sendMessage = useCallback(async (
    to: string,
    message: string,
    companyId: string
  ): Promise<WhatsAppMessage | null> => {
    return handleApiCall<ApiResponse<WhatsAppMessage>>(
      () => fetch(`${API_BASE_URL}/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          body: message,
          companyId
        }),
      })
    ).then(response => response?.data || null);
  }, [handleApiCall]);

  const markMessageAsRead = useCallback(async (
    messageId: string
  ): Promise<boolean> => {
    return handleApiCall<ApiResponse<any>>(
      () => fetch(`${API_BASE_URL}/whatsapp/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).then(response => response?.success || false);
  }, [handleApiCall]);

  // Configuration API
  const getConfig = useCallback(async (
    companyId: string
  ): Promise<WhatsAppConfig | null> => {
    return handleApiCall<ApiResponse<WhatsAppConfig>>(
      () => fetch(`${API_BASE_URL}/whatsapp/config/${companyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).then(response => response?.data || null);
  }, [handleApiCall]);

  const updateConfig = useCallback(async (
    companyId: string,
    config: Partial<WhatsAppConfig>
  ): Promise<WhatsAppConfig | null> => {
    return handleApiCall<ApiResponse<WhatsAppConfig>>(
      () => fetch(`${API_BASE_URL}/whatsapp/config/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })
    ).then(response => response?.data || null);
  }, [handleApiCall]);

  const testConnection = useCallback(async (
    companyId: string
  ): Promise<boolean> => {
    return handleApiCall<ApiResponse<{ isConnected: boolean }>>(
      () => fetch(`${API_BASE_URL}/whatsapp/config/${companyId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).then(response => response?.data?.isConnected || false);
  }, [handleApiCall]);

  // Templates API
  const getTemplates = useCallback(async (
    companyId: string
  ): Promise<MessageTemplate[] | null> => {
    return handleApiCall<ApiResponse<MessageTemplate[]>>(
      () => fetch(`${API_BASE_URL}/whatsapp/templates/${companyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).then(response => response?.data || null);
  }, [handleApiCall]);

  const createTemplate = useCallback(async (
    template: Omit<MessageTemplate, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
  ): Promise<MessageTemplate | null> => {
    return handleApiCall<ApiResponse<MessageTemplate>>(
      () => fetch(`${API_BASE_URL}/whatsapp/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      })
    ).then(response => response?.data || null);
  }, [handleApiCall]);

  const updateTemplate = useCallback(async (
    templateId: string,
    updates: Partial<MessageTemplate>
  ): Promise<MessageTemplate | null> => {
    return handleApiCall<ApiResponse<MessageTemplate>>(
      () => fetch(`${API_BASE_URL}/whatsapp/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
    ).then(response => response?.data || null);
  }, [handleApiCall]);

  const deleteTemplate = useCallback(async (
    templateId: string
  ): Promise<boolean> => {
    return handleApiCall<ApiResponse<any>>(
      () => fetch(`${API_BASE_URL}/whatsapp/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).then(response => response?.success || false);
  }, [handleApiCall]);

  // Quick Replies API
  const getQuickReplies = useCallback(async (
    companyId: string
  ): Promise<QuickReply[] | null> => {
    return handleApiCall<ApiResponse<QuickReply[]>>(
      () => fetch(`${API_BASE_URL}/whatsapp/quick-replies/${companyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).then(response => response?.data || null);
  }, [handleApiCall]);

  return {
    loading,
    error,
    // Conversations
    getConversations,
    getConversationById,
    // Messages
    getMessages,
    sendMessage,
    markMessageAsRead,
    // Config
    getConfig,
    updateConfig,
    testConnection,
    // Templates
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    // Quick Replies
    getQuickReplies,
  };
};