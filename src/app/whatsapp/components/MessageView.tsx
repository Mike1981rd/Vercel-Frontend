'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Check,
  CheckCheck,
  X
} from 'lucide-react';
import MessageInput from './MessageInput';
import { useI18n } from '@/contexts/I18nContext';
import { getApiEndpoint } from '@/lib/api-url';
import type { Conversation, Message } from './ChatRoom';
import { Avatar } from '@/components/ui/Avatar';
import type { ChatTheme } from './ThemeSelector';

interface MessageViewProps {
  conversation: Conversation;
  onShowDetails?: () => void;
  onBack?: () => void;
  onContactClick?: () => void;
  isMobile?: boolean;
  theme?: ChatTheme;
  messagesCacheRef?: React.MutableRefObject<Record<string, Message[]>>;
}

export default function MessageView({ 
  conversation, 
  onShowDetails, 
  onBack,
  onContactClick,
  isMobile = false,
  theme,
  messagesCacheRef
}: MessageViewProps) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const inFlightRef = useRef<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);
  const stickToBottomRef = useRef<boolean>(true);

  useEffect(() => {
    // Instant show from cache if exists
    if (messagesCacheRef?.current?.[conversation.id]) {
      setMessages(messagesCacheRef.current[conversation.id]);
      setLoading(false);
    }
    loadMessages();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    intervalRef.current = window.setInterval(loadMessages, 8000); // Poll every 8s
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [conversation.id]);

  useEffect(() => {
    // Scroll to bottom when messages change only if user is near bottom
    scrollToBottom(false);
  }, [messages]);

  // Track user scroll to avoid snapping to bottom when user is reading older messages
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      // Consider near bottom if within 80px
      stickToBottomRef.current = distanceFromBottom < 80;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    // Initialize state
    onScroll();
    return () => {
      el.removeEventListener('scroll', onScroll as any);
    };
  }, []);

  // Load messages from API (mocks only when NEXT_PUBLIC_USE_MOCKS==='true')
  const loadMessages = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const token = localStorage.getItem('token');
      // Prefer messages endpoint first for fastest history display
      const endpoint = getApiEndpoint(`/whatsapp/conversations/${conversation.id}/messages?page=1&pageSize=20`);
        if (process.env.NODE_ENV !== 'production') {
          console.log('[MessageView] Fetching messages from:', endpoint, 'for conversation', conversation.id);
        }
        const res = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token || ''}` },
          cache: 'no-store',
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          const raw = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.messages)
              ? data.data.messages
              : Array.isArray(data?.messages)
                ? data.messages
                : [];
          if (process.env.NODE_ENV !== 'production') {
            console.log('[MessageView] Messages payload length:', Array.isArray(raw) ? raw.length : 'N/A');
          }
          if (Array.isArray(raw) && raw.length > 0) {
            const formatted: Message[] = raw.map((msg: any) => {
              const dir = (msg.direction || '').toLowerCase();
              const from = msg.from || msg.From;
              const isOutbound = dir === 'outbound' || (from && from !== conversation.contactPhone);
              return {
                id: msg.id || msg.messageId,
                conversationId: conversation.id,
                content: msg.body || msg.content || msg.message || msg.text || '',
                timestamp: new Date(msg.timestamp || msg.createdAt || msg.sentAt || msg.date || Date.now()),
                isFromMe: isOutbound,
                status: msg.status || 'sent',
                type: msg.messageType || msg.type || 'text',
                mediaUrl: msg.mediaUrl || msg.mediaURL || null,
              } as Message;
            });
            setMessages(formatted);
            if (messagesCacheRef) {
              messagesCacheRef.current[conversation.id] = formatted;
            }
          } else {
            // Keep existing messages to avoid flicker
            if (process.env.NODE_ENV !== 'production') {
              console.log('[MessageView] Empty response ignored to prevent flicker');
            }
          }
        } else {
          const err = await res.text();
          console.error('[MessageView] Messages fetch failed', res.status, err);
        }

      // Fire-and-forget enrichment of contact info (name/avatar)
      try {
        fetch(getApiEndpoint(`/whatsapp/conversations/${conversation.id}/enrich`), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token || ''}` },
        }).catch(() => {});
      } catch {}
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('[MessageView] Error loading messages:', error);
      }
      // Do not use mocks by default
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  // No mock messages fallback here; center view must show real data only

  const scrollToBottom = (force: boolean) => {
    if (force || stickToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if this is a widget conversation or WhatsApp conversation
      const isWidgetConversation = conversation.source === 'widget';
      
      let endpoint: string;
      let payload: any;
      
      if (isWidgetConversation) {
        // For widget conversations, use the widget response endpoint
        endpoint = getApiEndpoint(`/whatsapp/widget/conversation/${conversation.id}/respond`);
        payload = { response: content };
      } else {
        // For WhatsApp conversations, use the regular send endpoint
        endpoint = getApiEndpoint('/whatsapp/send');
        payload = {
          to: conversation.contactPhone,
          body: content
        };
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Add message to local state immediately for better UX
        const newMessage: Message = {
          id: Date.now().toString(),
          conversationId: conversation.id,
          content,
          timestamp: new Date(),
          isFromMe: true,
          status: 'sent',
          type: 'text'
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Reload messages to get server confirmation
        setTimeout(loadMessages, 1000);
        // Ensure we stick to bottom after sending
        scrollToBottom(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar mensaje');
    }
  };

  const handleCloseConversation = async () => {
    if (!confirm('¿Estás seguro de que deseas cerrar esta conversación?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = getApiEndpoint(`/whatsapp/widget/conversation/${conversation.id}/close`);
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || ''}`
        }
      });

      if (res.ok) {
        alert('Conversación cerrada exitosamente');
        // Reload messages to reflect the closed status
        loadMessages();
        // Optionally, trigger a callback to refresh the conversation list
        if (onBack) {
          onBack();
        }
      } else {
        alert('Error al cerrar la conversación');
      }
    } catch (error) {
      console.error('Error closing conversation:', error);
      alert('Error al cerrar la conversación');
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es', { 
        day: '2-digit', 
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const renderMessageStatus = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  // Get theme colors or use defaults
  const themeColors = theme?.colors || {
    inputBg: 'bg-white',
    inputText: 'text-gray-900',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-50',
    messageText: 'text-gray-900',
    chatBackground: 'bg-gray-50',
    messageIncoming: 'bg-white',
    messageOutgoing: 'bg-green-500',
    messageOutgoingText: 'text-white'
  };

  return (
    <div className="h-full flex flex-col">
      {/* Minimalist Header - Single line, compact */}
      <div className={`flex-shrink-0 flex items-center justify-between px-2 py-1.5 border-b ${themeColors.border} ${themeColors.inputBg}`}>
        <div className="flex items-center space-x-2">
          {/* Back Button - Always visible */}
          <button
            onClick={onBack || (() => window.history.back())}
            className={`p-1.5 ${themeColors.hover} rounded-lg transition-colors`}
            aria-label="Volver"
          >
            <ArrowLeft className={`h-5 w-5 ${themeColors.inputText}`} />
          </button>
          
          {/* Contact Info - Compact, clickable */}
          <button 
            onClick={onContactClick || onShowDetails}
            className={`flex items-center space-x-2 ${themeColors.hover} rounded-lg px-2 py-1 transition-colors`}
          >
            <Avatar name={conversation.contactName} src={conversation.avatar || undefined} size="sm" />
            <div className="text-left">
              <span className={`text-sm font-medium ${themeColors.inputText} block`}>
                {conversation.contactName}
              </span>
              {conversation.source === 'widget' && (
                <span className={`text-xs ${themeColors.inputText} opacity-60`}>
                  Widget Chat
                </span>
              )}
            </div>
          </button>
        </div>

        <div className="flex items-center space-x-1">
          {/* Close conversation button - only for widget conversations */}
          {conversation.source === 'widget' && (
            <button 
              onClick={handleCloseConversation}
              className={`p-1.5 ${themeColors.hover} rounded-lg transition-colors`}
              aria-label="Cerrar conversación"
              title="Cerrar conversación"
            >
              <X className={`h-5 w-5 ${themeColors.inputText} opacity-60 hover:opacity-100`} />
            </button>
          )}
          
          {/* More options button */}
          <button 
            onClick={onShowDetails || onContactClick}
            className={`p-1.5 ${themeColors.hover} rounded-lg transition-colors`}
            aria-label="Más opciones"
          >
            <MoreVertical className={`h-5 w-5 ${themeColors.inputText} opacity-60`} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto p-4 ${themeColors.chatBackground} ${(themeColors as any).scrollbar || ''}`}
        style={{
          backgroundImage: theme?.id === 'dark' ? 'none' : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className={`flex items-center justify-center h-32 ${themeColors.messageText} opacity-50`}>
            <p className="text-sm">No hay mensajes en esta conversación</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <span className={`px-3 py-1 text-xs ${themeColors.inputBg} ${themeColors.messageText} opacity-60 rounded-full shadow-sm`}>
                    {date}
                  </span>
                </div>

                {/* Messages */}
                <div className="space-y-2">
                  {dateMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] sm:max-w-[60%] px-4 py-2 rounded-2xl ${
                          message.isFromMe
                            ? `${themeColors.messageOutgoing} ${themeColors.messageOutgoingText} rounded-br-sm`
                            : `${themeColors.messageIncoming} ${themeColors.messageText} rounded-bl-sm shadow-sm`
                        }`}
                      >
                        {message.mediaUrl ? (
                          <div className="mb-2">
                            {message.type?.toLowerCase().includes('image') ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={message.mediaUrl}
                                alt={message.content || 'image'}
                                className="rounded-lg object-contain w-auto h-auto max-w-[120px] sm:max-w-[140px] max-h-32"
                              />
                            ) : message.type?.toLowerCase().includes('video') ? (
                              <video
                                src={message.mediaUrl}
                                controls
                                playsInline
                                className="rounded-lg object-contain w-[120px] sm:w-[140px] h-auto max-h-32"
                              />
                            ) : (
                              <a href={message.mediaUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">
                                Descargar archivo
                              </a>
                            )}
                          </div>
                        ) : null}
                        {message.content && (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                        <div className={`flex items-center justify-end mt-1 space-x-1 opacity-70`}>
                          <span className="text-xs">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.isFromMe && renderMessageStatus(message.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className={`flex-shrink-0 border-t ${themeColors.border}`}>
        <MessageInput onSendMessage={handleSendMessage} theme={theme} />
      </div>
    </div>
  );
}
