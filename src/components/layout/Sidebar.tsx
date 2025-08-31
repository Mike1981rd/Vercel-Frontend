'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, buildAssetUrl } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';
import { useCompany } from '@/contexts/CompanyContext';
import { usePermissions } from '@/hooks/usePermissions';
import Image from 'next/image';
import {
  DashboardIcon,
  CompanyIcon,
  UsersIcon,
  RolesIcon,
  ClientsIcon,
  RoomsIcon,
  ReservationsIcon,
  AvailabilityIcon,
  ProductsIcon,
  CollectionsIcon,
  PagesIcon,
  WebsiteIcon,
  PaymentIcon,
  DomainsIcon,
  PoliciesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  WhatsAppIcon,
  NotificationIcon,
  OrdersIcon,
  SubscribersIcon,
  NavigationIcon,
  EditorIcon,
  ReviewsIcon
} from '@/components/ui/Icons';

// Define menu item type
interface MenuItem {
  id: string;
  nameKey: string;
  href?: string;
  icon: any;
  permission: string;
  children?: MenuItem[];
}

// Define menu items with translation keys
const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    nameKey: 'navigation.dashboard',
    href: '/dashboard',
    icon: DashboardIcon,
    permission: 'dashboard.read'
  },
  {
    id: 'empresa',
    nameKey: 'navigation.empresa',
    href: '/dashboard/empresa/configuracion',
    icon: CompanyIcon,
    permission: 'company.read'
  },
  {
    id: 'roles-usuarios',
    nameKey: 'navigation.rolesUsuarios',
    href: '/dashboard/roles-usuarios',
    icon: UsersIcon,
    permission: 'users.read'
  },
  {
    id: 'clientes',
    nameKey: 'navigation.clientes',
    href: '/dashboard/clientes',
    icon: ClientsIcon,
    permission: 'customers.read'
  },
  {
    id: 'hotel',
    nameKey: 'navigation.hotel',
    icon: RoomsIcon,
    permission: 'hotel.read',
    children: [
      {
        id: 'reservaciones',
        nameKey: 'navigation.reservaciones',
        href: '/dashboard/reservaciones',
        icon: ReservationsIcon,
        permission: 'reservations.read'
      },
      {
        id: 'habitaciones',
        nameKey: 'navigation.habitaciones',
        href: '/dashboard/habitaciones',
        icon: RoomsIcon,
        permission: 'rooms.read'
      },
      {
        id: 'hosts',
        nameKey: 'navigation.hosts',
        href: '/dashboard/hosts',
        icon: UsersIcon,
        permission: 'hosts.read'
      },
      {
        id: 'disponibilidad',
        nameKey: 'navigation.disponibilidad',
        href: '/dashboard/disponibilidad',
        icon: AvailabilityIcon,
        permission: 'availability.read'
      },
      {
        id: 'gestion-catalogo',
        nameKey: 'navigation.gestionCatalogo',
        href: '/dashboard/config-options',
        icon: CollectionsIcon,
        permission: 'config.read'
      }
    ]
  },
  {
    id: 'productos',
    nameKey: 'navigation.productos',
    href: '/dashboard/productos',
    icon: ProductsIcon,
    permission: 'products.read'
  },
  {
    id: 'sitio-web',
    nameKey: 'navigation.websiteBuilder',
    icon: WebsiteIcon,
    permission: 'website.read',
    children: [
      {
        id: 'editor',
        nameKey: 'navigation.editor',
        href: '/editor',
        icon: EditorIcon,
        permission: 'website.editor'
      },
      {
        id: 'whatsapp',
        nameKey: 'navigation.whatsapp',
        href: '/whatsapp',
        icon: WhatsAppIcon,
        permission: 'whatsapp.read'
      },
      {
        id: 'colecciones',
        nameKey: 'navigation.colecciones',
        href: '/dashboard/colecciones',
        icon: CollectionsIcon,
        permission: 'collections.read'
      },
      {
        id: 'notificaciones',
        nameKey: 'navigation.notificaciones',
        href: '/notificaciones',
        icon: NotificationIcon,
        permission: 'notifications.read'
      },
      {
        id: 'orders',
        nameKey: 'navigation.orders',
        href: '/dashboard/orders',
        icon: OrdersIcon,
        permission: 'orders.read'
      },
      {
        id: 'reviews',
        nameKey: 'navigation.reviews',
        href: '/dashboard/reviews',
        icon: ReviewsIcon,
        permission: 'reviews.read'
      },
      {
        id: 'subscriptores',
        nameKey: 'navigation.subscriptores',
        href: '/dashboard/subscriptores',
        icon: SubscribersIcon,
        permission: 'subscribers.read'
      },
      {
        id: 'navegacion',
        nameKey: 'navigation.navegacion',
        href: '/dashboard/navigation-menus',
        icon: NavigationIcon,
        permission: 'navigation.read'
      },
      {
        id: 'paginas',
        nameKey: 'navigation.paginas',
        href: '/dashboard/paginas',
        icon: PagesIcon,
        permission: 'pages.read'
      },
      {
        id: 'politicas',
        nameKey: 'navigation.politicas',
        href: '/dashboard/politicas',
        icon: PoliciesIcon,
        permission: 'policies.read'
      },
      {
        id: 'dominios',
        nameKey: 'navigation.dominios',
        href: '/dashboard/dominios',
        icon: DomainsIcon,
        permission: 'domains.read'
      }
    ]
  }
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function Sidebar({ collapsed = false, onToggle, className }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['sitio-web', 'hotel']); // Default expanded
  const { t } = useI18n();
  const { company } = useCompany();
  const { hasPermission: checkPermission, loading: permissionsLoading } = usePermissions();
  
  // Calculate logo size for sidebar based on logoSize (scale from 120px default to sidebar size)
  const calculateSidebarLogoSize = (originalSize: number = 120): number => {
    // Original range: 80-160px, Sidebar range: 24-48px
    const minOriginal = 80;
    const maxOriginal = 160;
    const minSidebar = 24;
    const maxSidebar = 48;
    
    // Normalize to 0-1 range
    const normalized = (originalSize - minOriginal) / (maxOriginal - minOriginal);
    // Scale to sidebar range
    return Math.round(minSidebar + normalized * (maxSidebar - minSidebar));
  };
  
  const sidebarLogoSize = calculateSidebarLogoSize(company?.logoSize);
  
  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-expand parent if child is active
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          pathname === child.href || pathname.startsWith(child.href + '/')
        );
        if (hasActiveChild && !expandedItems.includes(item.id)) {
          setExpandedItems(prev => [...prev, item.id]);
        }
      }
    });
  }, [pathname]);

  if (!mounted || permissionsLoading) {
    return null;
  }

  // Filter menu items based on permissions and hide specific items
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // Hide "Métodos de pago" from the sidebar
      if (item.id === 'metodos-pago') {
        return false;
      }
      
      // Check if user has permission for this item
      if (!checkPermission(item.permission)) {
        return false;
      }
      
      // If item has children, filter them too
      if (item.children) {
        const filteredChildren = filterMenuItems(item.children);
        // Only show parent if it has at least one visible child
        if (filteredChildren.length > 0) {
          item.children = filteredChildren;
          return true;
        }
        return false;
      }
      
      return true;
    });
  };

  const visibleMenuItems = filterMenuItems([...menuItems]);

  // Check if user has permission
  const hasPermission = (permission: string) => {
    return checkPermission(permission);
  };

  // Toggle expanded state for parent items
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Render menu item
  const renderMenuItem = (item: MenuItem, isChild: boolean = false) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    
    // Check if item or any of its children are active
    let isActive = false;
    if (item.href) {
      isActive = pathname === item.href || 
        (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) ||
        (item.href === '/dashboard' && pathname === '/dashboard');
    }
    if (item.children) {
      const hasActiveChild = item.children.some(child => 
        pathname === child.href || (child.href && pathname.startsWith(child.href + '/'))
      );
      if (hasActiveChild) isActive = true;
    }

    if (hasChildren) {
      // Parent item with children
      return (
        <li key={item.id}>
          <button
            onClick={() => toggleExpanded(item.id)}
            className={cn(
              'w-full flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200 group relative',
              collapsed ? 'justify-center px-0' : 'justify-between px-3',
              isActive
                ? 'bg-sidebar-active text-white shadow-lg'
                : 'text-sidebar-textSecondary hover:bg-sidebar-bgHover hover:text-sidebar-text'
            )}
          >
            <div className={cn('flex items-center', collapsed ? '' : 'gap-3')}>
              <Icon
                size={20}
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-white' : 'text-sidebar-textSecondary group-hover:text-sidebar-text'
                )}
              />
              {!collapsed && (
                <span className="flex-1 text-left truncate">
                  {t(item.nameKey)}
                </span>
              )}
            </div>
            {!collapsed && (
              <ChevronDownIcon 
                size={16} 
                className={cn(
                  'transition-transform duration-200',
                  isExpanded ? 'rotate-180' : '',
                  isActive ? 'text-white' : 'text-sidebar-textSecondary group-hover:text-sidebar-text'
                )}
              />
            )}
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-xs text-white opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 pointer-events-none">
                {t(item.nameKey)}
                <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-gray-800"></div>
              </div>
            )}
          </button>
          
          {/* Children items */}
          {!collapsed && isExpanded && item.children && (
            <ul className="mt-1 ml-4 space-y-1">
              {item.children.map(child => renderMenuItem(child, true))}
            </ul>
          )}
        </li>
      );
    } else {
      // Regular item without children
      return (
        <li key={item.id}>
          <Link
            href={item.href || '#'}
            className={cn(
              'flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200 group relative',
              collapsed ? 'justify-center px-0' : 'gap-3 px-3',
              isChild && !collapsed ? 'pl-9' : '', // Indent child items
              isActive
                ? 'bg-sidebar-active text-white shadow-lg'
                : 'text-sidebar-textSecondary hover:bg-sidebar-bgHover hover:text-sidebar-text'
            )}
            title={collapsed ? t(item.nameKey) : undefined}
          >
            <Icon
              size={isChild ? 18 : 20}
              className={cn(
                'flex-shrink-0 transition-colors',
                isActive ? 'text-white' : 'text-sidebar-textSecondary group-hover:text-sidebar-text'
              )}
            />
            {!collapsed && (
              <span className="flex-1 truncate">
                {t(item.nameKey)}
              </span>
            )}
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-xs text-white opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 pointer-events-none">
                {t(item.nameKey)}
                <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-gray-800"></div>
              </div>
            )}
          </Link>
        </li>
      );
    }
  };

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen shadow-sidebar transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-72',
          'hidden lg:block', // Changed from md:block to lg:block for better mobile experience
          className
        )}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          width: collapsed ? '80px' : '320px',
          minWidth: collapsed ? '80px' : '320px',
          maxWidth: collapsed ? '80px' : '320px'
        }}
      >
        {/* Logo and Toggle */}
        <div className={cn(
          "flex h-16 items-center justify-between transition-all duration-300",
          collapsed ? "px-3" : "px-4"
        )}>
          <div className="flex items-center gap-3">
            {/* Logo */}
            {(company as any)?.logo && buildAssetUrl((company as any).logo) ? (
              <div 
                className="relative overflow-hidden rounded-lg"
                style={{ 
                  width: `${sidebarLogoSize}px`, 
                  height: `${sidebarLogoSize}px` 
                }}
              >
                <Image 
                  src={buildAssetUrl((company as any).logo)!} 
                  alt={company?.name || 'Company Logo'} 
                  fill
                  className="object-contain"
                  sizes={`${sidebarLogoSize}px`}
                  priority
                />
              </div>
            ) : (
              <div 
                className="flex items-center justify-center rounded-lg bg-primary-500 text-white font-bold"
                style={{ 
                  width: `${sidebarLogoSize}px`, 
                  height: `${sidebarLogoSize}px`,
                  fontSize: `${sidebarLogoSize * 0.4}px`
                }}
              >
                {company?.name ? company.name.charAt(0).toUpperCase() : 'WB'}
              </div>
            )}
            
            {/* Brand Name */}
            {!collapsed && (
              <span className="font-semibold text-lg text-sidebar-text transition-opacity duration-300">
                {company?.name || 'WebsiteBuilder'}
              </span>
            )}
          </div>

          {/* Toggle Button */}
          {!collapsed && (
            <button
              onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-bgHover text-sidebar-text hover:bg-sidebar-active transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeftIcon size={16} />
            </button>
          )}
          
          {collapsed && (
            <button
              onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-bgHover text-sidebar-text hover:bg-sidebar-active transition-colors"
              title="Expand sidebar"
            >
              <ChevronRightIcon size={16} />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className={cn(
          "py-6 overflow-y-auto sidebar-scroll transition-all duration-300",
          collapsed ? "px-2" : "px-4"
        )} style={{ height: 'calc(100vh - 64px - 80px)' }}>
          <ul className="space-y-2">
            {visibleMenuItems.map(item => renderMenuItem(item))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-bgHover p-4">
          <div className="flex items-center gap-3">
            {(company as any)?.logo && buildAssetUrl((company as any).logo) ? (
              <div 
                className="relative overflow-hidden rounded-full"
                style={{ 
                  width: `${sidebarLogoSize}px`, 
                  height: `${sidebarLogoSize}px` 
                }}
              >
                <Image 
                  src={buildAssetUrl((company as any).logo)!} 
                  alt={company?.name || 'Company Logo'} 
                  fill
                  className="object-contain"
                  sizes={`${sidebarLogoSize}px`}
                  priority
                />
              </div>
            ) : (
              <div 
                className="rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold"
                style={{ 
                  width: `${sidebarLogoSize}px`, 
                  height: `${sidebarLogoSize}px`,
                  fontSize: `${sidebarLogoSize * 0.35}px`
                }}
              >
                {company?.name ? company.name.charAt(0).toUpperCase() : 'WB'}
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-sidebar-text font-medium truncate">
                  {company?.name || 'Website Builder'}
                </p>
                <p className="text-xs text-sidebar-textSecondary truncate">
                  v2.0.0
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay - Shows on tablets and mobile */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden', // Changed from md:hidden to lg:hidden
          collapsed ? 'invisible opacity-0' : 'visible opacity-100'
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 transition-opacity"
          onClick={onToggle}
        />

        {/* Mobile Sidebar */}
        <aside
          className={cn(
            'absolute left-0 top-0 h-full w-sidebar shadow-xl transition-transform duration-300',
            collapsed ? '-translate-x-full' : 'translate-x-0'
          )}
          style={{
            backgroundColor: 'var(--sidebar-bg)',
            color: 'var(--sidebar-text)'
          }}
        >
          {/* Mobile Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-bgHover">
            <div className="flex items-center gap-3">
              {(company as any)?.logo && buildAssetUrl((company as any).logo) ? (
                <div 
                  className="relative overflow-hidden rounded-lg"
                  style={{ 
                    width: `${sidebarLogoSize}px`, 
                    height: `${sidebarLogoSize}px` 
                  }}
                >
                  <Image 
                    src={buildAssetUrl((company as any).logo)!} 
                    alt={company?.name || 'Company Logo'} 
                    fill
                    className="object-contain"
                    sizes={`${sidebarLogoSize}px`}
                    priority
                  />
                </div>
              ) : (
                <div 
                  className="flex items-center justify-center rounded-lg bg-primary-500 text-white font-bold"
                  style={{ 
                    width: `${sidebarLogoSize}px`, 
                    height: `${sidebarLogoSize}px`,
                    fontSize: `${sidebarLogoSize * 0.4}px`
                  }}
                >
                  {company?.name ? company.name.charAt(0).toUpperCase() : 'WB'}
                </div>
              )}
              <span className="font-semibold text-lg text-sidebar-text">
                {company?.name || 'WebsiteBuilder'}
              </span>
            </div>

            <button
              onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-bgHover text-sidebar-text hover:bg-sidebar-active transition-colors"
              title="Close sidebar"
            >
              <ChevronLeftIcon size={16} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="px-4 py-6 overflow-y-auto sidebar-scroll" style={{ height: 'calc(100vh - 64px - 80px)' }}>
            <ul className="space-y-2">
              {visibleMenuItems.map(item => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.includes(item.id);
                
                // Check if item or any of its children are active
                let isActive = false;
                if (item.href) {
                  isActive = pathname === item.href || 
                    (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) ||
                    (item.href === '/dashboard' && pathname === '/dashboard');
                }
                if (item.children) {
                  const hasActiveChild = item.children.some(child => 
                    pathname === child.href || (child.href && pathname.startsWith(child.href + '/'))
                  );
                  if (hasActiveChild) isActive = true;
                }

                if (hasChildren) {
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className={cn(
                          'w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-sidebar-active text-white shadow-lg'
                            : 'text-sidebar-textSecondary hover:bg-sidebar-bgHover hover:text-sidebar-text'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={20}
                            className={cn(
                              'flex-shrink-0 transition-colors',
                              isActive ? 'text-white' : 'text-sidebar-textSecondary'
                            )}
                          />
                          <span className="flex-1 text-left truncate">
                            {t(item.nameKey)}
                          </span>
                        </div>
                        <ChevronDownIcon 
                          size={16} 
                          className={cn(
                            'transition-transform duration-200',
                            isExpanded ? 'rotate-180' : '',
                            isActive ? 'text-white' : 'text-sidebar-textSecondary'
                          )}
                        />
                      </button>
                      
                      {/* Children items for mobile */}
                      {isExpanded && item.children && (
                        <ul className="mt-1 ml-4 space-y-1">
                          {item.children.map(child => {
                            const ChildIcon = child.icon;
                            const isChildActive = pathname === child.href || 
                              (child.href && pathname.startsWith(child.href + '/'));
                            
                            return (
                              <li key={child.id}>
                                <Link
                                  href={child.href || '#'}
                                  onClick={onToggle} // Close mobile sidebar on navigation
                                  className={cn(
                                    'flex items-center gap-3 rounded-lg pl-9 pr-3 py-2.5 text-sm font-medium transition-all duration-200',
                                    isChildActive
                                      ? 'bg-sidebar-active text-white shadow-lg'
                                      : 'text-sidebar-textSecondary hover:bg-sidebar-bgHover hover:text-sidebar-text'
                                  )}
                                >
                                  <ChildIcon
                                    size={18}
                                    className={cn(
                                      'flex-shrink-0 transition-colors',
                                      isChildActive ? 'text-white' : 'text-sidebar-textSecondary'
                                    )}
                                  />
                                  <span className="flex-1 truncate">
                                    {t(child.nameKey)}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                } else {
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href || '#'}
                        onClick={onToggle} // Close mobile sidebar on navigation
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-sidebar-active text-white shadow-lg'
                            : 'text-sidebar-textSecondary hover:bg-sidebar-bgHover hover:text-sidebar-text'
                        )}
                      >
                        <Icon
                          size={20}
                          className={cn(
                            'flex-shrink-0 transition-colors',
                            isActive ? 'text-white' : 'text-sidebar-textSecondary'
                          )}
                        />
                        <span className="flex-1 truncate">
                          {t(item.nameKey)}
                        </span>
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}