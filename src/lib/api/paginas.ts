// Paginas API integration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';

// Types
export interface Pagina {
  id: number;
  companyId: number;
  title: string;
  slug: string;
  content: string | null;
  url: string;
  isVisible: boolean;
  publishStatus: string;
  publishStatusDisplay: string;
  publishedAt: string | null;
  scheduledPublishAt: string | null;
  template: string;
  templateDisplay: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  allowSearchEngines: boolean;
  canonicalUrl: string | null;
  robots: string | null;
  createdAt: string;
  updatedAt: string;
  createdByName: string | null;
  updatedByName: string | null;
  createdByUserId: number | null;
  updatedByUserId: number | null;
  contentLength: number;
  hasSeoData: boolean;
  isScheduledForFuture: boolean;
}

export interface CreatePaginaDto {
  title: string;
  slug: string;
  content?: string | null;
  isVisible: boolean;
  publishStatus: string;
  publishedAt?: string | null;
  scheduledPublishAt?: string | null;
  template: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImage?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  allowSearchEngines: boolean;
  canonicalUrl?: string | null;
  robots?: string | null;
}

export interface UpdatePaginaDto {
  title?: string;
  slug?: string;
  content?: string | null;
  isVisible?: boolean;
  publishStatus?: string;
  publishedAt?: string | null;
  scheduledPublishAt?: string | null;
  template?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImage?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  allowSearchEngines?: boolean;
  canonicalUrl?: string | null;
  robots?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp: string;
}

// API Functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const paginasApi = {
  // Get all páginas with pagination and filters
  async getPaginas(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    publishStatus?: string,
    isVisible?: boolean
  ): Promise<ApiResponse<PagedResult<Pagina>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (search) params.append('search', search);
    if (publishStatus) params.append('publishStatus', publishStatus);
    if (isVisible !== undefined) params.append('isVisible', isVisible.toString());

    const response = await fetch(`${API_URL}/paginas?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Error al obtener las páginas');
    }

    return response.json();
  },

  // Get página by ID
  async getPaginaById(id: number): Promise<ApiResponse<Pagina>> {
    const response = await fetch(`${API_URL}/paginas/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Error al obtener la página');
    }

    return response.json();
  },

  // Get página by slug
  async getPaginaBySlug(slug: string): Promise<ApiResponse<Pagina>> {
    const response = await fetch(`${API_URL}/paginas/slug/${slug}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Error al obtener la página');
    }

    return response.json();
  },

  // Create página
  async createPagina(dto: CreatePaginaDto): Promise<ApiResponse<Pagina>> {
    const response = await fetch(`${API_URL}/paginas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw result;
    }

    return result;
  },

  // Update página
  async updatePagina(id: number, dto: UpdatePaginaDto): Promise<ApiResponse<Pagina>> {
    const response = await fetch(`${API_URL}/paginas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw result;
    }

    return result;
  },

  // Delete página
  async deletePagina(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/paginas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw result;
    }

    return result;
  },

  // Publish página
  async publishPagina(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/paginas/${id}/publish`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw result;
    }

    return result;
  },

  // Unpublish página
  async unpublishPagina(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/paginas/${id}/unpublish`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw result;
    }

    return result;
  },

  // Check if slug exists
  async checkSlugExists(slug: string, excludeId?: number): Promise<ApiResponse<boolean>> {
    const params = new URLSearchParams({ slug });
    if (excludeId) params.append('excludeId', excludeId.toString());

    const response = await fetch(`${API_URL}/paginas/check-slug?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Error al verificar el slug');
    }

    return response.json();
  },

  // Generate slug from title
  async generateSlug(title: string): Promise<ApiResponse<string>> {
    const response = await fetch(`${API_URL}/paginas/generate-slug`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw result;
    }

    return result;
  },
};