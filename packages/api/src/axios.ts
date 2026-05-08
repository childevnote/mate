import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import type { StorageAdapter } from "./storage";
import { TOKEN_KEYS } from "./storage";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Creates a pre-configured Axios instance that:
 *  - Injects the JWT access token on every request.
 *  - Automatically refreshes the token on 401 and retries the original request.
 *  - Uses the provided StorageAdapter so it works on both web and mobile.
 */
export function createAxiosInstance(
  baseURL: string,
  storage: StorageAdapter
): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  // Request interceptor — attach access token
  instance.interceptors.request.use(
    async (config) => {
      const token = await storage.getItem(TOKEN_KEYS.ACCESS);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor — handle 401 with token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig;

      if (
        !originalRequest ||
        originalRequest.url?.includes("/login") ||
        originalRequest.url?.includes("/refresh")
      ) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = await storage.getItem(TOKEN_KEYS.REFRESH);
          if (!refreshToken) throw new Error("리프레시 토큰이 없습니다.");

          const { data } = await axios.post(
            `${baseURL}/api/v1/auth/refresh`,
            { refresh_token: refreshToken },
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );

          const newAccessToken: string = data.access_token;
          await storage.setItem(TOKEN_KEYS.ACCESS, newAccessToken);

          if (data.refresh_token) {
            await storage.setItem(TOKEN_KEYS.REFRESH, data.refresh_token);
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          await storage.removeItem(TOKEN_KEYS.ACCESS);
          await storage.removeItem(TOKEN_KEYS.REFRESH);
          await storage.removeItem(TOKEN_KEYS.USER);
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
}
