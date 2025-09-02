'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  X,
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  ShoppingBag,
  FileText,
  Star,
  MoreVertical,
  Ban,
  Archive
} from 'lucide-react';
import type { Conversation } from './ChatRoom';
import type { ChatTheme } from './ThemeSelector';

interface ContactDetailsProps {
  conversation: Conversation;
  onBack?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
  isDrawer?: boolean;
  theme?: ChatTheme;
}

interface ContactInfo {
  email?: string;
  location?: string;
  joinedDate?: Date;
  totalOrders?: number;
  totalSpent?: number;
  notes?: string;
  tags?: string[];
  rating?: number;
}

export default function ContactDetails({ 
  conversation, 
  onBack,
  onClose,
  isMobile = false,
  isDrawer = false 
}: ContactDetailsProps) {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'notes'>('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContactInfo();
  }, [conversation.id]);

  const loadContactInfo = async () => {
    try {
      // TODO: Load from API
      // Mock data for now
      setContactInfo({
        email: 'cliente@example.com',
        location: 'Madrid, España',
        joinedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
        totalOrders: 3,
        totalSpent: 299.97,
        notes: 'Cliente frecuente, prefiere comunicación por WhatsApp',
        tags: ['VIP', 'Frecuente'],
        rating: 4.5
      });
    } catch (error) {
      console.error('Error loading contact info:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleAction = (action: string) => {
    // TODO: Implement actions
    alert(`Acción: ${action} - Por implementar`);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isMobile && onBack && (
              <button
                onClick={onBack}
                className="mr-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Detalles del Contacto
            </h3>
          </div>
          
          {/* Actions Menu and Close Button */}
          <div className="flex items-center space-x-1">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            {(isDrawer || onClose) && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                aria-label="Cerrar panel"
                title="Cerrar (ESC)"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex-shrink-0 p-4 text-center border-b border-gray-200 dark:border-gray-700">
        {/* Avatar */}
        {conversation.avatar ? (
          <img
            src={conversation.avatar}
            alt={conversation.contactName}
            className="w-20 h-20 rounded-full mx-auto mb-3"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl font-medium text-gray-700 dark:text-gray-300">
              {getInitials(conversation.contactName)}
            </span>
          </div>
        )}
        
        {/* Name and Status */}
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {conversation.contactName}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {conversation.contactPhone}
        </p>
        
        {/* Tags */}
        {contactInfo.tags && contactInfo.tags.length > 0 && (
          <div className="flex justify-center gap-2 mt-3">
            {contactInfo.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        {contactInfo.rating && (
          <div className="flex items-center justify-center mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(contactInfo.rating!)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
              {contactInfo.rating}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'info'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Información
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'orders'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Pedidos
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'notes'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Notas
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                {contactInfo.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {contactInfo.email}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {conversation.contactPhone}
                    </p>
                  </div>
                </div>

                {contactInfo.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ubicación</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {contactInfo.location}
                      </p>
                    </div>
                  </div>
                )}

                {contactInfo.joinedDate && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Cliente desde</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(contactInfo.joinedDate)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {contactInfo.totalOrders || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pedidos totales
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      ${contactInfo.totalSpent?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total gastado
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-3">
                {contactInfo.totalOrders && contactInfo.totalOrders > 0 ? (
                  <>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Pedido #1234
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Hace 2 días
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        2 productos - $99.99
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full">
                        Entregado
                      </span>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Pedido #1233
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Hace 1 semana
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        1 producto - $49.99
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full">
                        Entregado
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No hay pedidos registrados</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div>
                <textarea
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                  rows={6}
                  placeholder="Agregar notas sobre este cliente..."
                  defaultValue={contactInfo.notes}
                />
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Guardar notas
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={() => handleAction('block')}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Ban className="h-4 w-4 mr-2" />
          Bloquear contacto
        </button>
        <button
          onClick={() => handleAction('archive')}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Archive className="h-4 w-4 mr-2" />
          Archivar conversación
        </button>
      </div>
    </div>
  );
}