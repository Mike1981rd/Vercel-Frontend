// PreviewRichText.tsx - Rich Text Preview Component
import React from 'react';
import { Settings, Star, Heart, Check, Info } from 'lucide-react';
import { RichTextConfig, RichTextBlock } from '../editor/modules/RichText/types';
import { useColorSchemes } from '@/hooks/useColorSchemes';
import useThemeConfigStore from '@/stores/useThemeConfigStore';

interface PreviewRichTextProps {
  config: RichTextConfig;
  deviceView?: 'desktop' | 'tablet' | 'mobile';
  isEditor?: boolean;
}

export default function PreviewRichText({ config, deviceView = 'desktop', isEditor = false }: PreviewRichTextProps) {
  const { colorSchemes } = useColorSchemes();
  const themeConfig = useThemeConfigStore((state) => state.config);
  
  // Ensure config has blocks array
  const safeConfig = {
    ...config,
    blocks: config?.blocks || []
  };
  
  // Get the selected color scheme
  const schemeId = safeConfig.colorScheme ? `scheme-${safeConfig.colorScheme}` : 'scheme-1';
  const currentScheme = colorSchemes?.schemes?.find(s => s.id === schemeId) || colorSchemes?.schemes?.[0];
  
  const getIcon = (iconName: string | null, size: number) => {
    if (!iconName) return null;
    
    const iconProps = { size, className: "mx-auto" };
    switch (iconName) {
      case 'settings': return <Settings {...iconProps} />;
      case 'star': return <Star {...iconProps} />;
      case 'heart': return <Heart {...iconProps} />;
      case 'check': return <Check {...iconProps} />;
      case 'info': return <Info {...iconProps} />;
      default: return null;
    }
  };

  const getAlignmentClass = () => {
    switch (safeConfig.contentAlignment) {
      case 'left': return 'text-left';
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-center';
    }
  };

  const getWidthClass = () => {
    switch (safeConfig.width) {
      case 'full': return 'w-full';
      case 'narrow': return 'max-w-2xl mx-auto';
      case 'page':
      default: return 'max-w-6xl mx-auto';
    }
  };

  const getHeadingSize = (size: string) => {
    const isMobile = deviceView === 'mobile';
    switch (size) {
      case 'h1': return isMobile ? 'text-3xl' : 'text-5xl';
      case 'h2': return isMobile ? 'text-2xl' : 'text-4xl';
      case 'h3': return isMobile ? 'text-xl' : 'text-3xl';
      case 'h4': return isMobile ? 'text-lg' : 'text-2xl';
      case 'h5': return isMobile ? 'text-base' : 'text-xl';
      case 'h6': return isMobile ? 'text-sm' : 'text-lg';
      default: return isMobile ? 'text-base' : 'text-xl';
    }
  };

  const getBodySize = (size: string) => {
    const isMobile = deviceView === 'mobile';
    switch (size) {
      case 'body1': return isMobile ? 'text-base' : 'text-lg';
      case 'body2': return isMobile ? 'text-sm' : 'text-base';
      case 'body3': return isMobile ? 'text-xs' : 'text-sm';
      case 'body4': return 'text-xs';
      default: return isMobile ? 'text-sm' : 'text-base';
    }
  };

  const renderBlock = (block: RichTextBlock & { visible?: boolean }) => {
    // Skip if block is hidden
    if (block.visible === false) return null;
    
    switch (block.type) {
      case 'icon':
        if (!block.icon) return null;
        return (
          <div key={block.id} className="mb-6">
            {getIcon(block.icon, block.size)}
          </div>
        );

      case 'subheading':
        return (
          <p key={block.id} className="text-sm uppercase tracking-wide mb-3 opacity-75">
            {block.text}
          </p>
        );

      case 'heading':
        const HeadingTag = block.size as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag 
            key={block.id} 
            className={`${getHeadingSize(block.size)} font-bold mb-4 ${
              block.formatting?.italic ? 'italic' : ''
            }`}
            style={{
              fontWeight: block.formatting?.bold === false ? 'normal' : 'bold'
            }}
          >
            {block.formatting?.link ? (
              <a href={block.formatting.link} className="underline">
                {block.text}
              </a>
            ) : (
              block.text
            )}
          </HeadingTag>
        );

      case 'text':
        const gridClass = deviceView === 'mobile' ? 'grid-cols-1' : 
          block.columns === 1 ? 'grid-cols-1' : 
          block.columns === 2 ? 'grid-cols-2' : 
          'grid-cols-3';
        
        return (
          <div 
            key={block.id} 
            className={`grid gap-6 mb-6 ${gridClass}`}
          >
            {block.columnContent.map((content, index) => (
              <div 
                key={index}
                className={getBodySize(block.bodySize)}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ))}
          </div>
        );

      case 'buttons':
        return (
          <div key={block.id} className="flex flex-wrap gap-3 justify-center mt-6">
            {block.buttons.map((button, index) => {
              const baseClasses = "px-6 py-3 rounded transition-all";
              
              let buttonStyle: React.CSSProperties = {};
              let buttonClasses = baseClasses;
              
              if (button.style === 'solid') {
                buttonStyle = {
                  backgroundColor: buttonBgColor,
                  color: buttonTextColor,
                };
                buttonClasses += " hover:opacity-90";
              } else if (button.style === 'outline') {
                buttonStyle = {
                  borderColor: outlineButtonColor,
                  color: outlineButtonTextColor,
                  borderWidth: '2px',
                  borderStyle: 'solid'
                };
                buttonClasses += " hover:opacity-80";
              } else {
                buttonStyle = {
                  color: linkColor,
                };
                buttonClasses += " underline hover:no-underline";
              }

              return (
                <a
                  key={index}
                  href={button.link}
                  className={buttonClasses}
                  style={buttonStyle}
                >
                  {button.label}
                </a>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  // Apply colors based on color scheme
  const backgroundColor = safeConfig.colorBackground && currentScheme ? 
    currentScheme.background : 
    'transparent';
    
  const textColor = currentScheme?.text || '#000000';
  const buttonBgColor = currentScheme?.solidButton || '#000000';
  const buttonTextColor = currentScheme?.solidButtonText || '#FFFFFF';
  const outlineButtonColor = currentScheme?.outlineButton || '#000000';
  const outlineButtonTextColor = currentScheme?.outlineButtonText || '#000000';
  const linkColor = currentScheme?.link || '#0000FF';

  return (
    <section 
      className={getAlignmentClass()}
      style={{
        backgroundColor,
        color: textColor,
        paddingTop: `${safeConfig.paddingTop || 64}px`,
        paddingBottom: `${safeConfig.paddingBottom || 64}px`,
      }}
    >
      <div className={`${getWidthClass()} px-4`}>
        {safeConfig.blocks.map(block => renderBlock(block))}
      </div>
      
      {/* Custom CSS */}
      {safeConfig.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: safeConfig.customCSS }} />
      )}
    </section>
  );
}