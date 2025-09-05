/**
 * @file PreviewFooter.tsx
 * @max-lines 300
 * Preview component for Footer - Single source of truth
 * Used in both EditorPreview and PreviewPage
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api-url';
import { FooterConfig, FooterBlockType } from '@/components/editor/modules/Footer/FooterTypes';
import { 
  Instagram, Facebook, Twitter, Youtube, 
  Linkedin, Mail, ArrowRight, Globe, DollarSign,
  CreditCard, Package, Music2, Image as ImageIcon, Ghost, ChevronDown
} from 'lucide-react';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { VisaIcon, MastercardIcon, AmexIcon, DiscoverIcon, ApplePayIcon, GooglePayIcon, AmazonPayIcon, DinersIcon } from '@/components/icons/PaymentIcons';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getCurrencyDisplay } from '@/lib/utils/currency';

interface PreviewFooterProps {
  config: FooterConfig;
  theme: any;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
}

export default function PreviewFooter({ 
  config, 
  theme, 
  deviceView,
  isEditor = false 
}: PreviewFooterProps) {
  const { config: themeConfig } = useThemeConfigStore();
  const { selectedCurrency, availableCurrencies, changeCurrency } = useCurrency();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(config?.languageSelector?.defaultLanguage || 'Español');
  
  // Mobile detection with deviceView support (same as AnnouncementBar)
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize with deviceView if provided, otherwise check window width
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });
  
  const languageRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  
  // Detect mobile viewport or use deviceView prop
  useEffect(() => {
    const checkMobile = () => {
      if (deviceView !== undefined) {
        console.log('[PreviewFooter] Setting mobile from deviceView:', deviceView === 'mobile');
        setIsMobile(deviceView === 'mobile');
        return;
      }
      const isMobileView = window.innerWidth < 768;
      console.log('[PreviewFooter] Setting mobile from viewport:', isMobileView);
      setIsMobile(isMobileView);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [deviceView]);
  
  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setShowCurrencyDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // En modo editor, siempre mostrar
  // En producción, verificar enabled
  if (!isEditor && !config?.enabled) return null;

  const colorScheme = theme?.colorSchemes?.schemes?.[parseInt(config?.colorScheme || '1') - 1];
  
  // Calcular columnas según el dispositivo
  const columnsPerRow = isMobile ? 1 : (config?.desktopColumnCount || 3);
  
  // Use real blocks from configuration
  const blocks = config?.blocks || [];
  
  // Debug: log blocks to verify they're being received in correct order
  console.log('[PreviewFooter] Received blocks order:', blocks.map((b, i) => `${i+1}. ${b.title || b.type} (${b.id})`).join(', '));
  
  // Create typography styles for headings (block titles)
  const headingTypographyStyles = themeConfig?.typography?.headings ? {
    fontFamily: `'${themeConfig.typography.headings.fontFamily}', sans-serif`,
    fontWeight: themeConfig.typography.headings.fontWeight || '600',
    textTransform: themeConfig.typography.headings.useUppercase ? 'uppercase' as const : 'none' as const,
    fontSize: themeConfig.typography.headings.fontSize ? 
      (themeConfig.typography.headings.fontSize <= 100 ? 
        `${themeConfig.typography.headings.fontSize}%` : 
        `${themeConfig.typography.headings.fontSize}px`) : '100%',
    letterSpacing: `${themeConfig.typography.headings.letterSpacing || 0}px`
  } : {};
  
  // Create typography styles for body text
  const bodyTypographyStyles = themeConfig?.typography?.body ? {
    fontFamily: `'${themeConfig.typography.body.fontFamily}', sans-serif`,
    fontWeight: themeConfig.typography.body.fontWeight || '400',
    textTransform: themeConfig.typography.body.useUppercase ? 'uppercase' as const : 'none' as const,
    fontSize: themeConfig.typography.body.fontSize ? 
      (themeConfig.typography.body.fontSize <= 100 ? 
        `${themeConfig.typography.body.fontSize}%` : 
        `${themeConfig.typography.body.fontSize}px`) : '100%',
    letterSpacing: `${themeConfig.typography.body.letterSpacing || 0}px`
  } : {};

  const renderBlock = (block: any) => {
    switch (block.type) {
      case FooterBlockType.TEXT:
        return (
          <div>
            {block.settings?.heading && (
              <h3 className="font-semibold mb-2 text-sm" style={{ 
                color: colorScheme?.text || '#ffffff',
                ...headingTypographyStyles 
              }}>
                {block.settings.heading}
              </h3>
            )}
            {block.settings?.body && (
              <p className="text-sm whitespace-pre-line opacity-75" style={{ 
                color: colorScheme?.text || '#cccccc',
                ...bodyTypographyStyles
              }}>
                {block.settings.body}
              </p>
            )}
          </div>
        );

      case FooterBlockType.MENU:
        // Import and use FooterMenuBlock component for proper menu rendering
        const FooterMenuBlock = require('./FooterMenuBlock').FooterMenuBlock;
        return <FooterMenuBlock 
          settings={block.settings} 
          isEditor={isEditor} 
          colorScheme={colorScheme}
          headingTypographyStyles={headingTypographyStyles}
          bodyTypographyStyles={bodyTypographyStyles}
        />;

      case FooterBlockType.SOCIAL_MEDIA:
        return (
          <div>
            {block.settings?.heading && (
              <h3 className="font-semibold mb-2 text-sm" style={{ 
                color: colorScheme?.text || '#ffffff',
                ...headingTypographyStyles
              }}>
                {block.settings.heading}
              </h3>
            )}
            {block.settings?.body && (
              <p className="text-sm opacity-75 mb-3" style={{ 
                color: colorScheme?.text || '#cccccc',
                ...bodyTypographyStyles
              }}>
                {block.settings.body}
              </p>
            )}
            <div className="flex gap-2.5">
              {/* Calculate icon size and style based on settings */}
              {(() => {
                const iconSize = block.settings?.iconSize || 'medium';
                const iconStyle = block.settings?.iconStyle || 'solid';
                const sizeClass = iconSize === 'small' ? 'w-3.5 h-3.5' : 
                                 iconSize === 'large' ? 'w-5 h-5' : 'w-4 h-4';
                
                // For outline style, we'll use strokeWidth and fill
                const iconProps = iconStyle === 'outline' 
                  ? { strokeWidth: 1.5, fill: 'none' }
                  : { strokeWidth: 2, fill: 'currentColor' };
                
                // Helper function to check if platform should be shown
                const shouldShowPlatform = (platform: string) => {
                  // If platforms is not defined, show the default ones
                  if (!block.settings?.platforms) {
                    return ['instagram', 'facebook', 'twitter', 'youtube', 'linkedin'].includes(platform);
                  }
                  // Otherwise, check the specific platform setting
                  return block.settings.platforms[platform as keyof typeof block.settings.platforms] === true;
                };
                
                return (
                  <>
                    {shouldShowPlatform('instagram') && (
                      <Instagram 
                        className={`${sizeClass} opacity-75 hover:opacity-100 cursor-pointer transition-opacity`} 
                        style={{ color: colorScheme?.text || '#cccccc' }}
                        {...iconProps} 
                      />
                    )}
                    {shouldShowPlatform('facebook') && (
                      <Facebook 
                        className={`${sizeClass} opacity-75 hover:opacity-100 cursor-pointer transition-opacity`} 
                        style={{ color: colorScheme?.text || '#cccccc' }}
                        {...iconProps}
                      />
                    )}
                    {shouldShowPlatform('twitter') && (
                      <Twitter 
                        className={`${sizeClass} opacity-75 hover:opacity-100 cursor-pointer transition-opacity`} 
                        style={{ color: colorScheme?.text || '#cccccc' }}
                        {...iconProps}
                      />
                    )}
                    {shouldShowPlatform('youtube') && (
                      <Youtube 
                        className={`${sizeClass} opacity-75 hover:opacity-100 cursor-pointer transition-opacity`} 
                        style={{ color: colorScheme?.text || '#cccccc' }}
                        {...iconProps}
                      />
                    )}
                    {shouldShowPlatform('linkedin') && (
                      <Linkedin 
                        className={`${sizeClass} opacity-75 hover:opacity-100 cursor-pointer transition-opacity`} 
                        style={{ color: colorScheme?.text || '#cccccc' }}
                        {...iconProps}
                      />
                    )}
                    {shouldShowPlatform('tiktok') && (
                      <Music2 
                        className={`${sizeClass} opacity-75 hover:opacity-100 cursor-pointer transition-opacity`} 
                        style={{ color: colorScheme?.text || '#cccccc' }}
                        {...iconProps}
                      />
                    )}
                    {shouldShowPlatform('pinterest') && (
                      <ImageIcon 
                        className={`${sizeClass} opacity-75 hover:opacity-100 cursor-pointer transition-opacity`} 
                        style={{ color: colorScheme?.text || '#cccccc' }}
                        {...iconProps}
                      />
                    )}
                    {shouldShowPlatform('snapchat') && (
                      <Ghost 
                        className={`${sizeClass} opacity-75 hover:opacity-100 cursor-pointer transition-opacity`} 
                        style={{ color: colorScheme?.text || '#cccccc' }}
                        {...iconProps}
                      />
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        );

      case FooterBlockType.SUBSCRIBE:
        return (
          <div>
            {/* Heading from settings */}
            {block.settings?.heading && (
              <h3 className="font-semibold mb-2 text-sm" style={{ 
                color: colorScheme?.text || '#ffffff',
                ...headingTypographyStyles
              }}>
                {block.settings.heading}
              </h3>
            )}
            
            {/* Body text from settings */}
            {block.settings?.body && (
              <p className="text-sm opacity-75 mb-3" style={{ 
                color: colorScheme?.text || '#cccccc',
                ...bodyTypographyStyles
              }}>
                {block.settings.body}
              </p>
            )}
            
            {/* Email input with button */}
            <div className="flex">
              <input
                type="email"
                placeholder={block.settings?.placeholderText || "Email address"}
                className={`flex-1 px-2.5 py-1.5 text-sm rounded-l-md focus:outline-none focus:ring-1 ${
                  block.settings?.inputStyle === 'outline' 
                    ? 'border' 
                    : ''
                }`}
                style={{ 
                  backgroundColor: block.settings?.inputStyle === 'outline' 
                    ? 'transparent' 
                    : (colorScheme?.foreground || '#333333'),
                  color: colorScheme?.text || '#ffffff',
                  borderColor: block.settings?.inputStyle === 'outline'
                    ? (colorScheme?.border || '#555555')
                    : 'transparent',
                  borderWidth: block.settings?.inputStyle === 'outline' ? '1px' : '0'
                }}
              />
              <button 
                className="px-3 py-1.5 rounded-r-md transition-colors flex items-center gap-1.5"
                style={{ 
                  backgroundColor: colorScheme?.solidButton || '#0066cc',
                  color: colorScheme?.solidButtonText || '#ffffff'
                }}
              >
                {block.settings?.buttonText ? (
                  <span className="text-sm">{block.settings.buttonText}</span>
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        );

      case FooterBlockType.LOGO_WITH_TEXT:
        const logoSize = block.settings?.logoSize || 190;
        const logoHeight = Math.max(logoSize * 0.4, 40); // Proportional height, min 40px;
        
        return (
          <div className={isMobile ? "text-center" : ""}>
            {block.settings?.heading && (
              <h3 className="font-semibold mb-2 text-sm" style={{ 
                color: colorScheme?.text || '#ffffff',
                ...headingTypographyStyles
              }}>
                {block.settings.heading}
              </h3>
            )}
            <div className={`flex ${isMobile ? 'justify-center' : ''} items-center`}>
              {block.settings?.logoUrl ? (
                <img 
                  src={getImageUrl(block.settings.logoUrl)} 
                  alt="Logo" 
                  className="object-contain"
                  style={{ 
                    maxWidth: `${logoSize}px`,
                    height: `${logoHeight}px`,
                    width: 'auto',
                    margin: isMobile ? '-8px auto 0' : '-8px 0 0 0'
                  }}
                />
              ) : (
                <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
                  <div className="rounded-lg flex items-center justify-center"
                    style={{ 
                      backgroundColor: colorScheme?.solidButton || '#0066cc',
                      width: `${logoHeight}px`,
                      height: `${logoHeight}px`
                    }}>
                    <span className="font-bold" style={{ 
                      color: colorScheme?.solidButtonText || '#ffffff',
                      fontSize: `${logoHeight * 0.4}px`
                    }}>A</span>
                  </div>
                  <span className="font-bold" style={{ 
                    color: colorScheme?.text || '#ffffff',
                    fontSize: `${logoHeight * 0.5}px`
                  }}>AURORA</span>
                </div>
              )}
            </div>
            {block.settings?.body && (
              <p className="text-sm opacity-75" style={{ 
                color: colorScheme?.text || '#cccccc',
                ...bodyTypographyStyles
              }}>
                {block.settings.body}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const backgroundColor = config?.colorBackground 
    ? (colorScheme?.background || '#1a1a1a')
    : 'transparent';

  
  return (
    <footer 
      className="relative"
      style={{
        backgroundColor,
        paddingTop: config?.padding?.enabled ? `${config?.padding?.top}px` : '40px',
        paddingBottom: config?.padding?.enabled ? `${config?.padding?.bottom}px` : '40px',
        minHeight: isEditor ? '200px' : 'auto'
      }}
    >
      {/* Separador superior */}
      {config?.showSeparator && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gray-700" />
      )}

      {/* Contenedor principal */}
      <div className="container mx-auto px-4">
        {/* Empty state or blocks */}
        {blocks.length === 0 ? (
          isEditor ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                <Package className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-white font-medium mb-2 text-lg">Footer vacío</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Agrega bloques desde el panel lateral usando el botón "Agregar bloque" para construir tu footer
              </p>
            </div>
          ) : null
        ) : null}

        {/* Grid de bloques */}
        {blocks.length > 0 && (
          <div 
            className={`grid gap-6 ${
              isMobile ? 'grid-cols-1' : `grid-cols-${columnsPerRow}`
            } ${!isEditor ? 'items-start' : ''}`}
            style={{
              gridTemplateColumns: isMobile ? '1fr' : `repeat(${columnsPerRow}, 1fr)`,
              alignItems: !isEditor ? 'start' : 'stretch'
            }}
          >
            {blocks.filter(b => b.visible !== false).map((block) => (
              <div 
                key={block.id} 
                className={isEditor ? "border border-dashed border-gray-600 p-3 rounded" : ""}
              >
                {renderBlock(block)}
              </div>
            ))}
          </div>
        )}

        {/* Removed the centered logo - not needed */}

        {/* Bottom Bar - Always show in editor if enabled */}
        {(config?.bottomBar?.enabled || isEditor) && (
          <div className="border-t border-gray-700 pt-6 mt-6 min-h-[100px]">
            {/* Primera línea: Selectores y Email */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              {/* Selectores de idioma y moneda - izquierda */}
              <div className="flex items-center gap-3 text-sm">
                {config?.languageSelector?.enabled && (
                  <div className="relative" ref={languageRef}>
                    <button 
                      className="flex items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
                      onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    >
                      <span>{selectedLanguage}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showLanguageDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                        <button
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          onClick={() => {
                            setSelectedLanguage('Español');
                            setShowLanguageDropdown(false);
                          }}
                        >
                          Español
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          onClick={() => {
                            setSelectedLanguage('English');
                            setShowLanguageDropdown(false);
                          }}
                        >
                          English
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {config?.languageSelector?.enabled && config?.currencySelector?.enabled && (
                  <span className="text-gray-500">|</span>
                )}
                
                {config?.currencySelector?.enabled && (
                  <div className="relative" ref={currencyRef}>
                    <button 
                      className="flex items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
                      onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                    >
                      <span>{selectedCurrency}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showCurrencyDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                        {availableCurrencies.map((currency) => (
                          <button
                            key={currency}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                            onClick={() => {
                              changeCurrency(currency);
                              setShowCurrencyDropdown(false);
                            }}
                          >
                            {getCurrencyDisplay(currency)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Email de contacto - centro */}
              {config?.contactEmail && (
                <div className="text-gray-400 text-sm">
                  {config.contactEmail}
                </div>
              )}

              {/* Teléfono - derecha */}
              {config?.contactPhone && (
                <div className="text-gray-400 text-sm">
                  {config.contactPhone}
                </div>
              )}
            </div>

            {/* Segunda línea: Copyright y Payment Icons */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              {/* Copyright - izquierda */}
              <div className="text-gray-400 text-xs" style={bodyTypographyStyles}>
                {config?.copyrightNotice || `© ${new Date().getFullYear()} Your Company. All rights reserved.`}
              </div>

              {/* Iconos de pago - derecha */}
              {config?.bottomBar?.showPaymentIcons && (
                <div className="flex items-center gap-2">
                  {/* Show enabled payment providers or defaults if none configured */}
                  {(() => {
                    const providers = config?.bottomBar?.paymentProviders;
                    const paymentLogos = config?.bottomBar?.paymentLogos || {};
                    const showProvider = (key: string) => {
                      // If no providers configured, show defaults
                      if (!providers) {
                        return ['visa', 'mastercard', 'amex', 'applePay'].includes(key);
                      }
                      // Only show if explicitly set to true
                      return providers[key as keyof typeof providers] === true;
                    };
                    
                    const renderPaymentIcon = (key: string, DefaultIcon: React.FC) => {
                      const customLogo = (paymentLogos as any)[key];
                      if (customLogo) {
                        return (
                          <img 
                            src={customLogo} 
                            alt={key}
                            className="h-8 w-auto object-contain"
                          />
                        );
                      }
                      return (
                        <div className="h-8 w-14 rounded overflow-hidden">
                          <DefaultIcon />
                        </div>
                      );
                    };
                    
                    return (
                      <>
                        {showProvider('visa') && renderPaymentIcon('visa', VisaIcon)}
                        {showProvider('mastercard') && renderPaymentIcon('mastercard', MastercardIcon)}
                        {showProvider('amex') && renderPaymentIcon('amex', AmexIcon)}
                        {showProvider('discover') && renderPaymentIcon('discover', DiscoverIcon)}
                        {showProvider('diners') && renderPaymentIcon('diners', DinersIcon)}
                        {showProvider('applePay') && renderPaymentIcon('applePay', ApplePayIcon)}
                        {showProvider('googlePay') && renderPaymentIcon('googlePay', GooglePayIcon)}
                        {showProvider('amazonPay') && renderPaymentIcon('amazonPay', AmazonPayIcon)}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Tercera línea: Enlaces de políticas */}
            {config?.policyLinks?.showLinks && (
              <div className="flex flex-wrap gap-4 justify-start">
                {isEditor ? (
                  <>
                    <a href="#" className="text-gray-400 text-xs hover:text-gray-300 transition-colors cursor-pointer" style={bodyTypographyStyles} onClick={(e) => e.preventDefault()}>
                      Política de reembolso
                    </a>
                    <a href="#" className="text-gray-400 text-xs hover:text-gray-300 transition-colors cursor-pointer" style={bodyTypographyStyles} onClick={(e) => e.preventDefault()}>
                      Política de privacidad
                    </a>
                    <a href="#" className="text-gray-400 text-xs hover:text-gray-300 transition-colors cursor-pointer" style={bodyTypographyStyles} onClick={(e) => e.preventDefault()}>
                      Términos del servicio
                    </a>
                    <a href="#" className="text-gray-400 text-xs hover:text-gray-300 transition-colors cursor-pointer" style={bodyTypographyStyles} onClick={(e) => e.preventDefault()}>
                      Política de envío
                    </a>
                  </>
                ) : (
                  <>
                    <Link href="/returns" className="text-gray-400 text-xs hover:text-gray-300 transition-colors cursor-pointer" style={bodyTypographyStyles}>
                      Política de reembolso
                    </Link>
                    <Link href="/privacy" className="text-gray-400 text-xs hover:text-gray-300 transition-colors cursor-pointer" style={bodyTypographyStyles}>
                      Política de privacidad
                    </Link>
                    <Link href="/terms" className="text-gray-400 text-xs hover:text-gray-300 transition-colors cursor-pointer" style={bodyTypographyStyles}>
                      Términos del servicio
                    </Link>
                    <Link href="/shipping" className="text-gray-400 text-xs hover:text-gray-300 transition-colors cursor-pointer" style={bodyTypographyStyles}>
                      Política de envío
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
