/**
 * Custom hook for using Global Theme Configuration
 * Provides a simplified interface to the theme config store
 */

import { useEffect, useCallback } from 'react';
import { useCompany } from '@/hooks/useCompany';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import type {
  AppearanceConfig,
  TypographyConfig,
  ColorSchemesConfig,
  ProductCardsConfig,
  ProductBadgesConfig,
  CartConfig,
  FaviconConfig,
  NavigationConfig,
  SocialMediaConfig,
  SwatchesConfig
} from '@/types/theme';

/**
 * Hook for managing global theme configuration
 * Automatically handles company context and provides optimized updates
 */
export function useGlobalThemeConfig() {
  const { company } = useCompany();
  const {
    config,
    loading,
    error,
    hasUnsavedChanges,
    fetchConfig,
    updateAppearance,
    updateTypography,
    updateColorSchemes,
    updateProductCards,
    updateProductBadges,
    updateCart,
    updateFavicon,
    updateNavigation,
    updateSocialMedia,
    updateSwatches,
    publishConfig,
    createDraft,
    resetModule,
    resetAll,
    clearError,
  } = useThemeConfigStore();

  // Auto-fetch configuration when company changes
  useEffect(() => {
    if (company?.id) {
      fetchConfig(company.id);
    }
  }, [company?.id, fetchConfig]);

  // Memoized update functions that don't require companyId
  const updateThemeAppearance = useCallback(
    (appearance: AppearanceConfig) => {
      if (!company?.id) {
        // No company context available
        return;
      }
      return updateAppearance(appearance);
    },
    [company?.id, updateAppearance]
  );

  const updateThemeTypography = useCallback(
    (typography: TypographyConfig) => {
      if (!company?.id) {
        // No company context available
        return;
      }
      return updateTypography(typography);
    },
    [company?.id, updateTypography]
  );

  const updateThemeColorSchemes = useCallback(
    (colorSchemes: ColorSchemesConfig) => {
      if (!company?.id) {
        // No company context available
        return;
      }
      return updateColorSchemes(colorSchemes);
    },
    [company?.id, updateColorSchemes]
  );

  const updateThemeProductCards = useCallback(
    (productCards: ProductCardsConfig) => {
      if (!company?.id) {
        // No company context available
        return;
      }
      return updateProductCards(productCards);
    },
    [company?.id, updateProductCards]
  );

  const updateThemeProductBadges = useCallback(
    (productBadges: ProductBadgesConfig) => {
      if (!company?.id) {
        // No company context available
        return;
      }
      return updateProductBadges(productBadges);
    },
    [company?.id, updateProductBadges]
  );

  const updateThemeCart = useCallback(
    (cart: CartConfig) => {
      if (!company?.id) {
        // No company context available
        return;
      }
      return updateCart(cart);
    },
    [company?.id, updateCart]
  );

  const updateThemeFavicon = useCallback(
    (favicon: FaviconConfig) => {
      if (!company?.id) {
        // No company context available
        return;
      }
      return updateFavicon(favicon);
    },
    [company?.id, updateFavicon]
  );

  const updateThemeNavigation = useCallback(
    (navigation: NavigationConfig) => {
      if (!company?.id) {
        // No company context available
        return;
      }
      return updateNavigation(navigation);
    },
    [company?.id, updateNavigation]
  );

  const updateThemeSocialMedia = useCallback(
    (socialMedia: SocialMediaConfig) => {
      if (!company?.id) {
        // No company context available
        return;
      }
      return updateSocialMedia(socialMedia);
    },
    [company?.id, updateSocialMedia]
  );

  const updateThemeSwatches = useCallback(
    (swatches: SwatchesConfig) => {
      if (!company?.id) {
        // No company context available
        return;
      }
      return updateSwatches(swatches);
    },
    [company?.id, updateSwatches]
  );

  // Helper to check if any module is loading
  const isAnyModuleLoading = Object.values(loading).some(isLoading => isLoading);

  // Helper to get active color scheme
  const getActiveColorScheme = useCallback(() => {
    if (!config?.colorSchemes) return null;
    return config.colorSchemes.schemes.find(
      scheme => scheme.id === config.colorSchemes.defaultScheme
    ) || config.colorSchemes.schemes[0];
  }, [config]);

  return {
    // Configuration
    config,
    appearance: config?.appearance,
    typography: config?.typography,
    colorSchemes: config?.colorSchemes,
    productCards: config?.productCards,
    productBadges: config?.productBadges,
    cart: config?.cart,
    favicon: config?.favicon,
    navigation: config?.navigation,
    socialMedia: config?.socialMedia,
    swatches: config?.swatches,
    
    // State
    loading: loading.global,
    moduleLoading: loading,
    isAnyModuleLoading,
    error,
    hasUnsavedChanges,
    
    // Update functions
    updateAppearance: updateThemeAppearance,
    updateTypography: updateThemeTypography,
    updateColorSchemes: updateThemeColorSchemes,
    updateProductCards: updateThemeProductCards,
    updateProductBadges: updateThemeProductBadges,
    updateCart: updateThemeCart,
    updateFavicon: updateThemeFavicon,
    updateNavigation: updateThemeNavigation,
    updateSocialMedia: updateThemeSocialMedia,
    updateSwatches: updateThemeSwatches,
    
    // Special operations
    publishConfig,
    createDraft,
    resetModule,
    resetAll,
    
    // Utilities
    clearError,
    getActiveColorScheme,
    refetch: () => company?.id && fetchConfig(company.id),
  };
}

/**
 * Hook for using a specific module of the theme configuration
 * Provides focused loading states and updates for a single module
 */
export function useThemeModule<T extends keyof typeof moduleMap>(
  moduleName: T
): {
  data: ReturnType<typeof moduleMap[T]['selector']>;
  loading: boolean;
  update: ReturnType<typeof moduleMap[T]['updater']>;
} {
  const hook = useGlobalThemeConfig();
  const module = moduleMap[moduleName];
  
  return {
    data: module.selector(hook) as any,
    loading: hook.moduleLoading[moduleName],
    update: module.updater(hook) as any,
  };
}

// Module mapping for typed module access
const moduleMap = {
  appearance: {
    selector: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.appearance,
    updater: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.updateAppearance,
  },
  typography: {
    selector: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.typography,
    updater: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.updateTypography,
  },
  colorSchemes: {
    selector: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.colorSchemes,
    updater: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.updateColorSchemes,
  },
  productCards: {
    selector: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.productCards,
    updater: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.updateProductCards,
  },
  productBadges: {
    selector: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.productBadges,
    updater: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.updateProductBadges,
  },
  cart: {
    selector: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.cart,
    updater: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.updateCart,
  },
  favicon: {
    selector: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.favicon,
    updater: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.updateFavicon,
  },
  navigation: {
    selector: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.navigation,
    updater: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.updateNavigation,
  },
  socialMedia: {
    selector: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.socialMedia,
    updater: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.updateSocialMedia,
  },
  swatches: {
    selector: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.swatches,
    updater: (hook: ReturnType<typeof useGlobalThemeConfig>) => hook.updateSwatches,
  },
} as const;

export default useGlobalThemeConfig;