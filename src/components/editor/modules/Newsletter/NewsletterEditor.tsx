// NewsletterEditor.tsx - Main Newsletter Editor Component
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Upload, Image, Video, X } from 'lucide-react';
import { NewsletterConfig, defaultNewsletterConfig } from './types';
import useThemeConfigStore from '@/stores/useThemeConfigStore'; // SIN destructuring {}

interface NewsletterEditorProps {
  sectionId: string;
  config: NewsletterConfig;
  onUpdate: (config: NewsletterConfig) => void;
  onClose: () => void;
}

export default function NewsletterEditor({
  sectionId,
  config,
  onUpdate,
  onClose
}: NewsletterEditorProps) {
  const [localConfig, setLocalConfig] = useState<NewsletterConfig>(
    config || defaultNewsletterConfig
  );
  const [expandedSections, setExpandedSections] = useState({
    appearance: true,
    images: false,
    contentPosition: false,
    contentBackground: false,
    paddings: false,
    css: false,
    cardSettings: false
  });

  // Sync with props when they change
  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleChange = (updates: Partial<NewsletterConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onUpdate(newConfig);
  };

  // Upload handlers para imágenes y videos
  const handleImageUpload = async (field: 'desktopImage' | 'mobileImage') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5266/api/MediaUpload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          handleChange({ [field]: data.url });
        } else {
          const error = await response.text();
          console.error('Upload failed:', error);
          alert('Error al subir la imagen. Por favor intenta de nuevo.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Error de conexión. Asegúrate de que el backend esté ejecutándose.');
      }
    };
    
    input.click();
  };

  const handleVideoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/webm,video/ogg';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5266/api/MediaUpload/video', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          handleChange({ video: data.url });
        } else {
          const error = await response.text();
          console.error('Upload failed:', error);
          alert('Error al subir el video. Por favor intenta de nuevo.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Error de conexión. Asegúrate de que el backend esté ejecutándose.');
      }
    };
    
    input.click();
  };

  const { config: themeConfig } = useThemeConfigStore();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Newsletter</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Appearance Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('appearance')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Appearance</span>
            {expandedSections.appearance ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.appearance && (
            <div className="px-4 pb-4 space-y-4">
              {/* Color Scheme */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Color scheme
                </label>
                <select
                  value={localConfig.colorScheme}
                  onChange={(e) => handleChange({ colorScheme: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  {themeConfig?.colorSchemes?.schemes?.map((scheme, index) => (
                    <option key={index} value={String(index + 1)}>
                      {scheme.name || `Color scheme ${index + 1}`}
                    </option>
                  )) || [
                    <option key="1" value="1">Scheme 1</option>,
                    <option key="2" value="2">Scheme 2</option>,
                    <option key="3" value="3">Scheme 3</option>,
                    <option key="4" value="4">Scheme 4</option>,
                    <option key="5" value="5">Scheme 5</option>
                  ]}
                </select>
                <button className="text-xs text-blue-600 hover:underline mt-1">
                  Learn about color schemes
                </button>
              </div>

              {/* Color Background */}
              <div className="flex items-center justify-between">
                <label className="text-sm">Color background</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.colorBackground}
                    onChange={(e) => handleChange({ colorBackground: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Width */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Width
                </label>
                <select
                  value={localConfig.width}
                  onChange={(e) => handleChange({ width: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="screen">Screen</option>
                  <option value="page">Page</option>
                  <option value="large">Large</option>
                  <option value="medium">Medium</option>
                </select>
              </div>

              {/* Desktop Ratio */}
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>Desktop ratio</span>
                  <span className="text-gray-500">{localConfig.desktopRatio} : 1</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={localConfig.desktopRatio}
                  onChange={(e) => handleChange({ desktopRatio: parseFloat(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>

            </div>
          )}
        </div>

        {/* Images Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('images')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Images & Video</span>
            {expandedSections.images ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.images && (
            <div className="px-4 pb-4 space-y-4">
              {/* Desktop Image */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Desktop image</label>
                <div 
                  onClick={() => handleImageUpload('desktopImage')}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 cursor-pointer transition-colors"
                >
                  {localConfig.desktopImage ? (
                    <div className="relative">
                      <img 
                        src={localConfig.desktopImage} 
                        alt="Desktop" 
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <p className="text-xs text-gray-500">Click para cambiar imagen</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChange({ desktopImage: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Click para subir o arrastrar</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF hasta 50MB</p>
                    </>
                  )}
                </div>
                <button className="text-xs text-blue-600 hover:underline mt-1">
                  Explorar imágenes gratuitas
                </button>
              </div>

              {/* Mobile Image */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Mobile image</label>
                <div 
                  onClick={() => handleImageUpload('mobileImage')}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 cursor-pointer transition-colors"
                >
                  {localConfig.mobileImage ? (
                    <div className="relative">
                      <img 
                        src={localConfig.mobileImage} 
                        alt="Mobile" 
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <p className="text-xs text-gray-500">Click para cambiar imagen</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChange({ mobileImage: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Click para subir o arrastrar</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF hasta 50MB</p>
                    </>
                  )}
                </div>
                <button className="text-xs text-blue-600 hover:underline mt-1">
                  Explorar imágenes gratuitas
                </button>
              </div>

              {/* Video */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Video</label>
                <div 
                  onClick={handleVideoUpload}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 cursor-pointer transition-colors"
                >
                  {localConfig.video ? (
                    <div className="relative">
                      <div className="bg-gray-100 rounded p-4">
                        <Video className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm text-gray-700 truncate">{localConfig.video.split('/').pop()}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Click para cambiar video</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChange({ video: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Video className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Click para subir video</p>
                      <p className="text-xs text-gray-400 mt-1">MP4, WEBM, OGG hasta 100MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Desktop Overlay Opacity */}
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>Desktop overlay opacity</span>
                  <span className="text-gray-500">{localConfig.desktopOverlayOpacity}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localConfig.desktopOverlayOpacity}
                  onChange={(e) => handleChange({ desktopOverlayOpacity: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>

              {/* Mobile Overlay Opacity */}
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>Mobile overlay opacity</span>
                  <span className="text-gray-500">{localConfig.mobileOverlayOpacity}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localConfig.mobileOverlayOpacity}
                  onChange={(e) => handleChange({ mobileOverlayOpacity: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Position Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('contentPosition')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Content position</span>
            {expandedSections.contentPosition ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.contentPosition && (
            <div className="px-4 pb-4 space-y-4">
              {/* Desktop Position */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">Desktop position</label>
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => handleChange({ desktopPosition: pos })}
                      className={`flex-1 px-3 py-2 border ${
                        localConfig.desktopPosition === pos
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white hover:bg-gray-50'
                      } ${pos === 'left' ? 'rounded-l-lg' : pos === 'right' ? 'rounded-r-lg' : ''}`}
                    >
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Alignment */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">Desktop alignment</label>
                <div className="flex gap-1">
                  {(['left', 'center'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => handleChange({ desktopAlignment: align })}
                      className={`flex-1 px-3 py-2 border ${
                        localConfig.desktopAlignment === align
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white hover:bg-gray-50'
                      } ${align === 'left' ? 'rounded-l-lg' : 'rounded-r-lg'}`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Width */}
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>Desktop width</span>
                  <span className="text-gray-500">{localConfig.desktopWidth} px</span>
                </label>
                <input
                  type="range"
                  min="400"
                  max="1200"
                  value={localConfig.desktopWidth}
                  onChange={(e) => handleChange({ desktopWidth: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>

              {/* Desktop Spacing */}
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>Desktop spacing</span>
                  <span className="text-gray-500">{localConfig.desktopSpacing} px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localConfig.desktopSpacing}
                  onChange={(e) => handleChange({ desktopSpacing: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ajusta el espacio entre los bordes de sección y el contenido
                </p>
              </div>

            </div>
          )}
        </div>

        {/* Card Settings Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('cardSettings')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Card settings</span>
            {expandedSections.cardSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.cardSettings && (
            <div className="px-4 pb-4 space-y-4">
              {/* Card Style */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Card style</label>
                <select
                  value={localConfig.cardStyle}
                  onChange={(e) => handleChange({ cardStyle: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="minimal">Minimal</option>
                  <option value="flat">Flat</option>
                  <option value="raised">Raised</option>
                  <option value="bordered">Bordered</option>
                  <option value="rounded">Rounded</option>
                  <option value="modern">Modern</option>
                </select>
              </div>

              {/* Card Size */}
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>Card size</span>
                  <span className="text-gray-500">{localConfig.cardSize}%</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={localConfig.cardSize}
                  onChange={(e) => handleChange({ cardSize: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ajusta el tamaño del card de newsletter
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content Background Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('contentBackground')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Content background</span>
            {expandedSections.contentBackground ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.contentBackground && (
            <div className="px-4 pb-4 space-y-4">
              {/* Desktop Content Background */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Desktop</label>
                <select
                  value={localConfig.desktopContentBackground}
                  onChange={(e) => handleChange({ desktopContentBackground: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="none">None</option>
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                  <option value="shadow">Shadow</option>
                  <option value="blurred">Blurred</option>
                  <option value="transparent">Transparent</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Uses foreground color from color scheme
                </p>
              </div>

              {/* Mobile Content Background */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Mobile</label>
                <select
                  value={localConfig.mobileContentBackground}
                  onChange={(e) => handleChange({ mobileContentBackground: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="none">None</option>
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                  <option value="shadow">Shadow</option>
                  <option value="blurred">Blurred</option>
                  <option value="transparent">Transparent</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Uses foreground color from color scheme
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Paddings Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('paddings')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Paddings</span>
            {expandedSections.paddings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.paddings && (
            <div className="px-4 pb-4 space-y-4">
              {/* Add side paddings toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm">Add side paddings</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.addSidePaddings}
                    onChange={(e) => handleChange({ addSidePaddings: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Top padding */}
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>Top padding</span>
                  <span className="text-gray-500">{localConfig.paddingTop} px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={localConfig.paddingTop}
                  onChange={(e) => handleChange({ paddingTop: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>

              {/* Bottom padding */}
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>Bottom padding</span>
                  <span className="text-gray-500">{localConfig.paddingBottom} px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={localConfig.paddingBottom}
                  onChange={(e) => handleChange({ paddingBottom: parseInt(e.target.value) })}
                  className="flex-1 min-w-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* CSS personalizado */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('css')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-sm font-medium">CSS personalizado</span>
            {expandedSections.css ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.css && (
            <div className="px-4 pb-4">
              <textarea
                value={localConfig.customCSS || ''}
                onChange={(e) => handleChange({ customCSS: e.target.value })}
                placeholder="/* Add your custom CSS here */"
                className="w-full h-32 px-3 py-2 border rounded-lg text-sm font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <button className="text-sm text-red-600 hover:underline">
          Eliminar sección
        </button>
      </div>
    </div>
  );
}
