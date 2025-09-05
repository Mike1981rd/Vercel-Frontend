'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useCompany } from '@/hooks/useCompany';
import { HeaderConfig } from '@/types/components/header';
import { 
  getStructuralComponents, 
  updateHeaderConfig as updateHeaderConfigApi,
  updateAnnouncementBarConfig,
  updateFooterConfig,
  updateCartDrawerConfig,
  updateWhatsAppWidgetConfig,
  publishStructuralComponents
} from '@/lib/api/structural-components';
import toast from 'react-hot-toast';

export interface StructuralComponentsConfig {
  header?: HeaderConfig;
  announcementBar?: any;
  footer?: any;
  cartDrawer?: any;
  whatsAppWidget?: any;
}

interface StructuralComponentsContextType {
  config: StructuralComponentsConfig;
  loading: boolean;
  error: string | null;
  hasChanges: boolean;
  headerConfig?: HeaderConfig;
  updateHeaderConfigLocal: (config: HeaderConfig) => void;
  updateAnnouncementBarConfigLocal: (config: any) => void;
  updateFooterConfigLocal: (config: any) => void;
  updateCartDrawerConfigLocal: (config: any) => void;
  updateWhatsAppWidgetConfigLocal: (config: any) => void;
  publish: () => Promise<void>;
  refresh: () => Promise<void>;
}

const StructuralComponentsContext = createContext<StructuralComponentsContextType | null>(null);

export function StructuralComponentsProvider({ children }: { children: React.ReactNode }) {
  const { company } = useCompany();
  const [config, setConfig] = useState<StructuralComponentsConfig>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch structural components configuration
  const fetchConfig = useCallback(async () => {
    if (!company?.id) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await getStructuralComponents(company.id);
      
      // Parse JSON strings to objects
      const parsedConfig: StructuralComponentsConfig = {
        header: data.headerConfig ? JSON.parse(data.headerConfig) : undefined,
        announcementBar: data.announcementBarConfig ? JSON.parse(data.announcementBarConfig) : undefined,
        footer: data.footerConfig ? JSON.parse(data.footerConfig) : undefined,
        cartDrawer: data.cartDrawerConfig ? JSON.parse(data.cartDrawerConfig) : undefined,
        whatsAppWidget: data.whatsAppWidgetConfig ? JSON.parse(data.whatsAppWidgetConfig) : undefined,
      };
      
      setConfig(parsedConfig);
      // Reset hasChanges when fetching fresh config
      setHasChanges(false);
    } catch (err) {
      console.error('Error fetching structural components:', err);
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  // Update header configuration locally (without saving to backend)
  const updateHeaderConfigLocal = useCallback((headerConfig: HeaderConfig) => {
    console.log('[CRITICAL] updateHeaderConfigLocal - Setting hasChanges to TRUE');
    setHasChanges(true);
    setConfig(prev => ({
      ...prev,
      header: headerConfig
    }));
  }, []);

  // Update announcement bar configuration locally (without saving to backend)
  const updateAnnouncementBarConfigLocal = useCallback((announcementBarConfig: any) => {
    console.log('[CRITICAL] updateAnnouncementBarConfigLocal - Setting hasChanges to TRUE', announcementBarConfig);
    setHasChanges(true);
    setConfig(prev => ({
      ...prev,
      announcementBar: announcementBarConfig
    }));
  }, []);

  // Update footer configuration locally (without saving to backend)
  const updateFooterConfigLocal = useCallback((footerConfig: any) => {
    console.log('[CRITICAL] updateFooterConfigLocal - Setting hasChanges to TRUE', footerConfig);
    setHasChanges(true);
    setConfig(prev => ({
      ...prev,
      footer: footerConfig
    }));
  }, []);

  // Update cart drawer configuration locally (without saving to backend)
  const updateCartDrawerConfigLocal = useCallback((cartDrawerConfig: any) => {
    console.log('[CRITICAL] updateCartDrawerConfigLocal - Setting hasChanges to TRUE', cartDrawerConfig);
    setHasChanges(true);
    setConfig(prev => ({
      ...prev,
      cartDrawer: cartDrawerConfig
    }));
  }, []);

  // Update WhatsApp widget configuration locally (without saving to backend)
  const updateWhatsAppWidgetConfigLocal = useCallback((whatsAppWidgetConfig: any) => {
    console.log('[CRITICAL] updateWhatsAppWidgetConfigLocal - Setting hasChanges to TRUE', whatsAppWidgetConfig);
    setHasChanges(true);
    setConfig(prev => ({
      ...prev,
      whatsAppWidget: whatsAppWidgetConfig
    }));
  }, []);

  // Publish all structural components
  const publish = useCallback(async (): Promise<void> => {
    if (!company?.id) {
      return;
    }

    setLoading(true);
    
    try {
      // Save all pending changes
      if (config.header) {
        await updateHeaderConfigApi(company.id, config.header);
      }
      if (config.announcementBar) {
        await updateAnnouncementBarConfig(company.id, config.announcementBar);
      }
      if (config.footer) {
        await updateFooterConfig(company.id, config.footer);
      }
      if (config.cartDrawer) {
        await updateCartDrawerConfig(company.id, config.cartDrawer);
      }
      if (config.whatsAppWidget) {
        await updateWhatsAppWidgetConfig(company.id, config.whatsAppWidget);
      }
      
      // Then publish
      await publishStructuralComponents(company.id);
      
      // FORCE reset the hasChanges state after successful save
      // Use setTimeout to ensure it happens after any pending state updates
      setTimeout(() => {
        console.log('[CRITICAL] Force resetting hasChanges to FALSE after save');
        setHasChanges(false);
      }, 100);
      
      // Don't show toast here - let the calling component show it in the correct language
      // toast.success('Changes saved successfully');
      
      // Return success (void)
      
    } catch (err) {
      console.error('Error in publish:', err);
      // Don't show toast here either - let the calling component handle errors
      // toast.error('Failed to save changes');
      // Don't reset hasChanges on error so user can retry
    } finally {
      setLoading(false);
    }
  }, [company?.id, config]);

  // Auto-fetch on mount and when company changes
  useEffect(() => {
    if (company?.id) {
      fetchConfig();
    }
  }, [company?.id, fetchConfig]);

  const value: StructuralComponentsContextType = {
    config,
    loading,
    error,
    hasChanges,
    headerConfig: config.header,
    updateHeaderConfigLocal,
    updateAnnouncementBarConfigLocal,
    updateFooterConfigLocal,
    updateCartDrawerConfigLocal,
    updateWhatsAppWidgetConfigLocal,
    publish,
    refresh: fetchConfig,
  };

  return (
    <StructuralComponentsContext.Provider value={value}>
      {children}
    </StructuralComponentsContext.Provider>
  );
}

export function useStructuralComponents() {
  const context = useContext(StructuralComponentsContext);
  if (!context) {
    throw new Error('useStructuralComponents must be used within StructuralComponentsProvider');
  }
  return context;
}