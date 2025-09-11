// PreviewNewsletter.tsx - Newsletter Preview Component with Mobile View
import React, { useState, useEffect } from 'react';
import { NewsletterSubscribersAPI } from '@/lib/api/newsletter-subscribers';
import toast from 'react-hot-toast';
import { NewsletterConfig, defaultNewsletterConfig, createDefaultNewsletterBlocks } from '@/components/editor/modules/Newsletter/types';
import { GlobalThemeConfig } from '@/types/theme';
import useThemeConfigStore from '@/stores/useThemeConfigStore'; // SIN destructuring {}
import { cn } from '@/lib/utils';
import SubscriptionModal from '@/components/ui/SubscriptionModal';
import { Loader2 } from 'lucide-react';

interface PreviewNewsletterProps {
  config?: NewsletterConfig;
  theme?: GlobalThemeConfig | null;
  deviceView?: 'mobile' | 'desktop';
  isEditor?: boolean;
}

export default function PreviewNewsletter({
  config,
  theme,
  deviceView,
  isEditor = false
}: PreviewNewsletterProps) {
  // Patrón dual de theme
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;
  
  // Estados para el modal y loading
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);
  const [subscribedEmails, setSubscribedEmails] = useState<Set<string>>(new Set());
  
  // Valores por defecto para el editor
  const defaultConfig = {
    ...defaultNewsletterConfig,
    blocks: createDefaultNewsletterBlocks()
  };
  
  const finalConfig = config || defaultConfig;
  
  // 🔴 PATRÓN CANÓNICO - USAR EN TODOS LOS PREVIEW COMPONENTS
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
  
  // Solo ocultar si está explícitamente false
  if (finalConfig.enabled === false && !isEditor) return null;
  
  // Obtener color scheme (estructura plana, NO anidada)
  const colorSchemeIndex = finalConfig.colorScheme ? parseInt(finalConfig.colorScheme) - 1 : 0;
  const colorScheme = themeConfig?.colorSchemes?.schemes?.[colorSchemeIndex] || {
    background: '#ffffff',
    text: '#000000',
    foreground: '#000000',
    border: '#e5e5e5',
    link: '#0066cc',
    solidButton: '#000000',
    solidButtonText: '#ffffff',
    outlineButton: '#000000',
    outlineButtonText: '#000000',
    imageOverlay: 'rgba(0,0,0,0.3)'
  };
  
  // Obtener typography
  const typography: any = themeConfig?.typography || {};
  
  // Configuraciones responsive
  const containerClass = cn(
    'relative overflow-hidden',
    finalConfig.width === 'screen' ? 'w-full' : '',
    finalConfig.width === 'page' ? 'max-w-7xl mx-auto' : '',
    finalConfig.width === 'large' ? 'max-w-5xl mx-auto' : '',
    finalConfig.width === 'medium' ? 'max-w-3xl mx-auto' : ''
  );
  
  const aspectRatio = isMobile ? 1.6 : finalConfig.desktopRatio; // Fixed mobile ratio
  const overlayOpacity = isMobile ? finalConfig.mobileOverlayOpacity : finalConfig.desktopOverlayOpacity;
  const backgroundImage = isMobile ? finalConfig.mobileImage : finalConfig.desktopImage;
  const contentPosition = isMobile ? 'center' : finalConfig.desktopPosition; // Always center on mobile
  const contentAlignment = isMobile ? 'center' : finalConfig.desktopAlignment; // Always center align on mobile
  const contentBackground = isMobile ? finalConfig.mobileContentBackground : finalConfig.desktopContentBackground;
  const contentWidth = isMobile ? '100%' : `${finalConfig.desktopWidth}px`;
  const contentSpacing = isMobile ? 16 : finalConfig.desktopSpacing;
  
  // Estilos de posición del contenido
  const getContentPositionStyles = () => {
    const styles: React.CSSProperties = {
      width: contentWidth,
      padding: `${contentSpacing}px`
    };
    
    if (isMobile) {
      // Mobile positioning - always center
      styles.alignSelf = 'center';
      styles.justifyContent = 'center';
      styles.textAlign = 'center';
    } else {
      // Desktop positioning
      switch (contentPosition) {
        case 'left':
          styles.marginRight = 'auto';
          break;
        case 'center':
          styles.marginLeft = 'auto';
          styles.marginRight = 'auto';
          break;
        case 'right':
          styles.marginLeft = 'auto';
          break;
      }
    }
    
    return styles;
  };
  
  // Estilos de background del contenido
  const getContentBackgroundStyles = () => {
    const styles: React.CSSProperties = {};
    const cardScale = finalConfig.cardSize / 100;
    
    // Apply card scale
    styles.transform = `scale(${cardScale})`;
    styles.transformOrigin = contentAlignment === 'center' ? 'center' : 'left top';
    
    // Get card style variations
    const getCardStyles = () => {
      switch (finalConfig.cardStyle) {
        case 'minimal':
          return { borderRadius: '0' };
        case 'flat':
          return { borderRadius: '0.25rem' };
        case 'raised':
          return { borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' };
        case 'bordered':
          return { borderRadius: '0.5rem', border: `1px solid ${colorScheme.border}` };
        case 'rounded':
          return { borderRadius: '1rem' };
        case 'modern':
          return { borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' };
        default:
          return { borderRadius: '0.5rem' };
      }
    };
    
    const cardStyles = getCardStyles();
    Object.assign(styles, cardStyles);
    
    switch (contentBackground) {
      case 'solid':
        styles.backgroundColor = colorScheme.foreground || '#f5f5f5';
        styles.padding = '2rem';
        break;
      case 'outline':
        styles.border = `2px solid ${colorScheme.border}`;
        styles.padding = '2rem';
        break;
      case 'shadow':
        styles.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        styles.backgroundColor = colorScheme.foreground || 'white';
        styles.padding = '2rem';
        break;
      case 'blurred':
        styles.backdropFilter = 'blur(10px)';
        styles.backgroundColor = colorScheme.foreground ? `${colorScheme.foreground}cc` : 'rgba(255,255,255,0.8)';
        styles.padding = '2rem';
        break;
      case 'transparent':
        styles.backgroundColor = colorScheme.foreground ? `${colorScheme.foreground}e6` : 'rgba(255,255,255,0.9)';
        styles.padding = '2rem';
        break;
    }
    
    return styles;
  };
  
  // Renderizar bloques hijos
  const renderBlock = (block: any) => {
    if (block.visible === false) return null;
    
    switch (block.type) {
      case 'subheading':
        return (
          <div 
            key={block.id}
            className={cn(
              'uppercase tracking-wider',
              isMobile ? 'text-xs text-center' : 'text-sm',
              !isMobile && (contentAlignment === 'center' ? 'text-center' : 'text-left')
            )}
            style={{ 
              color: colorScheme.text,
              fontFamily: typography.body?.fontFamily || 'inherit',
              letterSpacing: '0.1em',
              opacity: 0.7
            }}
          >
            {block.text}
          </div>
        );
        
      case 'heading':
        const HeadingTag = block.size as keyof JSX.IntrinsicElements;
        const headingClasses = cn(
          block.size === 'h1' ? (isMobile ? 'text-3xl' : 'text-5xl') :
          block.size === 'h2' ? (isMobile ? 'text-2xl' : 'text-4xl') :
          block.size === 'h3' ? (isMobile ? 'text-xl' : 'text-3xl') :
          block.size === 'h4' ? (isMobile ? 'text-lg' : 'text-2xl') :
          block.size === 'h5' ? (isMobile ? 'text-base' : 'text-xl') :
          (isMobile ? 'text-sm' : 'text-lg'),
          isMobile ? 'text-center' : (contentAlignment === 'center' ? 'text-center' : 'text-left'),
          'font-bold'
        );
        
        return (
          <HeadingTag
            key={block.id}
            className={headingClasses}
            style={{ 
              color: colorScheme.text,
              fontFamily: typography.headings?.fontFamily || 'inherit',
              fontWeight: block.formatting?.bold ? 'bold' : typography.headings?.fontWeight,
              fontStyle: block.formatting?.italic ? 'italic' : 'normal'
            }}
          >
            {block.formatting?.link ? (
              <a 
                href={block.formatting.link} 
                className="hover:underline"
                style={{ color: colorScheme.link }}
              >
                {block.text}
              </a>
            ) : (
              block.text
            )}
          </HeadingTag>
        );
        
      case 'text':
        const textClasses = cn(
          block.bodySize === 'body1' ? (isMobile ? 'text-lg' : 'text-xl') :
          block.bodySize === 'body2' ? (isMobile ? 'text-base' : 'text-lg') :
          block.bodySize === 'body3' ? (isMobile ? 'text-sm' : 'text-base') :
          (isMobile ? 'text-xs' : 'text-sm'),
          isMobile ? 'text-center' : (contentAlignment === 'center' ? 'text-center' : 'text-left')
        );
        
        return (
          <div
            key={block.id}
            className={textClasses}
            style={{ 
              color: colorScheme.text,
              fontFamily: typography.body?.fontFamily || 'inherit',
              fontWeight: block.formatting?.bold ? 'bold' : 'normal',
              fontStyle: block.formatting?.italic ? 'italic' : 'normal',
              opacity: 0.8
            }}
          >
            {block.formatting?.link ? (
              <a 
                href={block.formatting.link} 
                className="hover:underline"
                style={{ color: colorScheme.link }}
              >
                {block.content}
              </a>
            ) : (
              block.content
            )}
          </div>
        );
        
      case 'subscribe':
        const isLoading = loadingButtonId === block.id;
        const emailInputId = `newsletter-email-${block.id}`;
        
        return (
          <div 
            key={block.id} 
            className={cn(
              'flex',
              isMobile ? 'justify-center w-full' : (contentAlignment === 'center' ? 'justify-center' : '')
            )}
          >
            {/* Solid style - input with inline button */}
            {block.inputStyle === 'solid' ? (
              // Solid style - input with button inside
              <div className={cn(
                'flex overflow-hidden',
                isMobile ? 'flex-col w-64 mx-auto gap-2' : 'rounded max-w-md w-full'
              )}>
                <input
                  id={emailInputId}
                  type="email"
                  name="newsletterEmail"
                  placeholder={block.placeholder || 'Email address'}
                  disabled={isLoading}
                  className={cn(
                    'flex-1 text-center transition-all',
                    isMobile ? 'px-6 py-2.5 text-sm w-full rounded-lg' : 'px-4 py-3 text-left',
                    'focus:outline-none',
                    isLoading && 'opacity-50 cursor-not-allowed'
                  )}
                  style={{
                    backgroundColor: colorScheme.background,
                    color: colorScheme.text,
                    fontFamily: typography.body?.fontFamily || 'inherit',
                    border: `1px solid ${colorScheme.border}`
                  }}
                />
                <button
                  disabled={isLoading}
                  className={cn(
                    'font-medium transition-all flex items-center justify-center gap-2',
                    isMobile ? 'px-6 py-2.5 text-sm w-full rounded-lg' : 'px-6 py-3',
                    isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90 hover:scale-105'
                  )}
                  style={{
                    backgroundColor: colorScheme.solidButton,
                    color: colorScheme.solidButtonText,
                    fontFamily: typography.buttons?.fontFamily || 'inherit'
                  }}
                  onClick={async (e) => {
                    if (isLoading) return;
                    
                    try {
                      const input = document.getElementById(emailInputId) as HTMLInputElement | null;
                      const email = (input?.value || '').trim();
                      
                      // Validation
                      if (!email) {
                        toast.error('Please enter your email address');
                        input?.focus();
                        return;
                      }
                      
                      // Email format validation
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(email)) {
                        toast.error('Please enter a valid email address');
                        input?.focus();
                        return;
                      }
                      
                      // Check if already subscribed
                      if (subscribedEmails.has(email.toLowerCase())) {
                        toast.error('You are already subscribed with this email');
                        return;
                      }
                      
                      // Set loading state
                      setLoadingButtonId(block.id);
                      
                      // API call
                      await NewsletterSubscribersAPI.publicSubscribe({
                        Email: email,
                        AcceptedMarketing: true,
                        AcceptedTerms: true,
                        SourcePage: typeof window !== 'undefined' ? window.location.pathname : undefined,
                        Language: 'es'
                      } as any);
                      
                      // Success handling
                      setSubscribedEmail(email);
                      setSubscribedEmails(prev => new Set(prev).add(email.toLowerCase()));
                      setShowSuccessModal(true);
                      
                      // Clear input
                      if (input) input.value = '';
                      
                      // Store in localStorage for persistence
                      if (typeof window !== 'undefined') {
                        const stored = localStorage.getItem('subscribedEmails') || '[]';
                        const emails = JSON.parse(stored);
                        emails.push(email.toLowerCase());
                        localStorage.setItem('subscribedEmails', JSON.stringify(emails));
                      }
                      
                    } catch (err: any) {
                      // Handle duplicate email error
                      if (err?.message?.includes('already') || err?.message?.includes('duplicate')) {
                        toast.error('This email is already subscribed');
                        setSubscribedEmails(prev => new Set(prev).add((document.getElementById(emailInputId) as HTMLInputElement)?.value?.toLowerCase() || ''));
                      } else {
                        toast.error(err?.message || 'Subscription failed. Please try again.');
                      }
                    } finally {
                      setLoadingButtonId(null);
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    block.buttonText || 'Subscribe'
                  )}
                </button>
              </div>
            ) : (
              // Outline style - separate input and button
              <div className={cn(
                'flex gap-2',
                isMobile ? 'flex-col w-64 mx-auto' : 'max-w-md w-full'
              )}>
                <input
                  id={emailInputId}
                  type="email"
                  name="newsletterEmail"
                  placeholder={block.placeholder || 'Email address'}
                  disabled={isLoading}
                  className={cn(
                    'rounded-lg bg-transparent border-2 flex-1 text-center transition-all',
                    isMobile ? 'px-6 py-2.5 text-sm w-full' : 'px-4 py-2 text-left',
                    'focus:outline-none focus:border-opacity-70',
                    isLoading && 'opacity-50 cursor-not-allowed'
                  )}
                  style={{
                    borderColor: colorScheme.outlineButton,
                    color: colorScheme.text,
                    fontFamily: typography.body?.fontFamily || 'inherit'
                  }}
                />
                <button
                  disabled={isLoading}
                  className={cn(
                    'rounded-lg font-medium transition-all border-2 flex items-center justify-center gap-2',
                    isMobile ? 'px-6 py-2.5 text-sm w-full' : 'px-6 py-2',
                    isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90 hover:scale-105'
                  )}
                  style={{
                    backgroundColor: 'transparent',
                    color: colorScheme.outlineButtonText,
                    borderColor: colorScheme.outlineButton,
                    fontFamily: typography.buttons?.fontFamily || 'inherit'
                  }}
                  onClick={async (e) => {
                    if (isLoading) return;
                    
                    try {
                      const input = document.getElementById(emailInputId) as HTMLInputElement | null;
                      const email = (input?.value || '').trim();
                      
                      // Validation
                      if (!email) {
                        toast.error('Please enter your email address');
                        input?.focus();
                        return;
                      }
                      
                      // Email format validation
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(email)) {
                        toast.error('Please enter a valid email address');
                        input?.focus();
                        return;
                      }
                      
                      // Check if already subscribed
                      if (subscribedEmails.has(email.toLowerCase())) {
                        toast.error('You are already subscribed with this email');
                        return;
                      }
                      
                      // Set loading state
                      setLoadingButtonId(block.id);
                      
                      // API call
                      await NewsletterSubscribersAPI.publicSubscribe({
                        Email: email,
                        AcceptedMarketing: true,
                        AcceptedTerms: true,
                        SourcePage: typeof window !== 'undefined' ? window.location.pathname : undefined,
                        Language: 'es'
                      } as any);
                      
                      // Success handling
                      setSubscribedEmail(email);
                      setSubscribedEmails(prev => new Set(prev).add(email.toLowerCase()));
                      setShowSuccessModal(true);
                      
                      // Clear input
                      if (input) input.value = '';
                      
                      // Store in localStorage for persistence
                      if (typeof window !== 'undefined') {
                        const stored = localStorage.getItem('subscribedEmails') || '[]';
                        const emails = JSON.parse(stored);
                        emails.push(email.toLowerCase());
                        localStorage.setItem('subscribedEmails', JSON.stringify(emails));
                      }
                      
                    } catch (err: any) {
                      // Handle duplicate email error
                      if (err?.message?.includes('already') || err?.message?.includes('duplicate')) {
                        toast.error('This email is already subscribed');
                        setSubscribedEmails(prev => new Set(prev).add((document.getElementById(emailInputId) as HTMLInputElement)?.value?.toLowerCase() || ''));
                      } else {
                        toast.error(err?.message || 'Subscription failed. Please try again.');
                      }
                    } finally {
                      setLoadingButtonId(null);
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    block.buttonText || 'Subscribe'
                  )}
                </button>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Load subscribed emails from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('subscribedEmails');
      if (stored) {
        try {
          const emails = JSON.parse(stored);
          setSubscribedEmails(new Set(emails));
        } catch (e) {
          console.error('Error loading subscribed emails:', e);
        }
      }
    }
  }, []);
  
  // Get primary color for modal
  const primaryColor = typeof window !== 'undefined' 
    ? localStorage.getItem('primaryColor') || '#22c55e'
    : '#22c55e';
  
  return (
    <>
      {/* Success Modal */}
      <SubscriptionModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        email={subscribedEmail}
        theme={{
          primaryColor,
          textColor: colorScheme.text,
          backgroundColor: colorScheme.background
        }}
      />
      
      <section
      className={containerClass}
      style={{
        backgroundColor: finalConfig.colorBackground ? colorScheme.background : 'transparent',
        paddingTop: `${isMobile ? 20 : finalConfig.paddingTop}px`,
        paddingBottom: `${isMobile ? 20 : finalConfig.paddingBottom}px`,
        paddingLeft: finalConfig.addSidePaddings ? (isMobile ? '1rem' : '2rem') : 0,
        paddingRight: finalConfig.addSidePaddings ? (isMobile ? '1rem' : '2rem') : 0
      }}
    >
      <div 
        className="relative flex items-center justify-center"
        style={{
          minHeight: isMobile ? '400px' : `${400 / aspectRatio}px`,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Video Background */}
        {finalConfig.video && !backgroundImage && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={finalConfig.video} type="video/mp4" />
          </video>
        )}
        
        {/* Overlay */}
        {(backgroundImage || finalConfig.video) && overlayOpacity > 0 && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundColor: 'black',
              opacity: overlayOpacity / 100
            }}
          />
        )}
        
        {/* Content Container */}
        <div 
          className={cn(
            'relative z-10 flex',
            isMobile ? 'flex-col w-full h-full' : 'w-full'
          )}
          style={getContentPositionStyles()}
        >
          <div 
            className="space-y-4"
            style={getContentBackgroundStyles()}
          >
            {/* Render blocks */}
            {finalConfig.blocks.map(renderBlock)}
          </div>
        </div>
      </div>
      
      {/* Custom CSS */}
      {finalConfig.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: finalConfig.customCSS }} />
      )}
    </section>
    </>
  );
}
