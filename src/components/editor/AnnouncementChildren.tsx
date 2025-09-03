'use client';

import React, { useMemo } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableAnnouncementItem } from './dragDrop/DraggableAnnouncementItem';
import { Plus, RefreshCw, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { useEditorStore } from '@/stores/useEditorStore';
import { Section } from '@/types/editor.types';

interface AnnouncementChildrenProps {
  section: Section;
  groupId: string;
}

export function AnnouncementChildren({ section, groupId }: AnnouncementChildrenProps) {
  const { config: structuralComponents, updateAnnouncementBarConfigLocal } = useStructuralComponents();
  const { selectSection, toggleConfigPanel } = useEditorStore();
  
  // Get announcements from structural components config
  const announcementConfig = structuralComponents?.announcementBar || {};
  const announcements = announcementConfig.announcements || [];

  // Stable sortable IDs for items
  const sortableIds = useMemo(
    () => announcements.map((a: { id: string }) => `ann:${section.id}:${a.id}`),
    [announcements, section.id]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const getIndexFromId = (id: string) => sortableIds.indexOf(id);
    const oldIndex = getIndexFromId(String(active.id));
    const newIndex = getIndexFromId(String(over.id));
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

    const next = [...announcements];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);

    const updatedConfig = {
      ...announcementConfig,
      announcements: next
    };
    updateAnnouncementBarConfigLocal(updatedConfig);
  };

  const handleAddAnnouncement = () => {
    const newAnnouncement = {
      id: `announcement-${Date.now()}`,
      text: 'New Announcement',
      link: '',
      icon: '',
      customIcon: '',
      visible: true
    };
    
    const updatedConfig = {
      ...announcementConfig,
      announcements: [...announcements, newAnnouncement]
    };
    
    updateAnnouncementBarConfigLocal(updatedConfig);
  };

  const handleSelectAnnouncement = (announcementId: string) => {
    // Select the announcement item
    selectSection(announcementId);
    toggleConfigPanel(true);
  };

  const handleToggleAnnouncementVisibility = (announcementId: string) => {
    const announcement = announcements.find((a: { id: string }) => a.id === announcementId);
    if (announcement) {
      const updatedAnnouncements = announcements.map((a: { id: string; visible?: boolean }) => 
        a.id === announcementId 
          ? { ...a, visible: !a.visible } 
          : a
      );
      
      const updatedConfig = {
        ...announcementConfig,
        announcements: updatedAnnouncements
      };
      
      updateAnnouncementBarConfigLocal(updatedConfig);
    }
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    const updatedAnnouncements = announcements.filter((a: { id: string }) => a.id !== announcementId);
    
    const updatedConfig = {
      ...announcementConfig,
      announcements: updatedAnnouncements
    };
    
    updateAnnouncementBarConfigLocal(updatedConfig);
  };

  return (
    <div className="pl-8">
      {/* Add Announcement Button */}
      <button
        onClick={handleAddAnnouncement}
        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-blue-600 dark:text-blue-400 
                   hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
      >
        <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Plus className="w-3 h-3" />
        </div>
        <span>Agregar Announcement</span>
      </button>

      {/* List of Announcements with local DnD */}
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {announcements.map((announcement: any, index: number) => (
            <DraggableAnnouncementItem key={announcement.id} itemId={`ann:${section.id}:${announcement.id}`}>
              {({ setNodeRef, attributes, listeners, isDragging, style }) => (
                <div
                  ref={setNodeRef}
                  style={style}
                  className={`group flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors select-none 
                    ${isDragging ? 'ring-1 ring-blue-200/60 shadow-sm bg-white dark:bg-gray-900' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  onClick={() => handleSelectAnnouncement(announcement.id)}
                >
                  {/* Drag handle */}
                  <button
                    className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-70 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
                    aria-label="Reordenar anuncio"
                    {...attributes}
                    {...listeners}
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <circle cx="6" cy="6" r="1" /><circle cx="6" cy="10" r="1" /><circle cx="6" cy="14" r="1" />
                      <circle cx="10" cy="6" r="1" /><circle cx="10" cy="10" r="1" /><circle cx="10" cy="14" r="1" />
                    </svg>
                  </button>

                  {/* Icono y texto */}
                  <RefreshCw className="w-3 h-3 text-gray-400" />
                  <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">
                    Announcement - {announcement.text || 'Sin texto'}
                  </span>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAnnouncementVisibility(announcement.id);
                      }}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label="Mostrar/Ocultar"
                    >
                      {announcement.visible !== false ? (
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAnnouncement(announcement.id);
                      }}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              )}
            </DraggableAnnouncementItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}