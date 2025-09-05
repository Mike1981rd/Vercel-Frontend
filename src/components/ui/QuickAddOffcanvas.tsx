'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import IconPicker from './IconPicker';
import IconRenderer from './IconRenderer';
import Offcanvas from './Offcanvas';

interface QuickAddOffcanvasProps {
  type: 'amenity' | 'room_type' | 'view_type';
  isOpen: boolean;
  onClose: () => void;
  onAdd: (option: any) => void;
  existingOptions?: string[];
}

export default function QuickAddOffcanvas({ 
  type, 
  isOpen, 
  onClose, 
  onAdd,
  existingOptions = []
}: QuickAddOffcanvasProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const { error: showError, success: showSuccess } = useToast();
  
  const [formData, setFormData] = useState({
    value: '',
    labelEs: '',
    labelEn: '',
    icon: '',
    iconType: 'heroicon' as 'heroicon' | 'emoji' | 'custom',
    category: '',
  });
  
  const [saving, setSaving] = useState(false);

  // Categorías según el tipo
  const getCategories = () => {
    switch (type) {
      case 'amenity':
        return ['básicas', 'premium', 'exterior', 'tecnología', 'servicios'];
      case 'room_type':
        return ['estándar', 'premium', 'lujo'];
      case 'view_type':
        return ['natural', 'urbana', 'interior'];
      default:
        return [];
    }
  };

  // Reset form cuando se abre el offcanvas
  useEffect(() => {
    if (isOpen) {
      setFormData({
        value: '',
        labelEs: '',
        labelEn: '',
        icon: '',
        iconType: 'heroicon',
        category: '',
      });
    }
  }, [isOpen]);

  // Generar valor automáticamente desde la etiqueta
  const generateValue = (label: string) => {
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9]+/g, '_')     // Reemplazar espacios y caracteres especiales
      .replace(/^_+|_+$/g, '');        // Remover guiones al inicio y final
  };

  const handleLabelChange = (lang: 'es' | 'en', value: string) => {
    console.log(`🏷️ handleLabelChange - lang: ${lang}, value: ${value}`);
    
    const updates: any = {
      [`label${lang.charAt(0).toUpperCase() + lang.slice(1)}`]: value
    };
    
    // Auto-generar el valor si está vacío o si es un ID de icono personalizado
    if ((!formData.value || formData.value.startsWith('custom-')) && lang === 'es') {
      const generatedValue = generateValue(value);
      updates.value = generatedValue;
      console.log(`📝 Generated value: ${generatedValue} from label: ${value}`);
    }
    
    console.log('📦 Updates to apply:', updates);
    console.log('📊 Current formData.value:', formData.value);
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 SUBMIT - Current formData:', formData);
    
    // Validaciones
    if (!formData.labelEs.trim()) {
      showError(t('validation.required', 'La etiqueta en español es obligatoria'));
      return;
    }
    
    if (!formData.labelEn.trim()) {
      showError(t('validation.required', 'La etiqueta en inglés es obligatoria'));
      return;
    }
    
    // Determinar el valor final que se guardará
    const finalValue = (formData.value && !formData.value.startsWith('custom-')) 
      ? formData.value 
      : generateValue(formData.labelEs);
    
    console.log(`✅ Final value to save: ${finalValue}`);
    console.log(`🏷️ LabelEs: ${formData.labelEs}`);
    console.log(`🏷️ LabelEn: ${formData.labelEn}`);
    console.log(`🎨 Icon: ${formData.icon}`);
    console.log(`🎨 IconType: ${formData.iconType}`);
    
    // Verificar si ya existe
    if (existingOptions.includes(finalValue)) {
      showError(t('config.alreadyExists', 'Esta opción ya existe'));
      return;
    }
    
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        type,
        value: finalValue,
        labelEs: formData.labelEs,
        labelEn: formData.labelEn,
        icon: formData.icon,
        iconType: formData.iconType,
        category: formData.category,
        sortOrder: 999,
        isActive: true
      };
      
      console.log('📤 Sending to API:', payload);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ConfigOptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar');
      }

      const newOption = await response.json();
      
      console.log('📥 Response from API:', newOption);
      
      const optionToReturn = {
        value: newOption.value,
        label: language === 'es' ? newOption.labelEs : newOption.labelEn,
        labelEs: newOption.labelEs,
        labelEn: newOption.labelEn,
        icon: newOption.icon,
        iconType: newOption.iconType
      };
      
      console.log('🔄 Returning to parent component:', optionToReturn);
      
      // Notificar al componente padre con toda la información necesaria
      onAdd(optionToReturn);
      
      showSuccess(t('config.added', 'Opción agregada exitosamente'));
      onClose();
    } catch (error: any) {
      showError(error.message || t('common.error', 'Error al agregar'));
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'amenity':
        return t('config.addAmenity', 'Agregar Amenidad');
      case 'room_type':
        return t('config.addRoomType', 'Agregar Tipo de Habitación');
      case 'view_type':
        return t('config.addViewType', 'Agregar Tipo de Vista');
      default:
        return t('config.addOption', 'Agregar Opción');
    }
  };

  return (
    <Offcanvas
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      width="600px"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Etiqueta en Español */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('config.labelEs', 'Nombre en Español')} *
          </label>
          <input
            type="text"
            value={formData.labelEs}
            onChange={(e) => handleLabelChange('es', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Ej: Piscina Climatizada"
            autoFocus
          />
        </div>
        
        {/* Etiqueta en Inglés */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('config.labelEn', 'Nombre en Inglés')} *
          </label>
          <input
            type="text"
            value={formData.labelEn}
            onChange={(e) => handleLabelChange('en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Ej: Heated Pool"
          />
        </div>
        
        {/* Valor (auto-generado) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('config.value', 'Valor Interno')}
            <span className="text-xs text-gray-500 ml-2">
              ({t('config.autoGenerated', 'auto-generado')})
            </span>
          </label>
          <input
            type="text"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
            placeholder="piscina_climatizada"
          />
        </div>
        
        {/* Selector de Icono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('config.icon', 'Icono')}
            <span className="text-xs text-gray-500 ml-2">
              ({t('config.optional', 'opcional')})
            </span>
          </label>
          <IconPicker
            value={formData.icon}
            onChange={(icon, type) => {
              console.log(`🎨 IconPicker onChange - icon: ${icon}, type: ${type}`);
              console.log('📊 Current formData before icon change:', formData);
              setFormData(prev => ({ ...prev, icon, iconType: type }));
            }}
          />
          
          {/* Debug - mostrar el valor que se guardará */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-gray-500 p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <p>Valor interno: <strong>{formData.value || generateValue(formData.labelEs)}</strong></p>
              {formData.icon && <p>Icono ID: {formData.icon}</p>}
            </div>
          )}
        </div>
        
        {/* Categoría */}
        {getCategories().length > 0 && (
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
              {getCategories().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Preview */}
        {(formData.labelEs || formData.icon) && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t('common.preview', 'Vista previa')}:
            </p>
            <div className="flex items-center gap-2">
              {formData.icon && (
                <IconRenderer icon={formData.icon} iconType={formData.iconType} />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'es' ? formData.labelEs : formData.labelEn}
              </span>
            </div>
          </div>
        )}
        
        {/* Footer con botones */}
        <div className="pt-4 border-t dark:border-gray-700 flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard/config-options')}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            {t('config.manageAll', 'Gestionar todas')}
          </button>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {saving ? t('common.saving', 'Guardando...') : t('common.add', 'Agregar')}
            </button>
          </div>
        </div>
      </form>
    </Offcanvas>
  );
}
