import axios from 'axios';
import { storageService } from './storage.service';

const getApiBaseUrl = (): string => {
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

// Request interceptor to attach access token
apiClient.interceptors.request.use(
  async (config) => {
    const token = (await storageService.getItem('accessToken')) || (await storageService.getItem('access_token'));
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const refreshResponse = await axios.post(
            `${getApiBaseUrl()}/auth/refresh`,
            {},
            { withCredentials: true },
          );

          const newAccessToken = refreshResponse.data?.tokens?.accessToken || refreshResponse.data?.accessToken;

          if (newAccessToken) {
            await storageService.setItem('accessToken', newAccessToken);
            apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            isRefreshing = false;
            return apiClient(originalRequest);
          } else {
            throw new Error('Refresh failed to return a new access token.');
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          isRefreshing = false;
          await storageService.removeItem('accessToken');
          await storageService.removeItem('access_token');
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
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
