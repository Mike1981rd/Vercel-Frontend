'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic,
  X,
  Image,
  FileText,
  MapPin
} from 'lucide-react';
import type { ChatTheme } from './ThemeSelector';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  theme?: ChatTheme;
}

export default function MessageInput({ onSendMessage, theme }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleAttachment = (type: string) => {
    setShowAttachMenu(false);
    // TODO: Implement file upload
    alert(`Adjuntar ${type} - Por implementar`);
  };

  const handleEmoji = () => {
    // TODO: Implement emoji picker
    // For now, just add a sample emoji
    setMessage(prev => prev + ' 😊');
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // TODO: Implement voice recording
      alert('Grabación de voz - Por implementar');
    }
  };

  // Get theme colors or use defaults
  const themeColors = theme?.colors || {
    inputBg: 'bg-white',
    inputText: 'text-gray-900',
    border: 'border-gray-300',
    hover: 'hover:bg-gray-100'
  };

  return (
    <div className={`p-4 ${themeColors.inputBg}`}>
      {/* Attachment Menu */}
      {showAttachMenu && (
        <div className={`absolute bottom-20 left-4 ${themeColors.inputBg} rounded-lg shadow-lg border ${themeColors.border} p-2 z-10`}>
          <button
            onClick={() => handleAttachment('image')}
            className={`flex items-center w-full px-3 py-2 ${themeColors.hover} rounded-lg`}
          >
            <Image className="h-5 w-5 text-blue-500 mr-3" />
            <span className={`text-sm ${themeColors.inputText}`}>Imagen</span>
          </button>
          <button
            onClick={() => handleAttachment('document')}
            className={`flex items-center w-full px-3 py-2 ${themeColors.hover} rounded-lg`}
          >
            <FileText className="h-5 w-5 text-purple-500 mr-3" />
            <span className={`text-sm ${themeColors.inputText}`}>Documento</span>
          </button>
          <button
            onClick={() => handleAttachment('location')}
            className={`flex items-center w-full px-3 py-2 ${themeColors.hover} rounded-lg`}
          >
            <MapPin className="h-5 w-5 text-red-500 mr-3" />
            <span className={`text-sm ${themeColors.inputText}`}>Ubicación</span>
          </button>
        </div>
      )}

      <div className="flex items-end space-x-2">
        {/* Attachment Button */}
        <button
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className={`p-2 ${themeColors.hover} rounded-lg transition-colors`}
        >
          {showAttachMenu ? (
            <X className={`h-5 w-5 ${themeColors.inputText} opacity-60`} />
          ) : (
            <Paperclip className={`h-5 w-5 ${themeColors.inputText} opacity-60`} />
          )}
        </button>

        {/* Emoji Button */}
        <button
          onClick={handleEmoji}
          className={`p-2 ${themeColors.hover} rounded-lg transition-colors`}
        >
          <Smile className={`h-5 w-5 ${themeColors.inputText} opacity-60`} />
        </button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            className={`w-full px-4 py-2 resize-none border ${themeColors.border} rounded-lg bg-black/10 ${themeColors.inputText} placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Send/Voice Button */}
        {message.trim() ? (
          <button
            onClick={handleSend}
            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={handleVoiceRecord}
            className={`p-2 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : themeColors.hover
            }`}
          >
            <Mic className={`h-5 w-5 ${
              isRecording ? 'text-white' : `${themeColors.inputText} opacity-60`
            }`} />
          </button>
        )}
      </div>

      {/* Character Count */}
      {message.length > 0 && (
        <div className="mt-1 text-right">
          <span className={`text-xs ${themeColors.inputText} opacity-50`}>
            {message.length} / 4096
          </span>
        </div>
      )}
    </div>
  );
}