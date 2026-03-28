import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { useAuthStore } from "@/store/authStore";
import type { AuthPayload } from "@/store/authStore";
import { env } from "@/config/env";
import type { ApiError } from "@/types/api.types";

const API_BASE_URL = env.apiUrl;

// ─── Instancia principal ──────────────────────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: adjunta el Bearer token ────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Control de reintento de refresh ─────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  );
  failedQueue = [];
}

// ─── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 → intenta refresh de token
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // El backend devuelve el mismo AuthPayload que en el login,
        // incluyendo el array de permissions actualizado.
        const { data } = await axios.post<AuthPayload>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        useAuthStore.getState().setAuth(data);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 → sin permisos
    if (error.response?.status === 403) {
      window.location.href = "/403";
    }

    const apiError = error.response?.data as ApiError | undefined;
    const message = apiError?.message ?? "Error inesperado";
    return Promise.reject(new Error(message));
    // return Promise.reject(error);
  }
);

export default api;
