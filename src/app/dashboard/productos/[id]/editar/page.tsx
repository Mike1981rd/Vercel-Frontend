'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link2, 
  Upload,
  X,
  Plus,
  ChevronLeft,
  Trash2,
  GripVertical
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { ProductMessages } from '@/constants/productMessages';
import { getApiEndpoint } from '@/lib/api-url';
import { formatCurrencyInput, unformatCurrency } from '@/utils/currency';

interface Collection {
  id: number;
  title: string;
  isActive: boolean;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  comparePrice?: number;
  costPerItem?: number;
  stock: number;
  sku?: string;
  barcode?: string;
  trackQuantity: boolean;
  continueSellingWhenOutOfStock: boolean;
  productType?: string;
  vendor?: string;
  tags?: string[];
  images?: string[];
  weight?: number;
  weightUnit?: string;
  requiresShipping: boolean;
  isActive: boolean;
  collections?: string[];
}

export default function EditProductPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formattedPrice, setFormattedPrice] = useState('');
  const [formattedComparePrice, setFormattedComparePrice] = useState('');
  const [formattedCostPerItem, setFormattedCostPerItem] = useState('');
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  
  // Drag and drop handlers for images
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleImageDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === targetIndex) return;

    const newImages = [...uploadedImages];
    const [draggedImage] = newImages.splice(draggedImageIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);
    
    setUploadedImages(newImages);
    setDraggedImageIndex(null);
  };

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null);
  };
  
  const [formData, setFormData] = useState<Product>({
    id: 0,
    name: '',
    description: '',
    basePrice: 0,
    comparePrice: undefined,
    costPerItem: undefined,
    stock: 0,
    sku: '',
    barcode: '',
    trackQuantity: true,
    continueSellingWhenOutOfStock: false,
    productType: '',
    vendor: '',
    tags: [],
    images: [],
    weight: 0,
    weightUnit: 'kg',
    requiresShipping: true,
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
    fetchProduct();
    fetchCollections();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint(`/products/${productId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const product = result.data || result;
        setFormData(product);
        setUploadedImages(product.images || []);
        
        // Set formatted prices
        if (product.basePrice > 0) {
          setFormattedPrice(formatCurrencyInput(product.basePrice.toString()));
        }
        if (product.comparePrice > 0) {
          setFormattedComparePrice(formatCurrencyInput(product.comparePrice.toString()));
        }
        if (product.costPerItem > 0) {
          setFormattedCostPerItem(formatCurrencyInput(product.costPerItem.toString()));
        }
        
        // Get selected collections
        if (product.collections) {
          // Need to fetch collection IDs from names
          // For now, we'll handle this when collections are loaded
        }
      } else if (response.status === 404) {
        setErrorMessage(ProductMessages.business.productNotFound);
        setTimeout(() => router.push('/dashboard/productos'), 2000);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setErrorMessage(ProductMessages.database.connectionFailed);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint('/collections'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCollections(data.items || []);
        
        // Match collection names to IDs for selected collections
        if (formData.collections && data.items) {
          const selected = data.items
            .filter((c: Collection) => formData.collections?.includes(c.title))
            .map((c: Collection) => c.id);
          setSelectedCollections(selected);
        }
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    for (let file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(ProductMessages.fileOperation.invalidImageFormat);
        continue;
      }

      if (file.size > maxSize) {
        setErrorMessage(ProductMessages.fileOperation.imageSizeExceeded);
        continue;
      }

      // Here you would upload to your server
      // For now, we'll use a local URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages(prev => [...prev, event.target?.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags && formData.tags.length < 20) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    } else if (formData.tags && formData.tags.length >= 20) {
      setErrorMessage(ProductMessages.validation.tooManyTags);
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = ProductMessages.validation.nameRequired;
    } else if (formData.name.length > 200) {
      newErrors.name = ProductMessages.validation.nameTooLong;
    }

    if (formData.basePrice !== undefined && formData.basePrice < 0) {
      newErrors.basePrice = ProductMessages.validation.invalidPrice;
    }

    if (formData.comparePrice && formData.basePrice && formData.comparePrice <= formData.basePrice) {
      newErrors.comparePrice = ProductMessages.validation.invalidComparePrice;
    }

    if (formData.stock !== undefined && formData.stock < 0) {
      newErrors.stock = ProductMessages.validation.invalidStock;
    }

    if (formData.weight !== undefined && formData.weight < 0) {
      newErrors.weight = ProductMessages.validation.invalidWeight;
    }

    if (uploadedImages.length > 10) {
      newErrors.images = ProductMessages.validation.tooManyImages;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        name: formData.name,
        description: formData.description,
        basePrice: formData.basePrice,
        comparePrice: formData.comparePrice,
        costPerItem: formData.costPerItem,
        stock: formData.stock,
        sku: formData.sku,
        barcode: formData.barcode,
        trackQuantity: formData.trackQuantity,
        continueSellingWhenOutOfStock: formData.continueSellingWhenOutOfStock,
        productType: formData.productType,
        vendor: formData.vendor,
        tags: formData.tags,
        images: uploadedImages,
        weight: formData.weight,
        weightUnit: formData.weightUnit,
        requiresShipping: formData.requiresShipping,
        isActive: formData.isActive
      };

      const response = await fetch(getApiEndpoint(`/products/${productId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        // Update collections
        await fetch(getApiEndpoint(`/products/${productId}/collections`), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(selectedCollections)
        });

        setSuccessMessage(ProductMessages.success.productUpdated);
        setTimeout(() => {
          router.push('/dashboard/productos');
        }, 1500);
      } else {
        const error = await response.json();
        setErrorMessage(error.message || ProductMessages.database.updateFailed);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setErrorMessage(ProductMessages.database.connectionFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('products.confirmDelete', '¿Estás seguro de que deseas eliminar este producto?'))) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint(`/products/${productId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccessMessage(ProductMessages.success.productDeleted);
        setTimeout(() => {
          router.push('/dashboard/productos');
        }, 1500);
      } else {
        const error = await response.json();
        setErrorMessage(error.message || ProductMessages.database.deleteFailed);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setErrorMessage(ProductMessages.database.connectionFailed);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">
          {t('common.loading', 'Cargando...')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/productos')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('products.edit', 'Editar producto')}
              </h1>
            </div>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('products.confirmDelete', '¿Estás seguro de eliminar este producto?')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('products.deleteWarning', 'Esta acción no se puede deshacer.')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDelete();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('common.delete', 'Eliminar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('products.information', 'Información del producto')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.title', 'Título')} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('products.titlePlaceholder', 'Habitación Ejecutiva')}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.description', 'Descripción')}
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-300 dark:border-gray-600">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Bold className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Italic className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Underline className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <List className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Link2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('products.descriptionPlaceholder', 'Una experiencia desfad')}
                      rows={6}
                      className="w-full px-3 py-2 focus:outline-none dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Multimedia */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('products.multimedia', 'Multimedia')}
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('products.dragToReorder', 'Arrastra las imágenes para cambiar el orden. La primera imagen será la principal.')}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleImageDragStart(e, index)}
                    onDragOver={handleImageDragOver}
                    onDrop={(e) => handleImageDrop(e, index)}
                    onDragEnd={handleImageDragEnd}
                    className={`relative aspect-square cursor-move ${
                      draggedImageIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Principal badge for first image */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-white dark:bg-gray-800 text-xs font-medium rounded-md shadow-lg"
                           style={{ color: primaryColor }}>
                        {t('products.mainImage', 'Principal')}
                      </div>
                    )}
                    
                    {/* Drag handle */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity">
                      <GripVertical className="w-4 h-4 text-gray-500" />
                    </div>
                    
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('products.addMoreImages', 'Agregar más imágenes')}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {t('products.dragOrClick', 'o arrastra imágenes para subir')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {errors.images && (
                <p className="mt-2 text-sm text-red-600">{errors.images}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('products.pricing', 'Precios')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.price', 'Precio')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      value={formattedPrice}
                      onChange={(e) => {
                        const formatted = formatCurrencyInput(e.target.value);
                        setFormattedPrice(formatted);
                        const numericValue = unformatCurrency(formatted);
                        setFormData({ ...formData, basePrice: numericValue });
                      }}
                      onFocus={(e) => {
                        if (formData.basePrice === 0) {
                          setFormattedPrice('');
                        }
                      }}
                      onBlur={(e) => {
                        if (formData.basePrice > 0) {
                          setFormattedPrice(formatCurrencyInput(formData.basePrice.toString()));
                        }
                      }}
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white ${
                        errors.basePrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ '--tw-ring-color': primaryColor } as any}
                    />
                  </div>
                  {errors.basePrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.comparePrice', 'Precio comparado')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      value={formattedComparePrice}
                      onChange={(e) => {
                        const formatted = formatCurrencyInput(e.target.value);
                        setFormattedComparePrice(formatted);
                        const numericValue = unformatCurrency(formatted);
                        setFormData({ ...formData, comparePrice: numericValue || undefined });
                      }}
                      onBlur={(e) => {
                        if (formData.comparePrice && formData.comparePrice > 0) {
                          setFormattedComparePrice(formatCurrencyInput(formData.comparePrice.toString()));
                        }
                      }}
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white ${
                        errors.comparePrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ '--tw-ring-color': primaryColor } as any}
                    />
                  </div>
                  {errors.comparePrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.comparePrice}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.trackQuantity}
                    onChange={(e) => setFormData({ ...formData, trackQuantity: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('products.chargeTax', 'Cobrar impuestos en este producto')}
                  </span>
                </label>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('products.costPerItem', 'Costo por artículo')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="text"
                    value={formattedCostPerItem}
                    onChange={(e) => {
                      const formatted = formatCurrencyInput(e.target.value);
                      setFormattedCostPerItem(formatted);
                      const numericValue = unformatCurrency(formatted);
                      setFormData({ ...formData, costPerItem: numericValue || undefined });
                    }}
                    onBlur={(e) => {
                      if (formData.costPerItem && formData.costPerItem > 0) {
                        setFormattedCostPerItem(formatCurrencyInput(formData.costPerItem.toString()));
                      }
                    }}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('products.profitInfo', 'Los clientes no verán esto')}
                </p>
              </div>
            </div>

            {/* Inventory Control */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('products.inventoryControl', 'Control de inventario')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.sku', 'SKU (Código de inventario)')}
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.barcode', 'Código de barras')}
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.trackQuantity}
                      onChange={(e) => setFormData({ ...formData, trackQuantity: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600"
                      style={{ accentColor: primaryColor }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('products.trackQuantity', 'Rastrear cantidad')}
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.continueSellingWhenOutOfStock}
                      onChange={(e) => setFormData({ ...formData, continueSellingWhenOutOfStock: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600"
                      style={{ accentColor: primaryColor }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('products.continueSellingWhenOut', 'Continuar vendiendo cuando esté agotado')}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.quantity', 'Cantidad')}
                  </label>
                  <input
                    type="number"
                    value={formData.stock === 0 ? '' : formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white ${
                      errors.stock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('products.shipping', 'Envío')}
              </h2>

              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.requiresShipping}
                    onChange={(e) => setFormData({ ...formData, requiresShipping: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('products.physicalProduct', 'Este es un producto físico')}
                  </span>
                </label>

                {formData.requiresShipping && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('products.weight', 'Peso')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.weight === 0 ? '' : formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white ${
                          errors.weight ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        style={{ '--tw-ring-color': primaryColor } as any}
                      />
                      <select
                        value={formData.weightUnit}
                        onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white"
                        style={{ '--tw-ring-color': primaryColor } as any}
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                      </select>
                    </div>
                    {errors.weight && (
                      <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Visibility */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('products.visibility', 'Visibilidad')}
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setFormData({ ...formData, isActive: true })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.isActive
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                  style={{
                    backgroundColor: formData.isActive ? primaryColor : undefined
                  }}
                >
                  {t('products.active', 'Activo')}
                </button>
                <button
                  onClick={() => setFormData({ ...formData, isActive: false })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    !formData.isActive
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t('products.draft', 'Borrador')}
                </button>
              </div>
              
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {formData.isActive
                  ? t('products.activeInfo', 'Los productos activos son visibles en tu tienda')
                  : t('products.draftInfo', 'Los borradores no son visibles en tu tienda')
                }
              </p>
            </div>

            {/* Organization */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('products.organization', 'Organización')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.productType', 'Tipo de producto')}
                  </label>
                  <input
                    type="text"
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.vendor', 'Proveedor')}
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.collections', 'Colecciones')}
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {collections.map((collection) => (
                      <label key={collection.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCollections.includes(collection.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCollections([...selectedCollections, collection.id]);
                            } else {
                              setSelectedCollections(selectedCollections.filter(id => id !== collection.id));
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600"
                          style={{ accentColor: primaryColor }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {collection.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.tags', 'Etiquetas')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder={t('products.addTag', 'Agregar etiqueta')}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white"
                      style={{ '--tw-ring-color': primaryColor } as any}
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(index)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('products.tagsSeparator', 'Separa las etiquetas con comas')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleDelete}
            className="px-6 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {t('common.delete', 'Eliminar')}
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/productos')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {saving ? t('common.saving', 'Guardando...') : t('common.save', 'Guardar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
