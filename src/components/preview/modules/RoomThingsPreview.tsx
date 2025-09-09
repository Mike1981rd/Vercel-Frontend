'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Info } from 'lucide-react';
import IconRenderer from '@/components/ui/IconRenderer';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { useConfigOptions } from '@/hooks/useConfigOptions';
import { fetchRoomData } from '@/lib/api/rooms';
// import { useI18n } from '@/contexts/I18nContext';

interface RoomThingsConfig {
  enabled: boolean;
  title: string;
  houseRules: string[];
  safetyProperty: string[];
  cancellationPolicy: string[];
  showMoreButton: boolean;
  colorScheme?: string;
}

// For richer rendering with optional icon metadata
interface ResolvedItem {
  key: string;
  label: string;
  icon?: string;
  iconType?: string;
}

interface RoomThingsPreviewProps {
  config?: RoomThingsConfig;
  settings?: RoomThingsConfig;
  deviceView?: 'mobile' | 'desktop';
  isEditor?: boolean;
  theme?: any;
}

// No hardcoded data - only use what comes from the editor
const defaultConfig: RoomThingsConfig = {
  enabled: true,
  title: 'Things to know',
  houseRules: [],
  safetyProperty: [],
  cancellationPolicy: [],
  showMoreButton: true,
  colorScheme: '1'
};

export default function RoomThingsPreview({ 
  config,
  settings,
  deviceView,
  isEditor = false,
  theme
}: RoomThingsPreviewProps) {
  // Support both config and settings props for compatibility
  const actualConfig = config || settings || defaultConfig;
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<any>(null);

  // Catalog options for mapping boolean flags to labels
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

  // Load real room data when syncing is enabled (default true in editor)
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
          console.log('HouseRules:', data.houseRules);
          console.log('SafetyAndProperty:', data.safetyAndProperty);
          console.log('CancellationPolicy:', data.cancellationPolicy);
          console.log('=================================');
          setRoomData(data);
        }
      } catch (err) {
        console.error('RoomThingsPreview: error loading room data', err);
      }
    };

    if (actualConfig.enabled && ((actualConfig as any).syncWithRoom ?? true)) {
      loadRoomData();
    }
  }, [actualConfig.enabled, (actualConfig as any).syncWithRoom]);

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
        foreground: '#F5F5F5',
        textSecondary: '#666666'
      };
    }
    
    // actualConfig.colorScheme is "1", "2", etc. - convert to index
    const schemeIndex = parseInt(actualConfig.colorScheme || '1') - 1;
    const selectedScheme = themeConfig.colorSchemes.schemes[schemeIndex];
    
    return selectedScheme || themeConfig.colorSchemes.schemes[0];
  }, [themeConfig, actualConfig.colorScheme]);
  
  if (!actualConfig.enabled) return null;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderSection = (title: string, items: (string | ResolvedItem)[], sectionKey: string) => {
    const isExpanded = expandedSection === sectionKey;
    const displayItems = isExpanded ? items : items.slice(0, 3);
    
    // Don't render section if no items
    if (!items || items.length === 0) return null;
    
    return (
      <div className="space-y-3">
        <h3 
          className="font-semibold text-base"
          style={{ color: colorScheme.text || '#000000' }}
        >
          {title}
        </h3>
        <ul className="space-y-2">
          {displayItems.map((item, index) => {
            const isObject = typeof item === 'object' && item !== null;
            const label = isObject ? (item as ResolvedItem).label : (item as string);
            const icon = isObject ? (item as ResolvedItem).icon : undefined;
            const iconType = isObject ? (item as ResolvedItem).iconType : undefined;
            return (
              <li 
                key={index} 
                className="text-sm flex items-center gap-2"
                style={{ color: colorScheme.textSecondary || colorScheme.text || '#666666' }}
              >
                {icon && (
                  <IconRenderer icon={icon} iconType={iconType as any} className="h-4 w-4" />
                )}
                <span>{label}</span>
              </li>
            );
          })}
        </ul>
        {items.length > 3 && actualConfig.showMoreButton && (
          <button
            onClick={() => toggleSection(sectionKey)}
            className="text-sm font-medium underline hover:no-underline flex items-center gap-1"
            style={{ color: colorScheme.link || '#0066CC' }}
          >
            {isExpanded ? 'Show less' : `Show more`}
            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>
    );
  };

  // Build House Rules from room data if available
  const resolvedHouseRules = useMemo(() => {
    const rules: (string | ResolvedItem)[] = [];
    let hr = roomData?.houseRules as any;
    if (hr) {
      // Log available keys to help diagnose mismatches
      if (typeof hr === 'object' && !Array.isArray(hr)) {
        try { console.debug('[RoomThingsPreview] houseRules keys:', Object.keys(hr)); } catch {}
      }

      // Helper to read boolean flags using several key variants
      const readFlag = (obj: any, key: string) => {
        if (!obj) return undefined;
        const snake = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // smokingAllowed -> smoking_allowed
        const pascal = key.charAt(0).toUpperCase() + key.slice(1);   // SmokingAllowed
        const lower = key.toLowerCase();
        const candidates = [key, snake, pascal, lower];
        for (const k of candidates) {
          if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
        }
        return undefined;
      };

      if (typeof hr === 'string') {
        const trimmed = hr.trim();
        // If the string looks like JSON, parse it first
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed);
            hr = parsed;
          } catch {
            // Fallback to CSV splitting if not valid JSON
            rules.push(
              ...trimmed
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean)
            );
          }
        } else {
          // Plain CSV string
          rules.push(
            ...trimmed
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          );
        }
      } else if (Array.isArray(hr)) {
        rules.push(...hr.filter((s: any) => typeof s === 'string' && s.trim()).map((s: string) => s.trim()));
      } else if (typeof hr === 'object') {
        // If catalog options exist, respect order + labels; otherwise, fall back to object keys
        if (houseRulesOptions.length > 0) {
          let order: string[] = [];
          try {
            const ls = localStorage.getItem('room_houseRulesOrder');
            if (ls) order = JSON.parse(ls);
          } catch {}
          if (!Array.isArray(order) || order.length === 0) {
            order = Array.isArray((roomData as any)?.houseRulesOrder)
              ? ((roomData as any).houseRulesOrder as string[])
              : [];
          }
          const orderedValues = [
            ...order.filter((v) => houseRulesOptions.some(o => o.value === v)),
            ...houseRulesOptions.map(o => o.value).filter(v => !order.includes(v))
          ];
          orderedValues.forEach((valueKey) => {
            const opt = houseRulesOptions.find(o => o.value === valueKey) as any;
            const value = readFlag(hr, String(valueKey));
            if (value === true) {
              rules.push({ key: String(valueKey), label: opt?.label || String(valueKey), icon: opt?.icon, iconType: opt?.iconType });
            } else if (value === false && String(valueKey).includes('Allowed')) {
              const noLabel = (opt?.label || String(valueKey))
                .replace('Se permite', 'No se permite')
                .replace('Se permiten', 'No se permiten')
                .replace('Allowed', 'not allowed')
                .replace('allowed', 'not allowed');
              rules.push({ key: `no_${String(valueKey)}`, label: noLabel, icon: opt?.icon, iconType: opt?.iconType });
            }
          });
        } else {
          // Fallback: enumerate object keys and include truthy flags
          Object.keys(hr).forEach((k) => {
            const value = readFlag(hr, k);
            if (value === true) {
              rules.push({ key: k, label: k });
            }
          });
        }
      }
    }
    // Debug current resolution path
    if (typeof window !== 'undefined') {
      try { console.debug('[RoomThingsPreview] Resolved house rules:', rules); } catch {}
    }
    return rules; // Do not fallback to config; show only real room data
  }, [roomData, houseRulesOptions, actualConfig.houseRules]);

  // Build Safety & Property from room data if available
  const resolvedSafetyProperty = useMemo(() => {
    const safety: (string | ResolvedItem)[] = [];
    const sp = roomData?.safetyAndProperty;
    if (sp) {
      if (typeof sp === 'string') {
        const trimmed = sp.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              safety.push(...parsed.filter((s: any) => typeof s === 'string' && s.trim()).map((s: string) => s.trim()));
            }
          } catch {
            safety.push(...trimmed.split(',').map(s => s.trim()).filter(Boolean));
          }
        } else {
          safety.push(...trimmed.split(',').map(s => s.trim()).filter(Boolean));
        }
      } else if (Array.isArray(sp)) {
        safety.push(...sp.filter((s: any) => typeof s === 'string' && s.trim()).map((s: string) => s.trim()));
      } else if (typeof sp === 'object') {
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
          let order: string[] = [];
          try {
            const ls = localStorage.getItem('room_safetyAndPropertyOrder');
            if (ls) order = JSON.parse(ls);
          } catch {}
          if (!Array.isArray(order) || order.length === 0) {
            order = Array.isArray((roomData as any)?.safetyAndPropertyOrder)
              ? ((roomData as any).safetyAndPropertyOrder as string[])
              : [];
          }
          const orderedValues = [
            ...order.filter((v) => safetyOptions.some(o => o.value === v)),
            ...safetyOptions.map(o => o.value).filter(v => !order.includes(v))
          ];
          orderedValues.forEach((valueKey) => {
            const opt = safetyOptions.find(o => o.value === valueKey) as any;
            const value = readFlag(sp as any, String(valueKey));
            if (value === true) safety.push({ key: String(valueKey), label: opt?.label || String(valueKey), icon: opt?.icon, iconType: opt?.iconType });
          });
        } else {
          Object.keys(sp).forEach((k) => {
            const value = readFlag(sp as any, k);
            if (value === true) safety.push({ key: k, label: k });
          });
        }
      }
    }
    // Additional custom safety text
    if (roomData?.safetyFeatures) {
      if (typeof roomData.safetyFeatures === 'string') safety.push(roomData.safetyFeatures);
      else if (Array.isArray(roomData.safetyFeatures)) safety.push(...roomData.safetyFeatures);
    }
    return safety; // Do not fallback to config; show only real room data
  }, [roomData, safetyOptions, actualConfig.safetyProperty]);

  // Build Cancellation Policy from room data if available
  const resolvedCancellationPolicy = useMemo(() => {
    const policies: (string | ResolvedItem)[] = [];
    const cp = roomData?.cancellationPolicy;
    if (cp && typeof cp === 'object') {
      // Ignore legacy cp.type select; we now rely solely on catalog toggles and optional description
      if (cp.description) policies.push(cp.description);
      let order: string[] = [];
      try {
        const ls = localStorage.getItem('room_cancellationPolicyOrder');
        if (ls) order = JSON.parse(ls);
      } catch {}
      if (!Array.isArray(order) || order.length === 0) {
        order = Array.isArray((roomData as any)?.cancellationPolicyOrder)
          ? ((roomData as any).cancellationPolicyOrder as string[])
          : [];
      }
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
        const orderedValues = [
          ...order.filter((v) => cancellationOptions.some(o => o.value === v)),
          ...cancellationOptions.map(o => o.value).filter(v => !order.includes(v))
        ];
        orderedValues.forEach((valueKey) => {
          const opt = cancellationOptions.find(o => o.value === valueKey) as any;
          const value = readFlag(cp as any, String(valueKey));
          if (value === true) policies.push({ key: String(valueKey), label: opt?.label || String(valueKey), icon: opt?.icon, iconType: opt?.iconType });
        });
      } else {
        Object.keys(cp).forEach((k) => {
          const value = readFlag(cp as any, k);
          if (k !== 'type' && k !== 'description' && value === true) policies.push({ key: k, label: k });
        });
      }
    }
    return policies; // Do not fallback to config; show only real room data
  }, [roomData, cancellationOptions, actualConfig.cancellationPolicy]);

  // Check if any section has data
  const hasAnyData = (resolvedHouseRules && resolvedHouseRules.length > 0) ||
                     (resolvedSafetyProperty && resolvedSafetyProperty.length > 0) ||
                     (resolvedCancellationPolicy && resolvedCancellationPolicy.length > 0);

  if (!hasAnyData && !isEditor) {
    // Don't render anything if there's no data and we're not in editor
    return null;
  }

  return (
    <div 
      className="py-12 px-4 md:px-6 lg:px-8"
      style={{
        borderTop: `1px solid ${colorScheme.border || '#E5E5E5'}`,
        backgroundColor: colorScheme.background || '#FFFFFF'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <h2 
          className="text-2xl font-semibold mb-8"
          style={{ color: colorScheme.text || '#000000' }}
        >
          {actualConfig.title}
        </h2>
        
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-1 md:grid-cols-3 gap-8 md:gap-12'}`}>
          {/* House Rules */}
          {resolvedHouseRules && resolvedHouseRules.length > 0 && (
            <div>
              {renderSection('House rules', resolvedHouseRules, 'houseRules')}
            </div>
          )}

          {/* Safety & Property */}
          {resolvedSafetyProperty && resolvedSafetyProperty.length > 0 && (
            <div>
              {renderSection('Safety & property', resolvedSafetyProperty, 'safetyProperty')}
            </div>
          )}

          {/* Cancellation Policy */}
          {resolvedCancellationPolicy && resolvedCancellationPolicy.length > 0 && (
            <div>
              {renderSection('Cancellation policy', resolvedCancellationPolicy, 'cancellationPolicy')}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
