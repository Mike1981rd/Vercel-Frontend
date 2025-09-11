'use client';

import React, { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api-url';
import { PageType } from '@/types/editor.types';
import PreviewHeader from './PreviewHeader';
import PreviewFooter from './PreviewFooter';
import PreviewContent from './PreviewContent';
import ContactFormEnhancer from '@/components/notifications/ContactFormEnhancer';
import PreviewAnnouncementBar from './PreviewAnnouncementBar';
import PreviewWhatsAppWidgetV2 from './PreviewWhatsAppWidgetV2';

interface PreviewPageProps {
  pageType: PageType;
  handle: string;
  roomSlug?: string; // Optional room slug for individual room pages
}

interface StructuralComponents {
  header?: any;
  footer?: any;
  announcementBar?: any;
  imageBanner?: any;
  cartDrawer?: any;
  whatsAppWidget?: any;
}

export default function PreviewPage({ pageType, handle, roomSlug }: PreviewPageProps) {
  const [structuralComponents, setStructuralComponents] = useState<StructuralComponents>({});
  const [globalTheme, setGlobalTheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<number | null>(1); // Single-company mode
  const [editorDeviceView, setEditorDeviceView] = useState<'desktop' | 'mobile' | undefined>(undefined);
  // Temporary migration: map legacy 'custom' handle to 'habitaciones' slug only for CUSTOM page type
  const effectiveHandle = pageType === PageType.CUSTOM && handle === 'custom' ? 'habitaciones' : handle;

  useEffect(() => {
    // Single-company deployment: force companyId = 1
    setCompanyId(1);
    
    // Get editor device view for synchronization
    const storedDeviceView = localStorage.getItem('editorDeviceView');
    // Only honor explicit mobile override; desktop should use real viewport
    if (storedDeviceView === 'mobile') {
      setEditorDeviceView('mobile');
    } else {
      setEditorDeviceView(undefined);
    }
    
    // Listen for storage changes to sync with editor
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'editorDeviceView') {
        // Only apply override when mobile; otherwise remove override
        if (e.newValue === 'mobile') {
          setEditorDeviceView('mobile');
        } else {
          setEditorDeviceView(undefined);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const loadConfiguration = async () => {
      console.log('Loading configuration for company ID:', companyId);
      if (!companyId) {
        console.log('No company ID, skipping load');
        return;
      }

      try {
        const apiUrl = getApiUrl();
        const apiOrigin = (() => {
          try { return new URL(apiUrl).origin; } catch { return apiUrl.replace(/\/?api$/, ''); }
        })();
        const structuralUrl = `${apiUrl}/structural-components/company/${companyId}/published`;
        const themeUrl = `${apiUrl}/global-theme-config/company/${companyId}/published`;
        console.log('Fetching structural components from:', structuralUrl);
        
        const [structuralResponse, themeResponse] = await Promise.all([
          fetch(structuralUrl, { cache: 'no-store' }),
          fetch(themeUrl, { cache: 'no-store' })
        ]);

        if (structuralResponse.ok) {
          const data = await structuralResponse.json();
          console.log('Raw structural data:', data);
          console.log('ImageBanner field exists?:', 'imageBannerConfig' in data);
          console.log('ImageBanner value:', data.imageBannerConfig);
          
          // Parse the JSON strings from the API response
          const parsedComponents = {
            header: data.headerConfig ? JSON.parse(data.headerConfig) : null,
            footer: data.footerConfig ? JSON.parse(data.footerConfig) : null,
            announcementBar: data.announcementBarConfig ? JSON.parse(data.announcementBarConfig) : null,
            imageBanner: data.imageBannerConfig ? JSON.parse(data.imageBannerConfig) : null,
            cartDrawer: data.cartDrawerConfig ? JSON.parse(data.cartDrawerConfig) : null,
            whatsAppWidget: data.whatsAppWidgetConfig ? JSON.parse(data.whatsAppWidgetConfig) : null,
          } as StructuralComponents;

          // Normalize dev/local/insecure media URLs to API origin for production
          const isPrivateIp = (host: string) => {
            // 10.0.0.0/8
            if (/^10\./.test(host)) return true;
            // 172.16.0.0/12
            if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return true;
            // 192.168.0.0/16
            if (/^192\.168\./.test(host)) return true;
            return false;
          };

          const normalizeMediaUrls = (obj: any): any => {
            if (!obj) return obj;
            if (typeof obj === 'string') {
              try {
                // If it's a URL, rebase dev/local/insecure hosts to apiOrigin
                const u = new URL(obj);
                const host = u.hostname.toLowerCase();
                const isDevHost = host === 'localhost' || host === '127.0.0.1' || isPrivateIp(host);
                if (isDevHost || u.protocol === 'http:') {
                  return `${apiOrigin}${u.pathname}${u.search}${u.hash}`;
                }
                return obj;
              } catch {
                // Not a URL → leave as-is
                return obj;
              }
            }
            if (Array.isArray(obj)) {
              return obj.map(normalizeMediaUrls);
            }
            if (typeof obj === 'object') {
              const out: any = Array.isArray(obj) ? [] : {};
              for (const k of Object.keys(obj)) {
                out[k] = normalizeMediaUrls(obj[k]);
              }
              return out;
            }
            return obj;
          };

          // Removed structural ImageBanner fallback: ImageBanner should render only as a page section
          const normalized = {
            header: normalizeMediaUrls(parsedComponents.header),
            footer: normalizeMediaUrls(parsedComponents.footer),
            announcementBar: normalizeMediaUrls(parsedComponents.announcementBar),
            imageBanner: normalizeMediaUrls(parsedComponents.imageBanner),
            cartDrawer: normalizeMediaUrls(parsedComponents.cartDrawer),
            whatsAppWidget: normalizeMediaUrls(parsedComponents.whatsAppWidget),
          } as StructuralComponents;

          console.log('Parsed structural components:', normalized);
          setStructuralComponents(normalized);
        } else {
          console.error('Failed to load structural components:', structuralResponse.statusText);
        }

        if (themeResponse.ok) {
          const data = await themeResponse.json();
          setGlobalTheme(data);
        }
      } catch (error) {
        console.error('Error loading preview configuration:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfiguration();
  }, [companyId]);

  if (loading || !companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando vista previa...</p>
        </div>
      </div>
    );
  }

  // Apply global theme styles
  const themeStyles = globalTheme ? {
    '--page-width': globalTheme.appearance?.pageWidth || '1440px',
    '--content-padding': globalTheme.appearance?.contentPadding || '20px',
    '--border-radius': globalTheme.appearance?.borderRadius || '8px',
  } as React.CSSProperties : {};

  // console.log('Rendering preview with:', {
  //   loading,
  //   hasHeader: !!structuralComponents.header,
  //   headerConfig: structuralComponents.header,
  //   hasTheme: !!globalTheme
  // });

  return (
    <div className="min-h-screen" style={{...themeStyles}}>
      {/* Announcement Bar - if configured and should show on this page */}
      {structuralComponents.announcementBar && (
        <PreviewAnnouncementBar 
          config={structuralComponents.announcementBar} 
          theme={globalTheme}
          pageType={pageType}
          deviceView={editorDeviceView}
        />
      )}

      {/* Header - if configured */}
      {structuralComponents.header ? (
        <PreviewHeader 
          config={structuralComponents.header} 
          theme={globalTheme}
          deviceView={editorDeviceView}
        />
      ) : (
        null
      )}

      {/* Structural ImageBanner fallback removed: ImageBanner now renders only when added as a section */}

      {/* Page Content (wrapped to enhance contact forms automatically) */}
      <main className="flex-1">
        <ContactFormEnhancer autoEnhance={true}>
          <PreviewContent 
            pageType={pageType} 
            handle={effectiveHandle}
            theme={globalTheme}
            companyId={companyId || undefined}
            deviceView={editorDeviceView}
            roomSlug={roomSlug}
          />
        </ContactFormEnhancer>
      </main>

      {/* Footer - if configured */}
      {structuralComponents.footer && (
        <PreviewFooter 
          config={structuralComponents.footer} 
          theme={globalTheme}
          deviceView={editorDeviceView}
          isEditor={false}
        />
      )}

      {/* WhatsApp Widget - if configured */}
      {structuralComponents.whatsAppWidget && (
        <PreviewWhatsAppWidgetV2
          config={structuralComponents.whatsAppWidget}
          theme={globalTheme}
          deviceView={editorDeviceView}
          isEditor={false}
        />
      )}

      {/* Cart Drawer - if configured */}
      {structuralComponents.cartDrawer && (
        <div id="cart-drawer">
          {/* Will be implemented when CartDrawer editor is ready */}
        </div>
      )}
    </div>
  );
}
