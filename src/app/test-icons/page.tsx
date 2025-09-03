/**
 * @file page.tsx
 * @description Página de prueba para comparar librerías de iconos
 * Compara Lucide, Feather, Heroicons y Tabler Icons
 */

'use client';

import React, { useState } from 'react';
// Lucide (ya instalado)
import * as LucideIcons from 'lucide-react';
import { IconComparison } from './compare';

// Para instalar las otras librerías ejecutar:
// npm install react-feather @heroicons/react @tabler/icons-react

export default function IconTestPage() {
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [iconSize, setIconSize] = useState(24);
  const [bgColor, setBgColor] = useState('#0f172a'); // Shopify dark blue
  
  // Iconos comunes para comparar
  const testIcons = [
    'ShoppingCart',
    'Heart',
    'Star', 
    'Search',
    'Menu',
    'User',
    'Settings',
    'Package',
    'Truck',
    'Gift',
    'Tag',
    'CreditCard',
    'Lock',
    'Mail',
    'Phone',
    'Home',
    'ArrowRight',
    'Check',
    'X',
    'Plus'
  ];

  // Función para obtener icono de Lucide
  const getLucideIcon = (name: string) => {
    const Icon = (LucideIcons as any)[name];
    return Icon ? <Icon size={iconSize} strokeWidth={strokeWidth} /> : null;
  };

  return (
    <div className="bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto pb-20">
        <h1 className="text-3xl font-bold mb-8">Icon Library Comparison</h1>
        
        {/* Controles */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Controls</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stroke Width</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.25"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{strokeWidth}px</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Icon Size</label>
              <input
                type="range"
                min="16"
                max="48"
                step="4"
                value={iconSize}
                onChange={(e) => setIconSize(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{iconSize}px</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Background</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBgColor('#0f172a')}
                  className="px-3 py-1 text-xs rounded"
                  style={{ backgroundColor: '#0f172a', color: 'white' }}
                >
                  Dark
                </button>
                <button
                  onClick={() => setBgColor('#ffffff')}
                  className="px-3 py-1 text-xs rounded border"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  Light
                </button>
                <button
                  onClick={() => setBgColor('#1e293b')}
                  className="px-3 py-1 text-xs rounded"
                  style={{ backgroundColor: '#1e293b', color: 'white' }}
                >
                  Gray
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comparación de Librerías */}
        <div className="space-y-8">
          
          {/* Lucide React (Actual) - Enhanced View */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Lucide React (Currently Using)</h3>
              <p className="text-sm text-gray-500">Successor to Feather Icons, actively maintained</p>
              <p className="text-xs text-gray-400 mt-1">npm install lucide-react | 290+ icons | ~13KB per icon</p>
            </div>
            <div 
              className="p-8"
              style={{ backgroundColor: bgColor }}
            >
              <IconComparison 
                strokeWidth={strokeWidth}
                size={iconSize}
                color={bgColor === '#ffffff' ? '#0f172a' : '#ffffff'}
              />
            </div>
          </div>

          {/* Feather Icons (Original) */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Feather Icons</h3>
              <p className="text-sm text-gray-500">Original minimalist icon set (less maintained)</p>
              <p className="text-xs text-gray-400 mt-1">npm install react-feather | 287 icons | ~2KB per icon</p>
            </div>
            <div 
              className="p-8"
              style={{ backgroundColor: bgColor }}
            >
              <p className="text-center" style={{ color: bgColor === '#ffffff' ? '#0f172a' : '#ffffff' }}>
                Run: npm install react-feather
              </p>
            </div>
          </div>

          {/* Heroicons */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Heroicons (by Tailwind team)</h3>
              <p className="text-sm text-gray-500">Outline & Solid variants, made for Tailwind CSS</p>
              <p className="text-xs text-gray-400 mt-1">npm install @heroicons/react | 292 icons | ~1KB per icon</p>
            </div>
            <div 
              className="p-8"
              style={{ backgroundColor: bgColor }}
            >
              <p className="text-center" style={{ color: bgColor === '#ffffff' ? '#0f172a' : '#ffffff' }}>
                Run: npm install @heroicons/react
              </p>
            </div>
          </div>

          {/* Tabler Icons */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Tabler Icons</h3>
              <p className="text-sm text-gray-500">3100+ free SVG icons, very comprehensive</p>
              <p className="text-xs text-gray-400 mt-1">npm install @tabler/icons-react | 3100+ icons | ~1KB per icon</p>
            </div>
            <div 
              className="p-8"
              style={{ backgroundColor: bgColor }}
            >
              <p className="text-center" style={{ color: bgColor === '#ffffff' ? '#0f172a' : '#ffffff' }}>
                Run: npm install @tabler/icons-react
              </p>
            </div>
          </div>

          {/* Phosphor Icons */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Phosphor Icons</h3>
              <p className="text-sm text-gray-500">Flexible icon family with 6 weights</p>
              <p className="text-xs text-gray-400 mt-1">npm install @phosphor-icons/react | 7000+ icons (all weights) | ~1.5KB per icon</p>
            </div>
            <div 
              className="p-8"
              style={{ backgroundColor: bgColor }}
            >
              <p className="text-center" style={{ color: bgColor === '#ffffff' ? '#0f172a' : '#ffffff' }}>
                Run: npm install @phosphor-icons/react
              </p>
            </div>
          </div>

          {/* Radix Icons */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Radix Icons</h3>
              <p className="text-sm text-gray-500">15×15 icons designed for UI components</p>
              <p className="text-xs text-gray-400 mt-1">npm install @radix-ui/react-icons | 300+ icons | ~1KB per icon</p>
            </div>
            <div 
              className="p-8"
              style={{ backgroundColor: bgColor }}
            >
              <p className="text-center" style={{ color: bgColor === '#ffffff' ? '#0f172a' : '#ffffff' }}>
                Run: npm install @radix-ui/react-icons
              </p>
            </div>
          </div>

        </div>

        {/* Comparación y Recomendación */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Comparison & Recommendation</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-blue-600">🏆 Current Choice: Lucide React</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>✅ Successor to Feather Icons with same elegant style</li>
                <li>✅ Actively maintained with regular updates</li>
                <li>✅ Perfect stroke weight customization (matches Shopify)</li>
                <li>✅ Consistent 24×24 viewBox</li>
                <li>✅ Tree-shakeable (only import what you use)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Alternative Options:</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li><strong>Tabler Icons:</strong> Best if you need more icon variety (3100+)</li>
                <li><strong>Heroicons:</strong> Best if using Tailwind UI components</li>
                <li><strong>Phosphor:</strong> Best if you need multiple weights (thin, light, regular, bold, fill, duotone)</li>
                <li><strong>Radix:</strong> Best for smaller UI elements (15×15)</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <strong>Shopify Style Match:</strong> Lucide React with strokeWidth={strokeWidth} 
                provides the closest match to Shopify's elegant outline icons. 
                The thin, consistent strokes create a premium, minimalist aesthetic.
              </p>
            </div>
          </div>
        </div>

        {/* Test Installation Commands */}
        <div className="mt-8 bg-gray-900 text-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Test Commands</h3>
          <pre className="text-sm">
            <code>{`# Install all libraries to test
npm install react-feather @heroicons/react @tabler/icons-react @phosphor-icons/react @radix-ui/react-icons

# Or install one by one:
npm install react-feather        # Original Feather
npm install @heroicons/react     # Heroicons
npm install @tabler/icons-react  # Tabler Icons
npm install @phosphor-icons/react # Phosphor Icons
npm install @radix-ui/react-icons # Radix Icons`}</code>
          </pre>
        </div>

      </div>
    </div>
  );
}