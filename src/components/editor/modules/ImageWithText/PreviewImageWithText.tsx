/**
 * @file PreviewImageWithText.tsx
 * @max-lines 300
 * @current-lines 0
 * @architecture modular
 * @validates-rules ✅
 */

'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { ImageWithTextConfig, ImageWithTextItem } from './types';
import useThemeConfigStore from '@/stores/useThemeConfigStore';

type DeviceView = 'desktop' | 'mobile' | 'tablet';

interface PreviewImageWithTextProps {
  config: ImageWithTextConfig;
  isEditor?: boolean;
  theme?: any;
  deviceView?: DeviceView;
}

export default function PreviewImageWithText({ config, isEditor = false, deviceView }: PreviewImageWithTextProps) {
  const { config: themeConfig } = useThemeConfigStore();

  // Device detection (only if not explicitly provided)
  const [isMobile, setIsMobile] = React.useState<boolean>(deviceView === 'mobile');
  React.useEffect(() => {
    // If explicitly provided, honor it
    if (deviceView) {
      setIsMobile(deviceView === 'mobile');
      return;
    }
    // Sync with editor's device override if present
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('editorDeviceView') : null;
      if (stored === 'mobile') {
        setIsMobile(true);
        return;
      }
    } catch {}
    // Fallback to viewport width
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [deviceView]);

  // Theme colors
  const colorScheme = (themeConfig?.colorSchemes?.schemes?.[parseInt(String(config.colorScheme)) - 1] ?? {}) as { background?: string; text?: string };
  const background = colorScheme.background || '#ffffff';
  const textColor = colorScheme.text || '#000000';

  // Typography
  const headingTypography: React.CSSProperties = themeConfig?.typography?.headings
    ? {
        fontFamily: `'${themeConfig.typography.headings.fontFamily}', sans-serif`,
        fontWeight: themeConfig.typography.headings.fontWeight || '600',
        textTransform: themeConfig.typography.headings.useUppercase ? 'uppercase' : 'none',
        letterSpacing: `${themeConfig.typography.headings.letterSpacing || 0}px`,
      }
    : {};
  const bodyTypography: React.CSSProperties = themeConfig?.typography?.body
    ? {
        fontFamily: `'${themeConfig.typography.body.fontFamily}', sans-serif`,
        fontWeight: themeConfig.typography.body.fontWeight || '400',
        letterSpacing: `${themeConfig.typography.body.letterSpacing || 0}px`,
      }
    : {};
  const buttonTypography: React.CSSProperties = themeConfig?.typography?.buttons
    ? {
        fontFamily: `'${themeConfig.typography.buttons.fontFamily}', sans-serif`,
        fontWeight: themeConfig.typography.buttons.fontWeight || '500',
        textTransform: themeConfig.typography.buttons.useUppercase ? 'uppercase' : 'none',
        letterSpacing: `${themeConfig.typography.buttons.letterSpacing || 0}px`,
      }
    : {};

  const visibleItems: ImageWithTextItem[] = (config.items || []).filter((i) => i.visible);
  const IconsMap = (Icons as unknown) as Record<string, React.ComponentType<any>>;
  const IconComponent = config.icon ? IconsMap[config.icon] ?? null : null;

  const getContainerClasses = () => {
    switch (config.width) {
      case 'small':
        return 'max-w-4xl';
      case 'medium':
        return 'max-w-5xl';
      case 'large':
        return 'max-w-6xl';
      case 'page':
        return 'max-w-full';
      default:
        return 'max-w-5xl';
    }
  };

  const renderMedia = () => {
    if (visibleItems.length === 0) {
      return (
        <div className="bg-gray-100 rounded-lg flex items-center justify-center aspect-square">
          <span className="text-gray-400">No media added</span>
        </div>
      );
    }

    const isCollage = config.imageLayout === 'collage';

    if (isMobile) {
      const effRatio = config.mobileImageRatio ?? config.imageRatio;
      if (isCollage) {
        const ratio = effRatio || 1;
        const base = 160 * ratio;
        const n = visibleItems.length;
        const minH = n <= 2 ? base * 2 : n === 3 ? base * 2.6 : base * 3.2;
        const positions = (count: number) => {
          if (count === 1) return [{ position: 'relative', width: '100%', height: `${base * 1.3}px` }];
          if (count === 2)
            return [
              { position: 'absolute', top: 0, left: 0, width: '64%', height: `${base}px`, zIndex: 1 },
              { position: 'absolute', top: `${base * 0.6}px`, right: 0, width: '72%', height: `${base * 1.15}px`, zIndex: 2 },
            ];
          if (count === 3)
            return [
              { position: 'absolute', top: 0, left: 0, width: '58%', height: `${base * 0.9}px`, zIndex: 1 },
              { position: 'absolute', top: `${base * 0.45}px`, right: 0, width: '64%', height: `${base}px`, zIndex: 2 },
              { position: 'absolute', top: `${base * 1.2}px`, left: '12%', width: '54%', height: `${base * 0.85}px`, zIndex: 3 },
            ];
          return [
            { position: 'absolute', top: 0, left: 0, width: '56%', height: `${base * 0.85}px`, zIndex: 1 },
            { position: 'absolute', top: `${base * 0.5}px`, right: 0, width: '62%', height: `${base * 0.95}px`, zIndex: 2 },
            { position: 'absolute', top: `${base * 1.1}px`, left: '6%', width: '56%', height: `${base * 0.85}px`, zIndex: 3 },
            { position: 'absolute', top: `${base * 1.7}px`, right: '6%', width: '52%', height: `${base * 0.8}px`, zIndex: 4 },
          ];
        };
        const pos = positions(n);
        return (
          <div className="relative w-full mx-auto" style={{ minHeight: `${minH}px`, maxWidth: '100%' }}>
            {visibleItems.map((item, index) => (
              <div
                key={item.id}
                className="overflow-hidden"
                style={{
                  ...(pos[index % pos.length] as any),
                  borderRadius: `${config.imageBorderRadius || 12}px`,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  transform: config.rotateImages ? (index % 2 === 0 ? 'rotate(3deg)' : 'rotate(-3deg)') : 'none',
                }}
              >
                {item.type === 'image' && item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.altText || ''} className="w-full h-full object-cover" />
                ) : item.type === 'video' && item.videoUrl ? (
                  <video src={item.videoUrl} className="w-full h-full object-cover" autoPlay={isEditor} muted loop playsInline />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        );
      }

      // Mobile grid (Shopify-like): handle 1, 2, 3, 4+ items
      const count = visibleItems.length;
      if (count === 1) {
        const item = visibleItems[0];
        return (
          <div className="overflow-hidden" style={{ aspectRatio: effRatio, borderRadius: `${config.imageBorderRadius || 12}px` }}>
            {item.type === 'image' && item.imageUrl ? (
              <img src={item.imageUrl} alt={item.altText || ''} className="w-full h-full object-cover" />
            ) : item.type === 'video' && item.videoUrl ? (
              <video src={item.videoUrl} className="w-full h-full object-cover" autoPlay={isEditor} muted loop playsInline />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
        );
      }
      if (count === 2) {
        return (
          <div className="grid grid-cols-2 gap-2">
            {visibleItems.map((item) => (
              <div key={item.id} className="overflow-hidden" style={{ aspectRatio: effRatio, borderRadius: `${config.imageBorderRadius || 12}px` }}>
                {item.type === 'image' && item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.altText || ''} className="w-full h-full object-cover" />
                ) : item.type === 'video' && item.videoUrl ? (
                  <video src={item.videoUrl} className="w-full h-full object-cover" autoPlay={isEditor} muted loop playsInline />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        );
      }
      if (count === 3) {
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {visibleItems.slice(0, 2).map((item) => (
                <div key={item.id} className="overflow-hidden" style={{ aspectRatio: config.imageRatio, borderRadius: `${config.imageBorderRadius || 12}px` }}>
                  {item.type === 'image' && item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.altText || ''} className="w-full h-full object-cover" />
                  ) : item.type === 'video' && item.videoUrl ? (
                    <video src={item.videoUrl} className="w-full h-full object-cover" autoPlay={isEditor} muted loop playsInline />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="overflow-hidden" style={{ aspectRatio: effRatio, borderRadius: `${config.imageBorderRadius || 12}px` }}>
                {visibleItems[2].type === 'image' && visibleItems[2].imageUrl ? (
                  <img src={visibleItems[2].imageUrl} alt={visibleItems[2].altText || ''} className="w-full h-full object-cover" />
                ) : visibleItems[2].type === 'video' && visibleItems[2].videoUrl ? (
                  <video src={visibleItems[2].videoUrl} className="w-full h-full object-cover" autoPlay={isEditor} muted loop playsInline />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div />
            </div>
          </div>
        );
      }
      // 4 or more
      return (
        <div className="grid grid-cols-2 gap-2">
          {visibleItems.map((item) => (
            <div key={item.id} className="overflow-hidden" style={{ aspectRatio: effRatio, borderRadius: `${config.imageBorderRadius || 12}px` }}>
              {item.type === 'image' && item.imageUrl ? (
                <img src={item.imageUrl} alt={item.altText || ''} className="w-full h-full object-cover" />
              ) : item.type === 'video' && item.videoUrl ? (
                <video src={item.videoUrl} className="w-full h-full object-cover" autoPlay={isEditor} muted loop playsInline />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      );
    }

    // Desktop: special collage or grid
    if (isCollage) {
      const ratio = config.imageRatio || 1;
      const n = visibleItems.length;
      const base = 240 * ratio;
      const minH = n <= 2 ? base * 1.9 : n === 3 ? base * 2.4 : base * 2.9;

      const buildPosition = (index: number): React.CSSProperties => {
        if (n === 1) {
          return { position: 'relative', width: '100%', aspectRatio: ratio };
        }
        if (n === 2) {
          const a = index === 0;
          return a
            ? { position: 'absolute', top: 0, left: 0, width: '72%', height: `${base}px`, zIndex: 1 }
            : { position: 'absolute', top: `${base * 0.85}px`, right: '-8%', width: '84%', height: `${base * 1.15}px`, zIndex: 2 };
        }
        if (n === 3) {
          if (index === 0) return { position: 'absolute', top: 0, left: 0, width: '68%', height: `${base}px`, zIndex: 1 };
          if (index === 1) return { position: 'absolute', top: `${base * 0.7}px`, right: 0, width: '74%', height: `${base * 1.1}px`, zIndex: 2 };
          return { position: 'absolute', top: `${base * 1.45}px`, left: '10%', width: '66%', height: `${base}px`, zIndex: 3 };
        }
        const presets = [
          { top: 0, left: 0, width: '66%', height: `${base}px`, zIndex: 1 },
          { top: `${base * 0.64}px`, right: 0, width: '72%', height: `${base * 1.08}px`, zIndex: 2 },
          { top: `${base * 1.32}px`, left: '6%', width: '66%', height: `${base}px`, zIndex: 3 },
          { top: `${base * 2}px`, right: '6%', width: '60%', height: `${base * 0.92}px`, zIndex: 4 },
        ] as Array<Record<string, any>>;
        return { position: 'absolute', ...(presets[index % presets.length] as any) } as React.CSSProperties;
      };

      return (
        <div className="relative w-full" style={{ minHeight: `${minH}px`, maxWidth: '520px' }}>
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              className="overflow-hidden"
              style={{
                ...buildPosition(index),
                borderRadius: `${config.imageBorderRadius || 12}px`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                transform: config.rotateImages ? (index % 2 === 0 ? 'rotate(3deg)' : 'rotate(-3deg)') : 'none',
              }}
            >
              {item.type === 'image' && item.imageUrl ? (
                <img src={item.imageUrl} alt={item.altText || ''} className="w-full h-full object-cover" />
              ) : item.type === 'video' && item.videoUrl ? (
                <video src={item.videoUrl} className="w-full h-full object-cover" autoPlay={isEditor} muted loop playsInline />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      );
    }

    // Desktop regular grid
    const gridCols = (() => {
      const count = visibleItems.length;
      if (count <= 1) return 'md:grid-cols-1';
      if (count === 2) return 'md:grid-cols-2';
      return count <= 4 ? 'md:grid-cols-2' : 'md:grid-cols-3';
    })();

    return (
      <div className={`grid gap-3 ${gridCols}`}>
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden"
            style={{ aspectRatio: config.imageRatio, borderRadius: `${config.imageBorderRadius || 12}px` }}
          >
            {item.type === 'image' && item.imageUrl ? (
              <img src={item.imageUrl} alt={item.altText || ''} className="w-full h-full object-cover" />
            ) : item.type === 'video' && item.videoUrl ? (
              <video src={item.videoUrl} className="w-full h-full object-cover" autoPlay={isEditor} muted loop playsInline />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const justifyStyle = (align: 'left' | 'center' | 'right') =>
    ({ justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }) as React.CSSProperties;

  const renderButton = (label?: string, style?: 'solid' | 'outline' | 'text') => {
    if (!label) return null;
    const base = 'px-6 py-3 rounded-md transition-colors';
    const cls = style === 'solid' ? `${base} text-white` : style === 'outline' ? `${base} border-2` : `${base} underline`;
    const btnStyle: React.CSSProperties = {
      backgroundColor: style === 'solid' ? textColor : 'transparent',
      borderColor: style === 'outline' ? textColor : 'transparent',
      color: style === 'solid' ? background : textColor,
      ...buttonTypography,
    };
    return (
      <button className={cls} style={btnStyle}>
        {label}
      </button>
    );
  };

  const renderTextContent = (mobile: boolean) => (
    <div
      className={mobile ? undefined : 'flex-1'}
      style={mobile ? { textAlign: config.contentAlignment as React.CSSProperties['textAlign'] } : { maxWidth: `${config.desktopWidth}px`, textAlign: config.contentAlignment as any }}
    >
      {IconComponent ? (
        <div className="mb-4" style={{ color: textColor }}>{React.createElement(IconComponent, { className: 'w-8 h-8' })}</div>
      ) : null}

      {config.subheading ? <p className="text-sm uppercase tracking-wider mb-2 opacity-75">{config.subheading}</p> : null}

      {config.heading ? (
        <h2 className="font-bold mb-4" style={{ fontSize: `${config.headingSize}px`, ...headingTypography }}>
          {config.heading}
        </h2>
      ) : null}

      {config.body ? (
        <p className="mb-6 opacity-90" style={{ fontSize: `${config.bodySize}px`, ...bodyTypography }}>
          {config.body}
        </p>
      ) : null}

      <div
        className="flex gap-3"
        style={(
          mobile ? { justifyContent: 'center' } : justifyStyle(config.contentAlignment)
        ) as React.CSSProperties}
      >
        {renderButton(config.firstButtonLabel, config.firstButtonStyle)}
        {renderButton(config.secondButtonLabel, config.secondButtonStyle)}
      </div>
    </div>
  );

  if (!config.enabled) return null;

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: background,
        color: textColor,
        paddingTop: `${config.topPadding}px`,
        paddingBottom: `${config.bottomPadding}px`,
        paddingLeft: config.addSidePaddings ? '20px' : '0',
        paddingRight: config.addSidePaddings ? '20px' : '0',
      }}
    >
      <div className={`mx-auto ${getContainerClasses()}`}>
        {isMobile ? (
          <div className="flex flex-col gap-6">
            <div className="w-full">{renderMedia()}</div>
            {renderTextContent(true)}
          </div>
        ) : (
          <div className={`flex gap-12 items-stretch ${config.contentLayout === 'right' ? 'flex-row-reverse' : ''}`}>
            {renderTextContent(false)}
            <div className={`flex-1 ${config.imageLayout === 'collage' ? 'flex justify-center' : ''}`}>{renderMedia()}</div>
          </div>
        )}
      </div>
    </section>
  );
}
