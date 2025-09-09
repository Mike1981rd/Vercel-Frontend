'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import languageLogger from '@/lib/language-logger';

type Language = 'es' | 'en';

interface I18nContextType {
  language: Language;
  locale?: string;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string, params?: Record<string, any>) => string;
  loadModule: (moduleName: string) => Promise<void>;
  isModuleLoaded: (moduleName: string) => boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

// Almacenar las traducciones cargadas
let translations: Record<Language, any> = {
  es: {},
  en: {}
};

// Almacenar los módulos cargados
const loadedModules = new Set<string>();

// Función para obtener valor anidado de un objeto usando dot notation
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// Función para mergear traducciones profundamente
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function I18nProvider({ children }: I18nProviderProps) {
  // Initialize with localStorage value if available, otherwise default to 'es'
  const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      if (saved === 'es' || saved === 'en') {
        return saved;
      }
    }
    return 'es'; // Default language
  };
  
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());
  const [isLoaded, setIsLoaded] = useState(false);
  const [, forceUpdate] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Remove the hydration effect that was causing the language switch
  // The initial state already handles localStorage correctly
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Log provider mount only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      languageLogger.log('I18nProvider mounted', { 
        language,
        isLoaded,
        isHydrated,
        localStorage: typeof window !== 'undefined' ? localStorage.getItem('language') : null
      });
    }
  }, []);

  // Cargar traducciones al inicializar
  useEffect(() => {
    const loadTranslations = async () => {
      if (process.env.NODE_ENV === 'development') {
        languageLogger.log('Loading base translations', { language });
      }
      try {
        // Cargar traducciones en español
        const esModule = await import('../lib/i18n/translations/es.json');
        translations.es = esModule.default;

        // Cargar traducciones en inglés
        const enModule = await import('../lib/i18n/translations/en.json');
        translations.en = enModule.default;

        if (process.env.NODE_ENV === 'development') {
          languageLogger.log('Base translations loaded', { 
            hasES: !!translations.es, 
            hasEN: !!translations.en 
          });
        }
        setIsLoaded(true);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          languageLogger.log('Error loading translations', { error });
        }
        console.error('Error loading translations:', error);
        setIsLoaded(true);
      }
    };

    loadTranslations();
  }, []);

  // Ya no necesitamos este useEffect porque el idioma se carga en el estado inicial

  const setLanguage = async (lang: Language) => {
    languageLogger.log('setLanguage called', { 
      from: language, 
      to: lang,
      caller: new Error().stack?.split('\n')[2] 
    });
    console.log(`[I18nContext] Setting language to: ${lang}`);
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      languageLogger.log('Language saved to localStorage', { lang });
      console.log(`[I18nContext] Saved to localStorage: ${lang}`);
    }
    
    // Clear loaded modules to force reload with new language
    console.log(`[I18nContext] Clearing ${loadedModules.size} loaded modules for reload`);
    const modulesToReload = Array.from(loadedModules);
    loadedModules.clear();
    
    // Reload all previously loaded modules with the new language
    for (const module of modulesToReload) {
      console.log(`[I18nContext] Reloading module: ${module}`);
      await loadModule(module);
    }
    
    // Force re-render
    forceUpdate({});
  };

  // Función para cargar un módulo de traducciones
  const loadModule = async (moduleName: string): Promise<void> => {
    // Si el módulo ya está cargado, no hacer nada (a menos que estemos recargando)
    if (loadedModules.has(moduleName)) {
      // Module already loaded, skipping
      return;
    }
    
    // Loading module for language
    
    try {
      // Cargar traducciones del módulo en español
      const esModule = await import(`../lib/i18n/translations/modules/${moduleName}-es.json`);
      translations.es = deepMerge(translations.es, esModule.default);
      // Loaded ES translations

      // Cargar traducciones del módulo en inglés
      const enModule = await import(`../lib/i18n/translations/modules/${moduleName}-en.json`);
      translations.en = deepMerge(translations.en, enModule.default);
      // Loaded EN translations

      // Marcar módulo como cargado
      loadedModules.add(moduleName);
      
      // Forzar re-render
      forceUpdate({});
      
      languageLogger.log('Module loaded', { 
        moduleName, 
        currentLanguage: language,
        loadedModules: Array.from(loadedModules) 
      });
      // Module loaded successfully
    } catch (error) {
      // Error loading module - silenced for production
    }
  };

  // Función para verificar si un módulo está cargado
  const isModuleLoaded = (moduleName: string): boolean => {
    return loadedModules.has(moduleName);
  };

  const t = (key: string, defaultValue?: string, params?: Record<string, any>): string => {
    if (!isLoaded) {
      // Translations not loaded yet
      return defaultValue || key;
    }

    // Removed debug for navigation.editor

    let translation = getNestedValue(translations[language], key);
    
    // Si no encuentra traducción, intentar con fallback a español
    if (!translation && language !== 'es') {
      translation = getNestedValue(translations.es, key);
    }
    
    // Si aún no hay traducción, devolver el default o la key
    if (!translation) {
      return defaultValue || key;
    }

    // Si la traducción es un objeto con title y count (caso especial)
    if (typeof translation === 'object' && translation !== null) {
      // Buscar la propiedad más relevante
      if ('title' in translation) {
        translation = (translation as any).title;
      } else if ('text' in translation) {
        translation = (translation as any).text;
      } else {
        // Si es un objeto sin propiedades conocidas, convertir a string
        translation = JSON.stringify(translation);
      }
    }

    // Convertir a string si no lo es
    if (typeof translation !== 'string') {
      return String(translation);
    }

    // Si hay parámetros, realizar interpolación
    if (params) {
      let result = translation;
      Object.keys(params).forEach(param => {
        // Soportar tanto {param} como {{param}}
        const regex1 = new RegExp(`\\{\\{${param}\\}\\}`, 'g');
        const regex2 = new RegExp(`\\{${param}\\}`, 'g');
        result = result.replace(regex1, String(params[param]));
        result = result.replace(regex2, String(params[param]));
      });
      return result;
    }

    return translation;
  };

  const value = {
    language,
    setLanguage,
    t,
    loadModule,
    isModuleLoaded
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Export types
export type { Language };