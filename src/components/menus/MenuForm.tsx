'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { Plus, Trash2, GripVertical, ChevronRight, Home, ShoppingBag, Search, FileText, Package, Hash, ExternalLink } from 'lucide-react';

interface MenuItem {
  label: string;
  link: string;
  type?: string;
  order: number;
  subItems?: MenuItem[];
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

export default function MenuForm({ menuId }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  
  const [formData, setFormData] = useState<NavigationMenu>({
    name: '',
    identifier: '',
    menuType: 'header',
    items: [],
    isActive: true
  });

  const [showLinkPicker, setShowLinkPicker] = useState<number | null>(null);

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);

  useEffect(() => {
    if (menuId) {
      fetchMenu();
    }
  }, [menuId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5266/api/NavigationMenu/${menuId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name,
          identifier: data.identifier,
          menuType: data.menuType || 'header',
          items: data.items || [],
          isActive: data.isActive
        });
      } else {
        const errorData = await response.text();
        console.error('Error response:', response.status, errorData);
        toast.error(
          t('menus.error.loadFailed', 'Error al cargar el menú'),
          t('menus.error.tryAgain', 'Por favor, intenta nuevamente más tarde')
        );
        router.push('/dashboard/menus');
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error(
        t('menus.error.networkError', 'Error de conexión'),
        t('menus.error.checkConnection', 'Verifica tu conexión a internet')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    const newItem: MenuItem = {
      label: '',
      link: '#',
      type: 'external',
      order: formData.items.length
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateItem = (index: number, field: keyof MenuItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.name || !formData.identifier) {
      toast.warning(
        t('menus.validation.required', 'Campos requeridos'),
        t('menus.validation.requiredMessage', 'Por favor completa el nombre y el identificador del menú')
      );
      return;
    }

    if (formData.items.length === 0) {
      toast.warning(
        t('menus.validation.noItems', 'Sin elementos'),
        t('menus.validation.addAtLeastOne', 'Agrega al menos un elemento al menú')
      );
      return;
    }

    // Validar que todos los items tengan etiqueta
    const invalidItems = formData.items.filter(item => !item.label.trim());
    if (invalidItems.length > 0) {
      toast.warning(
        t('menus.validation.emptyLabels', 'Etiquetas vacías'),
        t('menus.validation.allItemsNeedLabel', 'Todos los elementos del menú deben tener una etiqueta')
      );
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const url = menuId 
        ? `http://localhost:5266/api/NavigationMenu/${menuId}`
        : 'http://localhost:5266/api/NavigationMenu';
      
      const method = menuId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          items: formData.items.map((item, index) => ({
            ...item,
            order: index
          }))
        })
      });

      if (response.ok) {
        // Mensaje de éxito
        if (menuId) {
          toast.success(
            t('menus.success.updated', 'Menú actualizado'),
            t('menus.success.updatedMessage', 'Los cambios se han guardado correctamente')
          );
        } else {
          toast.success(
            t('menus.success.created', 'Menú creado'),
            t('menus.success.createdMessage', 'El menú se ha creado exitosamente')
          );
        }
        
        // Pequeño delay para mostrar el mensaje antes de navegar
        setTimeout(() => {
          router.push('/dashboard/menus');
        }, 1000);
      } else {
        const errorData = await response.text();
        console.error('Error response:', response.status, errorData);
        
        // Mensajes de error específicos
        if (response.status === 400) {
          try {
            const errorJson = JSON.parse(errorData);
            if (errorJson.error && errorJson.error.includes('identifier')) {
              toast.error(
                t('menus.error.duplicateIdentifier', 'Identificador duplicado'),
                t('menus.error.identifierExists', 'Ya existe un menú con ese identificador')
              );
            } else {
              toast.error(
                t('menus.error.validationFailed', 'Error de validación'),
                errorJson.error || t('menus.error.checkFields', 'Verifica los campos del formulario')
              );
            }
          } catch {
            toast.error(
              t('menus.error.save', 'Error al guardar'),
              t('menus.error.tryAgain', 'Por favor, intenta nuevamente')
            );
          }
        } else if (response.status === 401) {
          toast.error(
            t('common.sessionExpired', 'Sesión expirada'),
            t('common.pleaseLogin', 'Por favor, inicia sesión nuevamente')
          );
          router.push('/login');
        } else {
          toast.error(
            t('menus.error.save', 'Error al guardar'),
            t('menus.error.unexpectedError', 'Ocurrió un error inesperado')
          );
        }
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error(
        t('menus.error.networkError', 'Error de conexión'),
        t('menus.error.checkConnection', 'Verifica tu conexión a internet')
      );
    } finally {
      setSaving(false);
    }
  };

  const generateIdentifier = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const getLinkTypeIcon = (type?: string) => {
    switch (type) {
      case 'page':
        return <FileText className="w-4 h-4" />;
      case 'collection':
        return <Package className="w-4 h-4" />;
      case 'product':
        return <ShoppingBag className="w-4 h-4" />;
      case 'search':
        return <Search className="w-4 h-4" />;
      case 'home':
        return <Home className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const linkOptions = [
    { value: '/tienda-online', label: t('menus.links.onlineStore', 'Tienda online'), type: 'page', icon: <ShoppingBag className="w-4 h-4" /> },
    { value: '/', label: t('menus.links.homePage', 'Página de inicio'), type: 'home', icon: <Home className="w-4 h-4" /> },
    { value: '/search', label: t('menus.links.search', 'Búsqueda'), type: 'search', icon: <Search className="w-4 h-4" /> },
    { value: '/collections', label: t('menus.links.collections', 'Colecciones'), type: 'collection', icon: <Package className="w-4 h-4" /> },
    { value: '/products', label: t('menus.links.products', 'Productos'), type: 'product', icon: <ShoppingBag className="w-4 h-4" /> },
    { value: '/pages', label: t('menus.links.pages', 'Páginas'), type: 'page', icon: <FileText className="w-4 h-4" /> },
    { value: '/blog', label: t('menus.links.blog', 'Blogs'), type: 'page', icon: <FileText className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <circle className="opacity-75" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"
              strokeDasharray="60" strokeDashoffset="60" />
          </svg>
          {t('common.loading', 'Cargando...')}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/dashboard/menus" className="hover:text-gray-900 dark:hover:text-gray-200">
            {t('menus.title', 'Menús')}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>{menuId ? t('common.edit', 'Editar') : t('common.create', 'Crear')}</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {menuId ? t('menus.edit', 'Editar menú') : t('menus.create', 'Agregar menú')}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('menus.fields.name', 'Nombre')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    name: e.target.value,
                    identifier: !menuId ? generateIdentifier(e.target.value) : prev.identifier
                  }));
                }}
                placeholder={t('menus.placeholders.name', 'p. ej., Menú de barra lateral')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-opacity-30"
                style={{ '--tw-ring-color': primaryColor } as any}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('menus.fields.identifier', 'Identificador')}
              </label>
              <input
                type="text"
                value={formData.identifier}
                onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                readOnly={!!menuId}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('menus.help.identifier', 'Este identificador se usa para referenciar el menú en el código')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('menus.fields.type', 'Tipo de menú')}
              </label>
              <select
                value={formData.menuType}
                onChange={(e) => setFormData(prev => ({ ...prev, menuType: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-opacity-30"
                style={{ '--tw-ring-color': primaryColor } as any}
              >
                <option value="header">{t('menus.types.header', 'Encabezado')}</option>
                <option value="footer">{t('menus.types.footer', 'Pie de página')}</option>
                <option value="sidebar">{t('menus.types.sidebar', 'Barra lateral')}</option>
                <option value="custom">{t('menus.types.custom', 'Personalizado')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('menus.sections.items', 'Elementos del menú')}
            </h2>
          </div>

          <div className="space-y-3">
            {/* Headers */}
            <div className="grid grid-cols-12 gap-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              <div className="col-span-1"></div>
              <div className="col-span-5">{t('menus.table.label', 'Etiqueta')}</div>
              <div className="col-span-5">{t('menus.table.link', 'Enlace')}</div>
              <div className="col-span-1"></div>
            </div>

            {/* Items */}
            {formData.items.map((item, index) => (
              <div key={index} className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 flex justify-center">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  </div>
                  
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleUpdateItem(index, 'label', e.target.value)}
                      placeholder={t('menus.placeholders.label', 'p. ej., Quiénes somos')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                               focus:outline-none focus:ring-2 focus:ring-opacity-30"
                      style={{ '--tw-ring-color': primaryColor } as any}
                    />
                  </div>
                  
                  <div className="col-span-5 relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={item.link}
                        onChange={(e) => handleUpdateItem(index, 'link', e.target.value)}
                        placeholder={t('menus.placeholders.link', 'Busca o pega un enlace')}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                                 focus:outline-none focus:ring-2 focus:ring-opacity-30"
                        style={{ '--tw-ring-color': primaryColor } as any}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLinkPicker(showLinkPicker === index ? null : index)}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        {getLinkTypeIcon(item.type)}
                      </button>
                    </div>

                    {/* Link Picker Dropdown */}
                    {showLinkPicker === index && (
                      <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-2">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase px-2 py-1">
                            {t('menus.linkPicker.title', 'Elegir enlace')}
                          </p>
                          {linkOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                handleUpdateItem(index, 'link', option.value);
                                handleUpdateItem(index, 'type', option.type);
                                setShowLinkPicker(null);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-2 text-sm text-left
                                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              {option.icon}
                              <span>{option.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Item Button */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg
                       text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500
                       hover:text-gray-600 dark:hover:text-gray-300 transition-colors
                       flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('menus.addItem', 'Agregar elemento del menú')}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link
            href="/dashboard/menus"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('common.cancel', 'Cancelar')}
          </Link>
          
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                     hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            {saving && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <circle className="opacity-75" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"
                  strokeDasharray="60" strokeDashoffset="60" />
              </svg>
            )}
            {saving ? t('common.saving', 'Guardando...') : t('common.save', 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
}