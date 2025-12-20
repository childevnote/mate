
import { atom } from 'jotai';

interface User {
  id: number;
  nickname: string;
  university: string;
}

export const userAtom = atom<User | null>(null);
export const isLoggedInAtom = atom((get) => get(userAtom) !== null);