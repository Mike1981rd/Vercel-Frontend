/**
 * @file MessageBubble.tsx
 * @max-lines 300
 * @current-lines 180
 * @architecture modular
 * @validates-rules ✅
 */

import React from 'react';
import { MessageBubbleProps } from './types/whatsapp.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showTimestamp = true,
  showStatus = true,
}) => {
  const isOutbound = message.direction === 'outbound';
  const isMedia = message.messageType !== 'text';
  
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true,
        locale: es 
      });
    } catch {
      return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'delivered':
        return (
          <div className="flex">
            <svg className="w-4 h-4 text-gray-400 -mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'read':
        return (
          <div className="flex">
            <svg className="w-4 h-4 text-blue-500 -mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderMediaContent = () => {
    if (!message.mediaUrl) return null;

    switch (message.messageType) {
      case 'image':
        return (
          <div className="mb-2">
            <img 
              src={message.mediaUrl} 
              alt="Imagen enviada"
              className="max-w-xs rounded-lg shadow-sm"
              onError={(e) => {
                e.currentTarget.src = '/api/placeholder/200/150';
              }}
            />
          </div>
        );
      case 'video':
        return (
          <div className="mb-2">
            <video 
              controls 
              className="max-w-xs rounded-lg shadow-sm"
              preload="metadata"
            >
              <source src={message.mediaUrl} type="video/mp4" />
              Tu navegador no soporta la reproducción de videos.
            </video>
          </div>
        );
      case 'audio':
        return (
          <div className="mb-2">
            <audio 
              controls 
              className="max-w-xs"
              preload="metadata"
            >
              <source src={message.mediaUrl} type="audio/mpeg" />
              Tu navegador no soporta la reproducción de audio.
            </audio>
          </div>
        );
      case 'document':
        return (
          <div className="mb-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg max-w-xs">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <a 
                href={message.mediaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                Descargar archivo
              </a>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[70%] ${
          isOutbound 
            ? 'bg-green-500 text-white' 
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
        } rounded-2xl px-4 py-2 shadow-sm`}
      >
        {isMedia && renderMediaContent()}
        
        {message.body && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.body}
          </p>
        )}
        
        <div className={`flex items-center justify-between mt-1 gap-2 ${
          isOutbound ? 'flex-row-reverse' : 'flex-row'
        }`}>
          {showTimestamp && (
            <span className={`text-xs ${
              isOutbound 
                ? 'text-green-100' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {formatTime(message.timestamp)}
            </span>
          )}
          
          {showStatus && isOutbound && (
            <div className="flex-shrink-0">
              {getStatusIcon(message.status)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;