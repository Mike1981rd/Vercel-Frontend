'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PageType, Section, SectionType } from '@/types/editor.types';
import { getApiUrl } from '@/lib/api-url';
import PreviewImageBanner from './PreviewImageBanner';
import PreviewSlideshow from './PreviewSlideshow';
import PreviewMulticolumns from './PreviewMulticolumns';
import PreviewGallery from './PreviewGallery';
import PreviewImageWithText from '../editor/modules/ImageWithText/PreviewImageWithText';
import PreviewFeaturedCollection from './PreviewFeaturedCollection';
import PreviewFAQ from './PreviewFAQ';
import PreviewTestimonials from './PreviewTestimonials';
import PreviewRichText from './PreviewRichText';
import PreviewNewsletter from './PreviewNewsletter';
import PreviewContactForm from './PreviewContactForm';
import PreviewRoomGallery from './PreviewRoomGallery';
import PreviewRoomTitleHost from './PreviewRoomTitleHost';
import PreviewRoomHighlights from './PreviewRoomHighlights';
import PreviewRoomDescription from './PreviewRoomDescription';
import PreviewRoomAmenities from './PreviewRoomAmenities';
import PreviewRoomSleeping from './PreviewRoomSleeping';
import PreviewRoomReviews from './PreviewRoomReviews';
import PreviewRoomMap from './PreviewRoomMap';
import PreviewRoomCalendar from './PreviewRoomCalendar';
import PreviewRoomHostCard from './PreviewRoomHostCard';
import PreviewRoomThings from './modules/RoomThingsPreview';

interface PreviewContentProps {
  pageType: PageType;
  handle: string;
  theme: any;
  companyId?: number;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  roomSlug?: string; // Optional room slug for individual room pages
}

export default function PreviewContent({ pageType, handle, theme, companyId, deviceView, roomSlug }: PreviewContentProps) {
  // DO NOT normalize or coalesce deviceView - pass it through as-is per documentation
  // However, transform tablet to desktop for components that don't support tablet
  const normalizedDeviceView: 'desktop' | 'mobile' | undefined = deviceView === 'tablet' ? 'desktop' : deviceView as 'desktop' | 'mobile' | undefined;
  const [sections, setSections] = useState<Section[]>([]);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPageSections = async () => {
      // Get company ID from localStorage if not provided
      const effectiveCompanyId = companyId || parseInt(localStorage.getItem('companyId') || '1');
      if (!effectiveCompanyId) return;

      // If we have a roomSlug, store it in localStorage for room components to use
      if (roomSlug) {
        localStorage.setItem('currentRoomSlug', roomSlug);
      } else {
        // Clear if no specific room is selected
        localStorage.removeItem('currentRoomSlug');
      }

      // First, try to load from localStorage (for real-time preview sync) by page type
      const pageKey = `page_sections_${pageType.toLowerCase()}`;
      const localSections = localStorage.getItem(pageKey);
      
      if (localSections) {
        try {
          const parsedLocalSections = JSON.parse(localSections);
          setSections(parsedLocalSections);
          setLoading(false);
          return; // Use localStorage data if available
        } catch (e) {
          console.error('Error parsing localStorage sections:', e);
        }
      }

      try {
        // Try to load page by slug/handle.
        // Migration fallback to 'custom' only when the incoming handle is literally 'custom'.
        const handlesToTry = pageType === PageType.CUSTOM
          ? (handle === 'custom' ? ['habitaciones', 'custom'] : [handle])
          : [handle];

        let loaded = false;
        for (const h of handlesToTry) {
          console.log('[DEBUG] Loading snapshot with handle:', h, 'for company:', effectiveCompanyId);
          const snapshotResponse = await fetch(
            `${getApiUrl()}/website/${effectiveCompanyId}/snapshot/${h}`,
            { cache: 'no-store' }
          );
          console.log('[DEBUG] Snapshot response status:', snapshotResponse.status);
          if (!snapshotResponse.ok) continue;
          const snapshot = await snapshotResponse.json();
          // Expecting shape: { sections: [...] } inside SnapshotData or flattened by API
          const rawSections = snapshot?.sections || snapshot?.SnapshotData?.sections || snapshot?.snapshotData?.sections;
          if (rawSections) {
            const parsedSections = typeof rawSections === 'string' ? JSON.parse(rawSections) : rawSections;
            setPageData({ handle: h });
            setSections(parsedSections);
            loaded = true;
            break;
          }
        }

        if (!loaded) {
          // If we are on a room detail (roomSlug present) and no snapshot sections are available,
          // render a sensible default room template so the page is not empty in production.
          if (pageType === PageType.CUSTOM && roomSlug) {
            const defaults: Section[] = [
              { id: 'room_gallery_default', type: SectionType.ROOM_GALLERY, name: 'Room Gallery', visible: true, settings: { enabled: true, layoutStyle: 'airbnb' }, sortOrder: 1 },
              { id: 'room_title_host_default', type: SectionType.ROOM_TITLE_HOST, name: 'Title & Host', visible: true, settings: { enabled: true }, sortOrder: 2 },
              { id: 'room_highlights_default', type: SectionType.ROOM_HIGHLIGHTS, name: 'Highlights', visible: true, settings: { enabled: true }, sortOrder: 3 },
              { id: 'room_description_default', type: SectionType.ROOM_DESCRIPTION, name: 'Description', visible: true, settings: { enabled: true }, sortOrder: 4 },
              { id: 'room_amenities_default', type: SectionType.ROOM_AMENITIES, name: 'Amenities', visible: true, settings: { enabled: true }, sortOrder: 5 },
              { id: 'room_sleeping_default', type: SectionType.ROOM_SLEEPING, name: 'Sleeping Arrangements', visible: true, settings: { enabled: true }, sortOrder: 6 },
              { id: 'room_map_default', type: SectionType.ROOM_MAP, name: 'Map', visible: true, settings: { enabled: true }, sortOrder: 7 },
              { id: 'room_reviews_default', type: SectionType.ROOM_REVIEWS, name: 'Reviews', visible: true, settings: { enabled: true }, sortOrder: 8 },
            ];
            setSections(defaults);
          } else {
            // Page doesn't exist yet, show empty state
            setSections([]);
          }
        }

      } catch (error) {
        console.error('Error loading page sections:', error);
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    loadPageSections();
  }, [companyId, handle, pageType]);

  // Ensure default reviews section at the end for CUSTOM pages if missing
  const finalSections = useMemo(() => {
    const arr = [...sections];
    if (pageType === PageType.CUSTOM) {
      const hasRoomReviews = arr.some((s: any) => {
        const rawType = s?.sectionType ?? s?.type;
        if (!rawType) return false;
        const t = String(rawType);
        return t === 'room_reviews' || t === 'RoomReviews' || t.toLowerCase() === 'room_reviews';
      });
      if (!hasRoomReviews) {
        arr.push({ sectionType: 'room_reviews', config: { enabled: true } } as any);
      }
    }
    return arr;
  }, [sections, pageType]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Apply theme styles
  const containerStyle = {
    maxWidth: theme?.appearance?.pageWidth || '1440px',
    padding: theme?.appearance?.contentPadding || '20px',
  };

  // Helper: normalize section type coming either from backend or editor store
  const getSectionType = (section: any): string | undefined => {
    // Backend DTO uses SectionType (e.g., "ImageBanner"),
    // Frontend editor uses snake_case in section.type (e.g., 'image_banner')
    const rawType: string | undefined = section?.sectionType || section?.type;
    if (!rawType) return undefined;
    // Normalize to a canonical token for comparisons
    // Accept both 'ImageBanner' and 'image_banner'
    const t = String(rawType);
    if (t === 'ImageBanner' || t === 'image_banner') return 'image_banner';
    if (t === 'Slideshow' || t === 'slideshow') return 'slideshow';
    if (t === 'Multicolumns' || t === 'multicolumns') return 'multicolumns';
    if (t === 'Gallery' || t === 'gallery') return 'gallery';
    if (t === 'ImageWithText' || t === 'image_with_text') return 'image_with_text';
    if (t === 'FeaturedCollection' || t === 'featured_collection') return 'featured_collection';
    if (t === 'FAQ' || t === 'faq') return 'faq';
    if (t === 'Testimonials' || t === 'testimonials') return 'testimonials';
    if (t === 'RichText' || t === 'rich_text') return 'rich_text';
    if (t === 'Newsletter' || t === 'newsletter') return 'newsletter';
    if (t === 'ContactForm' || t === 'contact_form') return 'contact_form';
    if (t === 'RoomGallery' || t === 'room_gallery') return 'room_gallery';
    if (t === 'RoomTitleHost' || t === 'room_title_host') return 'room_title_host';
    if (t === 'RoomHighlights' || t === 'room_highlights') return 'room_highlights';
    if (t === 'RoomDescription' || t === 'room_description') return 'room_description';
    if (t === 'RoomAmenities' || t === 'room_amenities') return 'room_amenities';
    if (t === 'RoomSleeping' || t === 'room_sleeping') return 'room_sleeping';
    if (t === 'RoomReviews' || t === 'room_reviews') return 'room_reviews';
    if (t === 'RoomMap' || t === 'room_map') return 'room_map';
    if (t === 'RoomCalendar' || t === 'room_calendar') return 'room_calendar';
    if (t === 'RoomHostCard' || t === 'room_host_card') return 'room_host_card';
    if (t === 'RoomThings' || t === 'room_things') return 'room_things';
    return t;
  };

  // Helper: extract a config object regardless of casing/shape
  const getSectionConfig = (section: any): any => {
    const raw = section?.config ?? section?.settings ?? section?.Config;
    
    // Debug for FAQ sections
    if (section?.type === 'faq' || section?.sectionType === 'FAQ') {
      console.log('[DEBUG] getSectionConfig for FAQ:', {
        raw,
        hasConfig: !!section?.config,
        hasSettings: !!section?.settings,
        hasCapitalConfig: !!section?.Config,
        section
      });
    }
    
    if (!raw) return undefined;
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return undefined;
    }
  };

  // Removed special handling for Custom/Rooms page - now uses regular sections

  return (
    <div className="min-h-[60vh]" style={containerStyle}>
      {finalSections.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Página {pageType}
          </h2>
          <p className="text-gray-500">
            Esta página aún no tiene contenido configurado.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Vuelve al editor para agregar secciones a esta página.
          </p>
        </div>
      ) : (
        <div className="space-y-8 py-8">
          {finalSections.map((section, index) => (
            <div key={index} className="section">
              {(() => {
                const t = getSectionType(section);
                // Guard: do not render room_* sections on non-CUSTOM pages
                if (t && t.startsWith('room_') && pageType !== PageType.CUSTOM) {
                  return null;
                }
                // If this is the auto-inserted room_reviews and we are CUSTOM, try to pass a roomId
                if (t === 'room_reviews' && pageType === PageType.CUSTOM) {
                  // best-effort: we do not have a global roomId here; PreviewRoomReviews will fallback to first-active
                }
                return undefined;
              })()}
              {/* Render each section based on its type */}
              {getSectionType(section) === 'hero' && (
                <div className="text-center py-20 bg-gray-100 rounded">
                  <h1 className="text-4xl font-bold mb-4">{(section as any).content}</h1>
                </div>
              )}
              {getSectionType(section) === 'product_info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-100 h-96 rounded"></div>
                  <div>
                    <h1 className="text-3xl font-bold mb-4">{(section as any).content}</h1>
                    <p className="text-gray-600 mb-4">
                      Descripción del producto aquí...
                    </p>
                    <button className="bg-black text-white px-6 py-3 rounded">
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              )}

              {/* Image Banner (unified preview component) */}
              {getSectionType(section) === 'image_banner' && (
                <PreviewImageBanner 
                  config={getSectionConfig(section)} 
                  isEditor={false}
                  deviceView={deviceView as 'desktop' | 'mobile'}
                />
              )}
              
              {/* Slideshow (unified preview component) */}
              {getSectionType(section) === 'slideshow' && (
                <PreviewSlideshow 
                  settings={getSectionConfig(section)} 
                  theme={theme}
                  isEditor={false}
                  deviceView={deviceView as 'desktop' | 'mobile'}
                />
              )}
              
              {/* Multicolumns (unified preview component) */}
              {getSectionType(section) === 'multicolumns' && (
                <PreviewMulticolumns 
                  config={getSectionConfig(section)} 
                  theme={theme}
                  deviceView={deviceView as 'desktop' | 'mobile'}
                  isEditor={false}
                />
              )}
              
              {/* Gallery (unified preview component) */}
              {getSectionType(section) === 'gallery' && (
                <PreviewGallery 
                  config={getSectionConfig(section)} 
                  theme={theme}
                  deviceView={deviceView as 'desktop' | 'mobile'}
                  isEditor={false}
                />
              )}
              
              {/* Image With Text (unified preview component) */}
              {getSectionType(section) === 'image_with_text' && (
                <PreviewImageWithText 
                  config={getSectionConfig(section)} 
                  theme={theme}
                  deviceView={deviceView as 'desktop' | 'mobile'}
                  isEditor={false}
                />
              )}
              
              {/* Featured Collection (unified preview component) */}
              {getSectionType(section) === 'featured_collection' && (
                    <PreviewFeaturedCollection 
                      config={getSectionConfig(section)} 
                      theme={theme}
                      deviceView={deviceView as 'desktop' | 'mobile'}
                      isEditor={false}
                    />

              )}
              
              {/* FAQ (unified preview component) */}
              {getSectionType(section) === 'faq' && (
                (() => {
                  const faqConfig = getSectionConfig(section);
                  console.log('[DEBUG] FAQ section rendering:', {
                    sectionType: getSectionType(section),
                    config: faqConfig,
                    rawSection: section
                  });
                  return (
                    <PreviewFAQ 
                      config={faqConfig} 
                      theme={theme}
                      deviceView={deviceView as 'desktop' | 'mobile'}
                      isEditor={false}
                    />

                  );
                })()
              )}
              
              {/* Testimonials (unified preview component) */}
              {getSectionType(section) === 'testimonials' && (
                <PreviewTestimonials 
                  config={getSectionConfig(section)} 
                  theme={theme}
                  deviceView={deviceView as 'desktop' | 'mobile'}
                  isEditor={false}
                />
              )}
              
              {/* Rich Text (unified preview component) */}
              {getSectionType(section) === 'rich_text' && (
                <PreviewRichText 
                  config={getSectionConfig(section)}
                  deviceView={deviceView as 'desktop' | 'mobile' | 'tablet'}
                  isEditor={false}
                />
              )}
              
              {/* Newsletter (unified preview component) */}
              {getSectionType(section) === 'newsletter' && (
                <PreviewNewsletter 
                  config={getSectionConfig(section)}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {getSectionType(section) === 'contact_form' && (
                <PreviewContactForm 
                  config={getSectionConfig(section)}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {getSectionType(section) === 'room_gallery' && (
                <PreviewRoomGallery 
                  config={getSectionConfig(section)}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {getSectionType(section) === 'room_title_host' && (
                <PreviewRoomTitleHost 
                  config={getSectionConfig(section)}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {getSectionType(section) === 'room_highlights' && (
                <PreviewRoomHighlights 
                  config={getSectionConfig(section)}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {getSectionType(section) === 'room_description' && (
                <PreviewRoomDescription 
                  config={getSectionConfig(section)}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {getSectionType(section) === 'room_amenities' && (
                <PreviewRoomAmenities 
                  config={getSectionConfig(section)}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {getSectionType(section) === 'room_sleeping' && (
                <PreviewRoomSleeping 
                  config={getSectionConfig(section)}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {getSectionType(section) === 'room_reviews' && (
                <PreviewRoomReviews 
                  config={getSectionConfig(section) || { enabled: true }}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {getSectionType(section) === 'room_map' && (
                <PreviewRoomMap 
                  config={getSectionConfig(section)}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {getSectionType(section) === 'room_calendar' && (
                <PreviewRoomCalendar 
                  config={getSectionConfig(section)}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {getSectionType(section) === 'room_host_card' && (
                <PreviewRoomHostCard 
                  config={getSectionConfig(section)}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {getSectionType(section) === 'room_things' && (
                <PreviewRoomThings 
                  config={getSectionConfig(section)}
                  theme={theme}
                  deviceView={normalizedDeviceView}
                  isEditor={false}
                />
              )}
              
              {/* Add more section types as they are implemented */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
