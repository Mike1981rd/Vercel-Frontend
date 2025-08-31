'use client';

import React, { useState, useRef } from 'react';
import { Upload, ExternalLink } from 'lucide-react';
import { 
  FaviconConfig,
  defaultFavicon,
  validateFaviconUrl,
  SUPPORTED_FAVICON_FORMATS
} from '@/types/theme/favicon';
import { useGlobalSettingsTranslations } from '@/hooks/useEditorTranslations';
import { toast } from 'sonner';

interface FaviconSectionProps {
  config: FaviconConfig;
  onChange: (config: FaviconConfig) => void;
}

export function FaviconSection({ config, onChange }: FaviconSectionProps) {
  const { t } = useGlobalSettingsTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  // Ensure complete config with defaults
  const ensuredConfig: FaviconConfig = {
    customFavicon: config.customFavicon ?? defaultFavicon.customFavicon,
    faviconUrl: config.faviconUrl || defaultFavicon.faviconUrl
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!SUPPORTED_FAVICON_FORMATS.includes(extension as any)) {
      toast.error(t('themeConfig.favicon.unsupportedFormat', 'Unsupported format. Please use ICO, PNG, SVG, JPG or JPEG'));
      return;
    }

    // Validate file size (max 500KB for favicon)
    if (file.size > 500 * 1024) {
      toast.error(t('themeConfig.favicon.fileTooLarge', 'File too large. Maximum size is 500KB'));
      return;
    }

    setUploading(true);
    
    try {
      // In a real implementation, you would upload the file to your server
      // For now, we'll create a local URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        // In production, you'd upload to server and get back a URL
        // For demo, we'll use the data URL
        onChange({
          ...ensuredConfig,
          customFavicon: true,
          faviconUrl: dataUrl // In production, this would be the server URL
        });
        
        toast.success(t('themeConfig.favicon.uploadSuccess', 'Favicon uploaded successfully'));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('themeConfig.favicon.uploadError', 'Failed to upload favicon'));
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange({
      ...ensuredConfig,
      faviconUrl: url
    });
  };

  const handleCustomFaviconToggle = () => {
    onChange({
      ...ensuredConfig,
      customFavicon: !ensuredConfig.customFavicon
    });
  };

  return (
    <div className="space-y-4">
      {/* Custom Favicon Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-600 dark:text-gray-400">
          {t('themeConfig.favicon.useCustom', 'Use custom favicon')}
        </label>
        <button
          onClick={handleCustomFaviconToggle}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            ensuredConfig.customFavicon ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              ensuredConfig.customFavicon ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {ensuredConfig.customFavicon && (
        <>
          {/* Favicon Preview */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-3">
              {t('themeConfig.favicon.title', 'Favicon image')}
            </label>
            
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                {ensuredConfig.faviconUrl ? (
                  <img
                    src={ensuredConfig.faviconUrl}
                    alt="Favicon"
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ico,.png,.svg,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading 
                    ? t('themeConfig.favicon.uploading', 'Uploading...') 
                    : t('themeConfig.favicon.selectFile', 'Seleccionar')}
                </button>
              </div>
            </div>

            {/* File URL Input */}
            <div className="mt-3">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                {t('themeConfig.favicon.urlLabel', 'Or enter URL directly')}
              </label>
              <input
                type="text"
                value={ensuredConfig.faviconUrl || ''}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="/favicon.ico"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
              />
            </div>

            {/* Free Images Link */}
            <div className="mt-3">
              <a
                href="https://www.flaticon.com/free-icons/favicon"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t('themeConfig.favicon.exploreFree', 'Explorar imágenes gratuitas')}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Info Text */}
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {t('themeConfig.favicon.sizeInfo', 'Will be scaled down to 32 x 32px')}
            </p>
          </div>

          {/* Validation Message */}
          {ensuredConfig.faviconUrl && !validateFaviconUrl(ensuredConfig.faviconUrl) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                {t('themeConfig.favicon.invalidUrl', 'Please enter a valid favicon URL or upload a file')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}