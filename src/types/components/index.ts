/**
 * Components Configuration Index
 * Central export point for all structural component configurations
 */

// Export all component configurations
export * from './header';
export * from './announcement-bar';
export * from './footer';
export * from './cart-drawer';

// Import types for the global components configuration
import { HeaderConfig, defaultHeaderConfig } from './header';
import { AnnouncementBarConfig, defaultAnnouncementBarConfig } from './announcement-bar';
import { FooterConfig, defaultFooterConfig } from './footer';
import { CartDrawerConfig, defaultCartDrawerConfig } from './cart-drawer';

/**
 * Complete structural components configuration
 * These components appear globally across the website
 */
export interface StructuralComponentsConfig {
  /** Header configuration */
  header: HeaderConfig;
  
  /** Announcement bar configuration */
  announcementBar: AnnouncementBarConfig;
  
  /** Footer configuration */
  footer: FooterConfig;
  
  /** Cart drawer configuration */
  cartDrawer: CartDrawerConfig;
  
  /** Last updated timestamp */
  updatedAt?: string;
  
  /** Published version timestamp */
  publishedAt?: string;
}

/**
 * Default structural components configuration
 */
export const defaultStructuralComponents: StructuralComponentsConfig = {
  header: defaultHeaderConfig,
  announcementBar: defaultAnnouncementBarConfig,
  footer: defaultFooterConfig,
  cartDrawer: defaultCartDrawerConfig
};