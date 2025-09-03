import { useState, useEffect } from 'react';
import { ColorSchemesConfig } from '@/types/theme/colorSchemes';
import { useCompany } from '@/contexts/CompanyContext';
import useThemeConfigStore from '@/stores/useThemeConfigStore';

export function useColorSchemes() {
  // Get color schemes from Zustand store instead of fetching separately
  const { 
    config, 
    loading: storeLoading, 
    error: storeError,
    fetchConfig 
  } = useThemeConfigStore();
  
  const { company } = useCompany();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    // Only fetch if we don't have config and we have a company
    if (company?.id && !config) {
      fetchConfig(company.id).finally(() => {
        setLocalLoading(false);
      });
    } else {
      setLocalLoading(false);
    }
  }, [company?.id, config, fetchConfig]);

  // Return the color schemes from the store's config
  return { 
    colorSchemes: config?.colorSchemes || null,
    loading: storeLoading.global || localLoading,
    error: storeError,
    refetch: () => company?.id ? fetchConfig(company.id) : Promise.resolve()
  };
}