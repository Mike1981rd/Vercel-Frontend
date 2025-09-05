'use client';

import React, { useEffect } from 'react';
import { EditorSidebarWithDnD } from './EditorSidebarWithDnD';
import { EditorPreview } from './EditorPreview';
import { useEditorStore } from '@/stores/useEditorStore';
import { SectionType, Section } from '@/types/editor.types';

interface EditorLayoutProps {
  deviceView?: 'desktop' | 'mobile';
}

export function EditorLayout({ deviceView = 'desktop' }: EditorLayoutProps) {
  // Normalize legacy section types to current enum values (fixes Image Banner "coming soon")
  useEffect(() => {
    const state = useEditorStore.getState();
    const current = state.sections;

    const normalizeType = (type: string): SectionType | string => {
      // Map PascalCase or other variants to snake_case expected by switches
      if (type === 'ImageBanner') return SectionType.IMAGE_BANNER;
      if (type === 'Slideshow') return SectionType.SLIDESHOW;
      if (type === 'Multicolumns') return SectionType.MULTICOLUMNS;
      if (type === 'Gallery') return SectionType.GALLERY;
      if (type === 'ImageWithText') return SectionType.IMAGE_WITH_TEXT;
      if (type === 'FeaturedCollection') return SectionType.FEATURED_COLLECTION;
      if (type === 'FAQ') return SectionType.FAQ;
      if (type === 'Footer') return SectionType.FOOTER;
      if (type === 'Header') return SectionType.HEADER;
      if (type === 'AnnouncementBar') return SectionType.ANNOUNCEMENT_BAR;
      return type;
    };

    const normalizeGroup = (group: Section[]): Section[] =>
      group.map((s) => (s?.type ? { ...s, type: normalizeType(s.type) as any } : s));

    const normalized = {
      headerGroup: normalizeGroup(current.headerGroup),
      asideGroup: normalizeGroup(current.asideGroup),
      template: normalizeGroup(current.template),
      footerGroup: normalizeGroup(current.footerGroup)
    };

    const changed = JSON.stringify(current) !== JSON.stringify(normalized);
    if (changed) {
      useEditorStore.setState({ sections: normalized });
    }
  }, []);

  return (
    <div className="flex h-full relative">
      {/* Sidebar with Drag & Drop - Fixed */}
      <div className="h-full overflow-hidden">
        <EditorSidebarWithDnD />
      </div>
      
      {/* Preview Area - Scrollable */}
      <div className="flex-1 h-full overflow-hidden">
        <EditorPreview deviceView={deviceView} />
      </div>
    </div>
  );
}