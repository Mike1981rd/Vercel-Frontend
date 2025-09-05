/**
 * @file AddMulticolumnBlockModal.tsx
 * @max-lines 150
 * @module Multicolumns
 * @description Modal para seleccionar el tipo de bloque a agregar
 */

'use client';

import React from 'react';
import { X, Type, Image } from 'lucide-react';

interface AddMulticolumnBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'icon' | 'image') => void;
}

export default function AddMulticolumnBlockModal({ 
  isOpen, 
  onClose, 
  onSelect 
}: AddMulticolumnBlockModalProps) {
  if (!isOpen) return null;

  const handleSelect = (type: 'icon' | 'image') => {
    onSelect(type);
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
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 pointer-events-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select block type
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              
              {/* Icon Column Option */}
              <button
                onClick={() => handleSelect('icon')}
                className="group relative flex flex-col items-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <div className="w-16 h-16 mb-3 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 flex items-center justify-center transition-colors">
                  <Type className="w-8 h-8 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Icon column
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Display an icon with text content
                </p>
              </button>
              
              {/* Image Column Option */}
              <button
                onClick={() => handleSelect('image')}
                className="group relative flex flex-col items-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <div className="w-16 h-16 mb-3 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 flex items-center justify-center transition-colors">
                  <Image className="w-8 h-8 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Image column
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Display an image or video with text
                </p>
              </button>
              
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}