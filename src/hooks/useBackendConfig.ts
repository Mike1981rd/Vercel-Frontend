import { useState, useEffect } from 'react';

interface BackendConfig {
  provider: 'azure' | 'railway' | 'local';
  apiUrl: string;
  name: string;
  color: string;
}

const BACKENDS: Record<string, BackendConfig> = {
  azure: {
    provider: 'azure',
    apiUrl: process.env.NEXT_PUBLIC_AZURE_API_URL || 'https://api.test1hotelwebsite.online/api',
    name: 'Azure',
    color: '#0078D4'
  },
  railway: {
    provider: 'railway',
    apiUrl: process.env.NEXT_PUBLIC_RAILWAY_API_URL || 'https://websitebuilderapi-production-production.up.railway.app/api',
    name: 'Railway',
    color: '#C049FF'
  },
  local: {
    provider: 'local',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api',
    name: 'Local',
    color: '#22C55E'
  }
};

export function useBackendConfig() {
  const [config, setConfig] = useState<BackendConfig>(() => {
    // Check localStorage first for runtime switching
    if (typeof window !== 'undefined') {
      const savedProvider = localStorage.getItem('backend_provider');
      if (savedProvider && BACKENDS[savedProvider]) {
        return BACKENDS[savedProvider];
      }
    }
    
    // Fall back to env variable
    const envProvider = process.env.NEXT_PUBLIC_BACKEND_PROVIDER || 'azure';
    return BACKENDS[envProvider] || BACKENDS.azure;
  });

  const switchBackend = (provider: 'azure' | 'railway' | 'local') => {
    const newConfig = BACKENDS[provider];
    if (newConfig) {
      setConfig(newConfig);
      localStorage.setItem('backend_provider', provider);
      localStorage.setItem('API_URL', newConfig.apiUrl);
      
      // Log the switch for tracking
      console.log(`🔄 Switched to ${newConfig.name} backend:`, newConfig.apiUrl);
      
      // Optional: Reload the page to ensure clean state
      if (confirm(`Switch to ${newConfig.name} backend? Page will reload.`)) {
        window.location.reload();
      }
    }
  };

  // Performance tracking
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_TRACKING === 'true') {
      console.log(`📊 Current Backend: ${config.name} (${config.apiUrl})`);
    }
  }, [config]);

  return {
    config,
    switchBackend,
    backends: Object.values(BACKENDS)
  };
}
