'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Section, SectionType } from '@/types/editor.types';
import { useEditorStore } from '@/stores/useEditorStore';
import { HeaderEditor } from './HeaderEditor';
import AnnouncementBarEditor from './AnnouncementBarEditor';
import AnnouncementItemEditor from './AnnouncementItemEditor';
import FooterEditor from './FooterEditor';
import FooterMenuEditor from './FooterMenuEditor';
import FooterLogoWithTextEditor from './FooterLogoWithTextEditor';
import FooterSubscribeEditor from './FooterSubscribeEditor';
import FooterTextEditor from './FooterTextEditor';
import FooterSocialMediaEditor from './FooterSocialMediaEditor';
import FooterImageEditor from './FooterImageEditor';
import ImageBannerEditor from './modules/ImageBanner/ImageBannerEditor';
import SlideshowEditor from './modules/Slideshow/SlideshowEditor';
import SlideEditor from './modules/Slideshow/SlideEditor';
import MulticolumnsEditor from './modules/Multicolumns/MulticolumnsEditor';
import MulticolumnsItemEditor from './modules/Multicolumns/MulticolumnsItemEditor';
import MulticolumnsImageItemEditor from './modules/Multicolumns/MulticolumnsImageItemEditor';
import GalleryEditor from './modules/Gallery/GalleryEditor';
import GalleryItemEditor from './modules/Gallery/GalleryItemEditor';
import ImageWithTextEditor from './modules/ImageWithText/ImageWithTextEditor';
import ImageWithTextItemEditor from './modules/ImageWithText/ImageWithTextItemEditor';
import FeaturedCollectionEditor from './modules/FeaturedCollection/FeaturedCollectionEditor';
import FAQEditor from './modules/FAQ/FAQEditor';
import FAQItemEditor from './modules/FAQ/FAQItemEditor';
import TestimonialsEditor from './modules/Testimonials/TestimonialsEditor';
import RichTextEditor from './modules/RichText/RichTextEditor';
import { RichTextConfig, defaultRichTextConfig } from './modules/RichText/types';
import RichTextItemEditor from './modules/RichText/RichTextItemEditor';
import NewsletterEditor from './modules/Newsletter/NewsletterEditor';
import { defaultNewsletterConfig } from './modules/Newsletter/types';
import ContactFormEditor from './modules/ContactForm/ContactFormEditor';
import NewsletterItemEditor from './modules/Newsletter/NewsletterItemEditor';
import TestimonialsItemEditor from './modules/Testimonials/TestimonialsItemEditor';
import RoomGalleryEditor from './modules/RoomGallery/RoomGalleryEditor';
import RoomTitleHostEditor from './modules/RoomTitleHost/RoomTitleHostEditor';
import RoomHighlightsEditor from './modules/RoomHighlights/RoomHighlightsEditor';
import RoomDescriptionEditor from './modules/RoomDescription/RoomDescriptionEditor';
import RoomAmenitiesEditor from './modules/RoomAmenities/RoomAmenitiesEditor';
import RoomSleepingEditor from './modules/RoomSleeping/RoomSleepingEditor';
import RoomReviewsEditor from './modules/RoomReviews/RoomReviewsEditor';
import RoomMapEditor from './modules/RoomMap/RoomMapEditor';
import RoomCalendarEditor from './modules/RoomCalendar/RoomCalendarEditor';
import RoomHostCardEditor from './modules/RoomHostCard/RoomHostCardEditor';
import RoomThingsEditor from './modules/RoomThings/RoomThingsEditor';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { HeaderConfig } from '@/types/components/header';
import { FooterBlockType } from './modules/Footer/FooterTypes';

interface ConfigPanelProps {
  section: Section;
}

export function ConfigPanel({ section }: ConfigPanelProps) {
  const { selectedSectionId, selectSection, updateSectionSettings, sections } = useEditorStore();
  const { headerConfig, updateHeaderConfigLocal, config: structuralComponents } = useStructuralComponents();
  const [settings, setSettings] = useState(section.settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [headerLoading, setHeaderLoading] = useState(false);
  
  // Debug log at the very beginning
  console.log('[DEBUG] ConfigPanel - Rendering with:', {
    selectedSectionId,
    sectionType: section?.type,
    sectionId: section?.id
  });
  
  // Check if this is an announcement item (child)
  const isAnnouncementItem = section?.id && typeof section.id === 'string' && section.id.startsWith('announcement-');
  
  // Check if this is a footer block (child)
  const isFooterBlock = section?.id && typeof section.id === 'string' && section.id.startsWith('footer-block-');
  
  // Check if this is a slideshow slide (child)
  const isSlideItem = selectedSectionId && typeof selectedSectionId === 'string' && selectedSectionId.includes(':slide:');
  const getSlideshowSectionId = () => {
    if (!isSlideItem || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':slide:')[0];
  };
  const getSlideId = () => {
    if (!isSlideItem || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':slide:')[1];
  };
  
  // Check if this is a gallery child item
  const isGalleryItem = selectedSectionId && typeof selectedSectionId === 'string' && selectedSectionId.includes(':child:') && !isSlideItem && 
    Object.values(sections).flat().find(s => s.id === (typeof selectedSectionId === 'string' ? selectedSectionId.split(':child:')[0] : ''))?.type === SectionType.GALLERY;
  const getGallerySectionId = () => {
    if (!isGalleryItem || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':child:')[0];
  };
  const getGalleryItemId = () => {
    if (!isGalleryItem || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':child:')[1];
  };
  
  // Check if this is a multicolumns child item - must check parent type
  const isMulticolumnsItem = selectedSectionId && typeof selectedSectionId === 'string' && selectedSectionId.includes(':child:') && !isSlideItem && !isGalleryItem &&
    Object.values(sections).flat().find(s => s.id === (typeof selectedSectionId === 'string' ? selectedSectionId.split(':child:')[0] : ''))?.type === SectionType.MULTICOLUMNS;
  const getMulticolumnsSectionId = () => {
    if (!isMulticolumnsItem || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':child:')[0];
  };
  const getMulticolumnsItemId = () => {
    if (!isMulticolumnsItem || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':child:')[1];
  };
  
  // Check if this is an ImageWithText child item - must check parent type
  const isImageWithTextItem = selectedSectionId && typeof selectedSectionId === 'string' && selectedSectionId.includes(':child:') && !isSlideItem && !isGalleryItem && !isMulticolumnsItem &&
    Object.values(sections).flat().find(s => s.id === (typeof selectedSectionId === 'string' ? selectedSectionId.split(':child:')[0] : ''))?.type === SectionType.IMAGE_WITH_TEXT;
  const getImageWithTextSectionId = () => {
    if (!isImageWithTextItem || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':child:')[0];
  };
  const getImageWithTextItemId = () => {
    if (!isImageWithTextItem || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':child:')[1];
  };
  
  // Check if this is a FAQ item (child) - DEBE usar :child:
  const isFAQItem = selectedSectionId && typeof selectedSectionId === 'string' && selectedSectionId.includes(':child:') && 
    Object.values(sections).flat().find(s => s.id === (typeof selectedSectionId === 'string' ? selectedSectionId.split(':child:')[0] : ''))?.type === SectionType.FAQ;
  const getFAQSectionId = () => {
    if (!isFAQItem || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':child:')[0];
  };
  const getFAQItemId = () => {
    if (!isFAQItem || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':child:')[1];
  };
  
  // Check if this is a Rich Text block (child) - DEBE usar :child: como Testimonials
  const isRichTextBlock = selectedSectionId && typeof selectedSectionId === 'string' && selectedSectionId.includes(':child:') && 
    Object.values(sections).flat().find(s => s.id === (typeof selectedSectionId === 'string' ? selectedSectionId.split(':child:')[0] : ''))?.type === SectionType.RICH_TEXT;
  
  // Check if this is a Newsletter block (child)
  const isNewsletterBlock = selectedSectionId && typeof selectedSectionId === 'string' && selectedSectionId.includes(':child:') && 
    Object.values(sections).flat().find(s => s.id === (typeof selectedSectionId === 'string' ? selectedSectionId.split(':child:')[0] : ''))?.type === SectionType.NEWSLETTER;
  
  // Debug Rich Text blocks
  if (selectedSectionId && typeof selectedSectionId === 'string' && selectedSectionId.includes(':child:')) {
    const parentSection = Object.values(sections).flat().find(s => s.id === selectedSectionId.split(':child:')[0]);
    console.log('[DEBUG] ConfigPanel - Child detection:', {
      selectedSectionId,
      parentType: parentSection?.type,
      isRichTextBlock,
      isNewsletterBlock,
      isTestimonialsItem: parentSection?.type === SectionType.TESTIMONIALS,
      isFAQItem: parentSection?.type === SectionType.FAQ,
      isMulticolumnsItem: parentSection?.type === SectionType.MULTICOLUMNS
    });
  }
  
  const getRichTextSectionId = () => {
    if (!isRichTextBlock || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':child:')[0];
  };
  const getRichTextBlockId = () => {
    if (!isRichTextBlock || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':child:')[1];
  };
  
  // Check if this is a Testimonials item (child) - DEBE usar :child:
  const isTestimonialsItem = selectedSectionId && typeof selectedSectionId === 'string' && selectedSectionId.includes(':child:') && 
    Object.values(sections).flat().find(s => s.id === (typeof selectedSectionId === 'string' ? selectedSectionId.split(':child:')[0] : ''))?.type === SectionType.TESTIMONIALS;
  const getTestimonialsSectionId = () => {
    if (!isTestimonialsItem || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':child:')[0];
  };
  const getTestimonialsItemId = () => {
    if (!isTestimonialsItem || !selectedSectionId || typeof selectedSectionId !== 'string') return null;
    return selectedSectionId.split(':child:')[1];
  };
  
  // Debug log for multicolumns
  if (selectedSectionId && typeof selectedSectionId === 'string' && selectedSectionId.includes(':child:')) {
    console.log('[DEBUG] ConfigPanel - Multicolumns detection:', {
      selectedSectionId,
      isMulticolumnsItem,
      sectionId: getMulticolumnsSectionId(),
      itemId: getMulticolumnsItemId(),
      section
    });
  }
  
  // Get footer block type if it's a footer block
  const getFooterBlockType = (): FooterBlockType | null => {
    if (!isFooterBlock) return null;
    const footerConfig = structuralComponents?.footer;
    const block = footerConfig?.blocks?.find((b: any) => b.id === section.id);
    return block?.type || null;
  };

  useEffect(() => {
    setSettings(section.settings);
    setHasChanges(false);
  }, [section, JSON.stringify(section.settings)]); // Force update when settings change (for undo)

  const handleBack = () => {
    selectSection(null);
  };

  const handleSave = async () => {
    // Special handling for Header - just update the local state
    if (section.type === SectionType.HEADER) {
      // The actual save happens through the global save button
      // which calls publishStructural()
      // Don't reset hasChanges here because it needs to stay true
      // until the global save button is clicked
      return;
    }

    // Regular sections
    const { sections } = useEditorStore.getState();
    let groupId: 'headerGroup' | 'asideGroup' | 'template' | 'footerGroup' | null = null;
    
    for (const [key, group] of Object.entries(sections)) {
      if (group.some(s => s.id === section.id)) {
        groupId = key as 'headerGroup' | 'asideGroup' | 'template' | 'footerGroup';
        break;
      }
    }
    
    if (groupId) {
      updateSectionSettings(groupId, section.id, settings);
      setHasChanges(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  // Return early for announcement items AFTER all hooks
  if (isAnnouncementItem) {
    return <AnnouncementItemEditor announcementId={section.id} />;
  }
  
  // Return early for slide items AFTER all hooks
  if (isSlideItem) {
    const sectionId = getSlideshowSectionId();
    const slideId = getSlideId();
    console.log('[DEBUG] ConfigPanel - Slide item detected:', {
      selectedSectionId,
      isSlideItem,
      sectionId,
      slideId
    });
    if (sectionId && slideId) {
      return <SlideEditor sectionId={sectionId} slideId={slideId} />;
    }
  }
  
  // Return early for Gallery items AFTER all hooks
  if (isGalleryItem) {
    const sectionId = getGallerySectionId();
    const itemId = getGalleryItemId();
    
    if (sectionId && itemId) {
      return <GalleryItemEditor sectionId={sectionId} itemId={itemId} />;
    }
  }
  
  // Return early for multicolumns items AFTER all hooks - CHECK BEFORE ImageWithText
  if (isMulticolumnsItem) {
    const sectionId = getMulticolumnsSectionId();
    const itemId = getMulticolumnsItemId();
    
    if (sectionId && itemId) {
      // Get the parent section to check item type
      const parentSection = Object.values(sections).flat().find(s => s.id === sectionId);
      const parentConfig = parentSection?.settings as any;
      const item = parentConfig?.items?.find((i: any) => i.id === itemId);
      
      console.log('[DEBUG] Rendering Multicolumns Item Editor:', { 
        sectionId, 
        itemId, 
        itemType: item?.type 
      });
      
      // Render appropriate editor based on item type
      if (item?.type === 'image') {
        return <MulticolumnsImageItemEditor sectionId={sectionId} itemId={itemId} />;
      } else {
        return <MulticolumnsItemEditor sectionId={sectionId} itemId={itemId} />;
      }
    }
  }
  
  // Return early for FAQ items AFTER all hooks - CHECK BEFORE ImageWithText
  if (isFAQItem) {
    const sectionId = getFAQSectionId();
    const itemId = getFAQItemId();
    
    if (sectionId && itemId) {
      return <FAQItemEditor sectionId={sectionId} itemId={itemId} />;
    }
  }
  
  // Return early for Testimonials items AFTER all hooks - CHECK AFTER FAQ
  if (isTestimonialsItem) {
    const sectionId = getTestimonialsSectionId();
    const itemId = getTestimonialsItemId();
    
    if (sectionId && itemId) {
      return <TestimonialsItemEditor sectionId={sectionId} itemId={itemId} />;
    }
  }
  
  // Return early for Rich Text blocks AFTER all hooks - CHECK AFTER Testimonials
  if (isRichTextBlock) {
    const sectionId = getRichTextSectionId();
    const blockId = getRichTextBlockId();
    
    console.log('[DEBUG] ConfigPanel - Rendering RichTextItemEditor:', {
      sectionId,
      blockId,
      isRichTextBlock
    });
    
    if (sectionId && blockId) {
      return <RichTextItemEditor sectionId={sectionId} blockId={blockId} />;
    }
  }
  
  // Return early for Newsletter blocks AFTER all hooks
  if (isNewsletterBlock) {
    const sectionId = typeof selectedSectionId === 'string' ? selectedSectionId.split(':child:')[0] : null;
    const blockId = typeof selectedSectionId === 'string' ? selectedSectionId.split(':child:')[1] : null;
    
    console.log('[DEBUG] ConfigPanel - Rendering NewsletterItemEditor:', {
      sectionId,
      blockId,
      isNewsletterBlock
    });
    
    if (sectionId && blockId) {
      return <NewsletterItemEditor sectionId={sectionId} blockId={blockId} />;
    }
  }
  
  // Return early for ImageWithText items AFTER all hooks - CHECK AFTER Rich Text
  if (isImageWithTextItem) {
    const sectionId = getImageWithTextSectionId();
    const itemId = getImageWithTextItemId();
    
    if (sectionId && itemId) {
      return <ImageWithTextItemEditor sectionId={sectionId} itemId={itemId} />;
    }
  }
  
  // Return early for footer blocks AFTER all hooks
  if (isFooterBlock) {
    const blockType = getFooterBlockType();
    
    // Handle different footer block types
    if (blockType === FooterBlockType.MENU) {
      return <FooterMenuEditor blockId={section.id} />;
    }
    
    if (blockType === FooterBlockType.LOGO_WITH_TEXT) {
      return <FooterLogoWithTextEditor blockId={section.id} />;
    }
    
    if (blockType === FooterBlockType.SUBSCRIBE) {
      return <FooterSubscribeEditor blockId={section.id} />;
    }
    
    if (blockType === FooterBlockType.TEXT) {
      return <FooterTextEditor blockId={section.id} />;
    }
    
    if (blockType === FooterBlockType.SOCIAL_MEDIA) {
      return <FooterSocialMediaEditor blockId={section.id} />;
    }
    
    if (blockType === FooterBlockType.IMAGE) {
      return <FooterImageEditor blockId={section.id} />;
    }
    
    // For other footer block types, show placeholder
    return (
      <div className="w-[320px] h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configuration for {blockType} block coming soon...
          </p>
        </div>
      </div>
    );
  }

  const renderConfigFields = () => {
    switch (section.type) {
      case SectionType.HEADER:
        return (
          <HeaderEditor
            value={settings as HeaderConfig}
            onChange={(newConfig) => {
              // Check if config actually changed
              const currentConfigStr = JSON.stringify(headerConfig || settings);
              const newConfigStr = JSON.stringify(newConfig);
              
              if (currentConfigStr === newConfigStr) {
                return; // No actual change, skip update
              }
              
              console.log('HeaderEditor onChange - new config:', newConfig);
              console.log('Logo config:', newConfig.logo);
              
              // Save history before making changes
              const store = useEditorStore.getState();
              store.saveHistory();
              
              setSettings(newConfig);
              setHasChanges(true);
              // Update the local config for live preview
              updateHeaderConfigLocal(newConfig);
              // Also update the store for consistency
              const { sections } = store;
              for (const [key, group] of Object.entries(sections)) {
                const sectionIndex = group.findIndex(s => s.id === section.id);
                if (sectionIndex !== -1) {
                  updateSectionSettings(key, section.id, newConfig);
                  console.log(`Updated section ${section.id} in group ${key} with logo:`, newConfig.logo);
                  break;
                }
              }
            }}
          />
        );

      case SectionType.IMAGE_BANNER:
        return <ImageBannerEditor sectionId={section.id} />;

      case SectionType.ANNOUNCEMENT_BAR:
        return <AnnouncementBarEditor />;

      case SectionType.FOOTER:
        return <FooterEditor />;

      case SectionType.SLIDESHOW:
        return <SlideshowEditor sectionId={section.id} />;

      case SectionType.MULTICOLUMNS:
        return <MulticolumnsEditor sectionId={section.id} />;
      
      case SectionType.GALLERY:
        return <GalleryEditor sectionId={section.id} />;

      case SectionType.IMAGE_WITH_TEXT:
        return <ImageWithTextEditor sectionId={section.id} />;

      case SectionType.FEATURED_COLLECTION:
        return <FeaturedCollectionEditor sectionId={section.id} />;

      case SectionType.FAQ:
        return <FAQEditor sectionId={section.id} />;

      case SectionType.TESTIMONIALS:
        return <TestimonialsEditor sectionId={section.id} />;

      case SectionType.RICH_TEXT:
        // Find the group ID for this section
        const richTextGroupId = Object.entries(sections).find(([_, sectionsList]) =>
          sectionsList.some(s => s.id === section.id)
        )?.[0];
        
        // Normalize settings to ensure it matches RichTextConfig shape
        const richTextConfig: RichTextConfig = {
          ...defaultRichTextConfig,
          ...(section.settings as Record<string, any>),
        };

        return (
          <RichTextEditor
            sectionId={section.id}
            config={richTextConfig}
            onUpdate={(config) => {
              if (richTextGroupId) {
                updateSectionSettings(richTextGroupId, section.id, config);
              }
            }}
            onClose={handleBack}
          />
        );

      case SectionType.CONTACT_FORM:
        return <ContactFormEditor sectionId={section.id} />;
      case 'room_gallery' as any:
        return <RoomGalleryEditor sectionId={section.id} />;
      case 'room_title_host' as any:
        return <RoomTitleHostEditor sectionId={section.id} />;
      case 'room_highlights' as any:
        return <RoomHighlightsEditor sectionId={section.id} />;
      case 'room_description' as any:
        return <RoomDescriptionEditor sectionId={section.id} />;
      case 'room_amenities' as any:
        return <RoomAmenitiesEditor sectionId={section.id} />;
      case 'room_sleeping' as any:
        return <RoomSleepingEditor sectionId={section.id} />;
      case 'room_reviews' as any:
        return <RoomReviewsEditor sectionId={section.id} />;
      case 'room_map' as any:
        return <RoomMapEditor sectionId={section.id} />;
      case 'room_calendar' as any:
        return <RoomCalendarEditor sectionId={section.id} />;
      case 'room_host_card' as any:
        return <RoomHostCardEditor sectionId={section.id} />;
      case 'room_things' as any:
        return <RoomThingsEditor sectionId={section.id} />;
      case SectionType.NEWSLETTER:
        // Find the group ID for this section
        const newsletterGroupId = Object.entries(sections).find(([_, sectionsList]) =>
          sectionsList.some(s => s.id === section.id)
        )?.[0];

        // Normalize settings to ensure NewsletterConfig shape
        const newsletterConfig = {
          ...defaultNewsletterConfig,
          ...(section.settings as Record<string, any>),
        };

        return (
          <NewsletterEditor
            sectionId={section.id}
            // Casting to satisfy TS with normalized shape
            config={newsletterConfig as any}
            onUpdate={(config) => {
              if (newsletterGroupId) {
                updateSectionSettings(newsletterGroupId, section.id, config);
              }
            }}
            onClose={handleBack}
          />
        );

      default:
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Configuration for {section.name} coming soon...
          </div>
        );
    }
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={handleBack}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {section.name}
          </h2>
        </div>
        
        {hasChanges && section.type !== SectionType.HEADER && (
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        )}
      </div>

      {/* Configuration Fields */}
      <div className="p-4">
        {renderConfigFields()}
      </div>
    </div>
  );
}
