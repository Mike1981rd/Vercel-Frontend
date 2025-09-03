/**
 * @file FooterMenuBlock.tsx
 * @max-lines 150
 * Footer menu block component that fetches and displays navigation menu items
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface MenuItem {
  id: number;
  title: string;
  url: string;
  order: number;
}

interface FooterMenuBlockProps {
  settings: {
    navigationMenuId?: string;
    heading?: string;
  };
  isEditor?: boolean;
  colorScheme?: any;
  headingTypographyStyles?: React.CSSProperties;
  bodyTypographyStyles?: React.CSSProperties;
}

export function FooterMenuBlock({ settings, isEditor, colorScheme, headingTypographyStyles, bodyTypographyStyles }: FooterMenuBlockProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings.navigationMenuId) {
      fetchMenuItems(settings.navigationMenuId);
    }
  }, [settings.navigationMenuId]);

  const fetchMenuItems = async (menuId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Fetching menu items for menuId:', menuId);
      
      // Try the correct endpoint structure
      // First try to get the full menu with its items
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/NavigationMenu/${menuId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const menuData = await response.json();
        console.log('Menu data received:', menuData);
        
        // The NavigationMenu model has 'items' as a JSON string
        if (menuData.items) {
          try {
            // Parse the JSON string to get the actual items array
            const parsedItems = typeof menuData.items === 'string' 
              ? JSON.parse(menuData.items) 
              : menuData.items;
            
            console.log('Parsed items:', parsedItems);
            
            if (Array.isArray(parsedItems)) {
              // Map the items according to MenuItem model (Label, Link, Order)
              const sortedItems = parsedItems
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                .map((item: any, index: number) => ({
                  id: item.id || index + 1, // Use index as fallback id
                  title: item.label || item.Label || 'Sin título', // Backend uses 'Label'
                  url: item.link || item.Link || '#', // Backend uses 'Link'
                  order: item.order || item.Order || index
                }));
              console.log('Mapped items:', sortedItems);
              setMenuItems(sortedItems);
            } else {
              console.log('Items is not an array:', parsedItems);
              setMenuItems([]);
            }
          } catch (parseError) {
            console.error('Error parsing menu items:', parseError);
            setMenuItems([]);
          }
        } else {
          console.log('No items found in menu data, trying items endpoint');
          // Try the items endpoint as fallback
          const itemsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/NavigationMenu/${menuId}/items`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (itemsResponse.ok) {
            const items = await itemsResponse.json();
            const sortedItems = items.sort((a: MenuItem, b: MenuItem) => a.order - b.order);
            setMenuItems(sortedItems);
          } else {
            // Show sample items in editor
            if (isEditor) {
              setMenuItems([
                { id: 1, title: 'Inicio', url: '/', order: 1 },
                { id: 2, title: 'Productos', url: '/productos', order: 2 },
                { id: 3, title: 'Contacto', url: '/contacto', order: 3 }
              ]);
            }
          }
        }
      } else {
        console.log('Menu endpoint returned:', response.status);
        // Show sample items in editor for better UX
        if (isEditor) {
          setMenuItems([
            { id: 1, title: 'Inicio', url: '/', order: 1 },
            { id: 2, title: 'Productos', url: '/productos', order: 2 },
            { id: 3, title: 'Contacto', url: '/contacto', order: 3 }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // Show sample items in editor for better UX
      if (isEditor) {
        setMenuItems([
          { id: 1, title: 'Inicio', url: '/', order: 1 },
          { id: 2, title: 'Productos', url: '/productos', order: 2 },
          { id: 3, title: 'Contacto', url: '/contacto', order: 3 }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Custom heading from settings */}
      <h3 className="font-semibold mb-2 text-sm" style={{ 
        color: colorScheme?.text || '#ffffff',
        ...headingTypographyStyles
      }}>
        {settings.heading || 'Menú'}
      </h3>
      
      <ul className="space-y-1.5">
        {loading ? (
          <li key="loading">
            <span className="text-sm italic opacity-50" style={{ color: colorScheme?.text || '#999999' }}>
              Cargando elementos del menú...
            </span>
          </li>
        ) : settings.navigationMenuId ? (
          menuItems.length > 0 ? (
            menuItems.map((item) => {
              // Auto-detect policy pages and assign correct URLs
              let finalUrl = item.url;
              if (!finalUrl || finalUrl === '#' || finalUrl === '') {
                const titleLower = item.title?.toLowerCase() || '';
                if (titleLower.includes('reembolso') || titleLower.includes('devoluc') || titleLower.includes('return')) {
                  finalUrl = '/returns';
                } else if (titleLower.includes('privacidad') || titleLower.includes('privacy')) {
                  finalUrl = '/privacy';
                } else if (titleLower.includes('término') || titleLower.includes('servicio') || titleLower.includes('terms')) {
                  finalUrl = '/terms';
                } else if (titleLower.includes('envío') || titleLower.includes('shipping')) {
                  finalUrl = '/shipping';
                } else if (titleLower.includes('contacto') || titleLower.includes('contact')) {
                  finalUrl = '/contact';
                } else {
                  finalUrl = '#';
                }
              }
              
              return (
                <li key={`menu-item-${item.id}`}>
                  {isEditor || finalUrl === '#' ? (
                    <a 
                      href={finalUrl} 
                      className="text-sm opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                      style={{ 
                        color: colorScheme?.text || '#cccccc',
                        ...bodyTypographyStyles
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      {item.title}
                    </a>
                  ) : (
                    <Link 
                      href={finalUrl}
                      className="text-sm opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                      style={{ 
                        color: colorScheme?.text || '#cccccc',
                        ...bodyTypographyStyles
                      }}
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              );
            })
          ) : (
            <li key="no-items">
              <span className="text-sm italic opacity-50" style={{ color: colorScheme?.text || '#999999' }}>
                No hay elementos en este menú
              </span>
            </li>
          )
        ) : (
          <li key="no-menu">
            <span className="text-sm italic opacity-50" style={{ color: colorScheme?.text || '#999999' }}>
              [Selecciona un menú en la configuración]
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
