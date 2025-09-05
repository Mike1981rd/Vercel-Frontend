'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Loader2 } from 'lucide-react';

// Popular Google Fonts list
const GOOGLE_FONTS = [
  'Roboto',
  'Open Sans',
  'Poppins',
  'Lato',
  'Montserrat',
  'Playfair Display',
  'Inter',
  'Raleway',
  'Assistant',
  'Source Sans Pro',
  'Oswald',
  'Merriweather',
  'PT Sans',
  'Nunito',
  'Ubuntu',
  'Bebas Neue',
  'Work Sans',
  'Quicksand',
  'Josefin Sans',
  'Archivo',
  'Noto Sans',
  'Dosis',
  'Oxygen',
  'Crimson Text',
  'Libre Baskerville',
  'Bitter',
  'Cabin',
  'Dancing Script',
  'Pacifico',
  'Indie Flower',
  'Kanit',
  'Barlow',
  'Fira Sans',
  'Abel',
  'Comfortaa',
  'Rajdhani',
  'Maven Pro',
  'Exo 2',
  'Yanone Kaffeesatz',
  'Amatic SC',
  'Shadows Into Light',
  'Sacramento',
  'Great Vibes',
  'Lobster',
  'Caveat',
  'Rubik',
  'Cairo',
  'Hind',
  'Titillium Web',
  'Mukta'
].sort();

interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
  placeholder?: string;
  className?: string;
  primaryColor?: string;
}

export function FontPicker({ 
  value, 
  onChange, 
  placeholder = 'Search fonts...', 
  className = '',
  primaryColor = '#22c55e'
}: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [loadingFont, setLoadingFont] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter fonts based on search
  const filteredFonts = GOOGLE_FONTS.filter(font =>
    font.toLowerCase().includes(search.toLowerCase())
  );

  // Load font preview
  const loadFont = useCallback((fontName: string) => {
    if (!fontName || loadedFonts.has(fontName)) return;
    
    setLoadingFont(fontName);
    
    // Check if WebFont is available
    if (typeof window !== 'undefined' && (window as any).WebFont) {
      (window as any).WebFont.load({
        google: {
          families: [`${fontName}:400,700`]
        },
        active: () => {
          setLoadedFonts(prev => new Set(Array.from(prev).concat(fontName)));
          setLoadingFont(null);
        },
        inactive: () => {
          console.warn(`Failed to load font: ${fontName}`);
          setLoadingFont(null);
        }
      });
    } else {
      // If WebFont is not available, try to load it dynamically
      const script = document.createElement('script');
      script.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
      script.onload = () => {
        (window as any).WebFont.load({
          google: {
            families: [`${fontName}:400,700`]
          },
          active: () => {
            setLoadedFonts(prev => new Set(Array.from(prev).concat(fontName)));
            setLoadingFont(null);
          },
          inactive: () => {
            console.warn(`Failed to load font: ${fontName}`);
            setLoadingFont(null);
          }
        });
      };
      document.head.appendChild(script);
    }
  }, [loadedFonts]);

  // Handle font selection
  const selectFont = (font: string) => {
    setSearch(font);
    onChange(font);
    setIsOpen(false);
    loadFont(font);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load initial font if provided
  useEffect(() => {
    if (value) {
      // Try to load the font even if it's not in our list
      // This handles custom fonts or variations
      const fontName = value.trim();
      if (fontName) {
        loadFont(fontName);
      }
    }
  }, [value, loadFont]);

  // Update search when value changes externally
  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className={`flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 ${className}`}
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          placeholder={placeholder}
        />
        <span 
          className="text-xs text-gray-400 font-medium"
          style={{ fontFamily: loadedFonts.has(search) ? `'${search}', sans-serif` : 'inherit' }}
        >
          Aa
        </span>
      </div>

      {/* Dropdown */}
      {isOpen && filteredFonts.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredFonts.map(font => {
            const isSelected = font === value;
            const isLoaded = loadedFonts.has(font);
            const isLoading = loadingFont === font;

            return (
              <button
                key={font}
                onClick={() => selectFont(font)}
                onMouseEnter={() => loadFont(font)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                  isSelected ? 'bg-gray-50' : ''
                }`}
                style={{ 
                  fontFamily: isLoaded ? `'${font}', sans-serif` : 'inherit' 
                }}
              >
                <span>{font}</span>
                <div className="flex items-center gap-1">
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                  {isSelected && <Check className="w-3 h-3" style={{ color: primaryColor }} />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}