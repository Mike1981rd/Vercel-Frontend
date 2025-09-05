import axios from 'axios';
import authService from '@/services/auth.service';

// Base URL de la API - se ajustará en producción
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';

// Crear instancia de axios con configuración base
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Cambiado a false para evitar problemas CORS
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o no válido
      authService.clearAuth();

      // Evitar redirecciones en páginas públicas (sitio público/preview)
      if (typeof window !== 'undefined') {
        try {
          const path = window.location.pathname.toLowerCase();

          // Rutas que SÍ requieren autenticación (solo en panel/admin)
          const protectedPrefixes = [
            '/dashboard',
            '/auth',
            '/editor',
            '/backend-test',
            '/whatsapp',
            '/website', // rutas internas del panel
            '/empresa',
            '/roles-usuarios',
            '/clientes',
            '/reservaciones',
            '/metodos-pago',
            '/colecciones',
            '/productos',
            '/paginas',
            '/politicas',
            '/dominios'
          ];

          const isProtected = protectedPrefixes.some((p) => path.startsWith(p));

          // Solo redirigir a login si estamos en una ruta protegida
          if (isProtected) {
            window.location.href = '/login';
          }
        } catch {
          // Como fallback, NO redirigir para no romper páginas públicas
        }
      }
    }
    return Promise.reject(error);
  }
);

// Funciones de utilidad para las peticiones
export const apiGet = async <T>(url: string): Promise<T> => {
  const response = await api.get<T>(url);
  return response.data;
};

export const apiPost = async <T, D = any>(url: string, data?: D): Promise<T> => {
  const response = await api.post<T>(url, data);
  return response.data;
};

export const apiPut = async <T, D = any>(url: string, data: D): Promise<T> => {
  const response = await api.put<T>(url, data);
  return response.data;
};

export const apiDelete = async <T>(url: string): Promise<T> => {
  const response = await api.delete<T>(url);
  return response.data;
};