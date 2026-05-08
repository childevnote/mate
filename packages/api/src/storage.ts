/**
 * Platform-agnostic storage adapter.
 * Web:    implement with localStorage
 * Mobile: implement with expo-secure-store
 */
export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

/** Keys used to persist auth tokens */
export const TOKEN_KEYS = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
  USER: "user_storage",
} as const;
