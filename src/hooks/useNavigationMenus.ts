/**
 * @file useNavigationMenus.ts
 * @max-lines 100
 * Hook para obtener los menús de navegación
 */

import { useState, useEffect } from 'react';

interface NavigationMenu {
  id: number;
  name: string;
  identifier: string;
  menuType: string;
  isActive: boolean;
  items?: any[]; // Optional items array for menu items
}

export function useNavigationMenus() {
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/NavigationMenu?pageSize=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filtrar solo menús activos
        const activeMenus = data.items.filter((menu: NavigationMenu) => menu.isActive);
        setMenus(activeMenus);
      }
    } catch (error) {
      console.error('Error fetching navigation menus:', error);
    } finally {
      setLoading(false);
    }
  };

  return { menus, loading };
}
