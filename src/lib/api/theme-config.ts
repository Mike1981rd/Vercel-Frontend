/**
 * API Client for Global Theme Configuration
 * Implements modular endpoints to avoid large JSON transfers
 */

import { api } from '@/lib/api';
import type { 
  GlobalThemeConfig,
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
// No more conversions needed!

const BASE_URL = '/global-theme-config';

/**
 * Theme Configuration API Service
 */
export const themeConfigApi = {
  /**
   * Get complete theme configuration for a company
   */
  async getByCompanyId(companyId: number): Promise<GlobalThemeConfig> {
    const response = await api.get(`${BASE_URL}/company/${companyId}`);
    return response.data as GlobalThemeConfig;
  },

  // Individual module getters for optimized loading
  async getAppearance(companyId: number): Promise<AppearanceConfig> {
    const response = await api.get(`${BASE_URL}/company/${companyId}/appearance`);
    return response.data as AppearanceConfig;
  },

  async getTypography(companyId: number): Promise<TypographyConfig> {
    const response = await api.get(`${BASE_URL}/company/${companyId}/typography`);
    return response.data as TypographyConfig;
  },

  async getColorSchemes(companyId: number): Promise<ColorSchemesConfig> {
    const response = await api.get(`${BASE_URL}/company/${companyId}/color-schemes`);
    return response.data as ColorSchemesConfig;
  },

  async getProductCards(companyId: number): Promise<ProductCardsConfig> {
    const response = await api.get(`${BASE_URL}/company/${companyId}/product-cards`);
    return response.data as ProductCardsConfig;
  },

  async getProductBadges(companyId: number): Promise<ProductBadgesConfig> {
    const response = await api.get(`${BASE_URL}/company/${companyId}/product-badges`);
    return response.data as ProductBadgesConfig;
  },

  async getCart(companyId: number): Promise<CartConfig> {
    const response = await api.get(`${BASE_URL}/company/${companyId}/cart`);
    return response.data as CartConfig;
  },

  async getFavicon(companyId: number): Promise<FaviconConfig> {
    const response = await api.get(`${BASE_URL}/company/${companyId}/favicon`);
    return response.data as FaviconConfig;
  },

  async getNavigation(companyId: number): Promise<NavigationConfig> {
    const response = await api.get(`${BASE_URL}/company/${companyId}/navigation`);
    return response.data as NavigationConfig;
  },

  async getSocialMedia(companyId: number): Promise<SocialMediaConfig> {
    const response = await api.get(`${BASE_URL}/company/${companyId}/social-media`);
    return response.data as SocialMediaConfig;
  },

  async getSwatches(companyId: number): Promise<SwatchesConfig> {
    const response = await api.get(`${BASE_URL}/company/${companyId}/swatches`);
    return response.data as SwatchesConfig;
  },

  /**
   * Update complete theme configuration
   */
  async updateComplete(companyId: number, config: GlobalThemeConfig): Promise<GlobalThemeConfig> {
    const response = await api.put(`${BASE_URL}/company/${companyId}`, config);
    return response.data as GlobalThemeConfig;
  },

  /**
   * Update individual modules using PATCH for optimal performance
   */
  async updateAppearance(companyId: number, appearance: AppearanceConfig): Promise<AppearanceConfig> {
    const response = await api.patch(`${BASE_URL}/company/${companyId}/appearance`, appearance);
    return response.data as AppearanceConfig;
  },

  async updateTypography(companyId: number, typography: TypographyConfig): Promise<TypographyConfig> {
    console.log('Sending typography to API:', JSON.stringify(typography, null, 2));
    
    try {
      const response = await api.patch(`${BASE_URL}/company/${companyId}/typography`, typography);
      console.log('Received typography from API:', JSON.stringify(response.data, null, 2));
      
      return response.data as TypographyConfig;
    } catch (error: any) {
      console.error('Typography update error:', error.response?.data || error.message);
      throw error;
    }
  },

  async updateColorSchemes(companyId: number, colorSchemes: ColorSchemesConfig): Promise<ColorSchemesConfig> {
    const response = await api.patch(`${BASE_URL}/company/${companyId}/color-schemes`, colorSchemes);
    return response.data as ColorSchemesConfig;
  },

  async updateProductCards(companyId: number, productCards: ProductCardsConfig): Promise<ProductCardsConfig> {
    const response = await api.patch(`${BASE_URL}/company/${companyId}/product-cards`, productCards);
    return response.data as ProductCardsConfig;
  },

  async updateProductBadges(companyId: number, productBadges: ProductBadgesConfig): Promise<ProductBadgesConfig> {
    console.log('[API] Sending product badges update:', productBadges);
    const response = await api.patch(`${BASE_URL}/company/${companyId}/product-badges`, productBadges);
    console.log('[API] Received product badges response:', response.data);
    return response.data as ProductBadgesConfig;
  },

  async updateCart(companyId: number, cart: CartConfig): Promise<CartConfig> {
    console.log('[Cart] Sending to API:', cart);
    const response = await api.patch(`${BASE_URL}/company/${companyId}/cart`, cart);
    console.log('[Cart] Received from API:', response.data);
    return response.data as CartConfig;
  },

  async updateFavicon(companyId: number, favicon: FaviconConfig): Promise<FaviconConfig> {
    const response = await api.patch(`${BASE_URL}/company/${companyId}/favicon`, favicon);
    return response.data as FaviconConfig;
  },

  async updateNavigation(companyId: number, navigation: NavigationConfig): Promise<NavigationConfig> {
    const response = await api.patch(`${BASE_URL}/company/${companyId}/navigation`, navigation);
    return response.data as NavigationConfig;
  },

  async updateSocialMedia(companyId: number, socialMedia: SocialMediaConfig): Promise<SocialMediaConfig> {
    console.log('[Social Media] Sending to API:', JSON.stringify(socialMedia, null, 2));
    
    try {
      const response = await api.patch(`${BASE_URL}/company/${companyId}/social-media`, socialMedia);
      console.log('[Social Media] Received from API:', response.data);
      return response.data as SocialMediaConfig;
    } catch (error: any) {
      console.error('[Social Media] Update error:', error.response?.data || error.message);
      console.error('[Social Media] Full error response:', error.response);
      throw error;
    }
  },

  async updateSwatches(companyId: number, swatches: SwatchesConfig): Promise<SwatchesConfig> {
    const response = await api.patch(`${BASE_URL}/company/${companyId}/swatches`, swatches);
    return response.data as SwatchesConfig;
  },

  /**
   * Special operations
   */
  async publish(companyId: number): Promise<{ message: string }> {
    const response = await api.post(`${BASE_URL}/company/${companyId}/publish`);
    return response.data as { message: string };
  },

  async createDraft(companyId: number): Promise<GlobalThemeConfig> {
    const response = await api.post(`${BASE_URL}/company/${companyId}/create-draft`);
    return response.data as GlobalThemeConfig;
  },

  async resetModule(companyId: number, moduleName: string): Promise<{ message: string }> {
    const response = await api.post(`${BASE_URL}/company/${companyId}/reset-module/${moduleName}`);
    return response.data as { message: string };
  },

  async resetAll(companyId: number): Promise<GlobalThemeConfig> {
    const response = await api.post(`${BASE_URL}/company/${companyId}/reset-all`);
    return response.data as GlobalThemeConfig;
  }
};

export default themeConfigApi;