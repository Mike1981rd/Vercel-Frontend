/**
 * @file ImageBannerMedia.tsx
 * @max-lines 300
 * @current-lines 245
 * Media configuration for Image Banner with upload support
 */

'use client';

import React, { useState, useRef } from 'react';
import { API_URL } from '@/lib/constants';
import { ChevronDown, ChevronUp, Upload, X, Image, Film, Volume2, VolumeX } from 'lucide-react';
import { ImageBannerConfig } from './types';

interface ImageBannerMediaProps {
  config: ImageBannerConfig;
  onChange: (updates: Partial<ImageBannerConfig>) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ImageBannerMedia({ config, onChange, isExpanded, onToggle }: ImageBannerMediaProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const desktopFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, isMobile: boolean) => {
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/mediaupload/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      
      if (isMobile) {
        onChange({ mobileImage: data.url });
      } else {
        onChange({ desktopImage: data.url });
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, isMobile);
    }
  };

  const handleRemoveMedia = (isMobile: boolean) => {
    if (isMobile) {
      onChange({ mobileImage: '' });
    } else {
      onChange({ desktopImage: '' });
    }
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className="text-xs font-medium text-gray-900 dark:text-white">
          Media
        </span>
        {isExpanded ? 
          <ChevronUp className="w-3 h-3 text-gray-500" /> : 
          <ChevronDown className="w-3 h-3 text-gray-500" />
        }
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {uploadError && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
              {uploadError}
            </div>
          )}

          {/* Desktop Image/Video */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Desktop image/video
            </label>
            
            {config.desktopImage ? (
              <div className="relative">
                {isVideo(config.desktopImage) ? (
                  <div className="relative bg-gray-100 dark:bg-gray-800 rounded-md p-3 flex items-center gap-2">
                    <Film className="w-5 h-5 text-gray-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                      {config.desktopImage.split('/').pop()}
                    </span>
                    <button
                      onClick={() => handleRemoveMedia(false)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={config.desktopImage} 
                      alt="Desktop" 
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      onClick={() => handleRemoveMedia(false)}
                      className="absolute top-1 right-1 p-1 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  ref={desktopFileRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleFileSelect(e, false)}
                  className="hidden"
                />
                <button
                  onClick={() => desktopFileRef.current?.click()}
                  disabled={isUploading}
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Select image or video
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Desktop Overlay Opacity */}
            {config.desktopImage && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Overlay opacity
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.desktopOverlayOpacity}
                    onChange={(e) => onChange({ desktopOverlayOpacity: parseInt(e.target.value) })}
                    className="flex-1 min-w-0"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      className="w-12 px-1 py-1 text-xs border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      value={config.desktopOverlayOpacity}
                      onChange={(e) => onChange({ desktopOverlayOpacity: parseInt(e.target.value) })}
                      min="0"
                      max="100"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Image/Video */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Mobile image/video
              <span className="text-gray-500 dark:text-gray-400 ml-1 font-normal">(optional)</span>
            </label>
            
            {config.mobileImage ? (
              <div className="relative">
                {isVideo(config.mobileImage) ? (
                  <div className="relative bg-gray-100 dark:bg-gray-800 rounded-md p-3 flex items-center gap-2">
                    <Film className="w-5 h-5 text-gray-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                      {config.mobileImage.split('/').pop()}
                    </span>
                    <button
                      onClick={() => handleRemoveMedia(true)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={config.mobileImage} 
                      alt="Mobile" 
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      onClick={() => handleRemoveMedia(true)}
                      className="absolute top-1 right-1 p-1 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  ref={mobileFileRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleFileSelect(e, true)}
                  className="hidden"
                />
                <button
                  onClick={() => mobileFileRef.current?.click()}
                  disabled={isUploading}
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Select image or video
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Mobile Overlay Opacity */}
            {(config.mobileImage || config.desktopImage) && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Overlay opacity
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.mobileOverlayOpacity}
                    onChange={(e) => onChange({ mobileOverlayOpacity: parseInt(e.target.value) })}
                    className="flex-1 min-w-0"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      className="w-12 px-1 py-1 text-xs border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      value={config.mobileOverlayOpacity}
                      onChange={(e) => onChange({ mobileOverlayOpacity: parseInt(e.target.value) })}
                      min="0"
                      max="100"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Sound Toggle - Only show if there's a video */}
          {(isVideo(config.desktopImage) || isVideo(config.mobileImage || '')) && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {config.videoSound ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                  Video sound
                </label>
                <button
                  type="button"
                  onClick={() => onChange({ videoSound: !config.videoSound })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    config.videoSound 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Enable video sound</span>
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      config.videoSound ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {config.videoSound 
                  ? 'Video will play with sound'
                  : 'Video will be muted (recommended for autoplay)'}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Supported: JPG, PNG, WebP, GIF, MP4, WebM, MOV
          </p>
        </div>
      )}
    </div>
  );
}
