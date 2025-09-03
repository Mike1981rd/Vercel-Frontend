'use client';

import React, { useState } from 'react';
import PreviewRoomGallery from '@/components/preview/PreviewRoomGallery';

export default function TestRoomGallery() {
  const [config, setConfig] = useState({
    enabled: true,
    layoutStyle: 'airbnb' as const,
    colorScheme: 1 as const,
    fontSize: {
      caption: 100,
      button: 100
    },
    cornerRadius: 'medium' as const,
    showAllPhotosButton: true,
    buttonText: 'Show all photos',
    showCaptions: false,
    paddingTop: 24,
    paddingBottom: 24,
    containerPaddingTop: 0,
    containerPaddingBottom: 24
  });

  const testConfigurations = [
    {
      name: 'Test 1: Color Scheme 2 + Large Corner Radius',
      config: { ...config, colorScheme: 2 as const, cornerRadius: 'large' as const }
    },
    {
      name: 'Test 2: Grid Layout + Color Scheme 3',
      config: { ...config, layoutStyle: 'grid' as const, colorScheme: 3 as const, showCaptions: true }
    },
    {
      name: 'Test 3: Carousel + Small Font + No Corner',
      config: { 
        ...config, 
        layoutStyle: 'carousel' as const, 
        fontSize: { caption: 80, button: 80 },
        cornerRadius: 'none' as const
      }
    },
    {
      name: 'Test 4: Large Padding + Color Scheme 4',
      config: { 
        ...config, 
        colorScheme: 4 as const,
        paddingTop: 60,
        paddingBottom: 60,
        containerPaddingTop: 40,
        containerPaddingBottom: 40
      }
    },
    {
      name: 'Test 5: Negative Container Spacing',
      config: { 
        ...config, 
        containerPaddingTop: -20,
        containerPaddingBottom: -20,
        colorScheme: 5 as const
      }
    }
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Room Gallery Configuration Tests</h1>
      
      {testConfigurations.map((test, index) => (
        <div key={index} className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">{test.name}</h2>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <pre className="text-xs">
              {JSON.stringify(test.config, null, 2)}
            </pre>
          </div>
          <div className="border-2 border-dashed border-blue-300 relative">
            <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1">
              Preview Area
            </div>
            <PreviewRoomGallery config={test.config} isEditor={true} />
          </div>
        </div>
      ))}
    </div>
  );
}