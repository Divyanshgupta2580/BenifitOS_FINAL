import axios from 'axios';
import { storageService } from './storage.service';
import { wsService } from './websocket-client';
import { tokenManager } from './token-manager';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).__BENEFITOS_API_URL__) {
    return (window as any).__BENEFITOS_API_URL__;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return 'http://localhost:4000/api/v1';
    }
    return 'https://benefitos-backend-1dq1.onrender.com/api/v1';
  }
  return 'https://benefitos-backend-1dq1.onrender.com/api/v1';
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Flag to prevent infinite refresh retry loops
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const setAuthHeader = (headers: any, token: string) => {
  if (!headers) return;
  if (typeof headers.delete === 'function') {
    headers.delete('authorization');
    headers.delete('Authorization');
  }
  if (typeof headers.set === 'function') {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    headers.Authorization = `Bearer ${token}`;
  }
};

// Request interceptor to attach in-memory access token
apiClient.interceptors.request.use(
  async (config) => {
    config.baseURL = getApiBaseUrl();
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      setAuthHeader(config.headers, token);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle 401 token refresh & unwrapping
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized & auto refresh token via HttpOnly cookie
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        // Fall through to error message formatting below
      } else {
        originalRequest._retry = true;

        const currentToken = tokenManager.getAccessToken();
        const requestToken = (
          typeof originalRequest.headers?.get === 'function'
            ? originalRequest.headers.get('Authorization')
            : originalRequest.headers?.Authorization
        )?.toString().replace(/^Bearer\s+/i, '');

        // If token in memory has already been refreshed since this request was sent, retry immediately with fresh token
        if (currentToken && requestToken && currentToken !== requestToken) {
          setAuthHeader(originalRequest.headers, currentToken);
          return apiClient(originalRequest);
        }

        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              setAuthHeader(originalRequest.headers, token);
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const refreshResponse = await axios.post<{
            success?: boolean;
            data?: {
              tokens?: { accessToken: string };
              accessToken?: string;
            };
            tokens?: { accessToken: string };
            accessToken?: string;
          }>(
            `${getApiBaseUrl()}/auth/refresh`,
            {},
            { withCredentials: true },
          );

          const resData = refreshResponse.data?.data || refreshResponse.data;
          const newAccessToken =
            resData?.tokens?.accessToken ??
            resData?.accessToken ??
            refreshResponse.data?.tokens?.accessToken ??
            refreshResponse.data?.accessToken;

          if (newAccessToken) {
            tokenManager.setAccessToken(newAccessToken);
            setAuthHeader(originalRequest.headers, newAccessToken);

            processQueue(null, newAccessToken);
            isRefreshing = false;

            // Automatically re-authenticate any active WebSocket connection with the new token
            try {
              wsService.reauthenticate(newAccessToken).catch(() => {});
            } catch {}

            return apiClient(originalRequest);
          } else {
            throw new Error('Refresh failed to return a new access token.');
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          isRefreshing = false;
          tokenManager.clearAccessToken();
          await storageService.removeItem('accessToken');
          await storageService.removeItem('access_token');
          try {
            wsService.disconnect();
          } catch {}
          if (typeof window !== 'undefined' && window.location?.pathname && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshErr);
        }
      }
    }

    const errorData = error.response?.data?.error;
    let message = 'An unexpected error occurred.';
    if (errorData) {
      if (Array.isArray(errorData.details) && errorData.details.length > 0) {
        message = errorData.details.join(', ');
      } else if (errorData.message) {
        message = errorData.message;
      }
    } else if (error.response?.data?.message) {
      const respMsg = error.response.data.message;
      message = Array.isArray(respMsg) ? respMsg.join(', ') : respMsg;
    } else if (error.message) {
      message = error.message;
    }
    const enhancedError: any = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.response = error.response;
    enhancedError.code = error.code;
    return Promise.reject(enhancedError);
  },
);
