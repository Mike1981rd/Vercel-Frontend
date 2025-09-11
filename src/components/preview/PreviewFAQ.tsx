/**
 * @file PreviewFAQ.tsx
 * @max-lines 400
 * @module FAQ
 * @description Componente Preview UNIFICADO para editor y preview real con accordion
 * @unified-architecture true
 * @created 2025-08-18
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, ChevronRight, ChevronLeft, CheckCircle, Info, HelpCircle, Star, Heart, Bell, Flag, Bookmark, Tag } from 'lucide-react';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { FAQConfig } from '@/components/editor/modules/FAQ/types';

interface PreviewFAQProps {
  config: FAQConfig;
  theme?: any;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
}

export default function PreviewFAQ({ 
  config, 
  theme,
  deviceView,
  isEditor = false
}: PreviewFAQProps) {
  // Debug para preview real
  if (!isEditor) {
    // console.log('[DEBUG] PreviewFAQ - config received:', config);
  }

  // Theme dual (prop o store)
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;

  // Detección móvil canónica
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

  // Estado de items expandidos
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    if (config?.expandFirstTab && config?.items?.length > 0) {
      return [config.items[0].id];
    }
    return [];
  });

  // Color scheme (estructura plana)
  const colorScheme = useMemo(() => {
    if (!themeConfig?.colorSchemes?.schemes) {
      return {
        text: '#000000',
        background: '#FFFFFF',
        solidButton: '#000000',
        solidButtonText: '#FFFFFF',
        outlineButton: '#000000',
        outlineButtonText: '#000000',
      };
    }
    const schemeIndex = parseInt(config.colorScheme || '1') - 1;
    const selectedScheme = themeConfig.colorSchemes.schemes[schemeIndex];
    return selectedScheme || themeConfig.colorSchemes.schemes[0];
  }, [themeConfig, config.colorScheme]);

  // Tipografía
  const headingTypographyStyles = useMemo(() => {
    if (!themeConfig?.typography?.headings) return {} as React.CSSProperties;
    const typography = themeConfig.typography.headings;
    return {
      fontFamily: `'${typography.fontFamily}', sans-serif`,
      fontWeight: typography.fontWeight || '700',
      textTransform: typography.useUppercase ? 'uppercase' : 'none',
      fontSize: typography.fontSize
        ? (typography.fontSize <= 100 ? `${typography.fontSize}%` : `${typography.fontSize}px`)
        : '100%',
      letterSpacing: `${typography.letterSpacing || 0}px`
    } as React.CSSProperties;
  }, [themeConfig?.typography?.headings]);

  const bodyTypographyStyles = useMemo(() => {
    if (!themeConfig?.typography?.body) return {} as React.CSSProperties;
    const typography = themeConfig.typography.body;
    return {
      fontFamily: `'${typography.fontFamily}', sans-serif`,
      fontWeight: typography.fontWeight || '400',
      textTransform: typography.useUppercase ? 'uppercase' : 'none',
      fontSize: typography.fontSize
        ? (typography.fontSize <= 100 ? `${typography.fontSize}%` : `${typography.fontSize}px`)
        : '100%',
      letterSpacing: `${typography.letterSpacing || 0}px`
    } as React.CSSProperties;
  }, [themeConfig?.typography?.body]);

  const getHeadingClass = (size: string) => {
    const sizeMap: Record<string, string> = {
      heading_1: isMobile ? 'text-3xl' : 'text-5xl',
      heading_2: isMobile ? 'text-2xl' : 'text-4xl',
      heading_3: isMobile ? 'text-xl' : 'text-3xl',
      heading_4: isMobile ? 'text-lg' : 'text-2xl',
      heading_5: isMobile ? 'text-base' : 'text-xl',
      heading_6: isMobile ? 'text-sm' : 'text-lg',
    };
    return sizeMap[size] || sizeMap['heading_3'];
  };
  const getBodyClass = (size: string) => {
    const sizeMap: Record<string, string> = {
      body_1: isMobile ? 'text-lg' : 'text-xl',
      body_2: isMobile ? 'text-base' : 'text-lg',
      body_3: isMobile ? 'text-sm' : 'text-base',
      body_4: isMobile ? 'text-xs' : 'text-sm',
      body_5: isMobile ? 'text-xs' : 'text-xs',
    };
    return sizeMap[size] || sizeMap['body_3'];
  };
  const mapWeight = (w?: 'light'|'normal'|'medium'|'semibold'|'bold') => (
    w === 'light' ? 300 : w === 'normal' ? 400 : w === 'medium' ? 500 : w === 'semibold' ? 600 : w === 'bold' ? 700 : undefined
  );

  // Validación enabled
  if (config?.enabled === false && !isEditor) {
    return null;
  }

  // Helpers
  const containerClass = isMobile ? 'px-4' : 'px-8';
  const spacing = isMobile ? 'gap-4' : 'gap-6';
  const widthClasses: Record<string, string> = {
    screen: 'w-full',
    page: 'max-w-7xl mx-auto',
    large: 'max-w-5xl mx-auto',
    medium: 'max-w-3xl mx-auto',
    small: 'max-w-2xl mx-auto',
    extra_small: 'max-w-xl mx-auto',
  };
  const getButtonStyles = () => {
    const base = 'px-6 py-3 rounded-md transition-colors font-medium';
    switch (config.button?.style) {
      case 'solid': return `${base} text-white`;
      case 'outline': return `${base} border-2`;
      case 'text': return `${base} hover:underline`;
      default: return base;
    }
  };
  const getCollapser = (expanded: boolean) => {
    switch (config.collapserStyle) {
      case 'chevron': return expanded ? <ChevronUp className="w-5 h-5" style={{ color: colorScheme.text || '#000' }} /> : <ChevronDown className="w-5 h-5" style={{ color: colorScheme.text || '#000' }} />;
      case 'caret': return expanded ? <ChevronLeft className="w-5 h-5 rotate-90" style={{ color: colorScheme.text || '#000' }} /> : <ChevronRight className="w-5 h-5" style={{ color: colorScheme.text || '#000' }} />;
      case 'none': return null;
      case 'plus_minus':
      default: return expanded ? <Minus className="w-5 h-5" style={{ color: colorScheme.text || '#000' }} /> : <Plus className="w-5 h-5" style={{ color: colorScheme.text || '#000' }} />;
    }
  };
  const renderIcon = (icon?: string, customIcon?: string) => {
    if (customIcon) return <img src={customIcon} alt="" className="w-6 h-6" />;
    if (!icon || icon === 'none') return null;
    const color = colorScheme.text || '#000000';
    switch (icon) {
      case 'check-circle': return <CheckCircle className="w-6 h-6" style={{ color }} />;
      case 'info-circle': return <Info className="w-6 h-6" style={{ color }} />;
      case 'question-circle': return <HelpCircle className="w-6 h-6" style={{ color }} />;
      case 'star': return <Star className="w-6 h-6" style={{ color }} />;
      case 'heart': return <Heart className="w-6 h-6" style={{ color }} />;
      case 'bell': return <Bell className="w-6 h-6" style={{ color }} />;
      case 'flag': return <Flag className="w-6 h-6" style={{ color }} />;
      case 'bookmark': return <Bookmark className="w-6 h-6" style={{ color }} />;
      case 'tag': return <Tag className="w-6 h-6" style={{ color }} />;
      default: return null;
    }
  };

  const visibleItems = (config?.items || []).filter(i => i.visible);
  const visibleCategories = (config?.categories || []).filter(c => c.visible !== false);

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  const renderTabsBottom = () => {
    if (visibleCategories.length > 0) {
      return (
        <div className={`${spacing}`}>
          {visibleCategories.map(cat => (
            <div key={cat.id} className="mb-6">
              {cat.title && (
                <div className={`mb-2 ${cat.alignment === 'center' ? 'text-center' : cat.alignment === 'right' ? 'text-right' : 'text-left'}`}
                     style={{ ...headingTypographyStyles, fontWeight: mapWeight(config.headingWeight) ?? (headingTypographyStyles as any).fontWeight }}>
                  {cat.title}
                </div>
              )}
              {(visibleItems.filter(i => i.categoryId === cat.id)).map(item => (
                <div key={item.id} className="border-b border-gray-200 dark:border-gray-700" style={{ borderColor: config.colorTabs !== 'none' ? (colorScheme.text || '#000') + '20' : 'transparent' }}>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full py-4 flex items-center justify-between text-left transition-all duration-200"
                    onMouseEnter={(e) => { const hover = colorScheme.text || '#000'; e.currentTarget.style.backgroundColor = (config.colorTabs === 'all' || config.colorTabs === 'all_separately') ? `${hover}10` : 'transparent'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="w-6 h-6 inline-flex items-center justify-center">{renderIcon(item.icon, item.customIcon)}</span>
                      <span className={`${isMobile ? 'text-base' : 'text-lg'}`}
                        style={{ color: colorScheme.text || '#000', ...headingTypographyStyles, fontSize: undefined, fontWeight: mapWeight(config.headingWeight) ?? (headingTypographyStyles as any).fontWeight }}>
                        {item.heading}
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">{getCollapser(expandedItems.includes(item.id))}</div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedItems.includes(item.id) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pb-4 px-4">
                      <div className={`${isMobile ? 'flex-col' : 'flex'} gap-6`}>
                        <div className="flex-1">
                          <div className={`${getBodyClass(config.bodySize)} prose prose-gray max-w-none`}
                            style={{ color: colorScheme.text || '#000', ...bodyTypographyStyles, fontWeight: mapWeight(config.bodyWeight) ?? (bodyTypographyStyles as any).fontWeight, fontSize: undefined }}
                            dangerouslySetInnerHTML={{ __html: item.source }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    // Sin categorías
    return (
      <div className={`${spacing}`}>
        {visibleItems.map(item => (
          <div key={item.id} className="border-b border-gray-200 dark:border-gray-700" style={{ borderColor: config.colorTabs !== 'none' ? (colorScheme.text || '#000') + '20' : 'transparent' }}>
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full py-4 flex items-center justify-between text-left transition-all duration-200"
              onMouseEnter={(e) => { const hover = colorScheme.text || '#000'; e.currentTarget.style.backgroundColor = (config.colorTabs === 'all' || config.colorTabs === 'all_separately') ? `${hover}10` : 'transparent'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="w-6 h-6 inline-flex items-center justify-center">{renderIcon(item.icon, item.customIcon)}</span>
                <span className={`${isMobile ? 'text-base' : 'text-lg'}`}
                  style={{ color: colorScheme.text || '#000', ...headingTypographyStyles, fontSize: undefined, fontWeight: mapWeight(config.headingWeight) ?? (headingTypographyStyles as any).fontWeight }}>
                  {item.heading}
                </span>
              </div>
              <div className="ml-4 flex-shrink-0">{getCollapser(expandedItems.includes(item.id))}</div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${expandedItems.includes(item.id) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pb-4 px-4">
                <div className={`${isMobile ? 'flex-col' : 'flex'} gap-6`}>
                  <div className="flex-1">
                    <div className={`${getBodyClass(config.bodySize)} prose prose-gray max-w-none`}
                      style={{ color: colorScheme.text || '#000', ...bodyTypographyStyles, fontWeight: mapWeight(config.bodyWeight) ?? (bodyTypographyStyles as any).fontWeight, fontSize: undefined }}
                      dangerouslySetInnerHTML={{ __html: item.source }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  useEffect(() => {
    if (config.layout === 'tabs_left' || config.layout === 'tabs_right') {
      const first = visibleItems.find(i => i.visible);
      setSelectedItemId(first ? first.id : null);
    }
  }, [config.layout, visibleItems.length]);

  const renderTabbedLeftRight = () => (
    <div className={`${isMobile ? '' : 'grid grid-cols-12 gap-8'}`}>
      {config.layout === 'tabs_left' && (
        <div className={`${isMobile ? 'mb-6' : 'col-span-4'}`}>
          <div className="space-y-2">
            {visibleItems.map(item => {
              const isActive = item.id === selectedItemId;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3`}
                  style={{
                    backgroundColor: (
                      config.colorTabs === 'categories' ||
                      config.colorTabs === 'all' ||
                      config.colorTabs === 'all_separately'
                    ) && isActive ? (colorScheme.text || '#000') + '10' : 'transparent',
                    color: colorScheme.text || '#000',
                    border: (config.colorTabs === 'categories' || config.colorTabs === 'all' || config.colorTabs === 'all_separately') ? `1px solid ${(colorScheme.text || '#000') + '20'}` : 'none'
                  }}
                >
                  <span className="w-6 h-6 inline-flex items-center justify-center">{renderIcon(item.icon, item.customIcon)}</span>
                  <span className={`${isMobile ? 'text-base' : 'text-lg'}`}
                    style={{ ...headingTypographyStyles, fontSize: undefined, fontWeight: mapWeight(config.headingWeight) ?? (headingTypographyStyles as any).fontWeight }}>
                    {item.heading}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content panel */}
      <div className={`${isMobile ? '' : 'col-span-8'}`}>
        <div className="rounded-md"
          style={{ backgroundColor: (config.colorTabs === 'content_tabs' || config.colorTabs === 'all' || config.colorTabs === 'content_tabs_separately') ? (colorScheme.text || '#000') + '08' : 'transparent' }}>
          {visibleItems.map(item => (
            <div key={item.id} className="border-b last:border-b-0" style={{ borderColor: (colorScheme.text || '#000') + '20' }}>
              <button onClick={() => toggleItem(item.id)} className="w-full px-4 py-3 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 inline-flex items-center justify-center">{renderIcon(item.icon, item.customIcon)}</span>
                  <span className={`${isMobile ? 'text-base' : 'text-xl'}`}
                    style={{ color: colorScheme.text || '#000', ...headingTypographyStyles, fontSize: undefined, fontWeight: mapWeight(config.headingWeight) ?? (headingTypographyStyles as any).fontWeight }}>
                    {item.heading}
                  </span>
                </div>
                <div className="ml-4 flex-shrink-0">{getCollapser(expandedItems.includes(item.id))}</div>
              </button>
              <div className={`${expandedItems.includes(item.id) ? 'block' : 'hidden'}`}>
                <div className="px-4 pb-4">
                  <div className={`${getBodyClass(config.bodySize)} prose prose-gray max-w-none`}
                    style={{ color: colorScheme.text || '#000', ...bodyTypographyStyles, fontWeight: mapWeight(config.bodyWeight) ?? (bodyTypographyStyles as any).fontWeight }}
                    dangerouslySetInnerHTML={{ __html: item.source }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {config.layout === 'tabs_right' && (
        <div className={`${isMobile ? 'mt-6' : 'col-span-4'}`}>
          <div className="space-y-2">
            {visibleItems.map(item => {
              const isActive = item.id === selectedItemId;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3`}
                  style={{
                    backgroundColor: (
                      config.colorTabs === 'categories' ||
                      config.colorTabs === 'all' ||
                      config.colorTabs === 'all_separately'
                    ) && isActive ? (colorScheme.text || '#000') + '10' : 'transparent',
                    color: colorScheme.text || '#000',
                    border: (config.colorTabs === 'categories' || config.colorTabs === 'all' || config.colorTabs === 'all_separately') ? `1px solid ${(colorScheme.text || '#000') + '20'}` : 'none'
                  }}
                >
                  <span className="w-6 h-6 inline-flex items-center justify-center">{renderIcon(item.icon, item.customIcon)}</span>
                  <span className={`${isMobile ? 'text-base' : 'text-lg'}`}
                    style={{ ...headingTypographyStyles, fontSize: undefined, fontWeight: mapWeight(config.headingWeight) ?? (headingTypographyStyles as any).fontWeight }}>
                    {item.heading}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section
      className={`${config.addSidePaddings ? containerClass : ''}`}
      style={{
        paddingTop: `${isMobile ? 20 : config.topPadding}px`,
        paddingBottom: `${isMobile ? 20 : config.bottomPadding}px`,
        backgroundColor: config.colorBackground ? (colorScheme.background || '#FFFFFF') : 'transparent',
      }}
    >
      <div className={`${widthClasses[config.width || 'page']} ${containerClass}`}>
        <div className={spacing}>
          {(config.heading || config.body) && (
            <div className="text-center mb-8">
              {config.heading && (
                <h2 className={`${getHeadingClass(config.headingSize)} mb-3`}
                  style={{ color: colorScheme.text || '#000', ...headingTypographyStyles, fontSize: undefined, fontWeight: mapWeight(config.headingWeight) ?? (headingTypographyStyles as any).fontWeight }}>
                  {config.heading}
                </h2>
              )}
              {config.body && (
                <div className={`${getBodyClass(config.bodySize)} max-w-3xl mx-auto`}
                  style={{ color: colorScheme.text || '#000', ...bodyTypographyStyles, fontSize: undefined, fontWeight: mapWeight(config.bodyWeight) ?? (bodyTypographyStyles as any).fontWeight }}
                  dangerouslySetInnerHTML={{ __html: config.body }}
                />
              )}
              {config.button?.label && (
                <div className="mt-6">
                  {config.button.link ? (
                    <a href={config.button.link} className={getButtonStyles()}
                      style={{
                        backgroundColor: config.button.style === 'solid' ? (colorScheme.solidButton || '#000') : 'transparent',
                        color: config.button.style === 'solid' ? (colorScheme.solidButtonText || '#FFF') : (config.button.style === 'outline' ? (colorScheme.outlineButtonText || colorScheme.text || '#000') : (colorScheme.text || '#000')),
                        borderColor: config.button.style === 'outline' ? (colorScheme.outlineButton || colorScheme.text || '#000') : 'transparent',
                        borderWidth: config.button.style === 'outline' ? 2 : 0
                      }}
                    >
                      {config.button.label}
                    </a>
                  ) : (
                    <button className={getButtonStyles()}
                      style={{
                        backgroundColor: config.button.style === 'solid' ? (colorScheme.solidButton || '#000') : 'transparent',
                        color: config.button.style === 'solid' ? (colorScheme.solidButtonText || '#FFF') : (config.button.style === 'outline' ? (colorScheme.outlineButtonText || colorScheme.text || '#000') : (colorScheme.text || '#000')),
                        borderColor: config.button.style === 'outline' ? (colorScheme.outlineButton || colorScheme.text || '#000') : 'transparent',
                        borderWidth: config.button.style === 'outline' ? 2 : 0
                      }}
                    >
                      {config.button.label}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {config.layout === 'tabs_bottom' ? renderTabsBottom() : renderTabbedLeftRight()}
        </div>
      </div>

      {config.customCss && <style dangerouslySetInnerHTML={{ __html: config.customCss }} />}
    </section>
  );
}
