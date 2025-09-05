'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, FileText } from 'lucide-react';
import { SectionItem } from './SectionItem';
import { AddSectionModal } from './AddSectionModal';
import { ConfigPanel } from './ConfigPanel';
import { GlobalSettingsPanel } from './GlobalSettingsPanel';
import { useEditorStore } from '@/stores/useEditorStore';
import { SectionType } from '@/types/editor.types';
import { useEditorTranslations } from '@/hooks/useEditorTranslations';

interface SectionGroup {
  id: 'headerGroup' | 'asideGroup' | 'template' | 'footerGroup';
  name: string;
  isCollapsed: boolean;
}

export function EditorSidebar() {
  const { sections, selectedSectionId, isConfigPanelOpen, isGlobalSettingsOpen } = useEditorStore();
  const { t } = useEditorTranslations();
  
  const [groups, setGroups] = useState<SectionGroup[]>([
    { id: 'headerGroup', name: 'Header Group', isCollapsed: false },
    { id: 'asideGroup', name: 'Aside Group', isCollapsed: false },
    { id: 'template', name: t('editor.panels.content', 'Contenido'), isCollapsed: false },
    { id: 'footerGroup', name: 'Footer Group', isCollapsed: false }
  ]);
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    groupId: 'headerGroup' | 'asideGroup' | 'template' | 'footerGroup' | null;
  }>({ isOpen: false, groupId: null });

  const toggleGroup = (groupId: string) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, isCollapsed: !group.isCollapsed }
          : group
      )
    );
  };

  const openAddModal = (groupId: 'headerGroup' | 'asideGroup' | 'template' | 'footerGroup') => {
    setModalState({ isOpen: true, groupId });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, groupId: null });
  };

  // Find selected section to show config panel
  const selectedSection = selectedSectionId 
    ? Object.values(sections).flat().find(s => s.id === selectedSectionId)
    : null;

  // Show Global Settings Panel if active
  if (isGlobalSettingsOpen) {
    return <GlobalSettingsPanel />;
  }

  // Show Config Panel if a section is selected
  if (isConfigPanelOpen && selectedSection) {
    return <ConfigPanel section={selectedSection} />;
  }

  return (
    <>
      <div className="w-[280px] h-full bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Page Title Section */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">{t('editor.panels.pages', 'Páginas')}: Home</span>
          </div>
        </div>
        
        {/* Sections List */}
        <div className="flex-1 overflow-y-auto py-3">
          {groups.map((group) => (
            <div key={group.id} className="mb-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  {group.isCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  <span className="uppercase tracking-wider">{group.name}</span>
                </div>
              </button>

              {/* Group Content */}
              {!group.isCollapsed && (
                <div className="">
                  {/* Section Items */}
                  <div className="">
                    {sections[group.id].map((section) => (
                      <SectionItem
                        key={section.id}
                        section={section}
                        groupId={group.id}
                      />
                    ))}
                  </div>

                  {/* Add Section Button - Hidden for headerGroup */}
                  {group.id !== 'headerGroup' && (
                    <button
                      onClick={() => openAddModal(group.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all group"
                    >
                      <div className="w-5 h-5 rounded border border-gray-400 border-dashed flex items-center justify-center group-hover:border-gray-600">
                        <Plus className="w-3 h-3" />
                      </div>
                      <span>{t('editor.sidebar.addSection', 'Agregar sección')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        groupId={modalState.groupId || 'template'}
      />
    </>
  );
}