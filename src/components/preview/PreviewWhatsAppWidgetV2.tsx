'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppIcon } from '@/components/whatsapp/WhatsAppWidgetHelpers';
import { getApiEndpoint } from '@/lib/api-url';

interface WhatsAppWidgetConfig {
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  welcomeMessage: string;
  placeholderText: string;
  buttonSize: 'small' | 'medium' | 'large';
  borderRadius: number;
  showOnMobile: boolean;
  showOnDesktop: boolean;
  delaySeconds: number;
  autoOpenSeconds: number;
  isEnabled: boolean;
  requirementType?: 'none' | 'name' | 'email' | 'both';
  requirementTitle?: string;
  requirementButtonText?: string;
}

interface Message {
  id: string;
  body: string;
  isFromMe: boolean;
  timestamp: Date;
  status?: string;
  agentName?: string;
}

interface PreviewWhatsAppWidgetProps {
  config?: WhatsAppWidgetConfig | null | string;
  theme?: any;
  deviceView?: 'desktop' | 'mobile';
  isEditor?: boolean;
}

const defaultConfig: WhatsAppWidgetConfig = {
  primaryColor: '#22c55e',
  position: 'bottom-right',
  welcomeMessage: '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
  placeholderText: 'Escribe un mensaje...',
  buttonSize: 'medium',
  borderRadius: 50,
  showOnMobile: true,
  showOnDesktop: true,
  delaySeconds: 3,
  autoOpenSeconds: 0,
  isEnabled: true,
  requirementType: 'none',
  requirementTitle: 'Para continuar, por favor ingresa tu información:',
  requirementButtonText: 'Iniciar Chat'
};

const buttonSizes = {
  small: { width: 48, height: 48, icon: 20 },
  medium: { width: 60, height: 60, icon: 24 },
  large: { width: 72, height: 72, icon: 28 }
};

export default function PreviewWhatsAppWidgetV2({ 
  config, 
  theme, 
  deviceView,
  isEditor = false 
}: PreviewWhatsAppWidgetProps) {
  
  // Parse config
  const widgetConfig: WhatsAppWidgetConfig = React.useMemo(() => {
    if (!config) return defaultConfig;
    if (typeof config === 'string') {
      try {
        return JSON.parse(config);
      } catch {
        return defaultConfig;
      }
    }
    return config;
  }, [config]);

  // Mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  // State
  const [showChat, setShowChat] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showChatContent, setShowChatContent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formErrors, setFormErrors] = useState({ name: '', email: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => {
    try {
      const companyId = (typeof window !== 'undefined' && localStorage.getItem('companyId')) || 'default';
      const key = `wb_widget_session_v1_${companyId}`;
      const existing = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      if (existing && existing.startsWith('session_')) return existing;
      const sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      if (typeof window !== 'undefined') localStorage.setItem(key, sid);
      return sid;
    } catch {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  });
  const [lastPollTime, setLastPollTime] = useState<Date>(new Date());
  const lastPollRef = useRef<Date>(new Date());
  const seenServerIdsRef = useRef<Set<string>>(new Set());
  const lastServerTsRef = useRef<number>(0);
  const lastSentRef = useRef<{ body: string; at: number } | null>(null);
  const [conversationClosed, setConversationClosed] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  // Mobile resize handler
  useEffect(() => {
    if (deviceView !== undefined) {
      setIsMobile(deviceView === 'mobile');
      return;
    }
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [deviceView]);

  // Visibility delay
  useEffect(() => {
    if (!widgetConfig.isEnabled) return;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, widgetConfig.delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [widgetConfig.delaySeconds, widgetConfig.isEnabled]);

  // Auto-open
  useEffect(() => {
    if (!isVisible || widgetConfig.autoOpenSeconds <= 0) return;
    
    const timer = setTimeout(() => {
      setShowChat(true);
    }, widgetConfig.autoOpenSeconds * 1000);

    return () => clearTimeout(timer);
  }, [isVisible, widgetConfig.autoOpenSeconds]);

  // Welcome message
  useEffect(() => {
    if (showChatContent && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        body: widgetConfig.welcomeMessage,
        isFromMe: false,
        timestamp: new Date(),
        agentName: 'Sistema'
      }]);
    }
  }, [showChatContent, widgetConfig.welcomeMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!showChat || !showChatContent || conversationClosed) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      return;
    }

    const pollMessages = async () => {
      try {
        // Always take the latest poll time from ref to avoid stale closures
        const currentPollTime = lastPollRef.current;
        // Build since parameter from last server timestamp with small slack to avoid missing edge cases
        // Use a wider slack window (30s) to avoid missing messages with older timestamps
        const baseMs = lastServerTsRef.current || currentPollTime.getTime();
        const sinceMs = Math.max(0, baseMs - 30000);
        const sinceIso = new Date(sinceMs).toISOString();
        const res = await fetch(
          getApiEndpoint(`/whatsapp/widget/session/${sessionId}/messages?since=${sinceIso}`),
          { method: 'GET' }
        );
        
        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            const newMessages = data.data.map((msg: any) => ({
              id: String(msg.id),
              body: msg.body,
              isFromMe: msg.isFromMe,
              timestamp: new Date(msg.timestamp),
              status: msg.status,
              agentName: msg.agentName
            }));
            
            // Debug: Log messages to see what's coming from server
            console.log('[Widget] New messages from server:', newMessages);
            
            // Unión por ID + reemplazo de temporales
            setMessages(prev => {
              const byId = new Map<string, Message>();
              for (const m of prev) byId.set(String(m.id), m);
              // Reemplazar temporales por la versión de servidor (mismo contenido y dirección)
              for (const srv of newMessages) {
                for (const [id, m] of Array.from(byId.entries())) {
                  if (String(id).startsWith('temp_') && m.isFromMe && srv.isFromMe) {
                    if ((srv.body || '').trim() === (m.body || '').trim()) {
                      byId.delete(id);
                      byId.set(String(srv.id), srv);
                    }
                  }
                }
              }
              // Agregar cualquier mensaje del servidor que no exista aún
              for (const srv of newMessages) {
                const idStr = String(srv.id);
                if (!byId.has(idStr)) byId.set(idStr, srv);
                seenServerIdsRef.current.add(idStr);
              }
              return Array.from(byId.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            });

            // Avanzar cursor de polling al último timestamp de servidor visto
            const maxServerTs = Math.max(
              lastServerTsRef.current,
              ...newMessages.map(nm => nm.timestamp.getTime())
            );
            if (isFinite(maxServerTs) && maxServerTs > lastServerTsRef.current) {
              lastServerTsRef.current = maxServerTs;
              const last = new Date(maxServerTs);
              setLastPollTime(last);
              lastPollRef.current = last;
            }
            
            // Check if conversation was closed
            const closingMessage = newMessages.find((msg: any) => 
              msg.status === 'closing' || msg.body.includes('conversación cerrada')
            );
            if (closingMessage) {
              setConversationClosed(true);
            }
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    // Clear any existing interval before setting a new one
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Poll immediately
    pollMessages();
    
    // Then poll every 3 seconds
    pollIntervalRef.current = setInterval(pollMessages, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = undefined;
      }
    };
  }, [showChat, showChatContent, sessionId, conversationClosed]); // Removed lastPollTime from dependencies

  // Validate form
  const validateForm = () => {
    const errors = { name: '', email: '' };
    let isValid = true;

    if ((widgetConfig.requirementType === 'name' || widgetConfig.requirementType === 'both') && !formData.name) {
      errors.name = 'El nombre es requerido';
      isValid = false;
    }

    if ((widgetConfig.requirementType === 'email' || widgetConfig.requirementType === 'both') && !formData.email) {
      errors.email = 'El correo es requerido';
      isValid = false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Correo inválido';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowChatContent(true);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || conversationClosed) return;
    // Evitar doble envío del mismo texto en 60s
    const now = Date.now();
    if (lastSentRef.current && lastSentRef.current.body === inputMessage.trim() && (now - lastSentRef.current.at) < 60000) {
      return;
    }

    const messageToSend = inputMessage.trim();
    setInputMessage('');
    
    // Add message to UI inmediatamente con id temporal
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      body: messageToSend,
      isFromMe: true,
      timestamp: new Date(),
      status: 'sending'
    };
    
    console.log('[Widget] Adding local message:', tempMessage);
    setMessages(prev => [...prev, tempMessage]);
    setIsTyping(true);
    // Pre-marcar temp id como visto para que si el servidor ecoa pronto, no se agregue doble
    seenServerIdsRef.current.add(tempMessage.id);

    try {
      const payload = {
        message: messageToSend,
        customerName: formData.name || undefined,
        customerEmail: formData.email || undefined,
        sessionId,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        clientMessageId: tempMessage.id
      };

      const res = await fetch(getApiEndpoint('/whatsapp/widget/message'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        lastSentRef.current = { body: messageToSend, at: now };
        // Update message status
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, status: 'sent' } 
              : msg
          )
        );
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Update message status to failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'failed' } 
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Handle close chat
  const handleCloseChat = () => {
    setShowChat(false);
    setShowChatContent(false);
  };

  // Don't render if not enabled or not visible for device
  if (!widgetConfig.isEnabled || !isVisible) return null;
  if (isMobile && !widgetConfig.showOnMobile) return null;
  if (!isMobile && !widgetConfig.showOnDesktop) return null;

  const buttonSize = buttonSizes[widgetConfig.buttonSize];
  const buttonPosition = widgetConfig.position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';
  const chatPosition = widgetConfig.position === 'bottom-right'
    ? 'bottom-20 right-0'
    : 'bottom-20 left-0';
  const chatWidth = isMobile ? 'w-screen h-screen fixed inset-0' : 'w-96 h-[600px]';

  return (
    <div className={`fixed ${buttonPosition} z-50`}>
      {/* WhatsApp Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
        style={{
          backgroundColor: widgetConfig.primaryColor,
          width: `${buttonSize.width}px`,
          height: `${buttonSize.height}px`,
          borderRadius: `${widgetConfig.borderRadius}%`
        }}
      >
        <WhatsAppIcon size={buttonSize.icon} />
      </button>

      {/* Chat Popup */}
      {showChat && (
        <div
          className={`${isMobile ? '' : 'absolute'} ${chatPosition} ${chatWidth} bg-white rounded-lg shadow-xl z-50 flex flex-col`}
          style={{ borderTop: `4px solid ${widgetConfig.primaryColor}` }}
        >
          {/* Chat Header */}
          <div
            className="p-4 text-white flex justify-between items-center flex-shrink-0"
            style={{ backgroundColor: widgetConfig.primaryColor }}
          >
            <div className="flex items-center gap-2">
              <WhatsAppIcon size={20} />
              <h3 className="font-semibold">WhatsApp Chat</h3>
              {conversationClosed && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded">Cerrado</span>
              )}
            </div>
            <button
              onClick={handleCloseChat}
              className="text-white hover:opacity-80"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Chat Body */}
          {widgetConfig.requirementType !== 'none' && !showChatContent ? (
            /* Requirement Form */
            <form onSubmit={handleFormSubmit} className="p-4 flex-1">
              <h4 className="text-sm font-medium text-gray-700 mb-4">
                {widgetConfig.requirementTitle}
              </h4>
              
              {(widgetConfig.requirementType === 'name' || widgetConfig.requirementType === 'both') && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>
              )}
              
              {(widgetConfig.requirementType === 'email' || widgetConfig.requirementType === 'both') && (
                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Tu correo electrónico"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: widgetConfig.primaryColor }}
              >
                {widgetConfig.requirementButtonText}
              </button>
            </form>
          ) : (
            /* Chat Content */
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.isFromMe
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      style={message.isFromMe ? { backgroundColor: widgetConfig.primaryColor } : {}}
                    >
                      {message.agentName && !message.isFromMe && (
                        <div className="text-xs opacity-70 mb-1">{message.agentName}</div>
                      )}
                      <div className="text-sm">{message.body}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString('es', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {message.status === 'failed' && ' ❌'}
                        {message.status === 'sending' && ' ⏳'}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {conversationClosed ? (
                <div className="p-4 bg-gray-50 text-center text-sm text-gray-500">
                  Esta conversación ha sido cerrada
                </div>
              ) : (
                <div className="p-4 border-t bg-white flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={widgetConfig.placeholderText}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
                      disabled={conversationClosed}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || conversationClosed}
                      className="px-4 py-2 rounded-lg text-white disabled:opacity-50"
                      style={{ backgroundColor: widgetConfig.primaryColor }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
