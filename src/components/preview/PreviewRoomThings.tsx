'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Info, ChevronRight } from 'lucide-react';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { useConfigOptions } from '@/hooks/useConfigOptions';
import { useI18n } from '@/contexts/I18nContext';
import { fetchRoomData } from '@/lib/api/rooms';

interface RoomThingsConfig {
  enabled: boolean;
  title: string;
  houseRules: string[];
  safetyProperty: string[];
  cancellationPolicy: string[];
  showMoreButton: boolean;
  colorScheme?: string;
  syncWithRoom?: boolean;
}

interface PreviewRoomThingsProps {
  config: RoomThingsConfig;
  deviceView?: 'desktop' | 'mobile';
  isEditor?: boolean;
  theme?: any;
}

export default function PreviewRoomThings({ 
  config, 
  deviceView, 
  isEditor = false,
  theme 
}: PreviewRoomThingsProps) {
  
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [roomData, setRoomData] = useState<any>(null);
  const { language } = useI18n();
  
  // Load config options from catalog
  const { options: houseRulesOptions } = useConfigOptions('house_rules');
  const { options: safetyOptions } = useConfigOptions('safety_property');
  const { options: cancellationOptions } = useConfigOptions('cancellation_policies');
  
  // Get theme config from store if not passed as prop
  const { config: themeConfigFromStore } = useThemeConfigStore();
  const themeConfig = theme || themeConfigFromStore;
  
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

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

  // Fetch room data
  useEffect(() => {
    const loadRoomData = async () => {
      const companyId = localStorage.getItem('companyId') || '1';
      const currentSlug = localStorage.getItem('currentRoomSlug');
      
      console.log('=== ROOM THINGS TO KNOW DEBUG ===');
      console.log('Current room slug from localStorage:', currentSlug);
      console.log('Company ID:', companyId);
      
      try {
        // Use helper function that checks for slug
        const data = await fetchRoomData(companyId);
        if (data) {
          console.log('Room data fetched for Things to Know:', data);
          console.log('Room ID:', data.id);
          console.log('Room Name:', data.name);
          console.log('Room Slug:', data.slug);
          console.log('HouseRules type:', typeof data.houseRules);
          console.log('HouseRules value:', data.houseRules);
          console.log('SafetyAndProperty type:', typeof data.safetyAndProperty);
          console.log('SafetyAndProperty value:', data.safetyAndProperty);
          console.log('CancellationPolicy type:', typeof data.cancellationPolicy);
          console.log('CancellationPolicy value:', data.cancellationPolicy);
          console.log('=================================');
          setRoomData(data);
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
      }
    };

    // Fetch in both editor and preview modes
    if (config.enabled) {
      loadRoomData();
    }
  }, [config.enabled]);

  // Get the selected color scheme
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

  if (!config.enabled) {
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Transform room data to display arrays
  const transformedHouseRules = useMemo(() => {
    const rules: string[] = [];
    
    console.log('=== DEBUGGING HOUSE RULES ===');
    console.log('roomData?.houseRules:', roomData?.houseRules);
    console.log('typeof roomData?.houseRules:', typeof roomData?.houseRules);
    
    if (roomData?.houseRules) {
      // If houseRules is a string (text from DB), split it
      if (typeof roomData.houseRules === 'string') {
        const items = roomData.houseRules.split(',').map((s: string) => s.trim()).filter(s => s);
        rules.push(...items);
      } 
      // If houseRules is an object (JSONB), process it
      else if (typeof roomData.houseRules === 'object') {
        console.log('houseRules is object:', JSON.stringify(roomData.houseRules));
        
        // Add check-in/check-out times if available
        if (roomData.houseRules.checkInTime) {
          console.log('Adding check-in time:', roomData.houseRules.checkInTime);
          rules.push(`Check-in: ${roomData.houseRules.checkInTime}`);
        }
        if (roomData.houseRules.checkOutTime) {
          console.log('Adding check-out time:', roomData.houseRules.checkOutTime);
          rules.push(`Check-out: ${roomData.houseRules.checkOutTime}`);
        }
        if (roomData.houseRules.quietHours) {
          console.log('Adding quiet hours:', roomData.houseRules.quietHours);
          rules.push(`Quiet hours: ${roomData.houseRules.quietHours}`);
        }
        
        // Add toggle rules based on catalog options
        houseRulesOptions.forEach(option => {
          const value = roomData.houseRules[option.value];
          if (value !== undefined && value !== null) {
            if (value === true) {
              rules.push(option.label || option.value);
            } else if (value === false && option.value.includes('Allowed')) {
              // For "allowed" rules, show "No" version when false
              const noLabel = option.label?.replace('Se permite', 'No se permite')
                .replace('Se permiten', 'No se permiten')
                .replace('allowed', 'not allowed')
                .replace('Allowed', 'not allowed');
              rules.push(noLabel || `No ${option.label}`);
            }
          }
        });
      }
    }
    
    console.log('Final rules array:', rules);
    console.log('=== END DEBUGGING HOUSE RULES ===');
    
    // Return only room data, no fallback to config
    return rules;
  }, [roomData, houseRulesOptions]);

  const transformedSafetyProperty = useMemo(() => {
    const safety: string[] = [];
    
    if (roomData?.safetyAndProperty) {
      // If it's a string (rich text), try to parse it as a list
      if (typeof roomData.safetyAndProperty === 'string') {
        const items = roomData.safetyAndProperty.split(',').map((s: string) => s.trim());
        safety.push(...items);
      } else if (typeof roomData.safetyAndProperty === 'object') {
        // If it's an object with boolean flags
        safetyOptions.forEach(option => {
          const value = roomData.safetyAndProperty[option.value];
          if (value === true) {
            safety.push(option.label || option.value);
          }
        });
      }
    }
    
    // Also check for custom safety text
    if (roomData?.safetyFeatures) {
      if (typeof roomData.safetyFeatures === 'string') {
        safety.push(roomData.safetyFeatures);
      } else if (Array.isArray(roomData.safetyFeatures)) {
        safety.push(...roomData.safetyFeatures);
      }
    }
    
    // Return only room data, no fallback to config
    return safety;
  }, [roomData, safetyOptions]);

  const transformedCancellationPolicy = useMemo(() => {
    const policies: string[] = [];
    
    if (roomData?.cancellationPolicy) {
      // Add policy type if available
      if (roomData.cancellationPolicy.type) {
        const typeMap: { [key: string]: string } = {
          'flexible': language === 'es' ? 'Política flexible' : 'Flexible policy',
          'moderate': language === 'es' ? 'Política moderada' : 'Moderate policy',
          'strict': language === 'es' ? 'Política estricta' : 'Strict policy',
          'super_strict': language === 'es' ? 'Política súper estricta' : 'Super strict policy'
        };
        policies.push(typeMap[roomData.cancellationPolicy.type] || roomData.cancellationPolicy.type);
      }
      
      // Add policy description if available
      if (roomData.cancellationPolicy.description) {
        policies.push(roomData.cancellationPolicy.description);
      }
      
      // Add policy options based on catalog
      cancellationOptions.forEach(option => {
        const value = roomData.cancellationPolicy[option.value];
        if (value === true) {
          policies.push(option.label || option.value);
        }
      });
    }
    
    // Return only room data, no fallback to config
    return policies;
  }, [roomData, cancellationOptions, language]);

  const sections = [
    {
      id: 'house-rules',
      title: language === 'es' ? 'Reglas de la casa' : 'House rules',
      items: transformedHouseRules,
      preview: transformedHouseRules.slice(0, 3)
    },
    {
      id: 'safety',
      title: language === 'es' ? 'Seguridad y propiedad' : 'Safety & property',
      items: transformedSafetyProperty,
      preview: transformedSafetyProperty.slice(0, 3)
    },
    {
      id: 'cancellation',
      title: language === 'es' ? 'Política de cancelación' : 'Cancellation policy',
      items: transformedCancellationPolicy,
      preview: transformedCancellationPolicy.slice(0, 3)
    }
  ];

  // Check if all sections are empty
  const hasAnyContent = sections.some(s => s.items && s.items.length > 0);
  
  // If no content at all, don't render the component
  if (!hasAnyContent) {
    return null;
  }

  return (
    <div 
      className="container mx-auto px-6 py-8"
      style={{
        borderTop: `1px solid ${colorScheme.border || '#E5E5E5'}`,
        backgroundColor: colorScheme.background || '#FFFFFF'
      }}
    >
      <h2 
        className="text-xl font-semibold mb-6"
        style={{ color: colorScheme.text || '#000000' }}
      >
        {config.title || 'Things to know'}
      </h2>

      <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'} gap-6`}>
        {sections.map((section) => {
          // Only render sections that have items
          if (!section.items || section.items.length === 0) return null;
          
          return (
            <div key={section.id} className="space-y-3">
              <h3 
                className="font-semibold"
                style={{ color: colorScheme.text || '#000000' }}
              >
                {section.title}
              </h3>
              
              <ul className="space-y-2">
                {(expandedSections.includes(section.id) ? section.items : section.preview).map((item, index) => (
                  <li 
                    key={index} 
                    className="text-sm"
                    style={{ color: colorScheme.textSecondary || colorScheme.text || '#666666' }}
                  >
                    {item}
                  </li>
                ))}
              </ul>

              {config.showMoreButton && section.items.length > 3 && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-1 text-sm font-semibold underline hover:no-underline"
                  style={{ color: colorScheme.link || '#0066CC' }}
                >
                  {expandedSections.includes(section.id) ? 'Show less' : 'Show more'}
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    expandedSections.includes(section.id) ? 'rotate-90' : ''
                  }`} />
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}