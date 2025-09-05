'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { ChevronDown, ChevronUp, User, Search } from 'lucide-react';

interface RoomHostCardConfig {
  enabled: boolean;
  title: string;
  showMessageButton?: boolean;
  // Style settings
  buttonColor: string;
  buttonTextColor: string;
  cardColor: string;
  cardTextColor: string;
  cardBorderColor: string;
  borderRadius: number;
  typography: string;
  fontSize: string;
  fontWeight: string;
  topPadding: number;
  bottomPadding: number;
}

interface RoomHostCardEditorProps {
  sectionId: string;
}

const getDefaultConfig = (): RoomHostCardConfig => ({
  enabled: true,
  title: 'Meet your Host',
  showMessageButton: true,
  // Style defaults
  buttonColor: '#2563eb',
  buttonTextColor: '#ffffff',
  cardColor: '#ffffff',
  cardTextColor: '#111827',
  cardBorderColor: '#e5e7eb',
  borderRadius: 12,
  typography: 'font-sans',
  fontSize: 'text-base',
  fontWeight: 'font-normal',
  topPadding: 32,
  bottomPadding: 32
});

// Popular Google Fonts list
const GOOGLE_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Poppins',
  'Playfair Display', 'Merriweather', 'Ubuntu', 'Nunito', 'PT Sans', 'Rubik',
  'Work Sans', 'Quicksand', 'Josefin Sans', 'Oxygen', 'Arimo', 'Bebas Neue',
  'Anton', 'Lobster', 'Comfortaa', 'Abril Fatface', 'Indie Flower', 'Pacifico',
  'Dancing Script', 'Shadows Into Light', 'Amatic SC', 'Caveat', 'Sacramento',
  'Great Vibes', 'Permanent Marker', 'Kaushan Script', 'Satisfy', 'Cookie',
  'Barlow', 'Inter', 'DM Sans', 'Space Grotesk', 'Sora', 'Manrope', 'Epilogue',
  'Plus Jakarta Sans', 'Outfit', 'Urbanist', 'Space Mono', 'JetBrains Mono',
  'Fira Code', 'Source Code Pro', 'IBM Plex Sans', 'IBM Plex Serif', 'Crimson Text',
  'Lora', 'Bitter', 'Libre Baskerville', 'EB Garamond', 'Cormorant Garamond',
  'Vollkorn', 'Cardo', 'Arvo', 'Noto Sans', 'Noto Serif', 'Karla', 'Inconsolata',
  'Dosis', 'Cabin', 'Hind', 'Josefin Slab', 'Fjalla One', 'Archivo', 'Exo 2',
  'Russo One', 'Baloo 2', 'Cairo', 'Kanit', 'Prompt', 'Sarabun', 'Mitr',
  'Chakra Petch', 'Bai Jamjuree', 'Mali', 'Tajawal', 'Almarai', 'Changa',
  'El Messiri', 'Amiri', 'Markazi Text', 'Mirza', 'Reem Kufi', 'Aref Ruqaa'
].sort();

export default function RoomHostCardEditor({ sectionId }: RoomHostCardEditorProps) {
  const { sections, updateSectionSettings } = useEditorStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [localConfig, setLocalConfig] = useState<RoomHostCardConfig>(getDefaultConfig());
  const [fontSearch, setFontSearch] = useState('');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  
  const filteredFonts = GOOGLE_FONTS.filter(font => 
    font.toLowerCase().includes(fontSearch.toLowerCase())
  );

  const section = sections.template.find(s => s.id === sectionId) ||
                  sections.headerGroup.find(s => s.id === sectionId) ||
                  sections.footerGroup.find(s => s.id === sectionId);

  useEffect(() => {
    if (section?.settings) {
      const newConfig = { ...getDefaultConfig(), ...section.settings };
      setLocalConfig(newConfig);
      if (newConfig.typography) {
        setFontSearch(newConfig.typography);
      }
    }
  }, [section?.settings]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.font-selector')) {
        setShowFontDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (field: keyof RoomHostCardConfig, value: any) => {
    const updatedConfig = {
      ...localConfig,
      [field]: value
    };
    
    setLocalConfig(updatedConfig);
    
    if (section) {
      const groupId = Object.keys(sections).find(key => 
        sections[key as keyof typeof sections].includes(section)
      ) || 'template';
      
      updateSectionSettings(groupId as any, section.id, updatedConfig);
    }
  };


  return (
    <div className="bg-white dark:bg-gray-900">
      <div 
        className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="font-medium text-sm">Room Host Card</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 border-b max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show host card</label>
            <input
              type="checkbox"
              checked={localConfig.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="rounded"
            />
          </div>

          <input
            type="text"
            value={localConfig.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Section title"
            className="w-full px-3 py-1.5 text-sm border rounded-md"
          />

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Message Host button</label>
            <input
              type="checkbox"
              checked={localConfig.showMessageButton}
              onChange={(e) => handleChange('showMessageButton', e.target.checked)}
              className="rounded"
            />
          </div>

          {/* Color Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-600 uppercase">Colors</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">Button Color</label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={localConfig.buttonColor}
                      onChange={(e) => handleChange('buttonColor', e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                  </div>
                  <input
                    type="text"
                    value={localConfig.buttonColor}
                    onChange={(e) => handleChange('buttonColor', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border rounded-md font-mono"
                    placeholder="#2563eb"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">Button Text Color</label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={localConfig.buttonTextColor}
                      onChange={(e) => handleChange('buttonTextColor', e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                  </div>
                  <input
                    type="text"
                    value={localConfig.buttonTextColor}
                    onChange={(e) => handleChange('buttonTextColor', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border rounded-md font-mono"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">Card Background Color</label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={localConfig.cardColor}
                      onChange={(e) => handleChange('cardColor', e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                  </div>
                  <input
                    type="text"
                    value={localConfig.cardColor}
                    onChange={(e) => handleChange('cardColor', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border rounded-md font-mono"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">Card Text Color</label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={localConfig.cardTextColor}
                      onChange={(e) => handleChange('cardTextColor', e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                  </div>
                  <input
                    type="text"
                    value={localConfig.cardTextColor}
                    onChange={(e) => handleChange('cardTextColor', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border rounded-md font-mono"
                    placeholder="#111827"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">Card Border Color</label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={localConfig.cardBorderColor}
                      onChange={(e) => handleChange('cardBorderColor', e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                  </div>
                  <input
                    type="text"
                    value={localConfig.cardBorderColor}
                    onChange={(e) => handleChange('cardBorderColor', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border rounded-md font-mono"
                    placeholder="#e5e7eb"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Border & Spacing */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-600 uppercase">Border & Spacing</h3>
            
            <div>
              <label className="text-xs text-gray-600">Border Radius: {localConfig.borderRadius}px</label>
              <input
                type="range"
                value={localConfig.borderRadius}
                onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
                min="0"
                max="24"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600">Top Padding: {localConfig.topPadding}px</label>
                <input
                  type="range"
                  value={localConfig.topPadding}
                  onChange={(e) => handleChange('topPadding', parseInt(e.target.value))}
                  min="0"
                  max="64"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Bottom Padding: {localConfig.bottomPadding}px</label>
                <input
                  type="range"
                  value={localConfig.bottomPadding}
                  onChange={(e) => handleChange('bottomPadding', parseInt(e.target.value))}
                  min="0"
                  max="64"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-600 uppercase">Typography</h3>
            
            <div className="relative font-selector">
              <label className="text-xs text-gray-600 font-medium mb-1 block">
                Font Family
                {localConfig.typography && (
                  <span className="ml-2 text-blue-600">({localConfig.typography})</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fontSearch}
                  onChange={(e) => {
                    setFontSearch(e.target.value);
                    setShowFontDropdown(true);
                  }}
                  onFocus={(e) => {
                    setShowFontDropdown(true);
                    // Select all text when focusing for easy replacement
                    e.target.select();
                  }}
                  placeholder={localConfig.typography || "Search fonts..."}
                  className="w-full px-3 py-2 text-sm border rounded-md pr-8"
                />
                <Search className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              
              {showFontDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredFonts.length > 0 ? (
                    filteredFonts.map((font) => (
                      <button
                        key={font}
                        onClick={() => {
                          handleChange('typography', font);
                          setFontSearch(font);
                          setShowFontDropdown(false);
                          // Load the font dynamically
                          const link = document.createElement('link');
                          link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
                          link.rel = 'stylesheet';
                          document.head.appendChild(link);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        style={{ fontFamily: `'${font}', sans-serif` }}
                      >
                        {font}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">No fonts found</div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600">Font Size</label>
                <select
                  value={localConfig.fontSize}
                  onChange={(e) => handleChange('fontSize', e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded"
                >
                  <option value="text-xs">Extra Small</option>
                  <option value="text-sm">Small</option>
                  <option value="text-base">Base</option>
                  <option value="text-lg">Large</option>
                  <option value="text-xl">Extra Large</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600">Font Weight</label>
                <select
                  value={localConfig.fontWeight}
                  onChange={(e) => handleChange('fontWeight', e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded"
                >
                  <option value="font-light">Light</option>
                  <option value="font-normal">Normal</option>
                  <option value="font-medium">Medium</option>
                  <option value="font-semibold">Semibold</option>
                  <option value="font-bold">Bold</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}