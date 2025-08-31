'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { usePathname } from 'next/navigation';

/**
 * Hook personalizado para cargar las traducciones del editor automáticamente
 * cuando el usuario accede a las rutas del editor
 */
export function useEditorTranslations() {
  const { t, loadModule, isModuleLoaded, language } = useI18n();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(language);

  useEffect(() => {
    const loadEditorModules = async () => {
      // Loading modules for language
      setIsLoading(true);
      
      // Solo cargar si estamos en una ruta del editor
      if (pathname?.includes('/editor') || pathname?.includes('/website') || pathname?.includes('/debug-language')) {
        // Si el idioma cambió, forzar recarga de módulos
        const forceReload = currentLanguage !== language;
        
        if (forceReload) {
          // Language changed, forcing module reload
          setCurrentLanguage(language);
        }
        
        // Cargar todos los módulos en paralelo
        const promises = [];
        
        // Si cambió el idioma, primero limpiar los módulos cargados
        if (forceReload) {
          // Este es un workaround - los módulos se recargarán automáticamente
          // Language changed, will reload all modules
        }
        
        if (!isModuleLoaded('editor')) {
          // Loading editor module
          promises.push(loadModule('editor'));
        }
        
        if (!isModuleLoaded('sections')) {
          // Loading sections module
          promises.push(loadModule('sections'));
        }
        
        if (!isModuleLoaded('theme-config')) {
          // Loading theme-config module
          promises.push(loadModule('theme-config'));
        }
        
        if (promises.length > 0) {
          await Promise.all(promises);
          // All modules loaded
        }
      }
      setIsLoading(false);
    };

    loadEditorModules();
  }, [pathname, loadModule, isModuleLoaded, language, currentLanguage]); // Re-cargar cuando cambia el idioma

  return { t, isLoading };
}

/**
 * Hook para cargar solo las traducciones de configuración global
 */
export function useGlobalSettingsTranslations() {
  const { t, loadModule, isModuleLoaded, language } = useI18n();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGlobalSettings = async () => {
      setIsLoading(true);
      if (!isModuleLoaded('theme-config')) {
        await loadModule('theme-config');
      }
      setIsLoading(false);
    };

    loadGlobalSettings();
  }, [loadModule, isModuleLoaded, language]);

  return { t, isLoading };
}

/**
 * Hook para cargar solo las traducciones de secciones
 */
export function useSectionsTranslations() {
  const { t, loadModule, isModuleLoaded } = useI18n();

  useEffect(() => {
    const loadSections = async () => {
      if (!isModuleLoaded('sections')) {
        await loadModule('sections');
      }
    };

    loadSections();
  }, [loadModule, isModuleLoaded]);

  return { t };
}