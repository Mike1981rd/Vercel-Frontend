'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, MoreHorizontal, Image, Monitor, Tablet, Smartphone, Undo, Redo, Eye } from 'lucide-react';
import { EditorLayout } from '@/components/editor/EditorLayout';
import { useEditorStore } from '@/stores/useEditorStore';
import { PageType } from '@/types/editor.types';

// Mock pages for now - later will come from API
const mockPages = [
  { id: '1', name: 'Página de inicio', type: PageType.HOME },
  { id: '2', name: 'Página de producto', type: PageType.PRODUCT },
  { id: '3', name: 'Carrito', type: PageType.CART },
  { id: '4', name: 'Finalizar compra', type: PageType.CHECKOUT },
  { id: '5', name: 'Colección', type: PageType.COLLECTION },
  { id: '6', name: 'Todas las colecciones', type: PageType.ALL_COLLECTIONS },
  { id: '7', name: 'Todos los productos', type: PageType.ALL_PRODUCTS },
  { id: '8', name: 'Página personalizada', type: PageType.CUSTOM }
];

export default function EditorPage() {
  const { 
    selectedPageId, 
    selectedPageType,
    setSelectedPage, 
    isDirty, 
    isSaving, 
    savePage,
    loadPageSections 
  } = useEditorStore();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPage, setSelectedPageLocal] = useState(mockPages[0]);

  useEffect(() => {
    // Load initial page
    if (!selectedPageId) {
      handlePageSelect(mockPages[0]);
    }
  }, []);

  const handlePageSelect = (page: typeof mockPages[0]) => {
    setSelectedPageLocal(page);
    setSelectedPage(page.id, page.type);
    setIsDropdownOpen(false);
    
    // Load page sections from API (mock for now)
    if (page.type === PageType.PRODUCT) {
      // Product pages always have product information
      loadPageSections([
        {
          id: 'product_info_1',
          type: 'product_information' as any,
          name: 'Product information',
          visible: true,
          settings: {},
          sortOrder: 0
        }
      ]);
    } else {
      // Other pages start empty
      loadPageSections([]);
    }
  };

  const handleSave = async () => {
    await savePage();
    // Show success message
    console.log('Page saved successfully');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Volver al dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Title */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Aurora</span>
            </div>
            
            {/* More Options */}
            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Center Section - Page Selector */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded transition-colors"
              >
                <Image className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">{selectedPage.name}</span>
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {mockPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => handlePageSelect(page)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Deshacer">
              <Undo className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Rehacer">
              <Redo className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Device Preview Icons */}
            <div className="flex items-center gap-1 ml-2">
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Vista Desktop">
                <Monitor className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Vista Tablet">
                <Tablet className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Vista Móvil">
                <Smartphone className="w-4 h-4 text-gray-600" />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Vista previa">
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`
                ml-3 px-4 py-1.5 rounded text-sm font-medium transition-all
                ${isDirty 
                  ? 'bg-gray-900 text-white hover:bg-gray-800' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden relative">
        <EditorLayout />
      </div>
    </div>
  );
}