import axios, { AxiosRequestConfig } from 'axios';

const API_URL = '/api/v1';

interface RetryableRequest extends AxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: add CSRF token
api.interceptors.request.use(
  (config) => {
    if (typeof document !== 'undefined') {
      const csrfMatch = document.cookie.match(/csrf_token=([^;]+)/);
      const csrf = csrfMatch?.[1];
      if (csrf && config.headers) {
        config.headers['X-CSRF-Token'] = csrf;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401, refresh token, network errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequest;

    // Handle network errors gracefully (API not ready / connection refused)
    if (!error.response) {
      console.warn('[API] Network error — API may be unavailable:', error.message);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        // Only redirect if not already on login page to prevent loop
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// WebSocket URL helper — auto-detects host from browser URL for LAN access
export function getWebSocketUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost'; // e.g. 192.168.1.28 or localhost
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${host}:4001`;
  }
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://192.168.1.28:4001';
  return wsUrl.replace('http://', 'ws://').replace('https://', 'wss://');
}
