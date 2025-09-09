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
      'cake': HeroIcons.CakeIcon,
      // Additional common amenity icons
      'check': HeroIcons.CheckIcon,
      'check-circle': HeroIcons.CheckCircleIcon,
      'x-mark': HeroIcons.XMarkIcon,
      'x-circle': HeroIcons.XCircleIcon,
      'user': HeroIcons.UserIcon,
      'users': HeroIcons.UsersIcon,
      'user-group': HeroIcons.UserGroupIcon,
      'phone': HeroIcons.PhoneIcon,
      'envelope': HeroIcons.EnvelopeIcon,
      'map-pin': HeroIcons.MapPinIcon,
      'book-open': HeroIcons.BookOpenIcon,
      'computer-desktop': HeroIcons.ComputerDesktopIcon,
      'device-tablet': HeroIcons.DeviceTabletIcon,
      'device-phone-mobile': HeroIcons.DevicePhoneMobileIcon,
      'printer': HeroIcons.PrinterIcon,
      'currency-dollar': HeroIcons.CurrencyDollarIcon,
      'banknotes': HeroIcons.BanknotesIcon,
      'credit-card': HeroIcons.CreditCardIcon,
      'key': HeroIcons.KeyIcon,
      'lock-open': HeroIcons.LockOpenIcon,
      'shield-exclamation': HeroIcons.ShieldExclamationIcon,
      'exclamation-triangle': HeroIcons.ExclamationTriangleIcon,
      'information-circle': HeroIcons.InformationCircleIcon,
      'question-mark-circle': HeroIcons.QuestionMarkCircleIcon,
      'light-bulb': HeroIcons.LightBulbIcon,
      'beaker': HeroIcons.BeakerIcon,
      'briefcase': HeroIcons.BriefcaseIcon,
      'clipboard': HeroIcons.ClipboardIcon,
      'document': HeroIcons.DocumentIcon,
      'folder': HeroIcons.FolderIcon,
      'globe-alt': HeroIcons.GlobeAltIcon,
      'globe-americas': HeroIcons.GlobeAmericasIcon,
      'language': HeroIcons.LanguageIcon,
      'microphone': HeroIcons.MicrophoneIcon,
      'musical-note': HeroIcons.MusicalNoteIcon,
      'newspaper': HeroIcons.NewspaperIcon,
      'photo': HeroIcons.PhotoIcon,
      'play': HeroIcons.PlayIcon,
      'pause': HeroIcons.PauseIcon,
      'video-camera': HeroIcons.VideoCameraIcon,
      'speaker-wave': HeroIcons.SpeakerWaveIcon,
      'speaker-x-mark': HeroIcons.SpeakerXMarkIcon,
      'tag': HeroIcons.TagIcon,
      'ticket': HeroIcons.TicketIcon,
      'wrench': HeroIcons.WrenchIcon,
      'wrench-screwdriver': HeroIcons.WrenchScrewdriverIcon,
      'cog': HeroIcons.CogIcon,
      'cog-6-tooth': HeroIcons.Cog6ToothIcon,
      'chat-bubble-left': HeroIcons.ChatBubbleLeftIcon,
      'chat-bubble-bottom-center-text': HeroIcons.ChatBubbleBottomCenterTextIcon,
      'rss': HeroIcons.RssIcon,
      'signal': HeroIcons.SignalIcon,
      'academic-cap': HeroIcons.AcademicCapIcon,
      'adjustments-horizontal': HeroIcons.AdjustmentsHorizontalIcon,
      'archive-box': HeroIcons.ArchiveBoxIcon,
      'arrow-path': HeroIcons.ArrowPathIcon,
      'arrows-pointing-out': HeroIcons.ArrowsPointingOutIcon,
      'cloud': HeroIcons.CloudIcon,
      'cloud-arrow-down': HeroIcons.CloudArrowDownIcon,
      'cloud-arrow-up': HeroIcons.CloudArrowUpIcon,
      'hand-raised': HeroIcons.HandRaisedIcon,
      'hand-thumb-up': HeroIcons.HandThumbUpIcon,
      'hand-thumb-down': HeroIcons.HandThumbDownIcon,
      'lifebuoy': HeroIcons.LifebuoyIcon,
      'paper-airplane': HeroIcons.PaperAirplaneIcon,
      'pencil': HeroIcons.PencilIcon,
      'plus': HeroIcons.PlusIcon,
      'minus': HeroIcons.MinusIcon,
      'magnifying-glass': HeroIcons.MagnifyingGlassIcon,
      'eye': HeroIcons.EyeIcon,
      'eye-slash': HeroIcons.EyeSlashIcon,
      'face-smile': HeroIcons.FaceSmileIcon,
      'face-frown': HeroIcons.FaceFrownIcon,
      'chart-bar': HeroIcons.ChartBarIcon,
      'chart-pie': HeroIcons.ChartPieIcon,
      'presentation-chart-bar': HeroIcons.PresentationChartBarIcon,
      'presentation-chart-line': HeroIcons.PresentationChartLineIcon,
      'server': HeroIcons.ServerIcon,
      'server-stack': HeroIcons.ServerStackIcon,
      'rectangle-stack': HeroIcons.RectangleStackIcon,
      'rectangle-group': HeroIcons.RectangleGroupIcon
    };

    const IconComponent = iconMap[icon];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
  }

  // Si no se puede renderizar el icono
  return null;
}