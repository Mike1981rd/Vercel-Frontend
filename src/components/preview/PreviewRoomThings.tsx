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
  deviceView?: 'desktop' | 'mobile' | 'tablet';
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
  const companyId = '1'; // Single-tenant: always company 1
  const { options: houseRulesOptions } = useConfigOptions('house_rules', companyId);
  const { options: safetyOptions } = useConfigOptions('safety_property', companyId);
  const { options: cancellationOptions } = useConfigOptions('cancellation_policies', companyId);
  
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
      const companyId = '1'; // Single-tenant: always company 1
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
      let houseRulesData = roomData.houseRules;
      
      // If houseRules is a string, try to parse it as JSON first
      if (typeof houseRulesData === 'string') {
        try {
          // Try to parse as JSON
          houseRulesData = JSON.parse(houseRulesData);
          console.log('Successfully parsed houseRules JSON:', houseRulesData);
        } catch (e) {
          // If not JSON, treat as comma-separated list
          console.log('houseRules is not JSON, treating as comma-separated string');
          const items = houseRulesData.split(',').map((s: string) => s.trim()).filter((s: string) => s);
          rules.push(...items);
          return rules;
        }
      }
      
      // Now process as object (either originally object or parsed from JSON string)
      if (typeof houseRulesData === 'object') {
        console.log('Processing houseRules as object:', JSON.stringify(houseRulesData));
        
        // Add check-in/check-out times if available
        if (houseRulesData.checkInTime) {
          console.log('Adding check-in time:', houseRulesData.checkInTime);
          rules.push(`Check-in: ${houseRulesData.checkInTime}`);
        }
        if (houseRulesData.checkOutTime) {
          console.log('Adding check-out time:', houseRulesData.checkOutTime);
          rules.push(`Check-out: ${houseRulesData.checkOutTime}`);
        }
        if (houseRulesData.quietHours) {
          console.log('Adding quiet hours:', houseRulesData.quietHours);
          rules.push(`Quiet hours: ${houseRulesData.quietHours}`);
        }
        
        // Add toggle rules based on catalog options
        houseRulesOptions.forEach(option => {
          const value = houseRulesData[option.value];
          if (value !== undefined && value !== null) {
            if (value === true) {
              rules.push(option.labelEs || option.value);
            } else if (value === false && option.value.includes('Allowed')) {
              // For "allowed" rules, show "No" version when false
              const noLabel = option.labelEs?.replace('Se permite', 'No se permite')
                .replace('Se permiten', 'No se permiten')
                .replace('allowed', 'not allowed')
                .replace('Allowed', 'not allowed');
              rules.push(noLabel || `No ${option.labelEs}`);
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
    
    console.log('=== DEBUGGING SAFETY & PROPERTY ===');
    console.log('roomData?.safetyAndProperty:', roomData?.safetyAndProperty);
    console.log('typeof roomData?.safetyAndProperty:', typeof roomData?.safetyAndProperty);
    
    if (roomData?.safetyAndProperty) {
      let safetyData = roomData.safetyAndProperty;
      
      // If it's a string, try to parse it as JSON first
      if (typeof safetyData === 'string') {
        try {
          // Try to parse as JSON
          safetyData = JSON.parse(safetyData);
          console.log('Successfully parsed safetyAndProperty JSON:', safetyData);
        } catch (e) {
          // If not JSON, treat as comma-separated list
          console.log('safetyAndProperty is not JSON, treating as comma-separated string');
          const items = safetyData.split(',').map((s: string) => s.trim()).filter((s: string) => s);
          safety.push(...items);
          return safety;
        }
      }
      
      // Now process as object (either originally object or parsed from JSON string)
      if (typeof safetyData === 'object') {
        console.log('Processing safetyAndProperty as object:', JSON.stringify(safetyData));
        
        // Process boolean flags based on catalog options with robust key matching
        const readFlag = (obj: any, key: string) => {
          if (!obj) return undefined;
          const snake = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          const pascal = key.charAt(0).toUpperCase() + key.slice(1);
          const lower = key.toLowerCase();
          const candidates = [key, snake, pascal, lower];
          for (const k of candidates) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
          }
          return undefined;
        };
        if (safetyOptions.length > 0) {
          safetyOptions.forEach(option => {
            const value = readFlag(safetyData, option.value);
            if (value === true) {
              safety.push(option.labelEs || option.value);
            }
          });
        } else {
          Object.keys(safetyData).forEach((k) => {
            const value = readFlag(safetyData, k);
            if (value === true) safety.push(k);
          });
        }
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
    
    console.log('Final safety array:', safety);
    console.log('=== END DEBUGGING SAFETY & PROPERTY ===');
    
    // Return only room data, no fallback to config
    return safety;
  }, [roomData, safetyOptions]);

  const transformedCancellationPolicy = useMemo(() => {
    const policies: string[] = [];
    
    console.log('=== DEBUGGING CANCELLATION POLICY ===');
    console.log('roomData?.cancellationPolicy:', roomData?.cancellationPolicy);
    console.log('typeof roomData?.cancellationPolicy:', typeof roomData?.cancellationPolicy);
    
    if (roomData?.cancellationPolicy) {
      let policyData = roomData.cancellationPolicy;
      
      // If it's a string, try to parse it as JSON first
      if (typeof policyData === 'string') {
        try {
          // Try to parse as JSON
          policyData = JSON.parse(policyData);
          console.log('Successfully parsed cancellationPolicy JSON:', policyData);
        } catch (e) {
          // If not JSON, treat as plain text description
          console.log('cancellationPolicy is not JSON, treating as plain text');
          policies.push(policyData);
          return policies;
        }
      }
      
      // Now process as object (either originally object or parsed from JSON string)
      if (typeof policyData === 'object') {
        console.log('Processing cancellationPolicy as object:', JSON.stringify(policyData));
        
        // Do not add policy type automatically; only show explicit user-provided info
        
        // Add policy description if available
        if (policyData.description) {
          policies.push(policyData.description);
        }
        
        // Add policy options based on catalog; only include those explicitly enabled
        const readFlag = (obj: any, key: string) => {
          if (!obj) return undefined;
          const snake = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          const pascal = key.charAt(0).toUpperCase() + key.slice(1);
          const lower = key.toLowerCase();
          const candidates = [key, snake, pascal, lower];
          for (const k of candidates) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
          }
          return undefined;
        };
        if (cancellationOptions.length > 0) {
          cancellationOptions.forEach(option => {
            const value = readFlag(policyData, option.value);
            if (value === true) {
              policies.push(option.labelEs || option.value);
            }
          });
        } else {
          // Fallback when catalog is empty: list truthy keys from object (excluding type/description)
          Object.keys(policyData).forEach((k) => {
            if (k === 'type' || k === 'description') return;
            const value = readFlag(policyData, k);
            if (value === true) policies.push(k);
          });
        }
      }
    }
    
    console.log('Final policies array:', policies);
    console.log('=== END DEBUGGING CANCELLATION POLICY ===');
    
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
