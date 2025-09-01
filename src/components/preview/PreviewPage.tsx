'use client';

import React, { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api-url';
import { PageType } from '@/types/editor.types';
import PreviewHeader from './PreviewHeader';
import PreviewFooter from './PreviewFooter';
import PreviewContent from './PreviewContent';
import PreviewAnnouncementBar from './PreviewAnnouncementBar';
import PreviewImageBanner from './PreviewImageBanner';

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
}

export default function PreviewPage({ pageType, handle, roomSlug }: PreviewPageProps) {
  const [structuralComponents, setStructuralComponents] = useState<StructuralComponents>({});
  const [globalTheme, setGlobalTheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [editorDeviceView, setEditorDeviceView] = useState<'desktop' | 'mobile' | undefined>(undefined);
  // Temporary migration: map legacy 'custom' handle to 'habitaciones' slug only for CUSTOM page type
  const effectiveHandle = pageType === PageType.CUSTOM && handle === 'custom' ? 'habitaciones' : handle;

  useEffect(() => {
    // Get company ID from localStorage or use default
    // In production, this would come from the domain or subdomain
    const storedCompanyId = localStorage.getItem('companyId');
    const id = storedCompanyId ? parseInt(storedCompanyId) : 1; // Default to company 1 for now
    console.log('Setting company ID from localStorage:', storedCompanyId, '-> using:', id);
    setCompanyId(id);
    
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
          };

          // Fallback: try to fetch published ImageBanner config directly if not present in DTO
          if (!parsedComponents.imageBanner) {
            try {
              const imageBannerUrl = `${apiUrl}/structural-components/company/${companyId}/imagebanner/published`;
              console.log('Fetching image banner (published) from:', imageBannerUrl);
              const ibRes = await fetch(imageBannerUrl);
              if (ibRes.ok) {
                // Controller returns a JSON string, not an object
                const ibConfigString = await ibRes.text();
                const ibConfig = ibConfigString ? JSON.parse(ibConfigString) : null;
                if (ibConfig) {
                  parsedComponents.imageBanner = ibConfig;
                }
              } else {
                console.log('No published image banner available (status):', ibRes.status);
              }
            } catch (e) {
              console.warn('Failed to fetch published image banner config:', e);
            }
          }
          console.log('Parsed structural components:', parsedComponents);
          setStructuralComponents(parsedComponents);
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
    <div className="min-h-screen" style={{...themeStyles, overflowY: 'auto', height: '100vh'}}>
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

      {/* Image Banner (structural fallback) - if configured via published endpoint */}
      {structuralComponents.imageBanner && (
        <PreviewImageBanner 
          config={structuralComponents.imageBanner}
          theme={globalTheme}
          isEditor={false}
          deviceView={editorDeviceView}
          pageType={pageType as unknown as string}
        />
      )}

      {/* Page Content */}
      <main className="flex-1">
        <PreviewContent 
          pageType={pageType} 
          handle={effectiveHandle}
          theme={globalTheme}
          companyId={companyId || undefined}
          deviceView={editorDeviceView}
          roomSlug={roomSlug}
        />
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

      {/* Cart Drawer - if configured */}
      {structuralComponents.cartDrawer && (
        <div id="cart-drawer">
          {/* Will be implemented when CartDrawer editor is ready */}
        </div>
      )}
    </div>
  );
}
