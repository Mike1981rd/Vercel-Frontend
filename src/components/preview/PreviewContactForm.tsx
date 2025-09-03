import React, { useState, useEffect } from 'react';
import { ContactFormConfig, getDefaultContactFormConfig } from '@/components/editor/modules/ContactForm/types';
import { GlobalThemeConfig } from '@/types/theme';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { cn } from '@/lib/utils';

interface PreviewContactFormProps {
  config: ContactFormConfig;
  theme?: GlobalThemeConfig;
  deviceView?: 'mobile' | 'desktop';
  isEditor?: boolean;
}

export default function PreviewContactForm({ 
  config, 
  theme, 
  deviceView,
  isEditor = false 
}: PreviewContactFormProps) {
  // Patrón dual de theme
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;

  // PATRÓN CANÓNICO de detección móvil
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

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

  // Condición permisiva para enabled
  if (config.enabled === false && !isEditor) return null;

  // Merge with defaults
  const finalConfig = { ...getDefaultContactFormConfig(), ...config };

  // Get color scheme with ALL properties
  const colorSchemeIndex = finalConfig.colorScheme ? parseInt(finalConfig.colorScheme) - 1 : 0;
  const colorScheme = themeConfig?.colorSchemes?.schemes?.[colorSchemeIndex] || {
    text: '#000000',
    background: '#FFFFFF',
    foreground: '#F5E076',
    border: '#000000',
    link: '#F74703',
    solidButton: '#F74703',
    solidButtonText: '#FFFFFF',
    outlineButton: '#990F02',
    outlineButtonText: '#000000',
    imageOverlay: 'rgba(0, 0, 0, 0.1)'
  };

  // Get typography settings
  const typography: any = themeConfig?.typography || {};
  
  // Map heading size to typography
  const getHeadingStyles = () => {
    const sizeMap: Record<string, any> = {
      h1: typography?.headings?.desktop?.fontSize || '48px',
      h2: typography?.headings?.desktop?.fontSize || '40px',
      h3: typography?.headings?.desktop?.fontSize || '32px',
      h4: typography?.headings?.desktop?.fontSize || '24px',
      h5: typography?.headings?.desktop?.fontSize || '20px',
      h6: typography?.headings?.desktop?.fontSize || '16px'
    };
    
    const mobileSizeMap: Record<string, any> = {
      h1: '32px',
      h2: '28px',
      h3: '24px',
      h4: '20px',
      h5: '18px',
      h6: '14px'
    };
    
    return {
      fontSize: isMobile ? mobileSizeMap[finalConfig.headingSize || 'h5'] : sizeMap[finalConfig.headingSize || 'h5'],
      fontFamily: typography?.headings?.fontFamily,
      fontWeight: typography?.headings?.fontWeight || '700',
      lineHeight: typography?.headings?.lineHeight || '1.2'
    };
  };

  // Map body size to typography
  const getBodyStyles = () => {
    const sizeMap: Record<string, string> = {
      body1: '18px',
      body2: '16px',
      body3: '14px',
      body4: '13px',
      body5: '12px'
    };
    
    const mobileSizeMap: Record<string, string> = {
      body1: '16px',
      body2: '15px',
      body3: '14px',
      body4: '13px',
      body5: '12px'
    };
    
    return {
      fontSize: isMobile ? mobileSizeMap[finalConfig.bodySize || 'body3'] : sizeMap[finalConfig.bodySize || 'body3'],
      fontFamily: typography?.body?.fontFamily,
      fontWeight: typography?.body?.fontWeight || '400',
      lineHeight: typography?.body?.lineHeight || '1.6'
    };
  };

  // Width mapping
  const getFormWidth = () => {
    const widthMap: Record<string, string> = {
      'extra-small': 'max-w-md',
      'small': 'max-w-lg',
      'medium': 'max-w-2xl',
      'large': 'max-w-4xl',
      'extra-large': 'max-w-6xl'
    };
    return widthMap[finalConfig.width || 'extra-small'];
  };

  // Parse body HTML content
  const renderBody = () => {
    if (!finalConfig.body) return null;
    
    // Simple HTML parsing for basic tags
    const htmlContent = finalConfig.body
      .replace(/<b>/g, '<strong>')
      .replace(/<\/b>/g, '</strong>')
      .replace(/<i>/g, '<em>')
      .replace(/<\/i>/g, '</em>')
      .replace(/<u>/g, '<span style="text-decoration: underline;">')
      .replace(/<\/u>/g, '</span>');
    
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={getBodyStyles()}
      />
    );
  };

  // Responsive classes
  const containerPadding = finalConfig.addSidePaddings 
    ? (isMobile ? 'px-4' : 'px-8') 
    : '';
  
  const textAlign = finalConfig.contentAlignment === 'center' ? 'text-center' : 'text-left';
  const formAlign = finalConfig.contentAlignment === 'center' ? 'mx-auto' : '';

  // Input styles based on solid/outline
  const getInputStyles = () => {
    if (finalConfig.inputStyle === 'outline') {
      return {
        backgroundColor: 'transparent',
        borderColor: colorScheme?.border,
        color: colorScheme?.text
      };
    }
    // Solid style
    return {
      backgroundColor: colorScheme?.foreground,
      borderColor: colorScheme?.border,
      color: colorScheme?.text
    };
  };

  // Form field styles
  const inputClassName = cn(
    "w-full px-4 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2",
    finalConfig.inputStyle === 'outline' ? 'border-2' : 'border'
  );

  // Card styles based on selection
  const getCardStyles = () => {
    const cardPadding = finalConfig.cardPadding || 32;
    const baseStyles: React.CSSProperties = {
      padding: `${cardPadding}px`,
      borderRadius: '12px',
      transition: 'all 0.3s ease'
    };

    switch (finalConfig.cardStyle) {
      case 'elevated':
        return {
          ...baseStyles,
          backgroundColor: colorScheme?.background,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 10px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${colorScheme?.border}20`
        };
      
      case 'glass':
        return {
          ...baseStyles,
          backgroundColor: colorScheme?.background + 'CC', // Semi-transparent
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `1px solid ${colorScheme?.border}40`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        };
      
      case 'gradient':
        return {
          ...baseStyles,
          backgroundColor: colorScheme?.background,
          position: 'relative' as const,
          padding: '2px',
          background: `linear-gradient(135deg, ${colorScheme?.solidButton}, ${colorScheme?.foreground}, ${colorScheme?.solidButton})`,
          backgroundSize: '200% 200%',
          animation: 'gradientShift 3s ease infinite'
        };
      
      case 'neumorphic':
        const isDark = colorScheme?.background && parseInt(colorScheme.background.replace('#', ''), 16) < 0x808080;
        return {
          ...baseStyles,
          backgroundColor: colorScheme?.background,
          boxShadow: isDark 
            ? `inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.05)`
            : `10px 10px 20px ${colorScheme?.border}20, -10px -10px 20px ${colorScheme?.background}`,
          border: 'none'
        };
      
      default: // 'none'
        return {};
    }
  };

  // Inner container for gradient border style
  const getInnerContainerStyles = () => {
    if (finalConfig.cardStyle === 'gradient') {
      const cardPadding = finalConfig.cardPadding || 32;
      return {
        backgroundColor: colorScheme?.background,
        borderRadius: '10px',
        padding: `${cardPadding}px`,
        height: '100%'
      };
    }
    return {};
  };

  return (
    <section 
      className={cn(containerPadding)}
      style={{
        backgroundColor: finalConfig.cardStyle === 'none' ? colorScheme?.background : 'transparent',
        color: colorScheme?.text,
        paddingTop: `${finalConfig.topPadding || 96}px`,
        paddingBottom: `${finalConfig.bottomPadding || 96}px`
      }}
    >
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        ${finalConfig.customCss || ''}
      `}</style>
      
      <div 
        className={cn("mx-auto", getFormWidth(), formAlign)}
        style={finalConfig.cardStyle !== 'none' ? getCardStyles() : {}}
      >
        <div style={finalConfig.cardStyle === 'gradient' ? getInnerContainerStyles() : {}}>
        {/* Content Section */}
        <div className={cn("mb-8", textAlign)}>
          {finalConfig.heading && (
            <h2 
              className="mb-4"
              style={{
                ...getHeadingStyles(),
                color: colorScheme?.text
              }}
            >
              {finalConfig.heading}
            </h2>
          )}
          
          {finalConfig.body && (
            <div style={{ color: colorScheme?.text }}>
              {renderBody()}
            </div>
          )}
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-2"
          )}>
            {/* Name Field */}
            <div>
              <label className="sr-only">{finalConfig.nameLabel || 'Name'}</label>
              <input
                type="text"
                placeholder={finalConfig.nameLabel || 'Nombre'}
                required
                className={inputClassName}
                style={{
                  ...getInputStyles(),
                  '--tw-ring-color': colorScheme?.solidButton
                } as any}
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="sr-only">{finalConfig.emailLabel || 'Email'}</label>
              <input
                type="email"
                placeholder={finalConfig.emailLabel || 'Correo electrónico'}
                required
                className={inputClassName}
                style={{
                  ...getInputStyles(),
                  '--tw-ring-color': colorScheme?.solidButton
                } as any}
              />
            </div>
          </div>

          {/* Phone Field (conditional) */}
          {finalConfig.showPhoneInput && (
            <div>
              <label className="sr-only">{finalConfig.phoneLabel || 'Phone'}</label>
              <input
                type="tel"
                placeholder={finalConfig.phoneLabel || 'Teléfono'}
                className={inputClassName}
                style={{
                  ...getInputStyles(),
                  '--tw-ring-color': colorScheme?.solidButton
                } as any}
              />
            </div>
          )}

          {/* Message Field */}
          <div>
            <label className="sr-only">{finalConfig.messageLabel || 'Message'}</label>
            <textarea
              placeholder={finalConfig.messageLabel || 'Mensaje'}
              required
              rows={isMobile ? 4 : 6}
              className={cn(inputClassName, "resize-none")}
              style={{
                ...getInputStyles(),
                '--tw-ring-color': (colorScheme as any)?.accent
              } as any}
            />
          </div>

          {/* reCAPTCHA terms (conditional) */}
          {finalConfig.showRecaptcha && (
            <div className="text-xs" style={{ color: colorScheme?.text, opacity: 0.7 }}>
              <p>
                This site is protected by reCAPTCHA and the Google{' '}
                <a 
                  href="https://policies.google.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: colorScheme?.link }}
                  className="underline"
                >
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a 
                  href="https://policies.google.com/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: colorScheme?.link }}
                  className="underline"
                >
                  Terms of Service
                </a>{' '}
                apply.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className={textAlign}>
            <button
              type="submit"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded transition-all hover:opacity-80",
                isMobile ? "w-full" : "w-auto min-w-[100px]",
                finalConfig.inputStyle === 'outline' ? "border" : ""
              )}
              style={{
                backgroundColor: finalConfig.inputStyle === 'outline' ? 'transparent' : colorScheme?.solidButton,
                color: finalConfig.inputStyle === 'outline' ? colorScheme?.outlineButtonText : colorScheme?.solidButtonText,
                borderColor: finalConfig.inputStyle === 'outline' ? colorScheme?.outlineButton : 'transparent',
                fontFamily: typography?.buttons?.fontFamily || 'inherit',
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '0.025em'
              }}
            >
              {finalConfig.buttonText || 'SEND'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </section>
  );
}