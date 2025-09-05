'use client';

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useEditorTranslations } from '@/hooks/useEditorTranslations';

export default function DebugLanguagePage() {
  const { language, setLanguage } = useI18n();
  const { t, isLoading } = useEditorTranslations();
  const [logs, setLogs] = useState<string[]>([]);
  const [localStorageValue, setLocalStorageValue] = useState<string | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
  };

  useEffect(() => {
    addLog('=== PAGE MOUNTED ===');
    addLog(`Initial language from context: ${language}`);
    const stored = localStorage.getItem('language');
    addLog(`Initial localStorage value: ${stored}`);
    setLocalStorageValue(stored);
  }, []);

  useEffect(() => {
    addLog(`Language changed in context to: ${language}`);
    const stored = localStorage.getItem('language');
    addLog(`Current localStorage after change: ${stored}`);
    setLocalStorageValue(stored);
    
    // Log module loading status
    addLog(`Editor module loading: ${isLoading ? 'YES' : 'NO'}`);
  }, [language, isLoading]);

  // Monitor localStorage changes
  useEffect(() => {
    const checkStorage = setInterval(() => {
      const current = localStorage.getItem('language');
      if (current !== localStorageValue) {
        addLog(`⚠️ localStorage changed externally from '${localStorageValue}' to '${current}'`);
        setLocalStorageValue(current);
      }
    }, 1000);

    return () => clearInterval(checkStorage);
  }, [localStorageValue]);

  const handleLanguageChange = (newLang: 'es' | 'en') => {
    addLog(`Button clicked to change language to: ${newLang}`);
    setLanguage(newLang);
    
    // Check localStorage immediately after setting
    setTimeout(() => {
      const stored = localStorage.getItem('language');
      addLog(`localStorage after setLanguage: ${stored}`);
      setLocalStorageValue(stored);
    }, 100);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared');
  };

  const forceReloadModules = async () => {
    addLog('Force reloading translation modules...');
    // Force reload by changing language twice
    const currentLang = language;
    const tempLang = currentLang === 'es' ? 'en' : 'es';
    await setLanguage(tempLang);
    await setLanguage(currentLang);
    addLog('Modules reloaded');
  };

  // Prevent hydration mismatch by not showing dynamic content until client-side
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Language Persistence</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <p><strong>Current Language (Context):</strong> <span className="font-mono bg-white px-2 py-1 rounded">{isMounted ? language : 'loading...'}</span></p>
          <p><strong>LocalStorage (Live):</strong> <span className="font-mono bg-white px-2 py-1 rounded">{isMounted ? (localStorageValue || 'null') : 'loading...'}</span></p>
          <p><strong>Modules Loading:</strong> <span className="font-mono bg-white px-2 py-1 rounded">{isMounted ? (isLoading ? 'Yes' : 'No') : 'loading...'}</span></p>
          <p><strong>Window Location:</strong> <span className="font-mono bg-white px-2 py-1 rounded text-xs">{isMounted && typeof window !== 'undefined' ? window.location.href : 'N/A'}</span></p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleLanguageChange('es')}
            className={`px-4 py-2 rounded ${language === 'es' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Español
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-4 py-2 rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            English
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Clear Logs
          </button>
          <button
            onClick={forceReloadModules}
            className="px-4 py-2 rounded bg-purple-500 text-white hover:bg-purple-600"
          >
            Force Reload Modules
          </button>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Test Translations:</h2>
          {isMounted ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Basic Translations:</h3>
                <ul className="space-y-1 text-sm">
                  <li><span className="text-gray-500">editor.title:</span> <strong>{t('editor.title')}</strong></li>
                  <li><span className="text-gray-500">editor.pageTypes.home:</span> <strong>{t('editor.pageTypes.home')}</strong></li>
                  <li><span className="text-gray-500">editor.actions.save:</span> <strong>{t('editor.actions.save')}</strong></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Theme Config:</h3>
                <ul className="space-y-1 text-sm">
                  <li><span className="text-gray-500">appearance.title:</span> <strong>{t('themeConfig.appearance.title')}</strong></li>
                  <li><span className="text-gray-500">typography.title:</span> <strong>{t('themeConfig.typography.title')}</strong></li>
                  <li><span className="text-gray-500">colorSchemes.title:</span> <strong>{t('themeConfig.colorSchemes.title')}</strong></li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading translations...</div>
          )}
        </div>

        {/* Debug Logs */}
        <div className="p-4 bg-black text-green-400 rounded font-mono text-xs">
          <h2 className="text-sm font-bold mb-2 text-white">Debug Logs:</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={log.includes('⚠️') ? 'text-yellow-400' : ''}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm">
            <strong>Instructions:</strong> 
            <br />1. Change language to English
            <br />2. Reload the page (F5)
            <br />3. Check if language persists and translations show correctly
          </p>
        </div>
      </div>
    </div>
  );
}