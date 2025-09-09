/**
 * @file ChatView.tsx
 * @max-lines 300
 * @current-lines 250
 * @architecture modular
 * @validates-rules ✅
 */

import React, { useEffect, useRef } from 'react';
import { ChatViewProps } from './types/whatsapp.types';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useWhatsAppQuickReplies } from './hooks/useWhatsAppStore';

const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  messages,
  onSendMessage,
  onMarkAsRead,
  loading = false,
  sending = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const quickReplies = useWhatsAppQuickReplies();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark unread messages as read when conversation is selected
  useEffect(() => {
    if (conversation && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => msg.direction === 'inbound' && msg.status !== 'read'
      );
      
      unreadMessages.forEach(msg => {
        if (onMarkAsRead) {
          onMarkAsRead(msg.id);
        }
      });
    }
  }, [conversation, messages, onMarkAsRead]);

  const getContactName = (contact: any) => {
    return contact.name || contact.phoneNumber || 'Sin nombre';
  };

  const getContactStatus = () => {
    if (!conversation) return '';
    
    // Here you could implement online status logic
    // For now, just show last seen
    if (conversation.contact.lastMessageAt) {
      const lastSeen = new Date(conversation.contact.lastMessageAt);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'En línea';
      if (diffInMinutes < 60) return `Última vez hace ${diffInMinutes} min`;
      if (diffInMinutes < 1440) return `Última vez hace ${Math.floor(diffInMinutes / 60)} h`;
      return `Última vez hace ${Math.floor(diffInMinutes / 1440)} días`;
    }
    
    return 'Desconectado';
  };

  // Empty state when no conversation is selected
  if (!conversation) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Selecciona una conversación
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Elige una conversación del panel izquierdo para comenzar a chatear
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative">
              {conversation.contact.profilePictureUrl ? (
                <img
                  src={conversation.contact.profilePictureUrl}
                  alt={getContactName(conversation.contact)}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getContactName(conversation.contact)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getContactStatus()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Call Button */}
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>

            {/* Archive Button */}
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={conversation.isArchived ? 'Desarchivar' : 'Archivar'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
              </svg>
            </button>

            {/* More Options */}
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conversation Status */}
        {(conversation.status === 'pending' || conversation.assignedTo) && (
          <div className="mt-3 flex items-center space-x-2">
            {conversation.status === 'pending' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Conversación pendiente
              </span>
            )}
            
            {conversation.assignedTo && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Asignado a {conversation.assignedTo}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="px-6 py-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">No hay mensajes en esta conversación</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Escribe un mensaje para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showTimestamp={true}
                  showStatus={message.direction === 'outbound'}
                />
              ))}
              
              {/* Sending indicator */}
              {sending && (
                <div className="flex justify-end mb-4">
                  <div className="bg-green-500 text-white rounded-2xl px-4 py-2 max-w-[70%]">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-200 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-200 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-green-200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-green-100">Enviando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        disabled={sending}
        placeholder={`Mensaje para ${getContactName(conversation.contact)}...`}
        quickReplies={quickReplies}
      />
    </div>
  );
};

export default ChatView;