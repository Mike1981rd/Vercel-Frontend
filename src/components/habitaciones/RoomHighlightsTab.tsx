'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { 
  PlusIcon, 
  XMarkIcon,
  MapPinIcon,
  KeyIcon,
  WifiIcon,
  SparklesIcon,
  ShieldCheckIcon,
  HomeModernIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  BuildingStorefrontIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface Highlight {
  icon: string;
  title: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

interface RoomHighlightsTabProps {
  formData: any;
  setFormData: (data: any) => void;
  primaryColor: string;
}

const AVAILABLE_ICONS = [
  { value: 'map-pin', label: 'Location', Icon: MapPinIcon },
  { value: 'key', label: 'Key', Icon: KeyIcon },
  { value: 'wifi', label: 'WiFi', Icon: WifiIcon },
  { value: 'sparkles', label: 'Clean', Icon: SparklesIcon },
  { value: 'shield', label: 'Security', Icon: ShieldCheckIcon },
  { value: 'home', label: 'Home', Icon: HomeModernIcon },
  { value: 'clock', label: 'Time', Icon: ClockIcon },
  { value: 'user', label: 'Host', Icon: UserIcon },
  { value: 'star', label: 'Star', Icon: StarIcon },
  { value: 'building', label: 'Building', Icon: BuildingStorefrontIcon },
  { value: 'truck', label: 'Parking', Icon: TruckIcon }
];

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  {
    icon: 'map-pin',
    title: 'Great location',
    description: '90% of recent guests gave the location a 5-star rating',
    displayOrder: 1,
    isActive: true
  },
  {
    icon: 'key',
    title: 'Self check-in',
    description: 'Check yourself in with the keypad',
    displayOrder: 2,
    isActive: true
  },
  {
    icon: 'wifi',
    title: 'Fast WiFi',
    description: 'Perfect for remote work with 100 Mbps',
    displayOrder: 3,
    isActive: true
  }
];

export default function RoomHighlightsTab({ formData, setFormData, primaryColor }: RoomHighlightsTabProps) {
  const { t } = useI18n();
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // Initialize highlights from formData or use defaults
  useEffect(() => {
    if (formData.highlights && Array.isArray(formData.highlights)) {
      setHighlights(formData.highlights);
    } else if (!formData.highlights) {
      // Initialize with default highlights if none exist
      const defaultHighlights = [...DEFAULT_HIGHLIGHTS];
      setHighlights(defaultHighlights);
      setFormData({
        ...formData,
        highlights: defaultHighlights
      });
    }
  }, []);

  const updateHighlights = (newHighlights: Highlight[]) => {
    // Reorder by displayOrder
    const orderedHighlights = newHighlights.sort((a, b) => a.displayOrder - b.displayOrder);
    setHighlights(orderedHighlights);
    setFormData({
      ...formData,
      highlights: orderedHighlights
    });
  };

  const handleHighlightChange = (index: number, field: keyof Highlight, value: any) => {
    const newHighlights = [...highlights];
    newHighlights[index] = { ...newHighlights[index], [field]: value };
    updateHighlights(newHighlights);
  };

  const addHighlight = () => {
    const newHighlight: Highlight = {
      icon: 'star',
      title: '',
      description: '',
      displayOrder: highlights.length + 1,
      isActive: true
    };
    updateHighlights([...highlights, newHighlight]);
  };

  const removeHighlight = (index: number) => {
    const newHighlights = highlights.filter((_, i) => i !== index);
    // Reorder remaining highlights
    newHighlights.forEach((h, i) => {
      h.displayOrder = i + 1;
    });
    updateHighlights(newHighlights);
  };

  const moveHighlight = (index: number, direction: 'up' | 'down') => {
    const newHighlights = [...highlights];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < highlights.length) {
      // Swap displayOrder values
      const temp = newHighlights[index].displayOrder;
      newHighlights[index].displayOrder = newHighlights[newIndex].displayOrder;
      newHighlights[newIndex].displayOrder = temp;
      
      // Swap array positions
      [newHighlights[index], newHighlights[newIndex]] = [newHighlights[newIndex], newHighlights[index]];
      updateHighlights(newHighlights);
    }
  };

  const getIconComponent = (iconValue: string) => {
    const iconItem = AVAILABLE_ICONS.find(item => item.value === iconValue);
    const IconComponent = iconItem?.Icon || StarIcon;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('rooms.highlights.title', 'Room Highlights')}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t('rooms.highlights.subtitle', 'Add key features that make your room special')}
          </p>
        </div>
        <button
          type="button"
          onClick={addHighlight}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          {t('rooms.highlights.add', 'Add Highlight')}
        </button>
      </div>

      {/* Highlights List */}
      <div className="space-y-4">
        {highlights.map((highlight, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
          >
            {/* Header with controls */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getIconComponent(highlight.icon)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('rooms.highlights.highlight', 'Highlight')} {index + 1}
                  </span>
                  {/* Active Toggle */}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={highlight.isActive}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleHighlightChange(index, 'isActive', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                      style={{ accentColor: primaryColor }}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {t('common.active', 'Active')}
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Control buttons */}
              <div className="flex items-center space-x-2">
                {/* Move up/down buttons */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveHighlight(index, 'up')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title={t('common.moveUp', 'Move up')}
                  >
                    ↑
                  </button>
                )}
                {index < highlights.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveHighlight(index, 'down')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title={t('common.moveDown', 'Move down')}
                  >
                    ↓
                  </button>
                )}
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="p-1 text-red-500 hover:text-red-700"
                  title={t('common.remove', 'Remove')}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Icon selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('rooms.highlights.icon', 'Icon')}
                </label>
                <select
                  value={highlight.icon}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleHighlightChange(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                  style={{ 
                    '--tw-ring-color': primaryColor,
                    borderColor: highlight.icon ? undefined : '#ef4444'
                  } as any}
                >
                  {AVAILABLE_ICONS.map(icon => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('rooms.highlights.titleField', 'Title')} *
                </label>
                <input
                  type="text"
                  value={highlight.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleHighlightChange(index, 'title', e.target.value)}
                  placeholder={t('rooms.highlights.titlePlaceholder', 'e.g. Great location')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('rooms.highlights.description', 'Description')} *
                </label>
                <textarea
                  value={highlight.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleHighlightChange(index, 'description', e.target.value)}
                  placeholder={t('rooms.highlights.descriptionPlaceholder', 'e.g. 90% of recent guests gave the location a 5-star rating')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white resize-none"
                  style={{ '--tw-ring-color': primaryColor } as any}
                  required
                />
              </div>
            </div>
          </div>
        ))}

        {highlights.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('rooms.highlights.empty', 'No highlights added yet')}
            </p>
            <button
              type="button"
              onClick={addHighlight}
              className="mt-3 text-sm font-medium"
              style={{ color: primaryColor }}
            >
              {t('rooms.highlights.addFirst', 'Add your first highlight')}
            </button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          {t('rooms.highlights.tips.title', 'Tips for great highlights')}
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• {t('rooms.highlights.tips.tip1', 'Choose 3-5 key features that guests care about most')}</li>
          <li>• {t('rooms.highlights.tips.tip2', 'Be specific with numbers and details')}</li>
          <li>• {t('rooms.highlights.tips.tip3', 'Focus on unique amenities or exceptional features')}</li>
          <li>• {t('rooms.highlights.tips.tip4', 'Update regularly based on guest feedback')}</li>
        </ul>
      </div>
    </div>
  );
}