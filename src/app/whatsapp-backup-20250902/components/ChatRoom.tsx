'use client';

import React, { useState, useEffect } from 'react';
import ConversationList from './ConversationList';
import MessageView from './MessageView';
import ContactDetails from './ContactDetails';
import ThemeSelector, { ChatTheme, chatThemes } from './ThemeSelector';
import { useI18n } from '@/contexts/I18nContext';
import { Settings, ArrowLeft, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getApiEndpoint } from '@/lib/api-url';

export interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline?: boolean;
  avatar?: string | null;
  source?: string;
  sessionId?: string;
  customerEmail?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  timestamp: Date;
  isFromMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'location';
  mediaUrl?: string;
}

export default function ChatRoom() {
  const { t } = useI18n();
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showMobileView, setShowMobileView] = useState<'list' | 'chat' | 'details'>('list');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ChatTheme>(chatThemes[0]);
  // Cache de mensajes por conversación para cambios instantáneos
  const messagesCacheRef = React.useRef<Record<string, Message[]>>({});

  useEffect(() => {
    checkConfiguration();
    // Load saved theme from localStorage
    const savedThemeId = localStorage.getItem('whatsapp-chat-theme');
    if (savedThemeId) {
      const theme = chatThemes.find(t => t.id === savedThemeId);
      if (theme) setCurrentTheme(theme);
    }
  }, []);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showContactDrawer) {
        setShowContactDrawer(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showContactDrawer]);

  const checkConfiguration = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiEndpoint('/whatsapp/config'), {
        headers: { 'Authorization': `Bearer ${token || ''}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        // Check if configuration exists and has the required fields, not just if it's active
        const hasConfig = data?.data && 
          (data.data.greenApiInstanceId || data.data.GreenApiInstanceId) && 
          (data.data.greenApiToken || data.data.GreenApiToken);
        setIsConfigured(!!hasConfig);
        
        // Skip fetching account info avatar in dev (endpoint not implemented yet)
      }
    } catch (error) {
      console.error('Error checking configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed fetchUserAvatar until /whatsapp/account/info exists on backend

  const handleConversationSelect = (conversation: Conversation) => {
    // Debug in development: inspect selected conversation and avatar
    if (process.env.NODE_ENV !== 'production') {
      try {
        // @ts-ignore
        (window as any).__lastSelectedConversation = conversation;
        console.log('[ChatRoom] Selected conversation:', conversation);
      } catch {}
    }
    setSelectedConversation(conversation);
    // On mobile, switch to chat view when selecting a conversation
    if (window.innerWidth < 768) {
      setShowMobileView('chat');
    }
  };

  const handleBackToList = () => {
    setShowMobileView('list');
    setSelectedConversation(null);
  };

  const handleShowDetails = () => {
    setShowMobileView('details');
  };

  const handleBackFromDetails = () => {
    setShowMobileView('chat');
  };

  const handleThemeChange = (theme: ChatTheme) => {
    setCurrentTheme(theme);
    localStorage.setItem('whatsapp-chat-theme', theme.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center max-w-md">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Configuración requerida
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Debes configurar Green API antes de poder usar el chat de WhatsApp.
          </p>
          <button
            onClick={() => router.push('/whatsapp/config')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ir a Configuración
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${currentTheme.colors.background}`}>
      {/* Minimal Header with back arrow and settings button */}
      <div className={`flex-shrink-0 flex items-center justify-between px-3 py-2 ${currentTheme.colors.headerBg} ${currentTheme.colors.border} border-b`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/dashboard')}
            className={`p-1.5 ${currentTheme.colors.hover} rounded-lg transition-colors`}
            aria-label="Salir del chat"
            title="Volver al Dashboard"
          >
            <ArrowLeft className={`h-5 w-5 ${currentTheme.colors.headerText}`} />
          </button>
          <span className={`text-sm font-medium ${currentTheme.colors.headerText}`}>WhatsApp Chat</span>
        </div>

        {/* Settings, Theme selector and user avatar */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/whatsapp/config')}
            className={`p-1.5 ${currentTheme.colors.hover} rounded-lg transition-colors`}
            aria-label="Configuración"
            title="Configuración de WhatsApp"
          >
            <Wrench className={`h-4 w-4 ${currentTheme.colors.headerText}`} />
          </button>
          <ThemeSelector 
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
          />
          {currentUserAvatar ? (
            <img 
              src={currentUserAvatar} 
              alt="Mi avatar" 
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
          )}
        </div>
      </div>

      {/* Desktop Layout - Now 2 columns with optional drawer */}
      <div className="hidden md:grid md:grid-cols-[350px_1fr] flex-1 min-h-0 relative">
        {/* Conversation List */}
        <div className={`border-r ${currentTheme.colors.border} ${currentTheme.colors.inputBg} min-h-0 flex flex-col`}>
          <ConversationList
            onSelectConversation={handleConversationSelect}
            selectedConversation={selectedConversation}
            theme={currentTheme}
          />
        </div>

        {/* Message View - Full width when drawer is closed */}
        <div className={`flex flex-col ${currentTheme.colors.chatBackground} min-h-0 relative`}>
          {selectedConversation ? (
            <MessageView
              conversation={selectedConversation}
              onShowDetails={() => setShowContactDrawer(true)}
              onBack={() => {
                setSelectedConversation(null);
                setShowContactDrawer(false);
              }}
              onContactClick={() => setShowContactDrawer(true)}
              theme={currentTheme}
              messagesCacheRef={messagesCacheRef}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className={`mt-2 text-sm ${currentTheme.colors.messageText} opacity-60`}>
                  Selecciona una conversación para empezar
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Contact Details Drawer - Slides in from right */}
        {selectedConversation && (
          <>
            {/* Backdrop for tablet size */}
            {showContactDrawer && (
              <div 
                className="md:block lg:hidden fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
                onClick={() => setShowContactDrawer(false)}
              />
            )}
            
            {/* Drawer */}
            <div className={`
              absolute right-0 top-0 h-full z-50
              w-[320px] lg:w-[360px]
              ${currentTheme.colors.inputBg}
              shadow-2xl
              transform transition-transform duration-300 ease-out
              ${showContactDrawer ? 'translate-x-0' : 'translate-x-full'}
            `}>
              <ContactDetails 
                conversation={selectedConversation}
                onClose={() => setShowContactDrawer(false)}
                isDrawer={true}
                theme={currentTheme}
              />
            </div>
          </>
        )}
      </div>

      {/* Mobile/Tablet Layout - Show one view at a time */}
      <div className="md:hidden flex-1 relative">
        {showMobileView === 'list' && (
          <div className={`h-full ${currentTheme.colors.inputBg}`}>
            <ConversationList
              onSelectConversation={handleConversationSelect}
              selectedConversation={selectedConversation}
              theme={currentTheme}
            />
          </div>
        )}

        {showMobileView === 'chat' && selectedConversation && (
          <div className={`h-full ${currentTheme.colors.chatBackground} relative`}>
            <MessageView
              conversation={selectedConversation}
              onShowDetails={() => setShowContactDrawer(true)}
              onContactClick={() => setShowContactDrawer(true)}
              onBack={handleBackToList}
              isMobile={true}
              theme={currentTheme}
            />
            
            {/* Mobile Bottom Sheet for Contact Details */}
            {showContactDrawer && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
                  onClick={() => setShowContactDrawer(false)}
                />
                
                {/* Bottom Sheet */}
                <div className={`
                  fixed bottom-0 left-0 right-0 z-50
                  h-[85vh] max-h-[85vh]
                  ${currentTheme.colors.inputBg}
                  rounded-t-2xl shadow-2xl
                  transform transition-transform duration-300 ease-out
                  ${showContactDrawer ? 'translate-y-0' : 'translate-y-full'}
                `}>
                  {/* Drag Handle */}
                  <div className="w-full p-2 flex justify-center">
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  </div>
                  <ContactDetails 
                    conversation={selectedConversation}
                    onClose={() => setShowContactDrawer(false)}
                    isMobile={true}
                    isDrawer={true}
                    theme={currentTheme}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Remove old details view since we're using bottom sheet now */}
      </div>
    </div>
  );
}
