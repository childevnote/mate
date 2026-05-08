import { atom } from "jotai";
import { atomWithStorage, type AsyncStorage, type SyncStorage } from "jotai/utils";
import type { User } from "@mate/types";

/**
 * Creates the auth store atoms with a platform-specific storage implementation.
 *
 * Usage:
 *   // Web
 *   import { createJSONStorage } from 'jotai/utils';
 *   const storage = createJSONStorage(() => localStorage);
 *   const { userAtom, isLoggedInAtom } = createAuthStore(storage);
 *
 *   // Mobile (expo-secure-store adapter)
 *   const storage = createSecureJsonStorage();
 *   const { userAtom, isLoggedInAtom } = createAuthStore(storage);
 */
export function createAuthStore(
  storage: SyncStorage<User | null> | AsyncStorage<User | null>
) {
  const userAtom = atomWithStorage<User | null>(
    "user_storage",
    null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storage as any
  );

  const isLoggedInAtom = atom((get) => get(userAtom) !== null);

  return { userAtom, isLoggedInAtom };
}

export type { User };
