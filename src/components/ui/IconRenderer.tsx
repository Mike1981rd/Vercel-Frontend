'use client';

import { useEffect, useState } from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';

interface IconRendererProps {
  icon?: string;
  iconType?: 'heroicon' | 'emoji' | 'custom';
  className?: string;
}

export default function IconRenderer({ icon, iconType, className = 'h-6 w-6' }: IconRendererProps) {
  const [customIcons, setCustomIcons] = useState<{id: string, name: string, url: string}[]>([]);

  useEffect(() => {
    // Cargar iconos personalizados si es necesario
    if (iconType === 'custom' && icon) {
      const savedIcons = JSON.parse(localStorage.getItem('customIcons') || '[]');
      setCustomIcons(savedIcons);
    }
  }, [icon, iconType]);

  if (!icon) return null;

  // Si es un emoji
  if (iconType === 'emoji' || (!iconType && (icon.length <= 3 || icon.includes('️')))) {
    return <span className="text-2xl">{icon}</span>;
  }

  // Si es un icono personalizado (por ID)
  if (iconType === 'custom' || icon.startsWith('custom-')) {
    const customIcon = customIcons.find(i => i.id === icon);
    if (customIcon) {
      return <img src={customIcon.url} alt={customIcon.name} className={className + ' object-contain'} />;
    }
    // Fallback para URLs directas (compatibilidad)
    if (icon.startsWith('data:') || icon.startsWith('http')) {
      return <img src={icon} alt="Custom icon" className={className + ' object-contain'} />;
    }
  }

  // Si es un heroicon
  if (iconType === 'heroicon' || !iconType) {
    // Mapear nombres de iconos a componentes
    const iconMap: Record<string, any> = {
      'home': HeroIcons.HomeIcon,
      'wifi': HeroIcons.WifiIcon,
      'tv': HeroIcons.TvIcon,
      'fire': HeroIcons.FireIcon,
      'lock-closed': HeroIcons.LockClosedIcon,
      'sun': HeroIcons.SunIcon,
      'moon': HeroIcons.MoonIcon,
      'sparkles': HeroIcons.SparklesIcon,
      'star': HeroIcons.StarIcon,
      'building-office': HeroIcons.BuildingOfficeIcon,
      'building-office-2': HeroIcons.BuildingOffice2Icon,
      'square-2-stack': HeroIcons.Square2StackIcon,
      'square-3-stack-3d': HeroIcons.Square3Stack3DIcon,
      'squares-2x2': HeroIcons.Squares2X2Icon,
      'home-modern': HeroIcons.HomeModernIcon,
      'cube': HeroIcons.CubeIcon,
      'shield-check': HeroIcons.ShieldCheckIcon,
      'camera': HeroIcons.CameraIcon,
      'gift': HeroIcons.GiftIcon,
      'heart': HeroIcons.HeartIcon,
      'bell': HeroIcons.BellIcon,
      'clock': HeroIcons.ClockIcon,
      'calendar': HeroIcons.CalendarIcon,
      'shopping-cart': HeroIcons.ShoppingCartIcon,
      'shopping-bag': HeroIcons.ShoppingBagIcon,
      'truck': HeroIcons.TruckIcon,
      'map': HeroIcons.MapIcon,
      'flag': HeroIcons.FlagIcon,
      'bolt': HeroIcons.BoltIcon,
      'trophy': HeroIcons.TrophyIcon,
      'cake': HeroIcons.CakeIcon
    };

    const IconComponent = iconMap[icon];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
  }

  // Si no se puede renderizar el icono
  return null;
}