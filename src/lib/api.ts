import axios from 'axios';
import authService from '@/services/auth.service';

// Función para detectar automáticamente el entorno y configurar la URL
const getApiUrl = () => {
  // Si hay variable de entorno configurada, usarla siempre
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // En el servidor (build time) usar localhost
  if (typeof window === 'undefined') {
    return 'http://localhost:5266/api';
  }
  
  // En el cliente: detectar si estamos accediendo desde WSL/Ubuntu
  // Si el hostname contiene una IP (172.x.x.x), estamos en WSL
  const hostname = window.location.hostname;
  if (hostname.startsWith('172.') || hostname.startsWith('192.168.')) {
    // Estamos accediendo desde WSL, usar la misma IP del host
    return `http://${hostname}:5266/api`;
  }
  
  // Por defecto usar localhost (Windows nativo)
  return 'http://localhost:5266/api';
};

// Base URL de la API - se auto-detecta según el entorno
const API_BASE_URL = getApiUrl();

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
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
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
