import { createJSONStorage } from "jotai/utils";
import { atom } from "jotai";
import { createAuthStore } from "@mate/store";
import type { User } from "@mate/types";

const storage = createJSONStorage<User | null>(() => localStorage);

export const { userAtom, isLoggedInAtom } = createAuthStore(storage);
