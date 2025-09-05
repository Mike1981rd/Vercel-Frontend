'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { 
  GripVertical, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  Link2, 
  Search, 
  Home, 
  ShoppingBag, 
  FileText, 
  Package, 
  ChevronDown,
  Edit2,
  ChevronRight,
  X,
  Bed
} from 'lucide-react';
import { API_URL } from '@/lib/constants';
import { getApiEndpoint } from '@/lib/api-url';

interface MenuItem {
  id?: string;
  label: string;
  link: string;
  type?: string;
  order: number;
  children?: MenuItem[];
  parentId?: string;
}

interface NavigationMenu {
  name: string;
  identifier: string;
  menuType?: string;
  items: MenuItem[];
  isActive: boolean;
}

interface Props {
  menuId?: number;
}

// Tipos de datos dinámicos
interface Collection {
  id: number;
  title: string;
  handle: string;
}

interface Product {
  id: number;
  name: string;
  sku?: string;
}

interface Page {
  id: number;
  title: string;
  slug: string;
  isVisible?: boolean;
  publishStatus?: string;
}

interface Policy {
  id: number;
  title: string;
  type?: string;
}

export default function NavigationMenuForm({ menuId }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [showLinkPicker, setShowLinkPicker] = useState<string | null>(null);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Datos dinámicos
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  
  // Estado del drag & drop
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<NavigationMenu>({
    name: '',
    identifier: '',
    menuType: 'header',
    items: [],
    isActive: true
  });

  const dragItem = useRef<any>(null);
  const dragNode = useRef<any>(null);

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
    
    // Cargar datos dinámicos
    fetchCollections();
    fetchProducts();
    fetchPages();
    fetchPolicies();
  }, []);

  useEffect(() => {
    if (menuId) {
      fetchMenu();
    }
  }, [menuId]);

  // Fetch de datos dinámicos
  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
      const response = await fetch(`${apiUrl}/Collections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCollections(data.items || data || []);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
      const response = await fetch(`${apiUrl}/Products?pageSize=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.items || data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
      // Usar el endpoint correcto: paginas (minúsculas)
      const response = await fetch(`${apiUrl}/paginas?pageSize=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Fetching pages, response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Pages API response:', data);
        
        // Manejar diferentes estructuras de respuesta
        let pagesList = [];
        if (data.data && data.data.items) {
          // Si viene envuelto en data con items
          pagesList = data.data.items;
        } else if (data.items) {
          // Si viene directamente con items
          pagesList = data.items;
        } else if (Array.isArray(data)) {
          // Si es un array directo
          pagesList = data;
        }
        
        console.log('Pages extracted:', pagesList);
        setPages(pagesList);
      } else {
        console.log('Pages API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('Error details:', errorText);
        setPages([]);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      setPages([]);
    }
  };

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
      const response = await fetch(`${apiUrl}/Policies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.items || data || []);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/NavigationMenu/${menuId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Función para convertir SubItems a children recursivamente
        const convertSubItemsToChildren = (item: any): MenuItem => ({
          ...item,
          id: item.id || generateItemId(),
          children: item.subItems ? item.subItems.map(convertSubItemsToChildren) : [],
          subItems: undefined // Remover subItems del objeto
        });
        
        // Asegurar que cada item tenga un ID y convertir subItems a children
        const itemsWithIds = (data.items || []).map(convertSubItemsToChildren);
        
        setFormData({
          name: data.name,
          identifier: data.identifier,
          menuType: data.menuType || 'header',
          items: itemsWithIds,
          isActive: data.isActive
        });
      } else {
        toast.error(t('menus.error.loadFailed'), t('menus.error.tryAgain'));
        router.push('/dashboard/navigation-menus');
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error(t('menus.error.networkError'), t('menus.error.checkConnection'));
    } finally {
      setLoading(false);
    }
  };

  // Generar ID único para cada item
  const generateItemId = () => {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddItem = (parentId?: string) => {
    const newItem: MenuItem = {
      id: generateItemId(),
      label: '',
      link: '',
      type: 'external',
      order: 0,
      children: [],
      parentId: parentId
    };
    
    if (parentId) {
      // Agregar como hijo con estructura de árbol
      const addChildToItem = (items: MenuItem[]): MenuItem[] => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newItem]
            };
          }
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: addChildToItem(item.children)
            };
          }
          return item;
        });
      };
      
      setFormData(prev => ({
        ...prev,
        items: addChildToItem(prev.items)
      }));
    } else {
      // Agregar al nivel principal
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { ...newItem, order: prev.items.length }]
      }));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const removeFromItems = (items: MenuItem[]): MenuItem[] => {
      return items.filter(item => {
        if (item.id === itemId) return false;
        if (item.children) {
          item.children = removeFromItems(item.children);
        }
        return true;
      });
    };
    
    setFormData(prev => ({
      ...prev,
      items: removeFromItems(prev.items)
    }));
  };

  const handleUpdateItem = (itemId: string, field: keyof MenuItem, value: string) => {
    const updateInItems = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, [field]: value };
        }
        if (item.children) {
          return {
            ...item,
            children: updateInItems(item.children)
          };
        }
        return item;
      });
    };
    
    setFormData(prev => ({
      ...prev,
      items: updateInItems(prev.items)
    }));
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    dragItem.current = itemId;
    dragNode.current = e.target;
    dragNode.current.addEventListener('dragend', handleDragEnd);
    
    setTimeout(() => {
      if (dragNode.current) {
        dragNode.current.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent, itemId: string) => {
    if (draggedItem !== itemId) {
      setDragOverItem(itemId);
    }
  };

  const handleDragEnd = () => {
    if (dragNode.current) {
      dragNode.current.style.opacity = '1';
      dragNode.current.removeEventListener('dragend', handleDragEnd);
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
    dragItem.current = null;
    dragNode.current = null;
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;
    
    const reorderItems = (items: MenuItem[]): MenuItem[] => {
      const draggedIndex = items.findIndex(item => item.id === draggedItem);
      const targetIndex = items.findIndex(item => item.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newItems = [...items];
        const [draggedEl] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedEl);
        
        return newItems.map((item, index) => ({
          ...item,
          order: index
        }));
      }
      
      return items.map(item => ({
        ...item,
        children: item.children ? reorderItems(item.children) : []
      }));
    };
    
    setFormData(prev => ({
      ...prev,
      items: reorderItems(prev.items)
    }));
    
    setDragOverItem(null);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.warning(t('menus.validation.nameRequired'), t('menus.validation.enterName'));
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const url = menuId 
        ? `${API_URL}/NavigationMenu/${menuId}`
        : `${API_URL}/NavigationMenu`;
      
      const method = menuId ? 'PUT' : 'POST';

      // Generar identificador si es nuevo
      if (!menuId && !formData.identifier) {
        formData.identifier = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }

      // Función para limpiar los items antes de enviar
      const cleanItems = (items: MenuItem[]): any[] => {
        return items.map((item, index) => ({
          label: item.label,
          link: item.link,
          type: item.type || 'external',
          order: index,
          subItems: item.children && item.children.length > 0 
            ? cleanItems(item.children) 
            : undefined  // No enviar array vacío, usar undefined
        }));
      };

      const dataToSend = {
        ...formData,
        items: cleanItems(formData.items)
      };

      // Log para debugging
      console.log('Sending menu data:', dataToSend);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        toast.success(
          menuId ? t('menus.success.updated') : t('menus.success.created'),
          menuId ? t('menus.success.changesSaved') : t('menus.success.menuCreated')
        );
        setTimeout(() => {
          router.push('/dashboard/navigation-menus');
        }, 1000);
      } else {
        const errorText = await response.text();
        console.error('Save error:', response.status, errorText);
        toast.error(
          t('menus.error.saveFailed'), 
          `Error ${response.status}: ${errorText.substring(0, 100)}`
        );
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error(t('menus.error.networkError'), t('menus.error.checkConnection'));
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!menuId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/NavigationMenu/${menuId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(t('menus.success.duplicated'), t('menus.success.copyCreated'));
        router.push('/dashboard/navigation-menus');
      }
    } catch (error) {
      toast.error(t('menus.error.duplicateFailed'), t('menus.error.tryAgain'));
    }
  };

  const handleDelete = async () => {
    if (!menuId) return;
    
    // Confirmación antes de eliminar
    const confirmDelete = window.confirm(
      t('menus.confirm.delete', `¿Estás seguro de que deseas eliminar el menú "${formData.name}"? Esta acción no se puede deshacer.`)
    );
    
    if (!confirmDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiEndpoint(`/NavigationMenu/${menuId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(
          t('menus.success.deleted', 'Menú eliminado'),
          t('menus.success.deletedMessage', 'El menú ha sido eliminado exitosamente')
        );
        router.push('/dashboard/navigation-menus');
      } else {
        const errorText = await response.text();
        console.error('Delete error:', response.status, errorText);
        toast.error(
          t('menus.error.deleteFailed', 'Error al eliminar'),
          t('menus.error.tryAgain', 'Por favor, intenta nuevamente')
        );
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error(
        t('menus.error.networkError', 'Error de conexión'),
        t('menus.error.checkConnection', 'Verifica tu conexión a internet')
      );
    }
  };

  // Generar opciones de enlace dinámicas
  const getLinkOptions = () => {
    const options = [
      { icon: <Home className="w-4 h-4" />, label: t('menus.links.homePage'), value: '/' },
      { icon: <Search className="w-4 h-4" />, label: t('menus.links.search'), value: '/search' },
      { icon: <Bed className="w-4 h-4" />, label: 'Lista de Habitaciones', value: '/habitaciones-lista' },
    ];

    // Agregar colecciones
    if (collections.length > 0) {
      options.push({
        icon: <Package className="w-4 h-4" />,
        label: t('menus.links.allCollections'),
        value: '/collections'
      });
      collections.forEach(col => {
        options.push({
          icon: <Package className="w-4 h-4" />,
          label: `${t('menus.links.collection')}: ${col.title}`,
          value: `/collections/${col.handle}`
        });
      });
    }

    // Agregar productos
    if (products.length > 0) {
      products.forEach(prod => {
        // Generar un slug del nombre o usar el ID
        const prodSlug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || prod.id.toString();
        options.push({
          icon: <ShoppingBag className="w-4 h-4" />,
          label: `${t('menus.links.product')}: ${prod.name}`,
          value: `/products/${prodSlug}`
        });
      });
    }

    // Agregar páginas
    if (pages.length > 0) {
      pages.forEach(page => {
        // Usar el slug directamente para que funcione con el router dinámico
        options.push({
          icon: <FileText className="w-4 h-4" />,
          label: `${t('menus.links.page', 'Página')}: ${page.title}`,
          value: `/${page.slug}` // Cambio: usar solo el slug
        });
      });
    }

    // Agregar políticas
    if (policies.length > 0) {
      policies.forEach(policy => {
        const policySlug = policy.type || policy.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || policy.id.toString();
        options.push({
          icon: <FileText className="w-4 h-4" />,
          label: `${t('menus.links.policy')}: ${policy.title}`,
          value: `/${policySlug}` // Cambio: usar solo el slug
        });
      });
    }

    return options;
  };

  // Filtrar opciones según búsqueda
  const getFilteredOptions = () => {
    const options = getLinkOptions();
    if (!searchTerm) return options;
    
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Estado para la posición del dropdown
  const [dropdownPositions, setDropdownPositions] = useState<{ [key: string]: 'top' | 'bottom' }>({});

  // Función para calcular la posición del dropdown
  const calculateDropdownPosition = (itemId: string, buttonElement: HTMLElement | null) => {
    if (!buttonElement) return;
    
    const rect = buttonElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 384; // max-h-96 = 24rem = 384px
    
    // Si no hay suficiente espacio abajo (menos que la altura del dropdown + margen)
    // pero sí hay suficiente espacio arriba, mostrar arriba
    const position = spaceBelow < (dropdownHeight + 20) && spaceAbove > (dropdownHeight + 20) ? 'top' : 'bottom';
    
    setDropdownPositions(prev => ({
      ...prev,
      [itemId]: position
    }));
  };

  // Renderizar item del menú con todos los controles
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isChild = level > 0;
    
    return (
      <div key={item.id} className="space-y-2">
        {/* Indicador de hijo con línea de árbol */}
        {isChild && (
          <div className="flex items-start">
            <div className="w-6 ml-2 mr-2">
              <div className="border-l-2 border-gray-300 dark:border-gray-600 h-full ml-2">
                <div className="border-t-2 border-gray-300 dark:border-gray-600 w-4 mt-6"></div>
              </div>
            </div>
            <div className="flex-1">
              {renderItemContent(item, level)}
            </div>
          </div>
        )}
        
        {/* Item principal */}
        {!isChild && renderItemContent(item, level)}
        
        {/* Renderizar hijos */}
        {item.children && item.children.length > 0 && (
          <div className={`space-y-2 ${!isChild ? 'ml-8' : ''}`}>
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderItemContent = (item: MenuItem, level: number) => {
    const dropdownPosition = dropdownPositions[item.id!] || 'bottom';

    return (
      <div 
        className={`flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group ${
          dragOverItem === item.id ? 'ring-2 ring-blue-500' : ''
        }`}
        draggable
        onDragStart={(e) => handleDragStart(e, item.id!)}
        onDragEnter={(e) => handleDragEnter(e, item.id!)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, item.id!)}
      >
        {/* Drag handle */}
        <div className="mt-7">
          <button className="cursor-move p-1">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Inputs */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t('menus.fields.label')}
            </label>
            <input
              type="text"
              value={item.label}
              onChange={(e) => handleUpdateItem(item.id!, 'label', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              placeholder={t('menus.placeholders.label')}
            />
          </div>
          
          <div className="relative">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t('menus.fields.link')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={item.link}
                onChange={(e) => handleUpdateItem(item.id!, 'link', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                placeholder="#"
              />
              <button
                onClick={(e) => {
                  const button = e.currentTarget;
                  calculateDropdownPosition(item.id!, button);
                  setShowLinkPicker(showLinkPicker === item.id ? null : item.id!);
                  setSearchTerm('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <Link2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              
              {/* Dropdown de selección de enlaces - Posición dinámica */}
              {showLinkPicker === item.id && (
                <div 
                  className={`absolute z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden ${
                    dropdownPosition === 'top' 
                      ? 'bottom-full mb-1 right-0' 
                      : 'top-full mt-1 right-0'
                  }`}
                >
                  <div className="p-3 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('menus.search')}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setShowLinkPicker(null);
                          setSearchTerm('');
                        }}
                        className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {getFilteredOptions().map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleUpdateItem(item.id!, 'link', option.value);
                          setShowLinkPicker(null);
                          setSearchTerm('');
                        }}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                      >
                        {option.icon}
                        <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
                      </button>
                    ))}
                    {getFilteredOptions().length === 0 && (
                      <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        {t('menus.noResults')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action buttons - Alineados con inputs */}
        <div className="flex items-center gap-1 mt-7">
          <button
            onClick={() => console.log('Edit:', item.id)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title={t('common.edit')}
          >
            <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          
          <button
            onClick={() => handleAddItem(item.id)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title={t('menus.addChild')}
          >
            <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          
          <button
            onClick={() => handleRemoveItem(item.id!)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title={t('common.delete')}
          >
            <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header estilo Shopify */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/navigation-menus')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">⚫</span>
                <h1 className="text-xl font-medium text-gray-900 dark:text-white">
                  {menuId ? formData.name || t('menus.untitled') : t('menus.addMenu')}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {menuId && (
                <>
                  <button
                    onClick={handleDuplicate}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {t('common.duplicate')}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowMoreActions(!showMoreActions)}
                      className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1"
                    >
                      {t('menus.moreActions')}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {showMoreActions && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                        <button 
                          onClick={() => {
                            // TODO: Implementar vista en tienda
                            toast.info(
                              t('menus.info.notImplemented', 'Función no implementada'),
                              t('menus.info.comingSoon', 'Esta función estará disponible pronto')
                            );
                            setShowMoreActions(false);
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {t('menus.viewInStore')}
                        </button>
                        <button 
                          onClick={() => {
                            setShowMoreActions(false);
                            handleDelete();
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {t('menus.deleteMenu')}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 text-white text-sm rounded-lg transition-colors disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('menus.fields.name')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    placeholder={t('menus.placeholders.name')}
                  />
                </div>

                {!menuId && (
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {t('menus.fields.identifier')}: {formData.identifier || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Elementos del menú */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                {t('menus.menuElements')}
              </h2>

              <div className="space-y-3">
                {formData.items.map(item => renderMenuItem(item))}
                
                <button
                  onClick={() => handleAddItem()}
                  className="w-full py-3 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 hover:opacity-80"
                  style={{ 
                    borderColor: primaryColor,
                    color: primaryColor,
                    backgroundColor: `${primaryColor}10`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${primaryColor}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${primaryColor}10`;
                  }}
                >
                  <Plus className="w-4 h-4" />
                  {t('menus.addElement')}
                </button>
              </div>
            </div>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                {t('menus.visibility')}
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('menus.activeMenu')}
                  </span>
                </label>
              </div>
            </div>

            {menuId && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t('menus.menuIdentifier')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.identifier}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
