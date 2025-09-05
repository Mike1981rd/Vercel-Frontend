/**
 * @file AddFooterBlockModal.tsx
 * @max-lines 200
 * Modal for selecting footer block type to add
 */

'use client';

import React from 'react';
import { X, Type, Image, Menu, Mail, Share2, Building } from 'lucide-react';
import { FooterBlockType } from './modules/Footer/FooterTypes';

interface AddFooterBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (type: FooterBlockType) => void;
}

const blockTypes = [
  {
    type: FooterBlockType.LOGO_WITH_TEXT,
    name: 'Logo con texto',
    icon: Building,
    description: 'Logo de la empresa con texto descriptivo'
  },
  {
    type: FooterBlockType.SUBSCRIBE,
    name: 'Suscripción',
    icon: Mail,
    description: 'Formulario de suscripción al newsletter'
  },
  {
    type: FooterBlockType.SOCIAL_MEDIA,
    name: 'Redes sociales',
    icon: Share2,
    description: 'Enlaces a redes sociales'
  },
  {
    type: FooterBlockType.MENU,
    name: 'Menú',
    icon: Menu,
    description: 'Lista de enlaces de navegación'
  },
  {
    type: FooterBlockType.TEXT,
    name: 'Texto',
    icon: Type,
    description: 'Bloque de texto personalizado'
  },
  {
    type: FooterBlockType.IMAGE,
    name: 'Imagen',
    icon: Image,
    description: 'Imagen o logo adicional'
  }
];

export function AddFooterBlockModal({ isOpen, onClose, onAddBlock }: AddFooterBlockModalProps) {
  if (!isOpen) return null;

  const handleAddBlock = (type: FooterBlockType) => {
    onAddBlock(type);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Agregar bloque al Footer
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-2 gap-3">
              {blockTypes.map((block) => {
                const Icon = block.icon;
                return (
                  <button
                    key={block.type}
                    onClick={() => handleAddBlock(block.type)}
                    className="flex flex-col items-center p-4 border-2 border-gray-200 dark:border-gray-700 
                             rounded-lg hover:border-blue-500 dark:hover:border-blue-400 
                             hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 
                                  group-hover:bg-blue-100 dark:group-hover:bg-blue-900 
                                  flex items-center justify-center mb-3 transition-colors">
                      <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400 
                                     group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {block.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {block.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}