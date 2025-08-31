// Configuración de la API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';

// Tipos de secciones del website builder
export enum SectionType {
  ImageWithText = 'image_with_text',
  ImageBanner = 'image_banner',
  RichText = 'rich_text',
  Gallery = 'gallery',
  ContactForm = 'contact_form',
  Newsletter = 'newsletter',
  FeaturedProduct = 'featured_product',
  FeaturedCollection = 'featured_collection',
  Testimonials = 'testimonials',
  FAQ = 'faq',
  Videos = 'videos'
}

// Tipos de páginas
export enum PageType {
  Home = 'home',
  Product = 'product',
  Cart = 'cart',
  Checkout = 'checkout',
  Custom = 'custom'
}

// Colores del design system
export const colors = {
  primary: {
    50: '#f0fdf4',
    500: '#22c55e', // Verde farmacia/empresa
    600: '#16a34a',
    700: '#15803d',
    900: '#14532d'
  },
  secondary: {
    50: '#f8fafc',
    500: '#64748b',
    600: '#475569',
    900: '#0f172a'
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

// Configuración de tipografía
export const typography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  }
};

// Rutas de la aplicación
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Módulos
  EMPRESA: '/empresa',
  ROLES_USUARIOS: '/roles-usuarios',
  CLIENTES: '/clientes',
  RESERVACIONES: '/reservaciones',
  METODOS_PAGO: '/metodos-pago',
  COLECCIONES: '/colecciones',
  PRODUCTOS: '/productos',
  PAGINAS: '/paginas',
  POLITICAS: '/politicas',
  WEBSITE_BUILDER: '/website-builder',
  DOMINIOS: '/dominios'
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Tiempos de cache
export const CACHE_TIMES = {
  PREVIEW: 5 * 60 * 1000,      // 5 minutos
  PRODUCTION: 24 * 60 * 60 * 1000  // 24 horas
};

// Configuración del editor
export const EDITOR_CONFIG = {
  MAX_HISTORY_SIZE: 50,
  AUTOSAVE_INTERVAL: 30000, // 30 segundos
  MAX_NESTING_LEVEL: 3
};