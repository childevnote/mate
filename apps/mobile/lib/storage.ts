import * as SecureStore from "expo-secure-store";
import type { StorageAdapter } from "@mate/api";

/**
 * expo-secure-store adapter for the shared StorageAdapter interface.
 * Uses iOS Keychain / Android Keystore for secure token storage.
 */
export const mobileStorage: StorageAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
