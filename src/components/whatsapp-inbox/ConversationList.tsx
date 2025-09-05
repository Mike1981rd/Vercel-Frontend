/**
 * @file ConversationList.tsx
 * @max-lines 300
 * @current-lines 280
 * @architecture modular
 * @validates-rules ✅
 */

import React, { useState, useMemo } from 'react';
import { ConversationListProps } from './types/whatsapp.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onSearchConversations,
  loading = false,
  searchQuery = '',
  filter = 'all',
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Apply filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;
      case 'archived':
        filtered = filtered.filter(conv => conv.isArchived);
        break;
      default:
        filtered = filtered.filter(conv => !conv.isArchived);
        break;
    }

    // Apply search
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.contact.name?.toLowerCase().includes(query) ||
        conv.contact.phoneNumber.includes(query) ||
        conv.lastMessage?.body?.toLowerCase().includes(query)
      );
    }

    // Sort by last message time
    return filtered.sort((a, b) => 
      new Date(b.lastMessage?.timestamp || b.updatedAt).getTime() - 
      new Date(a.lastMessage?.timestamp || a.updatedAt).getTime()
    );
  }, [conversations, filter, searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchConversations(value);
  };

  const formatLastMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true,
        locale: es 
      });
    } catch {
      return '';
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.slice(0, maxLength) + '...';
  };

  const getContactName = (contact: any) => {
    return contact.name || contact.phoneNumber || 'Sin nombre';
  };

  const getFilterCount = (filterType: 'all' | 'unread' | 'archived') => {
    switch (filterType) {
      case 'unread':
        return conversations.filter(conv => conv.unreadCount > 0 && !conv.isArchived).length;
      case 'archived':
        return conversations.filter(conv => conv.isArchived).length;
      default:
        return conversations.filter(conv => !conv.isArchived).length;
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            </div>
          </div>
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          WhatsApp Inbox
        </h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex space-x-1">
          {(['all', 'unread', 'archived'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => onFilterChange?.(filterType)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === filterType
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {filterType === 'all' && 'Todas'}
              {filterType === 'unread' && 'No leídas'}
              {filterType === 'archived' && 'Archivadas'}
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded-full">
                {getFilterCount(filterType)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">
              {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                  selectedConversationId === conversation.id
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {conversation.contact.profilePictureUrl ? (
                      <img
                        src={conversation.contact.profilePictureUrl}
                        alt={getContactName(conversation.contact)}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Unread indicator */}
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-medium truncate ${
                        conversation.unreadCount > 0 
                          ? 'text-gray-900 dark:text-white font-semibold' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {getContactName(conversation.contact)}
                      </h3>
                      
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {formatLastMessageTime(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className={`text-sm truncate ${
                        conversation.unreadCount > 0
                          ? 'text-gray-700 dark:text-gray-200 font-medium'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {conversation.lastMessage.direction === 'outbound' && (
                          <span className="text-green-600 dark:text-green-400 mr-1">
                            ✓
                          </span>
                        )}
                        {truncateMessage(conversation.lastMessage.body)}
                      </p>
                    )}
                    
                    {/* Status indicators */}
                    <div className="flex items-center mt-1 space-x-2">
                      {conversation.status === 'pending' && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs rounded-full">
                          Pendiente
                        </span>
                      )}
                      
                      {conversation.assignedTo && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          Asignado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;