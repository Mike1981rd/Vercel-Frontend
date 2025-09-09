'use client';

import React from 'react';
import { X, Image, Layout, Mail, Newspaper, Star, FolderOpen, MessageCircle, HelpCircle, Video, Type, Columns3, LayoutGrid, Images, Package } from 'lucide-react';
import { SectionType, SECTION_CONFIGS } from '@/types/editor.types';
import { useEditorStore } from '@/stores/useEditorStore';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: 'headerGroup' | 'asideGroup' | 'template' | 'footerGroup';
  allowedSections?: SectionType[];
}

const iconMap: Record<string, React.ReactNode> = {
  'image': <Image className="w-5 h-5" />,
  'layout': <Layout className="w-5 h-5" />,
  'gallery-horizontal': <LayoutGrid className="w-5 h-5" />,
  'mail': <Mail className="w-5 h-5" />,
  'newspaper': <Newspaper className="w-5 h-5" />,
  'star': <Star className="w-5 h-5" />,
  'folder-open': <FolderOpen className="w-5 h-5" />,
  'message-circle': <MessageCircle className="w-5 h-5" />,
  'help-circle': <HelpCircle className="w-5 h-5" />,
  'video': <Video className="w-5 h-5" />,
  'text': <Type className="w-5 h-5" />,
  'columns-3': <Columns3 className="w-5 h-5" />,
  'layout-grid': <LayoutGrid className="w-5 h-5" />,
  'images': <Images className="w-5 h-5" />,
  'package': <Package className="w-5 h-5" />
};

export function AddSectionModal({ isOpen, onClose, groupId, allowedSections }: AddSectionModalProps) {
  const { addSection } = useEditorStore();

  if (!isOpen) return null;

  // Filter sections based on group
  const availableSections = Object.values(SECTION_CONFIGS).filter(config => {
    // If allowedSections is specified, only show those
    if (allowedSections && allowedSections.length > 0) {
      return allowedSections.includes(config.type);
    }
    
    // Otherwise, show sections appropriate for the group
    if (groupId === 'headerGroup') {
      // For header group, only show Image Banner (hide Header and Announcement Bar as they come by default)
      return config.category === 'header' && 
             config.type !== SectionType.HEADER && 
             config.type !== SectionType.ANNOUNCEMENT_BAR;
    } else if (groupId === 'asideGroup') {
      return config.category === 'aside';
    } else if (groupId === 'footerGroup') {
      return config.category === 'footer';
    } else {
      return config.category === 'template';
    }
  });

  const handleAddSection = (sectionType: SectionType) => {
    addSection(groupId, sectionType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Section
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-2 gap-4">
            {availableSections.map((config) => (
              <button
                key={config.type}
                onClick={() => handleAddSection(config.type)}
                className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                    {iconMap[config.icon] || <Layout className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {config.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {config.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {availableSections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sections available for this group
            </div>
          )}
        </div>
      </div>
    </div>
  );
}