import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Función para combinar clases de Tailwind de forma segura
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatear fecha en español
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}

// Formatear fecha y hora
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

// Formatear moneda en pesos dominicanos
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(amount);
}

// Generar slug desde texto
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-')     // Reemplazar caracteres especiales
    .replace(/^-+|-+$/g, '');        // Remover guiones al inicio/final
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Truncar texto
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Obtener iniciales de nombre
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Validar RNC dominicano
export function isValidRNC(rnc: string): boolean {
  // RNC debe tener 9 o 11 dígitos
  const cleanRNC = rnc.replace(/[^0-9]/g, '');
  return cleanRNC.length === 9 || cleanRNC.length === 11;
}

// Calcular noches entre dos fechas
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Generar color aleatorio para avatares
export function generateAvatarColor(name: string): string {
  const colors = [
    '#22c55e', '#3b82f6', '#a855f7', '#f59e0b',
    '#ef4444', '#06b6d4', '#8b5cf6', '#10b981'
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// Format number with commas (for metrics)
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// Calculate percentage change (for dashboard metrics)
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Build full asset URL from relative path
export function buildAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Get API URL from environment or default
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
  
  // Extract base URL (remove /api suffix if present)
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}
