export interface User {
  id: number;
  username: string;
  nickname: string;
  university?: string | null;
  email?: string | null;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface CheckUsernameResponse {
  isAvailable: boolean;
  message?: string;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface SignupRequest {
  username: string;
  password: string;
  nickname: string;
  university?: string | null;
  email?: string | null;
}
