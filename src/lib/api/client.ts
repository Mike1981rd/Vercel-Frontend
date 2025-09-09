import axios from 'axios';
type AxiosInstance = any;
type InternalAxiosRequestConfig = any;
type AxiosResponse = any;
import { toast } from 'react-hot-toast';

// Base URL for API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (auth.service uses 'token' key)
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set Content-Type to application/json by default, unless it's FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.error('401 Error:', error.response.data);
      console.error('Request URL:', error.config.url);
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      // Delay redirect to see error
      // setTimeout(() => {
      //   window.location.href = '/login';
      // }, 3000);
      
      return Promise.reject(error);
    }

    // Handle other errors
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    if (error.response?.status === 500) {
      console.error('500 Error Details:', error.response.data);
      toast.error('Error del servidor. Por favor intenta más tarde.');
    } else if (error.response?.status === 404) {
      toast.error('Recurso no encontrado.');
    } else if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción.');
    } else if (error.response?.status === 400) {
      const message = error.response.data?.message || 'Solicitud inválida.';
      console.error('400 Error Details:', {
        message: error.response.data?.message,
        errors: error.response.data?.errors,
        data: error.response.data
      });
      toast.error(message);
    } else if (!error.response) {
      toast.error('Error de conexión. Verifica tu internet.');
    }

    return Promise.reject(error);
  }
);

// Helper functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Export configured axios instance as default
export default apiClient;