import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { User } from "@/types/auth";

const storage = createJSONStorage<User | null>(() => localStorage);

export const userAtom = atomWithStorage<User | null>(
  "user_storage",
  null,
  storage
);

export const isLoggedInAtom = atom((get) => get(userAtom) !== null);
