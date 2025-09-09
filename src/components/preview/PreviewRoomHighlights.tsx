'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, MapPin, Calendar, DoorOpen, Wifi, Car, Wind, Tv } from 'lucide-react';
import * as Icons from 'lucide-react';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { useConfigOptions } from '@/hooks/useConfigOptions';
import { useI18n } from '@/contexts/I18nContext';
import { fetchRoomData } from '@/lib/api/rooms';

interface Highlight {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface RoomHighlightsConfig {
  enabled: boolean;
  colorScheme?: string;
  title?: string;
  topPadding?: number;
  bottomPadding?: number;
  highlights?: Highlight[];
  titleSpacing?: number;
  mobileTitleSpacing?: number;
  headingSize?: number;
  headingWeight?: string;
  headingItalic?: boolean;
  headingUnderline?: boolean;
  headingBold?: boolean;
  contentBold?: boolean;
  contentItalic?: boolean;
  contentUnderline?: boolean;
}

interface PreviewRoomHighlightsProps {
  config: RoomHighlightsConfig;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
  theme?: any;
}

export default function PreviewRoomHighlights({ 
  config, 
  deviceView, 
  isEditor = false,
  theme 
}: PreviewRoomHighlightsProps) {
  
  console.log('🚀 PreviewRoomHighlights mounted with config:', config);
  // Avoid relying on fallback highlights; only show real room data
  
  // Get theme config from store if not passed as prop
  const { config: themeConfigFromStore } = useThemeConfigStore();
  const themeConfig = theme || themeConfigFromStore;
  
  // Get i18n and config options for common spaces
  const { language } = useI18n();
  const { options: commonSpacesOptions } = useConfigOptions('common_spaces');
  const { options: viewTypeOptions } = useConfigOptions('view_type');
  
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  // Get the selected color scheme - MUST be before any returns or useEffects
  const colorScheme = useMemo(() => {
    if (!themeConfig?.colorSchemes?.schemes) {
      // Fallback colors if no theme config
      return {
        text: '#000000',
        background: '#FFFFFF',
        solidButton: '#000000',
        solidButtonText: '#FFFFFF',
        outlineButton: '#000000',
        outlineButtonText: '#000000',
        link: '#0066CC',
        border: '#E5E5E5',
        foreground: '#F5F5F5'
      };
    }
    
    // config.colorScheme is "1", "2", etc. - convert to index
    const schemeIndex = parseInt(config.colorScheme || '1') - 1;
    const selectedScheme = themeConfig.colorSchemes.schemes[schemeIndex];
    
    return selectedScheme || themeConfig.colorSchemes.schemes[0];
  }, [themeConfig, config.colorScheme]);

  // Generate typography styles for headings
  const headingTypographyStyles = useMemo(() => {
    if (!themeConfig?.typography?.headings) return {};
    
    const heading = themeConfig.typography.headings;
    return {
      fontFamily: `'${heading.fontFamily}', sans-serif`,
      fontWeight: heading.fontWeight || '600',
      textTransform: heading.useUppercase ? 'uppercase' as const : 'none' as const,
      fontSize: heading.fontSize ? 
        (heading.fontSize <= 100 ? 
          `${heading.fontSize}%` : 
          `${heading.fontSize}px`) : '100%',
      letterSpacing: `${heading.letterSpacing || 0}px`
    };
  }, [themeConfig?.typography?.headings]);

  // Generate typography styles for body text
  const bodyTypographyStyles = useMemo(() => {
    if (!themeConfig?.typography?.body) return {};
    
    const body = themeConfig.typography.body;
    return {
      fontFamily: `'${body.fontFamily}', sans-serif`,
      fontWeight: body.fontWeight || '400',
      textTransform: body.useUppercase ? 'uppercase' as const : 'none' as const,
      fontSize: body.fontSize ? 
        (body.fontSize <= 100 ? 
          `${body.fontSize}%` : 
          `${body.fontSize}px`) : '100%',
      letterSpacing: `${body.letterSpacing || 0}px`
    };
  }, [themeConfig?.typography?.body]);

  // Parse room details and common spaces - MUST be before using them
  const roomDetails = useMemo(() => {
    if (!roomData?.roomDetails) return null;
    
    try {
      if (typeof roomData.roomDetails === 'string') {
        const parsed = JSON.parse(roomData.roomDetails);
        console.log('Parsed roomDetails from string:', parsed);
        return parsed;
      } else if (roomData.roomDetails && typeof roomData.roomDetails === 'object') {
        console.log('roomDetails is already an object:', roomData.roomDetails);
        return roomData.roomDetails;
      }
    } catch (error) {
      console.error('Error parsing roomDetails:', error);
      return null;
    }
    return null;
  }, [roomData]);
  
  const commonSpaces = useMemo(() => {
    // Prefer sleepingArrangements.commonSpaces; fallback to top-level CommonSpaces
    try {
      let spaces: any = null;
      if (roomData?.sleepingArrangements) {
        const sa = typeof roomData.sleepingArrangements === 'string' 
          ? JSON.parse(roomData.sleepingArrangements) 
          : roomData.sleepingArrangements;
        spaces = sa?.commonSpaces || null;
        if (spaces) {
          console.log('📊 CommonSpaces structure from sleepingArrangements:', JSON.stringify(spaces, null, 2));
          console.log('📊 CommonSpaces keys:', Object.keys(spaces));
          console.log('📊 CommonSpaces typeof:', typeof spaces);
          
          // Normalize keys to lowercase for consistent access
          const normalized: any = {};
          Object.entries(spaces).forEach(([key, value]) => {
            // Convert key to lowercase and handle special cases
            let normalizedKey = key.toLowerCase();
            
            // Log each key being processed
            console.log(`  🔑 Processing key: "${key}" -> "${normalizedKey}", value: ${value}`);
            
            // Special mapping for Spanish terms
            if (normalizedKey === 'terraza') normalizedKey = 'terrace';
            if (normalizedKey === 'gimnasio') normalizedKey = 'gym';
            if (normalizedKey === 'estacionamiento' || normalizedKey === 'parqueo') normalizedKey = 'parking';
            if (normalizedKey === 'cocina') normalizedKey = 'kitchen';
            if (normalizedKey === 'sala' || normalizedKey === 'saladestar') normalizedKey = 'livingroom';
            if (normalizedKey === 'comedor') normalizedKey = 'diningroom';
            if (normalizedKey === 'balcon' || normalizedKey === 'balcón') normalizedKey = 'balcony';
            if (normalizedKey === 'jardin' || normalizedKey === 'jardín') normalizedKey = 'garden';
            if (normalizedKey === 'piscina') normalizedKey = 'pool';
            
            // If key changed after normalization, log it
            if (normalizedKey !== key.toLowerCase()) {
              console.log(`    ✨ Normalized to: "${normalizedKey}"`);
            }
            
            normalized[normalizedKey] = value;
          });
          
          console.log('📊 Normalized commonSpaces:', JSON.stringify(normalized, null, 2));
          // Return the normalized version directly
          return normalized;
        }
      }
      // Fallback: some datasets may store this under dedicated CommonSpaces
      if (roomData?.commonSpaces) {
        const cs = typeof roomData.commonSpaces === 'string'
          ? JSON.parse(roomData.commonSpaces)
          : roomData.commonSpaces;
        if (cs) {
          console.log('📊 CommonSpaces structure from top-level:', JSON.stringify(cs, null, 2));
          console.log('📊 CommonSpaces keys:', Object.keys(cs));
          
          // Normalize this too
          const normalized: any = {};
          Object.entries(cs).forEach(([key, value]) => {
            let normalizedKey = key.toLowerCase();
            if (normalizedKey === 'terraza') normalizedKey = 'terrace';
            if (normalizedKey === 'gimnasio') normalizedKey = 'gym';
            if (normalizedKey === 'estacionamiento' || normalizedKey === 'parqueo') normalizedKey = 'parking';
            if (normalizedKey === 'cocina') normalizedKey = 'kitchen';
            if (normalizedKey === 'sala' || normalizedKey === 'saladestar') normalizedKey = 'livingroom';
            if (normalizedKey === 'comedor') normalizedKey = 'diningroom';
            if (normalizedKey === 'balcon' || normalizedKey === 'balcón') normalizedKey = 'balcony';
            if (normalizedKey === 'jardin' || normalizedKey === 'jardín') normalizedKey = 'garden';
            if (normalizedKey === 'piscina') normalizedKey = 'pool';
            
            normalized[normalizedKey] = value;
          });
          
          // Return the normalized version directly
          return normalized;
        }
        return cs || null;
      }
      return null;
    } catch (error) {
      console.error('❌ Error accessing commonSpaces:', error);
      return null;
    }
  }, [roomData]);

  // NOTE: We intentionally ignore roomData.highlights for this section
  // because "Room Highlights" in this project refers to Common Spaces
  // toggles from the room form (sleepingArrangements.commonSpaces) and viewType.

  // Build display highlights from real common spaces and (optionally) view type
  const displayHighlights = useMemo(() => {
    const derived: Highlight[] = [];
    // Add view type highlight if available
    if (roomData?.viewType && viewTypeOptions.length > 0) {
      const viewOption = viewTypeOptions.find((opt: any) => opt.value === roomData.viewType);
      if (viewOption) {
        const viewLabel = (language === 'es' ? viewOption.labelEs : viewOption.labelEn) || '';
        if (viewLabel) {
          derived.push({
            id: 'view-type',
            icon: viewOption.icon || 'eye',
            title: viewLabel,
            description: language === 'es'
              ? `Disfruta de una hermosa ${viewLabel.toLowerCase()} desde esta habitación`
              : `Enjoy a beautiful ${viewLabel.toLowerCase()} from this room`
          });
        }
      }
    }

    // Derive from common spaces (real room data)
    if (commonSpaces && commonSpacesOptions.length > 0) {
      console.log('🎯 Generating highlights from common spaces:', commonSpaces);
      console.log('📚 Available common space options:', commonSpacesOptions);
      console.log('🔍 Checking each option against commonSpaces object...');
      console.log('🔍 CommonSpaces object type:', typeof commonSpaces);
      console.log('🔍 CommonSpaces is array?:', Array.isArray(commonSpaces));
      if (commonSpaces && typeof commonSpaces === 'object') {
        console.log('🔍 CommonSpaces properties:', Object.getOwnPropertyNames(commonSpaces));
      }
      const aliasMap: Record<string, string[]> = {
        kitchen: ['kitchen', 'cocina'],
        livingRoom: ['livingRoom', 'living_room', 'sala', 'salaDeEstar', 'sala_de_estar'],
        diningRoom: ['diningRoom', 'dining_room', 'comedor'],
        balcony: ['balcony', 'balcon', 'balcón'],
        terrace: ['terrace', 'terraza'],
        garden: ['garden', 'jardin', 'jardín'],
        pool: ['pool', 'piscina'],
        gym: ['gym', 'gimnasio'],
        spa: ['spa'],
        parking: ['parking', 'estacionamiento', 'parqueo', 'parqueadero', 'aparcamiento'],
        lobby: ['lobby']
      };
      const coerceBool = (v: any): boolean | undefined => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'number') return v === 1 ? true : v === 0 ? false : undefined;
        if (typeof v === 'string') {
          const s = v.trim().toLowerCase();
          if (['true','1','yes','si','sí','enabled','on'].includes(s)) return true;
          if (['false','0','no','disabled','off','none'].includes(s)) return false;
        }
        return undefined;
      };
      const readFlag = (obj: any, key: string) => {
        if (!obj) {
          console.log(`  🔍 Checking ${key}: obj is null/undefined`);
          return undefined;
        }
        
        // First try direct access with the original key
        if (obj[key] !== undefined) {
          console.log(`  ✅ Direct access ${key}:`, obj[key]);
          const directValue = coerceBool(obj[key]);
          if (directValue !== undefined) return directValue;
        }
        
        const snake = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        const pascal = key.charAt(0).toUpperCase() + key.slice(1);
        const lower = key.toLowerCase();
        const aliases = aliasMap[key as keyof typeof aliasMap] || [];
        const candidates = [key, snake, pascal, lower, ...aliases];
        
        console.log(`  🔍 Checking ${key} with candidates:`, candidates);
        
        for (const k of candidates) {
          if (Object.prototype.hasOwnProperty.call(obj, k)) {
            const val = (obj as any)[k];
            console.log(`    Found ${k}:`, val);
            // support nested shapes: { pool: { enabled: true } }
            if (typeof val === 'object' && val !== null) {
              const nested = coerceBool((val as any).enabled ?? (val as any).value ?? (val as any).active);
              if (nested !== undefined) return nested;
            }
            const coerced = coerceBool(val);
            if (coerced !== undefined) return coerced;
            // any non-empty truthy value considered enabled
            if (val) return true;
            return false;
          }
        }
        // also support available array under commonSpaces
        if (Array.isArray((obj as any).available)) {
          const values = (obj as any).available.map((v: any) => String(v).toLowerCase());
          const aliases = (aliasMap[key] || [key]).map(s => s.toLowerCase());
          return aliases.some(a => values.includes(a));
        }
        
        // Additional fallback: check if the entire object might be stored differently
        // For example, if commonSpaces is stored as a JSON string within the object
        if (typeof obj === 'string') {
          try {
            const parsed = JSON.parse(obj);
            console.log(`  🔄 Parsed string to object for ${key}:`, parsed);
            return readFlag(parsed, key);
          } catch (e) {
            console.log(`  ❌ Failed to parse string for ${key}`);
          }
        }
        
        // Final fallback: check for numbered keys (e.g., "0", "1", "2" for array-like structures)
        if (obj['0'] !== undefined) {
          console.log(`  🔢 Object has numbered keys, might be array-like`);
          const arrayLike = Object.values(obj);
          for (const item of arrayLike) {
            if (typeof item === 'string' && aliasMap[key]?.includes(item.toLowerCase())) {
              return true;
            }
          }
        }
        
        console.log(`  ❌ ${key}: not found in object`);
        return undefined;
      };
      const includesAlias = (arr: any, key: string) => {
        try {
          const values = Array.isArray(arr) ? arr.map((v: any) => String(v).toLowerCase()) : [];
          const aliases = (aliasMap[key] || [key]).map(s => s.toLowerCase());
          return aliases.some(a => values.includes(a));
        } catch { return false; }
      };
      commonSpacesOptions.forEach((spaceOption: any) => {
        let enabled = readFlag(commonSpaces, spaceOption.value);
        if (enabled === undefined && Array.isArray(commonSpaces)) {
          enabled = includesAlias(commonSpaces, spaceOption.value) ? true : undefined;
        }
        console.log(`  Checking ${spaceOption.value}:`, enabled);
        if (enabled) {
          console.log(`    ✅ ${spaceOption.value} is enabled!`);
          const spaceLabel = language === 'es' ? spaceOption.labelEs : spaceOption.labelEn;
          // No generar descripciones por defecto; mostrar solo el label real
          const description = '';
          derived.push({
            id: `common-${spaceOption.value}`,
            icon: spaceOption.icon || 'sparkles',
            title: spaceLabel || spaceOption.value,
            description
          });
        }
      });
    }

    return derived;
  }, [roomData, viewTypeOptions, commonSpaces, commonSpacesOptions, language]);

  // Helper functions
  const getIcon = (iconName: string) => {
    // Check if it's an emoji or special character (from catalog)
    if (!iconName || iconName.length <= 2 || /[\u{1F300}-\u{1F9FF}]/u.test(iconName)) {
      return null; // Return null for emojis, will be rendered as text
    }
    
    // Convert kebab-case to PascalCase for Lucide icons
    const convertToPascalCase = (str: string) => {
      return str.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
    };
    
    // Map common icon names to Lucide icon names
    const iconMap: { [key: string]: string } = {
      // Common spaces icons
      'utensils': 'Utensils',
      'utensils-crossed': 'UtensilsCrossed',
      'waves': 'Waves',
      'dumbbell': 'Dumbbell',
      'tree': 'Trees',
      'car': 'Car',
      'sofa': 'Sofa',
      'wine': 'Wine',
      'sparkles': 'Sparkles',
      'sun': 'Sun',
      'flame': 'Flame',
      'tv': 'Tv',
      'home': 'Home',
      'eye': 'Eye',
      'book': 'Book',
      'book-open': 'BookOpen',
      'coffee': 'Coffee',
      // Original mappings
      'map-pin': 'MapPin',
      'key': 'Key',
      'wifi': 'Wifi',
      'shield': 'ShieldCheck',
      'clock': 'Clock',
      'user': 'User',
      'star': 'Star',
      'building': 'Building',
      'truck': 'Truck',
      'door-open': 'DoorOpen',
      'award': 'Award',
      'check': 'Check',
      'check-circle': 'CheckCircle',
      'users': 'Users',
      // Add more mappings as needed
    };
    
    // Try to find the icon using the mapping or convert the name
    const mappedIconName = iconMap[iconName.toLowerCase()] || convertToPascalCase(iconName);
    const IconComponent = Icons[mappedIconName as keyof typeof Icons] as React.ComponentType<any>;
    
    // Use consistent 24px size for both mobile and desktop
    return IconComponent ? React.createElement(IconComponent, { className: "w-full h-full" }) : <Sparkles className="w-full h-full" />;
  };

  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered');
    const companyId = '1'; // Single-tenant: always company 1
    
    setLoading(true);
    try {
      // Use helper function that checks for slug
      const data = await fetchRoomData(companyId);
      if (data) {
        console.log('Manual refresh - Room data:', data);
        setRoomData(data);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Effects - after all hooks
  useEffect(() => {
    if (deviceView !== undefined) {
      setIsMobile(deviceView === 'mobile');
      return;
    }
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [deviceView]);

  // Auto-fetch room data for both editor and preview
  useEffect(() => {
    const loadRoomData = async () => {
      const companyId = '1'; // Single-tenant: always company 1
      
      setLoading(true);
      try {
        // Use helper function that checks for slug
        const data = await fetchRoomData(companyId);
        if (data) {
          console.log('=== Room Highlights Data Debug ===');
          console.log('Highlights field:', data.highlights);
          console.log('Number of highlights:', Array.isArray(data.highlights) ? data.highlights.length : 0);
          if (data.highlights && data.highlights[0]) {
            console.log('First highlight:', data.highlights[0]);
          }
          console.log('Common spaces location:', data.sleepingArrangements?.commonSpaces);
          console.log('================================');
          setRoomData(data);
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch in both editor and preview modes
    if (config.enabled) {
      loadRoomData();
    }
  }, [config.enabled]);

  // Debug parsed data
  useEffect(() => {
    if (commonSpaces) {
      console.log('✅ Common Spaces loaded:', commonSpaces);
    }
    if (displayHighlights && displayHighlights.length > 0) {
      console.log('📍 Displaying common spaces as highlights:', displayHighlights.length, 'items');
    }
  }, [commonSpaces, displayHighlights]);

  // Conditional returns - AFTER all hooks
  if (!config.enabled) {
    return null;
  }

  // Show loading state
  if (loading && !roomData) {
    return (
      <div 
        className="container mx-auto px-6"
        style={{
          paddingTop: `${config.topPadding || 32}px`,
          paddingBottom: `${config.bottomPadding || 32}px`,
        }}
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (displayHighlights.length === 0 && !loading) {
    // Si no hay data real, no mostrar nada
    return null;
  }

  return (
    <div 
      className={`container mx-auto ${isMobile ? 'px-4' : 'px-6'}`}
      style={{
        paddingTop: isMobile ? '24px' : `${config.topPadding || 32}px`,
        paddingBottom: isMobile ? '24px' : `${config.bottomPadding || 32}px`,
        backgroundColor: colorScheme?.background || '#FFFFFF',
        color: colorScheme?.text || '#000000',
        borderTop: `1px solid ${colorScheme?.border || '#E5E5E5'}`
      }}
    >

      {/* Section Title */}
      {config.title && (
        <h2 
          style={{ 
            ...headingTypographyStyles,
            color: colorScheme?.text || '#000000',
            marginBottom: isMobile ? `${config.mobileTitleSpacing || 16}px` : `${config.titleSpacing || 24}px`,
            fontSize: isMobile ? '18px' : (config.headingSize ? `${config.headingSize}px` : (headingTypographyStyles.fontSize || '20px')),
            fontWeight: config.headingBold ? 'bold' : (config.headingWeight || headingTypographyStyles.fontWeight || '600'),
            fontStyle: config.headingItalic ? 'italic' : 'normal',
            textDecoration: config.headingUnderline ? 'underline' : 'none',
            textAlign: isMobile ? 'center' : 'left'
          }}
        >
          {config.title}
        </h2>
      )}
      
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'}`}>
        {displayHighlights.map((highlight: Highlight) => (
          <div 
            key={highlight.id} 
            className="flex"
            style={{
              gap: isMobile ? '14px' : '16px',
              alignItems: isMobile ? 'flex-start' : 'flex-start',
              minHeight: isMobile ? '28px' : 'auto'
            }}
          >
            <div 
              className="flex-shrink-0"
              style={{ 
                color: colorScheme?.text || '#000000',
                fontSize: isMobile ? '24px' : '24px',
                width: isMobile ? '24px' : '24px',
                height: isMobile ? '24px' : '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start'
              }}
            >
              {getIcon(highlight.icon) || (
                <span style={{ 
                  fontSize: isMobile ? '20px' : '24px',
                  lineHeight: 1
                }}>{highlight.icon}</span>
              )}
            </div>
            <div className="flex-1">
              <h3 
                className="mb-1"
                style={{ 
                  ...headingTypographyStyles,
                  color: colorScheme?.text || '#000000',
                  fontSize: isMobile ? '16px' : '16px',
                  fontWeight: config.contentBold ? 'bold' : '600',
                  fontStyle: config.contentItalic ? 'italic' : 'normal',
                  textDecoration: config.contentUnderline ? 'underline' : 'none',
                  lineHeight: isMobile ? '1.5' : '1.6'
                }}
              >
                {highlight.title}
              </h3>
              {!isMobile && (
                <p 
                  className="text-sm"
                  style={{ 
                    ...bodyTypographyStyles,
                    color: colorScheme?.text || '#666666',
                    opacity: 0.8,
                    fontSize: '14px',
                    fontWeight: config.contentBold ? 'bold' : bodyTypographyStyles.fontWeight,
                    fontStyle: config.contentItalic ? 'italic' : 'normal',
                    textDecoration: config.contentUnderline ? 'underline' : 'none',
                    lineHeight: '1.5'
                  }}
                >
                  {highlight.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
