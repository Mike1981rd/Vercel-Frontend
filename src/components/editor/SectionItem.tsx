'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Link2Off, FileText, Layout, ShoppingCart, Search, Megaphone, Trash2 } from 'lucide-react';
import { Section, SectionType } from '@/types/editor.types';
import { useEditorStore } from '@/stores/useEditorStore';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';

interface SectionItemProps {
  section: Section;
  groupId: 'headerGroup' | 'asideGroup' | 'template' | 'footerGroup';
  isDragging?: boolean;
}

// Map section types to icons
const sectionIcons: Record<string, React.ReactNode> = {
  [SectionType.ANNOUNCEMENT_BAR]: <FileText className="w-4 h-4" />,
  [SectionType.HEADER]: <FileText className="w-4 h-4" />,
  [SectionType.IMAGE_BANNER]: <FileText className="w-4 h-4" />,
  [SectionType.CART_DRAWER]: <FileText className="w-4 h-4" />,
  [SectionType.SEARCH_DRAWER]: <Search className="w-4 h-4" />,
  [SectionType.FOOTER]: <FileText className="w-4 h-4" />,
  // Add more mappings as needed
  default: <FileText className="w-4 h-4" />
};

export function SectionItem({ section, groupId, isDragging = false }: SectionItemProps) {
  const [showActions, setShowActions] = useState(false);
  const { 
    selectedSectionId, 
    selectSection, 
    toggleSectionVisibility, 
    removeSection 
  } = useEditorStore();
  const { 
    config: structuralConfig, 
    updateAnnouncementBarConfigLocal,
    updateHeaderConfigLocal,
    updateFooterConfigLocal,
    updateCartDrawerConfigLocal
  } = useStructuralComponents();
  
  const isSelected = selectedSectionId === section.id;
  
  // Structural components cannot be deleted
  const isStructuralComponent = [
    SectionType.HEADER,
    SectionType.ANNOUNCEMENT_BAR,
    SectionType.FOOTER,
    SectionType.CART_DRAWER
  ].includes(section.type);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isStructuralComponent && window.confirm(`¿Eliminar "${section.name}"?`)) {
      removeSection(groupId, section.id);
    }
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Toggle in the store
    toggleSectionVisibility(groupId, section.id);
    
    // If it's AnnouncementBar, also update the structural components context
    if (section.type === SectionType.ANNOUNCEMENT_BAR) {
      // Get current config or create default
      const currentConfig = structuralConfig?.announcementBar || {
        enabled: false,
        messages: [],
        animation: 'slide',
        speed: 5000,
        colorScheme: '1'
      };
      
      // Update the visibility/enabled state
      const updatedConfig = {
        ...currentConfig,
        enabled: !section.visible // Toggle based on current state
      };
      
      console.log('Updating AnnouncementBar config:', updatedConfig);
      updateAnnouncementBarConfigLocal(updatedConfig);
    }
    
    // If it's Header, also update the structural components context
    if (section.type === SectionType.HEADER) {
      // Get current config or use section settings
      const currentConfig = structuralConfig?.header || section.settings || {};
      
      // Update the visibility state
      const updatedConfig = {
        ...currentConfig,
        visible: !section.visible // Toggle based on current state
      };
      
      console.log('Updating Header config with visibility:', updatedConfig);
      updateHeaderConfigLocal(updatedConfig as any);
    }
    
    // If it's Footer, also update the structural components context
    if (section.type === SectionType.FOOTER) {
      // Get current config or create default
      const currentConfig = structuralConfig?.footer || {
        visible: true,
        layout: 'default',
        colorScheme: '1'
      };
      
      // Update the visibility state
      const updatedConfig = {
        ...currentConfig,
        visible: !section.visible // Toggle based on current state
      };
      
      console.log('Updating Footer config with visibility:', updatedConfig);
      updateFooterConfigLocal(updatedConfig);
    }
    
    // If it's CartDrawer, also update the structural components context
    if (section.type === SectionType.CART_DRAWER) {
      // Get current config or create default
      const currentConfig = structuralConfig?.cartDrawer || {
        enabled: true,
        position: 'right',
        colorScheme: '1'
      };
      
      // Update the enabled state
      const updatedConfig = {
        ...currentConfig,
        enabled: !section.visible // Toggle based on current state
      };
      
      console.log('Updating CartDrawer config with enabled state:', updatedConfig);
      updateCartDrawerConfigLocal(updatedConfig);
    }
  };

  const handleSelect = () => {
    selectSection(section.id);
  };

  const icon = sectionIcons[section.type] || sectionIcons.default;

  return (
    <div
      className={`
        group relative flex items-center px-4 py-2 cursor-pointer transition-all
        ${isSelected 
          ? 'bg-blue-100 border-l-2 border-blue-500' 
          : 'hover:bg-gray-100 border-l-2 border-transparent'
        }
        ${isDragging ? 'opacity-50' : ''}
        ${!section.visible ? 'opacity-50' : ''}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={handleSelect}
    >
      {/* Chevron/Arrow */}
      <div className="mr-2">
        <svg className="w-2 h-2 text-gray-400" fill="currentColor" viewBox="0 0 6 10">
          <path d="M1 1l4 4-4 4" />
        </svg>
      </div>

      {/* Icon */}
      <div className="mr-2 text-gray-500">
        {icon}
      </div>

      {/* Section Name */}
      <span className={`flex-1 text-sm ${isSelected ? 'font-medium text-blue-600' : 'text-gray-700'}`}>
        {section.name}
      </span>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-1">
          {/* Visibility Toggle */}
          <button
            onClick={handleToggleVisibility}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title={section.visible ? 'Ocultar sección' : 'Mostrar sección'}
          >
            {section.visible ? (
              <Eye className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
          
          {/* Delete Button - Only for non-structural components */}
          {!isStructuralComponent && (
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              title="Eliminar sección"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}