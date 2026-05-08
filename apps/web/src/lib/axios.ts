import { createAxiosInstance } from "@mate/api";
import type { StorageAdapter } from "@mate/api";

/** Web localStorage adapter */
const webStorage: StorageAdapter = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Shared Axios instance — used by all services in the web app */
export const api = createAxiosInstance(BASE_URL, webStorage);
