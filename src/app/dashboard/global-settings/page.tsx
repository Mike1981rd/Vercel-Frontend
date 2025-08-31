'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Save, Loader2 } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useGlobalThemeConfig } from '@/hooks/useGlobalThemeConfig';
import { Slider } from '@/components/ui/slider';
import { BorderRadiusLabels, BorderRadiusSize } from '@/types/theme/appearance';
import toast from 'react-hot-toast';

interface SettingSection {
  id: string;
  name: string;
  isExpanded: boolean;
}

export default function GlobalSettingsPage() {
  const { t } = useI18n();
  const { appearance, loading, updateAppearance, refetch } = useGlobalThemeConfig();
  const [localAppearance, setLocalAppearance] = useState(appearance);
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  
  const [sections, setSections] = useState<SettingSection[]>([
    { id: 'appearance', name: 'Apariencia', isExpanded: true },
    { id: 'typography', name: 'Tipografía', isExpanded: false },
    { id: 'colorSchemes', name: 'Esquemas de color', isExpanded: false },
    { id: 'productCards', name: 'Tarjetas de producto', isExpanded: false },
    { id: 'productBadges', name: 'Insignias de producto', isExpanded: false },
    { id: 'cart', name: 'Carrito', isExpanded: false },
    { id: 'favicon', name: 'Favicon', isExpanded: false },
    { id: 'navigation', name: 'Navegación', isExpanded: false },
    { id: 'socialMedia', name: 'Redes sociales', isExpanded: false },
    { id: 'swatches', name: 'Muestras', isExpanded: false },
  ]);

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
    if (refetch) refetch();
  }, [refetch]);

  useEffect(() => {
    if (appearance) {
      setLocalAppearance(appearance);
    }
  }, [appearance]);

  const toggleSection = (sectionId: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  const handleSaveAppearance = async () => {
    if (!localAppearance) return;
    
    setSaving(true);
    try {
      await updateAppearance(localAppearance);
      toast.success('Configuración de apariencia guardada');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'appearance':
        return (
          <div className="p-6 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuración de Apariencia
              </h3>
              <button
                onClick={handleSaveAppearance}
                disabled={saving || loading}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Page Width Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page width
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={localAppearance?.pageWidth || 1400}
                      onChange={(e) => setLocalAppearance(prev => 
                        prev ? { ...prev, pageWidth: parseInt(e.target.value) || 1400 } : prev
                      )}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      min="320"
                      max="3000"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">px</span>
                  </div>
                </div>
                <Slider
                  value={[localAppearance?.pageWidth || 1400]}
                  onValueChange={(value) => setLocalAppearance(prev => 
                    prev ? { ...prev, pageWidth: value[0] } : prev
                  )}
                  min={320}
                  max={3000}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Side Padding Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Side padding size
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={localAppearance?.lateralPadding || 34}
                      onChange={(e) => setLocalAppearance(prev => 
                        prev ? { ...prev, lateralPadding: parseInt(e.target.value) || 34 } : prev
                      )}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      min="0"
                      max="200"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">px</span>
                  </div>
                </div>
                <Slider
                  value={[localAppearance?.lateralPadding || 34]}
                  onValueChange={(value) => setLocalAppearance(prev => 
                    prev ? { ...prev, lateralPadding: value[0] } : prev
                  )}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Border Radius Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Edge rounding
                </label>
                <select 
                  value={localAppearance?.borderRadius || 'size-3'}
                  onChange={(e) => setLocalAppearance(prev => 
                    prev ? { ...prev, borderRadius: e.target.value as BorderRadiusSize } : prev
                  )}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-30 dark:bg-gray-700 dark:text-white transition-all"
                  style={{ 
                    '--tw-ring-color': primaryColor,
                    borderColor: primaryColor + '33'
                  } as React.CSSProperties}
                >
                  {Object.entries(BorderRadiusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      
      case 'typography':
        return (
          <div className="p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4">Configuración de Tipografía</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuente de encabezados
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="inter">Inter</option>
                  <option value="roboto">Roboto</option>
                  <option value="poppins">Poppins</option>
                  <option value="playfair">Playfair Display</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuente del cuerpo
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="inter">Inter</option>
                  <option value="roboto">Roboto</option>
                  <option value="opensans">Open Sans</option>
                  <option value="lato">Lato</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'colorSchemes':
        return (
          <div className="p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4">Esquemas de Color</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color primario
                  </label>
                  <input 
                    type="color" 
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    defaultValue="#000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color secundario
                  </label>
                  <input 
                    type="color" 
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    defaultValue="#666666"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6 bg-white dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              Configuración de {sections.find(s => s.id === sectionId)?.name} próximamente...
            </p>
          </div>
        );
    }
  };

  if (loading && !appearance) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración del tema</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Personaliza la apariencia y comportamiento de tu sitio web
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
        {sections.map((section) => (
          <div key={section.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">{section.name}</span>
              {section.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            
            {section.isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                {renderSectionContent(section.id)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}