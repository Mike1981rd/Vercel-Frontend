'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import IconPicker from '@/components/ui/IconPicker';
import IconRenderer from '@/components/ui/IconRenderer';
import Toggle from '@/components/ui/Toggle';
import Offcanvas from '@/components/ui/Offcanvas';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  HomeIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface ConfigOption {
  id: number;
  type: string;
  value: string;
  labelEs: string;
  labelEn: string;
  icon?: string;
  iconType?: string;
  category?: string;
  sortOrder: number;
  usageCount: number;
  isActive: boolean;
  isCustom: boolean;
  isDefault: boolean;
}

export default function ConfigOptionsPage() {
  const { t, language } = useI18n();
  const toast = useToast();
  
  const [options, setOptions] = useState<ConfigOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<ConfigOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('amenity');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState<ConfigOption | null>(null);
  const [customIcons, setCustomIcons] = useState<{id: string, name: string, url: string}[]>([]);
  const [formData, setFormData] = useState({
    type: 'amenity',
    value: '',
    labelEs: '',
    labelEn: '',
    icon: '',
    iconType: 'heroicon',
    category: '',
    sortOrder: 999,
    isActive: true
  });

  const optionTypes = [
    { value: 'amenity', label: t('config.types.amenity', 'Amenidades'), icon: SparklesIcon },
    { value: 'room_type', label: t('config.types.roomType', 'Tipos de Habitación'), icon: HomeIcon },
    { value: 'view_type', label: t('config.types.viewType', 'Tipos de Vista'), icon: EyeIcon },
    { value: 'common_spaces', label: t('config.types.commonSpaces', 'Espacios Comunes'), icon: HomeIcon },
    { value: 'house_rules', label: t('config.types.houseRules', 'Reglas de la Casa'), icon: Cog6ToothIcon },
    { value: 'safety_property', label: t('config.types.safetyProperty', 'Seguridad y Propiedad'), icon: Cog6ToothIcon },
    { value: 'cancellation_policies', label: t('config.types.cancellationPolicies', 'Políticas de Cancelación'), icon: Cog6ToothIcon },
    { value: 'icons', label: t('config.types.icons', 'Iconos'), icon: SparklesIcon },
    { value: 'policy_type', label: t('config.types.policyType', 'Tipos de Política'), icon: Cog6ToothIcon }
  ];

  const categories = {
    amenity: ['básicas', 'premium', 'exterior', 'tecnología', 'servicios'],
    room_type: ['estándar', 'premium', 'lujo'],
    view_type: ['natural', 'urbana', 'interior'],
    common_spaces: ['interior', 'exterior', 'servicios', 'recreación'],
    house_rules: ['permisos', 'restricciones', 'horarios'],
    safety_property: ['detectores', 'seguridad', 'emergencia', 'equipamiento'],
    cancellation_policies: ['flexible', 'moderada', 'estricta', 'reembolso'],
    policy_type: ['flexible', 'moderada', 'estricta']
  };

  useEffect(() => {
    fetchOptions();
    // Cargar iconos personalizados desde localStorage
    const savedIcons = JSON.parse(localStorage.getItem('customIcons') || '[]');
    setCustomIcons(savedIcons);
  }, []);

  useEffect(() => {
    filterOptions();
  }, [options, activeTab, searchTerm]);

  const fetchOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ConfigOptions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Si no hay opciones, inicializar las por defecto
          await initializeDefaults();
          return;
        }
        throw new Error('Error al cargar opciones');
      }

      const data = await response.json();
      setOptions(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('common.error', 'Error al cargar las opciones'));
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      console.log('Inicializando opciones por defecto...');
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ConfigOptions/initialize-defaults`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.text();
        console.log('Respuesta del servidor:', result);
        toast.success(t('config.defaultsInitialized', 'Opciones por defecto inicializadas'));
        await fetchOptions(); // Esperar a que se recarguen las opciones
      } else {
        console.error('Error en la respuesta:', response.status, response.statusText);
        toast.error(t('config.error', 'Error al inicializar opciones'));
      }
    } catch (error) {
      console.error('Error inicializando defaults:', error);
      toast.error(t('config.error', 'Error al inicializar opciones'));
    }
  };

  const filterOptions = () => {
    let filtered = options.filter(opt => opt.type === activeTab);
    
    if (searchTerm) {
      filtered = filtered.filter(opt => 
        opt.labelEs.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.labelEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOptions(filtered);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingOption 
        ? `${process.env.NEXT_PUBLIC_API_URL}/ConfigOptions/${editingOption.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/ConfigOptions`;

      const method = editingOption ? 'PUT' : 'POST';
      
      const body = editingOption ? {
        labelEs: formData.labelEs,
        labelEn: formData.labelEn,
        icon: formData.icon,
        iconType: formData.iconType,
        category: formData.category,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive
      } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar');
      }

      toast.success(
        editingOption 
          ? t('config.updated', 'Opción actualizada exitosamente')
          : t('config.created', 'Opción creada exitosamente')
      );

      setShowModal(false);
      resetForm();
      await fetchOptions(); // Refresh the list to show updated icons
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error al guardar'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('config.confirmDelete', '¿Está seguro de eliminar esta opción?'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ConfigOptions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar');
      }

      toast.success(t('config.deleted', 'Opción eliminada exitosamente'));
      fetchOptions();
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error al eliminar'));
    }
  };

  const handleToggleActive = async (option: ConfigOption) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ConfigOptions/${option.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !option.isActive })
      });

      if (response.ok) {
        fetchOptions();
      }
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const openEditModal = (option: ConfigOption) => {
    setEditingOption(option);
    setFormData({
      type: option.type,
      value: option.value,
      labelEs: option.labelEs,
      labelEn: option.labelEn,
      icon: option.icon || '',
      iconType: option.iconType || 'heroicon',
      category: option.category || '',
      sortOrder: option.sortOrder,
      isActive: option.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingOption(null);
    setFormData({
      type: activeTab,
      value: '',
      labelEs: '',
      labelEn: '',
      icon: '',
      iconType: 'heroicon',
      category: '',
      sortOrder: 999,
      isActive: true
    });
  };

  // Función para manejar la carga de iconos personalizados
  const handleIconUpload = async (file: File) => {
    // Validar tamaño del archivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('config.icons.fileTooLarge', 'El archivo es demasiado grande. Máximo 2MB'));
      return;
    }

    // Validar tipo de archivo
    const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error(t('config.icons.invalidFileType', 'Tipo de archivo no válido'));
      return;
    }

    try {
      // Convertir archivo a base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newIcon = {
          id: `custom-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: result
        };
        
        // Guardar en localStorage
        const savedIcons = JSON.parse(localStorage.getItem('customIcons') || '[]');
        savedIcons.push(newIcon);
        localStorage.setItem('customIcons', JSON.stringify(savedIcons));
        
        // Actualizar estado
        setCustomIcons([...customIcons, newIcon]);
        toast.success(t('config.icons.uploadSuccess', 'Icono agregado exitosamente'));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading icon:', error);
      toast.error(t('config.icons.uploadError', 'Error al cargar el icono'));
    }
  };

  // Función para eliminar iconos personalizados
  const handleDeleteCustomIcon = (id: string) => {
    // Eliminar de localStorage
    const savedIcons = JSON.parse(localStorage.getItem('customIcons') || '[]');
    const filteredIcons = savedIcons.filter((icon: any) => icon.id !== id);
    localStorage.setItem('customIcons', JSON.stringify(filteredIcons));
    
    // Actualizar estado
    setCustomIcons(customIcons.filter(icon => icon.id !== id));
    toast.success(t('config.icons.deleteSuccess', 'Icono eliminado exitosamente'));
  };

  const renderIcon = (option: ConfigOption) => {
    if (!option.icon) return null;
    // Usar tamaño más grande para iconos personalizados
    const iconSize = option.iconType === 'custom' ? "h-12 w-12" : "h-8 w-8";
    return <IconRenderer icon={option.icon} iconType={option.iconType as 'heroicon' | 'emoji' | 'custom'} className={iconSize} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Mobile Title - Centered */}
      <div className="sm:hidden mb-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('config.title', 'Gestión de Catálogos')}
        </h1>
      </div>

      {/* Desktop Title */}
      <div className="hidden sm:block mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('config.title', 'Gestión de Catálogos')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('config.description', 'Personaliza las opciones disponibles en tu sistema')}
        </p>
      </div>

      {/* Select dropdown para tipo de catálogo */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('config.selectType', 'Tipo de Catálogo')}:
          </label>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="flex-1 sm:flex-none sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            {optionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1 sm:max-w-md order-2 sm:order-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('common.search', 'Buscar...')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
          />
        </div>
        <div className="flex gap-2 order-1 sm:order-2">
          {options.filter(o => o.isDefault).length === 0 && (
            <button
              onClick={initializeDefaults}
              className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">{t('config.initializeDefaults', 'Inicializar Catálogo Base')}</span>
              <span className="sm:hidden">{t('common.init', 'Iniciar')}</span>
            </button>
          )}
          {activeTab !== 'icons' && (
            <button
              onClick={() => {
                resetForm();
                setFormData(prev => ({ ...prev, type: activeTab }));
                setShowModal(true);
              }}
              className="px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">{t('config.addOption', 'Agregar Opción')}</span>
              <span className="sm:hidden">{t('common.add', 'Agregar')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenido según el tab activo */}
      {activeTab === 'icons' ? (
        // Vista de iconos
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('config.icons.defaultIcons', 'Iconos Disponibles')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('config.icons.description', 'Estos son los iconos disponibles para usar en el sistema')}
            </p>
          </div>

          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {/* Iconos de Heroicons */}
            <div className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <HomeIcon className="h-10 w-10 text-gray-700 dark:text-gray-300 mb-2" />
              <span className="text-xs text-gray-600 dark:text-gray-400">home</span>
            </div>
            <div className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <SparklesIcon className="h-10 w-10 text-gray-700 dark:text-gray-300 mb-2" />
              <span className="text-xs text-gray-600 dark:text-gray-400">sparkles</span>
            </div>
            <div className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <EyeIcon className="h-10 w-10 text-gray-700 dark:text-gray-300 mb-2" />
              <span className="text-xs text-gray-600 dark:text-gray-400">eye</span>
            </div>
            <div className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Cog6ToothIcon className="h-10 w-10 text-gray-700 dark:text-gray-300 mb-2" />
              <span className="text-xs text-gray-600 dark:text-gray-400">cog</span>
            </div>
            
            {/* Agregar más iconos aquí */}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('config.icons.customIcons', 'Iconos Personalizados')}
            </h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <input
                type="file"
                id="icon-upload"
                accept=".svg,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleIconUpload(file);
                  }
                }}
              />
              <label
                htmlFor="icon-upload"
                className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
              >
                <PlusIcon className="h-5 w-5 inline mr-2" />
                {t('config.icons.addCustom', 'Agregar Icono Personalizado')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('config.icons.supportedFormats', 'Formatos soportados: SVG, PNG, JPG')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('config.icons.maxSize', 'Tamaño máximo: 2MB')}
              </p>
            </div>
            
            {/* Lista de iconos personalizados */}
            <div className="mt-6">
              {customIcons.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                  {customIcons.map((icon, index) => (
                    <div key={index} className="relative group flex flex-col items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <img src={icon.url} alt={icon.name} className="h-16 w-16 object-contain mb-2" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 text-center break-all">{icon.name}</span>
                      <button
                        onClick={() => handleDeleteCustomIcon(icon.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Vista de tabla para otras opciones
        <>
        {/* Desktop Table */}
        <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('config.icon', 'Icono')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('config.label', 'Etiqueta')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('config.value', 'Valor')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('config.category', 'Categoría')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('config.usage', 'Uso')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('config.status', 'Estado')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('common.actions', 'Acciones')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOptions.map(option => (
              <tr key={option.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center w-16 h-16">
                    {renderIcon(option)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {language === 'es' ? option.labelEs : option.labelEn}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {language === 'es' ? option.labelEn : option.labelEs}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                    {option.value}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {option.category && (
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {option.category}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {option.usageCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Toggle
                    checked={option.isActive}
                    onChange={() => handleToggleActive(option)}
                    size="small"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(option)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    {option.isCustom && (
                      <button
                        onClick={() => handleDelete(option.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-3">
          {filteredOptions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
              {t('config.noOptions', 'No se encontraron opciones')}
            </div>
          ) : (
            filteredOptions.map(option => (
              <div key={option.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center justify-center w-16 h-16">
                      {renderIcon(option)}
                    </div>
                    <button
                      onClick={() => openEditModal(option)}
                      className="p-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <div className="flex-1 ml-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {language === 'es' ? option.labelEs : option.labelEn}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'es' ? option.labelEn : option.labelEs}
                      </p>
                    </div>
                  </div>
                  {option.isCustom && (
                    <button
                      onClick={() => handleDelete(option.id)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('config.value', 'Valor')}:</span>
                    <code className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                      {option.value}
                    </code>
                  </div>
                  
                  {option.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('config.category', 'Categoría')}:</span>
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        {option.category}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('config.usage', 'Uso')}:</span>
                    <span className="text-gray-900 dark:text-white">{option.usageCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('config.status', 'Estado')}:</span>
                    <Toggle
                      checked={option.isActive}
                      onChange={() => handleToggleActive(option)}
                      size="small"
                    />
                  </div>
                  
                  {option.isDefault && (
                    <div className="pt-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                        {t('config.default', 'Por defecto')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        </>
      )}

      {/* Mensaje cuando no hay opciones */}
      {activeTab !== 'icons' && filteredOptions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {t('config.noOptions', 'No se encontraron opciones')}
            </p>
          </div>
        )}

      {/* Offcanvas */}
      <Offcanvas
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingOption 
          ? t('config.editOption', 'Editar Opción')
          : t('config.addOption', 'Agregar Opción')}
        width="600px"
      >

            <div className="space-y-4">
              {!editingOption && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('config.type', 'Tipo')}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      {optionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('config.value', 'Valor')} *
                    </label>
                    <input
                      type="text"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="wifi, pool, etc."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('config.labelEs', 'Etiqueta en Español')} *
                </label>
                <input
                  type="text"
                  value={formData.labelEs}
                  onChange={(e) => setFormData({ ...formData, labelEs: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('config.labelEn', 'Etiqueta en Inglés')} *
                </label>
                <input
                  type="text"
                  value={formData.labelEn}
                  onChange={(e) => setFormData({ ...formData, labelEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('config.icon', 'Icono')}
                </label>
                <IconPicker
                  value={formData.icon}
                  onChange={(icon, type) => setFormData({ ...formData, icon, iconType: type })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('config.category', 'Categoría')}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('common.select', 'Seleccionar')}</option>
                  {categories[formData.type as keyof typeof categories]?.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('config.sortOrder', 'Orden')}
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <Toggle
                  checked={formData.isActive}
                  onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  label={t('config.active', 'Activo')}
                />
              </div>
            </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t('common.cancel', 'Cancelar')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('common.save', 'Guardar')}
          </button>
        </div>
      </Offcanvas>
    </div>
  );
}