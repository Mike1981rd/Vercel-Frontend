import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { validateImageFile, fileToBase64, getResponsiveImageProps } from '@/lib/image-optimizer';
import { getApiEndpoint, getImageUrl } from '@/lib/api-url';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  maxWidth = 400,
  maxHeight = 200,
  aspectRatio,
  className = ''
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      // Ensure the URL is complete with backend host if it's a relative path
      const imageUrl = getImageUrl(value);
      setPreview(imageUrl);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for preview
      const base64 = await fileToBase64(file);
      setPreview(base64);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');

      // Upload to backend
      const response = await fetch(getApiEndpoint('upload/image'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      // Ensure the URL is complete with backend host
      const imageUrl = getImageUrl(data.url);
      onChange(imageUrl);
      setPreview(imageUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    setError(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : error 
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ width: '100%', maxWidth }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {preview ? (
          <div className="relative group" style={{ minHeight: 80 }}>
            <img
              src={preview}
              alt="Logo preview"
              className="w-full object-contain rounded-lg"
              style={{ maxHeight: maxHeight || 200, display: 'block' }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <button
                onClick={handleRemove}
                className="p-2 bg-white rounded-full text-gray-700 hover:text-red-500 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-6 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            type="button"
            disabled={isUploading}
            style={{ minHeight: maxHeight || 100 }}
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
            ) : (
              <Upload className="w-8 h-8 mb-2" />
            )}
            <span className="text-sm font-medium">
              {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              SVG, PNG, JPG or WebP (max. 5MB)
            </span>
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        For best results, use a transparent PNG or SVG file
      </p>
    </div>
  );
}