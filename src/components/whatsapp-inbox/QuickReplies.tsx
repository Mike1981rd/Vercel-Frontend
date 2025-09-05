/**
 * @file QuickReplies.tsx
 * @max-lines 300
 * @current-lines 150
 * @architecture modular
 * @validates-rules ✅
 */

import React, { useState } from 'react';
import { QuickReply } from './types/whatsapp.types';

interface QuickRepliesProps {
  quickReplies: QuickReply[];
  onUseReply: (replyText: string) => void;
  onCreateReply: (reply: Omit<QuickReply, 'id' | 'companyId'>) => void;
  onDeleteReply: (replyId: string) => void;
  className?: string;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({
  quickReplies,
  onUseReply,
  onCreateReply,
  onDeleteReply,
  className = '',
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newReply, setNewReply] = useState({
    text: '',
    shortcut: '',
    category: 'general',
  });

  const categories = [
    'general',
    'saludo',
    'despedida',
    'soporte',
    'ventas',
    'informacion',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReply.text.trim()) {
      onCreateReply(newReply);
      setNewReply({ text: '', shortcut: '', category: 'general' });
      setIsCreating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      saludo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      despedida: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      soporte: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      ventas: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      informacion: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[category] || colors.general;
  };

  const groupedReplies = quickReplies.reduce((acc, reply) => {
    const category = reply.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(reply);
    return acc;
  }, {} as Record<string, QuickReply[]>);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Respuestas Rápidas
          </h3>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {isCreating ? 'Cancelar' : 'Agregar'}
          </button>
        </div>

        {/* Create Form */}
        {isCreating && (
          <form onSubmit={handleSubmit} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Texto de la respuesta..."
                value={newReply.text}
                onChange={(e) => setNewReply(prev => ({ ...prev, text: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Atajo (ej: /saludo)"
                  value={newReply.shortcut}
                  onChange={(e) => setNewReply(prev => ({ ...prev, shortcut: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
                <select
                  value={newReply.category}
                  onChange={(e) => setNewReply(prev => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="capitalize">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Crear Respuesta
              </button>
            </div>
          </form>
        )}

        {/* Quick Replies List */}
        {Object.keys(groupedReplies).length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No tienes respuestas rápidas aún
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Crea respuestas predefinidas para usar en tus conversaciones
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(groupedReplies).map(([category, replies]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize border-b border-gray-200 dark:border-gray-600 pb-1">
                  {category}
                </h4>
                <div className="space-y-1">
                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="group flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <button
                        onClick={() => onUseReply(reply.text)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {reply.text.length > 60 
                              ? reply.text.slice(0, 60) + '...' 
                              : reply.text
                            }
                          </span>
                          {reply.shortcut && (
                            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded font-mono">
                              {reply.shortcut}
                            </span>
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => onDeleteReply(reply.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Usage Tip */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            💡 <strong>Consejo:</strong> Usa atajos como /saludo o /info para encontrar respuestas rápidamente al escribir mensajes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickReplies;