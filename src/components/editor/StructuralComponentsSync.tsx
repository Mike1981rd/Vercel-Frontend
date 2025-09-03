'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { SectionType } from '@/types/editor.types';

/**
 * Component that syncs structural components state between store and context
 */
export function StructuralComponentsSync() {
  const { sections } = useEditorStore();
  const { config: structuralConfig } = useStructuralComponents();

  // Sync AnnouncementBar visibility on initial load
  useEffect(() => {
    if (structuralConfig?.announcementBar !== undefined) {
      const announcementSection = sections.headerGroup.find(
        s => s.type === SectionType.ANNOUNCEMENT_BAR
      );
      
      if (announcementSection) {
        const shouldBeVisible = structuralConfig.announcementBar?.enabled || false;
        
        // If the visibility doesn't match, update the store
        if (announcementSection.visible !== shouldBeVisible) {
          console.log('Syncing AnnouncementBar visibility:', shouldBeVisible);
          const { toggleSectionVisibility } = useEditorStore.getState();
          toggleSectionVisibility('headerGroup', announcementSection.id);
        }
      }
    }
  }, [structuralConfig?.announcementBar?.enabled]); // Only sync when config changes

  // Sync Header visibility on initial load
  useEffect(() => {
    if (structuralConfig?.header !== undefined) {
      const headerSection = sections.headerGroup.find(
        s => s.type === SectionType.HEADER
      );
      
      if (headerSection) {
        // Default to true if not specified (header should be visible by default)
        const shouldBeVisible = (structuralConfig.header as any)?.visible !== false;
        
        // If the visibility doesn't match, update the store
        if (headerSection.visible !== shouldBeVisible) {
          console.log('Syncing Header visibility:', shouldBeVisible);
          const { toggleSectionVisibility } = useEditorStore.getState();
          toggleSectionVisibility('headerGroup', headerSection.id);
        }
      }
    }
  }, [(structuralConfig?.header as any)?.visible]); // Only sync when config changes

  return null; // This component doesn't render anything
}