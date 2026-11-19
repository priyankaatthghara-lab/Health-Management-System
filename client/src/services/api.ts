import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types';

export const TOKEN_STORAGE_KEY = 'lifelink_token';

// Create base Axios instance
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      // Avoid infinite redirects if already on auth pages
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Typed API helper functions
export const get = async <T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> => {
  const response = await api.get<ApiResponse<T>>(url, { params });
  return response.data;
};

export const post = async <T, B = unknown>(url: string, data?: B): Promise<ApiResponse<T>> => {
  const response = await api.post<ApiResponse<T>>(url, data);
  return response.data;
};

export const put = async <T, B = unknown>(url: string, data?: B): Promise<ApiResponse<T>> => {
  const response = await api.put<ApiResponse<T>>(url, data);
  return response.data;
};

export const patch = async <T, B = unknown>(url: string, data?: B): Promise<ApiResponse<T>> => {
  const response = await api.patch<ApiResponse<T>>(url, data);
  return response.data;
};

export const del = async <T>(url: string): Promise<ApiResponse<T>> => {
  const response = await api.delete<ApiResponse<T>>(url);
  return response.data;
};

export default api;
