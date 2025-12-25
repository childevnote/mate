export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
}

export interface UserActionResponse {
  message: string;
  error?: string;
}
