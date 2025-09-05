'use client';

import React, { useEffect, useState } from 'react';

export type MediaSettings = {
  imageMaxWidth: number;    // px
  imageMaxHeight: number;   // px
  videoMaxWidth: number;    // px
  videoMaxHeight: number;   // px
  fit: 'contain' | 'cover';
  borderRadius: number;     // px
};

export const defaultMediaSettings: MediaSettings = {
  imageMaxWidth: 240,
  imageMaxHeight: 220,
  videoMaxWidth: 300,
  videoMaxHeight: 220,
  fit: 'contain',
  borderRadius: 12,
};

const STORAGE_KEY = 'whatsapp-media-settings';

export function loadMediaSettings(): MediaSettings {
  if (typeof window === 'undefined') return defaultMediaSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMediaSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultMediaSettings, ...parsed } as MediaSettings;
  } catch {
    return defaultMediaSettings;
  }
}

export function saveMediaSettings(settings: MediaSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('whatsapp:mediaSettingsUpdated', { detail: settings }));
  } catch {}
}

export default function MediaSettingsForm() {
  const [settings, setSettings] = useState<MediaSettings>(defaultMediaSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadMediaSettings());
  }, []);

  const handleNumber = (key: keyof MediaSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value || '0', 10);
    setSettings(prev => ({ ...prev, [key]: isNaN(value) ? 0 : value }));
  };

  const handleSave = () => {
    saveMediaSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Multimedia</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tamaño y estilo de imágenes y videos en WhatsApp y widget.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Imágenes</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Máx. ancho (px)
              <input type="number" min={80} max={800} value={settings.imageMaxWidth} onChange={handleNumber('imageMaxWidth')} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700" />
            </label>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Máx. alto (px)
              <input type="number" min={80} max={800} value={settings.imageMaxHeight} onChange={handleNumber('imageMaxHeight')} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700" />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Videos</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Máx. ancho (px)
              <input type="number" min={120} max={1024} value={settings.videoMaxWidth} onChange={handleNumber('videoMaxWidth')} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700" />
            </label>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Máx. alto (px)
              <input type="number" min={80} max={800} value={settings.videoMaxHeight} onChange={handleNumber('videoMaxHeight')} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700" />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Estilo</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Ajuste
              <select value={settings.fit} onChange={e => setSettings(prev => ({ ...prev, fit: e.target.value as any }))} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700">
                <option value="contain">Contain</option>
                <option value="cover">Cover</option>
              </select>
            </label>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Bordes redondeados (px)
              <input type="number" min={0} max={32} value={settings.borderRadius} onChange={handleNumber('borderRadius')} className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-700" />
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Guardar</button>
        {saved && <span className="text-sm text-green-600">Guardado</span>}
      </div>
    </div>
  );
}

