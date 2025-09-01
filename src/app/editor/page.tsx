'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StructuralComponentsProvider } from '@/contexts/StructuralComponentsContext';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Settings, 
  Image, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Undo, 
  Eye,
  Home,
  Package,
  ShoppingCart,
  CreditCard,
  Grid,
  LayoutGrid,
  Box,
  Bed
} from 'lucide-react';
import { EditorLayout } from '@/components/editor/EditorLayout';
import { useEditorStore } from '@/stores/useEditorStore';
import { PageType, SectionType } from '@/types/editor.types';
import { useEditorTranslations } from '@/hooks/useEditorTranslations';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { useCompany } from '@/hooks/useCompany';
import { StructuralComponentsSync } from '@/components/editor/StructuralComponentsSync';
import { getApiEndpoint } from '@/lib/api-url';

function EditorPageContent() {
  const router = useRouter();
  const { 
    selectedPageId: storePageId, 
    selectedPageType,
    setSelectedPage, 
    isDirty, 
    isSaving, 
    savePage,
    loadPageSections,
    initializeStructuralComponents,
    undo,
    canUndo
  } = useEditorStore();
  
  const { t } = useEditorTranslations();
  const { company } = useCompany();
  
  // Save company ID to localStorage for preview
  useEffect(() => {
    if (company?.id) {
      localStorage.setItem('companyId', company.id.toString());
      console.log('Saved company ID to localStorage:', company.id);
    }
  }, [company?.id]);
  
  const { 
    config: structuralConfig, 
    hasChanges: hasStructuralChanges,
    publish: publishStructural,
    refresh 
  } = useStructuralComponents();
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  
  // Create mock pages with translations and icons
  const mockPages = useMemo(() => [
    { id: '1', name: t('editor.pageTypes.home', 'Página de inicio'), type: PageType.HOME, icon: Home },
    { id: '2', name: t('editor.pageTypes.product', 'Página de producto'), type: PageType.PRODUCT, icon: Package },
    { id: '3', name: t('editor.pageTypes.cart', 'Carrito'), type: PageType.CART, icon: ShoppingCart },
    { id: '4', name: t('editor.pageTypes.checkout', 'Finalizar compra'), type: PageType.CHECKOUT, icon: CreditCard },
    { id: '5', name: t('editor.pageTypes.collection', 'Colección'), type: PageType.COLLECTION, icon: Grid },
    { id: '6', name: t('editor.pageTypes.allCollections', 'Todas las colecciones'), type: PageType.ALL_COLLECTIONS, icon: LayoutGrid },
    { id: '7', name: t('editor.pageTypes.allProducts', 'Todos los productos'), type: PageType.ALL_PRODUCTS, icon: Box },
    { id: '8', name: t('editor.pageTypes.custom', 'Habitaciones'), type: PageType.CUSTOM, icon: Bed }
  ], [t]);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string>('1');
  
  // Initialize selectedPageId based on store's selectedPageType only on first load
  useEffect(() => {
    if (selectedPageType && mockPages.length > 0 && !hasInitialized) {
      const pageFromStore = mockPages.find(p => p.type === selectedPageType);
      if (pageFromStore) {
        console.log('[DEBUG] Initial sync of selectedPageId from store:', {
          pageId: pageFromStore.id,
          pageType: selectedPageType
        });
        setSelectedPageId(pageFromStore.id);
      }
    }
  }, [selectedPageType, mockPages.length, hasInitialized]);
  
  // Find the selected page from mockPages (this will update when language changes)
  const selectedPage = mockPages.find(p => p.id === selectedPageId) || mockPages[0];
  
  // Monitor hasStructuralChanges and isDirty for debugging
  useEffect(() => {
    console.log('[DEBUG] EditorPage - hasStructuralChanges:', hasStructuralChanges, 'isDirty:', isDirty);
  }, [hasStructuralChanges, isDirty]);

  // Debug selected page changes
  useEffect(() => {
    console.log('[DEBUG] Selected page changed:', {
      selectedPageId,
      selectedPageType,
      selectedPageName: selectedPage?.name
    });
  }, [selectedPageId, selectedPageType, selectedPage]);

  // Keyboard shortcut for Undo only
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z for undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
          // Also refresh structural components to reset hasChanges
          refresh();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, canUndo, refresh]);


  useEffect(() => {
    // Load initial page after translations are ready
    // Only select first page if there's no page selected in store
    if (!storePageId && !selectedPageType && mockPages.length > 0 && !hasInitialized) {
      console.log('[DEBUG] No page in store, selecting home');
      handlePageSelect(mockPages[0]);
    } else if (selectedPageType && mockPages.length > 0 && !hasInitialized) {
      // If there's a page type in store but no initialization done yet, load that page
      const pageToLoad = mockPages.find(p => p.type === selectedPageType);
      if (pageToLoad) {
        console.log('[DEBUG] Loading page from store:', pageToLoad.name);
        handlePageSelect(pageToLoad);
      }
    }
  }, [mockPages.length, storePageId, selectedPageType, hasInitialized]);

  // Initialize structural components once when editor loads
  useEffect(() => {
    if (!hasInitialized) {
      initializeStructuralComponents();
      // Save initial state to history
      const store = useEditorStore.getState();
      store.saveHistory();
      setHasInitialized(true);
    }
  }, [hasInitialized, initializeStructuralComponents]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handlePageSelect = async (page: typeof mockPages[0]) => {
    console.log('[DEBUG] Selecting page:', {
      pageId: page.id,
      pageType: page.type,
      pageName: page.name
    });
    
    // Immediately update the dropdown selection
    setSelectedPageId(page.id);
    setIsDropdownOpen(false);
    
    // If it's the custom page, ensure it exists in the database and get real ID
    if (page.type === PageType.CUSTOM) {
      // Set the page type immediately
      setSelectedPage(page.id, page.type);
      
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || '1');
        const token = localStorage.getItem('token');
        
        // Always call ensure-custom to create or update the page
        // This will also update old 'custom' slugs to 'habitaciones'
        console.log('[DEBUG] Calling ensure-custom endpoint to create/update page');
        const ensureResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/websitepages/company/${companyId}/ensure-custom`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (ensureResponse.ok) {
          const pageData = await ensureResponse.json();
          console.log('[DEBUG] Custom page ensured, updating with real ID:', pageData);
          // Update with the real database ID for saving
          setSelectedPage(pageData.id.toString(), page.type);
        } else {
          console.error('[DEBUG] Failed to ensure custom page:', ensureResponse.status);
        }
      } catch (error) {
        console.error('[DEBUG] Error ensuring custom page exists:', error);
      }
    } else {
      console.log('[DEBUG] Setting page for non-custom:', {
        pageId: page.id,
        pageType: page.type,
        pageName: page.name
      });
      setSelectedPage(page.id, page.type);
    }
    
    // First, try to load from localStorage by page type (avoids collisions by mock IDs)
    const pageKey = `page_sections_${page.type.toLowerCase()}`;
    const savedSections = localStorage.getItem(pageKey);
    
    if (savedSections) {
      try {
        const sections = JSON.parse(savedSections);
        console.log('[DEBUG] Loaded sections from localStorage:', {
          pageId: page.id,
          key: pageKey,
          sections: sections,
          count: sections.length
        });
        loadPageSections(sections);
        return; // Exit early if we loaded from localStorage
      } catch (e) {
        console.error('[DEBUG] Error parsing saved sections:', e);
      }
    }
    
    // If no localStorage data, try backend (this will likely fail with mock IDs)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
      const response = await fetch(`${apiUrl}/websitepages/${page.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const pageData = await response.json();
        console.log('[DEBUG] Loaded page data from API:', {
          pageId: pageData.id,
          sections: pageData.sections,
          sectionCount: pageData.sections?.length || 0
        });
        
        if (pageData.sections && Array.isArray(pageData.sections)) {
          const frontendSections = pageData.sections.map((s: any) => ({
            id: s.id || `${s.sectionType}_${s.sortOrder}`,
            type: s.sectionType?.toLowerCase() || s.type,
            name: s.title || s.name || s.sectionType,
            visible: s.isActive !== false,
            settings: typeof s.config === 'string' ? JSON.parse(s.config) : (s.config || {}),
            sortOrder: s.sortOrder || 0
          }));
          
          loadPageSections(frontendSections);
        } else {
          loadPageSections([]);
        }
      } else {
        // No backend data, use defaults
        console.log('[DEBUG] Backend returned:', response.status, '- using defaults');
        if (page.type === PageType.PRODUCT) {
          loadPageSections([{
            id: 'product_info_1',
            type: 'product_information' as any,
            name: 'Product information',
            visible: true,
            settings: {},
            sortOrder: 0
          }]);
        } else {
          loadPageSections([]);
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error loading from backend:', error);
      // Fall back to defaults
      if (page.type === PageType.PRODUCT) {
        loadPageSections([{
          id: 'product_info_1',
          type: 'product_information' as any,
          name: 'Product information',
          visible: true,
          settings: {},
          sortOrder: 0
        }]);
      } else {
        loadPageSections([]);
      }
    }
  };

  const [isSavingLocal, setIsSavingLocal] = useState(false);
  
  const handleSave = async () => {
    console.log('[DEBUG] handleSave clicked:', {
      isDirty,
      hasStructuralChanges,
      selectedPageId
    });
    
    setIsSavingLocal(true);
    try {
      let changesSaved = false;
      
      // Save structural components if they have changes
      if (hasStructuralChanges) {
        await publishStructural();
        if (true) {
          // Force a complete refresh of the structural components
          await refresh();
          changesSaved = true;
        }
      }
      
      // Save sections if they were changed (isDirty)
      if (isDirty) {
        console.log('[DEBUG] Calling savePage() from handleSave');
        await savePage(); // This saves to localStorage and attempts backend
        changesSaved = true;
      }
      
      // Show success message if any changes were saved
      if (changesSaved) {
        toast.success('Cambios guardados exitosamente');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setIsSavingLocal(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Sync component for structural components */}
      <StructuralComponentsSync />
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title={t('editor.actions.exit', 'Salir del Editor')}
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Title */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Aurora</span>
            </div>
            
            {/* Global Settings */}
            <button 
              onClick={() => {
                const store = useEditorStore.getState();
                store.toggleGlobalSettings();
              }}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title={t('editor.panels.globalSettings', 'Configuración Global')}
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Center Section - Page Selector */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded transition-colors"
              >
                {selectedPage.icon && <selectedPage.icon className="w-4 h-4 text-gray-600" />}
                <span className="text-gray-700">{selectedPage.name}</span>
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {mockPages.map((page) => {
                    const PageIcon = page.icon;
                    const isSelected = page.id === selectedPageId;
                    return (
                      <button
                        key={page.id}
                        onClick={() => handlePageSelect(page)}
                        className={`
                          w-full text-left px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg
                          flex items-center gap-3
                          ${isSelected 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'hover:bg-gray-50 text-gray-700'
                          }
                        `}
                      >
                        <PageIcon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span>{page.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Undo only */}
            <button 
              onClick={() => {
                undo();
                refresh(); // Reset structural components hasChanges
              }}
              disabled={!canUndo()}
              className={`p-1.5 rounded transition-colors ${
                canUndo() 
                  ? 'hover:bg-gray-100 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`} 
              title={t('editor.actions.undo', 'Deshacer')}
            >
              <Undo className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Device Preview Icons */}
            <div className="flex items-center gap-1 ml-2">
              <button 
                onClick={() => {
                  setDeviceView('desktop');
                  // Do not force desktop in preview; remove override to use real viewport
                  localStorage.removeItem('editorDeviceView');
                }}
                className={`p-1.5 rounded transition-colors ${
                  deviceView === 'desktop' 
                    ? 'bg-gray-200' 
                    : 'hover:bg-gray-100'
                }`} 
                title={t('editor.toolbar.desktop', 'Escritorio')}
              >
                <Monitor className={`w-4 h-4 ${
                  deviceView === 'desktop' ? 'text-gray-900' : 'text-gray-600'
                }`} />
              </button>
              {/* Tablet button hidden as requested */}
              {/* <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title={t('editor.toolbar.tablet', 'Tablet')}>
                <Tablet className="w-4 h-4 text-gray-600" />
              </button> */}
              <button 
                onClick={() => {
                  setDeviceView('mobile');
                  // Force mobile in preview to match editor mobile toggle
                  localStorage.setItem('editorDeviceView', 'mobile');
                }}
                className={`p-1.5 rounded transition-colors ${
                  deviceView === 'mobile' 
                    ? 'bg-gray-200' 
                    : 'hover:bg-gray-100'
                }`} 
                title={t('editor.toolbar.mobile', 'Móvil')}
              >
                <Smartphone className={`w-4 h-4 ${
                  deviceView === 'mobile' ? 'text-gray-900' : 'text-gray-600'
                }`} />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <button 
                onClick={() => {
                  // For preview: only force mobile; let desktop use real viewport
                  if (deviceView === 'mobile') {
                    localStorage.setItem('editorDeviceView', 'mobile');
                  } else {
                    localStorage.removeItem('editorDeviceView');
                  }
                  // Open preview in new tab with the current page handle
                  // Map page type to the correct URL handle
                  let handle = 'home';
                  switch(selectedPage.type) {
                    case PageType.HOME:
                      handle = 'home';
                      break;
                    case PageType.PRODUCT:
                      handle = 'product';
                      break;
                    case PageType.CART:
                      handle = 'cart';
                      break;
                    case PageType.CHECKOUT:
                      handle = 'checkout';
                      break;
                    case PageType.COLLECTION:
                      handle = 'collection';
                      break;
                    case PageType.ALL_COLLECTIONS:
                      handle = 'all-collections';
                      break;
                    case PageType.ALL_PRODUCTS:
                      handle = 'all-products';
                      break;
                    case PageType.CUSTOM:
                      handle = 'habitaciones';
                      break;
                  }
                  try {
                    // Best-effort prefetch (if supported)
                    // @ts-ignore
                    if (router.prefetch) {
                      // @ts-ignore
                      router.prefetch(`/${handle}`);
                    }
                  } catch {}
                  setTimeout(() => window.open(`/${handle}`, '_blank'), 50);
                }}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors" 
                title={t('editor.actions.preview', 'Vista Previa')}
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Save Button - NUEVO Y SIMPLE */}
            <button
              onClick={handleSave}
              disabled={isSavingLocal || (!hasStructuralChanges && !isDirty)}
              className={`
                ml-3 px-4 py-1.5 rounded text-sm font-medium transition-all
                ${(!isSavingLocal && (hasStructuralChanges || isDirty))
                  ? 'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSavingLocal ? 'Guardando...' : 'Guardar'}
            </button>

            {/* Publish Button */}
            <button
              onClick={async () => {
                try {
                  // First save if there are changes
                  if (hasStructuralChanges || isDirty) {
                    await handleSave();
                  }
                  // Then publish
                  const response = await fetch(
                    getApiEndpoint(`/structural-components/company/${company?.id || 1}/publish`),
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({ createBackup: false })
                    }
                  );
                  if (response.ok) {
                    toast.success('Cambios publicados exitosamente');
                  } else {
                    toast.error('Error al publicar los cambios');
                  }
                } catch (error) {
                  console.error('Error publishing:', error);
                  toast.error('Error al publicar');
                }
              }}
              className="ml-2 px-4 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all"
            >
              Publicar
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden relative">
        <EditorLayout deviceView={deviceView} />
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <StructuralComponentsProvider>
      <EditorPageContent />
    </StructuralComponentsProvider>
  );
}
