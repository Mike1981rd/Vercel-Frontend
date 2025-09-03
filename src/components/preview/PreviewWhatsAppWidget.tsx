'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppIcon } from '@/components/whatsapp/WhatsAppWidgetHelpers';

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

export default function PreviewWhatsAppWidget({ 
  config, 
  theme, 
  deviceView,
  isEditor = false 
}: PreviewWhatsAppWidgetProps) {
  
  // Parse config if it's a string
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

  // Canonical mobile detection pattern (MANDATORY)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  const [showChat, setShowChat] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showChatContent, setShowChatContent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formErrors, setFormErrors] = useState({ name: '', email: '' });

  // ALL hooks MUST come before conditional returns
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

  // Handle visibility delay
  useEffect(() => {
    if (!widgetConfig.isEnabled) return;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, widgetConfig.delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [widgetConfig.isEnabled, widgetConfig.delaySeconds]);

  // Handle auto-open
  useEffect(() => {
    if (!widgetConfig.isEnabled || !isVisible || widgetConfig.autoOpenSeconds === 0) return;
    
    const timer = setTimeout(() => {
      setShowChat(true);
    }, widgetConfig.autoOpenSeconds * 1000);

    return () => clearTimeout(timer);
  }, [widgetConfig.isEnabled, isVisible, widgetConfig.autoOpenSeconds]);

  // Conditional returns AFTER all hooks
  if (!widgetConfig.isEnabled) return null;
  if (isMobile && !widgetConfig.showOnMobile) return null;
  if (!isMobile && !widgetConfig.showOnDesktop) return null;
  if (!isVisible) return null;

  // Mobile-specific adjustments
  const buttonSize = isMobile && widgetConfig.buttonSize === 'large' 
    ? buttonSizes.medium // Use medium size on mobile for large buttons
    : buttonSizes[widgetConfig.buttonSize];

  // Positioning strategy - always fixed for floating effect
  const positioningClass = 'fixed';
  
  // Position classes with proper spacing from edges
  // When in editor and positioned left, add extra margin to avoid sidebar (320px wide)
  const positionClasses = isMobile
    ? widgetConfig.position === 'bottom-right' 
      ? 'bottom-4 right-4'
      : 'bottom-4 left-4'
    : widgetConfig.position === 'bottom-right'
      ? 'bottom-6 right-6'
      : isEditor 
        ? 'bottom-6' // For left position in editor, use style prop for exact positioning
        : 'bottom-6 left-6';

  // Chat popup positioning
  const chatPosition = isMobile
    ? 'fixed inset-x-4 bottom-20'
    : `absolute ${widgetConfig.position === 'bottom-right' ? 'right-0' : 'left-0'} bottom-20`;

  const chatWidth = isMobile ? 'w-[calc(100%-2rem)]' : 'w-80';
  
  // Style for left position in editor to avoid sidebar
  const buttonStyle = isEditor && widgetConfig.position === 'bottom-left' && !isMobile
    ? { left: '340px' } // 320px sidebar + 20px spacing
    : {};

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasErrors = false;
    const errors = { name: '', email: '' };

    if (widgetConfig.requirementType === 'name' || widgetConfig.requirementType === 'both') {
      if (!formData.name.trim()) {
        errors.name = 'El nombre es requerido';
        hasErrors = true;
      }
    }

    if (widgetConfig.requirementType === 'email' || widgetConfig.requirementType === 'both') {
      if (!formData.email.trim()) {
        errors.email = 'El correo es requerido';
        hasErrors = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Correo inválido';
        hasErrors = true;
      }
    }

    setFormErrors(errors);
    if (!hasErrors) {
      setShowChatContent(true);
    }
  };

  // Reset chat when closing
  const handleCloseChat = () => {
    setShowChat(false);
    setShowChatContent(false);
    setFormData({ name: '', email: '' });
    setFormErrors({ name: '', email: '' });
  };
  
  return (
    <>
      {/* WhatsApp Button */}
      <div 
        className={`${positioningClass} z-50 ${positionClasses}`}
        style={buttonStyle}
      >
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
            className={`${chatPosition} ${chatWidth} bg-white rounded-lg shadow-xl z-50`}
            style={{ borderTop: `4px solid ${widgetConfig.primaryColor}` }}
          >
            {/* Chat Header */}
            <div
              className="p-4 text-white flex justify-between items-center"
              style={{ backgroundColor: widgetConfig.primaryColor }}
            >
              <h3 className="font-semibold">WhatsApp Chat</h3>
              <button
                onClick={handleCloseChat}
                className="text-white hover:opacity-80"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Chat Body */}
            {widgetConfig.requirementType !== 'none' && !showChatContent ? (
              /* Requirement Form */
              <form onSubmit={handleFormSubmit} className="p-4">
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
              <>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <div className="bg-gray-100 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">{widgetConfig.welcomeMessage}</p>
                  </div>
                  {showChatContent && formData.name && (
                    <div className="text-xs text-gray-500 mb-2">
                      Chateando con: {formData.name} {formData.email && `(${formData.email})`}
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={widgetConfig.placeholderText}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      disabled={true}
                    />
                    <button
                      className="px-4 py-2 rounded-lg text-white"
                      style={{ backgroundColor: widgetConfig.primaryColor }}
                      disabled={true}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}