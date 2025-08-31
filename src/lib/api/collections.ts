import { PagedResult } from '@/types/common';

export interface Collection {
  id: number;
  companyId: number;
  title: string;
  description?: string;
  handle: string;
  isActive: boolean;
  image?: string;
  onlineStore: boolean;
  pointOfSale: boolean;
  facebook: boolean;
  instagram: boolean;
  tikTok: boolean;
  whatsAppBusiness: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishToSearchEngines: boolean;
  sortOrder: number;
  productCount: number;
  conditionsSummary: string;
  createdAt: string;
  updatedAt: string;
  products?: CollectionProduct[];
}

export interface CollectionListItem {
  id: number;
  title: string;
  handle: string;
  image?: string;
  isActive: boolean;
  productCount: number;
  conditionsSummary: string;
  updatedAt: string;
}

export interface CollectionProduct {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImage?: string;
  position: number;
  isFeatured: boolean;
  addedAt: string;
}

export interface CreateCollectionDto {
  title: string;
  description?: string;
  handle?: string;
  isActive: boolean;
  image?: string;
  onlineStore: boolean;
  pointOfSale: boolean;
  facebook: boolean;
  instagram: boolean;
  tikTok: boolean;
  whatsAppBusiness: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishToSearchEngines: boolean;
  productIds?: number[];
}

export interface UpdateCollectionDto {
  title?: string;
  description?: string;
  handle?: string;
  isActive?: boolean;
  image?: string;
  onlineStore?: boolean;
  pointOfSale?: boolean;
  facebook?: boolean;
  instagram?: boolean;
  tikTok?: boolean;
  whatsAppBusiness?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishToSearchEngines?: boolean;
  sortOrder?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Get paginated collections
export async function getCollections(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  isActive?: boolean
): Promise<PagedResult<CollectionListItem>> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  
  if (search) params.append('search', search);
  if (isActive !== undefined) params.append('isActive', isActive.toString());

  const response = await fetch(`${API_URL}/collections?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch collections: ${response.statusText}`);
  }

  return response.json();
}

// Get collection by ID
export async function getCollection(id: number): Promise<Collection> {
  const response = await fetch(`${API_URL}/collections/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch collection: ${response.statusText}`);
  }

  return response.json();
}

// Get collection by handle
export async function getCollectionByHandle(handle: string): Promise<Collection> {
  const response = await fetch(`${API_URL}/collections/by-handle/${handle}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch collection: ${response.statusText}`);
  }

  return response.json();
}

// Create collection
export async function createCollection(data: CreateCollectionDto): Promise<Collection> {
  console.log('=== CREATING COLLECTION ===');
  console.log('Data being sent:', data);
  console.log('URL:', `${API_URL}/collections`);
  console.log('==========================');
  
  const response = await fetch(`${API_URL}/collections`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorDetails;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        errorDetails = await response.json();
        console.error('Error response (JSON):', errorDetails);
      } else {
        errorDetails = await response.text();
        console.error('Error response (Text):', errorDetails);
      }
    } catch (e) {
      errorDetails = `HTTP ${response.status}: ${response.statusText}`;
      console.error('Error parsing response:', e);
    }
    
    throw new Error(`Failed to create collection: ${typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)}`);
  }

  return response.json();
}

// Update collection
export async function updateCollection(id: number, data: UpdateCollectionDto): Promise<Collection> {
  const response = await fetch(`${API_URL}/collections/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorDetails;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        errorDetails = await response.json();
      } else {
        errorDetails = await response.text();
      }
    } catch (e) {
      errorDetails = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(`Failed to update collection: ${typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)}`);
  }

  return response.json();
}

// Delete collection
export async function deleteCollection(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/collections/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete collection: ${response.statusText}`);
  }
}

// Bulk delete collections
export async function bulkDeleteCollections(ids: number[]): Promise<void> {
  const response = await fetch(`${API_URL}/collections/bulk-delete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(ids),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete collections: ${response.statusText}`);
  }
}

// Get collection products
export async function getCollectionProducts(collectionId: number): Promise<CollectionProduct[]> {
  const response = await fetch(`${API_URL}/collections/${collectionId}/products`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch collection products: ${response.statusText}`);
  }

  return response.json();
}

// Add products to collection
export async function addProductsToCollection(collectionId: number, productIds: number[]): Promise<void> {
  const response = await fetch(`${API_URL}/collections/${collectionId}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productIds }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add products to collection: ${response.statusText}`);
  }
}

// Remove products from collection
export async function removeProductsFromCollection(collectionId: number, productIds: number[]): Promise<void> {
  const response = await fetch(`${API_URL}/collections/${collectionId}/products`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productIds }),
  });

  if (!response.ok) {
    throw new Error(`Failed to remove products from collection: ${response.statusText}`);
  }
}

// Update product positions in collection
export async function updateProductPositions(
  collectionId: number,
  positions: { productId: number; position: number }[]
): Promise<void> {
  const response = await fetch(`${API_URL}/collections/${collectionId}/products/positions`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ positions }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update product positions: ${response.statusText}`);
  }
}

// Check if handle exists
export async function checkHandleExists(handle: string, excludeId?: number): Promise<boolean> {
  const params = excludeId ? `?excludeId=${excludeId}` : '';
  const response = await fetch(`${API_URL}/collections/check-handle/${handle}${params}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to check handle: ${response.statusText}`);
  }

  const result = await response.json();
  return result.exists;
}

// Generate handle from title
export function generateHandle(title: string): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}