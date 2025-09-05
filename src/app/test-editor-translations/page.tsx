'use client';

import React, { useState } from 'react';
import { useEditorTranslations } from '@/hooks/useEditorTranslations';
import { useI18n } from '@/contexts/I18nContext';

export default function TestEditorTranslations() {
  const { t, language, setLanguage, isModuleLoaded } = useI18n();
  const [testResults, setTestResults] = useState<string[]>([]);

  // Cargar automáticamente los módulos del editor
  useEditorTranslations();

  const runTests = () => {
    const results: string[] = [];
    
    // Test 1: Verificar que los módulos están cargados
    results.push(`✅ Módulo 'editor' cargado: ${isModuleLoaded('editor')}`);
    results.push(`✅ Módulo 'sections' cargado: ${isModuleLoaded('sections')}`);
    results.push(`✅ Módulo 'theme-config' cargado: ${isModuleLoaded('theme-config')}`);
    
    // Test 2: Probar traducciones del editor
    results.push(`\n📝 Traducciones del Editor (${language}):`);
    results.push(`- Título: ${t('editor.title')}`);
    results.push(`- Guardar: ${t('editor.actions.save')}`);
    results.push(`- Publicar: ${t('editor.actions.publish')}`);
    results.push(`- Panel Secciones: ${t('editor.panels.sections')}`);
    
    // Test 3: Probar traducciones de secciones
    results.push(`\n📦 Traducciones de Secciones (${language}):`);
    results.push(`- Image with Text: ${t('sections.imageWithText.name')}`);
    results.push(`- Gallery: ${t('sections.gallery.name')}`);
    results.push(`- FAQ: ${t('sections.faq.name')}`);
    
    // Test 4: Probar traducciones de configuración de tema
    results.push(`\n🎨 Traducciones de Configuración (${language}):`);
    results.push(`- Apariencia: ${t('themeConfig.appearance.title')}`);
    results.push(`- Tipografía: ${t('themeConfig.typography.title')}`);
    results.push(`- Esquemas de Color: ${t('themeConfig.colorSchemes.title')}`);
    
    setTestResults(results);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test de Traducciones del Editor</h1>
      
      {/* Language Selector */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <label className="block text-sm font-medium mb-2">Idioma Actual:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
          className="px-3 py-2 border rounded"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Test Button */}
      <button
        onClick={runTests}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Ejecutar Pruebas
      </button>

      {/* Results */}
      {testResults.length > 0 && (
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm">
          {testResults.map((result, index) => (
            <div key={index} className="whitespace-pre-wrap">{result}</div>
          ))}
        </div>
      )}

      {/* Live Examples */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Ejemplos en Vivo:</h2>
        
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">{t('editor.title')}</h3>
          <p className="text-sm text-gray-600">{t('editor.subtitle')}</p>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">{t('editor.panels.sections')}</h3>
          <div className="space-y-2 mt-2">
            <button className="block w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded">
              {t('sections.imageWithText.name')}
            </button>
            <button className="block w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded">
              {t('sections.gallery.name')}
            </button>
            <button className="block w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded">
              {t('sections.testimonials.name')}
            </button>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">{t('editor.toolbar.desktop')}</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-200 rounded text-sm">
              {t('editor.toolbar.desktop')}
            </button>
            <button className="px-3 py-1 bg-gray-200 rounded text-sm">
              {t('editor.toolbar.tablet')}
            </button>
            <button className="px-3 py-1 bg-gray-200 rounded text-sm">
              {t('editor.toolbar.mobile')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}