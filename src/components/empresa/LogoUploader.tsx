'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, Image, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface LogoUploaderProps {
  currentLogo?: string | null;
  currentSize?: number;
  onLogoChange: (logoUrl: string) => void;
  onSizeChange: (size: number) => void;
}

export function LogoUploader({ 
  currentLogo, 
  currentSize = 120, 
  onLogoChange, 
  onSizeChange 
}: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const [logoSize, setLogoSize] = useState(currentSize);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Actualizar preview cuando cambie currentLogo (cuando se carga desde DB)
  useEffect(() => {
    if (currentLogo) {
      setPreview(currentLogo);
    }
  }, [currentLogo]);

  // Actualizar logoSize cuando cambie currentSize
  useEffect(() => {
    setLogoSize(currentSize);
  }, [currentSize]);

  const formatFileUrl = (url: string): string => {
    if (!url) return '';
    // Si la URL ya es completa (empieza con http), devolverla tal cual
    if (url.startsWith('http')) return url;
    // Si es una ruta relativa, construir la URL completa
    // Remover /api del base URL para archivos estáticos
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7224/api').replace('/api', '');
    return `${baseUrl}${url}`;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Tipo de archivo inválido. Solo se permiten JPEG, PNG, GIF y WebP.');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es muy grande. Máximo 5MB.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Mostrar preview inmediato
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simular progreso para mejor UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if ((response.data as any).url) {
        const fullUrl = formatFileUrl((response.data as any).url);
        setPreview(fullUrl);
        onLogoChange((response.data as any).url);
        
        // Mostrar éxito brevemente
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al subir el logo');
      setPreview(currentLogo ? formatFileUrl(currentLogo) : null);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [currentLogo, onLogoChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleRemoveLogo = useCallback(async () => {
    if (!preview) return;

    try {
      const urlToDelete = currentLogo || preview;
      if (urlToDelete && !urlToDelete.startsWith('data:')) {
        await api.delete(`/upload/image?url=${encodeURIComponent(urlToDelete)}`);
      }
      setPreview(null);
      onLogoChange('');
    } catch (err) {
      console.error('Error removing logo:', err);
    }
  }, [preview, currentLogo, onLogoChange]);

  const handleSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    setLogoSize(newSize);
    onSizeChange(newSize);
  }, [onSizeChange]);

  // Formatear la URL del preview actual si existe
  const displayPreview = preview ? (preview.startsWith('data:') ? preview : formatFileUrl(preview)) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Logo de la empresa
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Arrastra una imagen o haz clic para seleccionar
        </p>
      </div>

      {/* Upload Area */}
      <div className="relative">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center",
            "w-[70%] sm:w-full h-32 sm:h-48 md:h-64 rounded-xl border-2 border-dashed",
            "transition-all duration-200 cursor-pointer",
            "hover:bg-gray-50 dark:hover:bg-gray-800/50",
            isDragging ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-gray-300 dark:border-gray-600",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          {displayPreview ? (
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayPreview}
                alt="Logo"
                style={{ 
                  maxWidth: isMobile ? Math.min(logoSize * 0.6, 80) : logoSize, 
                  maxHeight: isMobile ? Math.min(logoSize * 0.6, 80) : logoSize 
                }}
                className="object-contain rounded-lg shadow-lg"
              />
              
              {/* Overlay con opciones */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg transition-colors"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLogo();
                  }}
                  className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-colors"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress indicator */}
              {isUploading && uploadProgress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Success checkmark */}
              {uploadProgress === 100 && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 animate-in zoom-in duration-200">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Subiendo imagen...
                  </p>
                </div>
              ) : (
                <>
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 sm:mb-4">
                    <Image className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {isDragging ? 'Suelta aquí' : (isMobile ? 'Toca para subir' : 'Arrastra una imagen aquí')}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {!isMobile && <>o <span className="text-primary font-medium">selecciona un archivo</span></>}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 sm:mt-2">
                    JPEG, PNG, GIF, WebP • 5MB
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Size Control */}
      {displayPreview && (
        <div className="w-[70%] sm:w-full space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <label htmlFor="logo-size" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tamaño del logo
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                {logoSize}px
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Slider Container */}
            <div className="relative px-2">
              {/* Track Background */}
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
              
              {/* Progress Fill */}
              <div 
                className="absolute left-2 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-150 ease-out"
                style={{ 
                  width: `calc(${((logoSize - 60) / (200 - 60)) * 100}% - 8px)`
                }}
              />
              
              {/* Slider Input */}
              <input
                id="logo-size"
                type="range"
                min="60"
                max="200"
                value={logoSize}
                onChange={handleSizeChange}
                className="relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                         [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                         [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-green-500
                         [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150
                         [&::-webkit-slider-thumb]:hover:scale-110
                         [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-white 
                         [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer 
                         [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 
                         [&::-moz-range-thumb]:border-green-500 [&::-moz-range-thumb]:transition-transform
                         [&::-moz-range-thumb]:duration-150 [&::-moz-range-thumb]:hover:scale-110"
              />
              
              {/* Value Markers */}
              <div className="absolute inset-x-0 -bottom-6 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>60px</span>
                <span className="text-gray-400">•</span>
                <span>100px</span>
                <span className="text-gray-400">•</span>
                <span>150px</span>
                <span className="text-gray-400">•</span>
                <span>200px</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-8 pt-2">
            Este tamaño se aplicará en el login y el sidebar del dashboard
          </p>
        </div>
      )}
    </div>
  );
}