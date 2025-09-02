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
import { loadMediaSettings, defaultMediaSettings, type MediaSettings } from './MediaSettings';

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
  const DEBUG = false;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const inFlightRef = useRef<boolean>(false);
  const sendInFlightRef = useRef<boolean>(false);
  const lastSentRef = useRef<{ content: string; at: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stickToBottomRef = useRef<boolean>(true);
  const userScrollTsRef = useRef<number>(Date.now());
  const [mediaSettings, setMediaSettings] = useState<MediaSettings>(defaultMediaSettings);
  const prevFingerprintRef = useRef<string | null>(null);
  const currentMessagesRef = useRef<Message[]>([]);

  useEffect(() => {
    // Reset per-conversation state to avoid cross-contamination
    prevFingerprintRef.current = null;
    stickToBottomRef.current = true;
    if (messagesCacheRef?.current?.[conversation.id]) {
      setMessages(messagesCacheRef.current[conversation.id]);
      setLoading(false);
    } else {
      setMessages([]);
      setLoading(true);
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
    // Keep a live ref to latest messages to avoid stale closures in polling
    currentMessagesRef.current = messages;
  }, [messages]);

  // Track user scroll to avoid snapping to bottom when user is reading older messages
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      // Consider near bottom if within 80px
      stickToBottomRef.current = distanceFromBottom < 80;
      userScrollTsRef.current = Date.now();
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    // Initialize state
    onScroll();
    return () => {
      el.removeEventListener('scroll', onScroll as any);
    };
  }, []);

  // Load media settings
  useEffect(() => {
    setMediaSettings(loadMediaSettings());
    const onUpdated = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as MediaSettings | undefined;
        setMediaSettings(detail || loadMediaSettings());
      } catch {
        setMediaSettings(loadMediaSettings());
      }
    };
    window.addEventListener('whatsapp:mediaSettingsUpdated', onUpdated as EventListener);
    return () => window.removeEventListener('whatsapp:mediaSettingsUpdated', onUpdated as EventListener);
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
      // Preserve scroll position if user is reading older messages
      const el = messagesContainerRef.current;
      const prevBottomDistance = el ? (el.scrollHeight - el.scrollTop) : 0;
      const token = localStorage.getItem('token');
      // Prefer messages endpoint first for fastest history display
      const endpoint = getApiEndpoint(`/whatsapp/conversations/${conversation.id}/messages?page=1&pageSize=100`);
        if (DEBUG) console.log('[MessageView] Fetching messages from:', endpoint, 'for conversation', conversation.id);
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
          if (DEBUG) console.log('[MessageView] Messages payload length:', Array.isArray(raw) ? raw.length : 'N/A');
          if (Array.isArray(raw) && raw.length > 0) {
            // Build previous timestamps map to avoid generating new timestamps on each poll
            const prevTsMap = new Map<string, number>();
            for (const m of messages) prevTsMap.set(String(m.id), m.timestamp.getTime());

            const formatted: Message[] = raw.map((msg: any) => {
              const dir = (msg.direction || '').toLowerCase();
              const from = msg.from || msg.From;
              const isOutbound = dir === 'outbound' || (from && from !== conversation.contactPhone);
              const rawId = msg.id || msg.messageId;
              const tsValue = msg.timestamp || msg.createdAt || msg.sentAt || msg.date;
              const stableTs = tsValue ? new Date(tsValue).getTime() : (prevTsMap.get(String(rawId)) || 0);
              return {
                id: rawId,
                conversationId: conversation.id,
                content: msg.body || msg.content || msg.message || msg.text || '',
                timestamp: new Date(stableTs || Date.now()),
                isFromMe: isOutbound,
                status: msg.status || 'sent',
                type: msg.messageType || msg.type || 'text',
                mediaUrl: msg.mediaUrl || msg.mediaURL || null,
              } as Message;
            });
            // Preserve any optimistic local messages newer than server payload
            const maxServerTs = formatted.reduce((acc, m) => Math.max(acc, m.timestamp.getTime()), 0);
            // Build merged list using current state as base for preserved temps
            const prevListAll = currentMessagesRef.current || messages;
            // Restrict to this conversation only
            const prevList = prevListAll.filter(m => m.conversationId === conversation.id);
            // Start with all previously visible messages of this conversation to avoid dropping when server returns a subset
            const byId = new Map<string, Message>();
            for (const m of prevList) byId.set(String(m.id), m);
            // Overlay with server messages (authoritative)
            for (const m of formatted) byId.set(String(m.id), m);
            // Remove temp messages that have a near-equal server match to avoid duplicates
            for (const m of prevList) {
              const isTemp = typeof m.id === 'string' && m.id.startsWith('temp_');
              if (!isTemp) continue;
              const hasNearMatch = formatted.some(s => {
                if (!s.isFromMe) return false;
                const sameContent = (s.content || '').trim() === (m.content || '').trim();
                const dt = Math.abs(s.timestamp.getTime() - m.timestamp.getTime());
                return sameContent && dt <= 90000;
              });
              if (hasNearMatch) byId.delete(String(m.id));
            }

            let merged = Array.from(byId.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            // Deduplicate messages that are semantically the same but have different IDs between polls
            const norm = (s: string) => (s || '').trim().replace(/\s+/g, ' ').slice(0, 200);
            const statusRank = (s?: string) => s === 'read' ? 3 : s === 'delivered' ? 2 : s === 'sent' ? 1 : 0;
            const bucket = (t: Date) => Math.floor(t.getTime() / 3000); // 3s bucket para evitar colapsar demasiados
            const contentMap = new Map<string, Message>();
            const result: Message[] = [];
            for (const m of merged) {
              const key = `${conversation.id}|${m.isFromMe ? 'o' : 'i'}|${norm(m.content)}|${bucket(m.timestamp)}`;
              const existing = contentMap.get(key);
              if (!existing) {
                contentMap.set(key, m);
                result.push(m);
              } else {
                // Prefer non-temp id, richer status, and with media if available
                const isTempExisting = typeof existing.id === 'string' && existing.id.startsWith('temp_');
                const isTempNew = typeof m.id === 'string' && m.id.startsWith('temp_');
                const existingScore = statusRank(existing.status) + (existing.mediaUrl ? 1 : 0) + (isTempExisting ? 0 : 2);
                const newScore = statusRank(m.status) + (m.mediaUrl ? 1 : 0) + (isTempNew ? 0 : 2);
                if (newScore > existingScore) {
                  // Replace in both structures
                  const idx = result.indexOf(existing);
                  if (idx >= 0) result[idx] = m;
                  contentMap.set(key, m);
                }
              }
            }
            merged = result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            // Safety cap to last 500 messages to avoid unbounded growth
            if (merged.length > 500) merged = merged.slice(merged.length - 500);
            // Compute fingerprint to detect real changes
            const fingerprint = merged.map(m => `${String(m.id)}|${m.timestamp.getTime()}|${m.status || ''}`).join(',');
            if (prevFingerprintRef.current === fingerprint) {
              if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.log('[MessageView] No changes detected; skipping UI update');
              }
              // Still keep cache fresh
              if (messagesCacheRef) messagesCacheRef.current[conversation.id] = merged;
              return; // do not update state or scroll
            }
            prevFingerprintRef.current = fingerprint;
            if (messagesCacheRef) messagesCacheRef.current[conversation.id] = merged;
            setMessages(merged);
            // Restore scroll offset for readers not at bottom
            if (el && !stickToBottomRef.current) {
              // Next tick to allow layout update
              setTimeout(() => {
                const newBottom = el.scrollHeight - prevBottomDistance;
                // Ensure within bounds
                el.scrollTop = Math.max(0, newBottom - el.clientHeight);
              }, 0);
            }
            if (messagesCacheRef) {
              // messagesCacheRef is updated in setMessages above
            }
          } else {
            // Keep existing messages to avoid flicker
            if (DEBUG) console.log('[MessageView] Empty response ignored to prevent flicker');
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
      // Prevent duplicates: ignore same content within 60s window
      const now = Date.now();
      if (lastSentRef.current && lastSentRef.current.content === content && (now - lastSentRef.current.at) < 60000) {
        return;
      }
      if (sendInFlightRef.current) return;
      sendInFlightRef.current = true;

      const token = localStorage.getItem('token');
      
      // Check if this is a widget conversation or WhatsApp conversation
      const isWidgetConversation = conversation.source === 'widget';
      
      let endpoint: string;
      let payload: any;
      
      if (isWidgetConversation) {
        // For widget conversations, use the widget response endpoint
        endpoint = getApiEndpoint(`/whatsapp/widget/conversation/${conversation.id}/respond`);
        // Backend expects WidgetResponseDto with 'message' field
        const clientMessageId = `cm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        payload = { message: content, clientMessageId };
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
        lastSentRef.current = { content, at: now };
        // Add message to local state immediately for better UX
        const newMessage: Message = {
          // Mark as temporary so it can be de-duplicated when server echoes it
          id: `temp_${Date.now()}`,
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
    finally {
      sendInFlightRef.current = false;
    }
  };

  const handleCloseConversation = async () => {
    if (!confirm('¿Estás seguro de que deseas cerrar esta conversación?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = getApiEndpoint(`/whatsapp/widget/conversation/${conversation.id}/close`);
      const body = {
        sessionId: conversation.sessionId || '',
        status: 'closed'
      };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert('Conversación cerrada exitosamente');
        // Notificar a otros componentes (lista) para que refresquen y/o remuevan la conversación
        try {
          window.dispatchEvent(new CustomEvent('whatsapp:conversationClosed', { detail: { id: conversation.id } }));
        } catch {}
        // Recargar mensajes por si el backend marca estado
        loadMessages();
        // Volver atrás para salir del detalle de la conversación
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

  // Delete a message locally (UI-only)
  const handleDeleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => String(m.id) !== String(id)));
    if (messagesCacheRef) {
      const cache = messagesCacheRef.current[conversation.id] || [];
      messagesCacheRef.current[conversation.id] = cache.filter(m => String(m.id) !== String(id));
    }
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
                      <div className="relative group">
                        <div
                          className={`inline-block min-w-[120px] max-w-[70%] sm:max-w-[60%] px-4 py-2 rounded-2xl ${
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
                                  className="w-auto h-auto"
                                  style={{
                                    maxWidth: `${mediaSettings.imageMaxWidth}px`,
                                    maxHeight: `${mediaSettings.imageMaxHeight}px`,
                                    objectFit: mediaSettings.fit,
                                    borderRadius: `${mediaSettings.borderRadius}px`,
                                  }}
                                />
                              ) : message.type?.toLowerCase().includes('video') ? (
                                <video
                                  src={message.mediaUrl}
                                  controls
                                  playsInline
                                  className="h-auto"
                                  style={{
                                    width: `${mediaSettings.videoMaxWidth}px`,
                                    maxHeight: `${mediaSettings.videoMaxHeight}px`,
                                    objectFit: mediaSettings.fit,
                                    borderRadius: `${mediaSettings.borderRadius}px`,
                                  }}
                                />
                              ) : (
                                <a href={message.mediaUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">
                                  Descargar archivo
                                </a>
                              )}
                            </div>
                          ) : null}
                          {message.content && (
                            <p className="text-sm whitespace-pre-wrap break-normal">
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
                        {/* Delete button: visible on hover (desktop only) to avoid accidental taps */}
                        <button
                          onClick={() => handleDeleteMessage(String(message.id))}
                          className="hidden md:flex absolute -top-2 -right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full w-5 h-5 items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar"
                          aria-label="Eliminar mensaje"
                        >
                          ×
                        </button>
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
        <MessageInput onSendMessage={handleSendMessage} theme={theme} isSending={sendInFlightRef.current} />
      </div>
    </div>
  );
}
