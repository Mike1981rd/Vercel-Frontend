'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bold, Italic, Link2, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useStructuralComponents } from '@/hooks/useStructuralComponents';
import { useEditorStore } from '@/stores/useEditorStore';
import { SectionType } from '@/types/editor.types';
import * as Icons from 'lucide-react';

interface AnnouncementItem {
  id: string;
  text: string;
  link?: string;
  icon?: string;
  customIcon?: string;
  visible?: boolean;
}

// Predefined icons for announcements organized by category
const ICON_CATEGORIES = [
  {
    name: 'General',
    icons: [
      { value: 'Settings', label: 'Settings', icon: Icons.Settings },
      { value: 'Search', label: 'Search', icon: Icons.Search },
      { value: 'Eye', label: 'Eye', icon: Icons.Eye },
      { value: 'EyeOff', label: 'Eye slash', icon: Icons.EyeOff },
      { value: 'User', label: 'User', icon: Icons.User },
      { value: 'HeartOutline', label: 'Love outline', icon: Icons.Heart },
      { value: 'HeartSolid', label: 'Love solid', icon: Icons.Heart },
      { value: 'ThumbsUp', label: 'Like', icon: Icons.ThumbsUp },
      { value: 'ThumbsDown', label: 'Dislike', icon: Icons.ThumbsDown },
      { value: 'Lightbulb', label: 'Lamp', icon: Icons.Lightbulb },
      { value: 'StarOutline', label: 'Star outline', icon: Icons.Star },
      { value: 'StarSolid', label: 'Star solid', icon: Icons.Star },
      { value: 'Trash2', label: 'Trash', icon: Icons.Trash2 },
      { value: 'FileText', label: 'Document', icon: Icons.FileText },
      { value: 'Copy', label: 'Copy', icon: Icons.Copy },
      { value: 'Share2', label: 'Share', icon: Icons.Share2 },
      { value: 'Plus', label: 'Plus', icon: Icons.Plus },
      { value: 'Minus', label: 'Minus', icon: Icons.Minus },
      { value: 'Check', label: 'Checkmark', icon: Icons.Check },
      { value: 'ArrowRight', label: 'Arrow right', icon: Icons.ArrowRight },
      { value: 'ArrowLeft', label: 'Arrow left', icon: Icons.ArrowLeft },
      { value: 'Undo', label: 'Undo', icon: Icons.Undo },
      { value: 'Redo', label: 'Redo', icon: Icons.Redo },
      { value: 'RefreshCw', label: 'Refresh', icon: Icons.RefreshCw },
      { value: 'Bell', label: 'Notification', icon: Icons.Bell },
      { value: 'Clock', label: 'Clock', icon: Icons.Clock },
      { value: 'Calendar', label: 'Calendar', icon: Icons.Calendar },
      { value: 'Info', label: 'Information', icon: Icons.Info },
    ]
  },
  {
    name: 'Shop',
    icons: [
      { value: 'ShoppingBag', label: 'Bag', icon: Icons.ShoppingBag },
      { value: 'ShoppingCart', label: 'Cart', icon: Icons.ShoppingCart },
      { value: 'Barcode', label: 'Barcode', icon: Icons.Barcode },
      { value: 'Coupon', label: 'Coupon', icon: Icons.Tag },
      { value: 'Gift', label: 'Gift', icon: Icons.Gift },
      { value: 'TrendingDown', label: 'Discount outline', icon: Icons.TrendingDown },
      { value: 'Percent', label: 'Discount solid', icon: Icons.Percent },
      { value: 'Award', label: 'Medal', icon: Icons.Award },
      { value: 'Pen', label: 'Pen and ruler', icon: Icons.Pen },
      { value: 'Palette', label: 'Color swatch', icon: Icons.Palette },
      { value: 'Car', label: 'Car', icon: Icons.Truck },
      { value: 'Coffee', label: 'Cup', icon: Icons.Coffee },
      { value: 'Cake', label: 'Cake', icon: Icons.Coffee },
      { value: 'Anchor', label: 'Hanger', icon: Icons.Anchor },
      { value: 'TShirt', label: 'T-shirt', icon: Icons.Shirt },
      { value: 'Dress', label: 'Dress', icon: Icons.Shirt },
      { value: 'Gem', label: 'Jewelry', icon: Icons.Circle },
      { value: 'Home', label: 'Furniture', icon: Icons.Home },
      { value: 'Play', label: 'Toy', icon: Icons.Play },
    ]
  },
  {
    name: 'Shipping',
    icons: [
      { value: 'Package', label: 'Shipping box', icon: Icons.Package },
      { value: 'MapPin', label: 'Address pin', icon: Icons.MapPin },
      { value: 'FastDelivery', label: 'Fast delivery', icon: Icons.Truck },
      { value: 'DeliveryTruck', label: 'Delivery truck', icon: Icons.Truck },
      { value: 'RotateCcw', label: 'Easy returns', icon: Icons.RotateCcw },
      { value: 'Globe', label: 'World', icon: Icons.Globe },
      { value: 'Plane', label: 'Plane', icon: Icons.Send },
      { value: 'SearchOrder', label: 'Search order', icon: Icons.Search },
      { value: 'Briefcase', label: 'Briefcase', icon: Icons.Briefcase },
      { value: 'Archive', label: 'Store', icon: Icons.Archive },
      { value: 'Navigation', label: 'Routing', icon: Icons.Navigation },
    ]
  },
  {
    name: 'Payment security',
    icons: [
      { value: 'CreditCard', label: 'Credit card', icon: Icons.CreditCard },
      { value: 'Lock', label: 'Lock', icon: Icons.Lock },
      { value: 'Shield', label: 'Shield', icon: Icons.Shield },
      { value: 'SecurePayment', label: 'Secure payment', icon: Icons.Lock },
      { value: 'Wallet', label: 'Wallet', icon: Icons.CreditCard },
      { value: 'DollarSign', label: 'Cash', icon: Icons.DollarSign },
      { value: 'Receipt', label: 'Receipt', icon: Icons.FileText },
      { value: 'Tag', label: 'Tag', icon: Icons.Tag },
      { value: 'List', label: 'List', icon: Icons.List },
      { value: 'Scan', label: 'Scanner', icon: Icons.Maximize },
    ]
  },
  {
    name: 'Communication',
    icons: [
      { value: 'Phone', label: 'Phone', icon: Icons.Phone },
      { value: 'MessageCircle', label: 'Chat', icon: Icons.MessageCircle },
      { value: 'MessageSquare', label: 'Message', icon: Icons.MessageSquare },
      { value: 'Mail', label: 'Email', icon: Icons.Mail },
      { value: 'HelpCircle', label: 'Customer support', icon: Icons.HelpCircle },
      { value: 'Printer', label: 'Printer and fax', icon: Icons.Printer },
      { value: 'Smartphone', label: 'Mobile', icon: Icons.Smartphone },
    ]
  },
  {
    name: 'Ecology',
    icons: [
      { value: 'Bug', label: 'Virus', icon: Icons.Bug },
      { value: 'Mask', label: 'Mask', icon: Icons.Shield },
      { value: 'Leaf', label: 'Eco', icon: Icons.Feather },
      { value: 'GitBranch', label: 'Rabbit', icon: Icons.GitBranch },
    ]
  },
  {
    name: 'Social',
    icons: [
      { value: 'Twitter', label: 'Twitter', icon: Icons.Twitter },
      { value: 'Facebook', label: 'Facebook', icon: Icons.Facebook },
      { value: 'Pinterest', label: 'Pinterest', icon: Icons.Share2 },
      { value: 'Instagram', label: 'Instagram', icon: Icons.Instagram },
      { value: 'TikTok', label: 'TikTok', icon: Icons.Music },
      { value: 'Tumblr', label: 'Tumblr', icon: Icons.Circle },
      { value: 'Snapchat', label: 'Snapchat', icon: Icons.Camera },
      { value: 'Youtube', label: 'YouTube', icon: Icons.Youtube },
      { value: 'Vimeo', label: 'Vimeo', icon: Icons.Video },
      { value: 'Linkedin', label: 'LinkedIn', icon: Icons.Linkedin },
      { value: 'Flickr', label: 'Flickr', icon: Icons.Image },
      { value: 'Reddit', label: 'Reddit', icon: Icons.Hash },
      { value: 'EmailSocial', label: 'Email', icon: Icons.Mail },
      { value: 'Behance', label: 'Behance', icon: Icons.Circle },
      { value: 'Discord', label: 'Discord', icon: Icons.MessageCircle },
      { value: 'Dribbble', label: 'Dribbble', icon: Icons.Dribbble },
      { value: 'Medium', label: 'Medium', icon: Icons.Edit3 },
      { value: 'Twitch', label: 'Twitch', icon: Icons.Twitch },
      { value: 'WhatsApp', label: 'WhatsApp', icon: Icons.MessageSquare },
      { value: 'Viber', label: 'Viber', icon: Icons.Headphones },
      { value: 'Telegram', label: 'Telegram', icon: Icons.Send },
    ]
  }
];

interface AnnouncementItemEditorProps {
  announcementId: string;
}

export default function AnnouncementItemEditor({ announcementId }: AnnouncementItemEditorProps) {
  const { config: structuralComponents, updateAnnouncementBarConfigLocal } = useStructuralComponents();
  const { selectSection, toggleConfigPanel } = useEditorStore();
  
  const announcementConfig = structuralComponents?.announcementBar || {};
  const announcements = announcementConfig.announcements || [];
  const currentAnnouncement = announcements.find((a: any) => a.id === announcementId) || { 
    id: announcementId, 
    text: '', 
    link: '' 
  };

  const [localAnnouncement, setLocalAnnouncement] = useState<AnnouncementItem>(currentAnnouncement);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [useCustomIcon, setUseCustomIcon] = useState(false);
  const [customIconUrl, setCustomIconUrl] = useState(localAnnouncement.customIcon || '');
  const [showIconHelp, setShowIconHelp] = useState(false);

  // Text formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  useEffect(() => {
    const announcement = announcements.find((a: any) => a.id === announcementId);
    if (announcement) {
      setLocalAnnouncement(announcement);
      setCustomIconUrl(announcement.customIcon || '');
      setUseCustomIcon(!!announcement.customIcon);
    }
  }, [announcementId]); // Only re-run when announcementId changes, not when announcements update

  const handleUpdate = (field: string, value: any) => {
    const updatedAnnouncement = {
      ...localAnnouncement,
      [field]: value
    };
    
    console.log('=== Handle Update ===');
    console.log('Field:', field);
    console.log('New value:', value);
    console.log('Previous announcement:', localAnnouncement);
    console.log('Updated announcement:', updatedAnnouncement);
    
    setLocalAnnouncement(updatedAnnouncement);
    
    // Update in the global config
    const updatedAnnouncements = announcements.map((a: any) => 
      a.id === announcementId ? updatedAnnouncement : a
    );
    
    const updatedConfig = {
      ...announcementConfig,
      announcements: updatedAnnouncements
    };
    
    console.log('Updated config:', updatedConfig);
    updateAnnouncementBarConfigLocal(updatedConfig);
  };

  const handleBack = () => {
    // Close config panel and return to sidebar
    toggleConfigPanel(false);
    selectSection(null);
  };

  const formatText = (format: string) => {
    // In a real implementation, this would apply formatting to selected text
    // For now, we'll just add markdown-style formatting
    let newText = localAnnouncement.text;
    
    switch(format) {
      case 'bold':
        newText = isBold ? newText : `**${newText}**`;
        setIsBold(!isBold);
        break;
      case 'italic':
        newText = isItalic ? newText : `*${newText}*`;
        setIsItalic(!isItalic);
        break;
    }
    
    handleUpdate('text', newText);
  };

  const handleIconSelect = (iconName: string) => {
    console.log('=== Icon Selection ===');
    console.log('Selecting icon:', iconName);
    console.log('Current announcement before update:', localAnnouncement);
    
    // Create the updated announcement with both icon and cleared customIcon
    const updatedAnnouncement = {
      ...localAnnouncement,
      icon: iconName,
      customIcon: ''
    };
    
    // Update local state
    setLocalAnnouncement(updatedAnnouncement);
    
    // Update in the global config with a single update
    const updatedAnnouncements = announcements.map((a: any) => 
      a.id === announcementId ? updatedAnnouncement : a
    );
    
    const updatedConfig = {
      ...announcementConfig,
      announcements: updatedAnnouncements
    };
    
    updateAnnouncementBarConfigLocal(updatedConfig);
    
    // Update UI states
    setUseCustomIcon(false);
    setShowIconPicker(false);
    
    console.log('Icon selection complete');
    console.log('Updated announcement:', updatedAnnouncement);
  };

  const handleCustomIconSelect = () => {
    if (customIconUrl) {
      handleUpdate('customIcon', customIconUrl);
      handleUpdate('icon', ''); // Clear predefined icon when using custom
      setUseCustomIcon(true);
      setShowIconPicker(false);
    }
  };

  // Find the selected icon configuration
  const allIcons = ICON_CATEGORIES.flatMap(cat => cat.icons);
  const selectedIcon = localAnnouncement.icon 
    ? allIcons.find(i => i.value === localAnnouncement.icon)
    : null;
  
  const SelectedIconComponent = selectedIcon?.icon;
  
  console.log('=== Icon Display Debug ===');
  console.log('Current localAnnouncement.icon:', localAnnouncement.icon);
  console.log('Available icon values:', allIcons.map(i => i.value));
  console.log('Selected icon config:', selectedIcon);
  console.log('SelectedIconComponent:', SelectedIconComponent);
  
  const getSelectedIconLabel = () => {
    if (localAnnouncement.customIcon) return 'Custom icon';
    if (!localAnnouncement.icon) return 'None';
    
    const icon = allIcons.find(i => i.value === localAnnouncement.icon);
    console.log('Getting label for icon:', localAnnouncement.icon);
    console.log('Found icon config:', icon);
    return icon?.label || localAnnouncement.icon;
  };

  return (
    <div className="w-[320px] h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Announcement
            </h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Announcement Text */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Announcement
          </label>
          
          {/* Rich Text Toolbar */}
          <div className="flex items-center gap-1 p-1 border border-gray-300 dark:border-gray-600 rounded-t-md bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => formatText('bold')}
              className={`p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${
                isBold ? 'bg-gray-200 dark:bg-gray-700' : ''
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => formatText('italic')}
              className={`p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${
                isItalic ? 'bg-gray-200 dark:bg-gray-700' : ''
              }`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <Link2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <List className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <List className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <textarea
            className="w-full px-3 py-2 text-sm border-x border-b border-gray-300 rounded-b-md 
                       focus:outline-none focus:ring-1 focus:ring-blue-500 
                       dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={localAnnouncement.text}
            onChange={(e) => handleUpdate('text', e.target.value)}
            placeholder="Free Shipping"
            rows={3}
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Link
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-1 focus:ring-blue-500 
                       dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={localAnnouncement.link || ''}
            onChange={(e) => handleUpdate('link', e.target.value)}
            placeholder="Pega un enlace o busca"
          />
        </div>

        {/* Icon Section */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Icon
          </label>
          
          {/* Icon Selector */}
          <div className="relative">
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-white
                         flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {localAnnouncement.customIcon ? (
                  <img src={localAnnouncement.customIcon} alt="Custom icon" className="w-4 h-4" />
                ) : SelectedIconComponent ? (
                  React.createElement(SelectedIconComponent, { className: "w-4 h-4" })
                ) : null}
                <span className="text-xs">
                  {getSelectedIconLabel()}
                </span>
              </div>
              <Icons.ChevronDown className={`w-4 h-4 transition-transform ${showIconPicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Icon Picker Dropdown - Opens upward */}
            {showIconPicker && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 
                              border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 
                              max-h-80 overflow-y-auto">
                {/* None option */}
                <button
                  onClick={() => {
                    handleUpdate('icon', '');
                    handleUpdate('customIcon', '');
                    setShowIconPicker(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-100 
                             dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                >
                  None
                </button>
                
                {/* Icon categories */}
                {ICON_CATEGORIES.map((category, categoryIndex) => (
                  <div key={`category-${categoryIndex}-${category.name}`}>
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 
                                    bg-gray-50 dark:bg-gray-900 sticky top-0">
                      {category.name}
                    </div>
                    {category.icons.map(({ value, label, icon: IconComponent }, iconIndex) => (
                      <button
                        key={`icon-${categoryIndex}-${iconIndex}-${value}`}
                        onClick={() => handleIconSelect(value)}
                        className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 
                                   dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Icon Help Link */}
          <button 
            onClick={() => setShowIconHelp(!showIconHelp)}
            className="text-xs text-blue-600 dark:text-blue-400 underline mt-1 hover:text-blue-700"
          >
            See what icon stands for each label
          </button>

          {showIconHelp && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs">
              <p className="text-gray-700 dark:text-gray-300">
                Icons help customers quickly understand your announcement:
                • Shipping box - Free shipping offers
                • Gift - Special promotions
                • Clock - Limited time offers
                • Shield - Security/trust badges
              </p>
            </div>
          )}

          {/* Custom Icon Section */}
          <div className="mt-4 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Custom icon
              </span>
              <button
                onClick={() => setUseCustomIcon(!useCustomIcon)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {useCustomIcon ? 'Use predefined' : 'Seleccionar'}
              </button>
            </div>

            {useCustomIcon && (
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded
                             dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={customIconUrl}
                  onChange={(e) => setCustomIconUrl(e.target.value)}
                  placeholder="Enter image URL"
                />
                
                <div className="text-center py-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Explorar imágenes gratuitas
                  </p>
                  <div className="flex gap-2 justify-center">
                    <a 
                      href="https://unsplash.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Unsplash
                    </a>
                    <span className="text-gray-400">•</span>
                    <a 
                      href="https://www.pexels.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Pexels
                    </a>
                    <span className="text-gray-400">•</span>
                    <a 
                      href="https://pixabay.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Pixabay
                    </a>
                  </div>
                </div>

                <button
                  onClick={handleCustomIconSelect}
                  className="w-full py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 
                            transition-colors"
                >
                  Seleccionar imagen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}