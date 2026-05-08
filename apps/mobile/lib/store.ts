import { createAuthStore } from "@mate/store";
import type { AsyncStorage } from "jotai/utils";
import * as SecureStore from "expo-secure-store";
import type { User } from "@mate/types";

/**
 * JSON storage backed by expo-secure-store for Jotai atoms.
 */
const secureJsonStorage: AsyncStorage<User | null> = {
  getItem: async (key: string) => {
    const raw = await SecureStore.getItemAsync(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: User | null) => {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const { userAtom, isLoggedInAtom } = createAuthStore(secureJsonStorage);
