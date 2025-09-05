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
export function normalizeMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  try {
    const baseUrl = getBaseUrl();
    const devOrigins = [
      'http://localhost:5266',
      'http://127.0.0.1:5266',
      'http://172.25.64.1:5266',
    ];
    for (const origin of devOrigins) {
      if (url.startsWith(origin)) {
        const rest = url.substring(origin.length);
        return `${baseUrl}${rest.startsWith('/') ? rest : `/${rest}`}`;
      }
    }

    // If API is https but media URL is http, force https using API base
    const apiUrl = getApiUrl();
    if (apiUrl.startsWith('https://') && url.startsWith('http://')) {
      try {
        const u = new URL(url);
        // Replace origin with the API base origin
        return `${baseUrl}${u.pathname}${u.search}${u.hash}`;
      } catch {}
    }

    return url;
  } catch {
    return url;
  }
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';

  // If already a full URL, normalize if it points to a dev origin
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return normalizeMediaUrl(path);
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
