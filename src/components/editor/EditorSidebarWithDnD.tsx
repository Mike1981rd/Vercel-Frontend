'use client';

import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ChevronDown, ChevronRight, Plus, FileText } from 'lucide-react';
import { SectionItem } from './SectionItem';
import { AddSectionModal } from './AddSectionModal';
import { ConfigPanel } from './ConfigPanel';
import { GlobalSettingsPanel } from './GlobalSettingsPanel';
import { WhatsAppWidgetPanel } from './WhatsAppWidgetPanel';
import { DraggableSection } from './dragDrop/DraggableSection';
import { DragOverlay } from './dragDrop/DragOverlay';
import { AnnouncementChildren } from './AnnouncementChildren';
import { FooterChildren } from './FooterChildren';
import SlideshowChildren from './modules/Slideshow/SlideshowChildren';
import MulticolumnsChildren from './modules/Multicolumns/MulticolumnsChildren';
import GalleryChildren from './modules/Gallery/GalleryChildren';
import ImageWithTextChildren from './modules/ImageWithText/ImageWithTextChildren';
import FAQChildren from './modules/FAQ/FAQChildren';
import TestimonialsChildren from './modules/Testimonials/TestimonialsChildren';
import RichTextSidebarChildren from './modules/RichText/RichTextSidebarChildren';
import NewsletterSidebarChildren from './modules/Newsletter/NewsletterSidebarChildren';
import { useEditorStore } from '@/stores/useEditorStore';
import { useEditorTranslations } from '@/hooks/useEditorTranslations';
import { useSectionDragDrop } from '@/hooks/useSectionDragDrop';
import { GroupId } from '@/lib/dragDrop/types';
import { SectionType } from '@/types/editor.types';

interface SectionGroup {
  id: GroupId;
  name: string;
  isCollapsed: boolean;
}

export function EditorSidebarWithDnD() {
  const { sections, selectedSectionId, isConfigPanelOpen, isGlobalSettingsOpen, isWhatsAppWidgetOpen } = useEditorStore();
  const { t } = useEditorTranslations();
  const { activeSection, handlers, dragState } = useSectionDragDrop();
  
  const [groups, setGroups] = useState<SectionGroup[]>([
    { id: 'headerGroup', name: 'Header Group', isCollapsed: false },
    { id: 'asideGroup', name: 'Aside Group', isCollapsed: false },
    { id: 'template', name: t('editor.panels.content', 'Contenido'), isCollapsed: false },
    { id: 'footerGroup', name: 'Footer Group', isCollapsed: false }
  ]);
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    groupId: GroupId | null;
  }>({ isOpen: false, groupId: null });

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15, // Aumentado de 8 a 15 píxeles para evitar activación accidental
        tolerance: 5, // Tolerancia adicional para movimientos pequeños
        delay: 150 // Retraso de 150ms antes de activar el drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleGroup = (groupId: string) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, isCollapsed: !group.isCollapsed }
          : group
      )
    );
  };

  const openAddModal = (groupId: GroupId) => {
    setModalState({ isOpen: true, groupId });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, groupId: null });
  };

  // Find selected section to show config panel
  let selectedSection = selectedSectionId 
    ? Object.values(sections).flat().find(s => s.id === selectedSectionId)
    : null;
  
  // Check if it's an announcement item (virtual section)
  if (!selectedSection && selectedSectionId?.startsWith('announcement-')) {
    // Create a virtual section for the announcement item
    selectedSection = {
      id: selectedSectionId,
      type: 'ANNOUNCEMENT_ITEM' as any,
      title: 'Announcement',
      visible: true,
      settings: {}
    } as any;
  }
  
  // Check if it's a footer block (virtual section)
  if (!selectedSection && selectedSectionId?.startsWith('footer-block-')) {
    // Create a virtual section for the footer block
    selectedSection = {
      id: selectedSectionId,
      type: 'FOOTER_BLOCK' as any,
      title: 'Footer Block',
      visible: true,
      settings: {}
    } as any;
  }
  
  // Check if it's a slideshow slide (virtual section)
  if (!selectedSection && selectedSectionId?.includes(':slide:')) {
    console.log('[DEBUG] Creating virtual section for slide:', selectedSectionId);
    const [sectionId] = selectedSectionId.split(':slide:');
    const parentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    
    // Create a virtual section for the slide
    selectedSection = {
      id: selectedSectionId,
      type: 'SLIDESHOW_SLIDE' as any,
      name: 'Slide',
      visible: true,
      settings: parentSection?.settings || {},
      sortOrder: 0
    } as any;
  }
  
  // Check if it's a child item (virtual section) - Gallery or Multicolumns
  if (!selectedSection && selectedSectionId?.includes(':child:')) {
    console.log('[DEBUG] Creating virtual section for child item:', selectedSectionId);
    const [sectionId] = selectedSectionId.split(':child:');
    const parentSection = Object.values(sections).flat().find(s => s.id === sectionId);
    
    // Determine the type based on parent section
    if (parentSection?.type === SectionType.GALLERY) {
      selectedSection = {
        id: selectedSectionId,
        type: 'GALLERY_ITEM' as any,
        name: 'Gallery Item',
        visible: true,
        settings: parentSection?.settings || {},
        sortOrder: 0
      } as any;
    } else if (parentSection?.type === SectionType.IMAGE_WITH_TEXT) {
      selectedSection = {
        id: selectedSectionId,
        type: 'IMAGEWITHTEXT_ITEM' as any,
        name: 'Media Item',
        visible: true,
        settings: parentSection?.settings || {},
        sortOrder: 0
      } as any;
    } else if (parentSection?.type === SectionType.MULTICOLUMNS) {
      selectedSection = {
        id: selectedSectionId,
        type: 'MULTICOLUMNS_ITEM' as any,
        name: 'Icon Column',
        visible: true,
        settings: parentSection?.settings || {},
        sortOrder: 0
      } as any;
    } else if (parentSection?.type === SectionType.FAQ) {
      selectedSection = {
        id: selectedSectionId,
        type: 'FAQ_ITEM' as any,
        name: 'FAQ Item',
        visible: true,
        settings: parentSection?.settings || {},
        sortOrder: 0
      } as any;
    } else if (parentSection?.type === SectionType.TESTIMONIALS) {
      selectedSection = {
        id: selectedSectionId,
        type: 'TESTIMONIALS_ITEM' as any,
        name: 'Testimonial',
        visible: true,
        settings: parentSection?.settings || {},
        sortOrder: 0
      } as any;
    } else if (parentSection?.type === SectionType.RICH_TEXT) {
      selectedSection = {
        id: selectedSectionId,
        type: 'RICH_TEXT_BLOCK' as any,
        name: 'Rich Text Block',
        visible: true,
        settings: parentSection?.settings || {},
        sortOrder: 0
      } as any;
    } else if (parentSection?.type === SectionType.NEWSLETTER) {
      selectedSection = {
        id: selectedSectionId,
        type: 'NEWSLETTER_BLOCK' as any,
        name: 'Newsletter Block',
        visible: true,
        settings: parentSection?.settings || {},
        sortOrder: 0
      } as any;
    }
  }

  // Show Global Settings Panel if active
  if (isGlobalSettingsOpen) {
    return <GlobalSettingsPanel />;
  }

  // Show WhatsApp Widget Panel if active
  if (isWhatsAppWidgetOpen) {
    return <WhatsAppWidgetPanel />;
  }

  // Show Config Panel if a section is selected
  if (isConfigPanelOpen && selectedSection) {
    return <ConfigPanel section={selectedSection} />;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handlers.handleDragStart}
        onDragOver={handlers.handleDragOver}
        onDragEnd={handlers.handleDragEnd}
        onDragCancel={handlers.handleDragCancel}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="w-[320px] h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-visible">
          {/* Page Title Section */}
          <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t('editor.panels.pages', 'Páginas')}: Home
              </span>
            </div>
          </div>
          
          {/* Sections List */}
          <div className="flex-1 overflow-y-auto py-3">
            {groups.map((group) => {
              const groupSections = sections[group.id] || [];
              const sectionIds = groupSections.map(s => s.id);
              
              // Determinar si este grupo puede recibir el elemento siendo arrastrado
              const isDragging = dragState.isDragging;
              const canReceiveDrop = isDragging && dragState.draggedItem?.groupId === group.id;
              const isBlockedGroup = isDragging && dragState.draggedItem?.groupId !== group.id;

              return (
                <div key={group.id} className="mb-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {group.isCollapsed ? (
                        <ChevronRight className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      <span className="uppercase tracking-wider">{group.name}</span>
                      <span className="text-gray-400 dark:text-gray-500 ml-1">
                        ({groupSections.length})
                      </span>
                    </div>
                  </button>

                  {/* Group Content */}
                  {!group.isCollapsed && (
                    <div className={`
                      relative transition-all duration-200
                      ${isBlockedGroup ? 'opacity-30 pointer-events-none' : ''}
                      ${canReceiveDrop ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                    `}>
                      <SortableContext
                        items={sectionIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {/* Section Items with Drag & Drop */}
                        <div className="relative pl-8">
                          {groupSections.map((section, index) => (
                            <div key={section.id}>
                              <DraggableSection
                                section={section}
                                groupId={group.id}
                                index={index}
                              >
                                <SectionItem
                                  section={section}
                                  groupId={group.id}
                                />
                              </DraggableSection>
                              
                              {/* Announcement Bar Children - Show announcements as child items */}
                              {section.type === SectionType.ANNOUNCEMENT_BAR && section.visible && (
                                <AnnouncementChildren 
                                  section={section}
                                  groupId={group.id}
                                />
                              )}

                              {/* Footer Children - Show footer blocks as child items */}
                              {section.type === SectionType.FOOTER && section.visible && (
                                <FooterChildren 
                                  section={section}
                                  groupId={group.id}
                                />
                              )}

                              {/* Slideshow Children - Show slides as child items */}
                              {section.type === SectionType.SLIDESHOW && section.visible && (
                                <SlideshowChildren 
                                  section={section}
                                  groupId={group.id}
                                />
                              )}

                              {/* Multicolumns Children - Show column items as child items */}
                              {section.type === SectionType.MULTICOLUMNS && section.visible && (
                                <MulticolumnsChildren 
                                  section={section}
                                  groupId={group.id}
                                />
                              )}
                              
                              {section.type === SectionType.GALLERY && section.visible && (
                                <GalleryChildren 
                                  section={section}
                                  groupId={group.id}
                                />
                              )}
                              
                              {/* ImageWithText Children - Show media items */}
                              {section.type === SectionType.IMAGE_WITH_TEXT && section.visible && (
                                <ImageWithTextChildren 
                                  section={section}
                                  groupId={group.id}
                                />
                              )}
                              
                              {/* FAQ Children - Show FAQ items */}
                              {section.type === SectionType.FAQ && section.visible && (
                                <FAQChildren 
                                  section={section}
                                  groupId={group.id}
                                />
                              )}
                              
                              {/* Testimonials Children - Show testimonial items */}
                              {section.type === SectionType.TESTIMONIALS && section.visible && (
                                <TestimonialsChildren 
                                  section={section}
                                  groupId={group.id}
                                />
                              )}

                              {/* Rich Text Children - Show rich text blocks */}
                              {section.type === SectionType.RICH_TEXT && section.visible && (
                                <RichTextSidebarChildren
                                  blocks={section.settings?.blocks || []}
                                  section={section}
                                  groupId={group.id}
                                />
                              )}

                              {/* Newsletter Children - Show newsletter blocks */}
                              {section.type === SectionType.NEWSLETTER && section.visible && (
                                <NewsletterSidebarChildren
                                  blocks={section.settings?.blocks || []}
                                  section={section}
                                  groupId={group.id}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </SortableContext>

                      {/* Add Section Button - Show for headerGroup and template */}
                      {(group.id === 'headerGroup' || group.id === 'template') && (
                        <div className="pl-8">
                          <button
                            onClick={() => openAddModal(group.id)}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                          >
                            <div className="w-5 h-5 rounded border border-gray-400 dark:border-gray-600 border-dashed flex items-center justify-center group-hover:border-gray-600 dark:group-hover:border-gray-400">
                              <Plus className="w-3 h-3" />
                            </div>
                            <span>{t('editor.sidebar.addSection', 'Agregar sección')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay activeSection={activeSection} />
      </DndContext>

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        groupId={modalState.groupId || 'template'}
      />
    </>
  );
}