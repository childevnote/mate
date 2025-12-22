import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export interface User {
  id: number;
  username: string; // 로그인용 고유 아이디
  nickname: string; // 보여주기용 닉네임
  university?: string; // 대학 (인증 안 했으면 없을 수도 있음 -> Optional '?')
  email?: string; // 필요하다면 남겨둠
}

const storage = createJSONStorage<User | null>(() => localStorage);

export const userAtom = atomWithStorage<User | null>(
  "user_storage",
  null,
  storage
);

export const isLoggedInAtom = atom((get) => get(userAtom) !== null);
