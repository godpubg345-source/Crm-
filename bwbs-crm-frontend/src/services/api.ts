import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken, clearAuth } from './authStore';

// ============================================================================
// API ENGINE - BWBS Education CRM
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================================================
// REQUEST INTERCEPTOR - Attach JWT Token
// ============================================================================
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        const branchId = localStorage.getItem('branch_id'); // Global Branch Filter

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (branchId && config.headers) {
            config.headers['X-Branch-ID'] = branchId;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// ============================================================================
// RESPONSE INTERCEPTOR - Handle 401 Unauthorized
// ============================================================================
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
    refreshQueue.forEach((cb) => cb(token));
    refreshQueue = [];
};

const clearAuthAndRedirect = () => {
    clearAuth();
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('branch_id');
    window.location.href = '/login';
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean });

        // Handle 401 Unauthorized - attempt refresh once
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push((token) => {
                        if (!token) {
                            reject(error);
                            return;
                        }
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                const refreshResponse = await axios.post<{ access: string }>(
                    `${API_BASE_URL}/auth/refresh/`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = refreshResponse.data.access;
                setAccessToken(newAccessToken);

                api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                processQueue(newAccessToken);

                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(null);
                clearAuthAndRedirect();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other errors
        if (error.response?.status === 403) {
            console.error('Access forbidden - insufficient permissions');
        }

        if (error.response?.status === 500) {
            console.error('Server error - please try again later');
        }

        return Promise.reject(error);
    }
);

export default api;
export { API_BASE_URL };
