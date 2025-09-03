'use client';

import React, { useState } from 'react';
import PreviewRoomGallery from '@/components/preview/PreviewRoomGallery';

export default function TestCornerRadius() {
  const baseConfig = {
    enabled: true,
    layoutStyle: 'grid' as const,
    colorScheme: 1 as const,
    fontSize: {
      caption: 100,
      button: 100
    },
    showAllPhotosButton: true,
    buttonText: 'Show all photos',
    showCaptions: false,
    paddingTop: 24,
    paddingBottom: 24,
    containerPaddingTop: 0,
    containerPaddingBottom: 24
  };

  const radiusOptions = [
    { value: 'none' as const, label: 'None (0px)' },
    { value: 'small' as const, label: 'Small (4px)' },
    { value: 'medium' as const, label: 'Medium (8px)' },
    { value: 'large' as const, label: 'Large (16px)' }
  ];

  const [selectedRadius, setSelectedRadius] = useState<'none' | 'small' | 'medium' | 'large'>('medium');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Corner Radius Test</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Corner Radius:</label>
        <div className="flex gap-2">
          {radiusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedRadius(option.value)}
              className={`px-4 py-2 rounded border ${
                selectedRadius === option.value 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white border-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
        <p className="text-sm">
          <strong>Current setting:</strong> {radiusOptions.find(r => r.value === selectedRadius)?.label}
        </p>
        <p className="text-xs mt-1 text-gray-600">
          Look at the corners of the images below. The radius should change when you click different options.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Grid Layout</h2>
          <div className="border-2 border-red-500 p-1">
            <PreviewRoomGallery 
              config={{
                ...baseConfig,
                layoutStyle: 'grid',
                cornerRadius: selectedRadius
              }} 
              isEditor={true} 
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Featured + Grid Layout</h2>
          <div className="border-2 border-blue-500 p-1">
            <PreviewRoomGallery 
              config={{
                ...baseConfig,
                layoutStyle: 'airbnb',
                cornerRadius: selectedRadius
              }} 
              isEditor={true} 
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Carousel Layout</h2>
        <div className="border-2 border-green-500 p-1">
          <PreviewRoomGallery 
            config={{
              ...baseConfig,
              layoutStyle: 'carousel',
              cornerRadius: selectedRadius
            }} 
            isEditor={true} 
          />
        </div>
      </div>
    </div>
  );
}