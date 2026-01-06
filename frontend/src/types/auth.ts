export interface User {
  id: number;
  username: string;
  nickname: string;
  university?: string | null;
  email?: string | null;
  is_active?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface CheckUsernameResponse {
  isAvailable: boolean;
  message?: string;
}

export interface RegisterResponse {
  user: User;
  message: string;
}
export interface SignupRequest {
  username: string;
  password: string;
  nickname: string;
  university?: string | null;
  email?: string | null;
}
