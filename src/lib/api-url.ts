/**
 * Helper function to get the correct API URL based on environment
 * This centralizes all API URL logic to avoid hardcoded localhost references
 */

// Get base API URL from environment or fallback
export function getApiUrl(): string {
  // In production, use the environment variable
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.test1hotelwebsite.online/api';
  }
  
  // In development, use localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
}

// Get base URL without /api suffix (for images and uploads)
export function getBaseUrl(): string {
  const apiUrl = getApiUrl();
  return apiUrl.replace('/api', '');
}

// Helper to build full image URL
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Build full URL with base
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Helper for API endpoints
export function getApiEndpoint(endpoint: string): string {
  const apiUrl = getApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${apiUrl}/${cleanEndpoint}`;
}