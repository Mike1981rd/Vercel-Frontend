/**
 * API client for structural components (Header, Footer, Announcement Bar, Cart Drawer)
 */

import { apiClient } from './client';
import { HeaderConfig } from '@/types/components/header';

export interface StructuralComponentsDto {
  id?: number;
  companyId: number;
  headerConfig: string; // JSON string
  announcementBarConfig: string; // JSON string
  footerConfig: string; // JSON string
  cartDrawerConfig: string; // JSON string
  whatsAppWidgetConfig?: string; // JSON string
  isActive?: boolean;
  isPublished?: boolean;
  publishedAt?: string;
  version?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateComponentDto {
  componentType: 'header' | 'announcementbar' | 'footer' | 'cartdrawer' | 'whatsappwidget';
  config: string;
  notes?: string;
}

/**
 * Get structural components configuration for a company
 */
export async function getStructuralComponents(companyId: number): Promise<StructuralComponentsDto> {
  const response = await apiClient.get(`/structural-components/company/${companyId}`);
  return response.data;
}

/**
 * Get published structural components for a company
 */
export async function getPublishedStructuralComponents(companyId: number): Promise<StructuralComponentsDto> {
  const response = await apiClient.get(`/structural-components/company/${companyId}/published`);
  return response.data;
}

/**
 * Update header configuration
 */
export async function updateHeaderConfig(companyId: number, config: HeaderConfig): Promise<StructuralComponentsDto> {
  const updateDto: UpdateComponentDto = {
    componentType: 'header',
    config: JSON.stringify(config)
  };
  
  const response = await apiClient.put(
    `/structural-components/company/${companyId}/component`,
    updateDto
  );
  return response.data;
}

/**
 * Update announcement bar configuration
 */
export async function updateAnnouncementBarConfig(companyId: number, config: any): Promise<StructuralComponentsDto> {
  const updateDto: UpdateComponentDto = {
    componentType: 'announcementbar',
    config: JSON.stringify(config)
  };
  
  const response = await apiClient.put(
    `/structural-components/company/${companyId}/component`,
    updateDto
  );
  return response.data;
}

/**
 * Update footer configuration
 */
export async function updateFooterConfig(companyId: number, config: any): Promise<StructuralComponentsDto> {
  const updateDto: UpdateComponentDto = {
    componentType: 'footer',
    config: JSON.stringify(config)
  };
  
  const response = await apiClient.put(
    `/structural-components/company/${companyId}/component`,
    updateDto
  );
  return response.data;
}

/**
 * Update image banner configuration
 */
export async function updateImageBannerConfig(companyId: number, config: any): Promise<StructuralComponentsDto> {
  const updateDto: UpdateComponentDto = {
    componentType: 'imagebanner' as any,
    config: JSON.stringify(config)
  };
  
  const response = await apiClient.put(
    `/structural-components/company/${companyId}/component`,
    updateDto
  );
  return response.data;
}

/**
 * Update cart drawer configuration
 */
export async function updateCartDrawerConfig(companyId: number, config: any): Promise<StructuralComponentsDto> {
  const updateDto: UpdateComponentDto = {
    componentType: 'cartdrawer',
    config: JSON.stringify(config)
  };
  
  const response = await apiClient.put(
    `/structural-components/company/${companyId}/component`,
    updateDto
  );
  return response.data;
}

/**
 * Update WhatsApp widget configuration
 */
export async function updateWhatsAppWidgetConfig(companyId: number, config: any): Promise<StructuralComponentsDto> {
  const updateDto: UpdateComponentDto = {
    componentType: 'whatsappwidget',
    config: JSON.stringify(config)
  };
  
  const response = await apiClient.put(
    `/structural-components/company/${companyId}/component`,
    updateDto
  );
  return response.data;
}

/**
 * Update all structural components at once
 */
export async function updateAllStructuralComponents(
  companyId: number,
  config: {
    headerConfig?: string;
    announcementBarConfig?: string;
    footerConfig?: string;
    cartDrawerConfig?: string;
    notes?: string;
  }
): Promise<StructuralComponentsDto> {
  const response = await apiClient.put(
    `/structural-components/company/${companyId}`,
    config
  );
  return response.data;
}

/**
 * Publish structural components
 */
export async function publishStructuralComponents(
  companyId: number,
  createBackup: boolean = true
): Promise<StructuralComponentsDto> {
  const response = await apiClient.post(
    `/structural-components/company/${companyId}/publish`,
    { createBackup }
  );
  return response.data;
}

/**
 * Unpublish structural components
 */
export async function unpublishStructuralComponents(companyId: number): Promise<StructuralComponentsDto> {
  const response = await apiClient.post(`/structural-components/company/${companyId}/unpublish`);
  return response.data;
}

/**
 * Create draft from published version
 */
export async function createDraftFromPublished(companyId: number): Promise<StructuralComponentsDto> {
  const response = await apiClient.post(`/structural-components/company/${companyId}/create-draft`);
  return response.data;
}

/**
 * Reset component to default
 */
export async function resetComponentToDefault(
  companyId: number,
  componentType: 'header' | 'announcementbar' | 'footer' | 'cartdrawer'
): Promise<StructuralComponentsDto> {
  const response = await apiClient.post(
    `/structural-components/company/${companyId}/reset/${componentType}`
  );
  return response.data;
}

/**
 * Reset all components to default
 */
export async function resetAllComponentsToDefault(companyId: number): Promise<StructuralComponentsDto> {
  const response = await apiClient.post(`/structural-components/company/${companyId}/reset-all`);
  return response.data;
}

/**
 * Get component preview HTML
 */
export async function getComponentPreview(
  companyId: number,
  componentType: string,
  config: string
): Promise<string> {
  const response = await apiClient.post(
    `/structural-components/company/${companyId}/preview`,
    { componentType, config }
  );
  return response.data;
}

/**
 * Get component CSS
 */
export async function getComponentCss(
  companyId: number,
  componentType: string
): Promise<string> {
  const response = await apiClient.get(
    `/structural-components/company/${companyId}/css/${componentType}`
  );
  return response.data;
}

/**
 * Validate component configuration
 */
export async function validateComponentConfig(
  componentType: string,
  config: string
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
  const response = await apiClient.post('/structural-components/validate', {
    componentType,
    config
  });
  return response.data;
}

/**
 * Get version history
 */
export async function getVersionHistory(
  companyId: number,
  limit: number = 10
): Promise<StructuralComponentsDto[]> {
  const response = await apiClient.get(
    `/structural-components/company/${companyId}/versions?limit=${limit}`
  );
  return response.data;
}