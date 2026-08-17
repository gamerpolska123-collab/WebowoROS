import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

// Response interceptor: handle 401, refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// WebSocket URL helper
export function getWebSocketUrl(): string {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4001';
  return wsUrl.replace('http://', 'ws://').replace('https://', 'wss://');
}
