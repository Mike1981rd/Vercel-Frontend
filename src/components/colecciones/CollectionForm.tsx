'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { 
  createCollection, 
  updateCollection, 
  getCollection,
  deleteCollection, 
  generateHandle,
  checkHandleExists,
  Collection,
  CreateCollectionDto,
  UpdateCollectionDto
} from '@/lib/api/collections';
import { 
  ArrowLeft, 
  Upload, 
  Save,
  Globe,
  Search,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  IndentDecrease,
  IndentIncrease,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Image as ImageIcon,
  Cloud,
  Trash2,
  GripVertical,
  X
} from 'lucide-react';

interface CollectionFormProps {
  collectionId?: number;
}

interface Product {
  id: number;
  name: string;
  isActive: boolean;
  basePrice?: number;
  stock?: number;
  images?: string[];
}

export default function CollectionForm({ collectionId }: CollectionFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  
  // Form data
  const [formData, setFormData] = useState<CreateCollectionDto>({
    title: '',
    description: '',
    handle: '',
    isActive: true,
    image: '',
    onlineStore: true,
    pointOfSale: false,
    facebook: false,
    instagram: false,
    tikTok: false,
    whatsAppBusiness: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    publishToSearchEngines: true,
    productIds: []
  });

  const [handleError, setHandleError] = useState('');
  const [autoGenerateHandle, setAutoGenerateHandle] = useState(true);
  
  // Products state
  const [assignedProducts, setAssignedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [draggedProduct, setDraggedProduct] = useState<number | null>(null);
  const productsDropdownRef = useRef<HTMLDivElement>(null);

  // Get primary color from localStorage
  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  // Load collection if editing
  useEffect(() => {
    if (collectionId) {
      loadCollection();
    }
  }, [collectionId]);

  // Load all products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target as Node)) {
        setShowProductsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadCollection = async () => {
    if (!collectionId) return;
    
    try {
      setLoading(true);
      const collection = await getCollection(collectionId);
      setFormData({
        title: collection.title,
        description: collection.description || '',
        handle: collection.handle,
        isActive: collection.isActive,
        image: collection.image || '',
        onlineStore: collection.onlineStore,
        pointOfSale: collection.pointOfSale,
        facebook: collection.facebook,
        instagram: collection.instagram,
        tikTok: collection.tikTok,
        whatsAppBusiness: collection.whatsAppBusiness,
        seoTitle: collection.seoTitle || '',
        seoDescription: collection.seoDescription || '',
        seoKeywords: collection.seoKeywords || '',
        publishToSearchEngines: collection.publishToSearchEngines,
        productIds: []
      });
      setAutoGenerateHandle(false);
    } catch (error) {
      console.error('Error loading collection:', error);
      alert(t('collections.loadError', 'Error loading collection'));
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate handle from title
  useEffect(() => {
    if (autoGenerateHandle && formData.title && !collectionId) {
      const handle = generateHandle(formData.title);
      setFormData(prev => ({ ...prev, handle }));
      setHandleError(''); // Clear any previous errors
    }
  }, [formData.title, autoGenerateHandle, collectionId]);

  // Validate handle uniqueness
  const validateHandle = async () => {
    // If handle is empty, generate one from title
    if (!formData.handle && formData.title) {
      const generatedHandle = generateHandle(formData.title);
      setFormData(prev => ({ ...prev, handle: generatedHandle }));
      // Continue with the generated handle
      try {
        const exists = await checkHandleExists(generatedHandle, collectionId);
        if (exists) {
          // If exists, add a number suffix
          let counter = 1;
          let newHandle = `${generatedHandle}-${counter}`;
          while (await checkHandleExists(newHandle, collectionId)) {
            counter++;
            newHandle = `${generatedHandle}-${counter}`;
          }
          setFormData(prev => ({ ...prev, handle: newHandle }));
        }
        setHandleError('');
        return true;
      } catch (error) {
        console.error('Error checking handle:', error);
        // Continue anyway, let the backend handle it
        return true;
      }
    }
    
    if (!formData.handle) {
      setHandleError(t('collections.handleRequired', 'Handle is required'));
      return false;
    }

    try {
      const exists = await checkHandleExists(formData.handle, collectionId);
      if (exists) {
        setHandleError(t('collections.handleExists', 'This handle already exists'));
        return false;
      }
      setHandleError('');
      return true;
    } catch (error) {
      console.error('Error checking handle:', error);
      // Continue anyway, let the backend handle it
      return true;
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If no handle, generate one from title
    if (!formData.handle && formData.title) {
      const generatedHandle = generateHandle(formData.title);
      setFormData(prev => ({ ...prev, handle: generatedHandle }));
    }
    
    if (!await validateHandle()) {
      return;
    }

    setSaving(true);
    try {
      if (collectionId) {
        // Update existing collection - convert empty strings to undefined for optional fields
        const updateData: UpdateCollectionDto = {
          title: formData.title,
          description: formData.description || undefined,
          handle: formData.handle || generateHandle(formData.title),
          isActive: formData.isActive,
          image: formData.image || undefined,
          onlineStore: formData.onlineStore,
          pointOfSale: formData.pointOfSale,
          facebook: formData.facebook,
          instagram: formData.instagram,
          tikTok: formData.tikTok,
          whatsAppBusiness: formData.whatsAppBusiness,
          seoTitle: formData.seoTitle || undefined,
          seoDescription: formData.seoDescription || undefined,
          seoKeywords: formData.seoKeywords || undefined,
          publishToSearchEngines: formData.publishToSearchEngines,
          // productIds: formData.productIds // Remove if not in UpdateCollectionDto
        };
        await updateCollection(collectionId, updateData);
      } else {
        // Create new collection - only send what's necessary
        const dataToSend: any = {
          title: formData.title  // ONLY REQUIRED FIELD
        };
        
        // Only add optional fields if they have actual values
        if (formData.description) dataToSend.description = formData.description;
        if (formData.handle) dataToSend.handle = formData.handle;
        if (formData.image) dataToSend.image = formData.image;
        if (formData.seoTitle) dataToSend.seoTitle = formData.seoTitle;
        if (formData.seoDescription) dataToSend.seoDescription = formData.seoDescription;
        if (formData.seoKeywords) dataToSend.seoKeywords = formData.seoKeywords;
        
        // Only send boolean values if explicitly changed from defaults
        if (formData.isActive !== true) dataToSend.isActive = formData.isActive;
        if (formData.onlineStore !== true) dataToSend.onlineStore = formData.onlineStore;
        if (formData.pointOfSale !== false) dataToSend.pointOfSale = formData.pointOfSale;
        if (formData.facebook !== false) dataToSend.facebook = formData.facebook;
        if (formData.instagram !== false) dataToSend.instagram = formData.instagram;
        if (formData.tikTok !== false) dataToSend.tikTok = formData.tikTok;
        if (formData.whatsAppBusiness !== false) dataToSend.whatsAppBusiness = formData.whatsAppBusiness;
        if (formData.publishToSearchEngines !== true) dataToSend.publishToSearchEngines = formData.publishToSearchEngines;
        if (formData.productIds && formData.productIds.length > 0) dataToSend.productIds = formData.productIds;
        
        console.log('Minimal data being sent:', dataToSend);
        await createCollection(dataToSend);
      }
      
      router.push('/dashboard/colecciones');
    } catch (error: any) {
      console.error('Error saving collection:', error);
      const errorMessage = error.message || t('collections.saveError', 'Error saving collection');
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload to server
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5266/api/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({ ...prev, image: data.url }));
        } else {
          const error = await response.json();
          alert(error.error || 'Error uploading image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image');
      }
    }
  };

  // Handle delete collection
  const handleDelete = async () => {
    if (!collectionId) return;
    
    const confirmMessage = t('collections.confirmDelete', 
      `¿Estás seguro de que deseas eliminar "${formData.title}"? Esta acción no se puede deshacer.`
    );
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      setSaving(true);
      await deleteCollection(collectionId);
      router.push('/dashboard/colecciones');
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert(t('collections.deleteError', 'Error al eliminar la colección'));
    } finally {
      setSaving(false);
    }
  };

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5266/api/products?pageSize=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllProducts(data.items || []);
        
        // If editing, load assigned products
        if (collectionId) {
          const collectionProductsResponse = await fetch(`http://localhost:5266/api/collections/${collectionId}/products`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (collectionProductsResponse.ok) {
            const assignedData = await collectionProductsResponse.json();
            setAssignedProducts(assignedData || []);
            setFormData(prev => ({ 
              ...prev, 
              productIds: assignedData.map((p: Product) => p.id) 
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, productId: number) => {
    setDraggedProduct(productId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedProduct === null) return;
    
    const draggedIndex = assignedProducts.findIndex(p => p.id === draggedProduct);
    if (draggedIndex === -1) return;
    
    const newProducts = [...assignedProducts];
    const [draggedItem] = newProducts.splice(draggedIndex, 1);
    newProducts.splice(targetIndex, 0, draggedItem);
    
    setAssignedProducts(newProducts);
    setFormData(prev => ({ 
      ...prev, 
      productIds: newProducts.map(p => p.id) 
    }));
    setDraggedProduct(null);
  };

  // Add product to collection
  const addProductToCollection = (product: Product) => {
    if (!assignedProducts.find(p => p.id === product.id)) {
      const newProducts = [...assignedProducts, product];
      setAssignedProducts(newProducts);
      setFormData(prev => ({ 
        ...prev, 
        productIds: newProducts.map(p => p.id) 
      }));
    }
    setProductSearch('');
    setShowProductsDropdown(false);
  };

  // Remove product from collection
  const removeProductFromCollection = (productId: number) => {
    const newProducts = assignedProducts.filter(p => p.id !== productId);
    setAssignedProducts(newProducts);
    setFormData(prev => ({ 
      ...prev, 
      productIds: newProducts.map(p => p.id) 
    }));
  };

  // Filter products for search
  const filteredProducts = allProducts.filter(product => 
    !assignedProducts.find(p => p.id === product.id) &&
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
          style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/colecciones')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          {t('common.back', 'Back')}
        </button>

        <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                {t('navigation.dashboard', 'Dashboard')}
              </a>
            </li>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li>
              <a href="/dashboard/colecciones" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                {t('navigation.colecciones', 'Collections')}
              </a>
            </li>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li className="text-gray-700 font-medium dark:text-gray-300">
              {collectionId ? t('collections.edit', 'Edit') : t('collections.create', 'Create')}
            </li>
          </ol>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {collectionId 
            ? t('collections.editTitle', 'Editar colección')
            : t('collections.createTitle', 'Crear colección')
          }
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('collections.fields.title', 'Título')} *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('collections.titlePlaceholder', 'ej., Colección de verano, Menos de 100 $, Nuestros favoritos')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                required
              />
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('collections.fields.description', 'Descripción')}
              </label>
              
              {/* Rich Text Editor Toolbar */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-t-lg p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-700">
                <select className="px-2 py-1 text-sm border-r border-gray-300 dark:border-gray-600 bg-transparent">
                  <option>Párrafo</option>
                  <option>Título 1</option>
                  <option>Título 2</option>
                </select>
                
                <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <Bold className="h-4 w-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <Italic className="h-4 w-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <Underline className="h-4 w-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <Strikethrough className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <List className="h-4 w-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <ListOrdered className="h-4 w-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <IndentDecrease className="h-4 w-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <IndentIncrease className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <AlignLeft className="h-4 w-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <AlignCenter className="h-4 w-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <AlignRight className="h-4 w-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <AlignJustify className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex gap-1">
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <Link className="h-4 w-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <Cloud className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('collections.descriptionPlaceholder', 'Escribe aquí la descripción de tu colección...')}
                className="w-full px-4 py-3 border border-t-0 border-gray-300 dark:border-gray-600 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                rows={6}
              />
            </div>

            {/* Handle */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('collections.fields.handle', 'Handle')}
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  ({t('collections.autoGenerated', 'Se genera automáticamente')})
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.handle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newHandle = e.target.value.toLowerCase()
                      .replace(/[^a-z0-9-]/g, '-')
                      .replace(/-+/g, '-')
                      .replace(/^-|-$/g, '');
                    setFormData(prev => ({ ...prev, handle: newHandle }));
                    setAutoGenerateHandle(false);
                    setHandleError('');
                  }}
                  onBlur={validateHandle}
                  placeholder={formData.title ? generateHandle(formData.title) : "se-generará-del-título"}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all ${
                    handleError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                />
                {handleError && (
                  <p className="mt-1 text-sm text-red-600">{handleError}</p>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('collections.handleHelp', 'El handle es la parte de la URL que identifica la colección. Se genera automáticamente desde el título.')}
              </p>
            </div>

            {/* SEO */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('collections.seo.title', 'Publicación en motores de búsqueda')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('collections.seo.pageTitle', 'Título de la página')}
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder={formData.title || t('collections.seo.pageTitlePlaceholder', 'Título para motores de búsqueda')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('collections.seo.metaDescription', 'Meta descripción')}
                  </label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder={t('collections.seo.metaDescriptionPlaceholder', 'Descripción breve para motores de búsqueda')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('collections.seo.keywords', 'Palabras clave')}
                  </label>
                  <input
                    type="text"
                    value={formData.seoKeywords}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
                    placeholder={t('collections.seo.keywordsPlaceholder', 'palabra1, palabra2, palabra3')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="publishToSearchEngines"
                    checked={formData.publishToSearchEngines}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, publishToSearchEngines: e.target.checked }))}
                    className="rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <label htmlFor="publishToSearchEngines" className="text-sm text-gray-700 dark:text-gray-300">
                    {t('collections.seo.publish', 'Publicar en motores de búsqueda')}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('collections.status.title', 'Estado')}
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formData.isActive ? t('common.active', 'Activa') : t('common.inactive', 'Inactiva')}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('collections.status.help', 'Las colecciones activas son visibles en tu tienda')}
              </p>
            </div>

            {/* Sales Channels */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('collections.channels.title', 'Canales de venta')}
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.onlineStore}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, onlineStore: e.target.checked }))}
                    className="rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('collections.channels.onlineStore', 'Tienda online')}
                  </span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pointOfSale}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, pointOfSale: e.target.checked }))}
                    className="rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('collections.channels.pointOfSale', 'Punto de venta')}
                  </span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.facebook}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, facebook: e.target.checked }))}
                    className="rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Facebook
                  </span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.instagram}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, instagram: e.target.checked }))}
                    className="rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Instagram
                  </span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tikTok}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, tikTok: e.target.checked }))}
                    className="rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    TikTok
                  </span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.whatsAppBusiness}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, whatsAppBusiness: e.target.checked }))}
                    className="rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    WhatsApp Business
                  </span>
                </label>
              </div>
              
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {t('collections.channels.help', 'La colección estará disponible en los canales seleccionados')}
              </p>
            </div>

            {/* Image */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('collections.image.title', 'Imagen')}
              </h3>
              
              {formData.image ? (
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Collection"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    {t('common.remove', 'Remove')}
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {t('collections.image.placeholder', 'Agregar imagen')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t('collections.image.hint', 'o arrastra una imagen para subirla')}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="mt-4 inline-block px-4 py-2 text-sm text-white rounded-lg cursor-pointer transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {t('common.selectFile', 'Select File')}
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('collections.products', 'Productos')}
            </h3>
            
            {/* Product Search/Add */}
            <div className="mb-4 relative" ref={productsDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('collections.addProducts', 'Agregar productos')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setProductSearch(e.target.value);
                    setShowProductsDropdown(true);
                  }}
                  onFocus={() => setShowProductsDropdown(true)}
                  placeholder={t('collections.searchProducts', 'Buscar productos...')}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              
              {/* Products Dropdown */}
              {showProductsDropdown && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProductToCollection(product)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded" />
                        )}
                        <span className="text-gray-900 dark:text-white">{product.name}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {product.isActive ? t('common.active', 'ACTIVO') : t('common.inactive', 'INACTIVO')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Assigned Products List */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('collections.assignedProducts', 'Productos asignados')} ({assignedProducts.length})
              </label>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 min-h-[200px]">
                {assignedProducts.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {t('collections.noProducts', 'No hay productos asignados a esta colección')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignedProducts.map((product, index) => (
                      <div
                        key={product.id}
                        draggable
                        onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, product.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(e, index)}
                        className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between cursor-move hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          {/* Drag Handle */}
                          <GripVertical className="h-5 w-5 text-gray-400" />
                          
                          {/* Product Info */}
                          <div className="flex items-center gap-3">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded" />
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {product.isActive ? t('common.active', 'ACTIVO') : t('common.inactive', 'INACTIVO')}
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => removeProductFromCollection(product.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('collections.dragToReorder', 'Arrastra y suelta para reordenar los productos')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          {/* Delete button - only show when editing */}
          <div>
            {collectionId && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-6 py-2 text-red-600 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
                {t('common.delete', 'Eliminar')}
              </button>
            )}
          </div>
          
          {/* Save/Cancel buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/colecciones')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white transition-colors"
            >
              {t('common.cancel', 'CANCELAR')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('common.saving', 'Guardando...')}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {t('common.save', 'Guardar')}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}