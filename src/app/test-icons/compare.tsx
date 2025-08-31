/**
 * @file compare.tsx
 * @description Componente de comparación visual de iconos
 */

'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconComparisonProps {
  strokeWidth?: number;
  size?: number;
  color?: string;
}

export function IconComparison({ 
  strokeWidth = 1.5, 
  size = 24, 
  color = '#ffffff' 
}: IconComparisonProps) {
  
  // Iconos específicos de e-commerce como Shopify
  const ecommerceIcons = [
    { name: 'ShoppingCart', label: 'Cart' },
    { name: 'Package', label: 'Product' },
    { name: 'Truck', label: 'Shipping' },
    { name: 'CreditCard', label: 'Payment' },
    { name: 'Tag', label: 'Price' },
    { name: 'Gift', label: 'Gift' },
    { name: 'Heart', label: 'Wishlist' },
    { name: 'Star', label: 'Review' },
    { name: 'User', label: 'Account' },
    { name: 'Search', label: 'Search' },
    { name: 'Filter', label: 'Filter' },
    { name: 'ShoppingBag', label: 'Bag' },
    { name: 'Receipt', label: 'Invoice' },
    { name: 'Percent', label: 'Discount' },
    { name: 'Store', label: 'Store' },
  ];

  // UI Icons
  const uiIcons = [
    { name: 'Menu', label: 'Menu' },
    { name: 'X', label: 'Close' },
    { name: 'Plus', label: 'Add' },
    { name: 'Minus', label: 'Remove' },
    { name: 'ChevronDown', label: 'Expand' },
    { name: 'ChevronRight', label: 'Next' },
    { name: 'ArrowLeft', label: 'Back' },
    { name: 'ArrowRight', label: 'Forward' },
    { name: 'Check', label: 'Check' },
    { name: 'Copy', label: 'Copy' },
    { name: 'Share2', label: 'Share' },
    { name: 'Download', label: 'Download' },
    { name: 'Upload', label: 'Upload' },
    { name: 'Edit', label: 'Edit' },
    { name: 'Trash2', label: 'Delete' },
  ];

  const renderIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? (
      <Icon 
        size={size} 
        strokeWidth={strokeWidth} 
        color={color}
      />
    ) : (
      <div 
        style={{ 
          width: size, 
          height: size, 
          border: `1px dashed ${color}`,
          opacity: 0.3 
        }} 
      />
    );
  };

  return (
    <div className="space-y-8">
      {/* E-commerce Icons */}
      <div>
        <h3 className="text-white text-sm font-medium mb-4 opacity-80">
          E-commerce Icons (Shopify Style)
        </h3>
        <div className="grid grid-cols-5 gap-8">
          {ecommerceIcons.map((icon) => (
            <div 
              key={icon.name} 
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="p-3 rounded-lg transition-all group-hover:bg-white/10">
                {renderIcon(icon.name)}
              </div>
              <span 
                className="text-xs opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ color }}
              >
                {icon.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* UI Icons */}
      <div>
        <h3 className="text-white text-sm font-medium mb-4 opacity-80">
          UI Icons
        </h3>
        <div className="grid grid-cols-5 gap-8">
          {uiIcons.map((icon) => (
            <div 
              key={icon.name} 
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="p-3 rounded-lg transition-all group-hover:bg-white/10">
                {renderIcon(icon.name)}
              </div>
              <span 
                className="text-xs opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ color }}
              >
                {icon.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stroke Width Comparison */}
      <div>
        <h3 className="text-white text-sm font-medium mb-4 opacity-80">
          Stroke Width Comparison
        </h3>
        <div className="flex gap-8 items-center">
          {[0.5, 1, 1.5, 2, 2.5, 3].map((width) => (
            <div key={width} className="flex flex-col items-center gap-2">
              <LucideIcons.ShoppingCart 
                size={32} 
                strokeWidth={width} 
                color={color}
              />
              <span className="text-xs opacity-60" style={{ color }}>
                {width}px
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Size Comparison */}
      <div>
        <h3 className="text-white text-sm font-medium mb-4 opacity-80">
          Size Comparison
        </h3>
        <div className="flex gap-8 items-end">
          {[16, 20, 24, 32, 40, 48].map((iconSize) => (
            <div key={iconSize} className="flex flex-col items-center gap-2">
              <LucideIcons.Package 
                size={iconSize} 
                strokeWidth={strokeWidth} 
                color={color}
              />
              <span className="text-xs opacity-60" style={{ color }}>
                {iconSize}px
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}