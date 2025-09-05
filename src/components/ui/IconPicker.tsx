'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  HomeIcon, WifiIcon, TvIcon, FireIcon, LockClosedIcon,
  SunIcon, SparklesIcon, StarIcon, BuildingOfficeIcon,
  BuildingOffice2Icon, Square2StackIcon, Square3Stack3DIcon,
  Squares2X2Icon, HomeModernIcon, CubeIcon,
  ShieldCheckIcon, CameraIcon, PrinterIcon, PhoneIcon,
  ComputerDesktopIcon, GlobeAltIcon, MapPinIcon, KeyIcon,
  CreditCardIcon, GiftIcon, HeartIcon, CheckCircleIcon,
  XCircleIcon, ExclamationCircleIcon, InformationCircleIcon,
  PlusCircleIcon, MinusCircleIcon, ArrowUpCircleIcon,
  ArrowDownCircleIcon, ArrowLeftCircleIcon, ArrowRightCircleIcon,
  PlayCircleIcon, PauseCircleIcon, StopCircleIcon,
  MusicalNoteIcon, VideoCameraIcon, MicrophoneIcon,
  SpeakerWaveIcon, BellIcon, ClockIcon, CalendarIcon,
  ChartBarIcon, ChartPieIcon, DocumentTextIcon,
  FolderIcon, InboxIcon, EnvelopeIcon, ChatBubbleLeftIcon,
  UserIcon, UserGroupIcon, AcademicCapIcon, BookOpenIcon,
  LightBulbIcon, BeakerIcon, WrenchIcon, CogIcon,
  AdjustmentsHorizontalIcon, PaintBrushIcon, ScissorsIcon,
  PaperClipIcon, LinkIcon, CloudIcon, ServerIcon,
  ShoppingCartIcon, ShoppingBagIcon, TicketIcon, TagIcon,
  ReceiptPercentIcon, BanknotesIcon, CalculatorIcon,
  TruckIcon, RocketLaunchIcon, PaperAirplaneIcon,
  GlobeAsiaAustraliaIcon, MapIcon, FlagIcon, LanguageIcon,
  MoonIcon, BoltIcon, FireIcon as FlameIcon, HandThumbUpIcon,
  FaceSmileIcon, CakeIcon, PuzzlePieceIcon, TrophyIcon
} from '@heroicons/react/24/outline';

interface IconPickerProps {
  value?: string;
  onChange: (icon: string, type: 'heroicon' | 'emoji' | 'custom') => void;
  className?: string;
}

const heroicons = [
  { name: 'home', icon: HomeIcon, label: 'Casa' },
  { name: 'wifi', icon: WifiIcon, label: 'WiFi' },
  { name: 'tv', icon: TvIcon, label: 'TV' },
  { name: 'fire', icon: FireIcon, label: 'Fuego' },
  { name: 'lock-closed', icon: LockClosedIcon, label: 'Candado' },
  { name: 'sun', icon: SunIcon, label: 'Sol' },
  { name: 'moon', icon: MoonIcon, label: 'Luna' },
  { name: 'sparkles', icon: SparklesIcon, label: 'Destellos' },
  { name: 'star', icon: StarIcon, label: 'Estrella' },
  { name: 'building-office', icon: BuildingOfficeIcon, label: 'Edificio' },
  { name: 'building-office-2', icon: BuildingOffice2Icon, label: 'Edificio 2' },
  { name: 'square-2-stack', icon: Square2StackIcon, label: 'Cuadrados' },
  { name: 'square-3-stack-3d', icon: Square3Stack3DIcon, label: 'Cubos' },
  { name: 'squares-2x2', icon: Squares2X2Icon, label: 'Grilla' },
  { name: 'home-modern', icon: HomeModernIcon, label: 'Casa Moderna' },
  { name: 'cube', icon: CubeIcon, label: 'Cubo' },
  { name: 'shield-check', icon: ShieldCheckIcon, label: 'Escudo' },
  { name: 'camera', icon: CameraIcon, label: 'Cámara' },
  { name: 'gift', icon: GiftIcon, label: 'Regalo' },
  { name: 'heart', icon: HeartIcon, label: 'Corazón' },
  { name: 'bell', icon: BellIcon, label: 'Campana' },
  { name: 'clock', icon: ClockIcon, label: 'Reloj' },
  { name: 'calendar', icon: CalendarIcon, label: 'Calendario' },
  { name: 'shopping-cart', icon: ShoppingCartIcon, label: 'Carrito' },
  { name: 'shopping-bag', icon: ShoppingBagIcon, label: 'Bolsa' },
  { name: 'truck', icon: TruckIcon, label: 'Camión' },
  { name: 'map', icon: MapIcon, label: 'Mapa' },
  { name: 'flag', icon: FlagIcon, label: 'Bandera' },
  { name: 'bolt', icon: BoltIcon, label: 'Rayo' },
  { name: 'trophy', icon: TrophyIcon, label: 'Trofeo' },
  { name: 'cake', icon: CakeIcon, label: 'Pastel' }
];

const emojis = [
  // Alojamiento
  { emoji: '🏨', label: 'Hotel' },
  { emoji: '🏠', label: 'Casa' },
  { emoji: '🏡', label: 'Casa con jardín' },
  { emoji: '🏢', label: 'Edificio' },
  { emoji: '🏰', label: 'Castillo' },
  { emoji: '🏖️', label: 'Playa' },
  { emoji: '🏝️', label: 'Isla' },
  { emoji: '⛱️', label: 'Sombrilla' },
  
  // Amenidades
  { emoji: '🏊', label: 'Piscina' },
  { emoji: '🏋️', label: 'Gimnasio' },
  { emoji: '🚗', label: 'Auto' },
  { emoji: '🅿️', label: 'Parking' },
  { emoji: '☕', label: 'Café' },
  { emoji: '🍳', label: 'Cocina' },
  { emoji: '🧺', label: 'Lavandería' },
  { emoji: '🌬️', label: 'Aire' },
  { emoji: '🔥', label: 'Calefacción' },
  { emoji: '❄️', label: 'Frío' },
  { emoji: '🚿', label: 'Ducha' },
  { emoji: '🛁', label: 'Bañera' },
  { emoji: '🧴', label: 'Amenities baño' },
  { emoji: '🧼', label: 'Jabón' },
  { emoji: '🪒', label: 'Afeitadora' },
  { emoji: '💨', label: 'Secador' },
  
  // Vistas
  { emoji: '🌊', label: 'Mar' },
  { emoji: '🏙️', label: 'Ciudad' },
  { emoji: '🌳', label: 'Jardín' },
  { emoji: '⛰️', label: 'Montaña' },
  { emoji: '🏞️', label: 'Lago' },
  { emoji: '🌲', label: 'Bosque' },
  { emoji: '🌅', label: 'Amanecer' },
  { emoji: '🌄', label: 'Atardecer' },
  
  // Premium
  { emoji: '🏆', label: 'Premium' },
  { emoji: '⭐', label: 'Estrella' },
  { emoji: '💎', label: 'Diamante' },
  { emoji: '👑', label: 'Corona' },
  { emoji: '🥂', label: 'Champagne' },
  { emoji: '🍾', label: 'Botella' },
  { emoji: '🎭', label: 'Teatro' },
  { emoji: '🎪', label: 'Circo' }
];

export default function IconPicker({ value, onChange, className = '' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'heroicons' | 'emojis' | 'custom'>('heroicons');
  const [selectedIcon, setSelectedIcon] = useState(value || '');
  const [customIcons, setCustomIcons] = useState<{id: string, name: string, url: string}[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'left'>('down');
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelectedIcon(value || '');
  }, [value]);

  useEffect(() => {
    // Cargar iconos personalizados desde localStorage cuando se abre el picker
    if (isOpen) {
      const savedIcons = JSON.parse(localStorage.getItem('customIcons') || '[]');
      setCustomIcons(savedIcons);
      
      // Determinar la posición del dropdown
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceRight = window.innerWidth - rect.right;
        const dropdownWidth = 384; // 96 * 4 (w-96 en tailwind)
        
        // Si estamos en un offcanvas o no hay suficiente espacio a la derecha
        const isInOffcanvas = buttonRef.current.closest('.offcanvas-content') !== null;
        
        if (isInOffcanvas || spaceRight < dropdownWidth) {
          setDropdownPosition('left');
        } else {
          setDropdownPosition('down');
        }
      }
    }
  }, [isOpen]);

  const filteredHeroicons = heroicons.filter(icon => 
    icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmojis = emojis.filter(emoji => 
    emoji.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomIcons = customIcons.filter(icon => 
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectIcon = (icon: string, type: 'heroicon' | 'emoji' | 'custom') => {
    // Para iconos personalizados, guardar solo el ID, no el base64 completo
    if (type === 'custom') {
      const customIcon = customIcons.find(i => i.url === icon);
      if (customIcon) {
        setSelectedIcon(customIcon.id);
        onChange(customIcon.id, type);
      }
    } else {
      setSelectedIcon(icon);
      onChange(icon, type);
    }
    setIsOpen(false);
  };

  const renderSelectedIcon = () => {
    if (!selectedIcon) {
      return <span className="text-gray-400">Seleccionar icono</span>;
    }

    // Si es un emoji
    if (selectedIcon.length <= 3 || selectedIcon.includes('️')) {
      return <span className="text-2xl">{selectedIcon}</span>;
    }

    // Si es un icono personalizado (por ID)
    if (selectedIcon.startsWith('custom-')) {
      const customIcon = customIcons.find(i => i.id === selectedIcon);
      if (customIcon) {
        return <img src={customIcon.url} alt={customIcon.name} className="h-7 w-7 object-contain" />;
      }
    }

    // Si es un icono personalizado antiguo (base64 o URL - para compatibilidad)
    if (selectedIcon.startsWith('data:') || selectedIcon.startsWith('http')) {
      return <img src={selectedIcon} alt="Custom icon" className="h-7 w-7 object-contain" />;
    }

    // Si es un heroicon
    const heroicon = heroicons.find(h => h.name === selectedIcon);
    if (heroicon) {
      const Icon = heroicon.icon;
      return <Icon className="h-7 w-7" />;
    }

    return <span className="text-gray-400">Icono no encontrado</span>;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {renderSelectedIcon()}
        <svg className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Picker Modal */}
          <div className={`absolute ${
            dropdownPosition === 'left' 
              ? 'right-0 top-1/2 -translate-y-1/2 mr-12' 
              : 'top-full mt-2 left-0'
          } w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50`}>
            {/* Search */}
            <div className="p-4 border-b dark:border-gray-700">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar icono..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Tabs */}
            <div className="flex border-b dark:border-gray-700">
              <button
                type="button"
                onClick={() => setActiveTab('heroicons')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'heroicons'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Heroicons
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('emojis')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'emojis'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Emojis
              </button>
              {customIcons.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'custom'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Personalizados ({customIcons.length})
                </button>
              )}
            </div>

            {/* Icons Grid */}
            <div className="p-4 max-h-80 overflow-y-auto">
              {activeTab === 'heroicons' ? (
                <div className="grid grid-cols-8 gap-2">
                  {filteredHeroicons.map(({ name, icon: Icon, label }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectIcon(name, 'heroicon')}
                      title={label}
                      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        selectedIcon === name ? 'bg-primary-100 dark:bg-primary-900' : ''
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </button>
                  ))}
                </div>
              ) : activeTab === 'emojis' ? (
                <div className="grid grid-cols-8 gap-2">
                  {filteredEmojis.map(({ emoji, label }) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSelectIcon(emoji, 'emoji')}
                      title={label}
                      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-2xl ${
                        selectedIcon === emoji ? 'bg-primary-100 dark:bg-primary-900' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-8 gap-2">
                  {filteredCustomIcons.map((icon) => (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() => handleSelectIcon(icon.url, 'custom')}
                      title={icon.name}
                      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        selectedIcon === icon.url ? 'bg-primary-100 dark:bg-primary-900' : ''
                      }`}
                    >
                      <img 
                        src={icon.url} 
                        alt={icon.name}
                        className="h-6 w-6 object-contain mx-auto"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* No results */}
            {((activeTab === 'heroicons' && filteredHeroicons.length === 0) ||
              (activeTab === 'emojis' && filteredEmojis.length === 0) ||
              (activeTab === 'custom' && filteredCustomIcons.length === 0)) && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No se encontraron iconos
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}