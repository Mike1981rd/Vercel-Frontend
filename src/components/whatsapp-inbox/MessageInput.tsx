/**
 * @file MessageInput.tsx
 * @max-lines 300
 * @current-lines 250
 * @architecture modular
 * @validates-rules ✅
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageInputProps } from './types/whatsapp.types';

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Escribe un mensaje...',
  quickReplies = [],
}) => {
  const [message, setMessage] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const quickRepliesRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setShowQuickReplies(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (replyText: string) => {
    setMessage(replyText);
    setShowQuickReplies(false);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Close quick replies when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickRepliesRef.current && !quickRepliesRef.current.contains(event.target as Node)) {
        setShowQuickReplies(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      {/* Quick Replies Dropdown */}
      {showQuickReplies && quickReplies.length > 0 && (
        <div 
          ref={quickRepliesRef}
          className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-48 overflow-y-auto z-10"
        >
          <div className="p-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
              RESPUESTAS RÁPIDAS
            </h4>
            <div className="space-y-1">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply.text)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-white">{reply.text}</span>
                    {reply.shortcut && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {reply.shortcut}
                      </span>
                    )}
                  </div>
                  {reply.category && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {reply.category}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-end space-x-3">
        {/* Quick Replies Button */}
        {quickReplies.length > 0 && (
          <button
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            disabled={disabled}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
              showQuickReplies
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Text Input */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={`w-full px-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ maxHeight: '120px' }}
            />
            
            {/* Character Counter (opcional) */}
            {message.length > 800 && (
              <div className="absolute -bottom-6 right-2 text-xs text-gray-500 dark:text-gray-400">
                {message.length}/1000
              </div>
            )}
          </div>
        </div>

        {/* Emoji Button (opcional) */}
        <button
          type="button"
          disabled={disabled}
          className={`flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
            message.trim() && !disabled
              ? 'bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>

      {/* Helper Text */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Presiona Enter para enviar, Shift + Enter para nueva línea
        {quickReplies.length > 0 && ' • Usa respuestas rápidas para mayor eficiencia'}
      </div>
    </div>
  );
};

export default MessageInput;