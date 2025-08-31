/**
 * Image Optimization System
 * Similar to Shopify's responsive image handling
 */

interface ImageSize {
  width: number;
  height?: number;
  quality?: number;
}

interface OptimizedImage {
  src: string;
  srcSet: string;
  sizes: string;
  placeholder?: string;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(imageUrl: string, sizes: number[]): string {
  return sizes
    .map(size => `${getOptimizedUrl(imageUrl, { width: size })} ${size}w`)
    .join(', ');
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedUrl(
  imageUrl: string, 
  options: ImageSize
): string {
  // If it's already an optimized URL, return as is
  if (imageUrl.includes('?')) {
    return imageUrl;
  }

  const params = new URLSearchParams();
  
  if (options.width) {
    params.append('width', options.width.toString());
  }
  
  if (options.height) {
    params.append('height', options.height.toString());
  }
  
  // Default to 85% quality for good balance
  params.append('quality', (options.quality || 85).toString());
  
  // Auto format selection (WebP with fallback)
  params.append('format', 'auto');
  
  return `${imageUrl}?${params.toString()}`;
}

/**
 * Generate responsive image props for optimal loading
 */
export function getResponsiveImageProps(
  imageUrl: string,
  alt: string,
  options: {
    maxWidth?: number;
    aspectRatio?: number;
    sizes?: string;
  } = {}
): OptimizedImage {
  const { maxWidth = 800, aspectRatio, sizes } = options;
  
  // Generate different sizes for srcset
  const imageSizes = [
    maxWidth * 0.25,  // 25%
    maxWidth * 0.5,   // 50%
    maxWidth * 0.75,  // 75%
    maxWidth,         // 100%
    maxWidth * 1.5,   // 150% for retina
    maxWidth * 2,     // 200% for 2x retina
  ].map(Math.round);
  
  // Default sizes attribute for responsive behavior
  const defaultSizes = sizes || `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${maxWidth}px`;
  
  return {
    src: getOptimizedUrl(imageUrl, { width: maxWidth }),
    srcSet: generateSrcSet(imageUrl, imageSizes),
    sizes: defaultSizes,
    placeholder: getOptimizedUrl(imageUrl, { width: 20, quality: 10 }) // LQIP
  };
}

/**
 * Calculate optimal logo size based on container and pixel density
 */
export function calculateLogoSize(
  containerHeight: number,
  pixelRatio: number = 1
): number {
  // Logo should be slightly smaller than container height
  const baseSize = containerHeight * 0.8;
  
  // Multiply by pixel ratio for retina displays
  return Math.round(baseSize * pixelRatio);
}

/**
 * Get device pixel ratio for retina support
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
}

/**
 * Preload critical images for better performance
 */
export function preloadImage(imageUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageUrl;
  });
}

/**
 * Convert file to base64 for preview
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Please upload a valid image file (JPEG, PNG, WebP, or SVG)' 
    };
  }
  
  if (file.size > MAX_SIZE) {
    return { 
      valid: false, 
      error: 'Image size must be less than 5MB' 
    };
  }
  
  return { valid: true };
}

/**
 * Generate blur placeholder for image loading
 */
export function generateBlurPlaceholder(color: string = '#f3f4f6'): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E`;
}