/**
 * Zustand Store for Global Theme Configuration
 * Manages theme state with optimistic updates and caching
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { themeConfigApi } from '@/lib/api/theme-config';
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
  SwatchesConfig,
  defaultGlobalTheme
} from '@/types/theme';

interface ThemeConfigState {
  // Current theme configuration
  config: GlobalThemeConfig | null;
  
  // Loading states for each module
  loading: {
    global: boolean;
    appearance: boolean;
    typography: boolean;
    colorSchemes: boolean;
    productCards: boolean;
    productBadges: boolean;
    cart: boolean;
    favicon: boolean;
    navigation: boolean;
    socialMedia: boolean;
    swatches: boolean;
  };
  
  // Error state
  error: string | null;
  
  // Whether there are unsaved changes
  hasUnsavedChanges: boolean;
  
  // Current company ID
  companyId: number | null;

  // Actions
  setCompanyId: (companyId: number) => void;
  
  // Fetch operations
  fetchConfig: (companyId: number) => Promise<void>;
  fetchAppearance: (companyId: number) => Promise<void>;
  fetchTypography: (companyId: number) => Promise<void>;
  fetchColorSchemes: (companyId: number) => Promise<void>;
  fetchProductCards: (companyId: number) => Promise<void>;
  fetchProductBadges: (companyId: number) => Promise<void>;
  fetchCart: (companyId: number) => Promise<void>;
  fetchFavicon: (companyId: number) => Promise<void>;
  fetchNavigation: (companyId: number) => Promise<void>;
  fetchSocialMedia: (companyId: number) => Promise<void>;
  fetchSwatches: (companyId: number) => Promise<void>;
  
  // Update operations (optimistic)
  updateAppearance: (appearance: AppearanceConfig) => Promise<void>;
  updateTypography: (typography: TypographyConfig) => Promise<void>;
  updateColorSchemes: (colorSchemes: ColorSchemesConfig) => Promise<void>;
  updateProductCards: (productCards: ProductCardsConfig) => Promise<void>;
  updateProductBadges: (productBadges: ProductBadgesConfig) => Promise<void>;
  updateCart: (cart: CartConfig) => Promise<void>;
  updateFavicon: (favicon: FaviconConfig) => Promise<void>;
  updateNavigation: (navigation: NavigationConfig) => Promise<void>;
  updateSocialMedia: (socialMedia: SocialMediaConfig) => Promise<void>;
  updateSwatches: (swatches: SwatchesConfig) => Promise<void>;
  
  // Special operations
  publishConfig: () => Promise<void>;
  createDraft: () => Promise<void>;
  resetModule: (moduleName: string) => Promise<void>;
  resetAll: () => Promise<void>;
  
  // Utility
  clearError: () => void;
  setHasUnsavedChanges: (value: boolean) => void;
}

const useThemeConfigStore = create<ThemeConfigState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        config: null,
        loading: {
          global: false,
          appearance: false,
          typography: false,
          colorSchemes: false,
          productCards: false,
          productBadges: false,
          cart: false,
          favicon: false,
          navigation: false,
          socialMedia: false,
          swatches: false,
        },
        error: null,
        hasUnsavedChanges: false,
        companyId: null,

        // Actions
        setCompanyId: (companyId) => set((state) => {
          state.companyId = companyId;
        }),

        // Fetch complete configuration
        fetchConfig: async (companyId) => {
          set((state) => {
            state.loading.global = true;
            state.error = null;
          });
          
          try {
            const config = await themeConfigApi.getByCompanyId(companyId);
            set((state) => {
              state.config = config;
              state.companyId = companyId;
              state.loading.global = false;
              state.hasUnsavedChanges = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to fetch theme configuration';
              state.loading.global = false;
            });
          }
        },

        // Individual fetch operations
        fetchAppearance: async (companyId) => {
          set((state) => {
            state.loading.appearance = true;
          });
          
          try {
            const appearance = await themeConfigApi.getAppearance(companyId);
            set((state) => {
              if (state.config) {
                state.config.appearance = appearance;
              }
              state.loading.appearance = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.loading.appearance = false;
            });
          }
        },

        fetchTypography: async (companyId) => {
          set((state) => {
            state.loading.typography = true;
          });
          
          try {
            const typography = await themeConfigApi.getTypography(companyId);
            set((state) => {
              if (state.config) {
                state.config.typography = typography;
              }
              state.loading.typography = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.loading.typography = false;
            });
          }
        },

        fetchColorSchemes: async (companyId) => {
          set((state) => {
            state.loading.colorSchemes = true;
          });
          
          try {
            const colorSchemes = await themeConfigApi.getColorSchemes(companyId);
            set((state) => {
              if (state.config) {
                state.config.colorSchemes = colorSchemes;
              }
              state.loading.colorSchemes = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.loading.colorSchemes = false;
            });
          }
        },

        fetchProductCards: async (companyId) => {
          set((state) => {
            state.loading.productCards = true;
          });
          
          try {
            const productCards = await themeConfigApi.getProductCards(companyId);
            set((state) => {
              if (state.config) {
                state.config.productCards = productCards;
              }
              state.loading.productCards = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.loading.productCards = false;
            });
          }
        },

        fetchProductBadges: async (companyId) => {
          set((state) => {
            state.loading.productBadges = true;
          });
          
          try {
            const productBadges = await themeConfigApi.getProductBadges(companyId);
            // Product badges fetched successfully
            set((state) => {
              if (state.config) {
                state.config.productBadges = productBadges;
              }
              state.loading.productBadges = false;
            });
          } catch (error: any) {
            // Error fetching product badges
            set((state) => {
              state.error = error.message;
              state.loading.productBadges = false;
            });
          }
        },

        fetchCart: async (companyId) => {
          set((state) => {
            state.loading.cart = true;
          });
          
          try {
            const cart = await themeConfigApi.getCart(companyId);
            set((state) => {
              if (state.config) {
                state.config.cart = cart;
              }
              state.loading.cart = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.loading.cart = false;
            });
          }
        },

        fetchFavicon: async (companyId) => {
          set((state) => {
            state.loading.favicon = true;
          });
          
          try {
            const favicon = await themeConfigApi.getFavicon(companyId);
            set((state) => {
              if (state.config) {
                state.config.favicon = favicon;
              }
              state.loading.favicon = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.loading.favicon = false;
            });
          }
        },

        fetchNavigation: async (companyId) => {
          set((state) => {
            state.loading.navigation = true;
          });
          
          try {
            const navigation = await themeConfigApi.getNavigation(companyId);
            set((state) => {
              if (state.config) {
                state.config.navigation = navigation;
              }
              state.loading.navigation = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.loading.navigation = false;
            });
          }
        },

        fetchSocialMedia: async (companyId) => {
          set((state) => {
            state.loading.socialMedia = true;
          });
          
          try {
            const socialMedia = await themeConfigApi.getSocialMedia(companyId);
            set((state) => {
              if (state.config) {
                state.config.socialMedia = socialMedia;
              }
              state.loading.socialMedia = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.loading.socialMedia = false;
            });
          }
        },

        fetchSwatches: async (companyId) => {
          set((state) => {
            state.loading.swatches = true;
          });
          
          try {
            const swatches = await themeConfigApi.getSwatches(companyId);
            set((state) => {
              if (state.config) {
                state.config.swatches = swatches;
              }
              state.loading.swatches = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.loading.swatches = false;
            });
          }
        },

        // Update operations with optimistic updates
        updateAppearance: async (appearance) => {
          const { companyId, config } = get();
          if (!companyId || !config) return;

          // Optimistic update
          set((state) => {
            if (state.config) {
              state.config.appearance = appearance;
              state.hasUnsavedChanges = true;
            }
          });

          try {
            const updated = await themeConfigApi.updateAppearance(companyId, appearance);
            set((state) => {
              if (state.config) {
                state.config.appearance = updated;
                state.hasUnsavedChanges = false;
              }
            });
          } catch (error: any) {
            // Revert on error
            set((state) => {
              if (state.config && config) {
                state.config.appearance = config.appearance;
              }
              state.error = error.message;
            });
          }
        },

        updateTypography: async (typography) => {
          const { companyId, config } = get();
          if (!companyId || !config) return;

          // Store the original for rollback
          const originalTypography = config.typography;

          set((state) => {
            if (state.config) {
              state.config.typography = typography;
              state.hasUnsavedChanges = true;
            }
          });

          try {
            const updated = await themeConfigApi.updateTypography(companyId, typography);
            
            // The API already handles conversion, just use the returned value
            set((state) => {
              if (state.config) {
                state.config.typography = updated;
                state.hasUnsavedChanges = false;
              }
            });
          } catch (error: any) {
            set((state) => {
              if (state.config) {
                state.config.typography = originalTypography;
              }
              state.error = error.message;
            });
          }
        },

        updateColorSchemes: async (colorSchemes) => {
          const { companyId, config } = get();
          if (!companyId || !config) return;

          set((state) => {
            if (state.config) {
              state.config.colorSchemes = colorSchemes;
              state.hasUnsavedChanges = true;
            }
          });

          try {
            const updated = await themeConfigApi.updateColorSchemes(companyId, colorSchemes);
            set((state) => {
              if (state.config) {
                state.config.colorSchemes = updated;
                state.hasUnsavedChanges = false;
              }
            });
          } catch (error: any) {
            set((state) => {
              if (state.config && config) {
                state.config.colorSchemes = config.colorSchemes;
              }
              state.error = error.message;
            });
          }
        },

        updateProductCards: async (productCards) => {
          const { companyId, config } = get();
          if (!companyId || !config) return;

          set((state) => {
            if (state.config) {
              state.config.productCards = productCards;
              state.hasUnsavedChanges = true;
            }
          });

          try {
            const updated = await themeConfigApi.updateProductCards(companyId, productCards);
            set((state) => {
              if (state.config) {
                state.config.productCards = updated;
                state.hasUnsavedChanges = false;
              }
            });
          } catch (error: any) {
            set((state) => {
              if (state.config && config) {
                state.config.productCards = config.productCards;
              }
              state.error = error.message;
            });
          }
        },

        updateProductBadges: async (productBadges) => {
          const { companyId, config } = get();
          if (!companyId || !config) return;

          // Updating product badges
          
          // Store original for rollback
          const originalProductBadges = config.productBadges;

          set((state) => {
            if (state.config) {
              state.config.productBadges = productBadges;
              state.hasUnsavedChanges = true;
            }
          });

          try {
            const updated = await themeConfigApi.updateProductBadges(companyId, productBadges);
            // Product badges updated successfully
            
            set((state) => {
              if (state.config) {
                state.config.productBadges = updated;
                state.hasUnsavedChanges = false;
              }
            });
          } catch (error: any) {
            // Error updating product badges
            set((state) => {
              if (state.config) {
                state.config.productBadges = originalProductBadges;
              }
              state.error = error.message;
            });
            throw error;
          }
        },

        updateCart: async (cart) => {
          const { companyId, config } = get();
          if (!companyId || !config) return;

          set((state) => {
            if (state.config) {
              state.config.cart = cart;
              state.hasUnsavedChanges = true;
            }
          });

          try {
            const updated = await themeConfigApi.updateCart(companyId, cart);
            set((state) => {
              if (state.config) {
                state.config.cart = updated;
                state.hasUnsavedChanges = false;
              }
            });
          } catch (error: any) {
            set((state) => {
              if (state.config && config) {
                state.config.cart = config.cart;
              }
              state.error = error.message;
            });
          }
        },

        updateFavicon: async (favicon) => {
          const { companyId, config } = get();
          if (!companyId || !config) return;

          set((state) => {
            if (state.config) {
              state.config.favicon = favicon;
              state.hasUnsavedChanges = true;
            }
          });

          try {
            const updated = await themeConfigApi.updateFavicon(companyId, favicon);
            set((state) => {
              if (state.config) {
                state.config.favicon = updated;
                state.hasUnsavedChanges = false;
              }
            });
          } catch (error: any) {
            set((state) => {
              if (state.config && config) {
                state.config.favicon = config.favicon;
              }
              state.error = error.message;
            });
          }
        },

        updateNavigation: async (navigation) => {
          const { companyId, config } = get();
          if (!companyId || !config) return;

          set((state) => {
            if (state.config) {
              state.config.navigation = navigation;
              state.hasUnsavedChanges = true;
            }
          });

          try {
            const updated = await themeConfigApi.updateNavigation(companyId, navigation);
            set((state) => {
              if (state.config) {
                state.config.navigation = updated;
                state.hasUnsavedChanges = false;
              }
            });
          } catch (error: any) {
            set((state) => {
              if (state.config && config) {
                state.config.navigation = config.navigation;
              }
              state.error = error.message;
            });
          }
        },

        updateSocialMedia: async (socialMedia) => {
          const { companyId, config } = get();
          if (!companyId || !config) return;

          set((state) => {
            if (state.config) {
              state.config.socialMedia = socialMedia;
              state.hasUnsavedChanges = true;
            }
          });

          try {
            const updated = await themeConfigApi.updateSocialMedia(companyId, socialMedia);
            set((state) => {
              if (state.config) {
                state.config.socialMedia = updated;
                state.hasUnsavedChanges = false;
              }
            });
          } catch (error: any) {
            set((state) => {
              if (state.config && config) {
                state.config.socialMedia = config.socialMedia;
              }
              state.error = error.message;
            });
          }
        },

        updateSwatches: async (swatches) => {
          const { companyId, config } = get();
          if (!companyId || !config) return;

          set((state) => {
            if (state.config) {
              state.config.swatches = swatches;
              state.hasUnsavedChanges = true;
            }
          });

          try {
            const updated = await themeConfigApi.updateSwatches(companyId, swatches);
            set((state) => {
              if (state.config) {
                state.config.swatches = updated;
                state.hasUnsavedChanges = false;
              }
            });
          } catch (error: any) {
            set((state) => {
              if (state.config && config) {
                state.config.swatches = config.swatches;
              }
              state.error = error.message;
            });
          }
        },

        // Special operations
        publishConfig: async () => {
          const { companyId } = get();
          if (!companyId) return;

          try {
            await themeConfigApi.publish(companyId);
            set((state) => {
              state.hasUnsavedChanges = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
            });
          }
        },

        createDraft: async () => {
          const { companyId } = get();
          if (!companyId) return;

          try {
            const draft = await themeConfigApi.createDraft(companyId);
            set((state) => {
              state.config = draft;
              state.hasUnsavedChanges = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
            });
          }
        },

        resetModule: async (moduleName) => {
          const { companyId } = get();
          if (!companyId) return;

          try {
            await themeConfigApi.resetModule(companyId, moduleName);
            // Refetch the specific module
            const state = get();
            const methodName = `fetch${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}` as keyof ThemeConfigState;
            const method = state[methodName];
            if (typeof method === 'function') {
              await (method as any)(companyId);
            }
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
            });
          }
        },

        resetAll: async () => {
          const { companyId } = get();
          if (!companyId) return;

          try {
            const config = await themeConfigApi.resetAll(companyId);
            set((state) => {
              state.config = config;
              state.hasUnsavedChanges = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
            });
          }
        },

        // Utility
        clearError: () => set((state) => {
          state.error = null;
        }),

        setHasUnsavedChanges: (value) => set((state) => {
          state.hasUnsavedChanges = value;
        }),
      })),
      {
        name: 'theme-config-store',
        partialize: (state) => ({
          companyId: state.companyId,
          // Don't persist the config itself, always fetch fresh
        }),
      }
    ),
    {
      name: 'ThemeConfigStore',
    }
  )
);

export default useThemeConfigStore;